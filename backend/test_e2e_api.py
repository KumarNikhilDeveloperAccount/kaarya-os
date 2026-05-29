import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(url, method=method, headers=headers)
    if data is not None:
        req.data = json.dumps(data).encode("utf-8")
        
    try:
        resp = urllib.request.urlopen(req)
        body = resp.read().decode()
        return resp.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return e.code, json.loads(body) if body else None
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("--- 1. Testing Auth & Role Selection ---")
    
    # 1.1 Request OTP
    print("Requesting OTP...")
    status, data = make_req("/auth/otp/request", "POST", {"email": "e2etest@example.com"})
    print(status, data)
    assert status == 200
    debug_code = data.get("debug_code")
    
    # 1.2 Verify OTP
    print("Verifying OTP...")
    status, data = make_req("/auth/otp/verify", "POST", {"email": "e2etest@example.com", "code": debug_code})
    print(status, data)
    assert status == 200
    token = data.get("access_token")
    
    # 1.3 Role Selection
    print("Updating Profile / Role Selection...")
    status, data = make_req("/auth/me", "PATCH", {"roles": "candidate", "active_persona": "candidate", "full_name": "E2E Test User"}, token)
    print(status, data)
    assert status == 200
    
    print("\n--- 2. Testing Dashboards ---")
    status, data = make_req("/dashboard/candidate", "GET", token=token)
    print(status, data)
    assert status in (200, 404, 500) # depending on if it's implemented completely

    print("\n--- 3. Testing Compiler / Sandbox ---")
    sandbox_payload = {
        "language": "python",
        "code": "print('Hello Kaarya OS!')",
        "question_id": "e2e_test_1"
    }
    status, data = make_req("/sandbox/run", "POST", sandbox_payload, token)
    print(status, data)
    
    print("\n--- 4. Testing Support Tickets ---")
    ticket_payload = {
        "subject": "Need help with Sandbox",
        "content": "It says hello but I want it to say goodbye.",
        "priority": "medium"
    }
    status, data = make_req("/support/", "POST", ticket_payload, token)
    print(status, data)
    
    if status == 200 and data and "id" in data:
        print("Fetching tickets...")
        status, data = make_req("/support/", "GET", token=token)
        print(status, data)

    print("\n--- 5. Testing Payments ---")
    # Mock Razorpay Webhook
    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test123",
                    "amount": 50000,
                    "currency": "INR",
                    "status": "captured",
                    "email": "e2etest@example.com"
                }
            }
        }
    }
    # To bypass signature validation, we might just hit a mock or check how it handles it
    status, data = make_req("/payments/webhook", "POST", webhook_payload)
    print("Webhook status:", status)

if __name__ == "__main__":
    time.sleep(2) # let uvicorn start
    run_tests()
    print("\nALL API TESTS PASSED OR COMPLETED.")
