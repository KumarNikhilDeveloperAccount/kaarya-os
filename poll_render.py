import requests
import time
import base64
import json

BASE_URL = "https://kaarya-os-backend.onrender.com"
email = "TEST.UPPERCASE.POLL@KAARYA.OS"

print("Polling Render deployment for backend update...")
for i in range(30):
    try:
        r = requests.post(f"{BASE_URL}/api/auth/otp/request", json={"email": email, "full_name": "Test"})
        data = r.json()
        if "debug_code" in data:
            code = data["debug_code"]
            # Verify to get token
            r2 = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"email": email, "code": code})
            t_data = r2.json()
            if "access_token" in t_data:
                token = t_data["access_token"]
                payload = token.split(".")[1]
                # Pad for base64 decode
                payload += "=" * ((4 - len(payload) % 4) % 4)
                decoded = json.loads(base64.b64decode(payload).decode('utf-8'))
                
                sub = decoded.get("sub", "")
                if sub == "test.uppercase.poll@kaarya.os":
                    print(f"DEPLOYMENT LIVE! Token sub is fully lowercase: {sub}")
                    break
                else:
                    print(f"[{i}] Still old code. Token sub is: {sub}. Waiting 10s...")
            else:
                print(f"[{i}] Verify failed. Waiting 10s...")
        else:
            print(f"[{i}] Still old code or request failed. Waiting 10s...")
    except Exception as e:
        print(f"[{i}] Request failed: {e}")
    time.sleep(10)
