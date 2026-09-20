import Database from 'better-sqlite3';
import session from 'express-session';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  setting TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  -- How much faction detail this campaign plays at: alliance | codex.
  level TEXT NOT NULL DEFAULT 'codex',
  -- The current season. Games before this are history, not territory.
  season_started_at INTEGER,
  -- Optional automatic new season every N days.
  reset_days INTEGER
);
CREATE TABLE IF NOT EXISTS members (
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('organizer', 'player')),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (campaign_id, user_id)
);
CREATE TABLE IF NOT EXISTS armies (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  faction TEXT NOT NULL,
  -- Which of that faction's grounds this army mustered from.
  start TEXT,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  retired_at INTEGER
);
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  node TEXT NOT NULL,
  winner_army INTEGER NOT NULL REFERENCES armies(id),
  loser_army INTEGER NOT NULL REFERENCES armies(id),
  played_at INTEGER NOT NULL,
  reported_by INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'disputed')),
  confirmed_at INTEGER
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  node TEXT NOT NULL,
  army_a INTEGER NOT NULL REFERENCES armies(id),
  army_b INTEGER NOT NULL REFERENCES armies(id),
  scheduled_for INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_by INTEGER NOT NULL REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS games_campaign ON games(campaign_id, played_at);
CREATE INDEX IF NOT EXISTS events_campaign ON events(campaign_id, scheduled_for);
-- A gamemaster's hand on the map: influence granted or taken away at a
-- point, outside the record of games. Deleting one undoes it completely.
CREATE TABLE IF NOT EXISTS decrees (
  id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  setting TEXT NOT NULL,
  node TEXT NOT NULL,
  faction TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS decrees_campaign ON decrees(campaign_id);
CREATE INDEX IF NOT EXISTS armies_campaign ON armies(campaign_id);
`;

// Columns added after the first release; SQLite has no "add column if missing".
const LATER_COLUMNS = [
  ['campaigns', 'level', "TEXT NOT NULL DEFAULT 'codex'"],
  ['campaigns', 'season_started_at', 'INTEGER'],
  ['campaigns', 'reset_days', 'INTEGER'],
  ['campaigns', 'maps', 'TEXT'],
  ['campaigns', 'settings', 'TEXT'],
  ['armies', 'setting', 'TEXT'],
  ['campaigns', 'frozen', 'INTEGER'],
  ['armies', 'start', 'TEXT'],
];

export function openDb(file) {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  for (const [table, column, type] of LATER_COLUMNS) {
    const has = db.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`).get(table, column);
    if (!has) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
  return db;
}

// express-session store backed by the same SQLite file.
export class SqliteSessionStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;
    this.getStmt = db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expires > ?');
    this.setStmt = db.prepare('INSERT OR REPLACE INTO sessions (sid, sess, expires) VALUES (?, ?, ?)');
    this.delStmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
    this.touchStmt = db.prepare('UPDATE sessions SET expires = ? WHERE sid = ?');
    this.pruneStmt = db.prepare('DELETE FROM sessions WHERE expires <= ?');
    this.timer = setInterval(() => this.pruneStmt.run(Date.now()), 3600e3);
    this.timer.unref();
  }
  expiry(sess) {
    return sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 86400e3;
  }
  get(sid, cb) {
    try {
      const row = this.getStmt.get(sid, Date.now());
      cb(null, row ? JSON.parse(row.sess) : null);
    } catch (e) { cb(e); }
  }
  set(sid, sess, cb) {
    try { this.setStmt.run(sid, JSON.stringify(sess), this.expiry(sess)); cb?.(null); } catch (e) { cb?.(e); }
  }
  destroy(sid, cb) {
    try { this.delStmt.run(sid); cb?.(null); } catch (e) { cb?.(e); }
  }
  touch(sid, sess, cb) {
    try { this.touchStmt.run(this.expiry(sess), sid); cb?.(null); } catch (e) { cb?.(e); }
  }
}
