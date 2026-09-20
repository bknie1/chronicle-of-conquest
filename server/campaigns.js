import crypto from 'node:crypto';
import express from 'express';
import { SETTINGS, LEVELS, armyFactionsFor, startsFor } from '../src/data/settings.js';
import { HttpError, id, requireUser, text } from './util.js';

export const AUTO_CONFIRM_MS = 48 * 3600e3;
const DAY_MS = 86400e3;
const MAX_ACTIVE_ARMIES = 5;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I

function newCode() {
  const bytes = crypto.randomBytes(6);
  const chars = [...bytes].map(b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  return `${chars.slice(0, 3)}-${chars.slice(3)}`;
}

export const normalizeCode = raw => {
  const s = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return s.length === 6 ? `${s.slice(0, 3)}-${s.slice(3)}` : null;
};

export function campaignRoutes(db) {
  const router = express.Router();
  const q = {
    campaignByCode: db.prepare('SELECT * FROM campaigns WHERE code = ?'),
    insertCampaign: db.prepare(`INSERT INTO campaigns (code, name, setting, owner_id, created_at, level, season_started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`),
    setSeason: db.prepare('UPDATE campaigns SET season_started_at = ? WHERE id = ?'),
    setOptions: db.prepare('UPDATE campaigns SET name = ?, level = ?, reset_days = ? WHERE id = ?'),
    myCampaigns: db.prepare(`SELECT c.code, c.name, c.setting, c.level, m.role FROM members m JOIN campaigns c ON c.id = m.campaign_id
      WHERE m.user_id = ? ORDER BY m.joined_at DESC`),
    member: db.prepare('SELECT role FROM members WHERE campaign_id = ? AND user_id = ?'),
    insertMember: db.prepare('INSERT OR IGNORE INTO members (campaign_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)'),
    members: db.prepare(`SELECT m.user_id, m.role, m.joined_at, u.display_name FROM members m JOIN users u ON u.id = m.user_id
      WHERE m.campaign_id = ? ORDER BY m.joined_at`),
    armies: db.prepare(`SELECT a.*, u.display_name FROM armies a JOIN users u ON u.id = a.user_id WHERE a.campaign_id = ? ORDER BY a.created_at`),
    army: db.prepare('SELECT * FROM armies WHERE id = ? AND campaign_id = ?'),
    activeArmyCount: db.prepare('SELECT COUNT(*) n FROM armies WHERE campaign_id = ? AND user_id = ? AND retired_at IS NULL'),
    insertArmy: db.prepare('INSERT INTO armies (campaign_id, user_id, faction, start, name, created_at) VALUES (?, ?, ?, ?, ?, ?)'),
    retireArmy: db.prepare('UPDATE armies SET retired_at = ? WHERE id = ?'),
    games: db.prepare('SELECT * FROM games WHERE campaign_id = ? ORDER BY played_at, id'),
    game: db.prepare('SELECT * FROM games WHERE id = ? AND campaign_id = ?'),
    insertGame: db.prepare(`INSERT INTO games (campaign_id, node, winner_army, loser_army, played_at, reported_by, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`),
    setGameStatus: db.prepare('UPDATE games SET status = ?, confirmed_at = ? WHERE id = ?'),
    deleteGame: db.prepare('DELETE FROM games WHERE id = ?'),
    autoConfirm: db.prepare(`UPDATE games SET status = 'confirmed', confirmed_at = ?
      WHERE campaign_id = ? AND status = 'pending' AND played_at < ?`),
    events: db.prepare('SELECT * FROM events WHERE campaign_id = ? AND scheduled_for >= ? ORDER BY scheduled_for'),
    event: db.prepare('SELECT * FROM events WHERE id = ? AND campaign_id = ?'),
    insertEvent: db.prepare(`INSERT INTO events (campaign_id, node, army_a, army_b, scheduled_for, note, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`),
    deleteEvent: db.prepare('DELETE FROM events WHERE id = ?'),
  };

  // --- helpers -------------------------------------------------------------

  const load = (req) => {
    const code = normalizeCode(req.params.code);
    const c = code && q.campaignByCode.get(code);
    if (!c) throw new HttpError(404, 'No campaign has that code.');
    return c;
  };
  const roleOf = (c, user) => (user ? q.member.get(c.id, user.id)?.role ?? null : null);
  const requireMember = (c, user) => {
    const role = roleOf(c, user);
    if (!role) throw new HttpError(403, 'Join this campaign first.');
    return role;
  };
  const activeArmy = (c, armyId, label) => {
    const a = q.army.get(id(armyId, label), c.id);
    if (!a) throw new HttpError(400, `${label} is not in this campaign.`);
    if (a.retired_at) throw new HttpError(400, `${a.name} has been retired.`);
    return a;
  };
  const node = (c, value) => {
    const n = SETTINGS[c.setting].nodes.find(x => x.id === value);
    if (!n) throw new HttpError(400, 'Pick a battlefield on the map.');
    return n.id;
  };
  const opposed = (a, b) => {
    if (a.id === b.id) throw new HttpError(400, 'An army cannot fight itself.');
    if (a.faction === b.faction) throw new HttpError(400, 'Pick armies from two different factions.');
  };
  // The player who must confirm a result is whoever owns the side the reporter didn't.
  const confirmerOf = (g) => {
    const winner = q.army.get(g.winner_army, g.campaign_id);
    const loser = q.army.get(g.loser_army, g.campaign_id);
    if (winner.user_id === loser.user_id) return null; // only an organizer can confirm
    return g.reported_by === winner.user_id ? loser.user_id : winner.user_id;
  };

  // Seasons. A campaign can reset by hand or on an interval; older games stay
  // in the database but no longer count.
  function season(c) {
    let start = c.season_started_at ?? c.created_at;
    if (c.reset_days > 0) {
      const span = c.reset_days * DAY_MS;
      const missed = Math.floor((Date.now() - start) / span);
      if (missed > 0) {
        start += missed * span;
        q.setSeason.run(start, c.id);
        c.season_started_at = start;
      }
    }
    return start;
  }

  function payload(c, user) {
    const now = Date.now();
    const seasonStart = season(c);
    q.autoConfirm.run(now, c.id, now - AUTO_CONFIRM_MS);
    return {
      campaign: {
        code: c.code, name: c.name, setting: c.setting, createdAt: c.created_at,
        level: c.level ?? 'codex', seasonStartedAt: seasonStart, resetDays: c.reset_days ?? 0,
      },
      me: user ? { userId: user.id, displayName: user.displayName, role: roleOf(c, user) } : null,
      members: q.members.all(c.id).map(m => ({ userId: m.user_id, displayName: m.display_name, role: m.role, joinedAt: m.joined_at })),
      armies: q.armies.all(c.id).map(a => ({
        id: a.id, userId: a.user_id, playerName: a.display_name, faction: a.faction, start: a.start, name: a.name,
        createdAt: a.created_at, retiredAt: a.retired_at,
      })),
      games: q.games.all(c.id).filter(g => g.played_at >= seasonStart).map(g => ({
        id: g.id, node: g.node, winner: g.winner_army, loser: g.loser_army, playedAt: g.played_at,
        status: g.status, reportedBy: g.reported_by, confirmer: g.status === 'confirmed' ? null : confirmerOf(g),
      })),
      events: q.events.all(c.id, Math.max(seasonStart, now - 36 * 3600e3)).map(e => ({
        id: e.id, node: e.node, armies: [e.army_a, e.army_b], scheduledFor: e.scheduled_for, note: e.note, createdBy: e.created_by,
      })),
      autoConfirmHours: AUTO_CONFIRM_MS / 3600e3,
    };
  }

  // --- routes --------------------------------------------------------------

  router.get('/me', (req, res) => {
    res.json({ user: req.user || null, campaigns: req.user ? q.myCampaigns.all(req.user.id) : [] });
  });

  router.post('/campaigns', (req, res) => {
    const user = requireUser(req);
    const name = text(req.body.name, 'Campaign name', { min: 3, max: 60 });
    const setting = req.body.setting || 'old-world';
    if (!SETTINGS[setting]) throw new HttpError(400, 'That setting is not available yet.');
    const level = req.body.level || SETTINGS[setting].defaultLevel;
    if (!LEVELS.includes(level)) throw new HttpError(400, 'Pick how much faction detail to play with.');
    let code;
    do code = newCode(); while (q.campaignByCode.get(code));
    const now = Date.now();
    db.transaction(() => {
      const { lastInsertRowid } = q.insertCampaign.run(code, name, setting, user.id, now, level, now);
      q.insertMember.run(lastInsertRowid, user.id, 'organizer', Date.now());
    })();
    res.status(201).json({ code });
  });

  router.get('/campaigns/:code', (req, res) => {
    res.json(payload(load(req), req.user));
  });

  router.post('/campaigns/:code/join', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    q.insertMember.run(c.id, user.id, 'player', Date.now());
    res.json(payload(c, user));
  });

  const requireOrganizer = (c, user) => {
    if (requireMember(c, user) !== 'organizer') throw new HttpError(403, 'Only an organizer can do that.');
  };

  router.post('/campaigns/:code/settings', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    const name = text(req.body.name ?? c.name, 'Campaign name', { min: 3, max: 60 });
    const level = req.body.level ?? c.level ?? 'codex';
    if (!LEVELS.includes(level)) throw new HttpError(400, 'Pick how much faction detail to play with.');
    const resetDays = Number(req.body.resetDays ?? c.reset_days ?? 0);
    if (!Number.isInteger(resetDays) || resetDays < 0 || resetDays > 365) {
      throw new HttpError(400, 'A season can run from 1 to 365 days, or 0 for no automatic reset.');
    }
    q.setOptions.run(name, level, resetDays || null, c.id);
    res.json(payload(q.campaignByCode.get(c.code), user));
  });

  // A new season: the map starts fresh, the chronicle keeps everything.
  router.post('/campaigns/:code/reset', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    q.setSeason.run(Date.now(), c.id);
    res.json(payload(q.campaignByCode.get(c.code), user));
  });

  router.post('/campaigns/:code/armies', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireMember(c, user);
    // An army fights for one army book, from one of that book's starting grounds.
    const setting = SETTINGS[c.setting];
    const faction = armyFactionsFor(setting).find(f => f.id === req.body.faction);
    if (!faction) throw new HttpError(400, 'Pick a faction.');
    const starts = startsFor(setting, faction.id);
    const start = starts.find(s => s.id === req.body.start) ?? starts[0];
    if (!start) throw new HttpError(400, 'Pick where that army begins.');
    const name = text(req.body.name, 'Army name', { min: 2, max: 40 });
    if (q.activeArmyCount.get(c.id, user.id).n >= MAX_ACTIVE_ARMIES) {
      throw new HttpError(400, `You can field at most ${MAX_ACTIVE_ARMIES} armies at once. Retire one first.`);
    }
    q.insertArmy.run(c.id, user.id, faction.id, start.id, name, Date.now());
    res.status(201).json(payload(c, user));
  });

  router.post('/campaigns/:code/armies/:id/retire', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    const role = requireMember(c, user);
    const a = activeArmy(c, req.params.id, 'Army');
    if (a.user_id !== user.id && role !== 'organizer') throw new HttpError(403, 'That army is not yours.');
    q.retireArmy.run(Date.now(), a.id);
    res.json(payload(c, user));
  });

  router.post('/campaigns/:code/events', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireMember(c, user);
    const mine = activeArmy(c, req.body.army, 'Your army');
    if (mine.user_id !== user.id) throw new HttpError(403, 'You can only issue challenges with your own army.');
    const foe = activeArmy(c, req.body.opponent, 'Opponent');
    opposed(mine, foe);
    const when = Number(req.body.scheduledFor);
    const now = Date.now();
    if (!Number.isFinite(when) || when < now - 86400e3 || when > now + 60 * 86400e3) {
      throw new HttpError(400, 'Pick a date within the next two months.');
    }
    const note = text(req.body.note, 'Stakes', { max: 80 });
    q.insertEvent.run(c.id, node(c, req.body.node), mine.id, foe.id, when, note, user.id);
    res.status(201).json(payload(c, user));
  });

  router.delete('/campaigns/:code/events/:id', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    const role = requireMember(c, user);
    const e = q.event.get(id(req.params.id, 'Battle'), c.id);
    if (!e) throw new HttpError(404, 'That battle is not scheduled.');
    const owners = [e.army_a, e.army_b].map(a => q.army.get(a, c.id).user_id);
    if (!owners.includes(user.id) && role !== 'organizer') throw new HttpError(403, 'Only the two players or an organizer can call this off.');
    q.deleteEvent.run(e.id);
    res.json(payload(c, user));
  });

  router.post('/campaigns/:code/games', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireMember(c, user);
    const winner = activeArmy(c, req.body.winner, 'Victor');
    const loser = activeArmy(c, req.body.loser, 'Defeated army');
    opposed(winner, loser);
    if (winner.user_id !== user.id && loser.user_id !== user.id) {
      throw new HttpError(403, 'Only a player who fought can report the result.');
    }
    const where = node(c, req.body.node);
    db.transaction(() => {
      q.insertGame.run(c.id, where, winner.id, loser.id, Date.now(), user.id);
      if (req.body.eventId) {
        const e = q.event.get(Number(req.body.eventId), c.id);
        if (e && [e.army_a, e.army_b].sort().join() === [winner.id, loser.id].sort().join()) q.deleteEvent.run(e.id);
      }
    })();
    res.status(201).json(payload(c, user));
  });

  router.post('/campaigns/:code/games/:id/confirm', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    const role = requireMember(c, user);
    const g = q.game.get(id(req.params.id, 'Result'), c.id);
    if (!g) throw new HttpError(404, 'That result does not exist.');
    if (g.status === 'confirmed') throw new HttpError(400, 'That result is already confirmed.');
    const isConfirmer = confirmerOf(g) === user.id && g.status === 'pending';
    if (!isConfirmer && role !== 'organizer') throw new HttpError(403, 'Only your opponent or an organizer can confirm this.');
    q.setGameStatus.run('confirmed', Date.now(), g.id);
    res.json(payload(c, user));
  });

  router.post('/campaigns/:code/games/:id/dispute', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireMember(c, user);
    const g = q.game.get(id(req.params.id, 'Result'), c.id);
    if (!g) throw new HttpError(404, 'That result does not exist.');
    if (g.status !== 'pending') throw new HttpError(400, 'Only results awaiting confirmation can be disputed.');
    if (confirmerOf(g) !== user.id) throw new HttpError(403, 'Only your opponent can dispute this.');
    q.setGameStatus.run('disputed', null, g.id);
    res.json(payload(c, user));
  });

  router.delete('/campaigns/:code/games/:id', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    const role = requireMember(c, user);
    const g = q.game.get(id(req.params.id, 'Result'), c.id);
    if (!g) throw new HttpError(404, 'That result does not exist.');
    const withdrawing = g.reported_by === user.id && g.status === 'pending';
    if (!withdrawing && role !== 'organizer') throw new HttpError(403, 'Only an organizer can void a result.');
    q.deleteGame.run(g.id);
    res.json(payload(c, user));
  });

  return router;
}
