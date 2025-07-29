@echo off
REM Railway Deployment Script for Angular SSR App (Windows)

echo 🚀 Starting Railway deployment process...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Please install it first:
    echo npm install -g @railway/cli
    pause
    exit /b 1
)

REM Check if user is logged in to Railway
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Railway. Please login first:
    echo railway login
    pause
    exit /b 1
)

echo ✅ Railway CLI is ready

REM Build the application locally first (optional)
echo 🔨 Building application...
call npm run build:ssr

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful

REM Deploy to Railway
echo 🚀 Deploying to Railway...
railway up

if %errorlevel% neq 0 (
    echo ❌ Deployment failed. Check the logs above for errors.
    pause
    exit /b 1
)

echo ✅ Deployment successful!
echo 🌐 Your app should be available at the Railway URL
echo 📊 Check the Railway dashboard for logs and monitoring
echo 🎉 Deployment complete!
pause 