import requests
import time

urls = [
    "http://localhost:3000/",
    "http://localhost:3000/login",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/feed",
    "http://localhost:3000/reels",
    "http://localhost:3000/resume",
    "http://localhost:3000/interview",
    "http://localhost:3000/settings"
]

print("Testing Frontend Routes...")
time.sleep(2) # Give Next.js time to compile
for url in urls:
    try:
        response = requests.get(url)
        print(f"[{response.status_code}] {url}")
    except Exception as e:
        print(f"[ERROR] {url}: {e}")
