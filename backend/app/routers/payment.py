from fastapi import APIRouter, Depends, HTTPException, Body
from app import deps, database, models
from sqlalchemy.orm import Session
import razorpay
import os
import uuid

router = APIRouter()

# Initialize Razorpay client
key_id = os.environ.get("RAZORPAY_KEY_ID")
key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
client = razorpay.Client(auth=(key_id, key_secret)) if key_id and key_secret else None

@router.post("/create-order")
def create_order(
    amount: int = Body(..., embed=True),
    currency: str = Body("INR", embed=True),
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured on the server")
        
    # amount is in subunits (e.g. paisa for INR)
    data = {
        "amount": amount,
        "currency": currency,
        "receipt": f"receipt_{current_user.id}_{uuid.uuid4().hex[:8]}"
    }
    try:
        order = client.order.create(data=data)
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
def verify_payment(
    razorpay_order_id: str = Body(...),
    razorpay_payment_id: str = Body(...),
    razorpay_signature: str = Body(...),
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")
        
    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # Here we would normally create a Transaction record in DB
        from app.models.payment import Transaction
        tx = Transaction(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            amount=0, # Need to fetch original order amount if needed, or update DB
            currency="INR",
            status="completed",
            type="deposit",
            description=f"Razorpay deposit {razorpay_payment_id}"
        )
        db.add(tx)
        db.commit()
        
        return {"status": "success", "message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Signature verification failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
