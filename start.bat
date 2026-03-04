@echo off
title Mahesh Fashion One-Click Startup (Windows)

echo 🚀 Starting Mahesh Fashion & Tailors...

:: Kill any existing processes (Windows taskkill)
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul

:: Install dependencies if node_modules don't exist
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

:: Run the app
echo Starting servers and application...
call npm run app
