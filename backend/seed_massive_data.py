import json
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, auth

def seed():
    print("Re-creating all database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # 1. Base Users
    print("Seeding Users...")
    users_data = [
        ("kaarya.support@gmail.com", "Kaarya Support", "company"),
        ("nkashyapnikhilnk@gmail.com", "Kumar Nikhil", "candidate"),
        ("recruiter@techcorp.com", "TechCorp Recruitment", "company"),
        ("jane.doe@example.com", "Jane Doe", "candidate"),
        ("college.admin@university.edu", "University Placement", "college"),
        ("expert.trainer@global.com", "Global Trainer", "trainer")
    ]
    
    user_objects = {}
    for email, name, role in users_data:
        u = models.User(
            email=email,
            full_name=name,
            hashed_password=auth.get_password_hash("password123"),
            roles=role,
            active_persona=role,
            resume_data={}
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        user_objects[email] = u
        
    # 2. Jobs
    print("Seeding Jobs...")
    jobs = [
        {"title": "Senior AI Engineer", "description": "Build next-gen LLMs using PyTorch.", "location": "Remote", "salary_range": "$150k-$200k", "company_id": user_objects["kaarya.support@gmail.com"].id},
        {"title": "Frontend Developer", "description": "React, Next.js, and Tailwind mastery required.", "location": "New York", "salary_range": "$100k-$130k", "company_id": user_objects["recruiter@techcorp.com"].id},
        {"title": "Product Designer", "description": "Design sleek, futuristic dark-mode UIs.", "location": "London", "salary_range": "£70k-£90k", "company_id": user_objects["kaarya.support@gmail.com"].id},
    ]
    for j in jobs:
        db.add(models.Job(**j))
        
    # 3. Reels (W3Schools videos for reliability)
    print("Seeding Reels...")
    vids = [
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4"
    ]
    for i, v in enumerate(vids):
        db.add(models.Reel(
            author_id=user_objects["nkashyapnikhilnk@gmail.com"].id if i % 2 == 0 else user_objects["jane.doe@example.com"].id,
            video_url=v,
            caption=f"Check out my new project #{i}!",
            tags="programming, tech, ai"
        ))
        
    # 4. Messages
    print("Seeding Messages...")
    msgs = [
        (user_objects["kaarya.support@gmail.com"].id, user_objects["nkashyapnikhilnk@gmail.com"].id, "Hi Nikhil! We loved your profile. Are you open to a quick chat?"),
        (user_objects["nkashyapnikhilnk@gmail.com"].id, user_objects["kaarya.support@gmail.com"].id, "Absolutely! I'm available tomorrow at 10 AM."),
        (user_objects["recruiter@techcorp.com"].id, user_objects["nkashyapnikhilnk@gmail.com"].id, "Hey Nikhil, check out our new Frontend role!"),
    ]
    for sender, receiver, content in msgs:
        db.add(models.Message(sender_id=sender, receiver_id=receiver, content=content))
        
    db.commit()
    db.close()
    print("Done seeding massive data!")

if __name__ == "__main__":
    seed()
