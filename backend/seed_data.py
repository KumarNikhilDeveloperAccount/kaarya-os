from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def seed():
    db: Session = SessionLocal()
    
    # 1. Create a Demo Company User
    demo_company = db.query(models.User).filter(models.User.email == "recruit@google.com").first()
    if not demo_company:
        demo_company = models.User(
            email="recruit@google.com",
            full_name="Google Recruitment",
            hashed_password="hashed_password_placeholder", # Not for login, just for DB entry
            roles="company",
            active_persona="company"
        )
        db.add(demo_company)
        db.commit()
        db.refresh(demo_company)
        print("Demo Company Created.")

    # 2. Add Demo Jobs
    jobs_data = [
        {
            "title": "Senior AI Backend Engineer",
            "description": "We are looking for a Python expert with Experience in FastAPI and Vertex AI to build Rit.ai infrastructure.",
            "location": "Remote / Hyderabad",
            "salary_range": "₹40L - ₹60L",
            "company_id": demo_company.id
        },
        {
            "title": "Fullstack Product Designer",
            "description": "Join our team to build premium, dark-mode first dashboards for Kaarya.OS. Proficiency in Tailwind and Framer Motion required.",
            "location": "Bangalore",
            "salary_range": "₹25L - ₹35L",
            "company_id": demo_company.id
        }
    ]

    for job in jobs_data:
        existing = db.query(models.Job).filter(models.Job.title == job["title"]).first()
        if not existing:
            new_job = models.Job(**job)
            db.add(new_job)
            print(f"Job Added: {job['title']}")
        
    db.commit()
    db.close()
    print("Done Seeding.")

if __name__ == "__main__":
    seed()
