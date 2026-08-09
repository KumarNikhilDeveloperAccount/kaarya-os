import urllib.request
import json

def test(url, method='GET', data=None):
    try:
        req = urllib.request.Request(url, data=data, method=method, headers={'Content-Type': 'application/json'} if data else {})
        res = urllib.request.urlopen(req)
        print(f"{method} {url} -> {res.status}")
        print(res.read().decode())
    except urllib.error.HTTPError as e:
        print(f"{method} {url} -> {e.code}")
        print(e.read().decode())
    except Exception as e:
        print(f"{method} {url} -> Error: {e}")

test('http://127.0.0.1:8002/api/health')
test('http://127.0.0.1:8002/api/support/internal/reply', method='POST', data=json.dumps({"reference_number": "TKT-1", "worknotes": "test", "status": "In Progress", "user_email": "nkashyapnikhilnk@gmail.com"}).encode())
