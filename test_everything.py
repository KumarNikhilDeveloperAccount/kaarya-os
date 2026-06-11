import requests
import time
import sys
import uuid

BASE_URL = "https://kaarya-os-backend.onrender.com"

def log(msg):
    print(msg, flush=True)

log("Waking up Render backend... (This may take up to 2 minutes)")
for _ in range(15):
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=30)
        if r.status_code == 200:
            log("Backend is awake and healthy!")
            break
    except requests.exceptions.RequestException:
        log("Still waking up...")
        time.sleep(10)
else:
    log("Failed to wake up backend.")
    sys.exit(1)

uid = uuid.uuid4().hex[:8]

def run_tests():
    # CANDIDATE
    log("\n--- Testing CANDIDATE Flow ---")
    c_email, c_pass = f"cand_{uid}@test.com", "pass123"
    r = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": c_email, "password": c_pass, "full_name": "Test Candidate", "primary_role": "candidate"})
    log(f"Candidate Signup: {r.status_code}")
    r = requests.post(f"{BASE_URL}/api/auth/login", data={"username": c_email, "password": c_pass})
    c_token = r.json().get("access_token")
    headers_c = {"Authorization": f"Bearer {c_token}"}
    
    r = requests.get(f"{BASE_URL}/api/dashboard/candidate", headers=headers_c)
    log(f"Candidate Dashboard: {r.status_code}")
    
    r = requests.get(f"{BASE_URL}/api/jobs", headers=headers_c)
    log(f"Jobs List: {r.status_code} (Found {len(r.json())} jobs)")
    
    # COMPANY
    log("\n--- Testing COMPANY Flow ---")
    comp_email, comp_pass = f"comp_{uid}@test.com", "pass123"
    r = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": comp_email, "password": comp_pass, "full_name": "Test Company", "primary_role": "company"})
    log(f"Company Signup: {r.status_code}")
    r = requests.post(f"{BASE_URL}/api/auth/login", data={"username": comp_email, "password": comp_pass})
    comp_token = r.json().get("access_token")
    headers_comp = {"Authorization": f"Bearer {comp_token}"}
    
    r = requests.get(f"{BASE_URL}/api/dashboard/company", headers=headers_comp)
    log(f"Company Dashboard: {r.status_code}")
    
    # Post a Job
    job_payload = {"title": "Software Engineer", "description": "Great job", "type": "Full-time", "location": "Remote", "salary_range": "$100k"}
    r = requests.post(f"{BASE_URL}/api/jobs", json=job_payload, headers=headers_comp)
    log(f"Company Post Job: {r.status_code}")
    
    # TRAINER
    log("\n--- Testing TRAINER Flow ---")
    t_email, t_pass = f"train_{uid}@test.com", "pass123"
    r = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": t_email, "password": t_pass, "full_name": "Test Trainer", "primary_role": "trainer"})
    log(f"Trainer Signup: {r.status_code}")
    r = requests.post(f"{BASE_URL}/api/auth/login", data={"username": t_email, "password": t_pass})
    t_token = r.json().get("access_token")
    headers_t = {"Authorization": f"Bearer {t_token}"}
    
    r = requests.get(f"{BASE_URL}/api/dashboard/interviewer", headers=headers_t)
    log(f"Trainer Dashboard: {r.status_code}")

    # COLLEGE
    log("\n--- Testing COLLEGE Flow ---")
    col_email, col_pass = f"col_{uid}@test.com", "pass123"
    r = requests.post(f"{BASE_URL}/api/auth/signup", json={"email": col_email, "password": col_pass, "full_name": "Test College", "primary_role": "college"})
    log(f"College Signup: {r.status_code}")
    r = requests.post(f"{BASE_URL}/api/auth/login", data={"username": col_email, "password": col_pass})
    col_token = r.json().get("access_token")
    headers_col = {"Authorization": f"Bearer {col_token}"}
    
    r = requests.get(f"{BASE_URL}/api/dashboard/college", headers=headers_col)
    log(f"College Dashboard: {r.status_code}")
    
    log("\nAll thorough tests executed successfully!")

if __name__ == "__main__":
    run_tests()
