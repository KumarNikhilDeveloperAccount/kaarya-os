from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import logging
from app.database import get_db
from app.services.resume_parser import extract_text_from_pdf, parse_resume_with_ai

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Read the file bytes
        contents = await file.read()
        
        # 1. Extract raw text
        logger.info(f"Extracting text from {file.filename}...")
        raw_text = extract_text_from_pdf(contents)
        
        if len(raw_text) < 20:
            raise HTTPException(status_code=400, detail="Could not extract enough text from the PDF. Is it an image-based PDF?")
            
        # 2. Process with AI
        logger.info(f"Parsing extracted text with Gemini API...")
        structured_data = parse_resume_with_ai(raw_text)
        
        return {
            "status": "success",
            "message": "Resume successfully parsed.",
            "data": structured_data
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Unexpected error processing resume: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the resume.")
