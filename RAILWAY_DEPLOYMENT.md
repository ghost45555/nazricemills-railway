# Railway Deployment Guide for Angular SSR App

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Git Repository**: Ensure your code is in a Git repository (GitHub, GitLab, etc.)
3. **Node.js**: Your app uses Node.js 20 (configured in nixpacks.toml)

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your preferred Git provider)
4. Connect your repository
5. Select the repository containing your Angular SSR app

### 2. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add:

```
NODE_ENV=production
PORT=3000
```

### 3. Deploy

1. Railway will automatically detect the configuration files:
   - `railway.toml` - Main Railway configuration
   - `nixpacks.toml` - Build configuration
   - `Procfile` - Process definition
   - `package.json` - Contains build and start scripts

2. The deployment process will:
   - Install Node.js 20 and npm
   - Run `npm ci --only=production`
   - Execute `npm run build:ssr`
   - Start the server with `npm start`

### 4. Custom Domain (Optional)

1. In your Railway project, go to "Settings"
2. Click "Custom Domains"
3. Add your domain and configure DNS records

## Configuration Files Explained

### railway.toml
- Configures the build and deployment process
- Sets health check path and restart policies
- Defines environment variables

### nixpacks.toml
- Specifies Node.js 20 as the runtime
- Defines build phases (setup, install, build)
- Sets the start command

### Procfile
- Tells Railway to run the `web` process with `npm start`

### .railwayignore
- Excludes unnecessary files from deployment
- Reduces build time and deployment size

## Build Process

1. **Setup Phase**: Install Node.js 20 and npm
2. **Install Phase**: Run `npm ci --only=production`
3. **Build Phase**: Execute `npm run build:ssr`
4. **Start Phase**: Run `npm start` (serves the SSR app)

## Monitoring

- **Logs**: View real-time logs in the Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Health Checks**: Automatic health checks at the root path (/)

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Railway dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Runtime Errors**:
   - Check application logs
   - Verify environment variables are set correctly
   - Ensure the server is listening on the correct port

3. **Performance Issues**:
   - Monitor resource usage in Railway dashboard
   - Consider upgrading to a higher tier if needed
   - Optimize your Angular build configuration

### Debug Commands

```bash
# View build logs
railway logs

# Check environment variables
railway variables

# Restart the service
railway service restart
```

## Production Optimizations

1. **Caching**: Static assets are cached for 1 year
2. **Security Headers**: Added security headers in server.ts
3. **Proxy Trust**: Configured for Railway's proxy setup
4. **Error Handling**: Proper error handling in SSR rendering

## Cost Optimization

- Start with the free tier for testing
- Monitor usage and upgrade only when needed
- Use Railway's auto-scaling features

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Community Discord: [railway.app/discord](https://railway.app/discord)
- GitHub Issues: For app-specific issues 