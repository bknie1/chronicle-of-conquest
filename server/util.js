export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function text(value, label, { min = 0, max = 80 } = {}) {
  const s = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (s.length < min) throw new HttpError(400, min <= 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`);
  if (s.length > max) throw new HttpError(400, `${label} can be at most ${max} characters.`);
  return s;
}

export function id(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${label} is invalid.`);
  return n;
}

export function requireUser(req) {
  if (!req.user) throw new HttpError(401, 'Sign in first.');
  return req.user;
}

// Small fixed-window limiter, keyed by IP. Enough for a single-store deployment.
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let h = hits.get(key);
    if (!h || h.reset < now) { h = { count: 0, reset: now + windowMs }; hits.set(key, h); }
    if (++h.count > max) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
    if (hits.size > 10000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    next();
  };
}

// Express 4 doesn't forward rejected promises to the error handler.
export const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
