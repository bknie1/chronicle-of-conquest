// Influence engine. Nothing about territory is stored: the map at any moment
// is derived from the log of confirmed games up to that moment. Decay, replay
// and corrections all fall out of that.
import { Delaunay } from 'd3-delaunay';

export const RULES = {
  halfLifeDays: 21,    // a win's weight halves every 3 weeks
  win: [10, 4, 1],     // influence gained by the winner at the site, 1 hop, 2 hops away
  loss: [-6, -2, 0],   // influence the loser gives up
  home: [100, 12, 4],  // permanent influence around a faction's home
  // A starting ground other than a faction's seat is very hard to take rather
  // than impossible: about six recent wins will shift it.
  startingGround: [60, 10, 3],
  // Every seat a faction is written as holding shows as theirs before a shot
  // is fired — a City of Sigmar reads as a City of Sigmar — but two good wins
  // take it. Without this the map at rest shows only who happens to be there.
  claim: [18, 3, 1],
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

  return { delaunay, voronoi, polys, adj, borders, hops: hopsOver(adj) };
}

// Points within two steps of `start`, with their distance. Cached per start.
function hopsOver(adj) {
  const cache = new Map();
  return start => {
    if (cache.has(start)) return cache.get(start);
    const out = new Map([[start, 0]]);
    let frontier = [start];
    for (let d = 1; d <= 2; d++) {
      const next = [];
      for (const i of frontier) for (const j of adj[i]) if (!out.has(j)) { out.set(j, d); next.push(j); }
      frontier = next;
    }
    cache.set(start, out);
    return out;
  };
}

// One graph over every map in a setting (see src/data/settings.js). Each map keeps
// its own geometry for drawing; gates add neighbours across maps, so a win beside
// a realmgate pushes influence into the realm on the other side.
export function buildSettingGraph(setting) {
  const adj = [];
  const maps = new Map();
  let offset = 0;
  for (const map of setting.maps) {
    const graph = buildGraph(map.nodes, map.width, map.height, map.maxEdge,
      { extraLinks: map.extraLinks, blockedLinks: map.blockedLinks });
    maps.set(map.id, { map, graph, offset });
    for (const js of graph.adj) adj.push(js.map(j => j + offset));
    offset += map.nodes.length;
  }
  const index = new Map(setting.nodes.map((n, i) => [n.id, i]));
  const gates = setting.gates.map(([a, b, name]) => ({ a: index.get(a), b: index.get(b), name }));
  for (const { a, b } of gates) {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  }
  return { adj, hops: hopsOver(adj), maps, gates, index };
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

// Roll a node's influence up into coarser buckets: the same games, counted the
// same way, with each army's score added to the side it fights for. Nothing is
// recomputed — an allegiance is a sum of its armies, not a faction of its own.
export function rollUp(scores, bucketOf) {
  return scores.map(s => {
    const totals = new Map();
    for (const { faction, value } of s.ranked) {
      const b = bucketOf(faction);
      totals.set(b, (totals.get(b) || 0) + value);
    }
    const ranked = [...totals].map(([faction, value]) => ({ faction, value }))
      .sort((a, b) => b.value - a.value);
    const [top, second] = ranked;
    const home = s.home ? bucketOf(s.home) : null;
    let owner = top && top.value >= RULES.controlThreshold ? top.faction : null;
    let contested = !!(owner && second && second.value >= RULES.controlThreshold
      && second.value >= top.value * RULES.contestedRatio);
    if (home) { owner = home; contested = false; }
    return { ranked, owner, home, contested, rival: contested ? second.faction : null, strength: top ? top.value : 0 };
  });
}

// A decree reaches as far as a victory does, in the same proportions.
const DECREE_SPREAD = [1, 0.4, 0.1];

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
// Each faction has one home, its safe zone, which can never fall. `footholds`
// are the other grounds armies mustered from — [{ faction, point }] — and give
// a strong but beatable claim there; the same ground counts once per faction.
// `decrees` are a gamemaster's hand on the map — [{ faction, point, amount }],
// an invasion or a correction — and do not decay: they hold until revoked.
export function computeInfluence({ graph, nodes, factions, games, at, footholds = [], claims = [], decrees = [] }) {
  const scores = nodes.map(() => new Map());
  const add = (i, f, v) => scores[i].set(f, (scores[i].get(f) || 0) + v);
  const homeOf = new Map();

  for (const f of factions) {
    const h = nodes.findIndex(n => n.id === f.home);
    homeOf.set(h, f.id);
    for (const [j, d] of graph.hops(h)) add(j, f.id, RULES.home[d]);
  }

  // The places each faction is written as holding, before anyone musters.
  const staked = new Set();
  for (const { faction, point } of claims) {
    const i = nodes.findIndex(n => n.id === point);
    if (i < 0 || homeOf.has(i) || staked.has(`${faction}@${point}`)) continue;
    staked.add(`${faction}@${point}`);
    for (const [j, d] of graph.hops(i)) add(j, faction, RULES.claim[d]);
  }

  const claimed = new Set();
  for (const { faction, point } of footholds) {
    const i = nodes.findIndex(n => n.id === point);
    if (i < 0 || homeOf.has(i) || claimed.has(`${faction}@${point}`)) continue;
    claimed.add(`${faction}@${point}`);
    for (const [j, d] of graph.hops(i)) add(j, faction, RULES.startingGround[d]);
  }

  for (const { faction, point, amount } of decrees) {
    const i = nodes.findIndex(n => n.id === point);
    if (i < 0) continue;
    for (const [j, d] of graph.hops(i)) add(j, faction, amount * DECREE_SPREAD[d]);
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
