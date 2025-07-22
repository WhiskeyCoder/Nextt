@echo off
echo 🚀 Nextt - Plex-Powered Recommendation Dashboard
echo ================================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project directory.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if dependencies are installed
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Check if ports are available (basic check)
netstat -an | findstr ":3001" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  Warning: Port 3001 is already in use. The backend server may not start properly.
)

netstat -an | findstr ":5173" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  Warning: Port 5173 is already in use. The frontend server may not start properly.
)

echo.
echo 🎯 Starting Nextt...
echo 📊 Backend will run on: http://localhost:3001
echo 🌐 Frontend will run on: http://localhost:5173
echo.
echo ⏳ Starting servers...
echo.

REM Start both servers
echo Starting Nextt servers...
call npm run dev:full

pause 