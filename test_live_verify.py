import requests
import sys

BASE_URL = "https://kaarya-os-backend.onrender.com"
test_email = "test.live.verify@kaarya.os"

print(f"Requesting OTP for {test_email}...")
res = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": test_email})
if res.status_code != 200:
    print("Request failed:", res.text)
    sys.exit(1)

code = res.json().get("debug_code")
print(f"OTP received: {code}")

print("Verifying OTP...")
# Simulate frontend passing code with extra spaces or whatever
res2 = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": test_email, "code": code})
print(f"Verify response ({res2.status_code}):", res2.text)

print("Verifying OTP with different casing email...")
res3 = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": test_email.upper(), "code": code})
print(f"Verify response uppercase ({res3.status_code}):", res3.text)

