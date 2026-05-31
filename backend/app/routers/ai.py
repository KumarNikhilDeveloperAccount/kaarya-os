from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app import database, models, schemas, deps
from app.services.ai import evaluate_resume
from typing import Dict, Any

router = APIRouter()

@router.post("/parse-resume", response_model=Dict[str, Any])
def parse_resume_content(
    resume_text: str = Body(..., embed=True),
    job_description: str = Body(..., embed=True),
    current_user: models.User = Depends(deps.get_current_user_optional),
    db: Session = Depends(database.get_db)
):
    """
    Takes raw resume text and a target Job Description.
    Calls Rit AI to strictly structure the resume against the requirements 
    and provide detailed scoring and missing elements.
    """
    if len(resume_text) < 50:
         raise HTTPException(status_code=400, detail="Resume content is too short for AI analysis.")
    if len(job_description) < 20:
         raise HTTPException(status_code=400, detail="Job description is required to provide targeted analysis.")
         
    try:
        # We use the existing evaluate_resume from services/ai.py
        # which utilizes the strict JSON-enforced Gemini 1.5 Pro prompts.
        result = evaluate_resume(resume_text, job_description)
        return result
    except Exception as e:
        print(f"Rit.ai Error: {e}")
        raise HTTPException(status_code=500, detail="Generative Engine failed to parse context securely.")

@router.post("/assess-interview", response_model=Dict[str, Any])
def assess_interview_response(
    job_description: str = Body(..., embed=True),
    candidate_resume: str = Body(..., embed=True),
    history: list = Body([], embed=True),
    current_user: models.User = Depends(deps.get_current_user_optional),
    db: Session = Depends(database.get_db)
):
    """
    Evaluates a candidate's response to an interview question and generates the next question.
    """
    from app.services.ai import conduct_interview_turn
    try:
        result = conduct_interview_turn(job_description, candidate_resume, history)
        return result
    except Exception as e:
        print(f"Rit.ai Interview Error: {e}")
        raise HTTPException(status_code=500, detail="Interview reasoning engine failed.")
