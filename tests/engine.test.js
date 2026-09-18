import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGraph, computeInfluence, RULES } from '../src/engine.js';
import { OLD_WORLD as MAP } from '../src/data/old-world.js';

const graph = buildGraph(MAP.nodes, MAP.width, MAP.height, MAP.maxEdge);
const idx = id => MAP.nodes.findIndex(n => n.id === id);
const win = (day, node, winnerFaction, loserFaction) => ({ day, nodeIndex: idx(node), winnerFaction, loserFaction });
const influence = (games, at) => computeInfluence({ graph, nodes: MAP.nodes, factions: MAP.factions, games, at });

test('every faction holds its home with no games played', () => {
  const inf = influence([], 0);
  for (const f of MAP.factions) assert.equal(inf[idx(f.home)].owner, f.id);
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
