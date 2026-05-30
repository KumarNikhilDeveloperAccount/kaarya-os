import httpx
import time

backend_url = "https://kaarya-os-backend.onrender.com"
email = "test_live_verify_123@kaarya.os"

print(f"Requesting OTP for {email}...")
res1 = httpx.post(f"{backend_url}/api/auth/otp/request", json={"email": email, "full_name": "Test Live"})
print("Response:", res1.status_code, res1.text)

if res1.status_code == 200:
    data = res1.json()
    debug_code = data.get("debug_code")
    print(f"Got debug_code: {debug_code}")
    
    print("Waiting 3 seconds...")
    time.sleep(3)
    
    print(f"Verifying OTP {debug_code}...")
    res2 = httpx.post(f"{backend_url}/api/auth/otp/verify", json={"email": email, "code": debug_code})
    print("Verify Response:", res2.status_code, res2.text)
