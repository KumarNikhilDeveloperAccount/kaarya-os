import bcrypt

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
    try:
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception as e:
        print("Bcrypt Error:", e)
        return False

otp = "123456"
hash_str = get_password_hash(otp)
print("Hash:", hash_str)
print("Verify True:", verify_password(otp, hash_str))
print("Verify False:", verify_password("123455", hash_str))
