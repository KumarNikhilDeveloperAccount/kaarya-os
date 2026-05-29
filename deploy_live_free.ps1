Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🚀 INITIALIZING KAARYA.OS LIVE DEPLOYMENT (FREE TIER)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Frontend - Vercel
Write-Host "`n[1/3] Setting up Frontend Deployment via Vercel (Global CDN, 100% Free)..." -ForegroundColor Yellow
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..."
    npm install -g vercel
}

Write-Host "Vercel requires authentication. A browser window will open shortly." -ForegroundColor Green
Write-Host "Please log in using your GitHub or Google account." -ForegroundColor Green
Start-Sleep -Seconds 3

Set-Location "C:\kaarya-os\frontend"
# We run `vercel login` and wait for the user
vercel login

Write-Host "`nPushing Frontend to Vercel Production..." -ForegroundColor Yellow
vercel --prod --yes

# 2. Backend - Fly.io
Write-Host "`n[2/3] Setting up Backend Deployment via Fly.io (Docker, 100% Free)..." -ForegroundColor Yellow
if (!(Get-Command "flyctl" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Fly.io CLI..."
    iwr https://fly.io/install.ps1 -useb | iex
    $env:Path += ";C:\Users\nkash\.fly\bin"
}

Set-Location "C:\kaarya-os\backend"
Write-Host "Fly.io requires authentication. A browser window will open." -ForegroundColor Green
flyctl auth login

Write-Host "`nLaunching Backend App on Fly.io..." -ForegroundColor Yellow
# We'll create a default fly.toml automatically without prompting
flyctl launch --no-deploy --generate-name --region iad
flyctl deploy

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Your application is now live on permanently free production servers!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
