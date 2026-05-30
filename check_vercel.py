import urllib.request
try:
    url = "https://kaarya-os.vercel.app/_next/static/chunks/app/signup/page.js"
    # Actually, Next.js chunk names change. Let's just fetch the HTML and find the JS chunks.
    req = urllib.request.Request("https://kaarya-os.vercel.app/signup", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    import re
    chunks = re.findall(r'/_next/static/chunks/[^"]+', html)
    found = False
    for chunk in chunks:
        chunk_url = "https://kaarya-os.vercel.app" + chunk
        try:
            js = urllib.request.urlopen(chunk_url).read().decode('utf-8')
            if "E.164" in js or "+91" in js:
                found = True
                print("NEW CODE IS DEPLOYED ON VERCEL!")
                break
        except Exception as e:
            pass
    if not found:
        print("OLD CODE ON VERCEL!")
except Exception as e:
    print(f"Error: {e}")
