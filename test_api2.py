import urllib.request
import urllib.error

def test_api():
    req = urllib.request.Request("http://127.0.0.1:8000/api/health")
    try:
        response = urllib.request.urlopen(req)
        print("Success:", response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} {e.reason}")
        print("Body:", e.read().decode())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
