import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.models.ecosystem import Post, Reel, Connection, Endorsement, Message, Feedback, Batch
from app.models.interview import Interview
from app.models.job import Job
from app.auth import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # 1. Create Companies
    company1 = db.query(models.User).filter_by(email="hr@acmecorp.com").first()
    if not company1:
        company1 = models.User(
            email="hr@acmecorp.com",
            full_name="Acme Corp",
            hashed_password=get_password_hash("password"),
            active_persona="company",
            skills="React,Node.js,Python",
            bio="Building the future of SaaS.",
            profile_picture="https://api.dicebear.com/7.x/shapes/svg?seed=Acme"
        )
        db.add(company1)
    
    # 2. Create Candidates
    candidate1 = db.query(models.User).filter_by(email="alex@example.com").first()
    if not candidate1:
        candidate1 = models.User(
            email="alex@example.com",
            full_name="Alex Chen",
            hashed_password=get_password_hash("password"),
            active_persona="candidate",
            skills="React,TypeScript,Python,Docker",
            bio="Senior Full Stack Engineer looking for impactful roles.",
            profile_picture="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        )
        db.add(candidate1)

    db.commit()

    # 3. Create Jobs
    job1 = db.query(Job).filter_by(title="Senior Frontend Engineer").first()
    if not job1:
        job1 = Job(
            company_id=company1.id,
            title="Senior Frontend Engineer",
            description="We are looking for a Next.js expert.",
            salary_range="$120k - $160k",
            location="Remote"
        )
        db.add(job1)
        db.commit()

    # 4. Create Initial Messages so the user has someone to talk to!
    user = db.query(models.User).filter_by(email="nkashyapnikhilnk@gmail.com").first()
    if not user:
        user = models.User(
            email="nkashyapnikhilnk@gmail.com",
            full_name="Nikhil Kashyap",
            hashed_password=get_password_hash("password"),
            active_persona="candidate"
        )
        db.add(user)
        db.commit()

    if user and company1:
        msg = db.query(Message).filter_by(sender_id=company1.id, receiver_id=user.id).first()
        if not msg:
            msg = Message(
                sender_id=company1.id,
                receiver_id=user.id,
                content="Hi! We saw your profile and would love to chat about a role at Acme Corp."
            )
            db.add(msg)
            db.commit()

    print("Database seeded successfully with companies, candidates, jobs, and messages.")

if __name__ == "__main__":
    seed_db()
