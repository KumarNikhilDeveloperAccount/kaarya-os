from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
import httpx
from sqlalchemy.orm import Session
from app import models, schemas, database, deps
from typing import List
from pydantic import BaseModel

router = APIRouter()

SUPPORT_DESK_WEBHOOK_URL = "http://127.0.0.1:3001/api/ebonding/receive"

import uuid
from app.services import email_service, ai

def generate_reference_number():
    return f"TKT-{uuid.uuid4().hex[:8].upper()}"

def sync_ticket_to_support_desk(ticket_data: dict):
    """ Sends real-time eBonding webhook to the external Support Desk """
    try:
        httpx.post(SUPPORT_DESK_WEBHOOK_URL, json=ticket_data, timeout=5.0)
    except Exception as e:
        print(f"eBonding Webhook Failed: {e}")

class SupportReply(BaseModel):
    reference_number: str
    worknotes: str
    status: str
    user_email: str

@router.post("/internal/reply")
def receive_support_desk_reply(
    reply: SupportReply,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """ Webhook receiver for the external support desk to reply to tickets and notify users """
    ticket = db.query(models.Ticket).filter(models.Ticket.reference_number == reply.reference_number).first()
    if ticket:
        ticket.status = reply.status
        # Add message
        # We use a dummy sender_id (1) for support agent since they are external
        new_msg = models.TicketMessage(
            ticket_id=ticket.id,
            sender_id=1, 
            content=reply.worknotes
        )
        db.add(new_msg)
        db.commit()

    # Send the email to the user
    if reply.status in ["Closed", "Resolved"]:
        background_tasks.add_task(
            email_service.send_ticket_closed_email,
            reply.user_email,
            reply.reference_number,
            reply.worknotes
        )
    else:
        background_tasks.add_task(
            email_service.send_ticket_updated_email,
            reply.user_email,
            reply.reference_number,
            reply.worknotes,
            reply.status
        )
    return {"status": "ok"}


@router.post("/", response_model=schemas.TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: schemas.TicketCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Create a new support ticket. """
    ref_num = generate_reference_number()
    
    # Auto-Triage the ticket using Rit.ai
    triage_result = ai.auto_triage_ticket(ticket_in.subject, ticket_in.content)
    ai_priority = triage_result.get("priority", "Medium")
    ai_category = triage_result.get("category", ticket_in.category or "General")
    ai_sub_category = triage_result.get("sub_category", ticket_in.sub_category or "Other")
    ai_reply = triage_result.get("ai_suggested_reply", "")
    
    new_ticket = models.Ticket(
        user_id=current_user.id,
        subject=ticket_in.subject,
        status="Open",
        priority=ai_priority,
        reference_number=ref_num,
        category=ai_category,
        sub_category=ai_sub_category,
        screenshot_url=ticket_in.screenshot_url
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    # Add initial message
    first_msg = models.TicketMessage(
        ticket_id=new_ticket.id,
        sender_id=current_user.id,
        content=ticket_in.content
    )
    db.add(first_msg)
    
    # Add AI auto-triage reply
    if ai_reply:
        # Use sender_id=0 for Rit.ai System messages
        ai_msg = models.TicketMessage(
            ticket_id=new_ticket.id,
            sender_id=0,
            content=f"Rit.ai Auto-Triage: {ai_reply}"
        )
        db.add(ai_msg)
        
    db.commit()
    db.refresh(new_ticket)
    
    # Dispatch eBonding Webhook
    payload = {
        "id": new_ticket.id,
        "reference_number": ref_num,
        "subject": new_ticket.subject,
        "content": ticket_in.content,
        "priority": ai_priority,
        "category": ai_category,
        "sub_category": ai_sub_category,
        "screenshot_url": ticket_in.screenshot_url,
        "user_email": current_user.email
    }
    background_tasks.add_task(sync_ticket_to_support_desk, payload)
    
    # Send Emails
    background_tasks.add_task(
        email_service.send_ticket_created_email_to_user,
        current_user.email,
        ref_num,
        new_ticket.subject
    )
    background_tasks.add_task(
        email_service.send_ticket_created_email_to_support,
        ref_num,
        new_ticket.subject,
        ticket_in.content,
        ticket_in.category or "General",
        ticket_in.sub_category or "Other"
    )
    
    return new_ticket

@router.get("/", response_model=List[schemas.TicketOut])
def list_tickets(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ List all tickets. Admins see everything, normal users see only their own. """
    if current_user.is_admin:
        return db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).all()
    return db.query(models.Ticket).filter(models.Ticket.user_id == current_user.id).order_by(models.Ticket.created_at.desc()).all()

@router.get("/{ticket_id}", response_model=schemas.TicketOut)
def get_ticket_details(
    ticket_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Get a specific ticket with all messages. """
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
    return ticket

@router.post("/{ticket_id}/messages", response_model=schemas.TicketMessageOut)
def reply_to_ticket(
    ticket_id: int,
    message_in: schemas.TicketMessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Add a reply to a ticket. """
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    new_msg = models.TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        content=message_in.content
    )
    db.add(new_msg)
    
    # Update ticket status if user is admin (Simulating expert agent Rit response)
    if current_user.is_admin:
        ticket.status = "In Progress"
        
    db.commit()
    db.refresh(new_msg)
    return new_msg


