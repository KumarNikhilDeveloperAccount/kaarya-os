import urllib.request
import json

try:
    req = urllib.request.urlopen('http://localhost:8000/api/ecosystem/feed')
    print("Feed status:", req.getcode())
    print("Feed response:", req.read().decode('utf-8')[:200])
except Exception as e:
    print("Feed error:", e)

try:
    req = urllib.request.urlopen('http://localhost:8000/api/ecosystem/reels')
    print("Reels status:", req.getcode())
    print("Reels response:", req.read().decode('utf-8')[:200])
except Exception as e:
    print("Reels error:", e)
