@echo off
echo ========================================
echo Railway Deployment Script - Improved
echo ========================================
echo.

echo [1/5] Checking Node.js and npm...
node --version
npm --version
echo.

echo [2/5] Installing dependencies...
npm ci --include=dev
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)
echo.

echo [3/5] Building the application...
npm run build:ssr
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    exit /b 1
)
echo.

echo [4/5] Testing the server locally...
echo Starting server for local test...
start /B npm start
timeout /t 10 /nobreak >nul

echo Testing health endpoint...
curl -f http://localhost:3000/health
if %errorlevel% neq 0 (
    echo WARNING: Health check failed locally
) else (
    echo SUCCESS: Health check passed locally
)

echo Testing test endpoint...
curl -f http://localhost:3000/test
if %errorlevel% neq 0 (
    echo WARNING: Test endpoint failed locally
) else (
    echo SUCCESS: Test endpoint passed locally
)

echo Stopping local server...
taskkill /F /IM node.exe >nul 2>&1
echo.

echo [5/5] Ready for Railway deployment!
echo.
echo Next steps:
echo 1. Commit your changes: git add . && git commit -m "Fix deployment issues"
echo 2. Push to Railway: git push railway main
echo.
echo ========================================
echo Deployment script completed!
echo ======================================== 