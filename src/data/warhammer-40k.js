// Warhammer 40,000: one galaxy map, every faction with a home. The Imperium
// holds Sol and the core worlds, Chaos the warp rifts, the Kin the galactic
// core, and the Tyranids come in from the galactic east.
import { MAPS } from './maps/index.js';

export const WARHAMMER_40K = {
  id: 'warhammer-40k',
  name: 'Warhammer 40,000',
  maps: [MAPS['galaxy-40k']],
  // Simplest mode: the three great sides of the 41st millennium.
  alliances: [
    { id: 'imperium', name: 'The Imperium', color: '#c9a227', home: 'terra-40k' },
    { id: 'chaos-alliance', name: 'Chaos', color: '#8e0000', home: 'eye-of-terror' },
    { id: 'xenos', name: 'Xenos', color: '#00897b', home: 'charadon' },
  ],
  // Every home can never fall. The map is light, so no pale colours.
  factions: [
    // Imperium
    { id: 'custodes', name: 'Adeptus Custodes', color: '#c9a227', home: 'terra-40k', alliance: 'imperium' },
    { id: 'mechanicus', name: 'Adeptus Mechanicus', color: '#bf360c', home: 'mars-40k', alliance: 'imperium' },
    { id: 'grey-knights', name: 'Grey Knights', color: '#78909c', home: 'titan', alliance: 'imperium' },
    { id: 'space-marines', name: 'Space Marines', color: '#1565c0', home: 'macragge-40k', alliance: 'imperium' },
    { id: 'dark-angels', name: 'Dark Angels', color: '#1b5e20', home: 'the-rock', alliance: 'imperium' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#5c7a8a', home: 'fenris-40k', alliance: 'imperium' },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal-40k', alliance: 'imperium' },
    { id: 'black-templars', name: 'Black Templars', color: '#212121', home: 'the-eternal-crusader', alliance: 'imperium' },
    { id: 'deathwatch', name: 'Deathwatch', color: '#455a64', home: 'watch-fortress-erioch', alliance: 'imperium' },
    { id: 'astra-militarum', name: 'Astra Militarum', color: '#6d7b3a', home: 'cadia', alliance: 'imperium' },
    { id: 'sororitas', name: 'Adepta Sororitas', color: '#ad1457', home: 'ophelia', alliance: 'imperium' },
    { id: 'imperial-knights', name: 'Imperial Knights', color: '#fdd835', home: 'chiros', alliance: 'imperium' },
    { id: 'imperial-agents', name: 'Imperial Agents', color: '#4e342e', home: 'hydraphur', alliance: 'imperium' },
    // Chaos
    { id: 'chaos-space-marines', name: 'Chaos Space Marines', color: '#b8860b', home: 'storm-of-the-emperors-wrath', alliance: 'chaos-alliance' },
    { id: 'chaos-daemons', name: 'Chaos Daemons', color: '#e040fb', home: 'eye-of-terror', alliance: 'chaos-alliance' },
    { id: 'chaos-knights', name: 'Chaos Knights', color: '#4a148c', home: 'malfactus', alliance: 'chaos-alliance' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'sirens-storm', alliance: 'chaos-alliance' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#0277bd', home: 'prospero-40k', alliance: 'chaos-alliance' },
    { id: 'world-eaters', name: 'World Eaters', color: '#8e0000', home: 'maelstrom', alliance: 'chaos-alliance' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'somnium-stars', alliance: 'chaos-alliance' },
    // Xenos
    { id: 'necrons', name: 'Necrons', color: '#00c853', home: 'mephrit', alliance: 'xenos' },
    { id: 'orks', name: 'Orks', color: '#558b2f', home: 'charadon', alliance: 'xenos' },
    { id: 'tyranids', name: 'Tyranids', color: '#8e24aa', home: 'leviathan', alliance: 'xenos' },
    { id: 'genestealer-cults', name: 'Genestealer Cults', color: '#5e35b1', home: 'ichar-iv', alliance: 'xenos' },
    { id: 'tau', name: "T'au Empire", color: '#ef6c00', home: 'tau-empire', alliance: 'xenos' },
    { id: 'aeldari', name: 'Aeldari', color: '#00897b', home: 'craftworld-iyanden', alliance: 'xenos' },
    { id: 'drukhari', name: 'Drukhari', color: '#1b5e5e', home: 'commorragh', alliance: 'xenos' },
    { id: 'votann', name: 'Leagues of Votann', color: '#795548', home: 'kin-holds', alliance: 'xenos' },
  ],
};
