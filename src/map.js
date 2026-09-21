// Draws territory over a map image and handles pan / zoom / tilt.
// Territory = one Voronoi cell per point, coloured by its controller, softened
// at the edges by a blurred mask so control reads as an aura, not a grid.
// Indices here are local to the loaded map; main.js translates to setting-wide ones.
const SVG = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const TILT_DEG = 42;      // the tilt a focused place is shown at
const MAX_TILT = 62;      // any further and the far edge of the map folds away
const ORBIT_SPEED = 0.35; // degrees per pixel dragged
const FOCUS_ZOOM = 3.2; // relative to the fit-to-screen zoom
// Kinds whose labels only appear once you are fairly close in. Maps that do
// not say what a point is get a guess from its name: a range or a forest is
// scenery, a town is a town.
const MINOR_KINDS = new Set(['forge', 'plant', 'site', 'region', 'hamlet', 'mine', 'wilds', 'camp', 'ruin', 'glade', 'settlement']);
const SCENERY = /\b(Mountains?|Forest|Pass|Coast(line)?|Wastes?|Plains?|Marsh(es)?|Hills|Desert|Jungles?|Isles?|Road|Valley|Steppes?|Lands|Peaks|Ridge|Glacier|Wood|Swamps?|Bay|River|Delta|Gap|Wilds|Fjords?|Country|Reach|Straits?)\b/;
const isMinor = n => (n.kind ? MINOR_KINDS.has(n.kind) : SCENERY.test(n.name));

export class MapView {
  constructor({ viewport, onHover, onSelect, onGate }) {
    Object.assign(this, { viewport, onHover, onSelect, onGate });
    this.view = { k: 1, x: 0, y: 0, tilt: 0, spin: 0 };
    this.focus = null;
    this.map = null;
    this.world = viewport.querySelector('.world');
    this.svg = this.world.querySelector('svg');
    this.img = this.world.querySelector('img');
    this.overlay = this.world.querySelector('.overlay');
    this.bindInput();
    new ResizeObserver(() => {
      if (!this.map) return;
      if (this.focus == null) this.fit(); else this.focusOn(this.focus, false);
    }).observe(viewport);
  }

  // gates: [{ local, label, title }], the realmgates on this map, labelled with where they lead.
  load(map, graph, factions, gates = []) {
    Object.assign(this, { map, graph, factionById: new Map(factions.map(f => [f.id, f])) });
    this.focus = null;
    this.saved = null;
    this.world.style.width = `${map.width}px`;
    this.world.style.height = `${map.height}px`;
    const src = import.meta.env.BASE_URL + map.image.replace(/^\//, ''); // '/' locally, '/<repo>/' on Pages
    if (this.img.getAttribute('src') !== src) {
      this.viewport.classList.add('loading');
      const done = () => this.viewport.classList.remove('loading');
      this.img.addEventListener('load', done, { once: true });
      this.img.addEventListener('error', done, { once: true });
      this.img.src = src;
      if (this.img.complete) done();   // already in the cache
    }
    this.img.alt = `Map of ${map.name}`;
    this.svg.replaceChildren();
    this.overlay.replaceChildren();
    this.buildSvg();
    this.buildMarkers(gates);
    this.fit(false, true);   // a new map arrives seen from overhead
  }

  buildSvg() {
    const { map, graph, svg } = this;
    svg.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    this.defs = el('defs', {}, svg);

    const mask = el('mask', { id: 'reach', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: map.width, height: map.height }, this.defs);
    el('image', { href: this.reachMask(), x: 0, y: 0, width: map.width, height: map.height, preserveAspectRatio: 'none' }, mask);

    // Faint roads between neighbouring points.
    const roads = el('g', { class: 'roads' }, svg);
    this.roads = [];
    graph.adj.forEach((js, i) => js.forEach(j => {
      if (j < i) return;
      const a = map.nodes[i], b = map.nodes[j];
      this.roads.push({ i, j, line: el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, roads) });
    }));

    const territory = el('g', { mask: 'url(#reach)' }, svg);
    this.cells = graph.polys.map(poly => el('path', {
      class: 'cell',
      d: `M${poly.map(p => p.join(',')).join('L')}Z`,
    }, territory));
    this.borderLayer = el('g', { class: 'borders' }, territory);
    this.patterns = new Map();
  }

  // The soft edge where territory fades out: blurred circles around every point.
  // Rendered once to a small image; a live SVG blur over the whole map made every
  // pan and zoom repaint expensive.
  reachMask() {
    const { map } = this;
    const scale = 0.25;
    const w = Math.ceil(map.width * scale), h = Math.ceil(map.height * scale);
    const shapes = document.createElement('canvas');
    shapes.width = w; shapes.height = h;
    const sc = shapes.getContext('2d');
    sc.fillStyle = '#fff';
    for (const n of map.nodes) {
      sc.beginPath();
      sc.arc(n.x * scale, n.y * scale, map.reach * scale, 0, Math.PI * 2);
      sc.fill();
    }
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const oc = out.getContext('2d');
    oc.filter = `blur(${map.reach * 0.22 * scale}px)`; // browsers without canvas filters get hard edges
    oc.drawImage(shapes, 0, 0);
    return out.toDataURL('image/png');
  }

  // The campaign's level of faction detail changed: new colours, new names.
  setFactions(factions) {
    this.factionById = new Map(factions.map(f => [f.id, f]));
    this.patterns.clear();
    this.defs.querySelectorAll('pattern').forEach(p => p.remove());
  }

  stripes(a, b) {
    const id = `stripe-${a}-${b}`;
    if (!this.patterns.has(id)) {
      const p = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: 28, height: 28, patternTransform: 'rotate(45)' }, this.defs);
      el('rect', { width: 14, height: 28, fill: this.factionById.get(a).color }, p);
      el('rect', { x: 14, width: 14, height: 28, fill: this.factionById.get(b).color }, p);
      this.patterns.set(id, p);
    }
    return `url(#${id})`;
  }

  buildMarkers(gates) {
    const gatesAt = new Map();
    gates.forEach((g, k) => {
      if (!gatesAt.has(g.local)) gatesAt.set(g.local, []);
      gatesAt.get(g.local).push({ ...g, k });
    });
    this.markers = this.map.nodes.map((n, i) => {
      const m = document.createElement('div');
      m.className = 'marker';
      // What sort of place it is decides its marker, and how soon its label shows.
      if (n.kind) m.dataset.kind = n.kind;
      m.classList.toggle('minor', isMinor(n));
      m.classList.toggle('added', !!n.added);  // one of the gamemaster's own
      m.style.left = `${n.x}px`;
      m.style.top = `${n.y}px`;
      const portals = gatesAt.get(i) || [];
      m.classList.toggle('gate', portals.length > 0);
      m.innerHTML = `
        <div class="standee">
          <div class="battle-badge"></div>
          <svg class="banner" viewBox="0 0 24 34"><path d="M3 1v32" class="pole"/><path d="M4 3h17l-4 6 4 6H4z" class="flag"/></svg>
          <div class="plinth"><button class="pin" aria-label="${esc(n.name)}"></button></div>
          <div class="label">${esc(n.name)}</div>
          ${portals.map(g => `<button class="portal" data-gate="${g.k}" title="${esc(g.title)}">⟁ ${esc(g.label)}</button>`).join('')}
        </div>`;
      const pin = m.querySelector('.pin');
      pin.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') this.onHover(i, e); });
      pin.addEventListener('pointerleave', () => this.onHover(null));
      m.querySelector('.battle-badge').addEventListener('click', e => { e.stopPropagation(); this.onSelect(i); });
      pin.addEventListener('click', e => { e.stopPropagation(); this.onSelect(i); });
      m.querySelectorAll('.portal').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        this.onGate(Number(b.dataset.gate));
      }));
      this.overlay.appendChild(m);
      return m;
    });
  }

  render(influence, eventsByNode) {
    influence.forEach((s, i) => {
      const cell = this.cells[i];
      const faction = s.owner && this.factionById.get(s.owner);
      if (!faction) {
        // 'none', not 'transparent': under a luminance mask Chromium paints a
        // transparent fill as a black disc while the fill transition runs.
        cell.style.fill = 'none';
      } else {
        cell.style.fill = s.contested ? this.stripes(s.owner, s.rival) : faction.color;
        cell.style.fillOpacity = s.home ? 0.5 : (0.22 + 0.26 * Math.min(1, s.strength / 30)).toFixed(2);
      }
      const m = this.markers[i];
      m.classList.toggle('owned', !!faction);
      m.classList.toggle('home', !!s.home);
      m.classList.toggle('contested', s.contested);
      m.style.setProperty('--faction', faction ? faction.color : '#888');
      const events = eventsByNode.get(this.map.nodes[i].id) || [];
      const ev = m.querySelector('.battle-badge');
      ev.textContent = events.length ? `⚔${events.length > 1 ? ` ×${events.length}` : ''}` : '';
      ev.classList.toggle('live', events.some(e => e.live));
      m.classList.toggle('has-events', events.length > 0);
    });

    // Borders only where control changes hands.
    this.borderLayer.replaceChildren();
    for (const { i, j, a, b } of this.graph.borders) {
      const oi = influence[i].owner, oj = influence[j].owner;
      if (oi === oj) continue;
      el('line', {
        x1: a[0], y1: a[1], x2: b[0], y2: b[1],
        class: influence[i].contested || influence[j].contested ? 'contested' : '',
      }, this.borderLayer);
    }
  }

  pulse(i) {
    const m = this.markers[i];
    m.classList.remove('pulse'); void m.offsetWidth; m.classList.add('pulse');
  }

  // --- camera -------------------------------------------------------------

  // Wheel and drag fire faster than frames; write the transform at most once per frame.
  applySoon() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => { this.frame = null; this.apply(false); });
  }

  apply(animate) {
    if (this.frame) { cancelAnimationFrame(this.frame); this.frame = null; }
    const { k, x, y } = this.view;
    // Focusing a place tilts to look at it; otherwise the camera is wherever
    // it was left, and zooming does not disturb it.
    const tilt = this.focus != null ? TILT_DEG : this.view.tilt;
    const spin = this.focus != null ? 0 : this.view.spin;
    // The camera swings around the place being looked at — a focused one, or
    // else whatever the middle of the screen is currently over. Pivoting on
    // the map's corner instead would hurl its near edge into the lens.
    const r = this.viewport.getBoundingClientRect();
    const f = this.focus != null ? this.map.nodes[this.focus]
      : { x: (r.width / 2 - x) / k, y: (r.height / 2 - y) / k };
    // Rotate about that point while keeping the same screen mapping.
    this.world.style.transformOrigin = `${f.x}px ${f.y}px`;
    this.world.classList.toggle('animating', !!animate);
    this.world.style.transform =
      `translate(${x + (k - 1) * f.x}px, ${y + (k - 1) * f.y}px) scale(${k}) rotateX(${tilt}deg) rotate(${spin}deg)`;
    this.world.style.setProperty('--k', k);
    this.world.style.setProperty('--tilt', `${tilt}deg`);
    this.world.style.setProperty('--spin', `${spin}deg`);
    this.viewport.classList.toggle('tilted', tilt > 4);
    this.viewport.classList.toggle('focused', this.focus != null);
    // Labels come in as you zoom past the fit-to-screen scale, later on dense
    // maps: homes first, then the towns, then the lesser sites.
    const density = Math.min(1.6, Math.max(1, Math.sqrt(this.map.nodes.length / 120)));
    const rel = this.fitK > 0 ? k / this.fitK : 1;
    this.viewport.classList.toggle('far', rel < 2.0 * density);
    this.viewport.classList.toggle('mid', rel < 3.4 * density);
  }

  // Labels can be switched off entirely; the selected place keeps its name.
  setLabels(on) {
    this.viewport.classList.toggle('no-labels', !on);
  }

  // Frames the whole map. `level` also puts the camera back overhead, which is
  // what the reset button is for — a window resize reframes but leaves the
  // camera where the player put it.
  fit(animate, level = false) {
    const r = this.viewport.getBoundingClientRect();
    // Not laid out yet (a route change mid-load): try again next frame rather
    // than fitting to a zero-sized box.
    if (!r.width || !r.height) { requestAnimationFrame(() => this.fit(animate, level)); return; }
    const k = Math.min(r.width / this.map.width, r.height / this.map.height);
    this.minK = k * 0.9;
    this.fitK = k;
    this.focus = null;
    const { tilt, spin } = level ? { tilt: 0, spin: 0 } : this.view;
    this.view = { k, x: (r.width - this.map.width * k) / 2, y: (r.height - this.map.height * k) / 2, tilt, spin };
    this.apply(animate);
    this.markers?.forEach(m => m.classList.remove('selected'));
  }

  focusOn(i, animate = true) {
    const r = this.viewport.getBoundingClientRect();
    const n = this.map.nodes[i];
    if (this.focus == null) this.saved = { ...this.view };
    this.focus = i;
    const k = FOCUS_ZOOM * Math.min(r.width / this.map.width, r.height / this.map.height);
    this.view = { ...this.view, k, x: r.width / 2 - k * n.x, y: r.height * 0.58 - k * n.y };
    this.apply(animate);
    this.markers.forEach((m, j) => m.classList.toggle('selected', j === i));
    this.litRoads(i);
  }

  // Bring the selected place's roads forward, so its neighbours are obvious.
  litRoads(i) {
    for (const r of this.roads || []) r.line.classList.toggle('lit', i != null && (r.i === i || r.j === i));
    this.svg.classList.toggle('has-lit', i != null);
  }

  unfocus() {
    if (this.focus == null) return;
    this.focus = null;
    this.view = this.saved || this.view;
    this.apply(true);
    this.markers.forEach(m => m.classList.remove('selected'));
    this.litRoads(null);
  }

  zoomBy(factor, cx, cy) {
    if (this.focus != null) this.unfocus();
    const r = this.viewport.getBoundingClientRect();
    cx ??= r.width / 2; cy ??= r.height / 2;
    const { k, x, y } = this.view;
    const k2 = Math.max(this.minK, Math.min(4, k * factor));
    // Zooming keeps the camera where it was: only the reset levels it.
    this.view = { ...this.view, k: k2, x: cx - (cx - x) * (k2 / k), y: cy - (cy - y) * (k2 / k) };
    this.applySoon();
  }

  toWorld(clientX, clientY) {
    const r = this.viewport.getBoundingClientRect();
    return [(clientX - r.left - this.view.x) / this.view.k, (clientY - r.top - this.view.y) / this.view.k];
  }

  nodeAt(clientX, clientY) {
    const [x, y] = this.toWorld(clientX, clientY);
    if (x < 0 || y < 0 || x > this.map.width || y > this.map.height) return null;
    const i = this.graph.delaunay.find(x, y);
    const n = this.map.nodes[i];
    return Math.hypot(n.x - x, n.y - y) <= this.map.reach ? i : null;
  }

  bindInput() {
    const vp = this.viewport;
    const pointers = new Map(); // pointerId -> { x, y } for every finger or mouse button down on the map
    let drag = null;
    let pinch = null;
    // While the all-realms overview is showing, the map underneath ignores input.
    const active = () => this.map && !vp.classList.contains('overview');
    const chrome = '.tooltip, .realm-bar, .realms-overview, .map-controls, .back-btn, .peek';
    const local = e => { const r = vp.getBoundingClientRect(); return [e.x - r.left, e.y - r.top]; };
    const twoFingers = () => {
      const [a, b] = [...pointers.values()];
      return { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    };

    vp.addEventListener('wheel', e => {
      if (!active() || e.target.closest(chrome)) return;
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      this.zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    // Middle mouse moves the camera rather than the map: drag up and down to
    // tilt towards the horizon, left and right to swing around.
    let orbit = null;
    vp.addEventListener('pointerdown', e => {
      if (active() && e.pointerType === 'mouse' && e.button === 1 && !e.target.closest(chrome)) {
        e.preventDefault();
        if (this.focus != null) this.unfocus();
        orbit = { x: e.clientX, y: e.clientY, tilt: this.view.tilt, spin: this.view.spin };
        try { vp.setPointerCapture(e.pointerId); } catch { /* the drag is tracked on window anyway */ }
        vp.classList.add('orbiting');
        this.onHover(null);
        return;
      }
      if (!active() || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest(`button, ${chrome}`)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        // Second finger: stop dragging and pinch around the two fingers' midpoint.
        drag = null;
        if (this.focus != null) this.unfocus();
        const { dist, mid } = twoFingers();
        const [mx, my] = local(mid);
        pinch = { dist, mx, my, view: { ...this.view } };
        vp.classList.add('dragging');
        this.onHover(null);
      } else if (pointers.size === 1) {
        drag = { x: e.clientX, y: e.clientY, vx: this.view.x, vy: this.view.y, moved: false };
      }
    });

    window.addEventListener('pointermove', e => {
      if (orbit) {
        this.view.tilt = Math.max(0, Math.min(MAX_TILT, orbit.tilt + (e.clientY - orbit.y) * ORBIT_SPEED));
        this.view.spin = orbit.spin + (e.clientX - orbit.x) * ORBIT_SPEED;
        this.apply();
        return;
      }
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size >= 2) {
        const { dist, mid } = twoFingers();
        const [mx, my] = local(mid);
        const v = pinch.view;
        const k = Math.max(this.minK, Math.min(4, v.k * dist / pinch.dist));
        // Keep the map point that started under the fingers under them as they move.
        const wx = (pinch.mx - v.x) / v.k, wy = (pinch.my - v.y) / v.k;
        this.view = { ...this.view, k, x: mx - wx * k, y: my - wy * k };
        this.applySoon();
        return;
      }
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        if (!drag.moved) {
          drag.moved = true;
          if (this.focus != null) { this.unfocus(); drag.vx = this.view.x; drag.vy = this.view.y; }
          vp.classList.add('dragging');
        }
        this.view.x = drag.vx + dx; this.view.y = drag.vy + dy;
        this.applySoon();
        return;
      }
      // Hover tooltips are for mice; a finger tap selects instead.
      if (e.pointerType !== 'touch' && active() && this.focus == null && e.target instanceof Element
        && e.target.closest('.viewport') === vp && !e.target.closest(`.pin, button, ${chrome}`)) {
        this.onHover(this.nodeAt(e.clientX, e.clientY), e);
      }
    });

    const release = e => {
      if (!pointers.delete(e.pointerId)) return;
      if (pinch) {
        // Ending a pinch never counts as a tap; the remaining finger can't start a drag either.
        if (pointers.size < 2) { pinch = null; drag = null; }
        if (pointers.size === 0) vp.classList.remove('dragging');
        return;
      }
      if (!drag) return;
      const wasClick = !drag.moved && e.type === 'pointerup';
      drag = null;
      vp.classList.remove('dragging');
      if (!wasClick || e.target.closest('button')) return;
      // Somebody may be waiting to be told where on the map this was.
      if (this.onGround?.(...this.toWorld(e.clientX, e.clientY))) return;
      if (this.focus != null) { this.onSelect(null); return; }
      const i = this.nodeAt(e.clientX, e.clientY);
      if (i != null) this.onSelect(i);
    };
    const endOrbit = () => { if (orbit) { orbit = null; vp.classList.remove('orbiting'); } };
    window.addEventListener('pointerup', e => { endOrbit(); release(e); });
    vp.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });
    window.addEventListener('pointercancel', release);
    vp.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') this.onHover(null); });
  }
}
