// The Old World: one map, and the armies that fight over it.
// See src/data/settings.js for what alliances, factions and subfactions mean.
import { MAPS } from './maps/index.js';

export const OLD_WORLD = {
  id: 'old-world',
  name: 'The Old World',
  maps: [MAPS['old-world']],
  // Simplest mode: four sides, one homeland each.
  alliances: [
    { id: 'ow-order', name: 'Order', color: '#2f5bd8', home: 'altdorf' },
    { id: 'ow-destruction', name: 'Destruction', color: '#7cb342', home: 'black-crag' },
    { id: 'ow-chaos', name: 'Chaos', color: '#c4102a', home: 'chaos-wastes' },
    { id: 'ow-death', name: 'Death', color: '#8a2ed0', home: 'drakenhof' },
  ],
  factions: [
    { id: 'empire', name: 'The Empire', color: '#f2c230', home: 'altdorf', alliance: 'ow-order' },
    { id: 'bretonnia', name: 'Bretonnia', color: '#2f5bd8', home: 'couronne', alliance: 'ow-order' },
    { id: 'dwarfs', name: 'Dwarfen Mountain Holds', color: '#d0621c', home: 'karaz-a-karak', alliance: 'ow-order' },
    { id: 'high-elves', name: 'High Elves', color: '#b0bec5', home: 'marienburg', alliance: 'ow-order' },
    { id: 'wood-elves', name: 'Wood Elf Realms', color: '#2e7d32', home: 'athel-loren', alliance: 'ow-order' },
    { id: 'kislev', name: 'Kislev', color: '#49c3ef', home: 'kislev', alliance: 'ow-order' },
    { id: 'cathay', name: 'Grand Cathay', color: '#ad1457', home: 'cathay-road', alliance: 'ow-order' },
    { id: 'lizardmen', name: 'Lizardmen', color: '#26a69a', home: 'lustrian-landing', alliance: 'ow-order' },
    { id: 'orcs', name: 'Orc & Goblin Tribes', color: '#7cb342', home: 'black-crag', alliance: 'ow-destruction' },
    { id: 'ogres', name: 'Ogre Kingdoms', color: '#ff8a65', home: 'mountains-of-mourn', alliance: 'ow-destruction' },
    { id: 'chaos', name: 'Warriors of Chaos', color: '#c4102a', home: 'chaos-wastes', alliance: 'ow-chaos' },
    { id: 'daemons', name: 'Daemons of Chaos', color: '#e040fb', home: 'chaos-rift', alliance: 'ow-chaos' },
    { id: 'beastmen', name: 'Beastmen Brayherds', color: '#a1887f', home: 'drakwald', alliance: 'ow-chaos' },
    { id: 'chaos-dwarfs', name: 'Chaos Dwarfs', color: '#455a64', home: 'azgorh', alliance: 'ow-chaos' },
    { id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'skavenblight', alliance: 'ow-chaos' },
    { id: 'dark-elves', name: 'Dark Elves', color: '#1a237e', home: 'black-ark', alliance: 'ow-chaos' },
    { id: 'vampires', name: 'Vampire Counts', color: '#8a2ed0', home: 'drakenhof', alliance: 'ow-death' },
    { id: 'tomb-kings', name: 'Tomb Kings of Khemri', color: '#d7b97f', home: 'nehekhara-road', alliance: 'ow-death' },
  ],
};
