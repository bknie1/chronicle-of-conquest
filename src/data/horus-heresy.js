// The Horus Heresy: one galaxy map, each Legion holding its homeworld.
import { MAPS } from './maps/index.js';

export const HORUS_HERESY = {
  id: 'horus-heresy',
  name: 'Horus Heresy',
  maps: [MAPS['heresy-galaxy']],
  // Simplest mode: which side of the Heresy you're on.
  // Loyalist or Traitor is the choice that matters most here.
  defaultLevel: 'alliance',
  alliances: [
    { id: 'hh-loyalist', name: 'Loyalists', color: '#0d47a1', home: 'terra' },
    { id: 'hh-traitor', name: 'Traitors', color: '#8e0000', home: 'isstvan' },
  ],
  // Every home can never fall.
  factions: [
    // Traitor Legions
    { id: 'sons-of-horus', name: 'Sons of Horus', color: '#00897b', home: 'isstvan', alliance: 'hh-traitor' },
    { id: 'world-eaters', name: 'World Eaters', color: '#1e88e5', home: 'bodt', alliance: 'hh-traitor' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'chemos', alliance: 'hh-traitor' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'barbarus', alliance: 'hh-traitor' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#8e0000', home: 'prospero', alliance: 'hh-traitor' },
    { id: 'night-lords', name: 'Night Lords', color: '#1a237e', home: 'nostramo', alliance: 'hh-traitor' },
    { id: 'iron-warriors', name: 'Iron Warriors', color: '#bdb76b', home: 'olympia', alliance: 'hh-traitor' },
    { id: 'word-bearers', name: 'Word Bearers', color: '#6a1b1b', home: 'colchis', alliance: 'hh-traitor' },
    { id: 'alpha-legion', name: 'Alpha Legion', color: '#26a69a', home: 'desperation', alliance: 'hh-traitor' },
    // Loyalist Legions
    { id: 'dark-angels', name: 'Dark Angels', color: '#2e5e2e', home: 'caliban', alliance: 'hh-loyalist' },
    { id: 'white-scars', name: 'White Scars', color: '#eceff1', home: 'chogoris', alliance: 'hh-loyalist' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#b0bec5', home: 'fenris', alliance: 'hh-loyalist' },
    { id: 'imperial-fists', name: 'Imperial Fists', color: '#fdd835', home: 'inwit', alliance: 'hh-loyalist' },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal', alliance: 'hh-loyalist' },
    { id: 'iron-hands', name: 'Iron Hands', color: '#607d8b', home: 'medusa', alliance: 'hh-loyalist' },
    { id: 'ultramarines', name: 'Ultramarines', color: '#0d47a1', home: 'macragge', alliance: 'hh-loyalist' },
    { id: 'salamanders', name: 'Salamanders', color: '#43a047', home: 'nocturne', alliance: 'hh-loyalist' },
    { id: 'raven-guard', name: 'Raven Guard', color: '#212121', home: 'deliverance', alliance: 'hh-loyalist' },
    // The wider war
    { id: 'custodes', name: 'Legio Custodes', color: '#c9a227', home: 'terra', alliance: 'hh-loyalist' },
    { id: 'mechanicum', name: 'Mechanicum', color: '#bf360c', home: 'mars', alliance: 'hh-traitor' },
    { id: 'knights', name: 'Questoris Knights', color: '#ff8f00', home: 'gryphonne', alliance: 'hh-loyalist' },
    { id: 'solar-auxilia', name: 'Solar Auxilia', color: '#8d6e63', home: 'tallarn', alliance: 'hh-loyalist' },
    { id: 'ruinstorm-daemons', name: 'Daemons of the Ruinstorm', color: '#e040fb', home: 'signus-prime', alliance: 'hh-traitor' },
  ],
};
