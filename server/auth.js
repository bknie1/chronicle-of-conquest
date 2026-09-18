import crypto from 'node:crypto';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { HttpError, rateLimit, text, wrap } from './util.js';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

const publicUser = u => u && { id: u.id, username: u.username, displayName: u.display_name };

export function configurePassport(db) {
  const byName = db.prepare('SELECT * FROM users WHERE username = ?');
  const byId = db.prepare('SELECT * FROM users WHERE id = ?');

  passport.use(new LocalStrategy((username, password, done) => {
    const user = byName.get(String(username).trim());
    // Hash even when the user is missing so response time doesn't reveal which usernames exist.
    const ok = verifyPassword(String(password), user?.pass_hash ?? hashPassword('x'));
    done(null, user && ok ? publicUser(user) : false);
  }));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, publicUser(byId.get(id)) || false));
  return passport;
}

export function authRoutes(db) {
  const router = express.Router();
  const limiter = rateLimit({ windowMs: 15 * 60e3, max: 30 });
  const insert = db.prepare('INSERT INTO users (username, display_name, pass_hash, created_at) VALUES (?, ?, ?, ?)');
  const exists = db.prepare('SELECT 1 FROM users WHERE username = ?');

  const logIn = (req, user) => new Promise((resolve, reject) => req.login(user, e => (e ? reject(e) : resolve())));

  router.post('/signup', limiter, wrap(async (req, res) => {
    const username = text(req.body.username, 'Username', { min: 3, max: 24 });
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) throw new HttpError(400, 'Usernames can use letters, numbers, dots, dashes and underscores.');
    const displayName = text(req.body.displayName || username, 'Display name', { min: 1, max: 32 });
    const password = String(req.body.password ?? '');
    if (password.length < 8) throw new HttpError(400, 'Passwords need at least 8 characters.');
    if (password.length > 200) throw new HttpError(400, 'That password is too long.');
    if (exists.get(username)) throw new HttpError(409, 'That username is taken.');
    const { lastInsertRowid } = insert.run(username, displayName, hashPassword(password), Date.now());
    const user = { id: Number(lastInsertRowid), username, displayName };
    await logIn(req, user);
    res.status(201).json({ user });
  }));

  router.post('/login', limiter, (req, res, next) => {
    passport.authenticate('local', async (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: 'Wrong username or password.' });
      try { await logIn(req, user); res.json({ user }); } catch (e) { next(e); }
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    req.logout(err => (err ? next(err) : res.json({ ok: true })));
  });

  return router;
}
