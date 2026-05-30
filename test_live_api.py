import requests

BASE_URL = "https://kaarya-os-backend.onrender.com"

def test_otp_flow():
    email = "TEST.UPPERCASE@KAARYA.OS"
    
    # 1. Request OTP
    print("Requesting OTP...")
    res = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": email})
    print(f"Request Status: {res.status_code}")
    print(f"Request Response: {res.text}")
    
    if res.status_code != 200:
        return
        
    data = res.json()
    code = data.get("debug_code")
    print(f"Got Debug Code: {code}")
    
    if not code:
        return
        
    # 2. Verify OTP
    print("Verifying OTP...")
    res2 = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": email, "code": code})
    print(f"Verify Status: {res2.status_code}")
    print(f"Verify Response: {res2.text}")

if __name__ == "__main__":
    test_otp_flow()
