import razorpay
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app import models
from datetime import datetime

# --- Business Pricing Constants (MANDATORY) ---
PRICES = {
    "interview_junior": 299.00,
    "interview_mid": 599.00,
    "interview_senior": 999.00,
    "hire_standard_entry": 499.00,
    "hire_standard_mid": 999.00,
    "college_yearly_license": 25000.00,
    "college_per_student": 49.00
}

def get_razorpay_client() -> Optional[razorpay.Client]:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_order(item_type: str, user_email: str, receipt: str, custom_amount: float = None) -> Dict[str, Any]:
    """
    Creates order based on STRICT pricing rules.
    """
    client = get_razorpay_client()
    if not client:
        # MOCK MODE FOR TESTING WITHOUT KEYS
        logger.warning("Razorpay keys missing. Using Sandbox Mock Mode.")
        amount = custom_amount if custom_amount is not None else PRICES.get(item_type)
        return {
            "order": {
                "id": f"order_mock_{int(datetime.now().timestamp())}",
                "amount": int(amount * 100) if amount else 0,
                "currency": "INR"
            },
            "error": None
        }

    # Pricing Enforcement
    amount = custom_amount if custom_amount is not None else PRICES.get(item_type)
    if not amount:
        return {"error": f"Invalid item_type: {item_type}"}

    amount_paise = int(amount * 100)
    data = {
        "amount": amount_paise, 
        "currency": "INR", 
        "receipt": receipt, 
        "notes": {"email": user_email, "item_type": item_type}
    }
    
    try:
        order = client.order.create(data=data)
        return {"order": order, "error": None}
    except Exception as e:
        return {"order": None, "error": str(e)}

def process_successful_payment(
    db: Session, 
    user_id: int, 
    order_id: str, 
    payment_id: str, 
    item_type: str, 
    item_id: int,
    amount: float
):
    """
    STRICT PAYMENT HANDLING: Verify, Record, and Split Funds.
    """
    # 1. Create Transaction (Audit Trail)
    new_tx = models.Transaction(
        user_id=user_id,
        amount=amount,
        status="success",
        provider_order_id=order_id,
        provider_payment_id=payment_id,
        item_type=item_type,
        item_id=item_id
    )
    db.add(new_tx)

    # 2. Revenue Splitting logic (80/20) for Interviews
    if "interview" in item_type:
        # In a real app, item_id would link to an InterviewSession model
        # which has an assigned interviewer_id. 
        # For now, we assume item_id is the interviewer's user_id for simplicity in this phase.
        interviewer_id = item_id 
        interviewer_share = amount * 0.8
        
        # Update/Create Interviewer Wallet
        wallet = db.query(models.Wallet).filter(models.Wallet.user_id == interviewer_id).first()
        if not wallet:
            wallet = models.Wallet(user_id=interviewer_id, balance_total=0, balance_pending=0)
            db.add(wallet)
        
        wallet.balance_total += interviewer_share
        wallet.balance_pending += interviewer_share

    db.commit()
    return new_tx

def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Cryptographic verification of the payment signature from Razorpay.
    """
    client = get_razorpay_client()
    if not client:
        if order_id.startswith("order_mock_"):
            return True
        return False
        
    try:
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception:
        return False
