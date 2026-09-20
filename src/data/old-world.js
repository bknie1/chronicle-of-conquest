// The Old World: one map, and the armies that fight over it.
// Norsca is part of it, in the north — see the Norsca points on the map.
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
    { id: 'empire', name: 'The Empire', color: '#f2c230', home: 'altdorf', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-reikland', name: 'Reikland', color: '#f2c230', home: 'reikguard' },
        { id: 'ow-middenland', name: 'Middenland', color: '#f2c230', home: 'middenheim' },
        { id: 'ow-talabecland', name: 'Talabecland', color: '#f2c230', home: 'talabheim' },
        { id: 'ow-averland', name: 'Averland', color: '#f2c230', home: 'averheim' },
      ] },
    { id: 'bretonnia', name: 'Bretonnia', color: '#2f5bd8', home: 'couronne', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-bastonne', name: 'Bastonne', color: '#2f5bd8', home: 'bastonne' },
        { id: 'ow-carcassonne', name: 'Carcassonne', color: '#2f5bd8', home: 'carcassonne' },
        { id: 'ow-mousillon', name: 'Mousillon', color: '#2f5bd8', home: 'mousillon' },
      ] },
    { id: 'dwarfs', name: 'Dwarfen Mountain Holds', color: '#d0621c', home: 'karaz-a-karak', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-karak-kadrin', name: 'Karak Kadrin', color: '#d0621c', home: 'blood-peak' },
        { id: 'ow-karak-norn', name: 'Karak Norn', color: '#d0621c', home: 'karak-norn' },
        { id: 'ow-kraka-drak', name: 'Kraka Drak', color: '#d0621c', home: 'kraka-drak' },
      ] },
    { id: 'high-elves', name: 'High Elves', color: '#b0bec5', home: 'marienburg', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-lothern-fleet', name: 'The Lothern Fleet', color: '#b0bec5', home: 'black-ark' },
        { id: 'ow-tor-elasor', name: 'The Elven Quarter', color: '#b0bec5', home: 'marienburg' },
      ] },
    { id: 'wood-elves', name: 'Wood Elf Realms', color: '#2e7d32', home: 'athel-loren', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-coeth-mara', name: 'Coeth-Mara', color: '#2e7d32', home: 'coeth-mara' },
        { id: 'ow-talsyn', name: 'Talsyn', color: '#2e7d32', home: 'talsyn' },
      ] },
    { id: 'kislev', name: 'Kislev', color: '#49c3ef', home: 'kislev', alliance: 'ow-order',
      subfactions: [
        { id: 'ow-erengrad', name: 'Erengrad', color: '#49c3ef', home: 'erengrad' },
        { id: 'ow-praag', name: 'Praag', color: '#49c3ef', home: 'praag' },
        { id: 'ow-ungol-marches', name: 'The Ungol Marches', color: '#49c3ef', home: 'bolgasgrad' },
      ] },
    { id: 'cathay', name: 'Grand Cathay', color: '#ad1457', home: 'cathay-road', alliance: 'ow-order' },
    { id: 'lizardmen', name: 'Lizardmen', color: '#26a69a', home: 'lustrian-landing', alliance: 'ow-order' },
    { id: 'orcs', name: 'Orc & Goblin Tribes', color: '#7cb342', home: 'black-crag', alliance: 'ow-destruction',
      subfactions: [
        { id: 'ow-ironclaw', name: 'Ironclaw Orcs', color: '#7cb342', home: 'ironclaw-orcs' },
        { id: 'ow-crooked-moon', name: 'Crooked Moon Goblins', color: '#7cb342', home: 'crooked-moon-goblins' },
        { id: 'ow-red-fang', name: 'Red Fang Orcs', color: '#7cb342', home: 'red-fang-orcs' },
      ] },
    { id: 'ogres', name: 'Ogre Kingdoms', color: '#ff8a65', home: 'mountains-of-mourn', alliance: 'ow-destruction' },
    { id: 'chaos', name: 'Warriors of Chaos', color: '#c4102a', home: 'chaos-wastes', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-sarls', name: 'The Sarls', color: '#c4102a', home: 'olricstaad-heorot' },
        { id: 'ow-skaelings', name: 'The Skaelings', color: '#c4102a', home: 'thorkavik' },
        { id: 'ow-bjornlings', name: 'The Bjornlings', color: '#c4102a', home: 'stavgard' },
        { id: 'ow-aeslings', name: 'The Aeslings', color: '#c4102a', home: 'morkestaad' },
        { id: 'ow-kurgan', name: 'The Kurgan', color: '#c4102a', home: 'kurgan-steppe' },
      ] },
    { id: 'daemons', name: 'Daemons of Chaos', color: '#e040fb', home: 'chaos-rift', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-baga-yar', name: 'The Daemon Fortress of Baga Yar', color: '#e040fb', home: 'baga-yar' },
      ] },
    { id: 'beastmen', name: 'Beastmen Brayherds', color: '#a1887f', home: 'drakwald', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-great-forest', name: 'The Great Forest herds', color: '#a1887f', home: 'bek' },
        { id: 'ow-athel-loren-herds', name: 'The Wild Herds', color: '#a1887f', home: 'talsyn' },
      ] },
    { id: 'chaos-dwarfs', name: 'Chaos Dwarfs', color: '#455a64', home: 'azgorh', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-uzkulak', name: 'Uzkulak', color: '#455a64', home: 'uzkulak' },
        { id: 'ow-zorn-uzkul', name: 'Zorn Uzkul', color: '#455a64', home: 'zorn-uzkul' },
      ] },
    { id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'skavenblight', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-clan-mors', name: 'Clan Mors', color: '#8b5a2b', home: 'blood-peak' },
        { id: 'ow-clan-pestilens', name: 'Clan Pestilens', color: '#8b5a2b', home: 'cursed-marshes' },
        { id: 'ow-hell-pit', name: 'Clan Moulder', color: '#8b5a2b', home: 'hell-pit' },
      ] },
    { id: 'dark-elves', name: 'Dark Elves', color: '#1a237e', home: 'black-ark', alliance: 'ow-chaos',
      subfactions: [
        { id: 'ow-naggaroth-raiders', name: 'The Corsair Fleets', color: '#1a237e', home: 'lustrian-landing' },
      ] },
    { id: 'vampires', name: 'Vampire Counts', color: '#8a2ed0', home: 'drakenhof', alliance: 'ow-death',
      subfactions: [
        { id: 'ow-waldenhof', name: 'Waldenhof', color: '#8a2ed0', home: 'waldenhof' },
        { id: 'ow-blood-keep', name: 'The Blood Keep', color: '#8a2ed0', home: 'blood-keep' },
        { id: 'ow-mourkain', name: 'Mourkain', color: '#8a2ed0', home: 'mourkain' },
      ] },
    { id: 'tomb-kings', name: 'Tomb Kings of Khemri', color: '#d7b97f', home: 'nehekhara-road', alliance: 'ow-death' },
  ],
};
