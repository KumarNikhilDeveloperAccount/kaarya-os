import requests
import sys
import uuid

BASE_URL = "https://kaarya-os-backend.onrender.com"
uid = uuid.uuid4().hex[:6]

print("Testing TRAINER Flow")
trainer_email = f"trainer_{uid}@example.com"
trainer_pass = "password123"
r1 = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": trainer_email, "password": trainer_pass, "full_name": "Test Trainer", "primary_role": "trainer"}, timeout=15)
print(f"Signup: {r1.status_code}")
r2 = requests.post(f"{BASE_URL}/api/auth/login", data={"username": trainer_email, "password": trainer_pass}, timeout=15)
t_token = r2.json().get("access_token")
r3 = requests.get(f"{BASE_URL}/api/dashboard/interviewer", headers={"Authorization": f"Bearer {t_token}"}, timeout=15)
print(f"Dashboard: {r3.status_code}")

print("Testing COLLEGE Flow")
college_email = f"college_{uid}@example.com"
college_pass = "password123"
r4 = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": college_email, "password": college_pass, "full_name": "Test College", "primary_role": "college"}, timeout=15)
print(f"Signup: {r4.status_code}")
r5 = requests.post(f"{BASE_URL}/api/auth/login", data={"username": college_email, "password": college_pass}, timeout=15)
c_token = r5.json().get("access_token")
r6 = requests.get(f"{BASE_URL}/api/dashboard/college", headers={"Authorization": f"Bearer {c_token}"}, timeout=15)
print(f"Dashboard: {r6.status_code}")
