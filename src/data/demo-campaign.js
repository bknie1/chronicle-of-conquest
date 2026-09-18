// A fake store campaign for demo mode: eight factions, a dozen regulars,
// and four months of generated game nights. Deterministic, so every visitor
// sees the same history.
import { shortestPath } from '../engine.js';
import { OLD_WORLD } from './old-world.js';

export const CAMPAIGN = {
  name: 'Endless Store Campaign',
  start: new Date(2026, 4, 18), // day 0
  today: 123,                   // 18 Sep 2026
};

const FACTIONS = OLD_WORLD.factions;

// skill: chance-of-winning weight. active: [firstDay, lastDay] they turn up.
// surge: from this day on they play twice as often and a little better.
export const PLAYERS = [
  { id: 'brett', name: 'Brett', army: "Brett's Knights", faction: 'bretonnia', skill: 0.66, active: [0, 123], surge: 85 },
  { id: 'chris', name: 'Chris', army: 'The Questing Order', faction: 'bretonnia', skill: 0.5, active: [0, 60] },
  { id: 'maria', name: 'Maria', army: 'Reikland Reiksguard', faction: 'empire', skill: 0.62, active: [0, 123] },
  { id: 'priya', name: 'Priya', army: 'Nuln Gunnery School', faction: 'empire', skill: 0.55, active: [30, 123] },
  { id: 'dave', name: 'Dave', army: 'Karak Throng', faction: 'dwarfs', skill: 0.6, active: [0, 123] },
  { id: 'marcus', name: 'Marcus', army: "Marcus's Slayers", faction: 'dwarfs', skill: 0.5, active: [0, 100] },
  { id: 'tyler', name: 'Tyler', army: 'Da Red Gitz', faction: 'orcs', skill: 0.55, active: [0, 123] },
  { id: 'sam', name: 'Sam', army: 'Court of Drakenhof', faction: 'vampires', skill: 0.6, active: [0, 123] },
  { id: 'leah', name: 'Leah', army: "Leah's Blood Dragons", faction: 'vampires', skill: 0.5, active: [20, 123] },
  { id: 'jess', name: 'Jess', army: 'Wardens of the Glade', faction: 'wood-elves', skill: 0.58, active: [0, 123] },
  { id: 'alex', name: 'Alex', army: 'Ice Guard of Erengrad', faction: 'kislev', skill: 0.52, active: [0, 123] },
  { id: 'owen', name: 'Owen', army: 'The Unbound Host', faction: 'chaos', skill: 0.66, active: [0, 55] },
];

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHistory(graph, nodes) {
  const rand = mulberry32(40000);
  const pick = (items, weight) => {
    const total = items.reduce((s, x) => s + weight(x), 0);
    let r = rand() * total;
    for (const x of items) { r -= weight(x); if (r <= 0) return x; }
    return items[items.length - 1];
  };
  const factionOf = id => FACTIONS.find(f => f.id === id);
  const homeIndex = f => nodes.findIndex(n => n.id === factionOf(f).home);
  const activity = (p, day) => (day < p.active[0] || day > p.active[1] ? 0 : p.surge && day >= p.surge ? 2.2 : 1);
  const skill = (p, day) => p.skill + (p.surge && day >= p.surge ? 0.12 : 0);

  const games = [];
  const gameNights = new Set([2, 4, 6]); // Tue, Thu, Sat
  for (let day = 0; day < CAMPAIGN.today; day++) {
    const weekday = new Date(CAMPAIGN.start.getTime() + day * 864e5).getDay();
    if (!gameNights.has(weekday)) continue;
    const tables = 2 + Math.floor(rand() * 3);
    const seated = new Set();
    for (let t = 0; t < tables; t++) {
      const pool = PLAYERS.filter(p => activity(p, day) > 0 && !seated.has(p.id));
      if (pool.length < 2) break;
      const attacker = pick(pool, p => activity(p, day));
      const foes = pool.filter(p => p.faction !== attacker.faction);
      if (!foes.length) break;
      const defender = pick(foes, p => activity(p, day));
      seated.add(attacker.id); seated.add(defender.id);

      // Battles happen on the road between the two homelands, leaning into the defender's lands.
      const path = shortestPath(graph.adj, homeIndex(attacker.faction), homeIndex(defender.faction));
      const inner = path.slice(1, -1);
      const nodeIndex = inner.length
        ? inner[Math.min(inner.length - 1, Math.floor(inner.length * (0.25 + rand() * 0.7)))]
        : path[path.length - 1];

      const a = skill(attacker, day), d = skill(defender, day);
      const attackerWins = rand() < a / (a + d);
      const [winner, loser] = attackerWins ? [attacker, defender] : [defender, attacker];
      games.push({ id: `g${games.length + 1}`, day, node: nodes[nodeIndex].id, winner: winner.id, loser: loser.id });
    }
  }
  return games;
}

// Games people have agreed to but not yet played. Two on Parravon tonight.
export const EVENTS = [
  { id: 'e1', day: 123, node: 'parravon', players: ['brett', 'maria'], note: 'Grail Knights at the gates' },
  { id: 'e2', day: 123, node: 'parravon', players: ['jess', 'sam'], note: 'Shadows in the Loren borderlands' },
  { id: 'e3', day: 123, node: 'black-fire-pass', players: ['dave', 'tyler'], note: 'Hold the pass' },
  { id: 'e4', day: 125, node: 'stirland', players: ['priya', 'leah'] },
  { id: 'e5', day: 128, node: 'praag', players: ['alex', 'owen'], note: 'Has the Unbound Host returned?' },
  { id: 'e6', day: 130, node: 'eight-peaks', players: ['marcus', 'tyler'] },
];
