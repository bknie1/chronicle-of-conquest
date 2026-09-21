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
      { id: 'brett', name: 'Brett', army: "Brett's Chaos Knights", faction: 'ow-bjornlings', skill: 0.64, active: [0, 123], surge: 85 },
      { id: 'sean', name: 'Sean', army: 'Rotbringers of the North', faction: 'ow-skaelings', skill: 0.57, active: [0, 123] },
      { id: 'ryan', name: 'Ryan', army: 'Sea Guard of Lothern', faction: 'ow-lothern-fleet', skill: 0.6, active: [10, 123] },
      { id: 'conrad', name: 'Conrad', army: 'The Jade Caravan', faction: 'cathay', skill: 0.56, active: [0, 75] },
      { id: 'anthony', name: 'Anthony', army: 'Infernal Guard of Zharr-Naggrund', faction: 'chaos-dwarfs', skill: 0.6, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Waaagh! Jordgut', faction: 'orcs', skill: 0.55, active: [0, 123] },
      { id: 'andy', name: 'Andy', army: 'Da Moonclan Gitz', faction: 'ow-crooked-moon', skill: 0.5, active: [20, 123] },
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
      { id: 'e7', day: 124, node: 'stavgard', players: ['brett', 'sean'], note: 'Which tribe sails first' },
    ],
  },
  'warhammer-fantasy': {
    name: 'The World That Was',
    seed: 8500,
    players: [
      { id: 'michael', name: 'Michael', army: 'Knights of Bastonne', faction: 'wf-bastonne-dukedom', skill: 0.6, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: 'The Bloodhost of Kharnath', faction: 'wf-chaos-warriors', skill: 0.63, active: [0, 123], surge: 82 },
      { id: 'sean', name: 'Sean', army: 'Tallybearers of Nurgle', faction: 'wf-daemons', skill: 0.56, active: [0, 123] },
      { id: 'ryan', name: 'Ryan', army: 'Sea Guard of Eataine', faction: 'wf-eataine', skill: 0.6, active: [0, 123] },
      { id: 'conrad', name: 'Conrad', army: 'The Jade Caravan', faction: 'wf-cathay-west', skill: 0.56, active: [0, 90] },
      { id: 'anthony', name: 'Anthony', army: 'Infernal Guard of Zharr', faction: 'wf-chaos-dwarfs', skill: 0.6, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Waaagh! Jordgut', faction: 'wf-orcs', skill: 0.55, active: [0, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'Clan Mors Stormvermin', faction: 'wf-clan-mors', skill: 0.58, active: [0, 123] },
      { id: 'dee', name: 'Dee', army: 'Reiksguard of Altdorf', faction: 'wf-reikland', skill: 0.57, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'The Drakenhof Retinue', faction: 'wf-von-carstein', skill: 0.59, active: [10, 123] },
      { id: 'dylan', name: 'Dylan', army: 'Sunblood of Hexoatl', faction: 'wf-hexoatl-city', skill: 0.58, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Ungol Horse of Kislev', faction: 'wf-kislev', skill: 0.55, active: [25, 123] },
    ],
    events: [
      { id: 'e1', day: 123, node: 'fw-eight-peaks', players: ['rattmatt', 'jordan'], note: 'Who rules the Eight Peaks tonight' },
      { id: 'e2', day: 123, node: 'fw-eight-peaks', players: ['dee', 'brett'], note: 'The Reiksguard ride out' },
      { id: 'e3', day: 123, node: 'fw-drakwald', players: ['jowi', 'michael'] },
      { id: 'e4', day: 125, node: 'fw-kislev-city', players: ['danil', 'sean'], note: 'Hold the gates of Kislev' },
      { id: 'e5', day: 128, node: 'fw-lothern', players: ['ryan', 'dylan'] },
      { id: 'e6', day: 130, node: 'fw-zharr-naggrund', players: ['anthony', 'conrad'], note: 'A debt of gold and iron' },
    ],
  },
  'mortal-realms': {
    name: 'Realmgate Wars League',
    seed: 4141,
    players: [
      { id: 'dee', name: 'Dee', army: 'Hammers of Sigmar', faction: 'stormhost-hammers-of-sigmar', skill: 0.58, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Tempest Lords', faction: 'stormhost-tempest-lords', skill: 0.55, active: [30, 123] },
      { id: 'cody', name: 'Cody', army: 'Hammerhal Freeguild', faction: 'city-hammerhal', skill: 0.55, active: [0, 123] },
      { id: 'ari', name: 'Ari', army: 'The Goretide', faction: 'khorne-goretide', skill: 0.63, active: [0, 123], surge: 80 },
      { id: 'charles', name: 'Charles', army: 'Meatfist Tribe', faction: 'tribe-meatfist', skill: 0.56, active: [40, 123] },
      { id: 'andy', name: 'Andy', army: 'Bad Moon Loonshrine', faction: 'gitz-gloggs-megamob', skill: 0.52, active: [0, 123] },
      { id: 'michael', name: 'Michael', army: "Mor'phann Enclave", faction: 'enclave-morphann', skill: 0.57, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Mortis Praetorians', faction: 'legion-mortis-praetorians', skill: 0.6, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: "Koatl's Claw", faction: 'constellation-koatls-claw', skill: 0.58, active: [0, 123] },
      { id: 'anthony', name: 'Anthony', army: "Hashut's Forgeguard", faction: 'helsmiths', skill: 0.6, active: [10, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'Clan Rattmatt Warband', faction: 'clan-skryre', skill: 0.56, active: [0, 123] },
      { id: 'brandon', name: 'Brandon', army: "Brandon's Ravagers", faction: 'warband-ravagers', skill: 0.62, active: [0, 55] },
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
      { id: 'jowi', name: 'Jowi', army: "Garro's Oathsworn", faction: 'hh-shattered-garro', skill: 0.58, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'The Headsmen', faction: 'hh-blackshields-caliban', skill: 0.56, active: [20, 123] },
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
  'legions-imperialis': {
    name: 'Beta-Garmon Campaign',
    seed: 3131,
    players: [
      { id: 'brandon', name: 'Brandon', army: 'Justaerin Terminator Cadre', faction: 'li-sons-of-horus', skill: 0.62, active: [0, 123], surge: 85 },
      { id: 'ari', name: 'Ari', army: 'Red Sand Assault Company', faction: 'li-world-eaters', skill: 0.6, active: [0, 123] },
      { id: 'sean', name: 'Sean', army: 'The Reaping', faction: 'li-death-guard', skill: 0.57, active: [0, 123] },
      { id: 'xander', name: 'Xander', army: 'Palatine Blades Demi-Company', faction: 'li-emperors-children', skill: 0.59, active: [0, 123] },
      { id: 'david', name: 'David', army: 'Ultramar Expeditionary Force', faction: 'li-ultramarines', skill: 0.6, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Pyre Guard Company', faction: 'li-salamanders', skill: 0.56, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: 'Death Stalkers Maniple', faction: 'li-legio-mortis', skill: 0.58, active: [0, 123] },
      { id: 'tyler', name: 'Tyler', army: 'Warp Runners Maniple', faction: 'li-legio-astorum', skill: 0.57, active: [10, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Tempestus Battlegroup', faction: 'li-legio-tempestus', skill: 0.56, active: [0, 123] },
      { id: 'conrad', name: 'Conrad', army: 'House Malinax Lance', faction: 'li-house-malinax', skill: 0.55, active: [0, 123] },
      { id: 'charles', name: 'Charles', army: 'Taghmata Omnissiah', faction: 'li-mechanicum', skill: 0.57, active: [0, 123] },
      { id: 'michael', name: 'Michael', army: '12th Solar Cohort', faction: 'li-auxilia', skill: 0.55, active: [20, 123] },
      { id: 'brett', name: 'Brett', army: 'Third Phalanx Warder Cadre', faction: 'li-imperial-fists', skill: 0.6, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Shadowmasters of Deliverance', faction: 'li-raven-guard', skill: 0.56, active: [0, 123] },
    ],
    // The war for Beta-Garmon, the Throneworld's gate.
    events: [
      { id: 'e1', day: 123, node: 'beta-garmon', players: ['brandon', 'david'], note: 'The Gate of Terra' },
      { id: 'e2', day: 123, node: 'beta-garmon', players: ['dylan', 'jowi'], note: 'God-engines walk' },
      { id: 'e3', day: 123, node: 'mars', players: ['charles', 'conrad'], note: 'The forges must hold' },
      { id: 'e4', day: 126, node: 'tallarn', players: ['ari', 'michael'] },
      { id: 'e5', day: 129, node: 'nocturne', players: ['sean', 'danil'] },
    ],
  },
  'necromunda': {
    name: 'The Hive Primus Turf War',
    seed: 2018,
    players: [
      { id: 'michael', name: 'Michael', army: 'The Gilded Claw', faction: 'nec-escher', skill: 0.6, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: 'Kurgan’s Forge Born', faction: 'nec-goliath', skill: 0.62, active: [0, 123], surge: 90 },
      { id: 'sean', name: 'Sean', army: 'The Ash Road Haulers', faction: 'nec-orlock', skill: 0.58, active: [0, 123] },
      { id: 'ryan', name: 'Ryan', army: 'The Silent Ledger', faction: 'nec-delaque', skill: 0.59, active: [0, 123] },
      { id: 'conrad', name: 'Conrad', army: 'The Rad-Tithe', faction: 'nec-van-saar', skill: 0.6, active: [8, 123] },
      { id: 'anthony', name: 'Anthony', army: 'The Redemption of Ash', faction: 'nec-cawdor', skill: 0.57, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Palanite Precinct 14', faction: 'nec-enforcers', skill: 0.58, active: [0, 123] },
      { id: 'andy', name: 'Andy', army: 'The Dust Runners', faction: 'nec-ash-waste-nomads', skill: 0.55, active: [0, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'The Meat Harvest', faction: 'nec-corpse-grinders', skill: 0.56, active: [20, 123] },
      { id: 'dee', name: 'Dee', army: 'The Fourth Generation', faction: 'nec-genestealer-cults', skill: 0.59, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Bounties of the Grasp', faction: 'nec-venators', skill: 0.56, active: [0, 110] },
      { id: 'dylan', name: 'Dylan', army: 'The Ulanti Retinue', faction: 'nec-ulanti', skill: 0.57, active: [0, 123] },
    ],
    events: [
      { id: 'e1', day: 123, node: 'hp-dust-falls', players: ['michael', 'brett'], note: 'Who collects at the Falls' },
      { id: 'e2', day: 123, node: 'hp-glory-hole', players: ['sean', 'anthony'], note: 'It stopped being neutral ground' },
      { id: 'e3', day: 123, node: 'hp-two-tunnels', players: ['ryan', 'jordan'] },
      { id: 'e4', day: 125, node: 'hp-manufactory-zones', players: ['conrad', 'brett'], note: 'A seam worth the bodies' },
      { id: 'e5', day: 126, node: 'great-ash-road-west', players: ['andy', 'sean'], note: 'Convoy or ambush, depending who you ask' },
      { id: 'e6', day: 128, node: 'hp-the-sump', players: ['rattmatt', 'dee'] },
      { id: 'e7', day: 130, node: 'hp-the-wall', players: ['jordan', 'michael'], note: 'Nobody gets up the Wall. Nobody.' },
    ],
  },
  'middle-earth': {
    name: 'The War of the Ring',
    seed: 3019,
    players: [
      { id: 'michael', name: 'Michael', army: 'The Guard of the Citadel', faction: 'gondor', skill: 0.61, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: 'The Eye of Barad-dûr', faction: 'barad-dur', skill: 0.64, active: [0, 123], surge: 88 },
      { id: 'sean', name: 'Sean', army: 'The Uruk-hai of Isengard', faction: 'isengard', skill: 0.6, active: [0, 123] },
      { id: 'ryan', name: 'Ryan', army: 'Riders of the Westfold', faction: 'me-rohan-westfold', skill: 0.59, active: [0, 123] },
      { id: 'conrad', name: 'Conrad', army: 'The Swan Knights', faction: 'me-gondor-dol-amroth', skill: 0.57, active: [12, 123] },
      { id: 'anthony', name: 'Anthony', army: 'Khand Charioteers', faction: 'easterlings', skill: 0.58, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'The Serpent Horde', faction: 'haradrim', skill: 0.56, active: [0, 123] },
      { id: 'andy', name: 'Andy', army: 'Thranduil’s Hunters', faction: 'woodland-realm', skill: 0.58, active: [0, 123] },
      { id: 'rattmatt', name: 'Ratt Matt', army: 'The Goblins of Gundabad', faction: 'angmar', skill: 0.55, active: [0, 100] },
      { id: 'dee', name: 'Dee', army: 'The Last Homely House', faction: 'rivendell', skill: 0.6, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'The Shadow of Dol Guldur', faction: 'dol-guldur', skill: 0.57, active: [18, 123] },
      { id: 'dylan', name: 'Dylan', army: 'The Company of Erebor', faction: 'iron-hills', skill: 0.56, active: [0, 123] },
    ],
    events: [
      { id: 'e1', day: 123, node: 'osgiliath', players: ['michael', 'brett'], note: 'The ruins change hands again' },
      { id: 'e2', day: 123, node: 'helms-deep', players: ['ryan', 'sean'], note: 'The Hornburg holds, or it does not' },
      { id: 'e3', day: 123, node: 'dale', players: ['dylan', 'anthony'] },
      { id: 'e4', day: 125, node: 'pelargir', players: ['conrad', 'jordan'], note: 'Corsair sails on the Anduin' },
      { id: 'e5', day: 127, node: 'woodland-realm', players: ['andy', 'jowi'], note: 'Under the eaves of Mirkwood' },
      { id: 'e6', day: 129, node: 'bruinen-ford', players: ['dee', 'rattmatt'] },
      { id: 'e7', day: 131, node: 'black-gate', players: ['michael', 'brett'], note: 'A distraction, and everyone knows it' },
    ],
  },
  'warhammer-40k': {
    name: 'Indomitus Crusade League',
    seed: 4040,
    players: [
      { id: 'tyler', name: 'Tyler', army: 'Hive Fleet Leviathan', faction: 'hive-fleet-leviathan', skill: 0.61, active: [0, 123], surge: 70 },
      { id: 'tyler-sharks', name: 'Tyler', army: 'Void Reavers', faction: 'carcharodons', skill: 0.58, active: [35, 123] },
      { id: 'anthony-b', name: 'Anthony B.', army: 'Hive Fleet Kraken', faction: 'kraken', skill: 0.55, active: [25, 123] },
      { id: 'conrad', name: 'Conrad', army: 'House Terryn', faction: 'house-terryn', skill: 0.57, active: [0, 123] },
      { id: 'brett', name: 'Brett', army: 'House Lucaris', faction: 'house-lucaris', skill: 0.62, active: [0, 123] },
      { id: 'sean', name: 'Sean', army: 'The Inexorable', faction: 'death-guard', skill: 0.58, active: [0, 123] },
      { id: 'ari', name: 'Ari', army: "Angron's Butchers", faction: 'world-eaters', skill: 0.6, active: [0, 123] },
      { id: 'charles', name: 'Charles', army: 'Skullsworn of Khorne', faction: 'world-eaters', skill: 0.55, active: [0, 123] },
      { id: 'dee', name: 'Dee', army: 'Black Legion Warband', faction: 'black-legion', skill: 0.58, active: [0, 123] },
      { id: 'dylan', name: 'Dylan', army: 'Night Lords Claw', faction: 'night-lords', skill: 0.56, active: [0, 123] },
      { id: 'brandon', name: 'Brandon', army: 'Cult of Duplicity', faction: 'thousand-sons', skill: 0.6, active: [0, 123] },
      { id: 'xander', name: 'Xander', army: 'Deathwing Strike Force', faction: 'deathwing', skill: 0.6, active: [0, 123] },
      { id: 'david', name: 'David', army: "Wolf Lord's Great Company", faction: 'company-of-grimnar', skill: 0.59, active: [0, 123] },
      { id: 'danil', name: 'Danil', army: 'Salamanders 3rd Company', faction: 'salamanders', skill: 0.56, active: [0, 123] },
      { id: 'jean', name: 'Jean', army: 'Order of Our Martyred Lady', faction: 'our-martyred-lady', skill: 0.58, active: [0, 123] },
      { id: 'jowi', name: 'Jowi', army: 'Ryza Cohort', faction: 'forge-world-ryza', skill: 0.55, active: [0, 123] },
      { id: 'jordan', name: 'Jordan', army: 'Goff Warband', faction: 'goffs', skill: 0.55, active: [0, 123] },
      { id: 'andrew', name: 'Andrew', army: 'Evil Sunz Speed Mob', faction: 'evil-sunz', skill: 0.52, active: [0, 60] },
      { id: 'ryan', name: 'Ryan', army: 'Kabal of the Black Heart', faction: 'black-heart', skill: 0.57, active: [0, 123] },
    ],
    // The Great Devourer reaches Ichar IV tonight.
    events: [
      { id: 'e1', day: 123, node: 'ichar-iv', players: ['tyler', 'jean'], note: 'The Great Devourer descends' },
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
  // A demo army's `faction` is the ground it musters from: a book's seat or a
  // sub-faction's. Games start out near there.
  const homes = new Map(setting.starts.map(s => [s.id, s.point]));
  const homeIndex = f => graph.index.get(homes.get(f));
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
