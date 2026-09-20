import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGraph, computeInfluence, RULES } from '../src/engine.js';
import MAP from '../src/data/maps/old-world.js';
import { OLD_WORLD } from '../src/data/old-world.js';

const FACTIONS = OLD_WORLD.factions;

const graph = buildGraph(MAP.nodes, MAP.width, MAP.height, MAP.maxEdge, { extraLinks: MAP.extraLinks, blockedLinks: MAP.blockedLinks });
const idx = id => MAP.nodes.findIndex(n => n.id === id);
const win = (day, node, winnerFaction, loserFaction) => ({ day, nodeIndex: idx(node), winnerFaction, loserFaction });
const influence = (games, at) => computeInfluence({ graph, nodes: MAP.nodes, factions: FACTIONS, games, at });

test('every faction holds its home with no games played', () => {
  const inf = influence([], 0);
  for (const f of FACTIONS) assert.equal(inf[idx(f.home)].owner, f.id);
});

test('homes never fall, however badly a faction loses there', () => {
  const games = Array.from({ length: 30 }, (_, d) => win(d, 'altdorf', 'bretonnia', 'empire'));
  assert.equal(influence(games, 30)[idx('altdorf')].owner, 'empire');
});

test('a single win changes the map', () => {
  const before = influence([], 10);
  const after = influence([win(10, 'badlands', 'dwarfs', 'orcs')], 10);
  assert.notEqual(before[idx('badlands')].owner, 'dwarfs');
  assert.equal(after[idx('badlands')].owner, 'dwarfs');
});

test('influence fades when a faction stops playing', () => {
  // Lyonesse is far from the Dwarfs' home, so all their influence there comes from this one win.
  const games = [win(0, 'lyonesse', 'dwarfs', 'orcs')];
  const fresh = influence(games, 0)[idx('lyonesse')];
  const later = influence(games, RULES.halfLifeDays)[idx('lyonesse')];
  const much = influence(games, RULES.halfLifeDays * 4)[idx('lyonesse')];
  const score = s => s.ranked.find(r => r.faction === 'dwarfs')?.value ?? 0;
  assert.ok(Math.abs(score(later) - score(fresh) / 2) < 0.01);
  assert.notEqual(much.owner, 'dwarfs');
});

test('games after the viewed date are ignored (replay)', () => {
  const games = [win(50, 'badlands', 'dwarfs', 'orcs')];
  assert.notEqual(influence(games, 49)[idx('badlands')].owner, 'dwarfs');
});

// --- link overrides (extraLinks / blockedLinks) ---------------------------

const linkNodes = [
  { id: 'a', x: 0, y: 0 },
  { id: 'b', x: 10, y: 0 },   // close to a: linked by distance alone
  { id: 'c', x: 1000, y: 1000 }, // far from both: not linked without an override
];

test('buildGraph still works with no 5th argument (backwards compatible)', () => {
  const g = buildGraph(linkNodes, 2000, 2000, 50);
  assert.ok(g.adj[0].includes(1)); // a-b, within maxEdge
  assert.ok(!g.adj[0].includes(2)); // a-c, too far
});

test('extraLinks forces adjacency between two points that would not otherwise link', () => {
  const g = buildGraph(linkNodes, 2000, 2000, 50, { extraLinks: [['a', 'c']] });
  assert.ok(g.adj[0].includes(2));
  assert.ok(g.adj[2].includes(0));
  assert.ok(g.adj[0].includes(1)); // the normal a-b link is untouched
});

test('blockedLinks removes adjacency between two points that would otherwise link', () => {
  const g = buildGraph(linkNodes, 2000, 2000, 50, { blockedLinks: [['a', 'b']] });
  assert.ok(!g.adj[0].includes(1));
  assert.ok(!g.adj[1].includes(0));
});

test('a pair in both extraLinks and blockedLinks stays blocked', () => {
  const g = buildGraph(linkNodes, 2000, 2000, 50, {
    extraLinks: [['a', 'c']],
    blockedLinks: [['a', 'c']],
  });
  assert.ok(!g.adj[0].includes(2));
});

test('a starting ground is hard to take, unlike a safe home', () => {
  const games = Array.from({ length: 8 }, (_, k) => win(k * 2, 'altdorf', 'bretonnia', 'empire'));
  const at = 16;
  const safe = computeInfluence({ graph, nodes: MAP.nodes, factions: FACTIONS, games, at });
  const contestable = computeInfluence({ graph, nodes: MAP.nodes, factions: FACTIONS, games, at, homeRule: 'contestable' });
  assert.equal(safe[idx('altdorf')].owner, 'empire', 'a safe home never falls');
  assert.equal(contestable[idx('altdorf')].owner, 'bretonnia', 'a starting ground falls to a sustained campaign');
});
