import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models.job import Job
from app.models import User
db = SessionLocal()
jobs = db.query(Job).count()
print(f"Total Jobs: {jobs}")
user = db.query(User).filter(User.email=="candidate_test@example.com").first()
print(f"User Skills: {user.skills if user else 'Not found'}")
