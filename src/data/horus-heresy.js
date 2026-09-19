// The Horus Heresy: one galaxy map, each Legion holding its homeworld.
import { MAPS } from './maps/index.js';

export const HORUS_HERESY = {
  id: 'horus-heresy',
  name: 'Horus Heresy',
  maps: [MAPS['heresy-galaxy']],
  // Every home can never fall.
  factions: [
    // Traitor Legions
    { id: 'sons-of-horus', name: 'Sons of Horus', color: '#00897b', home: 'isstvan' },
    { id: 'world-eaters', name: 'World Eaters', color: '#1e88e5', home: 'bodt' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'chemos' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'barbarus' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#8e0000', home: 'prospero' },
    { id: 'night-lords', name: 'Night Lords', color: '#1a237e', home: 'nostramo' },
    { id: 'iron-warriors', name: 'Iron Warriors', color: '#bdb76b', home: 'olympia' },
    { id: 'word-bearers', name: 'Word Bearers', color: '#6a1b1b', home: 'colchis' },
    { id: 'alpha-legion', name: 'Alpha Legion', color: '#26a69a', home: 'desperation' },
    // Loyalist Legions
    { id: 'dark-angels', name: 'Dark Angels', color: '#2e5e2e', home: 'caliban' },
    { id: 'white-scars', name: 'White Scars', color: '#eceff1', home: 'chogoris' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#b0bec5', home: 'fenris' },
    { id: 'imperial-fists', name: 'Imperial Fists', color: '#fdd835', home: 'inwit' },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal' },
    { id: 'iron-hands', name: 'Iron Hands', color: '#607d8b', home: 'medusa' },
    { id: 'ultramarines', name: 'Ultramarines', color: '#0d47a1', home: 'macragge' },
    { id: 'salamanders', name: 'Salamanders', color: '#43a047', home: 'nocturne' },
    { id: 'raven-guard', name: 'Raven Guard', color: '#212121', home: 'deliverance' },
    // The wider war
    { id: 'custodes', name: 'Legio Custodes', color: '#c9a227', home: 'terra' },
    { id: 'mechanicum', name: 'Mechanicum', color: '#bf360c', home: 'mars' },
    { id: 'knights', name: 'Questoris Knights', color: '#ff8f00', home: 'gryphonne' },
    { id: 'solar-auxilia', name: 'Solar Auxilia', color: '#8d6e63', home: 'tallarn' },
    { id: 'ruinstorm-daemons', name: 'Daemons of the Ruinstorm', color: '#e040fb', home: 'signus-prime' },
  ],
};
