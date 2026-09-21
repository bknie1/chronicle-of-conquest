// The Horus Heresy: one galaxy map, each Legion holding its homeworld.
import { MAPS } from './maps/index.js';

export const HORUS_HERESY = {
  id: 'horus-heresy',
  name: 'Horus Heresy',
  maps: [MAPS['heresy-galaxy'], MAPS['terra']],
  // Terra is drawn twice: as the throneworld on the galaxy map, and as its own
  // surface. Coming down from orbit puts you at the Palace under construction.
  gates: [
    ['terra', 'terra-the-imperial-palace', 'Planetfall'],
  ],
  // Simplest mode: which side of the Heresy you're on.
  // Loyalist or Traitor is the choice that matters most here.
  overview: { name: 'The whole galaxy' },
  defaultLevel: 'alliance',
  alliances: [
    { id: 'hh-loyalist', name: 'Loyalists', color: '#0d47a1', home: 'terra' },
    { id: 'hh-traitor', name: 'Traitors', color: '#8e0000', home: 'isstvan' },
  ],
  // Every home can never fall. Subfactions are starting grounds, not seats:
  // real theatres each Legion actually fought in, away from its homeworld.
  factions: [
    // Traitor Legions
    { id: 'sons-of-horus', name: 'Sons of Horus', color: '#00897b', home: 'isstvan', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-sons-of-horus-cthonia', name: 'Sons of Horus — Cthonia, the Old Homeworld', color: '#00897b', home: 'cthonia' },
        { id: 'hh-sons-of-horus-beta-garmon', name: 'Sons of Horus — the Beta-Garmon War', color: '#00897b', home: 'beta-garmon' },
        { id: 'hh-sons-of-horus-terra', name: "Sons of Horus — the Warmaster's Assault on Terra", color: '#00897b', home: 'terra' },
      ] },
    { id: 'world-eaters', name: 'World Eaters', color: '#1e88e5', home: 'bodt', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-world-eaters-isstvan', name: 'World Eaters — the Isstvan Atrocities', color: '#1e88e5', home: 'isstvan' },
        { id: 'hh-world-eaters-terra', name: "World Eaters — Angron's Terra Campaign", color: '#1e88e5', home: 'terra' },
      ] },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'chemos', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-emperors-children-laeran', name: "Emperor's Children — the Laer Temple", color: '#ec407a', home: 'laeran' },
        { id: 'hh-emperors-children-isstvan', name: "Emperor's Children — the Isstvan Betrayal", color: '#ec407a', home: 'isstvan' },
      ] },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'barbarus', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-death-guard-davin', name: 'Death Guard — the Davin Corruption', color: '#9e9d24', home: 'davin' },
        { id: 'hh-death-guard-isstvan', name: 'Death Guard — the Isstvan Atrocities', color: '#9e9d24', home: 'isstvan' },
      ] },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#8e0000', home: 'prospero', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-thousand-sons-nikaea', name: 'Thousand Sons — the Council of Nikaea', color: '#8e0000', home: 'nikaea' },
        { id: 'hh-thousand-sons-terra', name: 'Thousand Sons — the Siege of Terra', color: '#8e0000', home: 'terra' },
      ] },
    { id: 'night-lords', name: 'Night Lords', color: '#1a237e', home: 'nostramo', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-night-lords-isstvan', name: 'Night Lords — the Isstvan Reserve', color: '#1a237e', home: 'isstvan' },
        { id: 'hh-night-lords-eastern-fringe', name: 'Night Lords — the Thramas Crusade', color: '#1a237e', home: 'eastern-fringe' },
      ] },
    { id: 'iron-warriors', name: 'Iron Warriors', color: '#bdb76b', home: 'olympia', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-iron-warriors-tallarn', name: 'Iron Warriors — the Battle of Tallarn', color: '#bdb76b', home: 'tallarn' },
        { id: 'hh-iron-warriors-beta-garmon', name: 'Iron Warriors — the Beta-Garmon War', color: '#bdb76b', home: 'beta-garmon' },
        { id: 'hh-iron-warriors-isstvan', name: 'Iron Warriors — the Isstvan Reserve', color: '#bdb76b', home: 'isstvan' },
      ] },
    { id: 'word-bearers', name: 'Word Bearers', color: '#6a1b1b', home: 'colchis', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-word-bearers-calth', name: 'Word Bearers — the Calth Betrayal', color: '#6a1b1b', home: 'calth' },
        { id: 'hh-word-bearers-khur', name: 'Word Bearers — the Fall of Monarchia', color: '#6a1b1b', home: 'khur' },
      ] },
    { id: 'alpha-legion', name: 'Alpha Legion', color: '#26a69a', home: 'desperation', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-alpha-legion-mars', name: 'Alpha Legion — the Battle of Mars', color: '#26a69a', home: 'mars' },
        { id: 'hh-alpha-legion-isstvan', name: 'Alpha Legion — the Isstvan Reserve', color: '#26a69a', home: 'isstvan' },
      ] },
    // Loyalist Legions
    { id: 'dark-angels', name: 'Dark Angels', color: '#2e5e2e', home: 'caliban', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-dark-angels-eastern-fringe', name: 'Dark Angels — the Thramas Crusade', color: '#2e5e2e', home: 'eastern-fringe' },
        { id: 'hh-dark-angels-terra', name: 'Dark Angels — the Late Arrival at Terra', color: '#2e5e2e', home: 'terra' },
      ] },
    { id: 'white-scars', name: 'White Scars', color: '#eceff1', home: 'chogoris', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-white-scars-chondax', name: 'White Scars — the Chondax Campaign', color: '#eceff1', home: 'chondax' },
        { id: 'hh-white-scars-isstvan', name: 'White Scars — the Isstvan Relief', color: '#eceff1', home: 'isstvan' },
        { id: 'hh-white-scars-terra', name: 'White Scars — the Ride to Terra', color: '#eceff1', home: 'terra' },
      ] },
    { id: 'space-wolves', name: 'Space Wolves', color: '#b0bec5', home: 'fenris', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-space-wolves-prospero', name: 'Space Wolves — the Burning of Prospero', color: '#b0bec5', home: 'prospero' },
        { id: 'hh-space-wolves-terra', name: 'Space Wolves — the Road to Terra', color: '#b0bec5', home: 'terra' },
      ] },
    { id: 'imperial-fists', name: 'Imperial Fists', color: '#fdd835', home: 'inwit', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-imperial-fists-terra', name: 'Imperial Fists — the Defence of the Palace', color: '#fdd835', home: 'terra' },
        { id: 'hh-imperial-fists-beta-garmon', name: 'Imperial Fists — the Beta-Garmon War', color: '#fdd835', home: 'beta-garmon' },
      ] },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-blood-angels-signus-prime', name: 'Blood Angels — the Signus Campaign', color: '#e53935', home: 'signus-prime' },
        { id: 'hh-blood-angels-terra', name: "Blood Angels — Sanguinius's Last Stand", color: '#e53935', home: 'terra' },
      ] },
    { id: 'iron-hands', name: 'Iron Hands', color: '#607d8b', home: 'medusa', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-iron-hands-isstvan', name: 'Iron Hands — the Dropsite Massacre', color: '#607d8b', home: 'isstvan' },
        { id: 'hh-iron-hands-beta-garmon', name: "Iron Hands — the Shattered Legions' War", color: '#607d8b', home: 'beta-garmon' },
      ] },
    { id: 'ultramarines', name: 'Ultramarines', color: '#0d47a1', home: 'macragge', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-ultramarines-calth', name: 'Ultramarines — the Calth Betrayal', color: '#0d47a1', home: 'calth' },
        { id: 'hh-ultramarines-khur', name: 'Ultramarines — the Fall of Monarchia', color: '#0d47a1', home: 'khur' },
      ] },
    { id: 'salamanders', name: 'Salamanders', color: '#43a047', home: 'nocturne', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-salamanders-isstvan', name: 'Salamanders — the Dropsite Massacre', color: '#43a047', home: 'isstvan' },
        { id: 'hh-salamanders-macragge', name: "Salamanders — Vulkan's Last Battle", color: '#43a047', home: 'macragge' },
      ] },
    { id: 'raven-guard', name: 'Raven Guard', color: '#212121', home: 'deliverance', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-raven-guard-isstvan', name: 'Raven Guard — the Dropsite Massacre', color: '#212121', home: 'isstvan' },
        { id: 'hh-raven-guard-terra', name: 'Raven Guard — the Flight to Terra', color: '#212121', home: 'terra' },
      ] },
    // The wider war
    { id: 'custodes', name: 'Legio Custodes', color: '#c9a227', home: 'terra', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-custodes-prospero', name: 'Legio Custodes — the Scouring of Prospero', color: '#c9a227', home: 'prospero' },
        { id: 'hh-custodes-khur', name: 'Legio Custodes — the Fall of Monarchia', color: '#c9a227', home: 'khur' },
        { id: 'hh-custodes-mars', name: 'Legio Custodes — the Battle of Mars', color: '#c9a227', home: 'mars' },
      ] },
    { id: 'mechanicum', name: 'Mechanicum', color: '#bf360c', home: 'mars', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-mechanicum-lucius', name: 'Mechanicum — Legio Mortis, the Traitor Forge', color: '#bf360c', home: 'lucius' },
        { id: 'hh-mechanicum-tigrus', name: 'Mechanicum — Legio Fureans', color: '#bf360c', home: 'tigrus' },
      ] },
    { id: 'knights', name: 'Questoris Knights', color: '#ff8f00', home: 'gryphonne', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-knights-lastrati', name: 'Questoris Knights — House Vyronii', color: '#ff8f00', home: 'lastrati' },
        { id: 'hh-knights-sulis', name: 'Questoris Knights — House Makabius', color: '#ff8f00', home: 'sulis' },
        { id: 'hh-knights-anvillus', name: 'Questoris Knights — the Legio Astorum Alliance', color: '#ff8f00', home: 'anvillus' },
      ] },
    { id: 'solar-auxilia', name: 'Solar Auxilia', color: '#8d6e63', home: 'tallarn', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-solar-auxilia-beta-garmon', name: 'Solar Auxilia — the Siege of Beta-Garmon II', color: '#8d6e63', home: 'beta-garmon' },
        { id: 'hh-solar-auxilia-terra', name: 'Solar Auxilia — the Defenders of the Palace', color: '#8d6e63', home: 'terra' },
      ] },
    { id: 'ruinstorm-daemons', name: 'Daemons of the Ruinstorm', color: '#e040fb', home: 'signus-prime', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-ruinstorm-daemons-calth', name: 'Daemons of the Ruinstorm — the Calth Warp Storm', color: '#e040fb', home: 'calth' },
        { id: 'hh-ruinstorm-daemons-terra', name: 'Daemons of the Ruinstorm — the Siege of Terra', color: '#e040fb', home: 'terra' },
        { id: 'hh-ruinstorm-daemons-isstvan', name: 'Daemons of the Ruinstorm — the Isstvan Atrocities', color: '#e040fb', home: 'isstvan' },
      ] },
    // Legionaries who fought against their own Legion's choice. Their wins
    // count for the side they kept faith with, not the Legion they were born to.
    { id: 'shattered-legions', name: 'Shattered Legions', color: '#90a4ae', home: 'cypra-mundi', alliance: 'hh-loyalist',
      subfactions: [
        { id: 'hh-shattered-garro', name: "Shattered Legions — Garro's Oath", color: '#90a4ae', home: 'terra' },
        { id: 'hh-shattered-eisenstein', name: 'Shattered Legions — the Eisenstein Survivors', color: '#90a4ae', home: 'isstvan' },
        { id: 'hh-shattered-world-eaters', name: 'Shattered Legions — the Loyalist World Eaters', color: '#90a4ae', home: 'bodt' },
        { id: 'hh-shattered-beta-garmon', name: 'Shattered Legions — the Avenging Fleet', color: '#90a4ae', home: 'beta-garmon' },
      ] },
    { id: 'blackshields', name: 'Blackshields', color: '#37474f', home: 'the-maelstrom', alliance: 'hh-traitor',
      subfactions: [
        { id: 'hh-blackshields-caliban', name: 'Blackshields — the Fallen of Caliban', color: '#37474f', home: 'caliban' },
        { id: 'hh-blackshields-golgotha', name: 'Blackshields — the Golgothan Warbands', color: '#37474f', home: 'golgothan-wastes' },
        { id: 'hh-blackshields-ghoul-stars', name: 'Blackshields — the Ghoul Stars Renegades', color: '#37474f', home: 'the-ghoul-stars' },
      ] },
  ],
};
