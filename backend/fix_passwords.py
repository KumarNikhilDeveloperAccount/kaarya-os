from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, auth

def fix_passwords():
    db: Session = SessionLocal()
    users = db.query(models.User).all()
    hashed_password = auth.get_password_hash("password")
    print("Fixing passwords to correct bcrypt hash for 'password'...")
    for user in users:
        user.hashed_password = hashed_password
    
    # Check if nkashyap@college.edu exists, if not add
    admin_user = db.query(models.User).filter(models.User.email == "nkashyap@college.edu").first()
    if not admin_user:
        new_admin = models.User(
            email="nkashyap@college.edu",
            full_name="Nikhil Kashyap",
            hashed_password=hashed_password,
            roles="admin,interviewer",
            active_persona="admin"
        )
        db.add(new_admin)
        print("Added missing admin user.")

    db.commit()
    db.close()
    print("Done fixing database users.")

if __name__ == "__main__":
    fix_passwords()
