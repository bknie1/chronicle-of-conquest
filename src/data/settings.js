// A setting is one or more maps, the gates between them, and its factions.
//
// Factions are described at two levels of detail, and a campaign picks one:
//   codex     one entry per army: Space Marines, Idoneth Deepkin, Legio Mortis
//   alliance  those same armies added up into sides: Loyalists and Traitors,
//             Order and Chaos, the Imperium and the Xenos
// Only the army level is ever computed. An allegiance is the sum of its
// armies' influence at a point, not a faction with a territory of its own.
// A setting may set `defaultLevel`: the Age of Darkness is Loyalists against
// Traitors before it is anything else, so those campaigns open there.
// Every faction at the active level has exactly one home, its safe zone, which
// can never fall.
//
// An army book may also list `subfactions`: the chapters, clans, lodges and
// enclaves it is made of. They are not separate factions. Each names a
// **starting ground**, so someone mustering Chaos Space Marines can begin at
// Badab as the Red Corsairs, or a Kruleboyz player can start away from the
// Ironjawz. A start gives that faction a small permanent foothold there; it
// never becomes a second safe zone.
//
// Point ids must be unique across a setting's maps, and faction, sub-faction
// and alliance ids must be unique across the setting.
import { MAPS } from './maps/index.js';
import { OLD_WORLD } from './old-world.js';
import { WARHAMMER_FANTASY } from './warhammer-fantasy.js';
import { MORTAL_REALMS } from './mortal-realms.js';
import { HORUS_HERESY } from './horus-heresy.js';
import { LEGIONS_IMPERIALIS } from './legions-imperialis.js';
import { WARHAMMER_40K } from './warhammer-40k.js';
import { MIDDLE_EARTH } from './middle-earth.js';

export const LEVELS = ['alliance', 'codex'];
export const LEVEL_NAMES = {
  alliance: 'Allegiance',
  codex: 'Armies',
};
export const LEVEL_HINTS = {
  alliance: 'The same battles, counted into two or three sides: Loyalists and Traitors, Order and Chaos.',
  codex: 'One entry per army, the usual choice.',
};

function defineSetting({ id, name, maps, alliances = [], factions, gates = [], defaultLevel = 'codex' }) {
  const nodes = maps.flatMap(map => map.nodes.map(n => ({ ...n, map: map.id })));
  const points = new Set();
  for (const n of nodes) {
    if (points.has(n.id)) throw new Error(`${id}: point id "${n.id}" is used twice`);
    points.add(n.id);
  }
  for (const [a, b] of gates) {
    if (!points.has(a) || !points.has(b)) throw new Error(`${id}: gate ${a} ↔ ${b} names an unknown point`);
  }

  // Where each army book can begin: its own seat first, then its sub-factions'.
  const startsOf = new Map();
  const allianceOf = new Map();
  const ids = new Set();
  for (const f of factions) {
    if (alliances.length && !alliances.some(a => a.id === f.alliance)) {
      throw new Error(`${id}: ${f.name} has no grand alliance`);
    }
    if (ids.has(f.id)) throw new Error(`${id}: "${f.id}" is used twice`);
    ids.add(f.id);
    allianceOf.set(f.id, f.alliance);
    const starts = [{ id: f.id, name: f.name, point: f.home, seat: true }];
    for (const s of f.subfactions ?? []) {
      if (ids.has(s.id)) throw new Error(`${id}: "${s.id}" is used twice`);
      ids.add(s.id);
      if (!points.has(s.home)) throw new Error(`${id}: ${s.name}'s starting ground "${s.home}" is not a point`);
      starts.push({ id: s.id, name: s.name, point: s.home, of: f.id });
    }
    startsOf.set(f.id, starts);
  }

  const codex = factions.map(({ id: fid, name: fname, color, home, alliance }) => ({ id: fid, name: fname, color, home, alliance }));
  const levels = { alliance: alliances, codex };
  for (const level of LEVELS) {
    if (!levels[level].length) throw new Error(`${id}: no factions at the "${level}" level`);
    const homes = new Set();
    for (const f of levels[level]) {
      if (!points.has(f.home)) throw new Error(`${id}: ${f.name}'s home "${f.home}" is not a point`);
      if (homes.has(f.home)) throw new Error(`${id}: two ${level} factions call "${f.home}" home`);
      homes.add(f.home);
    }
  }

  const starts = [...startsOf.values()].flat();
  const factionOfStart = new Map(starts.map(s => [s.id, s.of ?? s.id]));

  // At the alliance level an army counts as its side; otherwise as its army book.
  const resolve = (factionId, level) => {
    const book = factionOfStart.get(factionId) ?? factionId;
    return level === 'alliance' ? allianceOf.get(book) ?? book : book;
  };

  if (!LEVELS.includes(defaultLevel)) throw new Error(`${id}: "${defaultLevel}" is not a level`);

  return {
    id, name, maps, gates, nodes, alliances, factions: codex, levels, resolve, defaultLevel,
    starts, startsOf, factionOfStart, allianceOf,
  };
}

// Listed in the order they appear in the setting picker.
export const SETTINGS = {
  'old-world': defineSetting(OLD_WORLD),
  'warhammer-fantasy': defineSetting(WARHAMMER_FANTASY),
  'mortal-realms': defineSetting(MORTAL_REALMS),
  'legions-imperialis': defineSetting(LEGIONS_IMPERIALIS),
  'horus-heresy': defineSetting(HORUS_HERESY),
  'warhammer-40k': defineSetting(WARHAMMER_40K),
  'middle-earth': defineSetting(MIDDLE_EARTH),
};

// The list a campaign plays with, at its chosen level of detail.
export const factionsFor = (setting, level) => setting.levels[level] ?? setting.levels.codex;
// Every faction someone can muster as: always the army books.
export const armyFactionsFor = setting => setting.levels.codex;
// Where an army of this faction may begin. The first entry is the faction's own seat.
export const startsFor = (setting, factionId) => setting.startsOf.get(factionId) ?? [];
// The point a recorded start id sits on.
export const startPoint = (setting, startId) => setting.starts.find(s => s.id === startId)?.point ?? null;
