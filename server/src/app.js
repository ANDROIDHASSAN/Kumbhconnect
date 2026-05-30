// Express app factory. Kept separate from index.js so tests can import and
// exercise the app without binding to a port or auto-starting the listener.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { isPg, pingDb } from './db.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', true); // honour X-Forwarded-For for per-IP rate limiting

  app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','), credentials: true }));
  // Capture the raw body so the Razorpay webhook can verify its signature.
  app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));

  app.get('/api/health', async (_req, res) => {
    const db = await pingDb();
    res.json({ ok: true, store: isPg() ? 'postgres' : 'file', db });
  });

  app.use('/api', publicRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/webhooks', webhookRoutes);

  // API error handler
  app.use('/api', (err, _req, res, _next) => {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // ── Serve the built React app (single-service deploy, e.g. Render) ──
  // ONLY in production: Express serves client/dist so the API and SPA share one
  // origin (no CORS, one URL). In local dev this is skipped — Vite serves the
  // client on :5173, and this server is API-only on :4000.
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('✓ Serving client build from client/dist');
  } else {
    // Dev: API-only. The app runs on the Vite dev server (http://localhost:5173).
    app.get('/', (_req, res) =>
      res.json({ name: 'Kumbh Connect API', health: '/api/health', app: 'http://localhost:5173' }),
    );
  }

  return app;
}
