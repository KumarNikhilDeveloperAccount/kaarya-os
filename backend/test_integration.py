import requests
import sys

BASE_URL = "http://localhost:8000"

def run_tests():
    print("--- Kaarya.OS API Integration Tests ---")
    
    # 1. Test Health / Basic Endpoint
    try:
        res = requests.get(f"{BASE_URL}/docs")
        print(f"Backend Server Status: {'OK' if res.status_code == 200 else 'FAIL'} (Code: {res.status_code})")
    except Exception as e:
        print(f"Server not reachable: {e}")
        sys.exit(1)

    # 2. Test Feed (Public / Unauth access check)
    res = requests.get(f"{BASE_URL}/api/ecosystem/feed")
    print(f"Feed Endpoint Status: {'OK' if res.status_code in [200, 401] else 'FAIL'} (Code: {res.status_code})")

    # 3. Create a test user or login
    payload = {
        "email": "testagent@kaarya.os",
        "password": "securepassword",
        "full_name": "Test Agent",
        "primary_role": "candidate"
    }
    
    res = requests.post(f"{BASE_URL}/api/auth/signup", json=payload)
    if res.status_code == 400 and "already registered" in res.text:
        # Try login
        res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": "testagent@kaarya.os", "password": "securepassword"})
    
    if res.status_code in [200, 201]:
        token = res.json().get("access_token")
        print("Auth (Signup/Login): OK")
    else:
        print(f"Auth Failed: {res.text}")
        token = None

    if token:
        headers = {"Authorization": f"Bearer {token}"}
        
        # 4. Test RIT AI (Mocked or real)
        ai_payload = {"message": "Hello RIT", "context": ""}
        res = requests.post(f"{BASE_URL}/api/ai/chat", json=ai_payload, headers=headers)
        print(f"RIT AI Chat: {'OK' if res.status_code == 200 else 'FAIL'} (Code: {res.status_code})")
        if res.status_code == 200:
            print(f"  -> RIT Response preview: {str(res.json())[:60]}...")

        # 5. Test Code Execution
        code_payload = {
            "code": "print('Hello World from E2E Tests')",
            "language": "python"
        }
        res = requests.post(f"{BASE_URL}/api/coding/execute", json=code_payload, headers=headers)
        print(f"Engineering Lab (Execute): {'OK' if res.status_code == 200 else 'FAIL'} (Code: {res.status_code})")
        if res.status_code == 200:
            print(f"  -> Execution Output: {res.json().get('output', '').strip()}")

        # 6. Test Messaging
        # First find another user to message
        res = requests.get(f"{BASE_URL}/api/auth/users/search?q=Kaarya", headers=headers)
        if res.status_code == 200 and res.json():
            target_id = res.json()[0]['id']
            msg_payload = {"receiver_id": target_id, "content": "Integration Test Message"}
            res = requests.post(f"{BASE_URL}/api/ecosystem/messages", json=msg_payload, headers=headers)
            print(f"Messaging (Send): {'OK' if res.status_code == 200 else 'FAIL'} (Code: {res.status_code})")
            
            # Test Read Messages
            res = requests.patch(f"{BASE_URL}/api/ecosystem/messages/{target_id}/read", headers=headers)
            print(f"Messaging (Mark Read): {'OK' if res.status_code == 200 else 'FAIL'} (Code: {res.status_code})")
        else:
            print("Messaging Test Skipped: No other users found to message.")

if __name__ == "__main__":
    run_tests()
