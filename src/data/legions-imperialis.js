// Legions Imperialis: the same Age of Darkness galaxy as the Horus Heresy,
// fought at epic scale. Titan Legions, Knight households and the great war
// engines hold the ground here, so it gets its own factions.
//
// Loyalist and Traitor is the bucket most people care about here, so that is
// the level a campaign starts at. Below it the Astartes split in two — the
// Legiones Astartes holding the Segmentum Solar around Terra, the Legiones
// Hereticus driven out to Isstvan and the worlds beyond.
// See src/data/settings.js for what alliances, factions and subfactions mean.
import { MAPS } from './maps/index.js';

export const LEGIONS_IMPERIALIS = {
  id: 'legions-imperialis',
  name: 'Legions Imperialis',
  maps: [MAPS['heresy-galaxy']],
  alliances: [
    { id: 'li-loyalist', name: 'Loyalists', color: '#0d47a1', home: 'terra' },
    { id: 'li-traitor', name: 'Traitors', color: '#8e0000', home: 'isstvan' },
  ],
  defaultLevel: 'alliance',
  levelNames: { alliance: 'Loyalists & Traitors', codex: 'Army lists' },
  factions: [
    { id: 'li-astartes', name: 'Legiones Astartes', color: '#0d47a1', home: 'terra', alliance: 'li-loyalist',
      subfactions: [
        { id: 'li-ultramarines', name: 'Ultramarines', color: '#0d47a1', home: 'macragge' },
        { id: 'li-imperial-fists', name: 'Imperial Fists', color: '#fdd835', home: 'inwit' },
        { id: 'li-blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal' },
        { id: 'li-iron-hands', name: 'Iron Hands', color: '#607d8b', home: 'medusa' },
        { id: 'li-salamanders', name: 'Salamanders', color: '#43a047', home: 'nocturne' },
        { id: 'li-raven-guard', name: 'Raven Guard', color: '#212121', home: 'deliverance' },
      ] },
    { id: 'li-hereticus', name: 'Legiones Hereticus', color: '#8e0000', home: 'isstvan', alliance: 'li-traitor',
      subfactions: [
        { id: 'li-sons-of-horus', name: 'Sons of Horus', color: '#00897b', home: 'cthonia' },
        { id: 'li-death-guard', name: 'Death Guard', color: '#9e9d24', home: 'barbarus' },
        { id: 'li-emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'chemos' },
        { id: 'li-world-eaters', name: 'World Eaters', color: '#1e88e5', home: 'bodt' },
      ] },
    { id: 'li-titanicus', name: 'Legio Titanicus', color: '#d84315', home: 'ryza', alliance: 'li-loyalist',
      subfactions: [
        { id: 'li-legio-gryphonicus', name: 'Legio Gryphonicus', color: '#fdd835', home: 'gryphonne' },
        { id: 'li-legio-astorum', name: 'Legio Astorum', color: '#1565c0', home: 'anvillus' },
        { id: 'li-legio-tempestus', name: 'Legio Tempestus', color: '#00838f', home: 'stygies' },
        { id: 'li-legio-atarus', name: 'Legio Atarus', color: '#bf360c', home: 'accatran' },
      ] },
    { id: 'li-titanicus-traitoris', name: 'Titanicus Traitoris', color: '#546e7a', home: 'lucius', alliance: 'li-traitor',
      subfactions: [
        { id: 'li-legio-mortis', name: 'Legio Mortis', color: '#546e7a', home: 'lucius' },
        { id: 'li-legio-fureans', name: 'Legio Fureans', color: '#6a1b1b', home: 'tigrus' },
      ] },
    { id: 'li-knights', name: 'Questoris Knights', color: '#ff8f00', home: 'sarum', alliance: 'li-loyalist',
      subfactions: [
        { id: 'li-house-vyronii', name: 'House Vyronii', color: '#26a69a', home: 'lastrati' },
        { id: 'li-house-makabius', name: 'House Makabius', color: '#5e35b1', home: 'sulis' },
      ] },
    { id: 'li-knights-traitoris', name: 'Questoris Traitoris', color: '#8d6e63', home: 'goth', alliance: 'li-traitor',
      subfactions: [
        { id: 'li-house-malinax', name: 'House Malinax', color: '#8d6e63', home: 'goth' },
      ] },
    { id: 'li-auxilia', name: 'Solar Auxilia', color: '#8d6e63', home: 'tallarn', alliance: 'li-loyalist' },
    { id: 'li-mechanicum', name: 'Mechanicum Taghmata', color: '#bf360c', home: 'mars', alliance: 'li-traitor' },
    { id: 'li-militia', name: 'Imperialis Militia', color: '#6d7b3a', home: 'necromunda', alliance: 'li-loyalist' },
  ],
};
