import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSettingGraph, computeInfluence } from '../src/engine.js';
import { SETTINGS } from '../src/data/settings.js';
import { DEMOS, generateHistory } from '../src/data/demo-campaign.js';

const realms = SETTINGS['mortal-realms'];
const graph = buildSettingGraph(realms);
const at = id => graph.index.get(id);
const influence = games => computeInfluence({ graph, nodes: realms.nodes, factions: realms.factions, games, at: 0 });
const win = (node, winnerFaction, loserFaction) => ({ day: 0, nodeIndex: at(node), winnerFaction, loserFaction });

test('every setting has unique points, known homes and valid gates', () => {
  // defineSetting throws on import if not; this checks the result is usable too.
  for (const s of Object.values(SETTINGS)) {
    assert.equal(new Set(s.nodes.map(n => n.id)).size, s.nodes.length, s.id);
    for (const n of s.nodes) assert.ok(s.maps.some(m => m.id === n.map), `${s.id}: ${n.id} has a map`);
    for (const n of s.nodes) {
      const map = s.maps.find(m => m.id === n.map);
      assert.ok(n.x >= 0 && n.x <= map.width && n.y >= 0 && n.y <= map.height, `${n.id} is inside ${map.id}`);
    }
  }
});

test('realmgates join points on different realms', () => {
  assert.ok(graph.gates.length > 0);
  for (const g of graph.gates) {
    assert.notEqual(realms.nodes[g.a].map, realms.nodes[g.b].map, g.name);
    assert.ok(graph.adj[g.a].includes(g.b) && graph.adj[g.b].includes(g.a), g.name);
  }
});

test('every realm is reachable from every other through the gates', () => {
  const seen = new Set([0]);
  const queue = [0];
  while (queue.length) for (const j of graph.adj[queue.shift()]) if (!seen.has(j)) { seen.add(j); queue.push(j); }
  const reached = new Set([...seen].map(i => realms.nodes[i].map));
  assert.deepEqual([...reached].sort(), realms.maps.map(m => m.id).sort());
});

test('a win beside a realmgate pushes influence into the other realm', () => {
  // Hammerhal Ghyra sits across the Stormrift Realmgate from Hammerhal Aqsha.
  const before = influence([])[at('hammerhal-ghyra')].ranked.find(r => r.faction === 'orruks')?.value ?? 0;
  const after = influence([win('hammerhal-aqsha', 'orruks', 'cities')])[at('hammerhal-ghyra')].ranked.find(r => r.faction === 'orruks')?.value ?? 0;
  assert.ok(after > before, `orruk influence in Ghyran rose (${before} → ${after})`);
});

test('influence only spreads two steps, and only along links and gates', () => {
  const orruks = s => s.ranked.find(r => r.faction === 'orruks')?.value ?? 0;
  // A point with no realmgate within two steps: its influence must stay in its own realm.
  const inland = realms.nodes.find(n => [...graph.hops(at(n.id)).keys()].every(i => realms.nodes[i].map === n.map)
    && !realms.factions.some(f => f.home === n.id));
  const base = influence([]);
  const after = influence([win(inland.id, 'orruks', 'lumineth')]);
  const reach = graph.hops(at(inland.id));
  for (const n of realms.nodes) {
    const i = at(n.id);
    if (reach.has(i)) assert.ok(orruks(after[i]) > orruks(base[i]), `${n.id} gains`);
    else assert.equal(orruks(after[i]), orruks(base[i]), `${n.id} untouched`);
  }
  // ...and a point beside a gate does reach the far realm.
  const reachFromGate = graph.hops(at('hammerhal-aqsha'));
  assert.ok([...reachFromGate.keys()].some(i => realms.nodes[i].map === 'ghyran'));
});

test('every setting has a working demo', () => {
  for (const s of Object.values(SETTINGS)) {
    const g = buildSettingGraph(s);
    const games = generateHistory(g, s, DEMOS[s.id]);
    assert.ok(games.length > 50, `${s.id} demo has history`);
    for (const game of games) assert.ok(g.index.has(game.node), `${s.id}: ${game.node} exists`);
    for (const e of DEMOS[s.id].events) assert.ok(g.index.has(e.node), `${s.id}: event at ${e.node} exists`);
  }
});

test('every map is one connected piece, so every region can be fought over', () => {
  for (const s of Object.values(SETTINGS)) {
    const g = buildSettingGraph(s);
    for (const [id, { map, offset }] of g.maps) {
      // Only links inside this map count here; gates are checked separately.
      const inMap = i => i >= offset && i < offset + map.nodes.length;
      const seen = new Set([offset]);
      const queue = [offset];
      while (queue.length) for (const j of g.adj[queue.shift()]) if (inMap(j) && !seen.has(j)) { seen.add(j); queue.push(j); }
      const stranded = map.nodes.filter((_, k) => !seen.has(offset + k)).map(n => n.id);
      assert.deepEqual(stranded, [], `${s.id}/${id}: cut off from the rest of the map`);
    }
  }
});

test('every faction has a distinct home', () => {
  for (const s of Object.values(SETTINGS)) {
    const homes = s.factions.map(f => f.home);
    assert.equal(new Set(homes).size, homes.length, `${s.id}: two factions share a home`);
    assert.equal(new Set(s.factions.map(f => f.id)).size, s.factions.length, `${s.id}: duplicate faction id`);
  }
});
