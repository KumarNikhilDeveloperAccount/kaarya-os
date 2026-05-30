import urllib.request
import re

try:
    req = urllib.request.Request("https://kaarya-os.vercel.app/signup", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    chunks = re.findall(r'/_next/static/chunks/[^"]+', html)
    
    for chunk in chunks:
        chunk_url = "https://kaarya-os.vercel.app" + chunk
        try:
            js = urllib.request.urlopen(chunk_url).read().decode('utf-8')
            if "AIzaSy" in js:
                print(f"Found AIzaSy in {chunk_url}")
                # Print the context around it
                idx = js.find("AIzaSy")
                print("CONTEXT: ", js[max(0, idx-20):min(len(js), idx+50)])
        except Exception:
            pass
except Exception as e:
    print(f"Error: {e}")
