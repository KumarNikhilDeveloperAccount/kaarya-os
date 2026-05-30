import requests
import random
import time

def test_email_otp():
    email = f"nikhil_otp_{random.randint(1000, 9999)}@kaarya.os"
    print(f"Testing Email OTP for {email}")
    
    # 1. Request OTP
    print("1. Requesting OTP...")
    res = requests.post("https://kaarya-os-backend.onrender.com/api/auth/otp/request", json={
        "email": email,
        "full_name": "Test User"
    })
    
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    
    if res.status_code != 200:
        return
        
    data = res.json()
    debug_code = data.get("debug_code")
    print(f"Extracted debug code: {debug_code}")
    
    if not debug_code:
        print("No debug code returned in production mode! Cannot proceed.")
        return
        
    time.sleep(2)
    
    # 2. Verify OTP
    print("2. Verifying OTP...")
    res2 = requests.post("https://kaarya-os-backend.onrender.com/api/auth/otp/verify", json={
        "email": email,
        "code": debug_code
    })
    
    print(f"Status: {res2.status_code}")
    print(f"Response: {res2.text}")
    
    if res2.status_code == 200:
        print("OTP Verified Successfully!")
    else:
        print("FAILED!")

if __name__ == "__main__":
    test_email_otp()
