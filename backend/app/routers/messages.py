from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from app import deps, database, models
from app.models.ecosystem import Message
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class UserBasic(BaseModel):
    id: int
    full_name: str
    email: str
    primary_role: Optional[str] = None
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender: UserBasic
    receiver: UserBasic
    
    class Config:
        from_attributes = True

@router.post("", response_model=MessageResponse)
def send_message(
    msg: MessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    receiver = db.query(models.User).filter(models.User.id == msg.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
        
    db_msg = Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Send email notification
    if receiver.email:
        try:
            from app.services.email import send_notification_email
            import threading
            import logging
            
            email_body = f"Hello {receiver.full_name or 'User'},<br><br>You have received a new message from {current_user.full_name or 'Someone'} on Kaarya.OS:<br><br><i>\"{msg.content}\"</i><br><br>Log in to reply."
            
            threading.Thread(target=send_notification_email, args=(
                receiver.email,
                f"New Message from {current_user.full_name or 'Someone'}",
                email_body,
                "View Message",
                "https://kaarya-os.vercel.app/messages"
            )).start()
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to send message email: {e}")
            
    return db_msg

@router.get("", response_model=List[MessageResponse])
def get_messages(
    other_user_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if other_user_id:
        messages = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.asc()).all()
        # Mark as read
        unread_msgs = [m for m in messages if m.receiver_id == current_user.id and not m.is_read]
        if unread_msgs:
            for m in unread_msgs:
                m.is_read = True
            db.commit()
    else:
        messages = db.query(Message).filter(
            or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
        ).order_by(Message.created_at.desc()).all()
        
    return messages

@router.patch("/{user_id}/read")
def mark_messages_read(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Mark all messages from user_id to current_user as read"""
    unread_msgs = db.query(Message).filter(
        and_(Message.sender_id == user_id, Message.receiver_id == current_user.id, Message.is_read == False)
    ).all()
    
    for m in unread_msgs:
        m.is_read = True
        
    db.commit()
    return {"message": f"Marked {len(unread_msgs)} messages as read"}
