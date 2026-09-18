import express from 'express';
import session from 'express-session';
import { SqliteSessionStore } from './db.js';
import { authRoutes, configurePassport } from './auth.js';
import { campaignRoutes } from './campaigns.js';
import { HttpError } from './util.js';

export function createApp({ db, sessionSecret, secureCookies = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY' });
    next();
  });

  const api = express.Router();
  api.use(express.json({ limit: '20kb' }));
  // Mutations must be JSON: plain HTML forms on other sites can't send that, which blocks CSRF.
  api.use((req, res, next) => {
    if (req.method !== 'GET' && !req.is('application/json')) return next(new HttpError(415, 'Send JSON.'));
    next();
  });
  api.use(session({
    store: new SqliteSessionStore(db),
    secret: sessionSecret,
    name: 'coc.sid',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 30 * 86400e3 },
  }));
  const passport = configurePassport(db);
  api.use(passport.initialize());
  api.use(passport.session());

  api.use('/auth', authRoutes(db));
  api.use(campaignRoutes(db));
  api.use((req, res) => res.status(404).json({ error: 'Not found.' }));
  // eslint-disable-next-line no-unused-vars
  api.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Something went wrong.' : err.message });
  });

  app.use('/api', api);
  return app;
}
