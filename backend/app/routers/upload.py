from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import uuid
import os
from app import deps, models, database
from sqlalchemy.orm import Session

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Uploads a file to the disk so it can be streamed effectively via StaticFiles.
    """
    try:
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        file_id = f"{uuid.uuid4().hex}.{ext}"
        
        file_path = os.path.join(UPLOAD_DIR, file_id)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Point to the StaticFiles mount point
        url = f"/api/uploads/{file_id}"
        return {"url": url, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
