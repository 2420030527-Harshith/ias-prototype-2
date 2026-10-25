Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching CyberLab Suite (SecureTunnel + Sentinel)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start FastAPI Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

# Start Vite React Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"

Write-Host ""
Write-Host "[OK] Both servers successfully launched!" -ForegroundColor Green
Write-Host "  • Frontend UI: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  • Backend Swagger API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host ""
