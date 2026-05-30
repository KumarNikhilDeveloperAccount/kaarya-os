import requests
import jwt
from datetime import datetime, timedelta

# Create a valid JWT token signed by Render's secret
# Render is using the hardcoded secret from config.py: "supersecretkey-change-in-production"
secret = "supersecretkey-change-in-production"
email = "this_user_is_fake@test.com"
token = jwt.encode(
    {"sub": email, "exp": datetime.utcnow() + timedelta(minutes=30)},
    secret,
    algorithm="HS256"
)

url = "https://kaarya-os-backend.onrender.com/api/auth/switch-persona?persona=admin"
res = requests.post(url, headers={"Authorization": f"Bearer {token}"})
print(f"Status: {res.status_code}")
print(f"Response: {res.text}")
