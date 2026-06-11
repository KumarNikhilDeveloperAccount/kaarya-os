from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app import database
from app.models.file import PersistentFile

router = APIRouter()

@router.get("/{file_id}")
def get_file(file_id: str, db: Session = Depends(database.get_db)):
    """
    Retrieve and serve a persistent file from the database.
    """
    db_file = db.query(PersistentFile).filter(PersistentFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    return Response(content=db_file.file_data, media_type=db_file.content_type)
