# Railway Deployment Guide for Angular SSR

## Overview
This guide helps you deploy your Angular SSR application to Railway successfully.

## Prerequisites
- Node.js 20+ installed
- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account and project created

## Quick Deployment Steps

### 1. Prepare Your Application
```bash
# Install dependencies
npm ci --include=dev

# Build the application
npm run build:ssr

# Test locally
npm start
```

### 2. Deploy to Railway
```bash
# Login to Railway (if not already logged in)
railway login

# Link to your Railway project
railway link

# Deploy
railway up
```

## Configuration Files

### railway.toml
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build:ssr"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"
HOST = "0.0.0.0"
```

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci --include=dev"]

[phases.build]
cmds = ["npm run build:ssr"]

[start]
cmd = "npm start"

[variables]
NODE_ENV = "production"
```

## Health Check Endpoints

The application provides several health check endpoints:

- `/health` - Main health check (returns JSON with status)
- `/test` - Test endpoint (returns JSON with server info)
- `/` - Root endpoint (returns basic server info)

## Troubleshooting

### Common Issues

#### 1. Health Check Failing
**Symptoms**: Railway shows "Healthcheck failed" in logs

**Solutions**:
- Check if the server is starting on the correct port (3000)
- Verify the health check path is correct (`/health`)
- Check server logs for startup errors

#### 2. Build Failures
**Symptoms**: Build process fails during deployment

**Solutions**:
- Ensure all dependencies are in `package.json`
- Check for TypeScript compilation errors
- Verify Angular build configuration

#### 3. Server Not Starting
**Symptoms**: Application builds but server doesn't start

**Solutions**:
- Check `server.ts` for syntax errors
- Verify the start command in `package.json`
- Check environment variables

### Debugging Steps

1. **Check Build Logs**:
   ```bash
   railway logs --build
   ```

2. **Check Runtime Logs**:
   ```bash
   railway logs
   ```

3. **Test Locally**:
   ```bash
   npm run build:ssr
   npm start
   curl http://localhost:3000/health
   ```

4. **Check Environment Variables**:
   ```bash
   railway variables
   ```

### Performance Optimizations

1. **Enable Caching**:
   - Static files are cached for 1 year
   - Angular rendering is optimized for SSR

2. **Memory Management**:
   - Server includes memory usage monitoring
   - Automatic cleanup of unused resources

3. **Error Handling**:
   - Comprehensive error handling in server.ts
   - Graceful fallbacks for rendering failures

## Monitoring

### Health Check Monitoring
The application automatically provides health metrics:
- Server uptime
- Memory usage
- Response times

### Log Monitoring
Railway provides built-in log monitoring:
- Application logs
- Build logs
- Error logs

## Security

### Security Headers
The server automatically adds security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Environment Variables
Sensitive data should be stored as Railway environment variables:
- API keys
- Database credentials
- Configuration secrets

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Railway documentation
3. Check application logs
4. Test locally to isolate issues

## Useful Commands

```bash
# Deploy to Railway
railway up

# View logs
railway logs

# Open Railway dashboard
railway open

# Check status
railway status

# View variables
railway variables

# Connect to shell
railway shell
``` 