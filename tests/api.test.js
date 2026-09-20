import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDb } from '../server/db.js';
import { createApp } from '../server/app.js';
import { AUTO_CONFIRM_MS } from '../server/campaigns.js';

// Top-level setup: Node 18's test runner doesn't await root-level before() hooks.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coc-test-'));
const db = openDb(path.join(dir, 'test.db'));
const app = createApp({ db, sessionSecret: 'test-secret' });
const server = await new Promise(r => { const s = app.listen(0, () => r(s)); });
const base = `http://localhost:${server.address().port}/api`;
// Root-level after() doesn't run on Node 18 either: let the process exit on its own and tidy up then.
server.unref();
process.on('exit', () => { db.close(); fs.rmSync(dir, { recursive: true, force: true }); });

// A tiny client that keeps its own session cookie.
function client() {
  let cookie = '';
  const call = async (method, url, body) => {
    const res = await fetch(base + url, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json() };
  };
  return {
    get: url => call('GET', url),
    post: (url, body = {}) => call('POST', url, body),
    del: url => call('DELETE', url, {}),
  };
}

async function signup(name) {
  const c = client();
  const r = await c.post('/auth/signup', { username: name, password: 'hunter2hunter2', displayName: name });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return c;
}

test('full campaign flow: create, join, muster, challenge, report, confirm', async () => {
  const brett = await signup('brett');
  const maria = await signup('maria');
  const anon = client();

  const created = await brett.post('/campaigns', { name: 'Tuesday Night Crusade' });
  assert.equal(created.status, 201);
  const code = created.body.code;
  assert.match(code, /^[A-Z2-9]{3}-[A-Z2-9]{3}$/);

  // Anyone can look without signing in.
  const peek = await anon.get(`/campaigns/${code.toLowerCase().replace('-', '')}`);
  assert.equal(peek.status, 200);
  assert.equal(peek.body.campaign.name, 'Tuesday Night Crusade');
  assert.equal(peek.body.me, null);

  // But not act.
  assert.equal((await anon.post(`/campaigns/${code}/join`)).status, 401);
  assert.equal((await maria.post(`/campaigns/${code}/armies`, { faction: 'empire', name: 'Reiksguard' })).status, 403);

  const joined = await maria.post(`/campaigns/${code}/join`);
  assert.equal(joined.body.me.role, 'player');

  let r = await brett.post(`/campaigns/${code}/armies`, { faction: 'bretonnia', name: "Brett's Knights" });
  assert.equal(r.status, 201);
  const knights = r.body.armies.find(a => a.name === "Brett's Knights").id;
  r = await maria.post(`/campaigns/${code}/armies`, { faction: 'empire', name: 'Reiksguard' });
  const reiksguard = r.body.armies.find(a => a.name === 'Reiksguard').id;

  assert.equal((await maria.post(`/campaigns/${code}/armies`, { faction: 'necrons', name: 'Nope' })).status, 400);

  // Challenge.
  r = await brett.post(`/campaigns/${code}/events`, {
    army: knights, opponent: reiksguard, node: 'montfort', scheduledFor: Date.now() + 86400e3, note: 'For the Lady',
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.events.length, 1);
  const eventId = r.body.events[0].id;
  // Can't challenge using someone else's army.
  assert.equal((await brett.post(`/campaigns/${code}/events`, {
    army: reiksguard, opponent: knights, node: 'montfort', scheduledFor: Date.now(),
  })).status, 403);

  // Report: pending until the opponent confirms; the scheduled battle is resolved.
  r = await brett.post(`/campaigns/${code}/games`, { winner: knights, loser: reiksguard, node: 'montfort', eventId });
  assert.equal(r.status, 201);
  assert.equal(r.body.events.length, 0);
  const game = r.body.games[0];
  assert.equal(game.status, 'pending');
  assert.equal(game.confirmer, joined.body.me.userId);

  // Brett reported this one, but he's the organizer, so he may confirm it.
  assert.equal((await brett.post(`/campaigns/${code}/games/${game.id}/confirm`)).status, 200);
  // A plain player can't confirm their own report.
  r = await maria.post(`/campaigns/${code}/games`, { winner: reiksguard, loser: knights, node: 'altdorf' });
  const second = r.body.games.find(g => g.node === 'altdorf');
  assert.equal((await maria.post(`/campaigns/${code}/games/${second.id}/confirm`)).status, 403);
  r = await brett.post(`/campaigns/${code}/games/${second.id}/dispute`);
  assert.equal(r.body.games.find(g => g.id === second.id).status, 'disputed');
  r = await brett.post(`/campaigns/${code}/games/${second.id}/confirm`); // organizer resolves
  assert.equal(r.body.games.find(g => g.id === second.id).status, 'confirmed');
});

test('players confirm their opponent’s report; outsiders cannot', async () => {
  const org = await signup('organizer1');
  const a = await signup('alice');
  const b = await signup('bob');
  const outsider = await signup('mallory');
  const { code } = (await org.post('/campaigns', { name: 'Friends League' })).body;
  await a.post(`/campaigns/${code}/join`);
  await b.post(`/campaigns/${code}/join`);
  await outsider.post(`/campaigns/${code}/join`);
  const armyA = (await a.post(`/campaigns/${code}/armies`, { faction: 'dwarfs', name: 'Throng' })).body.armies.at(-1).id;
  const armyB = (await b.post(`/campaigns/${code}/armies`, { faction: 'orcs', name: 'Gitz' })).body.armies.at(-1).id;

  // Only someone who fought can report.
  assert.equal((await outsider.post(`/campaigns/${code}/games`, { winner: armyA, loser: armyB, node: 'badlands' })).status, 403);

  const r = await a.post(`/campaigns/${code}/games`, { winner: armyA, loser: armyB, node: 'badlands' });
  const g = r.body.games[0];
  assert.equal((await outsider.post(`/campaigns/${code}/games/${g.id}/confirm`)).status, 403);
  assert.equal((await outsider.del(`/campaigns/${code}/games/${g.id}`)).status, 403);
  const ok = await b.post(`/campaigns/${code}/games/${g.id}/confirm`);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.games[0].status, 'confirmed');

  // Same-faction and retired armies can't fight.
  const armyA2 = (await a.post(`/campaigns/${code}/armies`, { faction: 'orcs', name: 'Also Orcs' })).body.armies.at(-1).id;
  assert.equal((await a.post(`/campaigns/${code}/games`, { winner: armyA2, loser: armyB, node: 'badlands' })).status, 400);
  await b.post(`/campaigns/${code}/armies/${armyB}/retire`);
  assert.equal((await a.post(`/campaigns/${code}/games`, { winner: armyA, loser: armyB, node: 'badlands' })).status, 400);
});

test('pending results auto-confirm after the window', async () => {
  const a = await signup('carol');
  const b = await signup('dan');
  const { code } = (await a.post('/campaigns', { name: 'Slow Confirmers' })).body;
  await b.post(`/campaigns/${code}/join`);
  const armyA = (await a.post(`/campaigns/${code}/armies`, { faction: 'kislev', name: 'Ice Guard' })).body.armies.at(-1).id;
  const armyB = (await b.post(`/campaigns/${code}/armies`, { faction: 'chaos', name: 'Unbound' })).body.armies.at(-1).id;
  const g = (await a.post(`/campaigns/${code}/games`, { winner: armyA, loser: armyB, node: 'praag' })).body.games[0];
  assert.equal(g.status, 'pending');
  // Backdate the game past the window, and the season with it (a game can't predate its campaign).
  const long_ago = Date.now() - AUTO_CONFIRM_MS - 1000;
  db.prepare('UPDATE games SET played_at = ? WHERE id = ?').run(long_ago, g.id);
  db.prepare('UPDATE campaigns SET season_started_at = ? WHERE code = ?').run(long_ago - 1000, code);
  const later = await client().get(`/campaigns/${code}`);
  assert.equal(later.body.games[0].status, 'confirmed');
});

test('auth: bad logins, duplicates, sessions, CSRF guard', async () => {
  await signup('eve');
  const c = client();
  assert.equal((await c.post('/auth/signup', { username: 'EVE', password: 'hunter2hunter2' })).status, 409);
  assert.equal((await c.post('/auth/signup', { username: 'shorty', password: 'short' })).status, 400);
  assert.equal((await c.post('/auth/login', { username: 'eve', password: 'wrong-password' })).status, 401);
  const ok = await c.post('/auth/login', { username: 'eve', password: 'hunter2hunter2' });
  assert.equal(ok.status, 200);
  assert.equal((await c.get('/me')).body.user.username, 'eve');
  await c.post('/auth/logout');
  assert.equal((await c.get('/me')).body.user, null);

  const form = await fetch(`${base}/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'name=x' });
  assert.equal(form.status, 415);
  assert.equal((await client().get('/campaigns/ZZZ-ZZZ')).status, 404);
});

test('Age of Sigmar campaigns accept realm factions and battlefields in any realm', async () => {
  const a = await signup('realm_a');
  const b = await signup('realm_b');
  assert.equal((await a.post('/campaigns', { name: 'Nope', setting: 'blood-bowl' })).status, 400);
  const { code } = (await a.post('/campaigns', { name: 'Realmgate Wars', setting: 'mortal-realms' })).body;
  await b.post(`/campaigns/${code}/join`);
  assert.equal((await a.post(`/campaigns/${code}/armies`, { faction: 'empire', name: 'Wrong setting' })).status, 400);
  const ironjawz = (await a.post(`/campaigns/${code}/armies`, { faction: 'warclan-ironsunz', name: 'Ironjawz' })).body.armies.at(-1).id;
  const freeguild = (await b.post(`/campaigns/${code}/armies`, { faction: 'city-hammerhal', name: 'Freeguild' })).body.armies.at(-1).id;
  assert.equal((await a.post(`/campaigns/${code}/games`, { winner: ironjawz, loser: freeguild, node: 'altdorf' })).status, 400);
  const r = await a.post(`/campaigns/${code}/games`, { winner: ironjawz, loser: freeguild, node: 'hammerhal-ghyra' });
  assert.equal(r.status, 201);
  assert.equal(r.body.campaign.setting, 'mortal-realms');
});

test('campaigns pick a faction detail level, and organizers can reset the season', async () => {
  const org = await signup('season_org');
  const rival = await signup('season_rival');
  assert.equal((await org.post('/campaigns', { name: 'Detail Test', level: 'nonsense' })).status, 400);
  const created = await org.post('/campaigns', { name: 'Detail Test', level: 'alliance' });
  const { code } = created.body;
  await rival.post(`/campaigns/${code}/join`);
  let r = await org.get(`/campaigns/${code}`);
  assert.equal(r.body.campaign.level, 'alliance');
  assert.ok(r.body.campaign.seasonStartedAt > 0);

  const mine = (await org.post(`/campaigns/${code}/armies`, { faction: 'empire', name: 'Reiksguard' })).body.armies.at(-1).id;
  const theirs = (await rival.post(`/campaigns/${code}/armies`, { faction: 'orcs', name: 'Waaagh' })).body.armies.at(-1).id;
  const g = (await org.post(`/campaigns/${code}/games`, { winner: mine, loser: theirs, node: 'altdorf' })).body.games[0];
  await rival.post(`/campaigns/${code}/games/${g.id}/confirm`);
  assert.equal((await org.get(`/campaigns/${code}`)).body.games.length, 1);

  // Only organizers may change settings or reset.
  assert.equal((await rival.post(`/campaigns/${code}/settings`, { level: 'codex' })).status, 403);
  assert.equal((await rival.post(`/campaigns/${code}/reset`)).status, 403);

  r = await org.post(`/campaigns/${code}/settings`, { name: 'Detail Test', level: 'detailed', resetDays: 30 });
  assert.equal(r.body.campaign.level, 'detailed');
  assert.equal(r.body.campaign.resetDays, 30);
  assert.equal((await org.post(`/campaigns/${code}/settings`, { resetDays: 900 })).status, 400);

  // A new season clears the map; the games stay in the database.
  r = await org.post(`/campaigns/${code}/reset`);
  assert.equal(r.body.games.length, 0, 'games before the season no longer count');
  assert.equal(r.body.armies.length, 2, 'armies survive a reset');
  assert.ok(r.body.campaign.seasonStartedAt >= g.playedAt);
});

test('an automatic season rolls over once its interval passes', async () => {
  const org = await signup('auto_season');
  const foe = await signup('auto_foe');
  const { code } = (await org.post('/campaigns', { name: 'Auto Season' })).body;
  await foe.post(`/campaigns/${code}/join`);
  const a = (await org.post(`/campaigns/${code}/armies`, { faction: 'dwarfs', name: 'Throng' })).body.armies.at(-1).id;
  const b = (await foe.post(`/campaigns/${code}/armies`, { faction: 'orcs', name: 'Gitz' })).body.armies.at(-1).id;
  const game = (await org.post(`/campaigns/${code}/games`, { winner: a, loser: b, node: 'badlands' })).body.games[0];
  await foe.post(`/campaigns/${code}/games/${game.id}/confirm`);
  await org.post(`/campaigns/${code}/settings`, { resetDays: 30 });
  // Backdate the season and the game by 31 days: the season should roll over.
  const id = db.prepare('SELECT id FROM campaigns WHERE code = ?').get(code).id;
  const old = Date.now() - 31 * 86400e3;
  db.prepare('UPDATE campaigns SET season_started_at = ? WHERE id = ?').run(old, id);
  db.prepare('UPDATE games SET played_at = ? WHERE campaign_id = ?').run(old + 3600e3, id);
  const after = await org.get(`/campaigns/${code}`);
  assert.equal(after.body.games.length, 0, 'the old season ended');
  assert.ok(after.body.campaign.seasonStartedAt > old, 'the season moved forward');
});
