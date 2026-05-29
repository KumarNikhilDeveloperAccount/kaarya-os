$gh = "C:\Program Files\GitHub CLI\gh.exe"

Write-Host "Opening GitHub in your browser for authentication..." -ForegroundColor Cyan
# This will open the browser and block until auth is complete
& $gh auth login --hostname github.com --git-protocol https --web

Write-Host "`nAuthentication successful! Creating repository 'kaarya-os'..." -ForegroundColor Green
# Create public repo and push the current directory
& $gh repo create kaarya-os --public --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n===================================================" -ForegroundColor Cyan
    Write-Host "✅ REPOSITORY CREATED AND CODE PUSHED!" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Cyan
} else {
    Write-Host "`nFailed to create or push repository." -ForegroundColor Red
}
