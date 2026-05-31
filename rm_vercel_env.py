import subprocess

keys = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
]

for key in keys:
    for env in ["production", "preview", "development"]:
        print(f"Removing {key} from {env}...")
        subprocess.run(["vercel", "env", "rm", key, env, "--yes"], capture_output=True, shell=True)

print("Done removing. Now deploying so vercel.json variables take effect...")
subprocess.run(["vercel", "--prod", "--yes"], shell=True)
