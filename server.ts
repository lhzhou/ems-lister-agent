import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';

// Layered environment loading: base .env first, then mode-specific overrides
const envDir = path.join(process.cwd(), 'env');
const currentMode = process.env.NODE_ENV || 'development';
const envFilesToLoad = [
  path.join(envDir, '.env'),
  path.join(envDir, '.env.local'),
  path.join(envDir, `.env.${currentMode}`),
  path.join(envDir, `env.${currentMode}`),
  path.join(envDir, `.env.${currentMode}.local`),
];

for (const envFile of envFilesToLoad) {
  if (fs.existsSync(envFile) && fs.statSync(envFile).isFile()) {
    try {
      const parsed = dotenv.parse(fs.readFileSync(envFile, 'utf-8'));
      for (const [k, v] of Object.entries(parsed)) {
        process.env[k] = v; // 后读取的配置直接覆盖基础配置中的同名字段
      }
    } catch (e: any) {
      console.warn(`[Server Env] 解析 ${envFile} 异常:`, e.message);
    }
  }
}

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 ? parseInt(args[portIndex + 1]) : null;
const hostIndex = args.indexOf('--host');
const cliHost = hostIndex !== -1 ? args[hostIndex + 1] : null;

const PORT = cliPort || (process.env.PORT ? parseInt(process.env.PORT) : (process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000));
const HOST = cliHost || process.env.VITE_HOST || '0.0.0.0';
// Corporation service target (default to http://39.107.75.132:8902 per doc)
const BACKEND_TARGET = process.env.VITE_API_BASE_URL || 'http://39.107.75.132:8902';

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Proxy for /v1/*
  app.all('/v1/*', async (req, res) => {
    const customTarget = (req.headers['x-corporation-target'] as string)?.trim();
    const rawTarget = (customTarget || process.env.VITE_API_BASE_URL || BACKEND_TARGET).replace(/\/+$/, '');
    const targetUrl = `${rawTarget}${req.originalUrl}`;

    try {
      const forwardHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        if (typeof value === 'string' && !['host', 'content-length', 'x-corporation-target'].includes(lowerKey)) {
          forwardHeaders[lowerKey] = value;
        }
      }

      // Add timeout controller (8 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: forwardHeaders,
        signal: controller.signal,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
        forwardHeaders['content-type'] = 'application/json';
      }

      let backendResponse: Response;
      try {
        backendResponse = await fetch(targetUrl, fetchOptions);
      } finally {
        clearTimeout(timeoutId);
      }

      res.status(backendResponse.status);

      const contentType = backendResponse.headers.get('content-type') || 'application/json';
      res.set('content-type', contentType);

      const responseText = await backendResponse.text();
      res.send(responseText);
    } catch (err: any) {
      console.error(`[Proxy Error] Failed to connect to ${targetUrl}:`, err.message);
      const isTimeout = err.name === 'AbortError';
      res.status(isTimeout ? 504 : 502).json({
        code: isTimeout ? 'GATEWAY_TIMEOUT' : 'SERVICE_UNAVAILABLE',
        message: isTimeout 
          ? `连接公司端服务超时 (8秒)，请确认服务 (${rawTarget}) 是否可访问`
          : `公司端服务连接异常: ${err.message}`,
        target: targetUrl,
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      target: process.env.VITE_API_BASE_URL || BACKEND_TARGET,
      timestamp: Date.now()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      // server.ts is the entrypoint in `pnpm dev:server`; pass the same
      // env directory used by vite.config.ts so import.meta.env contains
      // agent/env/.env and mode-specific overrides.
      envDir,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Corporation proxy target: ${process.env.VITE_API_BASE_URL || BACKEND_TARGET}`);
  });
}

startServer();
