// A setting is one or more maps, the gates between them, and its factions.
//
// Factions are described at three levels of detail, and a campaign picks one:
//   alliance  Grand Alliances: the Imperium, Chaos, Xenos; Order, Death...
//   codex     one entry per army book: Space Marines, Idoneth Deepkin...
//   detailed  sub-factions: Carcharodons, Red Corsairs, a single Stormhost...
// The influence rules never change; only which level counts as a "faction",
// and so which points are homes. Every entry at the active level has exactly
// one home, and homes can never fall.
//
// Armies always record their most detailed faction id, so a campaign can be
// read at any level. Point ids must be unique across a setting's maps, and
// faction, sub-faction and alliance ids must be unique across the setting.
import { MAPS } from './maps/index.js';
import { OLD_WORLD } from './old-world.js';
import { MORTAL_REALMS } from './mortal-realms.js';
import { HORUS_HERESY } from './horus-heresy.js';
import { LEGIONS_IMPERIALIS } from './legions-imperialis.js';
import { WARHAMMER_40K } from './warhammer-40k.js';

export const LEVELS = ['alliance', 'codex', 'detailed'];
export const LEVEL_NAMES = {
  alliance: 'Grand Alliances',
  codex: 'Army books',
  detailed: 'Sub-factions',
};
export const LEVEL_HINTS = {
  alliance: 'Imperium, Chaos, Xenos. Simplest: everyone on a side shares one territory.',
  codex: 'One per army book, the usual choice.',
  detailed: 'Chapters, legions, enclaves and clans, each with its own starting ground.',
};

function defineSetting({ id, name, maps, alliances = [], factions, gates = [] }) {
  const nodes = maps.flatMap(map => map.nodes.map(n => ({ ...n, map: map.id })));
  const points = new Set();
  for (const n of nodes) {
    if (points.has(n.id)) throw new Error(`${id}: point id "${n.id}" is used twice`);
    points.add(n.id);
  }
  for (const [a, b] of gates) {
    if (!points.has(a) || !points.has(b)) throw new Error(`${id}: gate ${a} ↔ ${b} names an unknown point`);
  }

  // One list per level, plus the map from a detailed id up to the coarser ones.
  const detailed = [];
  const parentOf = new Map();   // detailed id -> codex id
  const allianceOf = new Map(); // codex id -> alliance id
  for (const f of factions) {
    if (alliances.length && !alliances.some(a => a.id === f.alliance)) {
      throw new Error(`${id}: ${f.name} has no grand alliance`);
    }
    allianceOf.set(f.id, f.alliance);
    const subs = f.subfactions ?? [];
    for (const s of subs) {
      detailed.push({ id: s.id, name: s.name, color: s.color ?? f.color, home: s.home, of: f.id });
      parentOf.set(s.id, f.id);
    }
    // A faction with no sub-factions is its own entry at the detailed level.
    if (!subs.length) {
      detailed.push({ id: f.id, name: f.name, color: f.color, home: f.home, of: f.id });
      parentOf.set(f.id, f.id);
    }
  }
  const codex = factions.map(({ id: fid, name: fname, color, home, alliance }) => ({ id: fid, name: fname, color, home, alliance }));
  const levels = { alliance: alliances, codex, detailed };

  const seen = new Set();
  for (const level of LEVELS) {
    if (!levels[level].length) throw new Error(`${id}: no factions at the "${level}" level`);
    const homes = new Set();
    for (const f of levels[level]) {
      if (seen.has(f.id) && level === 'detailed' && parentOf.get(f.id) === f.id) continue; // a faction standing in for itself
      if (seen.has(f.id) && level !== 'detailed') throw new Error(`${id}: "${f.id}" is used twice`);
      seen.add(f.id);
      if (!points.has(f.home)) throw new Error(`${id}: ${f.name}'s home "${f.home}" is not a point`);
      if (homes.has(f.home)) throw new Error(`${id}: two ${level} factions call "${f.home}" home`);
      homes.add(f.home);
    }
  }

  // At a coarser level, an army's faction is its parent.
  const resolve = (factionId, level) => {
    const cx = parentOf.get(factionId) ?? factionId;
    if (level === 'detailed') return parentOf.has(factionId) ? factionId : cx;
    if (level === 'codex') return cx;
    return allianceOf.get(cx) ?? cx;
  };

  return { id, name, maps, gates, nodes, alliances, factions: codex, levels, resolve, parentOf, allianceOf };
}

export const SETTINGS = {
  'old-world': defineSetting(OLD_WORLD),
  'mortal-realms': defineSetting(MORTAL_REALMS),
  'horus-heresy': defineSetting(HORUS_HERESY),
  'legions-imperialis': defineSetting(LEGIONS_IMPERIALIS),
  'warhammer-40k': defineSetting(WARHAMMER_40K),
};

// The list a campaign plays with, at its chosen level of detail.
export const factionsFor = (setting, level) => setting.levels[level] ?? setting.levels.codex;
// Every id someone can muster an army as: the most detailed level.
export const armyFactionsFor = setting => setting.levels.detailed;
