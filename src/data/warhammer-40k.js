// Warhammer 40,000: one galaxy map, every faction with a home. The Imperium
// holds Sol and the core worlds, Chaos the warp rifts, the Kin the galactic
// core, and the Tyranids come in from the galactic east.
import { MAPS } from './maps/index.js';

export const WARHAMMER_40K = {
  id: 'warhammer-40k',
  name: 'Warhammer 40,000',
  maps: [MAPS['galaxy-40k']],
  // Every home can never fall. The map is light, so no pale colours.
  factions: [
    // Imperium
    { id: 'custodes', name: 'Adeptus Custodes', color: '#c9a227', home: 'terra-40k' },
    { id: 'mechanicus', name: 'Adeptus Mechanicus', color: '#bf360c', home: 'mars-40k' },
    { id: 'grey-knights', name: 'Grey Knights', color: '#78909c', home: 'titan' },
    { id: 'space-marines', name: 'Space Marines', color: '#1565c0', home: 'macragge-40k' },
    { id: 'dark-angels', name: 'Dark Angels', color: '#1b5e20', home: 'the-rock' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#5c7a8a', home: 'fenris-40k' },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal-40k' },
    { id: 'black-templars', name: 'Black Templars', color: '#212121', home: 'the-eternal-crusader' },
    { id: 'deathwatch', name: 'Deathwatch', color: '#455a64', home: 'watch-fortress-erioch' },
    { id: 'astra-militarum', name: 'Astra Militarum', color: '#6d7b3a', home: 'cadia' },
    { id: 'sororitas', name: 'Adepta Sororitas', color: '#ad1457', home: 'ophelia' },
    { id: 'imperial-knights', name: 'Imperial Knights', color: '#fdd835', home: 'chiros' },
    { id: 'imperial-agents', name: 'Imperial Agents', color: '#4e342e', home: 'hydraphur' },
    // Chaos
    { id: 'chaos-space-marines', name: 'Chaos Space Marines', color: '#b8860b', home: 'storm-of-the-emperors-wrath' },
    { id: 'chaos-daemons', name: 'Chaos Daemons', color: '#e040fb', home: 'eye-of-terror' },
    { id: 'chaos-knights', name: 'Chaos Knights', color: '#4a148c', home: 'malfactus' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'sirens-storm' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#0277bd', home: 'prospero-40k' },
    { id: 'world-eaters', name: 'World Eaters', color: '#8e0000', home: 'maelstrom' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'somnium-stars' },
    // Xenos
    { id: 'necrons', name: 'Necrons', color: '#00c853', home: 'mephrit' },
    { id: 'orks', name: 'Orks', color: '#558b2f', home: 'charadon' },
    { id: 'tyranids', name: 'Tyranids', color: '#8e24aa', home: 'leviathan' },
    { id: 'genestealer-cults', name: 'Genestealer Cults', color: '#5e35b1', home: 'ichar-iv' },
    { id: 'tau', name: "T'au Empire", color: '#ef6c00', home: 'tau-empire' },
    { id: 'aeldari', name: 'Aeldari', color: '#00897b', home: 'craftworld-iyanden' },
    { id: 'drukhari', name: 'Drukhari', color: '#1b5e5e', home: 'commorragh' },
    { id: 'votann', name: 'Leagues of Votann', color: '#795548', home: 'kin-holds' },
  ],
};
