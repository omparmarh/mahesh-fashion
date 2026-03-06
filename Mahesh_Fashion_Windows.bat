@echo off
title Mahesh Fashion App Launcher

echo ===================================================
echo     Starting Mahesh Fashion ^& Tailors (Windows)
echo ===================================================

:: Kill any existing Node/Electron processes to prevent port conflicts
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

:: Install dependencies if missing
echo Checking dependencies...
if not exist "node_modules" call npm install
if not exist "backend\node_modules" (
    cd backend
    call npm install
    cd ..
)
if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting Backend Server...
start /B cmd /c "cd backend && npm start"

echo Starting Frontend Server...
start /B cmd /c "cd frontend && npm run dev"

echo.
echo Waiting for servers to fully start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo Launching the Desktop Application...
call npm start

echo.
echo Application Closed. Cleaning up background processes...
taskkill /F /IM node.exe /T >nul 2>&1
exit
