import os
import uuid
import PyPDF2
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app import database, auth, models, schemas_job, deps
from app.services.ai import evaluate_resume

router = APIRouter()

# UPLOAD_DIR for resumes
UPLOAD_DIR = "uploads/resumes"

@router.post("/", response_model=schemas_job.JobOut, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas_job.JobCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(deps.get_current_user)):
    """
    Recruiters / Company persona only.
    """
    if current_user.active_persona != "company" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only companies can post jobs")
    
    new_job = models.Job(**job.dict(), company_id=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/", response_model=List[schemas_job.JobOut])
def list_jobs(db: Session = Depends(database.get_db)):
    """
    Visible to everyone (Candidates, etc.)
    """
    return db.query(models.Job).filter(models.Job.is_active == True).all()

@router.post("/{job_id}/apply", response_model=schemas_job.ApplicationOut)
async def apply_to_job(
    job_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Candidate persona only.
    Uploads a PDF resume, extracts text, and triggers Rit.ai evaluation.
    """
    # 1. Verification
    if current_user.active_persona != "candidate" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only candidates can apply to jobs. Switch your persona.")

    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check for duplicate application
    existing_app = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.candidate_id == current_user.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported currently")

    # 2. Save File
    file_ext = ".pdf"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

    # 3. Extract Text for AI (Graceful Parsing)
    resume_text = ""
    try:
        reader = PyPDF2.PdfReader(file_path)
        for page in reader.pages:
            text = page.extract_text()
            if text: resume_text += text
        
        if not resume_text.strip():
            resume_text = "Empty or unreadable PDF content."
    except Exception as e:
        resume_text = "Parsing failure."
        print(f"Warning: PDF Parsing failure: {str(e)}")

    # 4. Trigger Rit.ai Analysis
    ai_evaluation = evaluate_resume(resume_text, job.description)
    
    # Extract score safely
    score = 0.0
    if isinstance(ai_evaluation, dict) and "score" in ai_evaluation:
        try:
            score = float(ai_evaluation["score"])
        except (ValueError, TypeError):
            score = 0.0

    # 5. Create Application Record
    new_app = models.Application(
        job_id=job_id,
        candidate_id=current_user.id,
        resume_path=file_path,
        ai_score=score,
        ai_feedback=ai_evaluation if isinstance(ai_evaluation, dict) else {"raw_evaluation": ai_evaluation},
        status="pending"
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.patch("/applications/{application_id}/status", response_model=schemas_job.ApplicationOut)
def update_application_status(
    application_id: int,
    status_update: schemas_job.StatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Company persona only. Update application status (shortlisted, rejected, hired).
    """
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Ownership check
    if app.job.company_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    app.status = status_update.status
    db.commit()
    db.refresh(app)
    return app

@router.get("/applications/{application_id}", response_model=schemas_job.ApplicationOut)
def get_application_detail(
    application_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve full forensic report for an application.
    """
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app.candidate_id != current_user.id and app.job.company_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return app
