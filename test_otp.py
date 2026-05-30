import requests
import json
import time

BASE_URL = "https://kaarya-os-backend.onrender.com"

print("1. Requesting OTP...")
email = "test1234@kaarya.os"
r = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": email, "full_name": "Test User"})
print(f"Status: {r.status_code}")
try:
    data = r.json()
    print(f"Data: {data}")
    otp_code = data.get("debug_code")
except Exception as e:
    print(f"JSON Error: {e}, Text: {r.text}")
    otp_code = None

if otp_code:
    print(f"\n2. Verifying OTP: {otp_code}...")
    # wait 1 second
    time.sleep(1)
    v = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": email, "code": otp_code})
    print(f"Verify Status: {v.status_code}")
    try:
        v_data = v.json()
        print(f"Verify Data: {v_data}")
        token = v_data.get("access_token")
    except Exception as e:
        print(f"JSON Error: {e}, Text: {v.text}")
        token = None
        
    if token:
        print("\n3. Testing /me endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        m = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"Me Status: {m.status_code}")
        print(f"Me Data: {m.text}")
