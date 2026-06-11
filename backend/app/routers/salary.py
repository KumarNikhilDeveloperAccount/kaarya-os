from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app import database

router = APIRouter()

class SalaryEntry(BaseModel):
    role_name: str
    amount: int
    location: str

@router.get("", response_model=List[dict])
def get_salaries(db: Session = Depends(database.get_db)):
    # Simple table-less mock for the vault using standard response or dynamic DB model if it exists
    # We will use an in-memory or a dynamically constructed DB query if a Salary model exists.
    # Since we didn't define a SQLAlchemy model for Salary yet, we can return dummy or cache.
    # To be real, we should store it in the Post table as a specific type or create a table.
    # For now, let's use the Post table with post_type="salary" to store it persistently!
    from app.models.ecosystem import Post
    salaries = db.query(Post).filter(Post.post_type == "salary").order_by(Post.created_at.desc()).all()
    
    res = []
    for s in salaries:
        try:
            # We store the role/location/amount in the content string separated by ||
            parts = s.content.split("||")
            if len(parts) >= 3:
                res.append({
                    "role_name": parts[0],
                    "amount": int(parts[1]),
                    "location": parts[2]
                })
        except:
            pass
            
    if not res:
        return [
            {"role_name": "Senior Fullstack Engineer", "amount": 3500000, "location": "Bangalore"},
            {"role_name": "Product Manager", "amount": 4200000, "location": "Remote"},
            {"role_name": "Data Scientist", "amount": 2800000, "location": "Delhi NCR"},
            {"role_name": "DevOps Engineer", "amount": 2200000, "location": "Pune"}
        ]
    return res

@router.post("")
def submit_salary(entry: SalaryEntry, db: Session = Depends(database.get_db)):
    from app.models.ecosystem import Post
    from app.deps import get_current_user_optional
    
    new_entry = Post(
        author_id=1,  # Anonymous/System
        content=f"{entry.role_name}||{entry.amount}||{entry.location}",
        post_type="salary"
    )
    db.add(new_entry)
    db.commit()
    return {"status": "success"}
