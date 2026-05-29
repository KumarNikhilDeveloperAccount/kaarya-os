import requests
import uuid
import traceback

BASE_URL = "http://127.0.0.1:10000"

def audit_full_flow():
    print("--- STARTING END-TO-END BACKEND AUDIT ---")
    
    # Debug Health
    try:
        h = requests.get(f"{BASE_URL}/api/dashboard/health")
        print(f"Dash Health: {h.json()}")
    except:
        print("Dash Health Check Failed")
    try:
        # 1. Signup Company
        company_email = f"corp_{uuid.uuid4().hex[:6]}@test.com"
        print(f"Signing up Company: {company_email}")
        resp = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": company_email,
            "password": "password123",
            "full_name": "Audit Corp"
        })
        if resp.status_code not in [200, 201]:
            print(f"Signup Failed (Status {resp.status_code}): {resp.text}")
            return
        
        # Login to get token
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", data={
            "username": company_email,
            "password": "password123"
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Switch to Company Persona
        switch_resp = requests.post(f"{BASE_URL}/api/auth/switch-persona?persona=company", headers=headers)
        if switch_resp.status_code != 200:
            print(f"Persona Switch Failed: {switch_resp.text}")
            return
        
        # 2. Check Dashboard (Should be 0)
        dash_url = f"{BASE_URL}/api/dashboard/company"
        print(f"Hitting: {dash_url}")
        dash_resp = requests.get(dash_url, headers=headers)
        if dash_resp.status_code != 200:
            print(f"Dashboard Fetch Failed: {dash_resp.text}")
            return
        
        dash = dash_resp.json()
        print(f"Initial Dash Stats: {dash.get('stats')}")
        assert dash['stats']['active_jobs'] == 0
        
        # 3. Create Job
        job_resp = requests.post(f"{BASE_URL}/api/jobs/", headers=headers, json={
            "title": "Senior Auditor",
            "description": "Must love logs and tracing.",
            "location": "Remote",
            "salary_range": "100k-150k"
        })
        if job_resp.status_code not in [200, 201]:
            print(f"Job Creation Failed: {job_resp.text}")
            return
            
        job_id = job_resp.json()["id"]
        print(f"Job Created ID: {job_id}")
        
        # 4. Check Dash (Should be 1)
        dash = requests.get(f"{BASE_URL}/api/dashboard/company", headers=headers).json()
        print(f"Dash Stats After Job: {dash['stats']}")
        assert dash['stats']['active_jobs'] == 1
        
        # 5. Signup Candidate
        cand_email = f"cand_{uuid.uuid4().hex[:6]}@test.com"
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": cand_email,
            "password": "password123",
            "full_name": "Candidate One"
        })
        cand_login = requests.post(f"{BASE_URL}/api/auth/login", data={
            "username": cand_email,
            "password": "password123"
        })
        cand_token = cand_login.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}
        
        # Apply (Mocking a PDF upload)
        # Switch to Candidate Persona first
        requests.post(f"{BASE_URL}/api/auth/switch-persona?persona=candidate", headers=cand_headers)
        
        dummy_pdf_path = "dummy.pdf"
        with open(dummy_pdf_path, "w") as f: f.write("%PDF-1.4 dummy content")
        
        with open(dummy_pdf_path, "rb") as f:
            apply_resp = requests.post(f"{BASE_URL}/api/jobs/{job_id}/apply", headers=cand_headers, files={"file": ("resume.pdf", f, "application/pdf")})
        
        if apply_resp.status_code not in [200, 201]:
            print(f"Apply failed: {apply_resp.status_code} - {apply_resp.text}")
            return
            
        print(f"Apply response: {apply_resp.status_code}")
        
        # 6. Check Company Dashboard again (Should have 1 applicant)
        dash = requests.get(f"{BASE_URL}/api/dashboard/company", headers=headers).json()
        print(f"Final Dash Candidates: {len(dash['recent_candidates'])}")
        assert len(dash['recent_candidates']) == 1
        print(f"Candidate Match Score: {dash['recent_candidates'][0]['score']}")
        
        print("--- AUDIT SUCCESSFUL: SYSTEM INTEGRITY VERIFIED ---")
    except Exception as e:
        print(f"AUDIT FAILED: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    audit_full_flow()
