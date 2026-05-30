import urllib.request

req = urllib.request.Request("https://kaarya-os.vercel.app/signup", headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
html = urllib.request.urlopen(req).read().decode('utf-8')

if "AIzaSy" in html:
    print("Firebase API Key found directly in HTML!")
else:
    print("Firebase API Key NOT found in HTML.")

if "kaarya-os-backend.onrender.com" in html:
    print("Render URL found in HTML!")
else:
    print("Render URL NOT found in HTML.")

if "127.0.0.1:8000" in html:
    print("LOCALHOST FOUND IN HTML! THIS IS BAD!")
else:
    print("Localhost not found in HTML.")
