import httpx

body_html = "<h1>Test OTP: 123456</h1>"
response = httpx.post(
    "https://kaarya-os.vercel.app/api/send-email",
    json={
        "to": "nkash@kaarya.os",
        "otp": "123456",
        "secret": "kaarya_internal_proxy_secret_2026",
        "html": body_html
    },
    timeout=15.0
)
print(response.status_code)
print(response.text)
