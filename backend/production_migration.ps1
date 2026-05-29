# Kaarya.OS Production Migration Script
# This script handles the transition from SQLite to PostgreSQL

Write-Host "--- Kaarya.OS Production Migration ---" -ForegroundColor Cyan

# Ensure we are in the backend directory
Set-Location $PSScriptRoot
Write-Host "Working Directory: $(Get-Location)"

# 1. Ensure Docker is running
Write-Host "Checking Docker status..."
docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit
}

# 2. Start PostgreSQL container
# Note: docker-compose.yml is in the parent directory
Write-Host "Starting PostgreSQL container..."
docker-compose -f ../docker-compose.yml up -d db
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start database container." -ForegroundColor Red
    exit
}

# 3. Wait for Postgres to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
for ($i=1; $i -le 30; $i++) {
    docker exec kaarya_db pg_isready -U kaarya_user >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL is ready!" -ForegroundColor Green
        break
    }
    Write-Host "Waiting... ($i/30)"
    Start-Sleep -Seconds 2
}

# 4. Update .env to use Postgres
Write-Host "Updating .env to use PostgreSQL..."
$envFile = ".env"
$content = Get-Content $envFile
$newContent = @()
foreach ($line in $content) {
    if ($line -match "^DATABASE_URL=sqlite") {
        $newContent += "# $line"
    } elseif ($line -match "^# DATABASE_URL=postgresql") {
        $newContent += $line.Replace("# ", "")
    } else {
        $newContent += $line
    }
}
$newContent | Set-Content $envFile

# 5. Run Migrations
Write-Host "Running Alembic migrations..."
python -m alembic upgrade head
if ($LASTEXITCODE -eq 0) {
    Write-Host "Migrations successful!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Migrations failed. Check your Alembic configuration." -ForegroundColor Red
}

Write-Host "--- Migration Process Complete ---" -ForegroundColor Cyan
