import urllib.request
import json
import re

print('--- LINKEDIN TEST ---')
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/linkedin/start', method='GET')
req.add_header('User-Agent', 'Mozilla/5.0')
resp = urllib.request.urlopen(req)
final_url = resp.geturl()
print(f'Final URL after redirects: {final_url}')

m = re.search(r'token=([^&]+)', final_url)
token = m.group(1) if m else None
print(f'Token retrieved: {token is not None}')

if token:
    me_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    me_resp = urllib.request.urlopen(me_req)
    print(f'/me response: {json.loads(me_resp.read().decode())}')

print('\n--- EMAIL OTP TEST ---')
otp_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/otp/request', data=json.dumps({'email': 'nkashyapnikhilnk@gmail.com'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
otp_resp = urllib.request.urlopen(otp_req)
otp_data = json.loads(otp_resp.read().decode())
print(f'OTP Request Response: {otp_data}')

if 'debug_code' in otp_data:
    code = otp_data['debug_code']
    verify_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/otp/verify', data=json.dumps({'email': 'nkashyapnikhilnk@gmail.com', 'code': code}).encode('utf-8'), headers={'Content-Type': 'application/json'})
    verify_resp = urllib.request.urlopen(verify_req)
    verify_data = json.loads(verify_resp.read().decode())
    print(f'OTP Verify Response Token Retrieved: {"access_token" in verify_data}')
    
    if "access_token" in verify_data:
        me_req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me', headers={'Authorization': f'Bearer {verify_data["access_token"]}'})
        me_resp = urllib.request.urlopen(me_req)
        print(f'/me response: {json.loads(me_resp.read().decode())}')
