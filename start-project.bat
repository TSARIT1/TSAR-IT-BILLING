@echo off
title TSAR-IT-BILLING Launcher
echo ========================================================
echo        Starting TSAR IT - Billing System
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Spring Boot Backend (Port 8081)...
start "TSAR IT Backend (Port 8081)" cmd /k "cd /d "%~dp0backend\spring-backend" && mvn spring-boot:run"

echo [2/2] Starting React Frontend (Port 3000)...
start "TSAR IT Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ========================================================
echo Backend is launching at:  http://localhost:8081
echo Frontend is launching at: http://localhost:3000
echo ========================================================
echo.
