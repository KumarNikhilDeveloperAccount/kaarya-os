import urllib.request
import urllib.error
import urllib.parse
import json

def test_api():
    # Login
    data = urllib.parse.urlencode({
        "username": "nkashyapnikhilnk@gmail.com",
        "password": "password"
    }).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=data)
    try:
        response = urllib.request.urlopen(req)
        token_data = json.loads(response.read().decode())
        token = token_data["access_token"]
        print("Got token:", token[:10] + "...")
        
        # Get messages
        req2 = urllib.request.Request("http://127.0.0.1:8000/api/ecosystem/messages")
        req2.add_header("Authorization", f"Bearer {token}")
        response2 = urllib.request.urlopen(req2)
        print("Messages Success:", response2.read().decode())
        
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} {e.reason}")
        print("Body:", e.read().decode())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
