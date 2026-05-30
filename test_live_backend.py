import requests
import json
import time

BASE_URL = "https://kaarya-os-backend.onrender.com"

print("1. Testing Health Check")
r = requests.get(f"{BASE_URL}/health")
print(f"Health: {r.status_code} {r.text}")

print("\n2. Testing Email OTP Request")
email = "nkashyapnikhilnk+test2@gmail.com"
r = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": email})
print(f"OTP Request: {r.status_code} {r.text}")

print("\n3. Testing Firebase Fallback Decode (Invalid Token)")
r = requests.post(f"{BASE_URL}/api/auth/firebase-login", json={"idToken": "fake.jwt.token"})
print(f"Firebase Login (Fake): {r.status_code} {r.text}")
