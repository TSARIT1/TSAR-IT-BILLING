# TSAR IT Billing System - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting TSAR IT - Billing System" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Launching Spring Boot Backend (Port 8081)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend\spring-backend'; mvn spring-boot:run"

Write-Host "[2/2] Launching React Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm start"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Backend is launching at:  http://localhost:8081" -ForegroundColor Green
Write-Host "Frontend is launching at: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
