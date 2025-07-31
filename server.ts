import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  console.log('Setting up Express app...');
  
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(browserDistFolder, 'index.html');

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

function run(): void {
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
    const server = app();
    
    // Add error handling
    server.on('error', (error) => {
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
