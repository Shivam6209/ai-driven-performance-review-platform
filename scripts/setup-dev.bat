@echo off
REM AI-Driven Performance Review Platform - Development Setup Script (Windows)
REM This script sets up the development environment for the project

echo.
echo ==================================================
echo   AI-Driven Performance Review Platform Setup
echo ==================================================
echo.

echo [INFO] Setting up AI-Driven Performance Review Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Requirements check completed

REM Setup environment variables
echo [INFO] Setting up environment variables...
if not exist .env (
    if exist env.example (
        copy env.example .env >nul
        echo [SUCCESS] Created .env file from env.example
        echo [WARNING] Please edit .env file with your actual configuration values
    ) else (
        echo [ERROR] env.example file not found
        pause
        exit /b 1
    )
) else (
    echo [WARNING] .env file already exists, skipping...
)

REM Install backend dependencies
echo [INFO] Setting up backend...
cd backend
if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    npm install
    if %errorlevel% equ 0 (
        echo [SUCCESS] Backend dependencies installed
    ) else (
        echo [ERROR] Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Backend dependencies already installed, skipping...
)
cd ..

REM Install frontend dependencies
echo [INFO] Setting up frontend...
cd frontend
if not exist node_modules (
    echo [INFO] Installing frontend dependencies...
    npm install
    if %errorlevel% equ 0 (
        echo [SUCCESS] Frontend dependencies installed
    ) else (
        echo [ERROR] Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Frontend dependencies already installed, skipping...
)
cd ..

REM Check for Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Docker found. You can use docker-compose to start services.
    echo [INFO] Run: docker-compose up
) else (
    echo [WARNING] Docker not found. Please set up PostgreSQL and Redis manually:
    echo [WARNING] 1. Install PostgreSQL 15+
    echo [WARNING] 2. Install Redis 7+
    echo [WARNING] 3. Create database 'performance_review_db'
    echo [WARNING] 4. Update .env file with your database credentials
)

echo.
echo [SUCCESS] Development setup completed!
echo.
echo To start the development servers:
echo.
echo Option 1 - Using Docker Compose (Recommended):
echo   docker-compose up
echo.
echo Option 2 - Manual startup:
echo   Terminal 1: cd backend ^&^& npm run start:dev
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
echo The application will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo [WARNING] Don't forget to:
echo [WARNING] 1. Update .env file with your API keys (OpenAI, Pinecone)
echo [WARNING] 2. Configure your database connection if not using Docker
echo.
echo [SUCCESS] Setup completed successfully!
pause 