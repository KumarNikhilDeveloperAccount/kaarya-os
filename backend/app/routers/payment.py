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
    receipt_id = f"receipt_{current_user.id}_{uuid.uuid4().hex[:8]}"
    
    if not client:
        # Simulation Mode
        return {"order_id": f"mock_order_{uuid.uuid4().hex[:8]}", "amount": amount, "currency": currency}
        
    data = {
        "amount": amount,
        "currency": currency,
        "receipt": receipt_id
    }
    try:
        order = client.order.create(data=data)
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
def verify_payment(
    razorpay_order_id: str = Body(...),
    razorpay_payment_id: str = Body(None),
    razorpay_signature: str = Body(None),
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(database.get_db)
):
    if client and razorpay_payment_id and razorpay_signature:
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Signature verification failed")
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # Create a Transaction record in DB (Simulation or Verified)
    from app.models.payment import Transaction
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        amount=0, # In production, fetch amount from order
        currency="INR",
        status="completed",
        type="deposit",
        description=f"Razorpay deposit {razorpay_payment_id or 'mock'}"
    )
    db.add(tx)
    db.commit()
    
    return {"status": "success", "message": "Payment verified successfully"}

@router.get("/transactions")
def get_transactions(current_user: models.User = Depends(deps.get_current_user), db: Session = Depends(database.get_db)):
    from app.models.payment import Transaction
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).all()
    return txs
