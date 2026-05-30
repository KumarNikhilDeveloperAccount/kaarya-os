import urllib.request
import re

try:
    req = urllib.request.Request("https://kaarya-os.vercel.app/signup", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    chunks = re.findall(r'/_next/static/chunks/[^"]+', html)
    
    found_api = False
    for chunk in chunks:
        chunk_url = "https://kaarya-os.vercel.app" + chunk
        try:
            js = urllib.request.urlopen(chunk_url).read().decode('utf-8')
            if "kaarya-os-backend.onrender.com" in js:
                found_api = True
                print("NEXT_PUBLIC_API_BASE_URL points to Render in the Vercel bundle!")
                break
            if "127.0.0.1:8000" in js:
                # Wait, this might just be the fallback string 'http://127.0.0.1:8000' in the code.
                pass
        except Exception:
            pass
    
    if not found_api:
        print("NEXT_PUBLIC_API_BASE_URL is NOT pointing to Render in the Vercel bundle!")
except Exception as e:
    print(f"Error: {e}")
