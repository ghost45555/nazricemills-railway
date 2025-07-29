#!/bin/bash

# Railway Deployment Script for Angular SSR App

echo "🚀 Starting Railway deployment process..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please login first:"
    echo "railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Build the application locally first (optional)
echo "🔨 Building application..."
npm run build:ssr

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at the Railway URL"
    echo "📊 Check the Railway dashboard for logs and monitoring"
else
    echo "❌ Deployment failed. Check the logs above for errors."
    exit 1
fi

echo "🎉 Deployment complete!" 