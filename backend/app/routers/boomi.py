from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, deps
from app.config import settings
import requests

router = APIRouter()

@router.post("/sync-data")
def sync_data_to_boomi(data: dict, db: Session = Depends(database.get_db), current_user: dict = Depends(deps.get_current_user)):
    """
    Sync data to Boomi endpoint.
    """
    if not settings.BOOMI_ENDPOINT:
        raise HTTPException(status_code=500, detail="Boomi endpoint not configured")
    
    try:
        headers = {
            "Authorization": f"Bearer {settings.BOOMI_TOKEN}",
            "Content-Type": "application/json"
        }
        response = requests.post(settings.BOOMI_ENDPOINT, json=data, headers=headers)
        response.raise_for_status()
        return {"status": "synced", "response": response.json() if response.content else {"message": "Success"}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Boomi sync failed: {str(e)}")