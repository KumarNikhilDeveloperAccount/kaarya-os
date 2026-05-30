import urllib.request
import re

try:
    req = urllib.request.Request("https://kaarya-os.vercel.app/signup", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    chunks = re.findall(r'/_next/static/chunks/[^"]+', html)
    
    found_key = False
    for chunk in chunks:
        chunk_url = "https://kaarya-os.vercel.app" + chunk
        try:
            js = urllib.request.urlopen(chunk_url).read().decode('utf-8')
            if "AIzaSy" in js:
                found_key = True
                print("Firebase API Key IS present in the Vercel bundle!")
                break
        except Exception:
            pass
    
    if not found_key:
        print("Firebase API Key is MISSING in the Vercel bundle!")
except Exception as e:
    print(f"Error: {e}")
