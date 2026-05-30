import jwt
from jwt import PyJWKClient
import json

x509_url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
jwk_url = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"

try:
    print("Testing X509 URL...")
    client1 = PyJWKClient(x509_url)
    keys1 = client1.get_jwk_set()
    print("X509 Success!")
except Exception as e:
    print(f"X509 Failed: {e}")

try:
    print("\nTesting JWK URL...")
    client2 = PyJWKClient(jwk_url)
    keys2 = client2.get_jwk_set()
    print("JWK Success!")
except Exception as e:
    print(f"JWK Failed: {e}")
