from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import database, models, deps
from pydantic import BaseModel
from typing import List, Optional
from app.services.ai import parse_oracle_query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class OracleRequest(BaseModel):
    query: str

class OracleResult(BaseModel):
    id: int
    type: str # 'candidate', 'job', 'post'
    title: str
    subtitle: str
    url: str

@router.post("/search", response_model=List[OracleResult])
def oracle_global_search(
    request: OracleRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Natural Language Global Search Engine.
    Routes queries through the NLP engine and executes against the DB.
    """
    # 1. Parse NLP to Structured Intent
    parsed_intent = parse_oracle_query(request.query)
    intent = parsed_intent.get("intent", "general")
    keywords = parsed_intent.get("keywords", [])
    
    results = []
    
    # 2. Execute against DB based on intent
    if intent == "candidates" or intent == "general":
        users = db.query(models.User).filter(models.User.primary_role == "candidate").all()
        for u in users:
            # Simple keyword matching on skills/bio if keywords exist
            match = True
            if keywords:
                text = f"{u.skills} {u.bio} {u.full_name}".lower()
                match = any(kw.lower() in text for kw in keywords)
                
            if match:
                results.append({
                    "id": u.id,
                    "type": "candidate",
                    "title": u.full_name or "Anonymous Candidate",
                    "subtitle": u.skills[:50] + "..." if u.skills else "No skills listed",
                    "url": f"/candidates/{u.id}"
                })
                
    if intent == "jobs" or intent == "general":
        from app.models.job import Job
        jobs = db.query(Job).all()
        for j in jobs:
            match = True
            if keywords:
                text = f"{j.title} {j.description} {j.skills_required}".lower()
                match = any(kw.lower() in text for kw in keywords)
            
            # Optionally filter by salary if intent returned it
            min_sal = parsed_intent.get("min_salary")
            if min_sal and min_sal > 0:
                # We assume average salary in range is roughly > min_sal
                if str(min_sal) not in (j.salary_range or ""):
                    # In a real app we'd parse the salary range string to int
                    pass
                    
            if match:
                results.append({
                    "id": j.id,
                    "type": "job",
                    "title": j.title,
                    "subtitle": j.company,
                    "url": f"/jobs/{j.id}"
                })
                
    # Sort and limit results
    return results[:10]
