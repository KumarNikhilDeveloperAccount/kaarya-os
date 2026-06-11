from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import uuid
from app import deps, models, database
from app.models.file import PersistentFile
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Uploads a file and stores its binary data in the database for persistence.
    """
    try:
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        file_id = f"{uuid.uuid4().hex}.{ext}"
        
        file_data = await file.read()
        
        db_file = PersistentFile(
            id=file_id,
            filename=file.filename,
            content_type=file.content_type,
            file_data=file_data
        )
        db.add(db_file)
        db.commit()
        
        url = f"/api/files/{file_id}"
        return {"url": url, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
