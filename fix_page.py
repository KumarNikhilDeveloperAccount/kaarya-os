import re

path = 'c:/kaarya-os/frontend/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific syntax error
content = content.replace("          ) ) : null}", "          ) : null}")
# And the trailing button syntax error might exist if the regex left a fragment
content = re.sub(r"              \{\!phoneOtpSent \? \([\s\S]*?(?=<div className=\"relative my-10)", "", content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx syntax fixed.")
