import subprocess
import json

envs = {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "AIzaSyBIOlRVzimAdMotWYumnbeL9JjUXp39r3Q",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "kaarya-os.firebaseapp.com",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "kaarya-os",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "kaarya-os.firebasestorage.app",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "54271810565",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "1:54271810565:web:86e246995646197170a44d",
    "NEXT_PUBLIC_API_BASE_URL": "https://kaarya-os-backend.onrender.com"
}

print("Adding Vercel Environment Variables safely...")
for key, value in envs.items():
    print(f"Adding {key}...")
    for env_target in ["production", "preview", "development"]:
        # Run vercel env rm to clear any existing bad ones first
        subprocess.run(["vercel", "env", "rm", key, env_target, "--yes"], capture_output=True, text=True, shell=True)
        # Run vercel env add using stdin
        proc = subprocess.Popen(["vercel", "env", "add", key, env_target], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        stdout, stderr = proc.communicate(input=value)
        if proc.returncode != 0:
            print(f"Error adding {key} to {env_target}: {stderr}")
        else:
            print(f"Successfully added {key} to {env_target}")

print("Deploying to Vercel production...")
proc = subprocess.run(["vercel", "--prod", "--yes"], capture_output=True, text=True, shell=True)
print(proc.stdout)
if proc.stderr:
    print("ERRORS:", proc.stderr)
