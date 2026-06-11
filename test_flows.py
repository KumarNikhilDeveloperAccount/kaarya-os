import requests
import time
import sys

BASE_URL = "https://kaarya-os-backend.onrender.com"

def log(msg):
    print(f"[*] {msg}")

def test_flow():
    # 1. Candidate Flow
    log("=== Testing CANDIDATE Flow ===")
    import uuid
    uid = uuid.uuid4().hex[:6]
    cand_email = f"candidate_{uid}@example.com"
    cand_pass = "password123"
    
    # Register Candidate
    res = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "email": cand_email, "password": cand_pass, "full_name": "Test Candidate", "primary_role": "candidate"
    })
    
    if res.status_code not in [200, 201] and "already registered" not in res.text:
        log(f"Signup Failed! Status: {res.status_code}, Response: {res.text}")
        sys.exit(1)
        
    # Login Candidate
    res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": cand_email, "password": cand_pass
    })
    
    try:
        cand_token = res.json().get("access_token")
    except Exception as e:
        log(f"Login JSON Error! Status: {res.status_code}, Response: {res.text}")
        sys.exit(1)
        
    headers = {"Authorization": f"Bearer {cand_token}"}
    
    # Check Profile
    res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    log(f"Candidate Profile: {res.status_code} - {res.json().get('full_name')}")
    
    # Check Jobs (Opp Orbit)
    res = requests.get(f"{BASE_URL}/api/jobs", headers=headers)
    log(f"Candidate Jobs: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 0} jobs")
    
    # Check Network Feed
    res = requests.get(f"{BASE_URL}/api/ecosystem/feed", headers=headers)
    log(f"Candidate Feed: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 0} posts")
    
    # Check Talent Reels
    res = requests.get(f"{BASE_URL}/api/ecosystem/reels", headers=headers)
    log(f"Candidate Reels: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 0} reels")
    
    # Check Engineering Lab
    res = requests.post(f"{BASE_URL}/api/coding/execute", json={"code": "print('Hello Kaarya Lab')", "language": "python"})
    log(f"Candidate Coding Lab: {res.status_code} - Output: {res.json().get('output', '').strip()}")
    
    # 2. Company Flow
    log("\n=== Testing COMPANY Flow ===")
    comp_email = f"company_{uid}@example.com"
    comp_pass = "password123"
    requests.post(f"{BASE_URL}/api/auth/signup", json={"email": comp_email, "password": comp_pass, "full_name": "Test Company", "primary_role": "company"})
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": comp_email, "password": comp_pass})
    comp_token = res.json().get("access_token")
    comp_headers = {"Authorization": f"Bearer {comp_token}"}
    
    # Switch Persona
    requests.post(f"{BASE_URL}/api/auth/switch-persona?persona=company", headers=comp_headers)
    
    # Check Company Dashboard
    res = requests.get(f"{BASE_URL}/api/dashboard/company", headers=comp_headers)
    log(f"Company Dashboard: {res.status_code} - Stats: {res.json().get('stats')}")
    
    # 3. Trainer Flow
    log("\n=== Testing TRAINER Flow ===")
    trainer_email = f"trainer_{uid}@example.com"
    trainer_pass = "password123"
    requests.post(f"{BASE_URL}/api/auth/signup", json={"email": trainer_email, "password": trainer_pass, "full_name": "Test Trainer", "primary_role": "trainer"})
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": trainer_email, "password": trainer_pass})
    trainer_token = res.json().get("access_token")
    trainer_headers = {"Authorization": f"Bearer {trainer_token}"}
    
    requests.post(f"{BASE_URL}/api/auth/switch-persona?persona=trainer", headers=trainer_headers)
    
    # Check Trainer Dashboard
    res = requests.get(f"{BASE_URL}/api/dashboard/interviewer", headers=trainer_headers)
    log(f"Trainer Dashboard: {res.status_code} - Stats: {res.json().get('stats')}")
    
    # Check Calendar / Requests
    res = requests.get(f"{BASE_URL}/api/ecosystem/interviews", headers=trainer_headers)
    log(f"Trainer Interviews: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 0} interviews")
    
    # 4. College Flow
    log("\n=== Testing COLLEGE Flow ===")
    college_email = f"college_{uid}@example.com"
    college_pass = "password123"
    requests.post(f"{BASE_URL}/api/auth/signup", json={"email": college_email, "password": college_pass, "full_name": "Test College", "primary_role": "college"})
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": college_email, "password": college_pass})
    college_token = res.json().get("access_token")
    college_headers = {"Authorization": f"Bearer {college_token}"}
    
    requests.post(f"{BASE_URL}/api/auth/switch-persona?persona=college", headers=college_headers)
    
    # Check College Dashboard
    res = requests.get(f"{BASE_URL}/api/dashboard/college", headers=college_headers)
    log(f"College Dashboard: {res.status_code} - Stats: {res.json().get('stats')}")
    
    # Check Student Directory
    res = requests.get(f"{BASE_URL}/api/ecosystem/batches", headers=college_headers)
    log(f"College Directory/Batches: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 0} batches")
    
    # Analytics / Placements
    res = requests.get(f"{BASE_URL}/api/dashboard/analytics", headers=college_headers)
    log(f"Analytics Dashboard: {res.status_code} - Stats: {res.json().get('stats')}")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print("Error:", str(e))
