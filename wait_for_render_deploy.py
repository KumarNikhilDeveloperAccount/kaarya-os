import requests
import time
import sys

URL = "https://kaarya-os-backend.onrender.com/api/force-wipe-db"

print(f"Waiting for Render to deploy new code with endpoint: {URL}")
for _ in range(30):
    try:
        r = requests.get(URL, timeout=10)
        if r.status_code == 200 and "Database wiped and recreated" in r.text:
            print("Successfully wiped and recreated database!")
            sys.exit(0)
        else:
            print(f"Still waiting... Status: {r.status_code}, Response: {r.text[:50]}")
    except Exception as e:
        print(f"Connection error: {e}")
    time.sleep(10)

print("Timeout waiting for Render deployment.")
sys.exit(1)
