import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.payment import create_order, verify_payment_signature, PRICES
from app.config import settings

def test_create_order():
    item_type = "interview_senior"
    receipt = "test_receipt_123"
    user_email = "test@example.com"

    result = create_order(
        item_type=item_type,
        user_email=user_email,
        receipt=receipt
    )
    assert "order" in result, f"Order creation failed: {result.get('error')}"

def test_verify_payment_signature():
    order_id = "test_order_id"
    payment_id = "fake_payment_id"
    signature = "fake_signature"

    is_valid = verify_payment_signature(
        order_id=order_id,
        payment_id=payment_id,
        signature=signature
    )
    assert not is_valid, "Fake signature verification did not fail as expected."

def test_price_check():
    item_type = "interview_senior"
    expected_price = PRICES.get(item_type) * 100
    order = create_order(item_type=item_type, user_email="test@example.com", receipt="test_receipt_123")["order"]
    assert order['amount'] == int(expected_price), "Price mismatch in order creation."

if __name__ == "__main__":
    test_create_order()
    test_verify_payment_signature()
    test_price_check()
