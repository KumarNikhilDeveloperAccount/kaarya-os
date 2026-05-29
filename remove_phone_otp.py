import re

path = 'frontend/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove phone state variables
content = re.sub(r"const \[phone, setPhone\].*?\n", "", content)
content = re.sub(r"const \[phoneOtp, setPhoneOtp\].*?\n", "", content)
content = re.sub(r"const \[isPhoneMode, setIsPhoneMode\].*?\n", "", content)
content = re.sub(r"const \[phoneOtpSent, setPhoneOtpSent\].*?\n", "", content)
content = re.sub(r"const \[confirmationResult, setConfirmationResult\].*?\n", "", content)

# 2. Update useAuth destructuring
content = content.replace("const { login, signInWithPhone, verifyEmailLink } = useAuth();", "const { login, verifyEmailLink } = useAuth();")

# 3. Remove handleRequestPhoneOtp and handleVerifyPhoneOtp functions
content = re.sub(r"const handleRequestPhoneOtp = async \(\) => \{.*?(?=const handleLinkedinLogin)/s", "", content, flags=re.DOTALL)

# 4. Remove Phone OTP toggle button
phone_btn_pattern = r"<button[^>]*onClick=\{\(\) => \{ setIsPhoneMode\(true\); setIsOtpMode\(false\); \}\}.*?</button>"
content = re.sub(phone_btn_pattern, "", content, flags=re.DOTALL)

# 5. Fix UI toggle logic
content = content.replace("!isOtpMode && !isPhoneMode", "!isOtpMode")
content = content.replace("setIsOtpMode(false); setIsPhoneMode(false);", "setIsOtpMode(false);")
content = content.replace("isOtpMode && !isPhoneMode", "isOtpMode")
content = content.replace("setIsOtpMode(true); setIsPhoneMode(false);", "setIsOtpMode(true);")

# 6. Remove isPhoneMode form
phone_form_pattern = r": isPhoneMode \? \([\s\S]*?(?=\) : null\})"
content = re.sub(phone_form_pattern, "", content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Phone OTP logic removed successfully.")
