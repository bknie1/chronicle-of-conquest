// The Horus Heresy: one galaxy map, each Legion holding its homeworld.
import { MAPS } from './maps/index.js';

export const HORUS_HERESY = {
  id: 'horus-heresy',
  name: 'Horus Heresy',
  maps: [MAPS['heresy-galaxy']],
  // Every home can never fall.
  factions: [
    { id: 'sons-of-horus', name: 'Sons of Horus', color: '#00897b', home: 'isstvan' },
    { id: 'world-eaters', name: 'World Eaters', color: '#1e88e5', home: 'bodt' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'chemos' },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'barbarus' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#c62828', home: 'prospero' },
    { id: 'night-lords', name: 'Night Lords', color: '#4a148c', home: 'nostramo' },
    { id: 'space-wolves', name: 'Space Wolves', color: '#90a4ae', home: 'fenris' },
    { id: 'salamanders', name: 'Salamanders', color: '#43a047', home: 'nocturne' },
    { id: 'dark-angels', name: 'Dark Angels', color: '#2e5e2e', home: 'caliban' },
    { id: 'imperial-fists', name: 'Imperial Fists', color: '#fdd835', home: 'terra' },
    { id: 'ultramarines', name: 'Ultramarines', color: '#0d47a1', home: 'macragge' },
    { id: 'mechanicum', name: 'Mechanicum', color: '#8d2b0b', home: 'mars' },
    { id: 'knights', name: 'Questoris Knights', color: '#ff8f00', home: 'gryphonne' },
  ],
};
