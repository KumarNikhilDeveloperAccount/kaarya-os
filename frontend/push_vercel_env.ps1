$envVars = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY" = "AIzaSyBIOlRVzimAdMotWYumnbeL9JjUXp39r3Q"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" = "kaarya-os.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID" = "kaarya-os"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "kaarya-os.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "54271810565"
    "NEXT_PUBLIC_FIREBASE_APP_ID" = "1:54271810565:web:86e246995646197170a44d"
}

foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    Write-Host "Adding $key to Vercel..."
    # The syntax 'echo $val | vercel env add $key production' works in bash, but in PS it might have newline issues.
    # To be safe, we use vercel pull and vercel build, but vercel env add is the official way.
    cmd.exe /c "echo $val| vercel env add $key production"
    cmd.exe /c "echo $val| vercel env add $key preview"
    cmd.exe /c "echo $val| vercel env add $key development"
}

Write-Host "Triggering new Vercel production build..."
vercel --prod --yes
