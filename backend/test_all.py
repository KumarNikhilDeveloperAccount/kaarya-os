import requests
import sys

BASE_URL = "http://localhost:8001"

def test_endpoints():
    errors = []

    def check(name, url, method="GET", json=None):
        try:
            if method == "GET":
                res = requests.get(url)
            else:
                res = requests.post(url, json=json)
            
            if res.status_code >= 400 and res.status_code != 401 and res.status_code != 403: # 401/403 is fine for protected routes
                errors.append(f"{name} failed with {res.status_code}: {res.text[:100]}")
            else:
                print(f"[SUCCESS] {name} passed (Status {res.status_code})")
        except Exception as e:
            errors.append(f"{name} failed to connect: {e}")

    # Public Routes
    check("Root Health", f"{BASE_URL}/")
    check("Auth Login", f"{BASE_URL}/api/auth/token", method="POST", json={"username": "test", "password": "password"})
    check("Jobs List", f"{BASE_URL}/api/jobs/")
    check("Ecosystem Reels", f"{BASE_URL}/api/ecosystem/reels")
    check("Salary Vault", f"{BASE_URL}/api/salary")

    # Protected Routes (will return 401/403 but shouldn't 500)
    check("Messages Inbox", f"{BASE_URL}/api/messages/inbox")
    check("Interviews Start", f"{BASE_URL}/api/interviews/1/start", method="POST", json={})
    check("Opportunity Orbit", f"{BASE_URL}/api/ecosystem/orbit")

    if errors:
        print("\n[ERROR] Errors found:")
        for err in errors:
            print(err)
        sys.exit(1)
    else:
        print("\n[SUCCESS] All critical endpoints returned valid responses (200 OK or 401/403 Auth). No 500 Internal Server Errors.")
        sys.exit(0)

if __name__ == "__main__":
    test_endpoints()
