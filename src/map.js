// Draws territory over the map image and handles pan / zoom / tilt.
// Territory = one Voronoi cell per point, coloured by its controller, softened
// at the edges by a blurred mask so control reads as an aura, not a grid.
const SVG = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};

const TILT_DEG = 42;
const FOCUS_ZOOM = 3.2; // relative to the fit-to-screen zoom

export class MapView {
  constructor({ viewport, map, graph, factions, onHover, onSelect }) {
    Object.assign(this, { viewport, map, graph, factions, onHover, onSelect });
    this.factionById = new Map(factions.map(f => [f.id, f]));
    this.view = { k: 1, x: 0, y: 0 };
    this.focus = null;

    this.world = viewport.querySelector('.world');
    this.world.style.width = `${map.width}px`;
    this.world.style.height = `${map.height}px`;
    this.world.querySelector('img').src = map.image;
    this.overlay = this.world.querySelector('.overlay');

    this.buildSvg();
    this.buildMarkers();
    this.bindInput();
    this.fit();
    new ResizeObserver(() => (this.focus == null ? this.fit() : this.focusOn(this.focus))).observe(viewport);
  }

  buildSvg() {
    const { map, graph } = this;
    const svg = this.world.querySelector('svg');
    svg.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    this.defs = el('defs', {}, svg);

    const blur = el('filter', { id: 'soften', filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: map.width, height: map.height }, this.defs);
    el('feGaussianBlur', { stdDeviation: map.reach * 0.22 }, blur);
    const mask = el('mask', { id: 'reach', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: map.width, height: map.height }, this.defs);
    const maskGroup = el('g', { filter: 'url(#soften)' }, mask);
    for (const n of map.nodes) el('circle', { cx: n.x, cy: n.y, r: map.reach, fill: '#fff' }, maskGroup);

    // Faint roads between neighbouring points.
    const roads = el('g', { class: 'roads' }, svg);
    graph.adj.forEach((js, i) => js.forEach(j => {
      if (j < i) return;
      const a = map.nodes[i], b = map.nodes[j];
      el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, roads);
    }));

    const territory = el('g', { mask: 'url(#reach)' }, svg);
    this.cells = graph.polys.map(poly => el('path', {
      class: 'cell',
      d: `M${poly.map(p => p.join(',')).join('L')}Z`,
    }, territory));
    this.borderLayer = el('g', { class: 'borders' }, territory);
    this.patterns = new Map();
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

  buildMarkers() {
    this.markers = this.map.nodes.map((n, i) => {
      const m = document.createElement('div');
      m.className = 'marker';
      m.style.left = `${n.x}px`;
      m.style.top = `${n.y}px`;
      m.innerHTML = `
        <div class="standee">
          <div class="battle-badge"></div>
          <svg class="banner" viewBox="0 0 24 34"><path d="M3 1v32" class="pole"/><path d="M4 3h17l-4 6 4 6H4z" class="flag"/></svg>
          <button class="pin" aria-label="${n.name}"></button>
          <div class="label">${n.name}</div>
        </div>`;
      const pin = m.querySelector('.pin');
      pin.addEventListener('pointerenter', e => this.onHover(i, e));
      pin.addEventListener('pointerleave', () => this.onHover(null));
      pin.addEventListener('click', e => { e.stopPropagation(); this.onSelect(i); });
      this.overlay.appendChild(m);
      return m;
    });
  }

  render(influence, eventsByNode) {
    influence.forEach((s, i) => {
      const cell = this.cells[i];
      const faction = s.owner && this.factionById.get(s.owner);
      if (!faction) {
        cell.style.fill = 'transparent';
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

  // --- camera -------------------------------------------------------------

  apply(animate) {
    const { k, x, y } = this.view;
    const f = this.focus != null ? this.map.nodes[this.focus] : { x: 0, y: 0 };
    const tilt = this.focus != null ? TILT_DEG : 0;
    // Rotate about the focused point while keeping the same screen mapping.
    this.world.style.transformOrigin = `${f.x}px ${f.y}px`;
    this.world.classList.toggle('animating', !!animate);
    this.world.style.transform =
      `translate(${x + (k - 1) * f.x}px, ${y + (k - 1) * f.y}px) scale(${k}) rotateX(${tilt}deg)`;
    this.world.style.setProperty('--k', k);
    this.world.style.setProperty('--tilt', `${tilt}deg`);
    this.viewport.classList.toggle('focused', this.focus != null);
    this.viewport.classList.toggle('far', k < 0.45); // too zoomed out for every label to fit
  }

  fit(animate) {
    const r = this.viewport.getBoundingClientRect();
    const k = Math.min(r.width / this.map.width, r.height / this.map.height);
    this.minK = k * 0.9;
    this.focus = null;
    this.view = { k, x: (r.width - this.map.width * k) / 2, y: (r.height - this.map.height * k) / 2 };
    this.apply(animate);
  }

  focusOn(i) {
    const r = this.viewport.getBoundingClientRect();
    const n = this.map.nodes[i];
    if (this.focus == null) this.saved = { ...this.view };
    this.focus = i;
    const k = FOCUS_ZOOM * Math.min(r.width / this.map.width, r.height / this.map.height);
    this.view = { k, x: r.width / 2 - k * n.x, y: r.height * 0.58 - k * n.y };
    this.apply(true);
    this.markers.forEach((m, j) => m.classList.toggle('selected', j === i));
  }

  unfocus() {
    this.focus = null;
    this.view = this.saved || this.view;
    this.apply(true);
    this.markers.forEach(m => m.classList.remove('selected'));
  }

  zoomBy(factor, cx, cy) {
    if (this.focus != null) this.unfocus();
    const r = this.viewport.getBoundingClientRect();
    cx ??= r.width / 2; cy ??= r.height / 2;
    const { k, x, y } = this.view;
    const k2 = Math.max(this.minK, Math.min(4, k * factor));
    this.view = { k: k2, x: cx - (cx - x) * (k2 / k), y: cy - (cy - y) * (k2 / k) };
    this.apply(false);
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
    let drag = null;
    vp.addEventListener('wheel', e => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      this.zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    vp.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, .tooltip')) return;
      drag = { x: e.clientX, y: e.clientY, vx: this.view.x, vy: this.view.y, moved: false };
    });
    window.addEventListener('pointermove', e => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        if (!drag.moved) {
          drag.moved = true;
          if (this.focus != null) { this.unfocus(); drag.vx = this.view.x; drag.vy = this.view.y; }
          vp.classList.add('dragging');
        }
        this.view.x = drag.vx + dx; this.view.y = drag.vy + dy;
        this.apply(false);
        return;
      }
      if (this.focus == null && e.target.closest('.viewport') === vp && !e.target.closest('.pin, button')) {
        const i = this.nodeAt(e.clientX, e.clientY);
        this.onHover(i, e);
      }
    });
    window.addEventListener('pointerup', e => {
      if (!drag) return;
      const wasClick = !drag.moved;
      drag = null;
      vp.classList.remove('dragging');
      if (!wasClick || e.target.closest('button')) return;
      if (this.focus != null) { this.onSelect(null); return; }
      const i = this.nodeAt(e.clientX, e.clientY);
      if (i != null) this.onSelect(i);
    });
    vp.addEventListener('pointerleave', () => this.onHover(null));
  }
}
