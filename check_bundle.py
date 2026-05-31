import requests
import re

url = "https://kaarya-os.vercel.app"
print(f"Fetching {url}...")
res = requests.get(url)

# Find all JS scripts
scripts = re.findall(r'src="(/_next/static/chunks/[^"]+\.js)"', res.text)
found = False

for script in scripts:
    script_url = url + script
    js_res = requests.get(script_url)
    if "AIzaSyBIOlRVzimAdMotWYumnbeL9JjUXp39r3Q" in js_res.text:
        print(f"[SUCCESS] Found Firebase API Key in {script_url}")
        found = True
        break
    if "kaarya-os-backend.onrender.com" in js_res.text:
        print(f"[SUCCESS] Found Backend URL in {script_url}")

if not found:
    print("[FAIL] Environment variables not found in the frontend bundle yet.")
