import jwt
from jwt import PyJWKClient

url = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
client = PyJWKClient(url)
keys = client.get_jwk_set()
print(f"Loaded {len(keys.keys)} keys!")
