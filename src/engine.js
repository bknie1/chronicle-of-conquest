// Influence engine. Nothing about territory is stored: the map at any moment
// is derived from the log of confirmed games up to that moment. Decay, replay
// and corrections all fall out of that.
import { Delaunay } from 'd3-delaunay';

export const RULES = {
  halfLifeDays: 21,    // a win's weight halves every 3 weeks
  win: [10, 4, 1],     // influence gained by the winner at the site, 1 hop, 2 hops away
  loss: [-6, -2, 0],   // influence the loser gives up
  home: [100, 12, 4],  // permanent influence around a faction's home
  controlThreshold: 8, // below this, a region is unclaimed
  contestedRatio: 0.75, // runner-up within 75% of the leader = contested
  fadingDays: 21,      // players idle this long are marked as fading
};

// options.extraLinks / options.blockedLinks are pairs of node ids ([idA, idB])
// that override the automatic Delaunay + maxEdge adjacency: a map author uses
// them when two points across a sea auto-link, or a mountain pass that should
// connect is just past maxEdge. They only affect `adj` (and so `hops`), not
// the Voronoi geometry or the border segments drawn between cells.
export function buildGraph(nodes, width, height, maxEdge, options = {}) {
  const { extraLinks = [], blockedLinks = [], nodeIds } = options;
  const indexOf = new Map((nodeIds || nodes.map(n => n.id)).map((id, i) => [id, i]));
  const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
  const toIndexPair = ([a, b]) => [indexOf.get(a), indexOf.get(b)];
  const blocked = new Set(
    blockedLinks.map(toIndexPair).filter(([a, b]) => a != null && b != null).map(([a, b]) => pairKey(a, b))
  );

  const delaunay = Delaunay.from(nodes, n => n.x, n => n.y);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const polys = nodes.map((_, i) => voronoi.cellPolygon(i));
  const adj = nodes.map(() => []);
  const borders = [];
  const linked = new Set();

  for (let i = 0; i < nodes.length; i++) {
    for (const j of delaunay.neighbors(i)) {
      if (j <= i) continue;
      const shared = sharedEdge(polys[i], polys[j]);
      if (shared) borders.push({ i, j, a: shared[0], b: shared[1] });
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d <= maxEdge && !blocked.has(pairKey(i, j))) {
        adj[i].push(j); adj[j].push(i); linked.add(pairKey(i, j));
      }
    }
  }

  for (const pair of extraLinks) {
    const [i, j] = toIndexPair(pair);
    if (i == null || j == null || i === j) continue;
    const key = pairKey(i, j);
    if (blocked.has(key) || linked.has(key)) continue;
    adj[i].push(j); adj[j].push(i); linked.add(key);
  }

  const hopCache = new Map();
  const hops = start => {
    if (hopCache.has(start)) return hopCache.get(start);
    const out = new Map([[start, 0]]);
    let frontier = [start];
    for (let d = 1; d <= 2; d++) {
      const next = [];
      for (const i of frontier) for (const j of adj[i]) if (!out.has(j)) { out.set(j, d); next.push(j); }
      frontier = next;
    }
    hopCache.set(start, out);
    return out;
  };

  return { delaunay, voronoi, polys, adj, borders, hops };
}

function sharedEdge(p, q) {
  const key = v => `${v[0].toFixed(2)},${v[1].toFixed(2)}`;
  const inQ = new Set(q.map(key));
  const seen = new Set();
  const common = [];
  for (const v of p) {
    const k = key(v);
    if (inQ.has(k) && !seen.has(k)) { seen.add(k); common.push(v); }
  }
  return common.length >= 2 ? common : null;
}

export function shortestPath(adj, from, to) {
  const prev = new Map([[from, -1]]);
  const queue = [from];
  while (queue.length) {
    const i = queue.shift();
    if (i === to) break;
    for (const j of adj[i]) if (!prev.has(j)) { prev.set(j, i); queue.push(j); }
  }
  if (!prev.has(to)) return [];
  const path = [];
  for (let i = to; i !== -1; i = prev.get(i)) path.unshift(i);
  return path;
}

// Influence of every faction at every node as of day `at`.
export function computeInfluence({ graph, nodes, factions, games, at }) {
  const scores = nodes.map(() => new Map());
  const add = (i, f, v) => scores[i].set(f, (scores[i].get(f) || 0) + v);
  const homeOf = new Map();

  for (const f of factions) {
    const h = nodes.findIndex(n => n.id === f.home);
    homeOf.set(h, f.id);
    for (const [j, d] of graph.hops(h)) add(j, f.id, RULES.home[d]);
  }

  for (const g of games) {
    if (g.day > at) continue;
    const w = 0.5 ** ((at - g.day) / RULES.halfLifeDays);
    for (const [j, d] of graph.hops(g.nodeIndex)) {
      add(j, g.winnerFaction, RULES.win[d] * w);
      if (RULES.loss[d]) add(j, g.loserFaction, RULES.loss[d] * w);
    }
  }

  return scores.map((m, i) => {
    const ranked = [...m].map(([faction, value]) => ({ faction, value: Math.max(0, value) }))
      .filter(s => s.value >= 0.5)
      .sort((a, b) => b.value - a.value);
    const [top, second] = ranked;
    const home = homeOf.get(i) ?? null;
    let owner = top && top.value >= RULES.controlThreshold ? top.faction : null;
    let contested = !!(owner && second && second.value >= RULES.controlThreshold
      && second.value >= top.value * RULES.contestedRatio);
    if (home) { owner = home; contested = false; }
    return {
      ranked,
      owner,
      home,
      contested,
      rival: contested ? second.faction : null,
      strength: top ? top.value : 0,
    };
  });
}
