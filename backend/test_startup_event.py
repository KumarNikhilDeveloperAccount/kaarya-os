from app.main import startup_db_migration
from app.database import SessionLocal
from app.models import User
import uuid

def test():
    db = SessionLocal()
    # Insert an uppercase user
    email = f"TEST.UPPERCASE.{uuid.uuid4().hex[:6]}@KAARYA.OS"
    new_user = User(
        email=email,
        hashed_password="dummy",
        is_active=True,
        is_admin=False,
        roles="Candidate",
        active_persona="Candidate"
    )
    db.add(new_user)
    db.commit()
    print(f"Inserted: {email}")
    db.close()
    
    # Run migration
    startup_db_migration()
    
    db = SessionLocal()
    u = db.query(User).filter(User.email == email.lower()).first()
    if u:
        print(f"Migration successful! Found lowercase email: {u.email}")
    else:
        print("Migration FAILED! Lowercase email not found!")
    db.close()

if __name__ == "__main__":
    test()
