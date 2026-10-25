@echo off
echo ========================================================
echo   Launching CyberLab Suite (SecureTunnel + Sentinel)
echo ========================================================
echo.

start "CyberLab API Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

start "CyberLab React Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo [OK] Both servers launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
