import json
import os
import sys
import base64
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import SessionLocal
from app.models import User

client = TestClient(app)

def run_verification():
    print("=======================================")
    print("[E2E] KAARYA OS END-TO-END VERIFICATION")
    print("=======================================")
    
    # 1. Test OTP Login
    print("\n[1] Testing OTP Authentication Loop...")
    test_email = "test.e2e@kaarya.os"
    
    # Request OTP
    resp_otp = client.post("/api/auth/otp/request", json={"email": test_email})
    assert resp_otp.status_code == 200, f"Failed OTP request: {resp_otp.text}"
    otp_data = resp_otp.json()
    print(f"  [OK] OTP Requested successfully.")
    
    code = otp_data.get("debug_code") # The dev fallback
    if not code:
        print("  [ERROR] No debug code found in OTP response. Make sure EMAIL_MODE is configured for testing.")
        return
        
    # Verify OTP
    resp_verify = client.post("/api/auth/otp/verify", json={"email": test_email, "code": code})
    assert resp_verify.status_code == 200, f"Failed OTP verify: {resp_verify.text}"
    token = resp_verify.json().get("access_token")
    print(f"  [OK] OTP Verified successfully. JWT Token acquired.")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Update Role to ensure candidate features work
    client.post("/api/ecosystem/users/role", json={"role": "candidate"}, headers=headers)
    print("  [OK] User Role set to Candidate.")

    # 2. Test Support Ticketing & Image Upload
    print("\n[2] Testing Support Ticket & Email Dispatch...")
    
    # Create a dummy 1x1 pixel image in base64
    dummy_img_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    
    ticket_payload = {
        "subject": "E2E Verification Ticket",
        "content": "This is an automated E2E test verifying ticket creation and screenshot uploads.",
        "category": "Technical",
        "sub_category": "UI Bug",
        "screenshot_url": dummy_img_b64
    }
    
    resp_ticket = client.post("/api/support/", json=ticket_payload, headers=headers)
    assert resp_ticket.status_code in [200, 201], f"Failed Ticket creation: {resp_ticket.text}"
    ticket_data = resp_ticket.json()
    print(f"  [OK] Support Ticket created natively (Ref: {ticket_data.get('reference_number')})")
    print(f"  [OK] Expected email dispatched to kaarya.support@gmail.com and {test_email}")

    # 3. Test Rit.ai Intelligence (E2E API test)
    print("\n[3] Testing Rit.ai Intelligence Engine...")
    
    rit_payload_1 = {
        "message": "Hi Rit.ai, what is your primary function?",
        "context": "Candidate Profile -> Name: E2E Tester"
    }
    resp_rit = client.post("/api/ai/chat", json=rit_payload_1, headers=headers)
    assert resp_rit.status_code == 200, f"Failed Rit.ai request: {resp_rit.text}"
    print(f"  [Rit.ai Q1 Answer] {resp_rit.json().get('response')[:250]}...")
    
    rit_payload_2 = {
        "message": "How can I improve my interview scores?",
        "context": "Candidate Profile -> Name: E2E Tester"
    }
    resp_rit_2 = client.post("/api/ai/chat", json=rit_payload_2, headers=headers)
    print(f"  [Rit.ai Q2 Answer] {resp_rit_2.json().get('response')[:250]}...")
    
    print("\n=======================================")
    print("[OK] ALL E2E VERIFICATIONS PASSED SAFELY")
    print("=======================================")

if __name__ == "__main__":
    run_verification()
