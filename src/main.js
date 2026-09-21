import './style.css';
import { buildSettingGraph, computeInfluence, rollUp, RULES } from './engine.js';
import { MapView } from './map.js';
import { loreFor } from './data/lore/index.js';
import { play as sfx, setSound, soundOn, soundForPlace } from './audio.js';
import { aboutPage } from './about.js';
import { SETTINGS, LEVELS, LEVEL_NAMES, LEVEL_HINTS, factionsFor, armyFactionsFor, startsFor, startPoint, familyOf } from './data/settings.js';
import { api } from './api.js';
import { demoView, campaignView, dayToMs } from './sources.js';

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

// A static build (GitHub Pages) has no server: demos only, no accounts or campaigns.
const STATIC = import.meta.env.VITE_STATIC === '1';
// Where the app is served from: '/' locally, '/<repo>/' on GitHub Pages.
const BASE = import.meta.env.BASE_URL;
const asset = path => BASE + path.replace(/^\//, '');
const appPath = () => {
  const p = location.pathname;
  return p.startsWith(BASE) ? `/${p.slice(BASE.length)}` : p;
};
const urlFor = path => BASE + path.replace(/^\//, '');

// Everything derived from a setting (its maps, the graph across them, lookups).
// Point indices are setting-wide; each map's points occupy [offset, offset + count).
const contexts = new Map();

// A campaign may have added places of its own. They are not part of the
// shipped map, so the setting is rebuilt with them folded in — after that they
// are ordinary points, and the graph, the territory and the influence never
// need to know the difference.
function withPlaces(setting, places) {
  if (!places?.length) return setting;
  const byMap = new Map();
  for (const p of places) {
    if (!byMap.has(p.map)) byMap.set(p.map, []);
    byMap.get(p.map).push({ id: p.id, name: p.name, kind: p.kind, region: p.region || 'Added by the gamemaster', x: p.x, y: p.y, added: true });
  }
  const maps = setting.maps.map(m => (byMap.has(m.id) ? { ...m, nodes: [...m.nodes, ...byMap.get(m.id)] } : m));
  const nodes = maps.flatMap(m => m.nodes.map(n => ({ ...n, map: m.id })));
  return { ...setting, maps, nodes };
}

// Places are keyed into the cache by what they are, so editing one rebuilds
// the graph and nothing else does.
const placesKey = places => (places ?? []).map(p => `${p.id}@${p.map}:${p.x},${p.y}`).sort().join('|');

function contextFor(id, places) {
  const key = places?.length ? `${id}#${placesKey(places)}` : id;
  if (!contexts.has(key)) {
    const setting = withPlaces(SETTINGS[id], places);
    const graph = buildSettingGraph(setting);
    contexts.set(key, {
      setting,
      graph,
      nodes: setting.nodes,
      nodeIndex: graph.index,
      factionById: new Map(setting.factions.map(f => [f.id, f])), // army books, whatever the level
      mapById: new Map(setting.maps.map(m => [m.id, m])),
      addedLore: new Map((places ?? []).filter(p => p.lore).map(p => [p.id, p.lore])),
    });
    // Only the current shape of each campaign's map is worth keeping.
    if (contexts.size > 24) contexts.delete([...contexts.keys()].find(k => k !== key));
  }
  return contexts.get(key);
}

const state = {
  session: { user: null, campaigns: [] },
  view: null,       // what's on the map: a demo or a campaign (see sources.js)
  ctx: null,        // contextFor(view.setting)
  mapId: null,      // which of the setting's maps is showing
  overview: false,  // showing every realm at once
  level: 'codex',   // alliance | codex (see src/data/settings.js)
  levelChoice: null, // a level the viewer picked, which outlives a refresh
  regionTab: 'battle', // which tab a place's panel is showing: battle | lore
  hiddenFactions: new Set(), // switched off in the standings, so off the map too
  overviewMode: 'report',    // how every-map-at-once is drawn: report | pins
  at: 0,            // the day being shown; < view.today while replaying
  selected: null,   // setting-wide point index
  influence: null,
};

// --- derived data --------------------------------------------------------

const V = () => state.view;
const C = () => state.ctx;
const NODES = () => C().nodes;
const idx = id => C().nodeIndex.get(id);
const factionList = () => factionsFor(C().setting, state.level);
const faction = id => state.factionById?.get(id)
  ?? C().factionById.get(id)
  ?? { id, name: 'Unknown faction', color: '#8a8a8a' };
// An army records its army book; at the alliance level it counts as its side.
const factionOfArmy = armyFaction => C().setting.resolve(armyFaction, state.level);
const armyOf = armyFaction => C().setting.resolve(armyFaction, 'codex');
// Where an army took the field, for its line in the roster.
function mustered(p) {
  const point = p.start ? startPoint(C().setting, p.start) : null;
  const n = point == null ? null : NODES()[idx(point)];
  return n ? ` · mustered at ${esc(n.name)}` : '';
}

// Every seat the setting writes a faction as holding, mustered or not.
const claims = () => C().setting.starts.map(s => ({ faction: armyOf(s.of ?? s.id), point: s.point }));

// The grounds armies mustered from, other than their faction's own seat.
const footholds = () => activeArmies().map(p => ({
  faction: armyOf(p.faction),
  point: p.start ? startPoint(C().setting, p.start) : null,
})).filter(f => f.point);
function rebuildFactions() {
  state.factionById = new Map(factionList().map(f => [f.id, f]));
}
const current = () => C().graph.maps.get(state.mapId);
// The maps a campaign shows: its setting's, less any the organizer has hidden.
const mapsShown = () => {
  const on = V()?.maps;
  return on ? C().setting.maps.filter(m => on.includes(m.id)) : C().setting.maps;
};
const multiMap = () => mapsShown().length > 1;
const toGlobal = local => local + current().offset;
const onCurrentMap = i => NODES()[i].map === state.mapId;
const toLocal = i => i - current().offset;

const playerById = id => V().players.find(p => p.id === id);
const isToday = () => state.at >= V().today;
const sameDay = (a, b) => Math.floor(a) === Math.floor(b);
// A place can leave the map — a game dropped from the campaign, or one of the
// gamemaster's own places removed. The chronicle keeps those results, but
// nothing can be drawn at a place that is no longer there.
const onMap = r => idx(r.node) != null;
const confirmed = () => V().games.filter(g => g.status === 'confirmed' && onMap(g));
const gamesSoFar = () => confirmed().filter(g => g.day <= state.at);
const upcoming = () => (isToday() ? V().events.filter(onMap) : []);
const myArmies = () => (V().me ? V().players.filter(p => V().me.armyIds.has(p.id)) : []);
const isOrganizer = () => V().me?.role === 'organizer';
// One of the gamemaster's own places, rather than one the map came with.
const addedPlace = nodeId => (V().places ?? []).find(p => p.id === nodeId) ?? null;
const canAct = () => V().kind === 'demo' || myArmies().length > 0;

// Realmgates touching point i: [{ gate, other }] where other is the far end.
const gatesAt = i => C().graph.gates.filter(g => g.a === i || g.b === i).map(g => ({ gate: g, other: g.a === i ? g.b : g.a }));
const mapName = id => C().mapById.get(id).name;

function recompute() {
  const games = gamesSoFar().map(g => ({
    day: g.day,
    nodeIndex: idx(g.node),
    winnerFaction: armyOf(playerById(g.winner).faction),
    loserFaction: armyOf(playerById(g.loser).faction),
  }));
  const influence = computeInfluence({
    graph: C().graph, nodes: NODES(), factions: factionsFor(C().setting, 'codex'),
    games, at: state.at, footholds: footholds(), claims: claims(),
    decrees: (V().decrees ?? []).map(d => ({ faction: armyOf(d.faction), point: d.node, amount: d.amount })),
  });
  // Allegiance is the same influence with each army counted towards its side.
  state.influence = state.level === 'alliance'
    ? rollUp(influence, id => C().setting.allianceOf.get(id) ?? id)
    : influence;
}

function eventsByNode() {
  const m = new Map();
  for (const e of upcoming()) {
    if (!m.has(e.node)) m.set(e.node, []);
    m.get(e.node).push({ ...e, live: sameDay(e.day, V().today) });
  }
  return m;
}

function playerStats() {
  const games = gamesSoFar();
  return V().players.filter(p => !p.retired && p.joinedDay <= state.at).map(p => {
    const mine = games.filter(g => g.winner === p.id || g.loser === p.id);
    const wins = mine.filter(g => g.winner === p.id).length;
    const last = mine.length ? mine[mine.length - 1].day : null;
    let streak = 0;
    for (let i = mine.length - 1; i >= 0 && mine[i].winner === p.id; i--) streak++;
    const idleSince = last ?? p.joinedDay;
    return { ...p, wins, losses: mine.length - wins, last, streak, fading: state.at - idleSince > RULES.fadingDays };
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

function factionStats() {
  const factions = factionList();
  const held = new Map(factions.map(f => [f.id, 0]));
  state.influence.forEach(s => s.owner && held.set(s.owner, held.get(s.owner) + 1));
  const recent = new Map(factions.map(f => [f.id, 0]));
  for (const g of gamesSoFar()) if (state.at - g.day <= 14) {
    const f = factionOfArmy(playerById(g.winner).faction);
    if (recent.has(f)) recent.set(f, recent.get(f) + 1);
  }
  return factions.map(f => ({ ...f, held: held.get(f.id), recent: recent.get(f.id) }))
    .sort((a, b) => b.held - a.held || b.recent - a.recent);
}

// --- formatting ----------------------------------------------------------

const dateOf = day => new Date(dayToMs(V(), day));
const fmtDate = day => dateOf(day).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
function ago(day) {
  const d = Math.floor(state.at) - Math.floor(day);
  if (d < 0) return d === -1 ? 'tomorrow' : `in ${-d} days`;
  return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}
const swatch = f => `<span class="swatch" style="--c:${f.color}"></span>`;
const army = id => {
  const p = playerById(id);
  if (!p) return '<span class="muted">an unknown army</span>';
  return `<span class="army" style="--c:${faction(factionOfArmy(p.faction)).color}">${esc(p.army)}</span>`;
};
// A link to a point; names the realm too when it isn't the one on screen.
const place = i => {
  const n = NODES()[i];
  const where = multiMap() && n.map !== state.mapId ? ` <span class="muted">(${esc(mapName(n.map))})</span>` : '';
  return `<button class="link" data-node="${i}">${esc(n.name)}</button>${where}`;
};

function controlLine(s) {
  if (s.home) return `${swatch(faction(s.home))} Homeland of <b>${esc(faction(s.home).name)}</b>. Cannot fall.`;
  if (!s.owner) return '<span class="muted">Unclaimed. No one holds sway here.</span>';
  const f = faction(s.owner);
  if (s.contested) {
    const r = faction(s.rival);
    return `${swatch(f)}${swatch(r)} <b>Contested</b> between ${esc(f.name)} and ${esc(r.name)}`;
  }
  return `${swatch(f)} Held by <b>${esc(f.name)}</b>`;
}

function influenceBars(s, limit = 8) {
  const max = Math.max(30, ...s.ranked.map(r => r.value));
  return `<div class="bars">${s.ranked.slice(0, limit).map(r => {
    const f = faction(r.faction);
    return `<div class="bar"><span>${esc(f.name)}</span><i style="--c:${f.color};--w:${(100 * Math.min(r.value, max) / max).toFixed(1)}%"></i><b>${r.value >= 100 ? 'Home' : r.value.toFixed(0)}</b></div>`;
  }).join('') || '<p class="muted">No influence yet.</p>'}</div>`;
}

const statusTag = g => (g.status === 'pending' ? '<span class="tag wait">Awaiting confirmation</span>'
  : g.status === 'disputed' ? '<span class="tag fade">Disputed</span>' : '');
const gameLine = g => `<li>${army(g.winner)} defeated ${army(g.loser)} at ${place(idx(g.node))}
  <span class="muted">· ${ago(g.day)}</span> ${statusTag(g)}
  ${isOrganizer() ? `<button class="small ghost" data-void="${g.id}" title="Remove this result">Void</button>` : ''}</li>`;

function eventLine(e, withPlace = true) {
  const live = sameDay(e.day, V().today);
  const involved = V().kind === 'demo' || e.players.some(id => V().me?.armyIds.has(id));
  const canCancel = V().kind === 'campaign' && (involved || isOrganizer());
  return `<li class="${live ? 'live' : ''}">
    <span class="when">${live ? 'Tonight' : `${ago(e.day)} · ${fmtDate(e.day)}`}</span>
    ${army(e.players[0])} <span class="muted">vs</span> ${army(e.players[1])}${withPlace ? ` at ${place(idx(e.node))}` : ''}
    ${e.note ? `<div class="note">"${esc(e.note)}"</div>` : ''}
    ${involved ? `<button class="small" data-report-event="${e.id}">Report result</button>` : ''}
    ${canCancel ? `<button class="small ghost" data-cancel-event="${e.id}">Call off</button>` : ''}</li>`;
}

function gateLines(i) {
  const gates = gatesAt(i);
  if (!gates.length) return '';
  return `<h3>Realmgates</h3><ul class="gates">${gates.map(({ gate, other }) => {
    const s = state.influence[other];
    const f = s.owner && faction(s.owner);
    return `<li><span class="gate-name">⟁ ${esc(gate.name)}</span> leads to ${place(other)}
      <div class="sub">${f ? `${swatch(f)}${esc(f.name)} ${s.contested ? 'contest' : 'hold'} the far side` : 'The far side is unclaimed'}</div></li>`;
  }).join('')}</ul>`;
}

// --- panel ---------------------------------------------------------------

function campaignHeader() {
  const v = V();
  if (v.kind === 'demo' && STATIC) {
    return `<div class="callout">
      <b>This is a demo.</b> The players are a made-up store. Try reporting a result, issuing a challenge or
      replaying the timeline. Nothing you do here is saved.
      <p class="small muted">Accounts, join codes and real campaigns need the full app running on a server.</p>
    </div>`;
  }
  if (v.kind === 'demo') {
    return `<div class="callout">
      <b>This is a demo.</b> The players are a made-up store. Try reporting a result or replaying the timeline.
      Nothing you do here is saved.
      <div class="row"><button class="primary" data-act="create">Start your own campaign</button><button data-act="join">Join with a code</button></div>
    </div>`;
  }
  const link = location.origin + urlFor(`/c/${v.code}`);
  let cta = '';
  if (!state.session.user) {
    cta = `<div class="callout">Sign in to join this campaign and put your army on the map.
      <div class="row"><button class="primary" data-act="auth">Sign in or create an account</button></div></div>`;
  } else if (!v.me?.role) {
    cta = `<div class="callout">You're watching this campaign.
      <div class="row"><button class="primary" data-act="join-this">Join this campaign</button></div></div>`;
  } else if (!myArmies().length) {
    cta = `<div class="callout">Welcome! Muster an army to start fighting for territory.
      <div class="row"><button class="primary" data-act="muster">Muster an army</button></div></div>`;
  }
  return `<div class="joincode">Join code <b>${esc(v.code)}</b>
      <button class="small" data-copy="${esc(link)}">Copy invite link</button></div>${cta}`;
}

// How much faction detail is on screen. Anyone can flip between the levels:
// it only changes how the same games are counted up, so a Heresy player can
// see Loyalists against Traitors, then how their own Legion is faring.
function detailControl() {
  const v = V();
  const name = l => LEVEL_NAMES[l];
  const buttons = `<div class="levels">${LEVELS.map(l => `<button class="${l === state.level ? 'active' : ''}"
    data-level="${l}" title="${esc(LEVEL_HINTS[l])}">${esc(name(l))}</button>`).join('')}</div>`;
  if (v.kind === 'demo') return buttons;
  const season = v.seasonStartedAt ? new Date(v.seasonStartedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null;
  return `${buttons}
    <p class="muted small">Campaign plays at <b>${esc(name(v.level ?? 'codex'))}</b>${season ? ` · season began ${esc(season)}` : ''}${v.resetDays ? ` · new season every ${v.resetDays} days` : ''}
    ${isOrganizer() ? ' · <button class="link" data-act="settings">Settings</button>' : ''}</p>`;
}

function attention() {
  const v = V();
  if (v.frozen) return `<div class="callout frozen"><b>This campaign is frozen.</b> An organizer has paused it, so no results,
    challenges or musters can be recorded until it is thawed. The map and the chronicle are still here to read.</div>`;
  if (v.kind !== 'campaign' || !v.me?.role) return '';
  const me = v.me.userId;
  const items = [];
  for (const g of v.games) {
    const line = `${army(g.winner)} defeated ${army(g.loser)} at ${place(idx(g.node))} <span class="muted">· ${ago(g.day)}</span>`;
    if (g.status === 'pending' && g.confirmer === me) {
      items.push(`<li>${line}<div class="row"><button class="small primary" data-confirm="${g.id}">Confirm</button>
        <button class="small" data-dispute="${g.id}">That's not what happened</button></div></li>`);
    } else if (g.status === 'pending' && g.reportedBy === me) {
      items.push(`<li>${line}<div class="sub">Waiting for your opponent to confirm. Confirms automatically after ${v.autoConfirmHours} hours.</div>
        <div class="row"><button class="small ghost" data-withdraw="${g.id}">Withdraw</button></div></li>`);
    } else if (isOrganizer() && (g.status === 'disputed' || (g.status === 'pending' && g.confirmer == null))) {
      items.push(`<li>${line} ${statusTag(g)}<div class="row"><button class="small primary" data-confirm="${g.id}">Confirm result</button>
        <button class="small" data-void="${g.id}">Void</button></div></li>`);
    }
  }
  return items.length ? `<h3>Needs attention</h3><ul class="events attention">${items.join('')}</ul>` : '';
}

function yourArmies() {
  const v = V();
  if (v.kind !== 'campaign' || !v.me?.role) return '';
  const mine = myArmies();
  return `<h3>Your armies</h3>
    ${mine.length ? `<ul class="players">${mine.map(p => `<li>${army(p.id)} <span class="muted">${esc(faction(p.faction).name)}</span>
      <button class="small ghost" data-retire="${p.id}" title="Retire this army and start fresh">Retire</button></li>`).join('')}</ul>` : ''}
    <div class="row"><button class="small" data-act="muster">＋ Muster ${mine.length ? 'another' : 'an'} army</button></div>`;
}

function renderPanel() {
  const panel = $('#panel');
  $('#sheet-title').textContent = state.selected != null ? NODES()[state.selected].name : V().name;
  if (state.selected != null) return renderRegion(panel, state.selected);

  const v = V();
  const factions = factionStats();
  const maxHeld = Math.max(1, ...factions.map(f => f.held));
  const players = playerStats();
  const events = upcoming().slice().sort((a, b) => a.day - b.day);
  const recent = v.games.filter(g => g.day <= state.at && (g.status === 'confirmed' || isToday())).slice(-8).reverse();

  panel.innerHTML = `
    <h2>${esc(v.name)}</h2>
    <p class="muted">${esc(C().setting.name)} · ${fmtDate(Math.floor(state.at))}${isToday() ? '' : ' · <b class="replay">Replaying history</b>'}</p>
    ${campaignHeader()}
    ${detailControl()}
    ${attention()}
    ${yourArmies()}

    <h3>Factions</h3>
    <ol class="factions">${factions.map(f => `
      <li class="${state.hiddenFactions.has(f.id) ? 'off' : ''}">
        <button class="swatch" data-show-faction="${esc(f.id)}" style="--c:${f.color}"
          aria-pressed="${!state.hiddenFactions.has(f.id)}"
          title="${state.hiddenFactions.has(f.id) ? 'Show' : 'Hide'} ${esc(f.name)} on the map"></button><span class="name">${esc(f.name)}${f.recent >= 4 ? ' <span class="tag hot" title="4+ wins in the last two weeks">Rising</span>' : ''}</span>
        <span class="held" title="Regions held">${f.held}</span>
        <i class="meter" style="--c:${f.color};--w:${(100 * f.held / maxHeld).toFixed(0)}%"></i>
      </li>`).join('')}</ol>

    <h3>Warriors</h3>
    ${players.length ? `<ul class="players">${players.map(p => `
      <li>${army(p.id)} <span class="muted">${esc(p.name)}</span>
        <span class="record">${p.wins}–${p.losses}</span>
        <div class="sub">${p.last == null ? 'No battles yet' : `Last battle ${ago(p.last)}`}${mustered(p)}
          ${p.streak >= 3 ? `<span class="tag hot">${p.streak} win streak</span>` : ''}
          ${p.fading ? '<span class="tag fade">Influence fading</span>' : ''}</div>
      </li>`).join('')}</ul>` : '<p class="muted">No armies have mustered yet.</p>'}

    ${events.length ? `<h3>Battles on the horizon</h3><ul class="events">${events.map(e => eventLine(e)).join('')}</ul>` : ''}

    <h3>The Chronicle</h3>
    ${recent.length ? `<ul class="chronicle">${recent.map(gameLine).join('')}</ul>`
      : '<p class="muted">No battles fought yet. Issue a challenge and write the first page.</p>'}`;
}

// What a gamemaster has put on this place by hand, and how to take it off.
function decreeLines(i) {
  const here = (V().decrees ?? []).filter(d => d.node === NODES()[i].id);
  if (!here.length) return '';
  return `<h3>By decree</h3><ul class="chronicle">${here.map(d => {
    const f = faction(C().setting.resolve(d.faction, state.level));
    return `<li><span class="army" style="--c:${f.color}">${esc(f.name)}</span>
      ${d.amount > 0 ? 'granted' : 'stripped of'} <b>${Math.abs(d.amount)}</b> influence${d.reason ? ` · ${esc(d.reason)}` : ''}
      ${isOrganizer() ? ` <button class="small ghost" data-undecree="${d.id}">Revoke</button>` : ''}</li>`;
  }).join('')}</ul>`;
}

function openDecree(i) {
  const n = NODES()[i];
  const list = factionsFor(C().setting, 'codex');
  openModal(`
    <h2>Decree at ${esc(n.name)}</h2>
    <p class="muted">A gamemaster's hand on the map: an invasion, a landing, a WAAAGH!, or a correction.
      It sits outside the record of games and holds until it is revoked.</p>
    <label>Whose influence<select name="faction" required>${list.map(f =>
      `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('')}</select></label>
    <label>How much<input name="amount" type="number" required value="20" min="-200" max="200" step="1">
      <span class="hint">Positive grants it, negative strips it. A hard-won battle is worth about 10.</span></label>
    <label>Reason <span class="muted">(optional)</span><input name="reason" maxlength="80" placeholder="A Chaos invasion out of the north"></label>
    ${cancelRow('Decree it')}`,
  async data => {
    await campaignCall('POST', '/decrees', {
      setting: V().setting, node: n.id, faction: data.get('faction'),
      amount: Number(data.get('amount')), reason: data.get('reason'),
    });
    toast(`Decreed at <b>${esc(n.name)}</b>.`);
  });
}

const KINDS = [
  ['settlement', 'Settlement'], ['town', 'Town'], ['city', 'City'], ['hive', 'Hive'],
  ['stronghold', 'Stronghold'], ['fortress', 'Fortress'], ['castle', 'Castle'], ['port', 'Port'],
  ['temple', 'Temple'], ['forge', 'Forge'], ['plant', 'Plant'], ['mine', 'Mine'],
  ['camp', 'Camp'], ['warren', 'Warren'], ['glade', 'Glade'], ['ruin', 'Ruin'],
  ['site', 'Site'], ['wilds', 'Wilds'], ['region', 'Region'],
];

// A place of the gamemaster's own. The shipped maps cannot itemise a hive city
// or an ash waste, so a campaign adds the ground it actually fights over.
function openPlace(where, existing) {
  const map = state.ctx.mapById.get(state.mapId);
  openModal(`
    <h2>${existing ? `Edit ${esc(existing.name)}` : 'A place of your own'}</h2>
    <p class="muted">${existing ? 'Yours to change or remove.'
      : `On ${esc(map.name)}, at ${Math.round(where.x)}, ${Math.round(where.y)}. It joins the map like any other place:
         it can be fought over, held and contested.`}</p>
    <label>Name<input name="name" required maxlength="60" autocomplete="off"
      value="${esc(existing?.name ?? '')}" placeholder="The Sunken Dome"></label>
    <label>What sort of place<select name="kind">${KINDS.map(([id, name]) =>
      `<option value="${id}"${(existing?.kind ?? 'settlement') === id ? ' selected' : ''}>${name}</option>`).join('')}</select></label>
    <label>Region <span class="muted">(optional)</span><input name="region" maxlength="60"
      value="${esc(existing?.region ?? '')}" placeholder="The Underhive"></label>
    <label>Lore <span class="muted">(optional)</span><textarea name="lore" rows="4" maxlength="2000"
      placeholder="What it is, and why anyone would fight over it.">${esc(existing?.lore ?? '')}</textarea></label>
    ${cancelRow(existing ? 'Save it' : 'Put it on the map')}`,
  async data => {
    const body = {
      setting: V().setting, map: existing?.map ?? state.mapId,
      name: data.get('name'), kind: data.get('kind'),
      region: data.get('region'), lore: data.get('lore'),
      x: existing ? existing.x : Math.round(where.x), y: existing ? existing.y : Math.round(where.y),
    };
    if (existing) await campaignCall('PATCH', `/places/${existing.placeId}`, body);
    else await campaignCall('POST', '/places', body);
    toast(`<b>${esc(data.get('name'))}</b> is on the map.`);
  });
}

// Waiting for the gamemaster to say where. The next click on the map is the spot.
function placeHere() {
  state.placing = true;
  $('#viewport').classList.add('placing');
  toast('Click the map where the place goes. Press Escape to stop.');
}

function stopPlacing() {
  state.placing = false;
  $('#viewport').classList.remove('placing');
}

function renderRegion(panel, i) {
  const n = NODES()[i];
  const s = state.influence[i];
  const events = upcoming().filter(e => e.node === n.id);
  const history = gamesSoFar().filter(g => g.node === n.id).slice(-8).reverse();
  const lore = loreOf(n.id);
  const tab = state.regionTab;
  const battle = `
    <h3>Influence</h3>
    ${influenceBars(s)}
    ${isToday() && !V().frozen ? `<div class="row">
      <button data-challenge="${i}">⚔ Challenge for ${esc(n.name)}</button>
      <button class="primary" data-report="${i}">Report a result here</button></div>` : ''}
    ${isOrganizer() ? `<div class="row"><button class="small ghost" data-decree="${i}">Decree influence here</button>
      ${addedPlace(n.id) ? `<button class="small ghost" data-edit-place="${esc(n.id)}">Edit this place</button>
        <button class="small ghost" data-remove-place="${esc(n.id)}">Remove it</button>` : ''}</div>` : ''}
    ${decreeLines(i)}
    ${gateLines(i)}
    ${events.length ? `<h3>Battles here</h3><ul class="events">${events.map(e => eventLine(e, false)).join('')}</ul>` : ''}
    <h3>Battles fought here</h3>
    ${history.length ? `<ul class="chronicle">${history.map(gameLine).join('')}</ul>` : '<p class="muted">No blood has been spilled here. Yet.</p>'}`;
  panel.innerHTML = `
    <button class="link back" id="panel-back">← ${esc(V().name)}</button>
    <h2>${esc(n.name)}</h2>
    <p class="muted">${esc(multiMap() ? `${mapName(n.map)} · ${C().mapById.get(n.map).title ?? ''}` : n.region)}</p>
    <p class="control">${controlLine(s)}</p>
    <div class="tabs">
      <button type="button" class="tab ${tab === 'battle' ? 'active' : ''}" data-region-tab="battle">Battle report</button>
      <button type="button" class="tab ${tab === 'lore' ? 'active' : ''}" data-region-tab="lore">Lore</button>
      <button type="button" class="link place-link" data-copy="${esc(linkToPlace(i))}" title="Copy a link that opens this place">Copy link</button>
    </div>
    ${tab === 'lore'
      ? `<div class="lore">${lore
          ? lore.split(PARAGRAPH).map(para => `<p>${esc(para)}</p>`).join('')
          : `<p class="muted">No lore written for ${esc(n.name)} yet.</p>`}</div>`
      : battle}`;
}


// --- tooltip ---------------------------------------------------------------

// Only rebuild the tooltip when the pointer reaches a different region; otherwise just move it.
let tipFor = null;
function showTooltip(i, e) {
  const tip = $('#tooltip');
  if (i == null || !state.influence) { tip.hidden = true; tipFor = null; return; }
  if (i === tipFor && !tip.hidden) return placeTooltip(tip, e);
  tipFor = i;
  const n = NODES()[i];
  const s = state.influence[i];
  const last = gamesSoFar().filter(g => g.node === n.id).at(-1);
  const count = upcoming().filter(ev => ev.node === n.id).length;
  const gates = gatesAt(i);
  tip.innerHTML = `
    <b>${esc(n.name)}</b> <span class="muted">${esc(multiMap() ? mapName(n.map) : n.region)}</span>
    <p class="control">${controlLine(s)}</p>
    ${influenceBars(s, 3)}
    ${gates.map(({ gate, other }) => `<p class="small gate-name">⟁ ${esc(gate.name)} to ${esc(NODES()[other].name)} (${esc(mapName(NODES()[other].map))})</p>`).join('')}
    ${last ? `<p class="small">Last battle: ${army(last.winner)} beat ${army(last.loser)}, ${ago(last.day)}</p>` : ''}
    ${count ? `<p class="small live">⚔ ${count} battle${count > 1 ? 's' : ''} scheduled</p>` : ''}
    <p class="hint">Click to zoom in</p>`;
  tip.hidden = false;
  placeTooltip(tip, e);
}

function placeTooltip(tip, e) {
  const r = $('#viewport').getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  tip.style.left = `${Math.max(8, Math.min(x + 18, r.width - tip.offsetWidth - 8))}px`;
  tip.style.top = `${Math.max(8, Math.min(y + 18, r.height - tip.offsetHeight - 8))}px`;
}

// --- realms: tab bar and the all-realms overview ---------------------------

function realmStats(mapId) {
  const { offset, map } = C().graph.maps.get(mapId);
  const held = new Map();
  for (let i = offset; i < offset + map.nodes.length; i++) {
    const o = state.influence[i].owner;
    if (o) held.set(o, (held.get(o) || 0) + 1);
  }
  const battles = upcoming().filter(e => NODES()[idx(e.node)].map === mapId).length;
  return { held: [...held].sort((a, b) => b[1] - a[1]), total: map.nodes.length, battles };
}

function renderRealmBar() {
  // Adding places is a gamemaster's business, and only on a real map.
  const add = $('#add-place');
  add.hidden = !(V().kind === 'campaign' && isOrganizer() && !state.overview);
  if (add.hidden && state.placing) stopPlacing();
  add.setAttribute('aria-pressed', String(!!state.placing));
  add.classList.toggle('on', !!state.placing);
  const bar = $('#realm-bar');
  bar.hidden = !multiMap();
  if (!multiMap()) return;
  bar.innerHTML = `<button class="${state.overview ? 'active' : ''}" data-realm="__all">All realms</button>${mapsShown().map(m => {
    const { held, battles } = realmStats(m.id);
    const lead = held[0] && faction(held[0][0]);
    return `<button class="${!state.overview && m.id === state.mapId ? 'active' : ''}" data-realm="${m.id}">
      ${lead ? `<span class="swatch" style="--c:${lead.color}"></span>` : ''}${esc(m.name)}${battles ? ` <span class="bb">⚔${battles}</span>` : ''}</button>`;
  }).join('')}`;
}

// Realms sit on a ring around the hub (the realm with the most gates), joined by their realmgates.
function renderOverview() {
  const box = $('#realms-overview');
  // The cosmology map sits behind the realm cards. Set here rather than in
  // the stylesheet, which has no idea what the app is served from.
  $('#viewport').style.setProperty('--realms-art',
    C().setting.id === 'mortal-realms' ? `url('${asset('/maps/realms/mortal-realms.jpg')}')` : 'none');
  $('#viewport').classList.toggle('overview', state.overview);
  box.hidden = !state.overview;
  if (!state.overview) return;
  const maps = mapsShown();
  const gateCount = id => C().graph.gates.filter(g => NODES()[g.a].map === id || NODES()[g.b].map === id).length;
  const hub = maps.reduce((best, m) => (gateCount(m.id) > gateCount(best.id) ? m : best), maps[0]);
  const ring = maps.filter(m => m !== hub);
  // The overview covers the whole map; the ring sits below the realm tab bar,
  // which wraps to several rows on a phone.
  const { width: W, height: H } = box.getBoundingClientRect();
  const top = $('#realm-bar').offsetTop + $('#realm-bar').offsetHeight + 8;

  // One line per pair of realms; coloured when a single faction holds both ends of every gate on it.
  const pairs = new Map();
  for (const g of C().graph.gates) {
    const [ma, mb] = [NODES()[g.a].map, NODES()[g.b].map];
    const key = [ma, mb].sort().join('|');
    if (!pairs.has(key)) pairs.set(key, { ma, mb, gates: [] });
    pairs.get(key).gates.push(g);
  }

  // Where the cards sit on real art, they are markers on a map rather than a
  // diagram of one.
  const onArt = !!(C().setting.overview.spots && C().setting.overview.art);
  const render = cardW => {
    const cardH = cardW >= 140 ? cardW * 0.72 : cardW * 0.6;
    const cy = top + (H - top) / 2;
    const rx = Math.max(0, W / 2 - cardW / 2 - 10), ry = Math.max(0, (H - top) / 2 - cardH / 2 - 10);
    const pos = new Map([[hub.id, [W / 2, cy]]]);
    ring.forEach((m, k) => {
      const a = -Math.PI / 2 + (k / ring.length) * Math.PI * 2;
      pos.set(m.id, [W / 2 + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    });
    // Where the setting says a map belongs on the overview art, put it there:
    // the cosmology already draws each realm, so a realm's card should sit on
    // its own sigil rather than at some point on an invented ring.
    const { spots, art } = C().setting.overview;
    if (spots && art) {
      const [iw, ih] = art;
      const s = Math.min(W / iw, H / ih);          // the art is drawn `contain`
      const dw = iw * s, dh = ih * s;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;
      for (const m of maps) {
        const spot = spots[m.id];
        if (spot) pos.set(m.id, [dx + spot[0] * dw, dy + spot[1] * dh]);
      }
    }
    const lines = [...pairs.values()].map(({ ma, mb, gates }) => {
      const owners = new Set(gates.flatMap(g => [state.influence[g.a].owner, state.influence[g.b].owner]));
      const holder = owners.size === 1 && [...owners][0] ? faction([...owners][0]) : null;
      const [x1, y1] = pos.get(ma), [x2, y2] = pos.get(mb);
      const title = gates.map(g => `${g.name}: ${NODES()[g.a].name} ↔ ${NODES()[g.b].name}`).join('\n');
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="${holder ? `stroke:${holder.color}` : ''}"
        class="${holder ? 'held' : ''}" stroke-width="${1.5 + gates.length}"><title>${esc(title)}${holder ? `\nHeld by ${esc(holder.name)}` : ''}</title></line>`;
    }).join('');
    box.style.setProperty('--card-w', `${cardW}px`);
    box.classList.toggle('compact', cardW < 140);
    box.classList.toggle('on-art', onArt);
    const pins = state.overviewMode === 'pins';
    box.classList.toggle('pins', pins);
    const modes = `<div class="overview-modes" style="top:${top}px">
      <button data-overview-mode="report" class="${pins ? '' : 'on'}" aria-pressed="${!pins}">Report</button>
      <button data-overview-mode="pins" class="${pins ? 'on' : ''}" aria-pressed="${pins}">Places</button>
    </div>`;
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="gate-lines">${lines}</svg>${modes}
      ${maps.map(m => {
        const [x, y] = pos.get(m.id);
        const { held, total, battles } = realmStats(m.id);
        const claimed = held.reduce((s, [, n]) => s + n, 0);
        if (pins) {
          const lead = held[0] && faction(held[0][0]);
          return `<button class="realm-pin${m === hub ? ' hub' : ''}" data-realm="${m.id}" style="left:${x}px;top:${y}px"
            title="${esc(m.name)}${lead ? ` — ${esc(lead.name)} lead` : ' — unclaimed'}${battles ? ` · ${battles} battle${battles > 1 ? 's' : ''} tonight` : ''}">
            <span class="dot" style="--c:${lead ? lead.color : '#d9ccb0'}"></span>
            <span class="name">${esc(m.name)}</span>${battles ? `<span class="bb">⚔${battles}</span>` : ''}</button>`;
        }
        return `<button class="realm-card${m === hub ? ' hub' : ''}" data-realm="${m.id}" style="left:${x}px;top:${y}px">
          <span class="thumb" style="background-image:url('${asset(m.image)}')"></span>
          <span class="name">${esc(m.name)}</span>
          <span class="title">${esc(m.title ?? '')}</span>
          <span class="control-bar">${held.map(([f, n]) => `<i style="--c:${faction(f).color};flex:${n}" title="${esc(faction(f).name)}: ${n}"></i>`).join('')}<i class="unclaimed" style="flex:${total - claimed}"></i></span>
          <span class="meta">${held[0] ? `${esc(faction(held[0][0]).name)} lead` : 'Unclaimed'}${battles ? ` · ⚔${battles}` : ''}</span>
        </button>`;
      }).join('')}`;
  };

  // Lay out, then measure: shrink the cards until none overlap or spill past the bar.
  const overlaps = () => {
    const r = [...box.querySelectorAll('.realm-card')].map(c => c.getBoundingClientRect());
    const boxTop = box.getBoundingClientRect().top + top - 4;
    if (r.some(c => c.top < boxTop)) return true;
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      const a = r[i], b = r[j];
      if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) return true;
    }
    return false;
  };
  // Where the cards sit on real art, they are markers on a map and should not
  // bury it: small enough that the realms are still visible behind them.
  let cardW = onArt ? Math.max(62, Math.min(124, W / 9))
                    : Math.max(80, Math.min(190, W / 5.2));
  render(cardW);
  // Places mode is already as small as it gets; only the report cards shrink.
  if (state.overviewMode !== 'pins') {
    for (let tries = 0; tries < 8 && overlaps() && cardW > (onArt ? 46 : 56); tries++) render(cardW *= 0.9);
  }
}

// Put one of the setting's maps under the camera (no redraw).
function loadMap(mapId) {
  if (mapId === state.mapId) return;
  state.mapId = mapId;
  const cur = current();
  const gates = C().graph.gates.flatMap(g => {
    const out = [];
    for (const [here, there] of [[g.a, g.b], [g.b, g.a]]) {
      if (NODES()[here].map !== mapId) continue;
      const far = NODES()[there];
      out.push({ local: here - cur.offset, label: mapName(far.map), title: `${g.name} to ${far.name}`, to: there });
    }
    return out;
  });
  state.gateTargets = gates.map(g => g.to);
  mapView.load(cur.map, cur.graph, factionList(), gates);
}

function showMap(mapId) {
  state.overview = false;
  loadMap(mapId);
  draw();
}

function showOverview() {
  if (state.selected != null) select(null);
  state.overview = true;
  draw();
}

// --- drawing ---------------------------------------------------------------

// On a phone the panel is a sheet over the map with three positions: just the
// handle, half open, or nearly full. Drag it or tap the handle.
const SHEET_STOPS = { peek: 'calc(100% - 46px)', half: '45%', full: '0px' };
function setSheet(stop) {
  const sheet = $('#sheet');
  state.sheet = stop;
  sheet.style.setProperty('--sheet-y', SHEET_STOPS[stop]);
  sheet.classList.toggle('open', stop !== 'peek');
  document.body.classList.toggle('sheet-open', stop !== 'peek');
  if (stop !== 'peek') $('#peek').hidden = true;
}

function bindSheet() {
  const sheet = $('#sheet');
  const handle = $('#sheet-handle');
  let drag = null;
  const height = () => sheet.getBoundingClientRect().height;
  handle.addEventListener('pointerdown', e => {
    try { handle.setPointerCapture(e.pointerId); } catch { /* not a real pointer */ }
    const offsets = { peek: height() - 46, half: height() * 0.45, full: 0 };
    drag = { y: e.clientY, from: offsets[state.sheet] ?? offsets.peek, moved: false };
    sheet.classList.add('dragging');
  });
  handle.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) < 5) return;
    drag.moved = true;
    sheet.style.setProperty('--sheet-y', `${Math.max(0, Math.min(height() - 46, drag.from + dy))}px`);
  });
  const end = () => {
    if (!drag) return;
    sheet.classList.remove('dragging');
    if (!drag.moved) {
      setSheet(state.sheet === 'peek' ? 'half' : state.sheet === 'half' ? 'full' : 'peek');
    } else {
      const y = parseFloat(getComputedStyle(sheet).getPropertyValue('--sheet-y'));
      const stops = [['full', 0], ['half', height() * 0.45], ['peek', height() - 46]];
      setSheet(stops.sort((a, b) => Math.abs(a[1] - y) - Math.abs(b[1] - y))[0][0]);
    }
    drag = null;
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  setSheet('peek');
}

// Phones have no hover, so a tapped region's quick stats and battles show here.
const narrow = () => matchMedia('(max-width: 900px)').matches;
function showPeek(i) {
  const peek = $('#peek');
  if (i == null || !narrow()) { peek.hidden = true; return; }
  const n = NODES()[i];
  const s = state.influence[i];
  const events = upcoming().filter(e => e.node === n.id).sort((a, b) => a.day - b.day);
  const last = gamesSoFar().filter(g => g.node === n.id).at(-1);
  peek.innerHTML = `
    <div class="head"><b>${esc(n.name)}</b> <span class="muted">${esc(multiMap() ? mapName(n.map) : n.region)}</span>
      <button class="ghost close" data-peek-close aria-label="Close">×</button></div>
    <p class="control">${controlLine(s)}</p>
    ${influenceBars(s, 3)}
    ${events.length ? `<ul>${events.map(e => `<li class="${sameDay(e.day, V().today) ? 'live' : ''}">
      <span class="when">${sameDay(e.day, V().today) ? 'Tonight' : esc(ago(e.day))}</span>
      ${army(e.players[0])} <span class="muted">vs</span> ${army(e.players[1])}</li>`).join('')}</ul>`
      : last ? `<p class="small">Last battle: ${army(last.winner)} beat ${army(last.loser)}, ${ago(last.day)}</p>` : ''}
    <div class="row"><button class="small primary" data-peek-details>Details ↓</button>
      ${isToday() ? `<button class="small" data-challenge="${i}">⚔ Challenge</button>` : ''}</div>`;
  peek.hidden = false;
}

function select(i) {
  if (i != null && i !== state.selected) {
    const n = NODES()[i];
    const owner = state.influence?.[i]?.owner;
    const alliance = owner ? (C().setting.allianceOf.get(C().setting.resolve(owner, 'codex')) ?? '') : '';
    sfx(soundForPlace({
      kind: n.kind,
      alliance: alliance.replace(/^aos-|^ow-|^hh-|^li-/, ''),
      hasEvents: upcoming().some(e => e.node === n.id),
    }));
  }
  // The tab you are reading stays put as you move from place to place: if you
  // are reading lore, the next place opens on its lore.
  state.selected = i;
  syncPlaceUrl(i);
  $('#tooltip').hidden = true;
  showPeek(i);
  if (i == null) {
    mapView.unfocus();
    $('#back-btn').hidden = true;
  } else {
    if (state.overview || !onCurrentMap(i)) showMap(NODES()[i].map);
    mapView.focusOn(toLocal(i));
    $('#back-btn').hidden = false;
  }
  renderPanel();
}

// A faction switched off in the standings comes off the map. The standings
// themselves still count it — you are hiding it to see past it, not pretending
// it lost. A place whose holder is hidden reads as unclaimed.
function asShown(s) {
  if (!state.hiddenFactions.size) return s;
  const ownerGone = s.owner && state.hiddenFactions.has(s.owner);
  const rivalGone = s.rival && state.hiddenFactions.has(s.rival);
  if (!ownerGone && !rivalGone) return s;
  if (ownerGone) return { ...s, owner: null, rival: null, contested: false, home: false, strength: 0 };
  return { ...s, rival: null, contested: false };
}

function draw() {
  recompute();
  tipFor = null; // the numbers may have changed; rebuild the tooltip on the next move
  const cur = current();
  mapView.render(state.influence.slice(cur.offset, cur.offset + cur.map.nodes.length).map(asShown), eventsByNode());
  renderRealmBar();
  renderOverview();
  renderPanel();
  showPeek(state.overview ? null : state.selected);
  const max = Math.max(1, Math.ceil(V().today));
  const scrub = $('#scrub');
  scrub.max = max;
  scrub.value = isToday() ? max : Math.floor(state.at);
  $('#date-label').textContent = fmtDate(Math.floor(state.at));
  document.body.classList.toggle('replaying', !isToday());
}

function renderTopbar() {
  const v = V();
  const user = state.session.user;
  $('#btn-account').textContent = user ? user.displayName : 'Sign in';
  $('#btn-account').hidden = STATIC;
  const mine = state.session.campaigns;
  const currentValue = v.kind === 'campaign' ? v.code : 'demo';
  // The demo is for people who have not signed in yet. Once you are signed in
  // it is not on offer at all — only listed while you are actually looking at
  // one, so the dropdown still says where you are.
  const showDemo = !state.session.user || V().kind === 'demo';
  const options = [
    ...(showDemo ? [['demo', 'Demo Campaign']] : []),
    ...mine.map(c => [c.code, c.name]),
    ...(v.kind === 'campaign' && !mine.some(c => c.code === v.code) ? [[v.code, v.name]] : []),
  ];
  $('#campaign-select').innerHTML = `${options.map(([val, label]) =>
    `<option value="${esc(val)}" ${val === currentValue ? 'selected' : ''}>${esc(label)}</option>`).join('')}
    ${STATIC ? '' : '<option value="__join">Join with a code…</option><option value="__create">＋ Start a new campaign…</option>'}`;
  // Demos can switch setting; a real campaign is played in the one it was made for.
  // In a campaign the games it spans come first; the rest open as demos to browse.
  const picker = $('#setting-select');
  const opt = st => `<option value="${esc(st.id)}" ${st.id === v.setting ? 'selected' : ''}>${esc(st.name)}</option>`;
  const all = Object.values(SETTINGS);
  const browsing = !state.session.user;   // signed in, you play; signed out, you look around
  // Warhammer and everything else are ruled apart rather than run together.
  const byFamily = list => [...new Set(list.map(st => familyOf(st.id)))]
    .map(fam => `<optgroup label="${esc(fam)}">${list.filter(st => familyOf(st.id) === fam).map(opt).join('')}</optgroup>`)
    .join('');
  picker.innerHTML = v.kind === 'campaign'
    ? `<optgroup label="${esc(v.name)}">${all.filter(st => v.settings.includes(st.id)).map(opt).join('')}</optgroup>
       ${browsing ? byFamily(all.filter(st => !v.settings.includes(st.id))) : ''}`
    : byFamily(all);
  picker.disabled = false;
  picker.title = v.kind === 'campaign' ? 'Switch between this campaign’s games' : 'Choose a setting';
  document.title = v.kind === 'demo' ? 'Chronicle of Conquest' : `${v.name} · Chronicle of Conquest`;
}

function toast(html) {
  const t = $('#toast');
  t.innerHTML = html;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
}

// Announce what a newly-counted result did to the map.
function announce(before, g) {
  const i = idx(g.node);
  const wf = faction(playerById(g.winner).faction);
  const flipped = state.influence.map((s, j) => (s.owner !== before[j] && s.owner === wf.id ? j : -1)).filter(j => j >= 0);
  if (!state.overview && onCurrentMap(i)) mapView.pulse(toLocal(i));
  toast(flipped.length
    ? `${army(g.winner)} seize ${flipped.map(j => `<b>${esc(NODES()[j].name)}</b>`).join(', ')} for ${esc(wf.name)}!`
    : `${army(g.winner)} win at <b>${esc(NODES()[i].name)}</b>. ${esc(wf.name)}'s influence grows.`);
}

// --- loading & navigation -----------------------------------------------

async function refreshSession() {
  let s = {};
  if (!STATIC) try { s = await api('GET', '/me'); } catch { /* offline or no server: behave as signed out */ }
  state.session = { user: s.user ?? null, campaigns: Array.isArray(s.campaigns) ? s.campaigns : [] };
}

// Flipping between levels is a lens on the same chronicle, never a change to
// it, so a player may do it in a campaign without touching what the organizer set.
function setLevel(level) {
  if (!LEVELS.includes(level) || level === state.level) return;
  state.level = level;
  state.levelChoice = level;
  if (V().kind === 'demo') V().level = level;
  rebuildFactions();
  mapView.setFactions(factionList());
  draw();
}

function setView(view, { keepDay = false } = {}) {
  const wasToday = !state.view || isToday();
  const settingChanged = state.view?.setting !== view.setting;
  // A gamemaster adding or moving a place changes the map itself.
  const placesChanged = placesKey(state.view?.places) !== placesKey(view.places);
  state.view = view;
  if (settingChanged) state.levelChoice = null;
  const wanted = state.levelChoice ?? view.level ?? 'codex';
  const levelChanged = state.level !== wanted;
  state.level = wanted;
  if (settingChanged || levelChanged || placesChanged) {
    if (settingChanged || placesChanged) state.ctx = contextFor(view.setting, view.places);
    rebuildFactions();
  }
  if (settingChanged) {
    state.mapId = null;
    loadMap(mapsShown()[0].id);
    // A setting with many maps opens on the overview; one with a main map and
    // an outlying region or two opens on the main map, where the campaign is.
    state.overview = mapsShown().length > 3;
  }
  if (!keepDay || wasToday) state.at = view.today;
  else state.at = Math.min(state.at, view.today);
  if (levelChanged && !settingChanged && state.mapId) mapView.setFactions(factionList());
  renderTopbar();
  draw();
}

async function loadCampaign(code, opts) {
  const payload = await api('GET', `/campaigns/${encodeURIComponent(code)}`);
  setView(campaignView(payload), opts);
  return payload;
}

const demoFor = id => { const ctx = contextFor(id); return demoView(ctx.setting, ctx.graph); };
// Lore for a place: the setting's own, or what the gamemaster wrote for one
// of theirs.
const loreOf = nodeId => loreFor(V().setting, nodeId) ?? state.ctx?.addedLore?.get(nodeId) ?? null;

async function route() {
  stopPlayback();
  if (state.selected != null) select(null);
  const path = appPath();
  if (path === '/about' || path === '/about/') return showAbout(true);
  showAbout(false);
  // A link can name a place, so one can be sent to whoever you are fighting:
  //   /demo/<setting>/<place>   /c/<code>/<place>   /c/<code>/<game>/<place>
  const demo = path.match(/^\/demo\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?$/);
  if (demo && SETTINGS[demo[1]]) {
    setView(demoFor(demo[1]));
    return selectById(demo[2]);
  }
  const m = path.match(/^\/c\/([A-Za-z0-9-]{6,7})(?:\/([a-z0-9-]+))?(?:\/([a-z0-9-]+))?\/?$/);
  if (!m) {
    // Signed in with a campaign of your own, the front door is that campaign.
    // It used to be the demo, which is how signed-in players kept ending up in
    // a made-up store they never asked for.
    const mine = state.session.campaigns;
    if (state.session.user && mine.length) return loadCampaign(mine[0].code);
    return setView(demoFor('old-world'));
  }
  if (STATIC) {
    history.replaceState(null, '', urlFor('/'));
    setView(demoFor('old-world'));
    return toast('Campaigns need the full app running on a server. This site is the demo.');
  }
  try {
    const payload = await loadCampaign(m[1]);
    // The second part is a game of this campaign when it names one, else a place.
    const settings = payload.campaign.settings ?? [payload.campaign.setting];
    if (m[2] && settings.includes(m[2])) {
      if (m[2] !== V().setting) setView(campaignView(payload, m[2]), { keepDay: true });
      selectById(m[3]);
    } else {
      selectById(m[2]);
    }
  } catch (e) {
    history.replaceState(null, '', urlFor('/'));
    setView(demoFor('old-world'));
    toast(esc(e.message));
  }
}

// Keep the address bar on the place being looked at, so a copied URL works.
function syncPlaceUrl(i) {
  if (STATIC && V()?.kind === 'campaign') return;
  const want = i == null
    ? (V().kind === 'demo' ? (V().setting === 'old-world' ? '/' : `/demo/${V().setting}`)
                           : (V().settings?.length > 1 ? `/c/${V().code}/${V().setting}` : `/c/${V().code}`))
    : linkToPlace(i).slice(location.origin.length + BASE.length - 1);
  if (appPath() !== want) history.replaceState(null, '', urlFor(want));
}

// Open a place named in a link, once its setting is loaded.
function selectById(id) {
  if (!id) return;
  const i = C().nodeIndex.get(id);
  if (i == null) return toast('That place is not on this map.');
  select(i);
}

// The link to the place being looked at, for sending to an opponent.
function linkToPlace(i) {
  const id = NODES()[i].id;
  const v = V();
  const path = v.kind === 'demo'
    ? `/demo/${v.setting}/${id}`
    : (v.settings.length > 1 ? `/c/${v.code}/${v.setting}/${id}` : `/c/${v.code}/${id}`);
  return location.origin + urlFor(path);
}

// The page explaining what this is. Shown once on a first visit, and from
// the header whenever anyone wants it again.
function showAbout(on) {
  const page = $('#about-page');
  if (on && !page.innerHTML) page.innerHTML = aboutPage();
  page.hidden = !on;
  document.body.classList.toggle('reading', on);
  if (on) try { localStorage.setItem('seen-about', '1'); } catch { /* ignore */ }
}

function firstVisit() {
  try { return localStorage.getItem('seen-about') !== '1'; } catch { return false; }
}

function navigate(path) {
  if (appPath() !== path) history.pushState(null, '', urlFor(path));
  return route();
}

// Run a server action, swap in the returned campaign, and report the error in place if it fails.
async function campaignCall(method, url, body) {
  const payload = await api(method, `/campaigns/${V().code}${url}`, body);
  const before = state.influence.map(s => s.owner);
  const seen = new Set(confirmed().map(g => g.id));
  setView(campaignView(payload, V().setting), { keepDay: true });
  const newlyConfirmed = confirmed().filter(g => !seen.has(g.id));
  if (newlyConfirmed.length === 1) announce(before, newlyConfirmed[0]);
  return payload;
}

// --- modals ----------------------------------------------------------------

function openModal(html, onSubmit) {
  const modal = $('#modal');
  modal.innerHTML = `<form method="dialog">${html}<p class="error" role="alert"></p></form>`;
  const form = modal.querySelector('form');
  form.addEventListener('submit', async e => {
    if (e.submitter?.value === 'cancel') return;
    e.preventDefault();
    const btn = form.querySelector('button.primary');
    const label = btn?.textContent;
    const err = form.querySelector('.error');
    err.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Working…'; }
    try {
      const msg = await onSubmit(new FormData(form), form);
      if (msg) err.textContent = msg;
      else if (modal.open) modal.close();
    } catch (ex) {
      err.textContent = ex.message;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  });
  modal.showModal();
  form.querySelector('input:not([type=hidden]), select')?.focus();
  return form;
}

// A deep lore entry is several paragraphs, separated by a blank line.
const PARAGRAPH = /\r?\n\s*\n/;

const cancelRow = label => `<div class="row"><button value="cancel" formnovalidate>Cancel</button><button class="primary">${label}</button></div>`;

// Every faction someone can muster as: one entry per army book.
const factionOptions = () => armyFactionsFor(C().setting)
  .map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');

// Where that faction can begin. Its own seat first, then its sub-factions' grounds.
function startOptions(factionId) {
  return startsFor(C().setting, factionId).map(s => {
    const where = NODES()[idx(s.point)]?.name ?? s.point;
    const label = s.seat ? `${s.name} — ${where} (home)` : `${s.name} — ${where}`;
    return `<option value="${esc(s.id)}">${esc(label)}</option>`;
  }).join('');
}

const armyOptions = (list, selected) => C().setting.factions.map(f => {
  const group = list.filter(p => C().setting.resolve(p.faction, 'codex') === f.id);
  return group.length ? `<optgroup label="${esc(f.name)}">${group.map(p =>
    `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.army)} (${esc(p.name)})</option>`).join('')}</optgroup>` : '';
}).join('');

// Battlefields, grouped by realm when there's more than one map.
function nodeOptions(selected) {
  const opts = list => list.map(({ n, i }) => `<option value="${i}" ${i === selected ? 'selected' : ''}>${esc(n.name)}</option>`).join('');
  const all = NODES().map((n, i) => ({ n, i }));
  if (!multiMap()) return opts(all.sort((a, b) => a.n.name.localeCompare(b.n.name)));
  return mapsShown().map(m => `<optgroup label="${esc(m.name)}">${opts(all.filter(x => x.n.map === m.id)
    .sort((a, b) => a.n.name.localeCompare(b.n.name)))}</optgroup>`).join('');
}
const activeArmies = () => V().players.filter(p => !p.retired);
const defaultNode = () => state.selected ?? current().offset;

// Before a campaign action, walk the player through whatever step they're missing.
function ensureCanAct() {
  if (canAct()) return true;
  if (!state.session.user) openAuth('Sign in to take part in this campaign.');
  else if (!V().me?.role) joinThis();
  else openMuster();
  return false;
}

function openAuth(reason = '') {
  const form = openModal(`
    <h2>Welcome, warrior</h2>
    ${reason ? `<p class="muted">${esc(reason)}</p>` : ''}
    <div class="tabs"><button type="button" class="tab active" data-mode="login">Sign in</button><button type="button" class="tab" data-mode="signup">Create account</button></div>
    <input type="hidden" name="mode" value="login">
    <label>Username<input name="username" autocomplete="username" required minlength="3" maxlength="24"></label>
    <label class="signup-only" hidden>Display name <span class="muted">(what other players see)</span><input name="displayName" maxlength="32"></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required minlength="8"></label>
    ${cancelRow('Sign in')}`,
  async data => {
    const mode = data.get('mode');
    const body = { username: data.get('username'), password: data.get('password'), displayName: data.get('displayName') };
    await api('POST', `/auth/${mode}`, body);
    await refreshSession();
    if (V().kind === 'campaign') await loadCampaign(V().code, { keepDay: true }); else renderTopbar();
    renderPanel();
    toast(`Welcome, <b>${esc(state.session.user.displayName)}</b>.`);
  });
  form.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    const signup = tab.dataset.mode === 'signup';
    form.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    form.mode.value = tab.dataset.mode;
    form.querySelector('.signup-only').hidden = !signup;
    form.password.autocomplete = signup ? 'new-password' : 'current-password';
    form.querySelector('button.primary').textContent = signup ? 'Create account' : 'Sign in';
  }));
}

function openAccount() {
  const user = state.session.user;
  if (!user) return openAuth();
  openModal(`
    <h2>${esc(user.displayName)}</h2>
    <p class="muted">Signed in as ${esc(user.username)}.</p>
    ${state.session.campaigns.length ? `<h3>Your campaigns</h3><ul class="plain">${state.session.campaigns.map(c =>
      `<li><button class="link" type="button" data-go="${esc(c.code)}">${esc(c.name)}</button> <span class="muted">${esc(c.code)} · ${esc(SETTINGS[c.setting]?.name ?? c.setting)} · ${esc(c.role)}</span></li>`).join('')}</ul>` : ''}
    <div class="row"><button value="cancel" formnovalidate>Close</button><button class="primary">Sign out</button></div>`,
  async () => {
    await api('POST', '/auth/logout');
    await refreshSession();
    if (V().kind === 'campaign') await loadCampaign(V().code, { keepDay: true }); else renderTopbar();
    toast('Signed out.');
  });
}

function openCreate() {
  if (!state.session.user) return openAuth('Sign in to start a campaign. It takes ten seconds.');
  const settingOptions = Object.values(SETTINGS).map(s =>
    `<option value="${s.id}" ${s.id === V().setting ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  openModal(`
    <h2>Start a campaign</h2>
    <p class="muted">For your store, your gaming group, or an official event. You'll get a code to share.</p>
    <label>Campaign name<input name="name" required minlength="3" maxlength="60" placeholder="Tuesday Night Crusade"></label>
    <label>Setting<select name="setting">${settingOptions}</select></label>
    ${cancelRow('Create campaign')}`,
  async data => {
    const { code } = await api('POST', '/campaigns', { name: data.get('name'), setting: data.get('setting') });
    await refreshSession();
    $('#modal').close();
    await navigate(`/c/${code}`);
    toast(`Campaign created. Share the code <b>${esc(code)}</b> with your players.`);
    openMuster();
  });
}

function openJoin() {
  openModal(`
    <h2>Join a campaign</h2>
    <label>Campaign code<input name="code" required placeholder="e.g. K7Q-M2X" autocomplete="off" style="text-transform:uppercase"></label>
    <p class="muted">Anyone can look at a campaign with its code. Sign in to take part.</p>
    ${cancelRow('Find campaign')}`,
  async data => {
    const raw = String(data.get('code')).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length !== 6) return 'Codes are six letters and numbers, like K7Q-M2X.';
    const code = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    await api('GET', `/campaigns/${code}`); // throws "No campaign has that code."
    $('#modal').close();
    await navigate(`/c/${code}`);
    if (state.session.user && !V().me?.role) joinThis();
  });
}

async function joinThis() {
  if (!state.session.user) return openAuth('Sign in to join this campaign.');
  try {
    await campaignCall('POST', '/join');
    await refreshSession();
    renderTopbar();
    toast(`You've joined <b>${esc(V().name)}</b>.`);
    if (!myArmies().length) openMuster();
  } catch (e) { toast(esc(e.message)); }
}

function openSettings() {
  const v = V();
  openModal(`
    <h2>Campaign settings</h2>
    <label>Campaign name<input name="name" required minlength="3" maxlength="60" value="${esc(v.name)}"></label>
    <label>Faction detail<select name="level">${LEVELS.map(l =>
      `<option value="${l}" ${l === (v.level ?? 'codex') ? 'selected' : ''}>${esc(LEVEL_NAMES[l])} — ${esc(LEVEL_HINTS[l])}</option>`).join('')}</select></label>
    <label>New season every<select name="resetDays">${[0, 30, 60, 90, 180, 365].map(d =>
      `<option value="${d}" ${d === (v.resetDays ?? 0) ? 'selected' : ''}>${d ? `${d} days` : 'Never, I reset it myself'}</option>`).join('')}</select></label>
    <fieldset class="maps"><legend>Games in play</legend>${Object.values(SETTINGS).map(s =>
      `<label class="check"><input type="checkbox" name="settings" value="${esc(s.id)}" ${v.settings.includes(s.id) ? 'checked' : ''}> ${esc(s.name)}</label>`).join('')}
      <span class="hint">Each game gets its own tab, with its own armies and territory. Switching one off hides it — its armies, results and territory
      are all still there if you switch it back on. Keep at least one.</span></fieldset>
    ${C().setting.maps.length > 1 ? `<fieldset class="maps"><legend>Maps in play for ${esc(C().setting.name)}</legend>${C().setting.maps.map(m =>
      `<label class="check"><input type="checkbox" name="maps" value="${esc(m.id)}" ${mapsShown().some(x => x.id === m.id) ? 'checked' : ''}> ${esc(m.name)}</label>`).join('')}
      <span class="hint">A map switched off keeps its games and territory; it is just not shown until it is switched back on.</span></fieldset>` : ''}
    ${v.payload.members?.length > 1 ? `<fieldset class="maps"><legend>Who runs this campaign</legend>${v.payload.members.map(m =>
      `<label class="check"><input type="checkbox" name="organizers" value="${m.userId}"
        ${m.role === 'organizer' ? 'checked' : ''}> ${esc(m.displayName)}</label>`).join('')}
      <span class="hint">An organizer can report for anyone, decree influence, add places and change these settings. A campaign needs at least one.</span></fieldset>` : ''}
    <p class="muted small">A new season clears the map and everyone starts from their homelands again. The chronicle keeps every game.</p>
    <div class="row"><button type="button" class="ghost" data-act="reset">Start a new season now</button>
      <button type="button" class="ghost" data-act="freeze">${v.frozen ? 'Thaw the campaign' : 'Freeze the campaign'}</button></div>
    <p class="muted small">Freezing pauses results, challenges and mustering. Everyone can still read the map; nothing is hidden.</p>
    ${cancelRow('Save settings')}`,
  async data => {
    // Who runs it, before the rest: a demotion has to be refused while the
    // person doing it is still an organizer.
    const wanted = new Set(data.getAll('organizers').map(Number));
    for (const m of v.payload.members ?? []) {
      const role = wanted.has(m.userId) ? 'organizer' : 'player';
      if (role !== m.role) await campaignCall('POST', `/members/${m.userId}/role`, { role });
    }
    await campaignCall('POST', '/settings', {
      name: data.get('name'), level: data.get('level'), resetDays: Number(data.get('resetDays')),
      settings: data.getAll('settings'),
      ...(C().setting.maps.length > 1 ? { maps: data.getAll('maps') } : {}),
    });
    toast('Campaign settings saved.');
  });
}

function openMuster() {
  const first = armyFactionsFor(C().setting)[0].id;
  const form = openModal(`
    <h2>Muster an army</h2>
    <p class="muted">Each army fights for one faction. Play more than one army? Muster each separately.</p>
    <label>Faction<select name="faction" required>${factionOptions()}</select></label>
    <label>Starting ground<select name="start" required>${startOptions(first)}</select>
      <span class="hint">Every win counts for your faction. Only its home is safe ground.</span></label>
    <label>Army name<input name="name" required minlength="2" maxlength="40" placeholder="Give your army a name"></label>
    ${cancelRow('Muster')}`,
  async data => {
    await campaignCall('POST', '/armies', {
      faction: data.get('faction'), start: data.get('start'), name: data.get('name'), setting: V().setting,
    });
    const where = NODES()[idx(startPoint(C().setting, data.get('start')))];
    toast(`<b>${esc(data.get('name'))}</b> takes the field from ${esc(where.name)}.`);
  });
  form.faction.addEventListener('change', () => { form.start.innerHTML = startOptions(form.faction.value); });
}

function goToToday() {
  stopPlayback();
  if (!isToday()) { state.at = V().today; draw(); }
}

function openReport({ node = defaultNode(), players = [], eventId = null } = {}) {
  if (!ensureCanAct()) return;
  goToToday();
  if (V().kind === 'demo') return openDemoReport({ node, players });
  const mine = myArmies();
  const myId = players.find(id => V().me.armyIds.has(id)) ?? mine[0].id;
  const foeId = players.find(id => id !== myId);
  if (!activeArmies().some(p => !V().me.armyIds.has(p.id))) return toast('No opponents yet. Share the join code to bring rivals in.');
  openModal(`
    <h2>Report a result</h2>
    <label>Your army<select name="mine">${armyOptions(mine, myId)}</select></label>
    <label>Outcome<select name="outcome"><option value="won">We won</option><option value="lost">We lost</option></select></label>
    <label>Opponent<select name="foe" required>${armyOptions(activeArmies().filter(p => !V().me.armyIds.has(p.id)), foeId)}</select></label>
    <label>Battlefield<select name="node">${nodeOptions(node)}</select></label>
    <p class="muted small">Your opponent confirms the result before the map changes. If they don't respond, it confirms itself after ${V().autoConfirmHours} hours.</p>
    ${cancelRow('Send result')}`,
  async data => {
    const mineId = Number(data.get('mine')), foe = Number(data.get('foe'));
    if (!foe) return 'Pick your opponent.';
    const won = data.get('outcome') === 'won';
    const n = NODES()[Number(data.get('node'))];
    await campaignCall('POST', '/games', { winner: won ? mineId : foe, loser: won ? foe : mineId, node: n.id, eventId });
    toast(`Result sent. <b>${esc(playerById(foe).name)}</b> needs to confirm before ${esc(n.name)} changes hands.`);
  });
}

function openDemoReport({ node, players }) {
  const [a = V().players[0].id, b = V().players.find(p => p.faction !== playerById(a).faction).id] = players;
  openModal(`
    <h2>Report a result</h2>
    <label>Victor<select name="winner">${armyOptions(activeArmies(), a)}</select></label>
    <label>Defeated<select name="loser">${armyOptions(activeArmies(), b)}</select></label>
    <label>Battlefield<select name="node">${nodeOptions(node)}</select></label>
    <p class="muted small">In a real campaign your opponent confirms the result before the map changes. The demo confirms for them.</p>
    ${cancelRow('Submit result')}`,
  async (data, form) => {
    const winner = data.get('winner'), loser = data.get('loser'), i = Number(data.get('node'));
    if (factionOfArmy(playerById(winner).faction) === factionOfArmy(playerById(loser).faction)) return 'Pick armies from two different factions.';
    const btn = form.querySelector('button.primary');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    btn.textContent = `Waiting for ${playerById(loser).name} to confirm…`;
    await wait(900);
    btn.textContent = 'Confirmed by both players ✓';
    await wait(600);
    const before = state.influence.map(s => s.owner);
    const g = { id: `local${Date.now()}`, day: V().today, node: NODES()[i].id, winner, loser, status: 'confirmed' };
    V().games.push(g);
    const ev = V().events.findIndex(e => e.node === g.node && e.players.includes(winner) && e.players.includes(loser));
    if (ev >= 0) V().events.splice(ev, 1);
    if (!state.overview && !onCurrentMap(i)) showMap(NODES()[i].map); else draw();
    announce(before, g);
  });
}

function openChallenge({ node = defaultNode() } = {}) {
  if (!ensureCanAct()) return;
  goToToday();
  const demo = V().kind === 'demo';
  const mine = demo ? activeArmies() : myArmies();
  const foes = demo ? activeArmies() : activeArmies().filter(p => !V().me.armyIds.has(p.id));
  const sameSide = (x, y) => factionOfArmy(x.faction) === factionOfArmy(y.faction);
  if (!foes.length) return toast('No one to fight yet. Share the join code and wait for a rival to muster.');
  const first = mine[0];
  const days = [0, 1, 2, 3, 4, 5, 6, 7, 10, 14];
  openModal(`
    <h2>Issue a challenge</h2>
    <label>${demo ? 'Challenger' : 'Your army'}<select name="a">${armyOptions(mine, first.id)}</select></label>
    <label>Opponent<select name="b" required>${armyOptions(foes, foes.find(p => !sameSide(p, first))?.id)}</select></label>
    <label>Battlefield<select name="node">${nodeOptions(node)}</select></label>
    <label>When<select name="when">${days.map(d => `<option value="${d}">${d === 0 ? 'Tonight' : d === 1 ? 'Tomorrow' : `In ${d} days`} · ${fmtDate(Math.floor(V().today) + d)}</option>`).join('')}</select></label>
    <label>Stakes (optional)<input name="note" maxlength="80" placeholder="What's at stake?"></label>
    ${cancelRow('Throw down the gauntlet')}`,
  async data => {
    const a = demo ? data.get('a') : Number(data.get('a'));
    const b = demo ? data.get('b') : Number(data.get('b'));
    if (!b) return 'Pick an opponent.';
    if (factionOfArmy(playerById(a).faction) === factionOfArmy(playerById(b).faction)) return 'Pick armies from two different factions.';
    const n = NODES()[Number(data.get('node'))];
    const day = Math.floor(V().today) + Number(data.get('when'));
    const note = String(data.get('note')).trim();
    if (demo) {
      V().events.push({ id: `e${Date.now()}`, day, node: n.id, players: [a, b], note });
      draw();
    } else {
      await campaignCall('POST', '/events', { army: a, opponent: b, node: n.id, scheduledFor: dayToMs(V(), day + 19 / 24), note });
    }
    toast(`${army(a)} challenge ${army(b)} at <b>${esc(n.name)}</b>`);
  });
}

// --- timeline ------------------------------------------------------------

let timer = null;
function stopPlayback() { clearInterval(timer); timer = null; $('#play').textContent = '▶'; }
function play() {
  if (timer) return stopPlayback();
  if (isToday()) state.at = 0;
  $('#play').textContent = '❚❚';
  const step = Math.max(1, Math.ceil(V().today / 120)); // long campaigns replay in about 13 seconds
  timer = setInterval(() => {
    state.at = Math.min(V().today, state.at + step);
    draw();
    if (isToday()) stopPlayback();
  }, 110);
}

// --- boot ----------------------------------------------------------------

const mapView = new MapView({
  viewport: $('#viewport'),
  onHover: (local, e) => showTooltip(local == null ? null : toGlobal(local), e),
  onSelect: local => select(local == null ? null : toGlobal(local)),
  onGate: k => select(state.gateTargets[k]),
  // While a gamemaster is putting a place down, a click on the map is the spot.
  onGround: (x, y) => {
    if (!state.placing) return false;
    stopPlacing();
    openPlace({ x, y });
    return true;
  },
});
if (import.meta.env.DEV) {
  window.__map = mapView;       // for poking at the camera from devtools
  window.__state = state;       // and at the session, without signing in to check
  window.__draw = () => { renderTopbar(); draw(); };
}

$('#scrub').addEventListener('input', e => {
  stopPlayback();
  const v = Number(e.target.value);
  state.at = v >= Number(e.target.max) ? V().today : v;
  draw();
});
$('#play').addEventListener('click', play);
// The sigil goes home: to the page that explains the app if you are signed
// out, and to your own map if you are not.
$('#btn-home').addEventListener('click', () => {
  if (state.placing) stopPlacing();
  select(null);
  // Home is your own campaign if you have one, the page that explains the app
  // if you are signed out, and the demo only as a last resort. It used to send
  // signed-in players to '/', which is the demo — the one place they had not
  // asked to go.
  const mine = state.session.campaigns;
  if (state.session.user && mine.length) return navigate(`/c/${mine[0].code}`);
  navigate(state.session.user ? '/' : '/about');
});
$('#add-place').addEventListener('click', () => (state.placing ? stopPlacing() : placeHere()));
$('#zoom-in').addEventListener('click', () => mapView.zoomBy(1.3));
$('#zoom-out').addEventListener('click', () => mapView.zoomBy(1 / 1.3));
$('#zoom-fit').addEventListener('click', () => { select(null); mapView.fit(true, true); });
// Place names can be switched off for a cleaner look; the choice is remembered.
const labelsBtn = $('#labels-toggle');
try { state.overviewMode = localStorage.getItem('overview-mode') === 'pins' ? 'pins' : 'report'; }
catch { /* private mode */ }

let labelsOn = true;
try { labelsOn = localStorage.getItem('labels') !== 'off'; } catch { /* private mode */ }
const applyLabels = () => { mapView.setLabels(labelsOn); labelsBtn.setAttribute('aria-pressed', String(labelsOn)); labelsBtn.classList.toggle('off', !labelsOn); };
const soundBtn = $('#sound-toggle');
const applySound = () => {
  soundBtn.setAttribute('aria-pressed', String(soundOn()));
  soundBtn.classList.toggle('off', !soundOn());
  soundBtn.textContent = soundOn() ? '♪' : '♪';
};
soundBtn.addEventListener('click', () => { setSound(!soundOn()); applySound(); });
applySound();

labelsBtn.addEventListener('click', () => {
  labelsOn = !labelsOn;
  try { localStorage.setItem('labels', labelsOn ? 'on' : 'off'); } catch { /* ignore */ }
  applyLabels();
});
applyLabels();
$('#back-btn').addEventListener('click', () => select(null));
$('#btn-report').addEventListener('click', () => openReport());
$('#btn-challenge').addEventListener('click', () => openChallenge());
$('#btn-account').addEventListener('click', openAccount);
$('#btn-about').addEventListener('click', () => navigate('/about'));

// --- finding a place by name ----------------------------------------------
// Every point of the setting being looked at, matched as you type. A name is
// scored on where the match falls: the start of the name beats the middle,
// and a whole-word match beats part of one, so "hal" finds Hallowheart before
// Valhalla. Ten results is enough to choose from without becoming a list.
const finder = $('#finder');
const findInput = $('#find-input');
const findResults = $('#find-results');
let findCursor = 0;

function scoreName(name, q) {
  const n = name.toLowerCase();
  const i = n.indexOf(q);
  if (i < 0) return -1;
  if (i === 0) return 0;
  return n[i - 1] === ' ' || n[i - 1] === "'" ? 1 : 2;
}

function findMatches(q) {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const out = [];
  NODES().forEach((n, i) => {
    const score = scoreName(n.name, query);
    if (score >= 0) out.push({ i, n, score });
  });
  return out.sort((a, b) => a.score - b.score || a.n.name.length - b.n.name.length).slice(0, 10);
}

function renderFind() {
  const hits = findMatches(findInput.value);
  findCursor = Math.min(findCursor, Math.max(hits.length - 1, 0));
  findResults.innerHTML = hits.map((h, k) => `<li><button data-find="${h.i}" class="${k === findCursor ? 'on' : ''}">
    ${esc(h.n.name)}<span class="where">${esc(multiMap() ? mapName(h.n.map) : (h.n.region ?? ''))}</span></button></li>`).join('');
  return hits;
}

function openFinder(on) {
  finder.hidden = !on;
  if (on) { findInput.value = ''; findResults.innerHTML = ''; findCursor = 0; findInput.focus(); }
}

function goToPlace(i) {
  openFinder(false);
  if (!onCurrentMap(i)) showMap(NODES()[i].map);
  select(i);
  mapView.focusOn(i, true);
}

$('#find-toggle').addEventListener('click', () => openFinder(finder.hidden));
findInput.addEventListener('input', renderFind);
findInput.addEventListener('keydown', e => {
  const hits = findMatches(findInput.value);
  if (e.key === 'Escape') return openFinder(false);
  if (e.key === 'ArrowDown') { findCursor = Math.min(findCursor + 1, hits.length - 1); renderFind(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { findCursor = Math.max(findCursor - 1, 0); renderFind(); e.preventDefault(); }
  if (e.key === 'Enter' && hits[findCursor]) goToPlace(hits[findCursor].i);
});
document.addEventListener('keydown', e => {
  if (e.key === '/' && !finder.contains(e.target) && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName) && !$('#modal').open) {
    openFinder(true); e.preventDefault();
  }
});
$('#campaign-select').addEventListener('change', e => {
  const v = e.target.value;
  renderTopbar(); // snap the select back; the action below decides where we go
  if (v === '__join') return openJoin();
  if (v === '__create') return openCreate();
  navigate(v === 'demo' ? (V().setting === 'old-world' ? '/' : `/demo/${V().setting}`) : `/c/${v}`);
});
// A campaign is fixed to its setting, so picking another one here opens that
// setting's demo to look around; the campaign picker brings you back.
$('#setting-select').addEventListener('change', e => {
  const s = e.target.value;
  if (V().kind !== 'demo' && s === V().setting) return renderTopbar();
  if (V().kind !== 'demo' && V().settings.includes(s)) {
    select(null);
    setView(campaignView(V().payload, s), { keepDay: true });
    // The address bar has to follow, or a reload drops back into whichever
    // game the campaign was last looked at in.
    return syncPlaceUrl(null);
  }
  navigate(s === 'old-world' ? '/' : `/demo/${s}`);
});
window.addEventListener('popstate', route);
// A first visit, signed out, opens on the page that explains the app.
if (firstVisit() && !state.session.user && appPath() === '/') {
  history.replaceState(null, '', urlFor('/about'));
}
window.addEventListener('resize', () => { if (state.overview) renderOverview(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || $('#modal').open) return;
  if (state.placing) return stopPlacing();
  if (state.selected != null) select(null);
});

const confirmAct = (question, fn) => { if (window.confirm(question)) fn(); };
const act = fn => fn().catch(e => toast(esc(e.message)));

// Buttons inside the panel, tooltip, modals, realm bar and overview.
document.addEventListener('click', e => {
  const t = e.target.closest('[data-find],[data-overview-mode],[data-show-faction],[data-decree],[data-edit-place],[data-remove-place],[data-undecree],[data-level],[data-region-tab],[data-peek-close],[data-peek-details],[data-node],[data-report],[data-challenge],[data-report-event],[data-cancel-event],[data-act],[data-confirm],[data-dispute],[data-withdraw],[data-void],[data-retire],[data-copy],[data-go],[data-realm],#panel-back');
  if (!t) return;
  const d = t.dataset;
  if (t.id === 'panel-back') return select(null);
  if ('peekClose' in d) return select(null);
  if (d.level) return setLevel(d.level);
  if (d.regionTab) { state.regionTab = d.regionTab; return renderPanel(); }
  if (d.find) return goToPlace(Number(d.find));
  if (d.overviewMode) {
    state.overviewMode = d.overviewMode;
    try { localStorage.setItem('overview-mode', d.overviewMode); } catch { /* private mode */ }
    return renderOverview();
  }
  if (d.showFaction) {
    const hidden = state.hiddenFactions;
    if (hidden.has(d.showFaction)) hidden.delete(d.showFaction); else hidden.add(d.showFaction);
    return draw();
  }
  if (d.decree) return openDecree(Number(d.decree));
  if (d.editPlace) return openPlace(null, addedPlace(d.editPlace));
  if (d.removePlace) {
    const place = addedPlace(d.removePlace);
    return confirmAct(`Remove ${place.name} from the map? Any games played there stay in the chronicle.`,
      () => act(() => campaignCall('DELETE', `/places/${place.placeId}`)));
  }
  if (d.undecree) return confirmAct('Revoke this decree? Its influence comes off the map.',
    () => act(() => campaignCall('DELETE', `/decrees/${d.undecree}`)));
  if ('peekDetails' in d) return narrow() ? setSheet('full') : $('#panel').scrollIntoView({ behavior: 'smooth' });
  if (d.realm) {
    if (d.realm === '__all') return showOverview();
    if (state.selected != null) select(null);
    return showMap(d.realm);
  }
  if (d.node) return select(Number(d.node));
  if (d.report) { sfx('accept'); return openReport({ node: Number(d.report) }); }
  if (d.challenge) { sfx('challenge'); return openChallenge({ node: Number(d.challenge) }); }
  if (d.reportEvent) {
    const ev = V().events.find(x => String(x.id) === d.reportEvent);
    return openReport({ node: idx(ev.node), players: ev.players, eventId: ev.id });
  }
  if (d.cancelEvent) return confirmAct('Call off this battle?', () => act(() => campaignCall('DELETE', `/events/${d.cancelEvent}`)));
  if (d.confirm) return act(() => campaignCall('POST', `/games/${d.confirm}/confirm`));
  if (d.dispute) return confirmAct('Dispute this result? An organizer will settle it. The map will not change until then.',
    () => act(() => campaignCall('POST', `/games/${d.dispute}/dispute`)));
  if (d.withdraw) return confirmAct('Withdraw this result?', () => act(() => campaignCall('DELETE', `/games/${d.withdraw}`)));
  if (d.void) return confirmAct('Void this result? It will be removed from the chronicle and the map.', () => act(() => campaignCall('DELETE', `/games/${d.void}`)));
  if (d.retire) return confirmAct('Retire this army? Its battles stay in the chronicle, but it will no longer fight. You can muster a fresh army any time.',
    () => act(() => campaignCall('POST', `/armies/${d.retire}/retire`)));
  if (d.copy) return navigator.clipboard?.writeText(d.copy).then(() => toast('Invite link copied.'), () => toast(esc(d.copy)));
  if (d.go) { $('#modal').close(); return navigate(`/c/${d.go}`); }
  if (d.act === 'create') return openCreate();
  if (d.act === 'join') return openJoin();
  if (d.act === 'join-this') return joinThis();
  if (d.act === 'muster') return openMuster();
  if (d.act === 'auth') return openAuth();
  if (d.act === 'settings') return openSettings();
  if (d.act === 'about-close') return navigate(V()?.kind === 'demo' && V().setting !== 'old-world' ? `/demo/${V().setting}` : '/');
  if (d.act === 'freeze') {
    const on = !V().frozen;
    return confirmAct(on ? 'Freeze the campaign? Nothing can be recorded until it is thawed.' : 'Thaw the campaign?',
      () => act(async () => { await campaignCall('POST', '/freeze', { frozen: on }); $('#modal').close(); toast(on ? 'The campaign is frozen.' : 'The campaign is thawed.'); }));
  }
  if (d.act === 'reset') return confirmAct('Start a new season? The map clears and every faction falls back to its homeland. Games stay in the chronicle.',
    () => act(async () => { $('#modal').close(); await campaignCall('POST', '/reset'); toast('A new season begins.'); }));
});

// Keep a campaign live: pick up other players' results and challenges.
setInterval(() => {
  if (V()?.kind !== 'campaign' || document.hidden || $('#modal').open || timer) return;
  loadCampaign(V().code, { keepDay: true }).catch(() => {});
}, 60e3);

bindSheet();
// Measure the timeline once so the sheet sits above it.
document.documentElement.style.setProperty('--timeline-h', `${Math.round($('.timeline').getBoundingClientRect().height)}px`);
refreshSession().then(route);
