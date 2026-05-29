from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app import database, deps, models, schemas_job, schemas_interview
from app.services.ai import conduct_interview_turn
from typing import List, Dict, Any

router = APIRouter()

@router.post("/{application_id}/start", response_model=Dict[str, Any])
def start_interview(application_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(deps.get_current_user)):
    """
    Initializes a new AI Interview session for a specific application.
    """
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this application")
    
    # Check if an interview already exists
    existing_interview = db.query(models.Interview).filter(models.Interview.application_id == application_id).first()
    if existing_interview:
        return {"message": "Interview resumed", "interview_id": existing_interview.id, "history": existing_interview.chat_history}

    # Create new interview record
    new_interview = models.Interview(
        application_id=application_id,
        candidate_id=current_user.id,
        job_id=application.job_id,
        status="in_progress",
        chat_history=[]
    )
    
    # Trigger the first question from Rit.ai
    rit_response = conduct_interview_turn(
        job_description=application.job.description,
        candidate_resume=application.resume_path, # In production, read file content
        history=[]
    )
    
    first_question = rit_response.get("next_question", "Welcome to Kaarya.OS. Could you tell me about your most significant technical achievement?")
    new_interview.chat_history = [{"role": "assistant", "content": first_question}]
    
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    return {"message": "Interview started", "interview_id": new_interview.id, "question": first_question}

@router.post("/{interview_id}/respond")
def respond_interview(
    interview_id: int, 
    data: schemas_interview.InterviewResponse, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Handles candidate's response, updates history, and generates the next follow-up question.
    """
    user_input = data.user_input
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    if interview.status == "completed":
        return {"message": "Interview already completed", "is_complete": True}

    # Update history with user response
    history = list(interview.chat_history)
    history.append({"role": "user", "content": user_input})
    
    # Get application for JD/Resume context
    application = interview.application
    
    # Get next turn from Rit.ai
    rit_response = conduct_interview_turn(
        job_description=application.job.description,
        candidate_resume=application.resume_path,
        history=history
    )
    
    next_question = rit_response.get("next_question", "Please elaborate.")
    is_complete = rit_response.get("is_complete", False)
    
    # Update history with Rit's next question
    history.append({"role": "assistant", "content": next_question})
    interview.chat_history = history
    
    if is_complete:
        interview.status = "completed"
        # Final forensic report generation
        interview.forensic_report = rit_response.get("forensic_evaluation", "Evaluation pending.")
        
        # Update application status
        application.status = "interview_completed"
        application.ai_score = rit_response.get("final_score", application.ai_score)
    
    db.commit()
    
    return {
        "question": next_question,
        "is_complete": is_complete,
        "forensic_report": interview.forensic_report if is_complete else None,
        "evaluation": rit_response.get("evaluation_of_last_answer")
    }

