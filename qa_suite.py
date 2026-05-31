import requests
import json
import uuid
import time
import base64

BASE_URL = "https://kaarya-os-backend.onrender.com"

def run_qa_suite():
    print("=" * 60)
    print("PHASE 1 - 10: AUTOMATED API DESTRUCTION QA SUITE")
    print("=" * 60)

    test_email = f"qa_test_{uuid.uuid4().hex[:6]}@kaarya.os"
    auth_token = None

    print(f"\n[+] Testing Email OTP Auth Flow for {test_email}")
    res = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": test_email, "full_name": "QA Tester"})
    if res.status_code == 200:
        print("    [SUCCESS] OTP Requested Successfully")
        code = res.json().get("debug_code")
        res2 = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": test_email, "code": code})
        if res2.status_code == 200:
            print("    [SUCCESS] OTP Verified Successfully")
            auth_token = res2.json().get("access_token")
            print("    [SUCCESS] JWT Session Token Generated")
            # Set persona
            requests.post(f"{BASE_URL}/api/auth/set-active-persona", headers={"Authorization": f"Bearer {auth_token}"}, json={"persona": "candidate"})
        else:
            print(f"    [FAIL] OTP Verification Failed: {res2.text}")
    else:
        print(f"    [FAIL] OTP Request Failed: {res.text}")

    if not auth_token:
        print("Aborting further tests due to auth failure.")
        return

    headers = {"Authorization": f"Bearer {auth_token}"}

    print("\n[+] Testing Dashboard / Protected Routes")
    res = requests.get(f"{BASE_URL}/api/dashboard/candidate", headers=headers)
    if res.status_code == 200:
        print("    [SUCCESS] Protected Dashboard Route Authenticated")
    else:
        print(f"    [FAIL] Dashboard Route Failed: {res.text}")

    print("\n[+] Testing Payment Systems")
    res = requests.post(f"{BASE_URL}/api/payments/create-order", headers=headers, json={"item_type": "premium", "custom_amount": 999})
    if res.status_code == 200:
        print("    [SUCCESS] Razorpay Order Created Successfully")
    else:
        print(f"    [FAIL] Payment Creation Failed: {res.text}")

    print("\n[+] Testing Crisp Support / Ticketing")
    res = requests.post(f"{BASE_URL}/api/support/", headers=headers, json={"subject": "QA Test", "content": "Automated ticket"})
    if res.status_code == 201 or res.status_code == 200:
        print("    [SUCCESS] Support Ticket Created in DB")
    else:
        print(f"    [FAIL] Support Ticket Failed: {res.text}")

    print("\n[+] Testing Jobs Discovery")
    res = requests.get(f"{BASE_URL}/api/jobs/", headers=headers)
    if res.status_code == 200:
        print("    [SUCCESS] Job Discovery Query Successful")
    else:
        print(f"    [FAIL] Jobs API Failed: {res.text}")
        
    print("\n" + "=" * 60)
    print("ALL API QA TESTS COMPLETED NATIVELY ON PRODUCTION")
    print("=" * 60)

if __name__ == "__main__":
    run_qa_suite()
