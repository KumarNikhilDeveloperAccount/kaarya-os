from fastapi import APIRouter, Depends, HTTPException, Body, Header
from sqlalchemy.orm import Session
from app import database, auth, models, schemas, deps
from app.services.payment import create_order, process_successful_payment, verify_payment_signature, get_razorpay_client, PRICES
from typing import Optional
from datetime import datetime
import json
from app.config import settings
from razorpay.errors import SignatureVerificationError

router = APIRouter()

@router.post("/create-order")
def initiate_payment(
    item_type: str = Body(...),
    item_id: Optional[int] = Body(None),
    custom_amount: Optional[float] = Body(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Step 1: Create a Razorpay Order.
    Enforces strict Pricing rules. 'custom_amount' is only for 'Hiring' (manual CTC).
    """
    # Authorization: Only Company/College/Candidate paying for specific items
    # (Simplified for now, but in production we'd check persona vs item_type)
    
    receipt = f"rcpt_{current_user.id}_{datetime.now().timestamp()}"
    result = create_order(
        item_type=item_type,
        user_email=current_user.email,
        receipt=receipt,
        custom_amount=custom_amount
    )
    
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result["order"]

@router.post("/verify")
def verify_payment(
    order_id: str = Body(...),
    payment_id: str = Body(...),
    signature: str = Body(...),
    item_type: str = Body(...),
    item_id: Optional[int] = Body(None),
    amount: float = Body(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Step 2: Verify signature and fulfill the order (Strict).
    """
    # 1. Verify Signature
    is_valid = verify_payment_signature(order_id, payment_id, signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature (Security violation)")

    # 2. Process and Update DB
    tx = process_successful_payment(
        db=db,
        user_id=current_user.id,
        order_id=order_id,
        payment_id=payment_id,
        item_type=item_type,
        item_id=item_id,
        amount=amount
    )
    
    return {"status": "success", "transaction_id": tx.id}
    
@router.post("/webhook")
async def razorpay_webhook(
    req: dict = Body(...), 
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(database.get_db)
):
    """
    Handle asynchronous fulfillment via webhooks with signature verification.
    """
    client = get_razorpay_client()
    if not client:
        return {"status": "error", "message": "Razorpay not configured"}
    
    event = req.get("event")
    payload = req.get("payload", {})
    
    # Verify webhook signature
    secret = settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET
    try:
        client.utility.verify_webhook_signature(json.dumps(req), x_razorpay_signature, secret)
    except SignatureVerificationError:
        return {"status": "error", "message": "Invalid signature"}
    
    if event == "payment.captured":
        payment = payload.get("payment", {}).get("entity", {})
        order_id = payment.get("order_id")
        # Process payment capture
        print(f"Webhook received: Payment {payment.get('id')} captured successfully.")
        # Update DB if needed
    
    return {"status": "ok"}
