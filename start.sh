#!/bin/bash

# Mahesh Fashion One-Click Startup (macOS/Linux)

echo "🚀 Starting Mahesh Fashion & Tailors..."

# Kill any existing processes
pkill -f "node|vite|electron" || true

# Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Run the app
npm run app
