@echo off
cd /d "C:\SIDDHARTHA_SIDDOJU\devops\Natural\Natural"
echo Starting Prakruthi Natural Farms Project...
echo.

echo [1/3] Starting API Backend (Port 4000)...
start "API Server" cmd /k "cd /d C:\SIDDHARTHA_SIDDOJU\devops\Natural\Natural && npm --workspace services/api run dev"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Web App (Port 5173)...
start "Web App" cmd /k "cd /d C:\SIDDHARTHA_SIDDOJU\devops\Natural\Natural && npm --workspace apps/web run dev"

timeout /t 3 /nobreak > nul

echo [3/3] Starting Admin Dashboard (Port 5174)...
start "Admin Dashboard" cmd /k "cd /d C:\SIDDHARTHA_SIDDOJU\devops\Natural\Natural && npm --workspace apps/admin run dev"

echo.
echo All servers started! Access at:
echo - Customer App: http://localhost:5173
echo - Admin Panel: http://localhost:5174
echo - API Backend: http://localhost:4000
echo.
pause