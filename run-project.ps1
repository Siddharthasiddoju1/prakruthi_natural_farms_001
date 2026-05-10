param(
    [string]$Service = "all"
)

$projectPath = "C:\SIDDHARTHA_SIDDOJU\devops\Natural\Natural"

function Start-Service {
    param([string]$name, [string]$command)

    Write-Host "Starting $name..." -ForegroundColor Green
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d $projectPath && $command" -WindowStyle Normal -PassThru
    Start-Sleep -Seconds 2
    return $process
}

Push-Location $projectPath

if ($Service -eq "all" -or $Service -eq "api") {
    Start-Service "API Backend (Port 4000)" "npm --workspace services/api run dev"
}

if ($Service -eq "all" -or $Service -eq "web") {
    Start-Service "Web App (Port 5173)" "npm --workspace apps/web run dev"
}

if ($Service -eq "all" -or $Service -eq "admin") {
    Start-Service "Admin Dashboard (Port 5174)" "npm --workspace apps/admin run dev"
}

Pop-Location

Write-Host ""
Write-Host "All servers started! Access at:" -ForegroundColor Yellow
Write-Host "- Customer App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "- Admin Panel: http://localhost:5174" -ForegroundColor Cyan
Write-Host "- API Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each command window to stop servers" -ForegroundColor Red