// Necromunda: gang war on one poisoned world, played on two maps. The
// cartograph is the surface — the hives, the ash roads and the wastes between
// them — and Hive Primus is the hive itself in section, reached by going down
// the shaft from its spire. See src/data/settings.js for what alliances,
// factions and subfactions mean.
import { MAPS } from './maps/index.js';

export const NECROMUNDA = {
  id: 'necromunda',
  name: 'Necromunda',
  maps: [MAPS['necromunda'], MAPS['hive-primus']],
  // Hive Primus is drawn twice: as a spire on the cartograph, and as its own
  // cutaway. Going down from the surface puts you on the Palatine.
  gates: [
    ['hive-primus', 'hp-the-palatine', 'Down the hive'],
  ],
  // Simplest mode: who you answer to. A hive's politics come down to the
  // nobility above the wall, the clans who work below it, and everyone the
  // hive would rather forget.
  overview: { name: 'All locations' },
  defaultLevel: 'alliance',
  alliances: [
    { id: 'nec-noble', name: 'The Noble Houses', color: '#c9a227', home: 'hp-the-palatine' },
    { id: 'nec-clan', name: 'The Clan Houses', color: '#37474f', home: 'hp-hive-city' },
    { id: 'nec-outcast', name: 'Outcasts & Outlanders', color: '#7f0000', home: 'hp-the-underhive' },
  ],
  factions: [
    // --- The Clan Houses: the six that run the hive's working levels --------
    { id: 'nec-escher', name: 'House Escher', color: '#7b1fa2', home: 'hp-hab-zones', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-escher-wildcats', name: 'Escher — the Underhive Wildcats', color: '#7b1fa2', home: 'hp-dust-falls' },
        { id: 'nec-escher-primus', name: 'Escher — the Hive City Chymists', color: '#7b1fa2', home: 'hp-hive-city' },
      ] },
    { id: 'nec-goliath', name: 'House Goliath', color: '#c62828', home: 'hp-manufactory-zones', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-goliath-forge', name: 'Goliath — the Forge Gangs', color: '#c62828', home: 'hp-ruined-manufactories' },
        { id: 'nec-goliath-sump', name: 'Goliath — the Sump Crews', color: '#c62828', home: 'hp-hive-bottom' },
      ] },
    { id: 'nec-orlock', name: 'House Orlock', color: '#ef6c00', home: 'hp-hive-city', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-orlock-road', name: 'Orlock — the Ash Road Haulers', color: '#ef6c00', home: 'great-ash-road-west' },
        { id: 'nec-orlock-mines', name: 'Orlock — the Iron Mines', color: '#ef6c00', home: 'hp-the-underhive' },
      ] },
    { id: 'nec-van-saar', name: 'House Van Saar', color: '#00838f', home: 'hp-subsidiary-spires', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-van-saar-archaeo', name: 'Van Saar — the Archaeotech Vaults', color: '#00838f', home: 'hp-the-shell' },
        { id: 'nec-van-saar-primus', name: 'Van Saar — the Hive City Labs', color: '#00838f', home: 'hp-manufactory-zones' },
      ] },
    { id: 'nec-delaque', name: 'House Delaque', color: '#455a64', home: 'hp-two-tunnels', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-delaque-shadow', name: 'Delaque — the Shadow Networks', color: '#455a64', home: 'hp-the-underhive' },
        { id: 'nec-delaque-spire', name: 'Delaque — the Spire Informants', color: '#455a64', home: 'hp-the-spire' },
      ] },
    { id: 'nec-cawdor', name: 'House Cawdor', color: '#5d4037', home: 'hp-glory-hole', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-cawdor-redemption', name: 'Cawdor — the Redemptionist Crusade', color: '#5d4037', home: 'hp-the-underhive' },
        { id: 'nec-cawdor-shanty', name: 'Cawdor — the Shanty Congregations', color: '#5d4037', home: 'hp-external-shanty-sprawl' },
      ] },

    // --- The Noble Houses: above the wall, and above the law ---------------
    { id: 'nec-helmawr', name: 'Imperial House Helmawr', color: '#c9a227', home: 'hp-the-palatine', alliance: 'nec-noble',
      subfactions: [
        { id: 'nec-helmawr-spire', name: 'Helmawr — the Lords of the Spire', color: '#c9a227', home: 'hp-the-spire' },
        { id: 'nec-helmawr-hive-primus', name: 'Helmawr — the Guardians of Necromunda', color: '#c9a227', home: 'hive-primus' },
      ] },
    { id: 'nec-ulanti', name: 'House Ulanti', color: '#9fa8da', home: 'hp-the-spire', alliance: 'nec-noble' },
    { id: 'nec-catallus', name: 'House Catallus', color: '#8d6e63', home: 'hive-temenos', alliance: 'nec-noble' },
    { id: 'nec-tyy', name: 'House Ty', color: '#4db6ac', home: 'hp-the-strangers-spire', alliance: 'nec-noble' },
    { id: 'nec-greim', name: 'House Greim', color: '#78909c', home: 'hp-the-shell', alliance: 'nec-noble' },
    { id: 'nec-ran-lo', name: 'House Ran Lo', color: '#a1887f', home: 'hp-landing-field', alliance: 'nec-noble' },
    { id: 'nec-koiron', name: "House Ko'iron", color: '#bcaaa4', home: 'hive-acropolis', alliance: 'nec-noble' },
    { id: 'nec-enforcers', name: 'Palanite Enforcers', color: '#1565c0', home: 'hp-the-wall', alliance: 'nec-noble',
      subfactions: [
        { id: 'nec-enforcers-subjugators', name: 'Enforcers — the Subjugator Patrols', color: '#1565c0', home: 'hp-hive-city' },
        { id: 'nec-enforcers-badzone', name: 'Enforcers — the Badzone Detachments', color: '#1565c0', home: 'hp-the-underhive' },
      ] },

    // --- Outcasts and outlanders: the wastes, the sump and the cults -------
    { id: 'nec-ash-waste-nomads', name: 'Ash Waste Nomads', color: '#8d6e63', home: 'great-equatorial-waste', alliance: 'nec-outcast',
      subfactions: [
        { id: 'nec-nomads-stormlands', name: 'Nomads — the Stormlands Trails', color: '#8d6e63', home: 'stormlands' },
        { id: 'nec-nomads-spoil', name: 'Nomads — the Spoil', color: '#8d6e63', home: 'the-spoil' },
      ] },
    { id: 'nec-outcasts', name: 'Outcast Gangs', color: '#6d4c41', home: 'hp-dust-falls', alliance: 'nec-outcast' },
    { id: 'nec-corpse-grinders', name: 'Corpse Grinder Cults', color: '#b71c1c', home: 'hp-hive-bottom', alliance: 'nec-outcast' },
    { id: 'nec-genestealer-cults', name: 'Genestealer Cults', color: '#6a1b9a', home: 'xenos-quarantine-zone', alliance: 'nec-outcast' },
    { id: 'nec-chaos-cults', name: 'Chaos Cults', color: '#880e4f', home: 'hp-the-sump', alliance: 'nec-outcast' },
    { id: 'nec-squat-prospectors', name: 'Squat Prospectors', color: '#f9a825', home: 'hive-mortis', alliance: 'nec-outcast' },
    { id: 'nec-venators', name: 'Venator Bounty Hunters', color: '#546e7a', home: 'carrion-town', alliance: 'nec-outcast' },
    { id: 'nec-slave-ogryns', name: 'Slave Ogryns', color: '#827717', home: 'hp-primary-heat-sink', alliance: 'nec-outcast' },
    { id: 'nec-scavvies', name: 'Scavvies & Sump Dwellers', color: '#33691e', home: 'hp-sump-sea', alliance: 'nec-outcast' },
    { id: 'nec-pit-slaves', name: 'Pit Slave Gangs', color: '#4e342e', home: 'pit-city', alliance: 'nec-outcast' },
  ],
};
