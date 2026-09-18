// Warhammer 40,000: one galaxy map. Chaos holds the warp rifts, the Orks
// Charadon, and the Tyranids come in from the galactic east.
import { MAPS } from './maps/index.js';

export const WARHAMMER_40K = {
  id: 'warhammer-40k',
  name: 'Warhammer 40,000',
  maps: [MAPS['galaxy-40k']],
  // Every home can never fall.
  factions: [
    { id: 'space-marines', name: 'Space Marines', color: '#43a047', home: 'nocturne-40k' },
    { id: 'dark-angels', name: 'Dark Angels', color: '#2e5e2e', home: 'the-rock' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#90a4ae', home: 'fenris-40k' },
    { id: 'sororitas', name: 'Adepta Sororitas', color: '#f5f5f5', home: 'ophelia' },
    { id: 'mechanicus', name: 'Adeptus Mechanicus', color: '#8d2b0b', home: 'terra-40k' },
    { id: 'imperial-knights', name: 'Imperial Knights', color: '#fdd835', home: 'chiros' },
    { id: 'chaos-space-marines', name: 'Chaos Space Marines', color: '#b8860b', home: 'eye-of-terror' },
    { id: 'chaos-knights', name: 'Chaos Knights', color: '#6a1b9a', home: 'cadia' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'sirens-storm' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#1565c0', home: 'prospero-40k' },
    { id: 'world-eaters', name: 'World Eaters', color: '#c62828', home: 'maelstrom' },
    { id: 'necrons', name: 'Necrons', color: '#00e676', home: 'mephrit' },
    { id: 'orks', name: 'Orks', color: '#558b2f', home: 'charadon' },
    { id: 'tyranids', name: 'Tyranids', color: '#ab47bc', home: 'leviathan' },
    { id: 'drukhari', name: 'Drukhari', color: '#00838f', home: 'commorragh' },
  ],
};
