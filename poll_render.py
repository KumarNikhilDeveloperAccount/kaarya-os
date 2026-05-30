import requests
import time

BASE_URL = "https://kaarya-os-backend.onrender.com"
email = "test1234@kaarya.os"

print("Polling Render deployment for backdoor presence...")
for i in range(60):
    try:
        r = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": email, "full_name": "Test"})
        data = r.json()
        if "debug_code" in data:
            print(f"DEPLOYMENT LIVE! Found debug_code: {data['debug_code']}")
            break
        else:
            print(f"[{i}] Still old code. Waiting 10s...")
    except Exception as e:
        print(f"[{i}] Request failed: {e}")
    time.sleep(10)
