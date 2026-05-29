from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from datetime import datetime

def seed_candidates():
    db: Session = SessionLocal()
    
    # 1. Get existing job
    job = db.query(models.Job).filter(models.Job.title == "Senior AI Backend Engineer").first()
    if not job:
        print("Job not found. Run seed_data.py first.")
        return

    # 2. Add candidates
    candidates_data = [
        {
            "email": "arjun.mehta@example.com",
            "full_name": "Arjun Mehta",
            "hashed_password": "hashed_password_placeholder",
            "roles": "candidate",
            "active_persona": "candidate"
        },
        {
            "email": "sara.khan@example.com",
            "full_name": "Sara Khan",
            "hashed_password": "hashed_password_placeholder",
            "roles": "candidate",
            "active_persona": "candidate"
        },
        {
            "email": "vikram.singh@example.com",
            "full_name": "Dr. Vikram Singh",
            "hashed_password": "hashed_password_placeholder",
            "roles": "candidate",
            "active_persona": "candidate"
        }
    ]

    for c_data in candidates_data:
        existing = db.query(models.User).filter(models.User.email == c_data["email"]).first()
        if not existing:
            candidate = models.User(**c_data)
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
            print(f"Candidate Added: {c_data['full_name']}")
            
            # Create an application
            score = 92.0 if "Vikram" in candidate.full_name else 94.0 if "Arjun" in candidate.full_name else 88.0 if "Sara" in candidate.full_name else 42.0
            app = models.Application(
                job_id=job.id,
                candidate_id=candidate.id,
                resume_path=f"uploads/resumes/{candidate.id}.pdf",
                ai_score=score,
                status="vetted" if "Vikram" in candidate.full_name else "tech_round" if score > 50 else "rejected",
                ai_feedback={"summary": "Exceptional depth in microservices."} if "Vikram" in candidate.full_name else {}
            )
            db.add(app)
            print(f"Application Created for {candidate.full_name}")
            
    db.commit()
    db.close()
    print("Done Seeding Candidates.")

if __name__ == "__main__":
    seed_candidates()
