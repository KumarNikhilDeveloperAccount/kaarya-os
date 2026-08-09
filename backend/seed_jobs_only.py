import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal, engine
from app import models

def seed_jobs():
    db = SessionLocal()
    
    company_id = 1
    
    jobs_count = db.query(models.Job).count()
    if jobs_count > 0:
        print("Jobs already seeded!")
        return

    print("Seeding Jobs...")
    jobs = [
        {"title": "Senior AI Engineer", "description": "Build next-gen LLMs using PyTorch.", "location": "Remote", "salary_range": "$150k-$200k", "company_id": company_id},
        {"title": "Frontend Developer", "description": "React, Next.js, and Tailwind mastery required.", "location": "New York", "salary_range": "$100k-$130k", "company_id": company_id},
        {"title": "Product Designer", "description": "Design sleek, futuristic dark-mode UIs.", "location": "London", "salary_range": "£70k-£90k", "company_id": company_id},
        {"title": "Fullstack Ninja", "description": "Django and React expert.", "location": "Remote", "salary_range": "$120k-$140k", "company_id": company_id},
        {"title": "DevOps Specialist", "description": "Kubernetes and AWS.", "location": "Berlin", "salary_range": "€80k-€100k", "company_id": company_id},
        {"title": "Data Scientist", "description": "Analyze large datasets with Python and Pandas.", "location": "Remote", "salary_range": "$130k-$160k", "company_id": company_id},
        {"title": "Backend Lead", "description": "FastAPI, PostgreSQL, Redis.", "location": "San Francisco", "salary_range": "$160k-$190k", "company_id": company_id},
    ]
    for j in jobs:
        db.add(models.Job(**j))
        
    db.commit()
    db.close()
    print("Jobs seeded successfully!")

if __name__ == "__main__":
    seed_jobs()
