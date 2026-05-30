import requests
import time

base_url = "https://kaarya-os-backend.onrender.com/api/auth"
email = f"test_{int(time.time())}@kaarya.os"

print(f"Requesting OTP for {email}...")
res1 = requests.post(f"{base_url}/otp/request", json={"email": email})
print(f"Request Status: {res1.status_code}")
print(f"Request Response: {res1.text}")

if res1.status_code == 200:
    data = res1.json()
    debug_code = data.get("debug_code")
    if debug_code:
        print(f"Got debug code: {debug_code}")
        print("Verifying OTP...")
        res2 = requests.post(f"{base_url}/otp/verify", json={"email": email, "code": debug_code})
        print(f"Verify Status: {res2.status_code}")
        print(f"Verify Response: {res2.text}")
        
        if res2.status_code == 200:
            token = res2.json().get("access_token")
            print("Successfully got JWT token!")
            
            print("Testing switch-persona with JWT token...")
            res3 = requests.post(f"{base_url}/switch-persona?persona=admin", headers={"Authorization": f"Bearer {token}"})
            print(f"Switch Persona Status: {res3.status_code}")
            print(f"Switch Persona Response: {res3.text}")
        else:
            print("Verify failed.")
    else:
        print("No debug code returned.")
else:
    print("Request failed.")
