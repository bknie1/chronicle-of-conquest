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
    { id: 'nec-escher', name: 'House Escher', color: '#8e24aa', home: 'hp-hab-zones', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-escher-wildcats', name: 'Escher — the Underhive Wildcats', color: '#8e24aa', home: 'hp-dust-falls' },
        { id: 'nec-escher-primus', name: 'Escher — the Hive City Chymists', color: '#8e24aa', home: 'hp-hive-city' },
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
    { id: 'nec-van-saar', name: 'House Van Saar', color: '#00acc1', home: 'hp-subsidiary-spires', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-van-saar-archaeo', name: 'Van Saar — the Archaeotech Vaults', color: '#00acc1', home: 'hp-the-shell' },
        { id: 'nec-van-saar-primus', name: 'Van Saar — the Hive City Labs', color: '#00acc1', home: 'hp-manufactory-zones' },
      ] },
    { id: 'nec-delaque', name: 'House Delaque', color: '#37474f', home: 'hp-two-tunnels', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-delaque-shadow', name: 'Delaque — the Shadow Networks', color: '#37474f', home: 'hp-the-underhive' },
        { id: 'nec-delaque-spire', name: 'Delaque — the Spire Informants', color: '#37474f', home: 'hp-the-spire' },
      ] },
    { id: 'nec-cawdor', name: 'House Cawdor', color: '#8a6a1f', home: 'hp-glory-hole', alliance: 'nec-clan',
      subfactions: [
        { id: 'nec-cawdor-redemption', name: 'Cawdor — the Redemptionist Crusade', color: '#8a6a1f', home: 'hp-the-underhive' },
        { id: 'nec-cawdor-shanty', name: 'Cawdor — the Shanty Congregations', color: '#8a6a1f', home: 'hp-external-shanty-sprawl' },
      ] },

    // --- The Noble Houses: above the wall, and above the law ---------------
    { id: 'nec-helmawr', name: 'Imperial House Helmawr', color: '#e8c547', home: 'hp-the-palatine', alliance: 'nec-noble',
      subfactions: [
        { id: 'nec-helmawr-spire', name: 'Helmawr — the Lords of the Spire', color: '#e8c547', home: 'hp-the-spire' },
        { id: 'nec-helmawr-hive-primus', name: 'Helmawr — the Guardians of Necromunda', color: '#e8c547', home: 'hive-primus' },
      ] },
    { id: 'nec-ulanti', name: 'House Ulanti', color: '#151f84', home: 'hp-the-spire', alliance: 'nec-noble' },
    { id: 'nec-catallus', name: 'House Catallus', color: '#c75798', home: 'hive-temenos', alliance: 'nec-noble' },
    { id: 'nec-tyy', name: 'House Ty', color: '#95d0bc', home: 'hp-the-strangers-spire', alliance: 'nec-noble' },
    { id: 'nec-greim', name: 'House Greim', color: '#155684', home: 'hp-the-shell', alliance: 'nec-noble' },
    { id: 'nec-ran-lo', name: 'House Ran Lo', color: '#cfd8dc', home: 'hp-landing-field', alliance: 'nec-noble' },
    { id: 'nec-koiron', name: "House Ko'iron", color: '#a4a451', home: 'hive-acropolis', alliance: 'nec-noble' },
    { id: 'nec-enforcers', name: 'Palanite Enforcers', color: '#1565c0', home: 'hp-the-wall', alliance: 'nec-noble',
      subfactions: [
        { id: 'nec-enforcers-subjugators', name: 'Enforcers — the Subjugator Patrols', color: '#1565c0', home: 'hp-hive-city' },
        { id: 'nec-enforcers-badzone', name: 'Enforcers — the Badzone Detachments', color: '#1565c0', home: 'hp-the-underhive' },
      ] },

    // --- Outcasts and outlanders: the wastes, the sump and the cults -------
    { id: 'nec-ash-waste-nomads', name: 'Ash Waste Nomads', color: '#d0c695', home: 'great-equatorial-waste', alliance: 'nec-outcast',
      subfactions: [
        { id: 'nec-nomads-stormlands', name: 'Nomads — the Stormlands Trails', color: '#8d6e63', home: 'stormlands' },
        { id: 'nec-nomads-spoil', name: 'Nomads — the Spoil', color: '#8d6e63', home: 'the-spoil' },
      ] },
    { id: 'nec-outcasts', name: 'Outcast Gangs', color: '#a45f51', home: 'hp-dust-falls', alliance: 'nec-outcast' },
    { id: 'nec-corpse-grinders', name: 'Corpse Grinder Cults', color: '#9e1b32', home: 'hp-hive-bottom', alliance: 'nec-outcast' },
    { id: 'nec-genestealer-cults', name: 'Genestealer Cults', color: '#8151a4', home: 'xenos-quarantine-zone', alliance: 'nec-outcast' },
    { id: 'nec-chaos-cults', name: 'Chaos Cults', color: '#66123f', home: 'hp-the-sump', alliance: 'nec-outcast' },
    { id: 'nec-squat-prospectors', name: 'Squat Prospectors', color: '#a95023', home: 'hive-mortis', alliance: 'nec-outcast' },
    { id: 'nec-venators', name: 'Venator Bounty Hunters', color: '#23a97c', home: 'carrion-town', alliance: 'nec-outcast' },
    { id: 'nec-slave-ogryns', name: 'Slave Ogryns', color: '#a2c757', home: 'hp-primary-heat-sink', alliance: 'nec-outcast' },
    { id: 'nec-scavvies', name: 'Scavvies & Sump Dwellers', color: '#4f8a2a', home: 'hp-sump-sea', alliance: 'nec-outcast' },
    { id: 'nec-pit-slaves', name: 'Pit Slave Gangs', color: '#8194bb', home: 'pit-city', alliance: 'nec-outcast' },
  ],
};
