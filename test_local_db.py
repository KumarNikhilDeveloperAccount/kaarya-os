from datetime import datetime, timedelta, timezone
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False

# Simulate request
otp = "924700"
otp_code = get_password_hash(otp)
otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

# Simulate SQLite saving without timezone
otp_expiry_naive = otp_expiry.replace(tzinfo=None)

# Simulate verify
expiry = otp_expiry_naive
if expiry.tzinfo is None:
    expiry = expiry.replace(tzinfo=timezone.utc)

is_expired = expiry < datetime.now(timezone.utc)
is_valid = verify_password(otp, otp_code)

print(f"Expired: {is_expired}")
print(f"Valid Signature: {is_valid}")
