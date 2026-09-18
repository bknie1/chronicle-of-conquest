// Dev-only visual map editor (/editor.html). Lets someone place and fix a
// map's points on top of its image instead of hand-typing coordinates, and
// is how new maps get made. Never shipped in production (see README and the
// build/server guards in server/index.js).
import './editor.css';
import { buildGraph } from './engine.js';
import { MAPS } from './data/maps/index.js';

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const ID_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/; // lowercase-kebab, matches server-side validation
const clone = v => JSON.parse(JSON.stringify(v));
const MAX_UNDO = 50;

const state = {
  mapId: null,
  map: null,        // working copy: { id, name, image, width, height, maxEdge, reach, factions, nodes, extraLinks, blockedLinks }
  isNew: false,      // true until this id has ever been saved (not yet registered in MAPS)
  graph: null,       // buildGraph() output, or null while there are too few points
  selected: null,    // index into map.nodes
  mode: 'select',    // 'select' | 'add' | 'link'
  linkFirst: null,   // index awaiting a second click while linking
  view: { k: 1, x: 0, y: 0 },
  history: [],       // stack of map snapshots, most recent last
  dirty: false,
};

const extraMaps = {}; // transient new/unsaved maps, keyed by id, merged with MAPS for the picker

// --- graph / geometry ------------------------------------------------------

function rebuildGraph() {
  const m = state.map;
  if (!m || m.nodes.length < 2) { state.graph = null; return; }
  try {
    state.graph = buildGraph(m.nodes, m.width, m.height, m.maxEdge, { extraLinks: m.extraLinks, blockedLinks: m.blockedLinks });
  } catch {
    state.graph = null; // e.g. degenerate/coincident points mid-drag
  }
}

const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
const hasPair = (list, a, b) => list.some(([x, y]) => pairKey(x, y) === pairKey(a, b));
const withoutPair = (list, a, b) => list.filter(([x, y]) => pairKey(x, y) !== pairKey(a, b));

// --- history / dirty tracking ----------------------------------------------

function pushHistory() {
  state.history.push(clone(state.map));
  if (state.history.length > MAX_UNDO) state.history.shift();
  state.dirty = true;
  updateUndoButton();
}

function undo() {
  if (!state.history.length) return;
  state.map = state.history.pop();
  state.selected = null;
  state.dirty = state.history.length > 0;
  rebuildGraph();
  draw();
  renderPanel();
  updateUndoButton();
}

function updateUndoButton() {
  $('#btn-undo').disabled = state.history.length === 0;
}

window.addEventListener('beforeunload', e => {
  if (!state.dirty) return;
  e.preventDefault();
  e.returnValue = '';
});

// --- map loading -------------------------------------------------------

function allMaps() { return { ...MAPS, ...extraMaps }; }

function loadMap(id) {
  const src = allMaps()[id];
  if (!src) return;
  state.mapId = id;
  state.map = clone(src);
  state.map.extraLinks ||= [];
  state.map.blockedLinks ||= [];
  state.isNew = !MAPS[id];
  state.selected = null;
  state.mode = 'select';
  state.linkFirst = null;
  state.history = [];
  state.dirty = false;
  updateUndoButton();
  rebuildGraph();
  renderMapSelect();
  fit();
  draw();
  renderPanel();
}

function confirmDiscardIfDirty() {
  if (!state.dirty) return true;
  return window.confirm('You have unsaved changes. Discard them?');
}

// --- viewport (pan / zoom) --------------------------------------------------

function fit() {
  const m = state.map;
  const vp = $('#viewport');
  if (!m) return;
  const r = vp.getBoundingClientRect();
  const k = Math.min(r.width / m.width, r.height / m.height) * 0.94;
  state.view = { k, x: (r.width - m.width * k) / 2, y: (r.height - m.height * k) / 2 };
  applyView();
}

function applyView() {
  const { k, x, y } = state.view;
  $('#world').style.transform = `translate(${x}px, ${y}px) scale(${k})`;
}

function zoomBy(factor, cx, cy) {
  const vp = $('#viewport');
  const r = vp.getBoundingClientRect();
  cx ??= r.width / 2; cy ??= r.height / 2;
  const { k, x, y } = state.view;
  const k2 = Math.max(0.05, Math.min(8, k * factor));
  state.view = { k: k2, x: cx - (cx - x) * (k2 / k), y: cy - (cy - y) * (k2 / k) };
  applyView();
  draw(); // point/stroke sizes are compensated for zoom, so redraw
}

function toWorld(clientX, clientY) {
  const r = $('#viewport').getBoundingClientRect();
  return [(clientX - r.left - state.view.x) / state.view.k, (clientY - r.top - state.view.y) / state.view.k];
}

// --- drawing -----------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

function draw() {
  const svg = $('#overlay-svg');
  const world = $('#world');
  const m = state.map;
  $('#empty-state').hidden = !!m;
  if (!m) { svg.replaceChildren(); return; }

  if (world.dataset.mapId !== state.mapId || world.dataset.image !== m.image) {
    world.style.width = `${m.width}px`;
    world.style.height = `${m.height}px`;
    svg.setAttribute('viewBox', `0 0 ${m.width} ${m.height}`);
    $('#map-image').src = m.image;
    world.dataset.mapId = state.mapId;
    world.dataset.image = m.image;
  }

  const g = state.graph;
  const k = state.view.k || 1;
  const sw = Math.max(0.75, 1.5 / k);
  const nodes = m.nodes;
  const idIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const extraSet = new Set(m.extraLinks.map(([a, b]) => pairKey(a, b)));

  const frag = document.createDocumentFragment();

  // Voronoi cell outlines
  if (g) {
    for (const poly of g.polys) {
      if (!poly) continue;
      frag.appendChild(el('path', { class: 'cell', 'stroke-width': sw, d: `M${poly.map(p => p.join(',')).join('L')}Z` }));
    }
  }

  // Reach circles
  for (const n of nodes) frag.appendChild(el('circle', { class: 'reach-circle', cx: n.x, cy: n.y, r: m.reach, 'stroke-width': sw }));

  // Neighbour / forced links
  if (g) {
    g.adj.forEach((js, i) => js.forEach(j => {
      if (j < i) return;
      const key = pairKey(nodes[i].id, nodes[j].id);
      const cls = extraSet.has(key) ? 'link-extra' : 'link-line';
      frag.appendChild(el('line', {
        class: cls, x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y, 'stroke-width': cls === 'link-line' ? sw : sw * 2,
      }));
    }));
  }

  // Blocked links (drawn even though they're absent from adj, so they stay editable)
  for (const [a, b] of m.blockedLinks) {
    const i = idIndex.get(a), j = idIndex.get(b);
    if (i == null || j == null) continue;
    frag.appendChild(el('line', {
      class: 'link-blocked', x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y, 'stroke-width': sw * 2,
    }));
  }

  // Points + labels
  const homeIds = new Set(m.factions.map(f => f.home));
  nodes.forEach((n, i) => {
    const r = 9 / k;
    const cls = ['node-point'];
    if (i === state.selected) cls.push('selected');
    if (homeIds.has(n.id)) cls.push('home');
    if (i === state.linkFirst) cls.push('link-pending');
    const circle = el('circle', { class: cls.join(' '), cx: n.x, cy: n.y, r, 'stroke-width': 2 / k, 'data-index': i });
    frag.appendChild(circle);
    const label = el('text', { class: 'node-label', x: n.x + r + 4 / k, y: n.y + 4 / k, 'font-size': 13 / k, 'stroke-width': 3 / k });
    label.textContent = n.name || n.id;
    frag.appendChild(label);
  });

  svg.replaceChildren(frag);
}

// --- point mutation helpers --------------------------------------------

function uniqueId(base) {
  const existing = new Set(state.map.nodes.map(n => n.id));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function addPoint(x, y) {
  pushHistory();
  const id = uniqueId('point');
  state.map.nodes.push({ id, name: 'New point', region: '', x: Math.round(x), y: Math.round(y) });
  state.selected = state.map.nodes.length - 1;
  rebuildGraph();
  draw();
  renderPanel();
}

function deletePoint(i) {
  const m = state.map;
  const n = m.nodes[i];
  const homeOf = m.factions.filter(f => f.home === n.id);
  if (homeOf.length && !window.confirm(
    `"${n.name || n.id}" is the home of ${homeOf.map(f => f.name).join(', ')}. Deleting it leaves ${homeOf.length > 1 ? 'them' : 'that faction'} without a home until you reassign one. Delete anyway?`
  )) return;
  pushHistory();
  m.nodes.splice(i, 1);
  m.extraLinks = m.extraLinks.filter(([a, b]) => a !== n.id && b !== n.id);
  m.blockedLinks = m.blockedLinks.filter(([a, b]) => a !== n.id && b !== n.id);
  state.selected = null;
  rebuildGraph();
  draw();
  renderPanel();
}

function renamePoint(i, newId) {
  const m = state.map;
  const n = m.nodes[i];
  if (newId === n.id) return true;
  if (!ID_RE.test(newId)) { toast('Ids must be lowercase-kebab, e.g. "black-fire-pass".', true); return false; }
  if (m.nodes.some((o, j) => j !== i && o.id === newId)) { toast(`"${newId}" is already used.`, true); return false; }
  pushHistory();
  const oldId = n.id;
  n.id = newId;
  m.extraLinks = m.extraLinks.map(([a, b]) => [a === oldId ? newId : a, b === oldId ? newId : b]);
  m.blockedLinks = m.blockedLinks.map(([a, b]) => [a === oldId ? newId : a, b === oldId ? newId : b]);
  const affected = m.factions.filter(f => f.home === oldId);
  for (const f of affected) f.home = newId;
  if (affected.length) toast(`Updated ${affected.map(f => f.name).join(', ')}'s home to "${newId}".`);
  rebuildGraph();
  draw();
  renderPanel();
  return true;
}

function toggleLink(idA, idB) {
  if (idA === idB) return;
  pushHistory();
  const m = state.map;
  let msg;
  if (hasPair(m.extraLinks, idA, idB)) {
    m.extraLinks = withoutPair(m.extraLinks, idA, idB);
    m.blockedLinks = [...m.blockedLinks, [idA, idB]];
    msg = `Blocked ${idA} ↔ ${idB}.`;
  } else if (hasPair(m.blockedLinks, idA, idB)) {
    m.blockedLinks = withoutPair(m.blockedLinks, idA, idB);
    msg = `${idA} ↔ ${idB} back to automatic.`;
  } else {
    m.extraLinks = [...m.extraLinks, [idA, idB]];
    msg = `Forced a link ${idA} ↔ ${idB}.`;
  }
  rebuildGraph();
  draw();
  toast(msg);
}

// --- pointer input -------------------------------------------------------

function bindInput() {
  const vp = $('#viewport');
  let drag = null; // { kind: 'pan'|'point', ...}

  vp.addEventListener('wheel', e => {
    if (!state.map) return;
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  vp.addEventListener('pointerdown', e => {
    if (!state.map || e.button !== 0) return;
    const idx = e.target.dataset?.index;
    if (idx != null) {
      drag = { kind: 'point', index: Number(idx), moved: false, historyPushed: false };
    } else {
      drag = { kind: 'pan', x: e.clientX, y: e.clientY, vx: state.view.x, vy: state.view.y, moved: false };
    }
  });

  window.addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.kind === 'pan') {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      vp.classList.add('dragging');
      state.view.x = drag.vx + dx; state.view.y = drag.vy + dy;
      applyView();
    } else if (drag.kind === 'point') {
      if (!drag.historyPushed) { pushHistory(); drag.historyPushed = true; }
      drag.moved = true;
      const [x, y] = toWorld(e.clientX, e.clientY);
      const n = state.map.nodes[drag.index];
      n.x = Math.round(Math.max(0, Math.min(state.map.width, x)));
      n.y = Math.round(Math.max(0, Math.min(state.map.height, y)));
      draw(); // cheap enough at editor scale; keeps cells/links live while dragging
      if (state.selected === drag.index) renderPanel();
    }
  });

  window.addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag; drag = null;
    vp.classList.remove('dragging');
    if (d.kind === 'pan') {
      if (!d.moved) handleEmptyClick(e);
      return;
    }
    // point
    if (!d.moved) handlePointClick(d.index, e);
    else { rebuildGraph(); draw(); }
  });
}

function handleEmptyClick(e) {
  if (state.mode === 'add') {
    const [x, y] = toWorld(e.clientX, e.clientY);
    if (x < 0 || y < 0 || x > state.map.width || y > state.map.height) return;
    addPoint(x, y);
  } else {
    state.selected = null;
    state.linkFirst = null;
    draw();
    renderPanel();
  }
}

function handlePointClick(index, e) {
  const linking = state.mode === 'link' || e.shiftKey;
  if (linking) {
    if (state.linkFirst == null) {
      state.linkFirst = index;
    } else if (state.linkFirst === index) {
      state.linkFirst = null;
    } else {
      toggleLink(state.map.nodes[state.linkFirst].id, state.map.nodes[index].id);
      state.linkFirst = null;
    }
    draw();
    return;
  }
  state.selected = index;
  draw();
  renderPanel();
}

// --- side panel ----------------------------------------------------------

function renderPanel() {
  const panel = $('#panel');
  const m = state.map;
  if (!m) { panel.innerHTML = '<p class="muted">Pick a map above, or start a new one.</p>'; return; }

  panel.innerHTML = `
    ${state.selected != null ? pointFields(m.nodes[state.selected]) : ''}
    <h3>Map settings</h3>
    <label><span id="maxedge-label">Max neighbour distance (maxEdge) — ${m.maxEdge}px</span>
      <input type="range" id="f-maxedge" min="50" max="${Math.round(Math.hypot(m.width, m.height) / 2)}" step="5" value="${m.maxEdge}"></label>
    <label><span id="reach-label">Influence reach — ${m.reach}px</span>
      <input type="range" id="f-reach" min="20" max="${Math.round(Math.min(m.width, m.height) / 2)}" step="5" value="${m.reach}"></label>
    <p class="muted small">${m.nodes.length} point${m.nodes.length === 1 ? '' : 's'}${state.graph ? '' : ' — add at least 2 to see cells and links'}</p>

    <h3>Faction homes</h3>
    <ul id="faction-homes">${m.factions.map((f, i) => `
      <li class="faction-row">
        <span class="swatch" style="background:${esc(f.color)}"></span>
        <span>${esc(f.name)}</span>
        <select data-faction="${i}">${m.nodes.map(n => `<option value="${esc(n.id)}" ${n.id === f.home ? 'selected' : ''}>${esc(n.name || n.id)}</option>`).join('')}</select>
      </li>`).join('') || '<li class="muted">No factions yet.</li>'}</ul>`;

  $('#f-maxedge')?.addEventListener('pointerdown', () => pushHistory());
  $('#f-maxedge')?.addEventListener('input', e => {
    state.map.maxEdge = Number(e.target.value);
    rebuildGraph(); draw();
    $('#maxedge-label').textContent = `Max neighbour distance (maxEdge) — ${state.map.maxEdge}px`;
  });
  $('#f-reach')?.addEventListener('pointerdown', () => pushHistory());
  $('#f-reach')?.addEventListener('input', e => {
    state.map.reach = Number(e.target.value);
    draw();
    $('#reach-label').textContent = `Influence reach — ${state.map.reach}px`;
  });
  panel.querySelectorAll('[data-faction]').forEach(sel => sel.addEventListener('change', e => {
    pushHistory();
    state.map.factions[Number(e.target.dataset.faction)].home = e.target.value;
    draw();
  }));

  if (state.selected != null) bindPointFields();
}

function pointFields(n) {
  return `
    <h3>Point</h3>
    <div class="field-grid">
      <label>Id<input id="f-id" value="${esc(n.id)}"></label>
      <label>Region<input id="f-region" value="${esc(n.region || '')}"></label>
    </div>
    <label>Name<input id="f-name" value="${esc(n.name || '')}"></label>
    <div class="field-grid">
      <label>X<input id="f-x" type="number" value="${n.x}"></label>
      <label>Y<input id="f-y" type="number" value="${n.y}"></label>
    </div>
    <div class="row"><button class="danger" id="f-delete">Delete point</button></div>`;
}

function bindPointFields() {
  const i = state.selected;
  const n = () => state.map.nodes[i];
  $('#f-id').addEventListener('change', e => { if (!renamePoint(i, e.target.value.trim())) e.target.value = n().id; });
  $('#f-name').addEventListener('change', e => { pushHistory(); n().name = e.target.value.trim(); draw(); });
  $('#f-region').addEventListener('change', e => { pushHistory(); n().region = e.target.value.trim(); draw(); });
  $('#f-x').addEventListener('change', e => { pushHistory(); n().x = Number(e.target.value) || 0; rebuildGraph(); draw(); });
  $('#f-y').addEventListener('change', e => { pushHistory(); n().y = Number(e.target.value) || 0; rebuildGraph(); draw(); });
  $('#f-delete').addEventListener('click', () => deletePoint(i));
}

// --- map picker / modes / toolbar ------------------------------------------

function renderMapSelect() {
  const sel = $('#map-select');
  const maps = allMaps();
  sel.innerHTML = Object.values(maps).map(m => `<option value="${esc(m.id)}" ${m.id === state.mapId ? 'selected' : ''}>${esc(m.name)}${extraMaps[m.id] ? ' (new, unsaved)' : ''}</option>`).join('');
}

function setMode(mode) {
  state.mode = mode;
  state.linkFirst = null;
  document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b.id === `mode-${mode}`));
  $('#viewport').classList.toggle('mode-add', mode === 'add');
  $('#viewport').classList.toggle('mode-link', mode === 'link');
  $('#hint').textContent = mode === 'add' ? 'Click the map to add a point.'
    : mode === 'link' ? 'Click two points to force, block, then clear a link between them.'
    : '';
  draw();
}

function toast(html, isError) {
  const t = $('#toast');
  t.innerHTML = esc(html);
  t.classList.toggle('error', !!isError);
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
}

// --- save / export ---------------------------------------------------------

async function save() {
  if (!state.map) return;
  const btn = $('#btn-save');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    const res = await fetch(`/api/dev/maps/${encodeURIComponent(state.mapId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.map),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Save failed (${res.status}).`);
    state.dirty = false;
    state.history = [];
    updateUndoButton();
    if (state.isNew) {
      const constName = state.mapId.toUpperCase().replace(/-/g, '_');
      openModal(`
        <h2>Saved</h2>
        <p>Wrote <code>${esc(data.wrote)}</code>. This map isn't registered yet — add it to <code>src/data/maps/index.js</code>:</p>
        <pre style="white-space:pre-wrap;background:var(--panel-2);padding:8px;border-radius:5px;font-size:13px">import ${constName} from './${esc(state.mapId)}.json' assert { type: 'json' };

export const MAPS = {
  ...
  '${esc(state.mapId)}': ${constName},
};</pre>
        <div class="row"><button class="primary" value="cancel">Got it</button></div>`);
    } else {
      toast(`Saved to ${data.wrote}.`);
    }
  } catch (e) {
    toast(e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Save';
  }
}

function download() {
  if (!state.map) return;
  const blob = new Blob([JSON.stringify(state.map, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.mapId}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function copyJson() {
  if (!state.map) return;
  const text = JSON.stringify(state.map, null, 2);
  navigator.clipboard?.writeText(text).then(() => toast('Copied JSON to clipboard.'), () => toast('Could not copy — see console.', true));
}

// --- modals ------------------------------------------------------------

function openModal(html, onSubmit) {
  const modal = $('#modal');
  modal.innerHTML = `<form method="dialog">${html}<p class="error" role="alert"></p></form>`;
  const form = modal.querySelector('form');
  if (onSubmit) {
    form.addEventListener('submit', async e => {
      if (e.submitter?.value === 'cancel') return;
      e.preventDefault();
      const err = form.querySelector('.error');
      err.textContent = '';
      try {
        const msg = await onSubmit(new FormData(form), form);
        if (msg) err.textContent = msg;
        else if (modal.open) modal.close();
      } catch (ex) {
        err.textContent = ex.message;
      }
    });
  }
  modal.showModal();
  return form;
}

async function openNewMapModal() {
  let images = [];
  try {
    const res = await fetch('/api/dev/map-images');
    images = (await res.json()).images || [];
  } catch { /* dev endpoint unavailable */ }

  let picked = images[0] || '';
  const form = openModal(`
    <h2>New map</h2>
    <label>Source image</label>
    <div class="image-pick">${images.map(f => `<button type="button" class="pick-img ${f === picked ? 'selected' : ''}" data-file="${esc(f)}">
      <img src="/maps/${esc(f)}" alt=""><span class="muted" style="font-size:11px">${esc(f)}</span></button>`).join('') || '<p class="muted">No images in public/maps.</p>'}</div>
    <label>Map id (lowercase-kebab)<input name="id" required placeholder="e.g. mortal-realms" pattern="[a-z][a-z0-9]*(-[a-z0-9]+)*"></label>
    <label>Name<input name="name" required placeholder="e.g. The Mortal Realms"></label>
    <div class="row"><button value="cancel" formnovalidate>Cancel</button><button class="primary">Create</button></div>`,
  async data => {
    if (!picked) return 'Pick a source image.';
    const id = String(data.get('id')).trim().toLowerCase();
    const name = String(data.get('name')).trim();
    if (!ID_RE.test(id)) return 'Ids must be lowercase-kebab, e.g. "mortal-realms".';
    if (allMaps()[id]) return `"${id}" already exists.`;
    if (!name) return 'Give it a name.';
    const size = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Could not load that image.'));
      img.src = `/maps/${picked}`;
    });
    extraMaps[id] = {
      id, name, image: `/maps/${picked}`, width: size.width, height: size.height,
      maxEdge: 400, reach: 150, factions: [], nodes: [], extraLinks: [], blockedLinks: [],
    };
    loadMap(id);
    toast(`Started "${name}". Add points, then Save.`);
  });
  form.querySelectorAll('.pick-img').forEach(btn => btn.addEventListener('click', () => {
    picked = btn.dataset.file;
    form.querySelectorAll('.pick-img').forEach(b => b.classList.toggle('selected', b === btn));
  }));
}

// --- boot ------------------------------------------------------------------

function boot() {
  renderMapSelect();
  bindInput();
  new ResizeObserver(() => state.map && fit()).observe($('#viewport'));

  $('#map-select').addEventListener('change', e => {
    if (!confirmDiscardIfDirty()) { renderMapSelect(); return; }
    loadMap(e.target.value);
  });
  $('#mode-select').addEventListener('click', () => setMode('select'));
  $('#mode-add').addEventListener('click', () => setMode(state.mode === 'add' ? 'select' : 'add'));
  $('#mode-link').addEventListener('click', () => setMode(state.mode === 'link' ? 'select' : 'link'));
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-new-map').addEventListener('click', () => { if (confirmDiscardIfDirty()) openNewMapModal(); });
  $('#empty-new-map').addEventListener('click', () => openNewMapModal());
  $('#btn-download').addEventListener('click', download);
  $('#btn-copy').addEventListener('click', copyJson);
  $('#btn-save').addEventListener('click', save);
  $('#zoom-in').addEventListener('click', () => zoomBy(1.3));
  $('#zoom-out').addEventListener('click', () => zoomBy(1 / 1.3));
  $('#zoom-fit').addEventListener('click', fit);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    if (e.key === 'Escape') { state.selected = null; state.linkFirst = null; draw(); renderPanel(); }
    if (e.key === 'Delete' && state.selected != null && document.activeElement.tagName !== 'INPUT') deletePoint(state.selected);
  });

  const firstId = Object.keys(MAPS)[0];
  if (firstId) loadMap(firstId); else renderPanel();
}

boot();
