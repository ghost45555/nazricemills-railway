@echo off
echo ========================================
echo Railway Deployment Script (Improved)
echo ========================================
echo.

echo [1/4] Checking Railway CLI...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Railway CLI
        pause
        exit /b 1
    )
) else (
    echo ✅ Railway CLI found
)

echo.
echo [2/4] Building application...
echo Running: npm run build:ssr
npm run build:ssr
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build completed successfully

echo.
echo [3/4] Checking Railway login status...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Railway
    echo Please run: railway login
    pause
    exit /b 1
) else (
    echo ✅ Logged in to Railway
)

echo.
echo [4/4] Deploying to Railway...
echo Running: railway up
railway up

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo.
echo If deployment was successful, your app should be available at:
echo https://your-app-name.railway.app
echo.
echo To check logs: railway logs
echo To open dashboard: railway open
echo.
pause 