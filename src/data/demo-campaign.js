// Fake store campaigns for demo mode, one per setting, and four months of
// generated game nights. Deterministic, so every visitor sees the same history.
import { shortestPath } from '../engine.js';

export const DEMO_START = new Date(2026, 4, 18); // day 0
export const DEMO_TODAY = 123;                   // 18 Sep 2026

// One regular crew plays across every setting, each with the army that suits
// them there. skill: chance-of-winning weight. active: [firstDay, lastDay] they
// turn up. surge: from this day on they play twice as often and a little better.
export const DEMOS = {
  'old-world': {
    name: 'Endless Store Campaign',
    seed: 40000,
    players: [
      { id: 'michael', name: 'Michael', army: 'The Grail Company of Couronne', faction: 'bretonnia', skill: 0.6, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: "Brett's Chaos Knights", faction: 'chaos', skill: 0.64, active: [0, 123], surge: 85 },
      { id: 'sean', name: 'Sean', army: 'Rotbringers of the North', faction: 'chaos', skill: 0.57, active: [0, 123] },
      { id: 'ryan', name: 'Ryan', army: 'Sea Guard of Lothern', faction: 'high-elves', skill: 0.6, active: [10, 123] },
      { id: 'conrad', name: 'Conrad', army: 'The Jade Caravan', faction: 'cathay', skill: 0.56, active: [0, 75] },
      { id: 'anthony', name: 'Anthony', army: 'Infernal Guard of Zharr-Naggrund', faction: 'chaos-dwarfs', skill: 0.6, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Waaagh! Jordgut', faction: 'orcs', skill: 0.55, active: [0, 123] },
      { id: 'andy', name: 'Andy', army: 'Da Moonclan Gitz', faction: 'orcs', skill: 0.5, active: [20, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'Clan Rattmatt', faction: 'skaven', skill: 0.57, active: [0, 123] },
    ],
    // Games people have agreed to but not yet played. Two on Parravon tonight.
    events: [
      { id: 'e1', day: 123, node: 'parravon', players: ['michael', 'brett'], note: 'The Grail against the Changer of Ways' },
      { id: 'e2', day: 123, node: 'parravon', players: ['ryan', 'rattmatt'], note: 'Elves in the warrens' },
      { id: 'e3', day: 123, node: 'black-fire-pass', players: ['jordan', 'anthony'], note: 'Hold the pass' },
      { id: 'e4', day: 125, node: 'stirland', players: ['andy', 'sean'] },
      { id: 'e5', day: 128, node: 'cathay-road', players: ['conrad', 'anthony'], note: 'Has the Jade Caravan returned?' },
      { id: 'e6', day: 130, node: 'bastonne', players: ['michael', 'jordan'] },
    ],
  },
  'mortal-realms': {
    name: 'Realmgate Wars League',
    seed: 4141,
    players: [
      { id: 'dee', name: 'Dee', army: 'Hammers of Sigmar', faction: 'stormcast', skill: 0.58, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Tempest Lords', faction: 'stormcast', skill: 0.55, active: [30, 123] },
      { id: 'cody', name: 'Cody', army: 'Hammerhal Freeguild', faction: 'cities', skill: 0.55, active: [0, 123] },
      { id: 'ari', name: 'Ari', army: 'The Goretide', faction: 'khorne', skill: 0.63, active: [0, 123], surge: 80 },
      { id: 'charles', name: 'Charles', army: 'Meatfist Tribe', faction: 'ogors', skill: 0.56, active: [40, 123] },
      { id: 'andy', name: 'Andy', army: 'Bad Moon Loonshrine', faction: 'gloomspite', skill: 0.52, active: [0, 123] },
      { id: 'michael', name: 'Michael', army: "Mor'phann Enclave", faction: 'idoneth', skill: 0.57, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Mortis Praetorians', faction: 'ossiarch', skill: 0.6, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: "Koatl's Claw", faction: 'seraphon', skill: 0.58, active: [0, 123] },
      { id: 'anthony', name: 'Anthony', army: "Hashut's Forgeguard", faction: 'helsmiths', skill: 0.6, active: [10, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'Clan Rattmatt Warband', faction: 'skaven', skill: 0.56, active: [0, 123] },
      { id: 'brandon', name: 'Brandon', army: "Brandon's Ravagers", faction: 'slaves', skill: 0.62, active: [0, 55] },
    ],
    // Two battles for the Stormrift Realmgate tonight.
    events: [
      { id: 'e1', day: 123, node: 'hammerhal-aqsha', players: ['ari', 'cody'], note: 'Storm the Stormrift' },
      { id: 'e2', day: 123, node: 'hammerhal-aqsha', players: ['anthony', 'dee'] },
      { id: 'e3', day: 123, node: 'arcway-fire', players: ['dylan', 'rattmatt'], note: 'Seal the Arcway' },
      { id: 'e4', day: 126, node: 'excelsis', players: ['charles', 'jowi'] },
      { id: 'e5', day: 129, node: 'syar', players: ['michael', 'andy'], note: 'Light against shadow' },
    ],
  },
  'horus-heresy': {
    name: 'The Age of Darkness',
    seed: 3030,
    players: [
      { id: 'brandon', name: 'Brandon', army: 'The Justaerin', faction: 'sons-of-horus', skill: 0.63, active: [0, 123], surge: 80 },
      { id: 'brett', name: 'Brett', army: 'Corvidae of Prospero', faction: 'thousand-sons', skill: 0.6, active: [0, 123] },
      { id: 'sean', name: 'Sean', army: 'The Grave Wardens', faction: 'death-guard', skill: 0.58, active: [0, 123] },
      { id: 'ari', name: 'Ari', army: 'Rampagers of the XII', faction: 'world-eaters', skill: 0.62, active: [0, 123] },
      { id: 'xander', name: 'Xander', army: 'The Phoenix Guard', faction: 'emperors-children', skill: 0.6, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: 'Terror Squads of Nostramo', faction: 'night-lords', skill: 0.57, active: [15, 123] },
      { id: 'charles', name: 'Charles', army: 'Taghmata of Mars', faction: 'mechanicum', skill: 0.56, active: [0, 123] },
      { id: 'david', name: 'David', army: 'Tra Company', faction: 'space-wolves', skill: 0.6, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Pyroclasts of Nocturne', faction: 'salamanders', skill: 0.56, active: [0, 123] },
      { id: 'conrad', name: 'Conrad', army: 'House Taranis', faction: 'knights', skill: 0.55, active: [0, 90] },
    ],
    // The Dropsite Massacre, tonight, twice over.
    events: [
      { id: 'e1', day: 123, node: 'isstvan', players: ['brandon', 'david'], note: 'Isstvan V: the Dropsite' },
      { id: 'e2', day: 123, node: 'isstvan', players: ['xander', 'danil'] },
      { id: 'e3', day: 123, node: 'terra', players: ['ari', 'charles'], note: 'The siege begins' },
      { id: 'e4', day: 126, node: 'prospero', players: ['david', 'brett'], note: 'The Burning of Prospero' },
      { id: 'e5', day: 129, node: 'calth', players: ['dylan', 'danil'] },
    ],
  },
  'warhammer-40k': {
    name: 'Indomitus Crusade League',
    seed: 4040,
    players: [
      { id: 'taylor', name: 'Taylor', army: 'Hive Fleet Leviathan', faction: 'tyranids', skill: 0.61, active: [0, 123], surge: 70 },
      { id: 'anthony-b', name: 'Anthony B.', army: 'Hive Fleet Kraken', faction: 'tyranids', skill: 0.55, active: [25, 123] },
      { id: 'conrad', name: 'Conrad', army: 'House Terryn', faction: 'imperial-knights', skill: 0.57, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: 'House Lucaris', faction: 'chaos-knights', skill: 0.62, active: [0, 123] },
      { id: 'sean', name: 'Sean', army: 'The Inexorable', faction: 'death-guard', skill: 0.58, active: [0, 123] },
      { id: 'ari', name: 'Ari', army: "Angron's Butchers", faction: 'world-eaters', skill: 0.6, active: [0, 123] },
      { id: 'charles', name: 'Charles', army: 'Skullsworn of Khorne', faction: 'world-eaters', skill: 0.55, active: [0, 123] },
      { id: 'dee', name: 'Dee', army: 'Black Legion Warband', faction: 'chaos-space-marines', skill: 0.58, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: 'Night Lords Claw', faction: 'chaos-space-marines', skill: 0.56, active: [0, 123] },
      { id: 'brandon', name: 'Brandon', army: 'Cult of Duplicity', faction: 'thousand-sons', skill: 0.6, active: [0, 123] },
      { id: 'xander', name: 'Xander', army: 'Deathwing Strike Force', faction: 'dark-angels', skill: 0.6, active: [0, 123] },
      { id: 'david', name: 'David', army: "Wolf Lord's Great Company", faction: 'space-wolves', skill: 0.59, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Salamanders 3rd Company', faction: 'space-marines', skill: 0.56, active: [0, 123] },
      { id: 'jean', name: 'Jean', army: 'Order of Our Martyred Lady', faction: 'sororitas', skill: 0.58, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Ryza Cohort', faction: 'mechanicus', skill: 0.55, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Goff Warband', faction: 'orks', skill: 0.55, active: [0, 123] },
      { id: 'andrew', name: 'Andrew', army: 'Evil Sunz Speed Mob', faction: 'orks', skill: 0.52, active: [0, 60] },
      { id: 'ryan', name: 'Ryan', army: 'Kabal of the Black Heart', faction: 'drukhari', skill: 0.57, active: [0, 123] },
    ],
    // The Great Devourer reaches Ichar IV tonight.
    events: [
      { id: 'e1', day: 123, node: 'ichar-iv', players: ['taylor', 'jean'], note: 'The Great Devourer descends' },
      { id: 'e2', day: 123, node: 'ichar-iv', players: ['anthony-b', 'conrad'] },
      { id: 'e3', day: 123, node: 'belis-corona', players: ['dee', 'xander'], note: 'Hold the Cadian Gate' },
      { id: 'e4', day: 125, node: 'armageddon', players: ['jordan', 'david'], note: 'The Third War for Armageddon' },
      { id: 'e5', day: 128, node: 'catachan', players: ['brandon', 'ryan'] },
    ],
  },
};

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// `graph` is a setting graph (buildSettingGraph), so battles can route through realmgates.
export function generateHistory(graph, setting, demo) {
  const rand = mulberry32(demo.seed);
  const pick = (items, weight) => {
    const total = items.reduce((s, x) => s + weight(x), 0);
    let r = rand() * total;
    for (const x of items) { r -= weight(x); if (r <= 0) return x; }
    return items[items.length - 1];
  };
  const homeIndex = f => graph.index.get(setting.factions.find(x => x.id === f).home);
  const activity = (p, day) => (day < p.active[0] || day > p.active[1] ? 0 : p.surge && day >= p.surge ? 2.2 : 1);
  const skill = (p, day) => p.skill + (p.surge && day >= p.surge ? 0.12 : 0);

  const games = [];
  const gameNights = new Set([2, 4, 6]); // Tue, Thu, Sat
  for (let day = 0; day < DEMO_TODAY; day++) {
    const weekday = new Date(DEMO_START.getTime() + day * 864e5).getDay();
    if (!gameNights.has(weekday)) continue;
    const tables = 2 + Math.floor(rand() * 3);
    const seated = new Set();
    for (let t = 0; t < tables; t++) {
      const pool = demo.players.filter(p => activity(p, day) > 0 && !seated.has(p.id));
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
      games.push({ id: `g${games.length + 1}`, day, node: setting.nodes[nodeIndex].id, winner: winner.id, loser: loser.id });
    }
  }
  return games;
}
