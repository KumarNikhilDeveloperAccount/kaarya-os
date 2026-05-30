import jwt

def test():
    # just an example of how to extract unverified claims
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJteS1wcm9qZWN0LWlkIn0.signature"
    try:
        unverified_headers = jwt.get_unverified_header(token)
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        print(unverified_claims)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    test()
