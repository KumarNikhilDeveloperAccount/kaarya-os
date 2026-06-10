from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import shutil
import os
import uuid
from pathlib import Path
from app import deps, models

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Generic file upload endpoint for reels, resumes, and profile pictures.
    Returns the URL to the uploaded file.
    """
    try:
        # Generate a unique filename
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        file_path = UPLOAD_DIR / unique_name
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the public URL
        # For local dev, this will be /uploads/...
        url = f"http://localhost:8000/uploads/{unique_name}"
        return {"url": url, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
