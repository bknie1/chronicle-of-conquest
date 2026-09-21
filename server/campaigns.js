import crypto from 'node:crypto';
import express from 'express';
import { SETTINGS, LEVELS, armyFactionsFor, startsFor } from '../src/data/settings.js';
import { HttpError, id, requireUser, text } from './util.js';

export const AUTO_CONFIRM_MS = 48 * 3600e3;
const DAY_MS = 86400e3;
const MAX_ACTIVE_ARMIES = 5;   // per game a campaign spans, not per campaign
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
    setFrozen: db.prepare('UPDATE campaigns SET frozen = ? WHERE id = ?'),
    decrees: db.prepare('SELECT * FROM decrees WHERE campaign_id = ? ORDER BY created_at, id'),
    insertDecree: db.prepare(`INSERT INTO decrees (campaign_id, setting, node, faction, amount, reason, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    deleteDecree: db.prepare('DELETE FROM decrees WHERE id = ? AND campaign_id = ?'),
    places: db.prepare('SELECT * FROM places WHERE campaign_id = ? ORDER BY created_at, id'),
    insertPlace: db.prepare(`INSERT INTO places (campaign_id, setting, map, name, kind, region, x, y, lore, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    updatePlace: db.prepare(`UPDATE places SET name = ?, kind = ?, region = ?, x = ?, y = ?, lore = ?
      WHERE id = ? AND campaign_id = ?`),
    deletePlace: db.prepare('DELETE FROM places WHERE id = ? AND campaign_id = ?'),
    setOptions: db.prepare('UPDATE campaigns SET name = ?, level = ?, reset_days = ?, maps = ?, settings = ? WHERE id = ?'),
    setHomeSetting: db.prepare('UPDATE campaigns SET setting = ? WHERE id = ?'),
    fixArmySettings: db.prepare('UPDATE armies SET setting = ? WHERE campaign_id = ? AND setting IS NULL'),
    setMemberRole: db.prepare('UPDATE members SET role = ? WHERE campaign_id = ? AND user_id = ?'),
    organizerCount: db.prepare("SELECT COUNT(*) n FROM members WHERE campaign_id = ? AND role = 'organizer'"),
    myCampaigns: db.prepare(`SELECT c.code, c.name, c.setting, c.level, m.role FROM members m JOIN campaigns c ON c.id = m.campaign_id
      WHERE m.user_id = ? ORDER BY m.joined_at DESC`),
    member: db.prepare('SELECT role FROM members WHERE campaign_id = ? AND user_id = ?'),
    insertMember: db.prepare('INSERT OR IGNORE INTO members (campaign_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)'),
    members: db.prepare(`SELECT m.user_id, m.role, m.joined_at, u.display_name FROM members m JOIN users u ON u.id = m.user_id
      WHERE m.campaign_id = ? ORDER BY m.joined_at`),
    armies: db.prepare(`SELECT a.*, u.display_name FROM armies a JOIN users u ON u.id = a.user_id WHERE a.campaign_id = ? ORDER BY a.created_at`),
    army: db.prepare('SELECT * FROM armies WHERE id = ? AND campaign_id = ?'),
    activeArmyCount: db.prepare(`SELECT COUNT(*) n FROM armies
      WHERE campaign_id = ? AND user_id = ? AND retired_at IS NULL AND COALESCE(setting, ?) = ?`),
    insertArmy: db.prepare('INSERT INTO armies (campaign_id, user_id, faction, start, name, created_at, setting) VALUES (?, ?, ?, ?, ?, ?, ?)'),
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
  // A campaign may span several games; each army belongs to one of them.
  const settingsOf = c => (c.settings ? JSON.parse(c.settings) : [c.setting]);
  const settingOf = (c, a) => a.setting ?? c.setting;
  const node = (c, value, a) => {
    const n = SETTINGS[settingOf(c, a)].nodes.find(x => x.id === value);
    if (!n) throw new HttpError(400, 'Pick a battlefield on the map.');
    return n.id;
  };
  const opposed = (c, a, b) => {
    if (a.id === b.id) throw new HttpError(400, 'An army cannot fight itself.');
    if (a.faction === b.faction) throw new HttpError(400, 'Pick armies from two different factions.');
    if (settingOf(c, a) !== settingOf(c, b)) throw new HttpError(400, 'Those armies fight in different games.');
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
        maps: c.maps ? JSON.parse(c.maps) : null,
        settings: settingsOf(c),
        frozen: !!c.frozen,
      },
      me: user ? { userId: user.id, displayName: user.displayName, role: roleOf(c, user) } : null,
      decrees: q.decrees.all(c.id).map(d => ({
        id: d.id, setting: d.setting, node: d.node, faction: d.faction,
        amount: d.amount, reason: d.reason, createdAt: d.created_at,
      })),
      places: q.places.all(c.id).map(p => ({
        id: `gm-${p.id}`, placeId: p.id, setting: p.setting, map: p.map, name: p.name,
        kind: p.kind, region: p.region, x: p.x, y: p.y, lore: p.lore,
      })),
      members: q.members.all(c.id).map(m => ({ userId: m.user_id, displayName: m.display_name, role: m.role, joinedAt: m.joined_at })),
      armies: q.armies.all(c.id).map(a => ({
        id: a.id, userId: a.user_id, playerName: a.display_name, faction: a.faction, start: a.start, name: a.name,
        setting: settingOf(c, a),
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

  // A frozen campaign is readable but cannot be written to: the map stays
  // exactly as it is until an organizer thaws it. Visibility is untouched.
  const requireThawed = c => {
    if (c.frozen) throw new HttpError(409, 'This campaign is frozen. An organizer has paused it.');
  };
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
    // Which of the setting's maps the campaign shows. Hidden maps keep their
    // games and territory; they are simply not offered until switched back on.
    let maps = c.maps;
    if (Array.isArray(req.body.maps)) {
      const known = SETTINGS[c.setting].maps.map(m => m.id);
      const chosen = req.body.maps.filter(id => known.includes(id));
      if (!chosen.length) throw new HttpError(400, 'A campaign needs at least one map.');
      maps = chosen.length === known.length ? null : JSON.stringify(chosen);
    }
    // Which games the campaign spans, including the one it started in — a
    // campaign is allowed to change its mind about that. Dropped games keep
    // their armies, results and territory; they are simply not offered.
    let settings = c.settings;
    let home = c.setting;
    if (Array.isArray(req.body.settings)) {
      const chosen = req.body.settings.filter(id => SETTINGS[id]);
      if (!chosen.length) throw new HttpError(400, 'A campaign needs at least one game.');
      if (!chosen.includes(c.setting)) {
        // Armies recorded before games were written down fall back to the
        // campaign's own. Write that down now, so moving the home game cannot
        // quietly move an existing army into a different one.
        q.fixArmySettings.run(c.setting, c.id);
        home = chosen[0];
        maps = null;  // which maps are shown belongs to the home game
      }
      settings = chosen.length === 1 && chosen[0] === home ? null : JSON.stringify(chosen);
    }
    if (home !== c.setting) q.setHomeSetting.run(home, c.id);
    q.setOptions.run(name, level, resetDays || null, maps, settings, c.id);
    res.json(payload(q.campaignByCode.get(c.code), user));
  });

  // Running a campaign alone gets old. An organizer can hand the job to
  // anyone who has joined, and step back down again — as long as somebody is
  // still holding it.
  router.post('/campaigns/:code/members/:userId/role', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    const target = id(req.params.userId, 'Member');
    const role = req.body.role === 'organizer' ? 'organizer' : 'player';
    const member = q.members.all(c.id).find(m => m.user_id === target);
    if (!member) throw new HttpError(404, 'They have not joined this campaign.');
    if (member.role === role) return res.json(payload(c, user));
    if (role === 'player' && q.organizerCount.get(c.id).n <= 1) {
      throw new HttpError(400, 'A campaign needs at least one organizer.');
    }
    q.setMemberRole.run(role, c.id, target);
    res.json(payload(c, user));
  });

  // Gamemaster: pause the campaign without hiding it.
  router.post('/campaigns/:code/freeze', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    q.setFrozen.run(req.body.frozen === false ? null : 1, c.id);
    c.frozen = req.body.frozen === false ? null : 1;
    res.json(payload(c, user));
  });

  // Gamemaster: put influence on the map by decree — an invasion, a landing,
  // a WAAAGH!, or a correction. It sits outside the record of games, and
  // removing it takes it off the map again.
  router.post('/campaigns/:code/decrees', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    const settingId = req.body.setting ?? c.setting;
    if (!settingsOf(c).includes(settingId)) throw new HttpError(400, 'That game is not part of this campaign.');
    const setting = SETTINGS[settingId];
    const n = setting.nodes.find(x => x.id === req.body.node);
    if (!n) throw new HttpError(400, 'Pick a place on the map.');
    const faction = setting.factions.find(f => f.id === req.body.faction)
      ?? setting.alliances.find(f => f.id === req.body.faction);
    if (!faction) throw new HttpError(400, 'Pick whose influence this is.');
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 200) {
      throw new HttpError(400, 'An amount between -200 and 200, and not zero.');
    }
    const reason = text(req.body.reason ?? '', 'Reason', { min: 0, max: 80 });
    q.insertDecree.run(c.id, settingId, n.id, faction.id, amount, reason, Date.now(), user.id);
    res.status(201).json(payload(c, user));
  });

  router.delete('/campaigns/:code/decrees/:id', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    q.deleteDecree.run(id(req.params.id, 'Decree'), c.id);
    res.json(payload(c, user));
  });

  // Gamemaster: places of their own. A shipped map cannot itemise a hive city
  // or an ash waste, so a campaign can add the domes, tunnels and holdings it
  // actually fights over. They join the graph like any other place.
  const KINDS = new Set(['hive', 'city', 'stronghold', 'castle', 'port', 'temple', 'town', 'settlement',
    'camp', 'warren', 'glade', 'ruin', 'wilds', 'forge', 'fortress', 'plant', 'site', 'mine', 'region']);

  const placeFrom = (req, c) => {
    const settingId = req.body.setting ?? c.setting;
    if (!settingsOf(c).includes(settingId)) throw new HttpError(400, 'That game is not part of this campaign.');
    const setting = SETTINGS[settingId];
    const map = setting.maps.find(m => m.id === req.body.map);
    if (!map) throw new HttpError(400, 'Pick one of this campaign’s maps.');
    const x = Number(req.body.x), y = Number(req.body.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > map.width || y > map.height) {
      throw new HttpError(400, 'Put the place on the map.');
    }
    const name = text(req.body.name, 'Name', { min: 2, max: 60 });
    if (setting.nodes.some(n => n.name.toLowerCase() === name.toLowerCase())) {
      throw new HttpError(400, `${name} is already on this map.`);
    }
    const kind = KINDS.has(req.body.kind) ? req.body.kind : 'settlement';
    return {
      settingId, mapId: map.id, name, kind,
      region: text(req.body.region ?? '', 'Region', { min: 0, max: 60 }),
      lore: text(req.body.lore ?? '', 'Lore', { min: 0, max: 2000 }),
      x: Math.round(x), y: Math.round(y),
    };
  };

  router.post('/campaigns/:code/places', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    const p = placeFrom(req, c);
    q.insertPlace.run(c.id, p.settingId, p.mapId, p.name, p.kind, p.region, p.x, p.y, p.lore, Date.now(), user.id);
    res.status(201).json(payload(c, user));
  });

  router.patch('/campaigns/:code/places/:id', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    const placeId = id(req.params.id, 'Place');
    const existing = q.places.all(c.id).find(row => row.id === placeId);
    if (!existing) throw new HttpError(404, 'No such place.');
    const body = { ...req.body, setting: req.body.setting ?? existing.setting, map: req.body.map ?? existing.map };
    const p = placeFrom({ ...req, body }, c);
    q.updatePlace.run(p.name, p.kind, p.region, p.x, p.y, p.lore, placeId, c.id);
    res.json(payload(c, user));
  });

  router.delete('/campaigns/:code/places/:id', (req, res) => {
    const user = requireUser(req);
    const c = load(req);
    requireOrganizer(c, user);
    q.deletePlace.run(id(req.params.id, 'Place'), c.id);
    res.json(payload(c, user));
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
    requireThawed(c);
    // An army fights in one of the campaign's games, for one army book, from
    // one of that book's starting grounds.
    const settingId = req.body.setting ?? c.setting;
    if (!settingsOf(c).includes(settingId)) throw new HttpError(400, 'That game is not part of this campaign.');
    const setting = SETTINGS[settingId];
    const faction = armyFactionsFor(setting).find(f => f.id === req.body.faction);
    if (!faction) throw new HttpError(400, 'Pick a faction.');
    const starts = startsFor(setting, faction.id);
    const start = starts.find(s => s.id === req.body.start) ?? starts[0];
    if (!start) throw new HttpError(400, 'Pick where that army begins.');
    const name = text(req.body.name, 'Army name', { min: 2, max: 40 });
    // The limit is per game: a campaign spanning the Old World and 40,000
    // should not make someone choose between them.
    if (q.activeArmyCount.get(c.id, user.id, c.setting, settingId).n >= MAX_ACTIVE_ARMIES) {
      throw new HttpError(400, `You can field at most ${MAX_ACTIVE_ARMIES} armies at once in ${setting.name}. Retire one first.`);
    }
    q.insertArmy.run(c.id, user.id, faction.id, start.id, name, Date.now(), settingId);
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
    requireThawed(c);
    const mine = activeArmy(c, req.body.army, 'Your army');
    if (mine.user_id !== user.id) throw new HttpError(403, 'You can only issue challenges with your own army.');
    const foe = activeArmy(c, req.body.opponent, 'Opponent');
    opposed(c, mine, foe);
    const when = Number(req.body.scheduledFor);
    const now = Date.now();
    if (!Number.isFinite(when) || when < now - 86400e3 || when > now + 60 * 86400e3) {
      throw new HttpError(400, 'Pick a date within the next two months.');
    }
    const note = text(req.body.note, 'Stakes', { max: 80 });
    q.insertEvent.run(c.id, node(c, req.body.node, mine), mine.id, foe.id, when, note, user.id);
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
    requireThawed(c);
    const winner = activeArmy(c, req.body.winner, 'Victor');
    const loser = activeArmy(c, req.body.loser, 'Defeated army');
    opposed(c, winner, loser);
    if (winner.user_id !== user.id && loser.user_id !== user.id) {
      throw new HttpError(403, 'Only a player who fought can report the result.');
    }
    const where = node(c, req.body.node, winner);
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
