import 'zone.js/node';

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// The Express app is exported so that it can be used by serverless Functions.
export async function app(): Promise<express.Express> {
  console.log('Setting up Express app...');
  
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  
  // Simple path resolution
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(browserDistFolder, 'index.html');

  console.log('Paths configured:', {
    serverDistFolder,
    browserDistFolder,
    indexHtml
  });

  // Trust proxy for Railway
  server.set('trust proxy', 1);
  
  // Security headers
  server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check endpoint for Railway
  server.get('/health', (req, res) => {
    console.log('Health check requested');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] || 'development'
    });
  });

  // Simple test endpoint
  server.get('/test', (req, res) => {
    console.log('Test endpoint requested');
    res.status(200).json({
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // Serve static files from /browser
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html', // Serve index.html for directory requests
  }));

  // All routes serve index.html (SPA fallback)
  server.get('*', (req, res) => {
    console.log(`Request: ${req.originalUrl}`);
    res.sendFile(indexHtml);
  });

  return server;
}

async function run(): Promise<void> {
  console.log('Starting server...');
  console.log('Environment variables:', {
    NODE_ENV: process.env['NODE_ENV'],
    PORT: process.env['PORT'],
    HOST: process.env['HOST']
  });

  const port = parseInt(process.env['PORT'] || '3000', 10);
  const host = process.env['HOST'] || '0.0.0.0';

  console.log(`Configuring server for port ${port} and host ${host}`);

  try {
    // Start up the Node server
    const server = await app();
    
    // Add error handling
    server.on('error', (error: any) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Add process error handlers
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    server.listen(port, host, () => {
      console.log(`✅ Node Express server listening on http://${host}:${port}`);
      console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log('Health check available at /health');
      console.log('Test endpoint available at /test');
      console.log('Server startup complete!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

run();
