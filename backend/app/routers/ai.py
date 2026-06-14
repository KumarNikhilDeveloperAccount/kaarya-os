from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
from sqlalchemy.orm import Session
from app import database, models, schemas, deps
from app.services.ai import evaluate_resume
from typing import Dict, Any
import io

router = APIRouter()

@router.post("/parse-pdf", response_model=Dict[str, Any])
async def parse_resume_pdf(
    file: UploadFile = File(...),
    job_description: str = "Software Engineer",
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        text = ""
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")
            
        if not text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
             
        result = evaluate_resume(text, job_description)
        return result
    except Exception as e:
        print(f"PDF Parse Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse resume PDF.")

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

@router.post("/chat", response_model=Dict[str, Any])
def rit_ai_chat(
    message: str = Body(..., embed=True),
    context: str = Body("", embed=True),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    from app.services.ai import ask_rit
    try:
        if current_user:
            user_context = f"Candidate Profile -> Name: {current_user.full_name}, Role: {current_user.primary_role}. Ensure your advice is tailored to their specific career state."
            context = f"{user_context}\nAdditional Context: {context}"
            
        response = ask_rit(message, context)
        return {"response": response}
    except Exception as e:
        print(f"Rit Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Rit engine failed to process request.")
