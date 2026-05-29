from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, database, deps
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: schemas.TicketCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Create a new support ticket. """
    new_ticket = models.Ticket(
        user_id=current_user.id,
        subject=ticket_in.subject,
        status="Open",
        priority="Medium"
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
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/", response_model=List[schemas.TicketOut])
def list_my_tickets(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ List all tickets for the current user. """
    return db.query(models.Ticket).filter(models.Ticket.user_id == current_user.id).all()

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
