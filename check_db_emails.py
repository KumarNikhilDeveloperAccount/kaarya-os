from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app import models

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_emails():
    db = SessionLocal()
    users = db.query(models.User).all()
    for user in users:
        print(f"ID: {user.id}, Email: '{user.email}', Phone: '{user.phone_number}'")
    db.close()

if __name__ == "__main__":
    check_emails()
