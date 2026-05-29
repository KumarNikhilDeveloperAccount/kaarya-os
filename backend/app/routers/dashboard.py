from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import database, models, deps
from typing import List, Any

router = APIRouter()

@router.get("/health")
def dash_health():
    return {"status": "dashboard ok"}

@router.get("/company")
def get_company_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.active_persona != "company":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get all jobs posted by this company
    jobs = db.query(models.Job).filter(models.Job.company_id == current_user.id).all()
    job_ids = [j.id for j in jobs]
    
    # Get total applications for these jobs
    total_apps = db.query(models.Application).filter(models.Application.job_id.in_(job_ids) if job_ids else False).count()
    
    # Get recent candidates (applications with candidate info)
    recent_apps = db.query(models.Application).filter(
        models.Application.job_id.in_(job_ids) if job_ids else False
    ).order_by(models.Application.created_at.desc()).limit(5).all()
    
    formatted_candidates = []
    for app in recent_apps:
        formatted_candidates.append({
            "name": app.candidate.full_name,
            "role": app.job.title,
            "score": app.ai_score or 0,
            "status": app.status,
            "id": app.id
        })

    return {
        "stats": {
            "active_jobs": len(jobs),
            "new_applicants": total_apps,
            "hiring_speed": "4.2d" # Placeholder for dynamic metric
        },
        "recent_candidates": formatted_candidates
    }

@router.get("/interviewer")
def get_interviewer_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.active_persona != "trainer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # For now, show all applications in 'tech_round' state as upcoming sessions
    sessions = db.query(models.Application).filter(models.Application.status == "tech_round").all()
    
    return {
        "stats": {
            "expert_quality": "4.9/5",
            "completed": 0,
            "active_track": "Fullstack"
        },
        "sessions": [
            {
                "name": s.candidate.full_name,
                "track": s.job.title,
                "time": "Ready",
                "status": "Ready" if s.status == "tech_round" else "Upcoming"
            } for s in sessions
        ]
    }

@router.get("/college")
def get_college_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.active_persona != "college":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    total_students = db.query(models.User).filter(models.User.roles.contains("candidate")).count()
    
    return {
        "stats": {
            "total_students": total_students,
            "placements": "86%",
            "avg_package": "₹12.4L"
        },
        "batches": [
            { "name": "Computer Science 2026", "placed": 84, "total": 120, "avgScore": 82 },
            { "name": "Machine Learning 2026", "placed": 62, "total": 90, "avgScore": 88 }
        ]
    }

@router.get("/candidate")
def get_candidate_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.active_persona != "candidate":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    apps = db.query(models.Application).filter(models.Application.candidate_id == current_user.id).all()
    
    return {
        "stats": {
            "applications": len(apps),
            "interviews": len([a for a in apps if a.status == "tech_round"]),
            "offers": len([a for a in apps if a.status == "hired"])
        },
        "applications": [
            {
                "company": a.job.company.full_name if a.job.company else "Unknown Company",
                "role": a.job.title,
                "status": a.status,
                "applied_on": a.created_at.strftime("%Y-%m-%d")
            } for a in apps
        ]
    }
