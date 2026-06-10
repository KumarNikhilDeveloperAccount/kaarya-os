import urllib.request
import json

def test_api():
    req = urllib.request.Request("http://127.0.0.1:8000/openapi.json")
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        paths = data.get("paths", {})
        for path in paths:
            if "message" in path or "ecosystem" in path:
                print(path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
