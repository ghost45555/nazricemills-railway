import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export async function app(): Promise<express.Express> {
  console.log('Setting up Express app...');
  
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  // Fix path resolution for Railway environment
  let browserDistFolder = resolve(serverDistFolder, '../browser');
  let indexHtml = join(browserDistFolder, 'index.html');

  // Try multiple possible paths for the browser dist folder
  const possiblePaths = [
    resolve(serverDistFolder, '../browser'), // Default Angular SSR path
    resolve(serverDistFolder, '../../browser'), // Alternative path
    resolve(serverDistFolder, 'dist/ricemill/browser'), // Development path
    resolve(serverDistFolder, '../dist/ricemill/browser'), // Another possible path
    '/app/dist/ricemill/browser' // Railway container path
  ];

  // Debug: Check if files exist
  console.log('Checking file paths...');
  try {
    const fs = await import('fs');
    console.log('Server dist folder exists:', fs.existsSync(serverDistFolder));
    console.log('Server dist folder contents:', fs.readdirSync(serverDistFolder));
    
    // Try all possible paths
    let foundPath = false;
    for (let i = 0; i < possiblePaths.length; i++) {
      const path = possiblePaths[i];
      const indexPath = join(path, 'index.html');
      console.log(`Trying path ${i + 1}: ${path}`);
      console.log(`  Path exists: ${fs.existsSync(path)}`);
      console.log(`  Index.html exists: ${fs.existsSync(indexPath)}`);
      
      if (fs.existsSync(indexPath)) {
        console.log(`✅ Found working path: ${path}`);
        browserDistFolder = path;
        indexHtml = indexPath;
        foundPath = true;
        break;
      }
    }
    
    if (!foundPath) {
      console.log('❌ No working path found for index.html');
      console.log('All attempted paths:');
      possiblePaths.forEach((path, index) => {
        console.log(`  ${index + 1}. ${path}`);
      });
    }
  } catch (error) {
    console.log('Error checking files:', error);
  }

  console.log('Paths configured:', {
    serverDistFolder,
    browserDistFolder,
    indexHtml
  });

  const commonEngine = new CommonEngine();
  console.log('CommonEngine initialized');

  // Trust proxy for Railway
  server.set('trust proxy', 1);
  
  // Security headers
  server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

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

  // Root endpoint removed - let Angular handle it

  // Serve static files from /browser (only for actual static files)
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false, // Don't serve index.html for static requests
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Skip API endpoints
    if (originalUrl.startsWith('/api/') || 
        originalUrl === '/health' || 
        originalUrl === '/test') {
      return next();
    }

    console.log(`Rendering Angular route: ${originalUrl}`);

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        console.error('Angular rendering error:', err);
        // Fallback to sending a basic error response
        res.status(500).send('Internal Server Error');
      });
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
