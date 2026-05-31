import asyncio
import httpx
from jose import jwt

# Create a mock token
SECRET_KEY = "supersecret_kaarya_key" # Let's assume this or read it from config.
# Wait, I can just create a user in the database or bypass it.
# Actually, let's just write a script that accesses the database, creates a token, and makes a request.

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.config import settings
from app.database import SessionLocal
from app import models

async def main():
    db = SessionLocal()
    # Ensure there is a user
    user = db.query(models.User).first()
    if not user:
        user = models.User(email="test@example.com", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create a valid token
    token = jwt.encode({"sub": user.email}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    print(f"Using token for user: {user.email}")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "resume_text": "My resume content is very long so it passes the 50 char check " * 5,
            "job_description": "My job description is very long so it passes the 20 char check " * 2
        }
        try:
            resp = await client.post("http://localhost:8000/api/ai/parse-resume", json=data, headers=headers, timeout=10)
            print("Status:", resp.status_code)
            print("Response:", resp.text)
        except Exception as e:
            print("Request failed:", e)

if __name__ == "__main__":
    asyncio.run(main())
