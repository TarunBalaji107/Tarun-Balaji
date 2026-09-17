import express from 'express';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = 3000;
const PYTHON_PORT = 5050; // Dedicated port for FastAPI to prevent internal conflicts

let pythonProc: ChildProcess | null = null;
let isShuttingDown = false;

function spawnPythonBackend() {
  if (isShuttingDown) return;
  console.log(`[FastAPI] Spawning Python Uvicorn backend process on port ${PYTHON_PORT}...`);

  const pylibDir = path.join(process.cwd(), '.pylib');
  const pythonEnv = {
    ...process.env,
    PYTHONUNBUFFERED: '1',
    PYTHONPATH: process.env.PYTHONPATH ? `${pylibDir}:${process.env.PYTHONPATH}` : pylibDir,
  };

  pythonProc = spawn(
    'python3',
    ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', `--port=${PYTHON_PORT}`, '--log-level', 'info'],
    {
      stdio: 'inherit',
      env: pythonEnv,
    }
  );

  pythonProc.on('error', (err) => {
    console.error('[FastAPI] Process launch error:', err);
  });

  pythonProc.on('exit', (code, signal) => {
    console.log(`[FastAPI] Process exited with code ${code}, signal ${signal}`);
    if (!isShuttingDown) {
      console.log('[FastAPI] Restarting backend process in 2 seconds...');
      setTimeout(spawnPythonBackend, 2000);
    }
  });
}

// Initial spawn
spawnPythonBackend();

// Clean termination on shutdown
const cleanExit = () => {
  isShuttingDown = true;
  if (pythonProc && !pythonProc.killed) {
    console.log('[FastAPI] Terminating Python process...');
    pythonProc.kill('SIGTERM');
  }
};
process.on('exit', cleanExit);
process.on('SIGINT', () => { cleanExit(); process.exit(); });
process.on('SIGTERM', () => { cleanExit(); process.exit(); });

async function startServer() {
  const app = express();

  // Ensure all API responses default to JSON content type
  app.use('/api', (_req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Create proxy to forward API and documentation requests to FastAPI
  const pythonProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${PYTHON_PORT}`,
    changeOrigin: true,
    autoRewrite: true,
    ws: false,
    on: {
      error: (_err, _req, res: any) => {
        if (res && !res.headersSent && typeof res.status === 'function') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.status(503).json({
            status: 'initializing',
            code: 503,
            error: 'Backend Initializing',
            message: 'FastAPI and SQLAlchemy backend is currently starting up. Connecting automatically...',
            timestamp: new Date().toISOString()
          });
        }
      },
    },
  });

  // Mount API proxy (/api/tasks -> /tasks in FastAPI)
  app.use('/api', pythonProxy);

  // Fallback for unmatched /api routes to always return valid JSON 404 instead of HTML
  app.use('/api', (_req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(404).json({
      status: 'error',
      code: 404,
      error: 'Not Found',
      message: 'The requested API endpoint does not exist.',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount docs routes preserving the path for Swagger and OpenAPI
  app.use('/docs', (req, res, next) => {
    req.url = '/docs' + req.url;
    pythonProxy(req, res, next);
  });
  app.use('/redoc', (req, res, next) => {
    req.url = '/redoc' + req.url;
    pythonProxy(req, res, next);
  });
  app.use('/openapi.json', (req, res, next) => {
    req.url = '/openapi.json';
    pythonProxy(req, res, next);
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Web server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] FastAPI routes proxied to http://127.0.0.1:${PYTHON_PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  cleanExit();
  process.exit(1);
});
