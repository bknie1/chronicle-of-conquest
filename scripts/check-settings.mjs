// Checks every setting's data: ids, homes, gates, map connectivity, and the
// three levels of faction detail. Run it after editing anything in src/data.
//
//     node scripts/check-settings.mjs
import { buildGraph, buildSettingGraph } from '../src/engine.js';
import { SETTINGS, LEVELS } from '../src/data/settings.js';

let bad = 0;
const fail = msg => { console.error(`  ✗ ${msg}`); bad++; };

for (const setting of Object.values(SETTINGS)) {
  console.log(`\n${setting.name} (${setting.id})`);
  const points = new Set(setting.nodes.map(n => n.id));
  console.log(`  ${setting.nodes.length} points across ${setting.maps.length} map(s)`);

  for (const level of LEVELS) {
    const list = setting.levels[level];
    const homes = new Set(list.map(f => f.home));
    console.log(`  ${level}: ${list.length} factions, ${homes.size} homes`);
    for (const f of list) {
      if (!points.has(f.home)) fail(`${level}: ${f.name}'s home "${f.home}" is not a point on any map`);
      if (!/^#[0-9a-f]{6}$/i.test(f.color || '')) fail(`${level}: ${f.name} has no colour`);
    }
    if (homes.size !== list.length) fail(`${level}: ${list.length - homes.size} faction(s) share a home`);
  }

  // Every start must sit on a real point, and belong to a real faction.
  const books = new Set(setting.factions.map(f => f.id));
  const usedStartIds = new Set();
  for (const start of setting.starts) {
    if (usedStartIds.has(start.id)) fail(`start id "${start.id}" is used twice`);
    usedStartIds.add(start.id);
    if (!points.has(start.point)) fail(`${start.name}'s starting ground "${start.point}" is not a point`);
    if (!books.has(setting.factionOfStart.get(start.id))) fail(`${start.name} belongs to no army book`);
  }
  console.log(`  ${setting.starts.length} starting grounds across ${setting.factions.length} army books`);

  // Each map must be one connected piece, and the whole setting joined by gates.
  for (const map of setting.maps) {
    const g = buildGraph(map.nodes, map.width, map.height, map.maxEdge,
      { extraLinks: map.extraLinks, blockedLinks: map.blockedLinks });
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) for (const j of g.adj[queue.shift()]) if (!seen.has(j)) { seen.add(j); queue.push(j); }
    if (seen.size !== map.nodes.length) {
      fail(`${map.id}: cut off — ${map.nodes.filter((_, i) => !seen.has(i)).map(n => n.id).join(', ')}`);
    }
    const close = [];
    map.nodes.forEach((a, i) => map.nodes.slice(i + 1).forEach(b => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 45) close.push(`${a.id}/${b.id} ${Math.round(d)}px`);
    }));
    if (close.length) console.log(`    note: ${map.id} has crowded points: ${close.slice(0, 5).join(', ')}`);
  }
  const graph = buildSettingGraph(setting);
  const seen = new Set([0]);
  const queue = [0];
  while (queue.length) for (const j of graph.adj[queue.shift()]) if (!seen.has(j)) { seen.add(j); queue.push(j); }
  if (seen.size !== setting.nodes.length) fail(`${setting.nodes.length - seen.size} point(s) unreachable through the gates`);
}

console.log(bad ? `\n${bad} problem(s)` : '\nAll settings check out');
process.exit(bad ? 1 : 0);
