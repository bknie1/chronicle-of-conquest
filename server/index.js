import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { openDb } from './db.js';
import { createApp } from './app.js';
import { devMapRoutes } from './dev-maps.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const port = Number(process.env.PORT) || 5173;
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
fs.mkdirSync(dataDir, { recursive: true });

// Keep the session secret stable across restarts so people stay signed in.
function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(dataDir, 'session-secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8').trim();
}

const db = openDb(path.join(dataDir, 'chronicle.db'));
const inner = createApp({ db, sessionSecret: sessionSecret(), secureCookies: process.env.SECURE_COOKIES === '1' });

// A thin outer app so dev-only routes can be registered ahead of the main
// app's own /api router (whose catch-all 404 would otherwise shadow them)
// without touching server/app.js.
const app = express();
if (!production) app.use('/api/dev', devMapRoutes(root)); // /editor.html and its save/list endpoints never ship in production
app.use(inner);

if (production) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, () => console.log(`Chronicle of Conquest on http://localhost:${port}${production ? '' : ' (dev)'}`));
