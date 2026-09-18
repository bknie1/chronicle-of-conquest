import './style.css';
import { buildGraph, computeInfluence, RULES } from './engine.js';
import { MapView } from './map.js';
import { OLD_WORLD as MAP } from './data/old-world.js';
import { api } from './api.js';
import { demoView, campaignView, dayToMs } from './sources.js';

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const graph = buildGraph(MAP.nodes, MAP.width, MAP.height, MAP.maxEdge);
const nodeIndex = new Map(MAP.nodes.map((n, i) => [n.id, i]));
const factionById = new Map(MAP.factions.map(f => [f.id, f]));

const state = {
  session: { user: null, campaigns: [] },
  view: null,       // what's on the map: the demo or a campaign (see sources.js)
  at: 0,            // the day being shown; < view.today while replaying
  selected: null,
  influence: null,
};

// --- derived data --------------------------------------------------------

const V = () => state.view;
const playerById = id => V().players.find(p => p.id === id);
const isToday = () => state.at >= V().today;
const sameDay = (a, b) => Math.floor(a) === Math.floor(b);
const confirmed = () => V().games.filter(g => g.status === 'confirmed');
const gamesSoFar = () => confirmed().filter(g => g.day <= state.at);
const upcoming = () => (isToday() ? V().events : []);
const myArmies = () => (V().me ? V().players.filter(p => V().me.armyIds.has(p.id)) : []);
const isOrganizer = () => V().me?.role === 'organizer';
const canAct = () => V().kind === 'demo' || myArmies().length > 0;

function recompute() {
  const games = gamesSoFar().map(g => ({
    day: g.day,
    nodeIndex: nodeIndex.get(g.node),
    winnerFaction: playerById(g.winner).faction,
    loserFaction: playerById(g.loser).faction,
  }));
  state.influence = computeInfluence({ graph, nodes: MAP.nodes, factions: MAP.factions, games, at: state.at });
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
  const held = new Map(MAP.factions.map(f => [f.id, 0]));
  state.influence.forEach(s => s.owner && held.set(s.owner, held.get(s.owner) + 1));
  const recent = new Map(MAP.factions.map(f => [f.id, 0]));
  for (const g of gamesSoFar()) if (state.at - g.day <= 14) {
    const f = playerById(g.winner).faction;
    recent.set(f, recent.get(f) + 1);
  }
  return MAP.factions.map(f => ({ ...f, held: held.get(f.id), recent: recent.get(f.id) }))
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
  return `<span class="army" style="--c:${factionById.get(p.faction).color}">${esc(p.army)}</span>`;
};
const place = i => `<button class="link" data-node="${i}">${esc(MAP.nodes[i].name)}</button>`;

function controlLine(s) {
  if (s.home) return `${swatch(factionById.get(s.home))} Homeland of <b>${esc(factionById.get(s.home).name)}</b>. Cannot fall.`;
  if (!s.owner) return '<span class="muted">Unclaimed. No one holds sway here.</span>';
  const f = factionById.get(s.owner);
  if (s.contested) {
    const r = factionById.get(s.rival);
    return `${swatch(f)}${swatch(r)} <b>Contested</b> between ${esc(f.name)} and ${esc(r.name)}`;
  }
  return `${swatch(f)} Held by <b>${esc(f.name)}</b>`;
}

function influenceBars(s, limit = 8) {
  const max = Math.max(30, ...s.ranked.map(r => r.value));
  return `<div class="bars">${s.ranked.slice(0, limit).map(r => {
    const f = factionById.get(r.faction);
    return `<div class="bar"><span>${esc(f.name)}</span><i style="--c:${f.color};--w:${(100 * Math.min(r.value, max) / max).toFixed(1)}%"></i><b>${r.value >= 100 ? 'Home' : r.value.toFixed(0)}</b></div>`;
  }).join('') || '<p class="muted">No influence yet.</p>'}</div>`;
}

const statusTag = g => (g.status === 'pending' ? '<span class="tag wait">Awaiting confirmation</span>'
  : g.status === 'disputed' ? '<span class="tag fade">Disputed</span>' : '');
const gameLine = g => `<li>${army(g.winner)} defeated ${army(g.loser)} at ${place(nodeIndex.get(g.node))}
  <span class="muted">· ${ago(g.day)}</span> ${statusTag(g)}
  ${isOrganizer() ? `<button class="small ghost" data-void="${g.id}" title="Remove this result">Void</button>` : ''}</li>`;

function eventLine(e, withPlace = true) {
  const live = sameDay(e.day, V().today);
  const involved = V().kind === 'demo' || e.players.some(id => V().me?.armyIds.has(id));
  const canCancel = V().kind === 'campaign' && (involved || isOrganizer());
  return `<li class="${live ? 'live' : ''}">
    <span class="when">${live ? 'Tonight' : `${ago(e.day)} · ${fmtDate(e.day)}`}</span>
    ${army(e.players[0])} <span class="muted">vs</span> ${army(e.players[1])}${withPlace ? ` at ${place(nodeIndex.get(e.node))}` : ''}
    ${e.note ? `<div class="note">"${esc(e.note)}"</div>` : ''}
    ${involved ? `<button class="small" data-report-event="${e.id}">Report result</button>` : ''}
    ${canCancel ? `<button class="small ghost" data-cancel-event="${e.id}">Call off</button>` : ''}</li>`;
}

// --- panel ---------------------------------------------------------------

function campaignHeader() {
  const v = V();
  if (v.kind === 'demo') {
    return `<div class="callout">
      <b>This is a demo.</b> Brett, Maria and friends are a made-up store. Try reporting a result or replaying the timeline.
      Nothing you do here is saved.
      <div class="row"><button class="primary" data-act="create">Start your own campaign</button><button data-act="join">Join with a code</button></div>
    </div>`;
  }
  const link = `${location.origin}/c/${v.code}`;
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

function attention() {
  const v = V();
  if (v.kind !== 'campaign' || !v.me?.role) return '';
  const me = v.me.userId;
  const items = [];
  for (const g of v.games) {
    const line = `${army(g.winner)} defeated ${army(g.loser)} at ${place(nodeIndex.get(g.node))} <span class="muted">· ${ago(g.day)}</span>`;
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
    ${mine.length ? `<ul class="players">${mine.map(p => `<li>${army(p.id)} <span class="muted">${esc(factionById.get(p.faction).name)}</span>
      <button class="small ghost" data-retire="${p.id}" title="Retire this army and start fresh">Retire</button></li>`).join('')}</ul>` : ''}
    <div class="row"><button class="small" data-act="muster">＋ Muster ${mine.length ? 'another' : 'an'} army</button></div>`;
}

function renderPanel() {
  const panel = $('#panel');
  if (state.selected != null) return renderRegion(panel, state.selected);

  const v = V();
  const factions = factionStats();
  const maxHeld = Math.max(1, ...factions.map(f => f.held));
  const players = playerStats();
  const events = upcoming().slice().sort((a, b) => a.day - b.day);
  const recent = v.games.filter(g => g.day <= state.at && (g.status === 'confirmed' || isToday())).slice(-8).reverse();

  panel.innerHTML = `
    <h2>${esc(v.name)}</h2>
    <p class="muted">${fmtDate(Math.floor(state.at))}${isToday() ? '' : ' · <b class="replay">Replaying history</b>'}</p>
    ${campaignHeader()}
    ${attention()}
    ${yourArmies()}

    <h3>Factions</h3>
    <ol class="factions">${factions.map(f => `
      <li>${swatch(f)}<span class="name">${esc(f.name)}</span>
        <span class="held" title="Regions held">${f.held}</span>
        <i class="meter" style="--c:${f.color};--w:${(100 * f.held / maxHeld).toFixed(0)}%"></i>
        ${f.recent >= 4 ? '<span class="tag hot" title="4+ wins in the last two weeks">Rising</span>' : ''}
      </li>`).join('')}</ol>

    <h3>Warriors</h3>
    ${players.length ? `<ul class="players">${players.map(p => `
      <li>${army(p.id)} <span class="muted">${esc(p.name)}</span>
        <span class="record">${p.wins}–${p.losses}</span>
        <div class="sub">${p.last == null ? 'No battles yet' : `Last battle ${ago(p.last)}`}
          ${p.streak >= 3 ? `<span class="tag hot">${p.streak} win streak</span>` : ''}
          ${p.fading ? '<span class="tag fade">Influence fading</span>' : ''}</div>
      </li>`).join('')}</ul>` : '<p class="muted">No armies have mustered yet.</p>'}

    ${events.length ? `<h3>Battles on the horizon</h3><ul class="events">${events.map(e => eventLine(e)).join('')}</ul>` : ''}

    <h3>The Chronicle</h3>
    ${recent.length ? `<ul class="chronicle">${recent.map(gameLine).join('')}</ul>`
      : '<p class="muted">No battles fought yet. Issue a challenge and write the first page.</p>'}`;
}

function renderRegion(panel, i) {
  const n = MAP.nodes[i];
  const s = state.influence[i];
  const events = upcoming().filter(e => e.node === n.id);
  const history = gamesSoFar().filter(g => g.node === n.id).slice(-8).reverse();
  panel.innerHTML = `
    <button class="link back" id="panel-back">← ${esc(V().name)}</button>
    <h2>${esc(n.name)}</h2>
    <p class="muted">${esc(n.region)}</p>
    <p class="control">${controlLine(s)}</p>
    <h3>Influence</h3>
    ${influenceBars(s)}
    ${isToday() ? `<div class="row">
      <button data-challenge="${i}">⚔ Challenge for ${esc(n.name)}</button>
      <button class="primary" data-report="${i}">Report a result here</button></div>` : ''}
    ${events.length ? `<h3>Battles here</h3><ul class="events">${events.map(e => eventLine(e, false)).join('')}</ul>` : ''}
    <h3>Battles fought here</h3>
    ${history.length ? `<ul class="chronicle">${history.map(gameLine).join('')}</ul>` : '<p class="muted">No blood has been spilled here. Yet.</p>'}`;
}

// --- tooltip ---------------------------------------------------------------

function showTooltip(i, e) {
  const tip = $('#tooltip');
  if (i == null || !state.influence) { tip.hidden = true; return; }
  const n = MAP.nodes[i];
  const s = state.influence[i];
  const last = gamesSoFar().filter(g => g.node === n.id).at(-1);
  const count = upcoming().filter(ev => ev.node === n.id).length;
  tip.innerHTML = `
    <b>${esc(n.name)}</b> <span class="muted">${esc(n.region)}</span>
    <p class="control">${controlLine(s)}</p>
    ${influenceBars(s, 3)}
    ${last ? `<p class="small">Last battle: ${army(last.winner)} beat ${army(last.loser)}, ${ago(last.day)}</p>` : ''}
    ${count ? `<p class="small live">⚔ ${count} battle${count > 1 ? 's' : ''} scheduled</p>` : ''}
    <p class="hint">Click to zoom in</p>`;
  tip.hidden = false;
  const r = $('#viewport').getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  tip.style.left = `${Math.max(8, Math.min(x + 18, r.width - tip.offsetWidth - 8))}px`;
  tip.style.top = `${Math.max(8, Math.min(y + 18, r.height - tip.offsetHeight - 8))}px`;
}

// --- drawing ---------------------------------------------------------------

function select(i) {
  state.selected = i;
  $('#tooltip').hidden = true;
  if (i == null) { mapView.unfocus(); $('#back-btn').hidden = true; }
  else { mapView.focusOn(i); $('#back-btn').hidden = false; }
  renderPanel();
}

function draw() {
  recompute();
  mapView.render(state.influence, eventsByNode());
  renderPanel();
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
  const mine = state.session.campaigns;
  const current = v.kind === 'campaign' ? v.code : 'demo';
  const options = [
    ['demo', 'Demo store campaign'],
    ...mine.map(c => [c.code, c.name]),
    ...(v.kind === 'campaign' && !mine.some(c => c.code === v.code) ? [[v.code, v.name]] : []),
  ];
  $('#campaign-select').innerHTML = `${options.map(([val, label]) =>
    `<option value="${esc(val)}" ${val === current ? 'selected' : ''}>${esc(label)}</option>`).join('')}
    <option value="__join">Join with a code…</option><option value="__create">＋ Start a new campaign…</option>`;
  document.title = v.kind === 'demo' ? 'Chronicle of Conquest' : `${v.name} · Chronicle of Conquest`;
}

function toast(html) {
  const t = $('#toast');
  t.innerHTML = html;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
}

// Announce what a newly-counted result did to the map.
function announce(before, g) {
  const i = nodeIndex.get(g.node);
  const wf = factionById.get(playerById(g.winner).faction);
  const flipped = state.influence.map((s, j) => (s.owner !== before[j] && s.owner === wf.id ? j : -1)).filter(j => j >= 0);
  const m = mapView.markers[i];
  m.classList.remove('pulse'); void m.offsetWidth; m.classList.add('pulse');
  toast(flipped.length
    ? `${army(g.winner)} seize ${flipped.map(j => `<b>${esc(MAP.nodes[j].name)}</b>`).join(', ')} for ${esc(wf.name)}!`
    : `${army(g.winner)} win at <b>${esc(MAP.nodes[i].name)}</b>. ${esc(wf.name)}'s influence grows.`);
}

// --- loading & navigation -----------------------------------------------

async function refreshSession() {
  let s = {};
  try { s = await api('GET', '/me'); } catch { /* offline or no server: behave as signed out */ }
  state.session = { user: s.user ?? null, campaigns: Array.isArray(s.campaigns) ? s.campaigns : [] };
}

function setView(view, { keepDay = false } = {}) {
  const wasToday = !state.view || isToday();
  state.view = view;
  if (!keepDay || wasToday) state.at = view.today;
  else state.at = Math.min(state.at, view.today);
  renderTopbar();
  draw();
}

async function loadCampaign(code, opts) {
  const payload = await api('GET', `/campaigns/${encodeURIComponent(code)}`);
  setView(campaignView(payload, MAP), opts);
  return payload;
}

async function route() {
  stopPlayback();
  if (state.selected != null) select(null);
  const m = location.pathname.match(/^\/c\/([A-Za-z0-9-]{6,7})\/?$/);
  if (!m) return setView(demoView(graph, MAP));
  try {
    await loadCampaign(m[1]);
  } catch (e) {
    history.replaceState(null, '', '/');
    setView(demoView(graph, MAP));
    toast(esc(e.message));
  }
}

function navigate(path) {
  if (location.pathname !== path) history.pushState(null, '', path);
  return route();
}

// Run a server action, swap in the returned campaign, and report the error in place if it fails.
async function campaignCall(method, url, body) {
  const payload = await api(method, `/campaigns/${V().code}${url}`, body);
  const before = state.influence.map(s => s.owner);
  const seen = new Set(confirmed().map(g => g.id));
  setView(campaignView(payload, MAP), { keepDay: true });
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

const cancelRow = (label, extra = '') => `<div class="row">${extra}<button value="cancel" formnovalidate>Cancel</button><button class="primary">${label}</button></div>`;

const armyOptions = (list, selected) => MAP.factions.map(f => {
  const group = list.filter(p => p.faction === f.id);
  return group.length ? `<optgroup label="${esc(f.name)}">${group.map(p =>
    `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.army)} (${esc(p.name)})</option>`).join('')}</optgroup>` : '';
}).join('');
const nodeOptions = selected => MAP.nodes.map((n, i) => ({ n, i })).sort((a, b) => a.n.name.localeCompare(b.n.name))
  .map(({ n, i }) => `<option value="${i}" ${i === selected ? 'selected' : ''}>${esc(n.name)}</option>`).join('');
const activeArmies = () => V().players.filter(p => !p.retired);

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
      `<li><button class="link" type="button" data-go="${esc(c.code)}">${esc(c.name)}</button> <span class="muted">${esc(c.code)} · ${esc(c.role)}</span></li>`).join('')}</ul>` : ''}
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
  openModal(`
    <h2>Start a campaign</h2>
    <p class="muted">For your store, your gaming group, or an official event. You'll get a code to share.</p>
    <label>Campaign name<input name="name" required minlength="3" maxlength="60" placeholder="Tuesday Night Crusade"></label>
    <label>Setting<select name="setting"><option value="old-world">The Old World</option>
      <option disabled>Age of Sigmar (coming soon)</option><option disabled>Warhammer 40,000 (coming soon)</option></select></label>
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

function openMuster() {
  openModal(`
    <h2>Muster an army</h2>
    <p class="muted">Each army fights for one faction. Play more than one army? Muster each separately.</p>
    <label>Faction<select name="faction" required>${MAP.factions.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select></label>
    <label>Army name<input name="name" required minlength="2" maxlength="40" placeholder="The Grail Oath Knights"></label>
    ${cancelRow('Muster')}`,
  async data => {
    await campaignCall('POST', '/armies', { faction: data.get('faction'), name: data.get('name') });
    toast(`<b>${esc(data.get('name'))}</b> takes the field from ${esc(factionById.get(data.get('faction')).name)}'s homeland.`);
  });
}

function goToToday() {
  stopPlayback();
  if (!isToday()) { state.at = V().today; draw(); }
}

function openReport({ node = state.selected ?? 0, players = [], eventId = null } = {}) {
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
    const n = MAP.nodes[Number(data.get('node'))];
    await campaignCall('POST', '/games', { winner: won ? mineId : foe, loser: won ? foe : mineId, node: n.id, eventId });
    toast(`Result sent. <b>${esc(playerById(foe).name)}</b> needs to confirm before ${esc(n.name)} changes hands.`);
  });
}

function openDemoReport({ node, players }) {
  const [a = 'brett', b = 'maria'] = players;
  openModal(`
    <h2>Report a result</h2>
    <label>Victor<select name="winner">${armyOptions(activeArmies(), a)}</select></label>
    <label>Defeated<select name="loser">${armyOptions(activeArmies(), b)}</select></label>
    <label>Battlefield<select name="node">${nodeOptions(node)}</select></label>
    <p class="muted small">In a real campaign your opponent confirms the result before the map changes. The demo confirms for them.</p>
    ${cancelRow('Submit result')}`,
  async (data, form) => {
    const winner = data.get('winner'), loser = data.get('loser'), i = Number(data.get('node'));
    if (playerById(winner).faction === playerById(loser).faction) return 'Pick armies from two different factions.';
    const btn = form.querySelector('button.primary');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    btn.textContent = `Waiting for ${playerById(loser).name} to confirm…`;
    await wait(900);
    btn.textContent = 'Confirmed by both players ✓';
    await wait(600);
    const before = state.influence.map(s => s.owner);
    const g = { id: `local${Date.now()}`, day: V().today, node: MAP.nodes[i].id, winner, loser, status: 'confirmed' };
    V().games.push(g);
    const ev = V().events.findIndex(e => e.node === g.node && e.players.includes(winner) && e.players.includes(loser));
    if (ev >= 0) V().events.splice(ev, 1);
    draw();
    announce(before, g);
  });
}

function openChallenge({ node = state.selected ?? 0 } = {}) {
  if (!ensureCanAct()) return;
  goToToday();
  const demo = V().kind === 'demo';
  const mine = demo ? activeArmies() : myArmies();
  const foes = demo ? activeArmies() : activeArmies().filter(p => !V().me.armyIds.has(p.id));
  if (!foes.length) return toast('No one to fight yet. Share the join code and wait for a rival to muster.');
  const days = [0, 1, 2, 3, 4, 5, 6, 7, 10, 14];
  openModal(`
    <h2>Issue a challenge</h2>
    <label>${demo ? 'Challenger' : 'Your army'}<select name="a">${armyOptions(mine, demo ? 'brett' : mine[0].id)}</select></label>
    <label>Opponent<select name="b" required>${armyOptions(foes, demo ? 'dave' : undefined)}</select></label>
    <label>Battlefield<select name="node">${nodeOptions(node)}</select></label>
    <label>When<select name="when">${days.map(d => `<option value="${d}">${d === 0 ? 'Tonight' : d === 1 ? 'Tomorrow' : `In ${d} days`} · ${fmtDate(Math.floor(V().today) + d)}</option>`).join('')}</select></label>
    <label>Stakes (optional)<input name="note" maxlength="80" placeholder="For the glory of the Lady"></label>
    ${cancelRow('Throw down the gauntlet')}`,
  async data => {
    const a = demo ? data.get('a') : Number(data.get('a'));
    const b = demo ? data.get('b') : Number(data.get('b'));
    if (!b) return 'Pick an opponent.';
    if (playerById(a).faction === playerById(b).faction) return 'Pick armies from two different factions.';
    const n = MAP.nodes[Number(data.get('node'))];
    const day = Math.floor(V().today) + Number(data.get('when')) + 19 / 24; // game night, 7pm
    const note = String(data.get('note')).trim();
    if (demo) {
      V().events.push({ id: `e${Date.now()}`, day: Math.floor(V().today) + Number(data.get('when')), node: n.id, players: [a, b], note });
      draw();
    } else {
      await campaignCall('POST', '/events', { army: a, opponent: b, node: n.id, scheduledFor: dayToMs(V(), day), note });
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
  map: MAP,
  graph,
  factions: MAP.factions,
  onHover: showTooltip,
  onSelect: select,
});

$('#scrub').addEventListener('input', e => {
  stopPlayback();
  const v = Number(e.target.value);
  state.at = v >= Number(e.target.max) ? V().today : v;
  draw();
});
$('#play').addEventListener('click', play);
$('#zoom-in').addEventListener('click', () => mapView.zoomBy(1.3));
$('#zoom-out').addEventListener('click', () => mapView.zoomBy(1 / 1.3));
$('#zoom-fit').addEventListener('click', () => { select(null); mapView.fit(true); });
$('#back-btn').addEventListener('click', () => select(null));
$('#btn-report').addEventListener('click', () => openReport());
$('#btn-challenge').addEventListener('click', () => openChallenge());
$('#btn-account').addEventListener('click', openAccount);
$('#campaign-select').addEventListener('change', e => {
  const v = e.target.value;
  renderTopbar(); // snap the select back; the action below decides where we go
  if (v === '__join') return openJoin();
  if (v === '__create') return openCreate();
  navigate(v === 'demo' ? '/' : `/c/${v}`);
});
window.addEventListener('popstate', route);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.selected != null && !$('#modal').open) select(null); });

const confirmAct = (question, fn) => { if (window.confirm(question)) fn(); };
const act = (fn) => fn().catch(e => toast(esc(e.message)));

// Buttons inside the panel, tooltip, modals and toasts.
document.addEventListener('click', e => {
  const t = e.target.closest('[data-node],[data-report],[data-challenge],[data-report-event],[data-cancel-event],[data-act],[data-confirm],[data-dispute],[data-withdraw],[data-void],[data-retire],[data-copy],[data-go],#panel-back');
  if (!t) return;
  const d = t.dataset;
  if (t.id === 'panel-back') return select(null);
  if (d.node) return select(Number(d.node));
  if (d.report) return openReport({ node: Number(d.report) });
  if (d.challenge) return openChallenge({ node: Number(d.challenge) });
  if (d.reportEvent) {
    const ev = V().events.find(x => String(x.id) === d.reportEvent);
    return openReport({ node: nodeIndex.get(ev.node), players: ev.players, eventId: ev.id });
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
});

// Keep a campaign live: pick up other players' results and challenges.
setInterval(() => {
  if (V()?.kind !== 'campaign' || document.hidden || $('#modal').open || timer) return;
  loadCampaign(V().code, { keepDay: true }).catch(() => {});
}, 60e3);

refreshSession().then(route);
