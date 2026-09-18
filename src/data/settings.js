// A setting is one or more maps plus the gates between them. Everything that
// isn't drawing (rules, the server, the demo) works on the flattened point list,
// so point ids must be unique across a setting's maps.
import { OLD_WORLD } from './old-world.js';
import { MORTAL_REALMS } from './mortal-realms.js';

function defineSetting({ id, name, maps, factions, gates = [] }) {
  const nodes = maps.flatMap(map => map.nodes.map(n => ({ ...n, map: map.id })));
  const ids = new Set();
  for (const n of nodes) {
    if (ids.has(n.id)) throw new Error(`${id}: point id "${n.id}" is used twice`);
    ids.add(n.id);
  }
  for (const [a, b] of gates) {
    if (!ids.has(a) || !ids.has(b)) throw new Error(`${id}: gate ${a} ↔ ${b} names an unknown point`);
  }
  for (const f of factions) {
    if (!ids.has(f.home)) throw new Error(`${id}: ${f.name}'s home "${f.home}" is not a point`);
  }
  return { id, name, maps, factions, gates, nodes };
}

export const SETTINGS = {
  'old-world': defineSetting({ id: 'old-world', name: 'The Old World', maps: [OLD_WORLD], factions: OLD_WORLD.factions }),
  'mortal-realms': defineSetting(MORTAL_REALMS),
};
