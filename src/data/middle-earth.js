// Middle-earth: the Third Age of Games Workshop's Middle-earth Strategy Battle
// Game, drawn from Tolkien's own The Lord of the Rings and The Hobbit and from
// GW's army lists for the game. One map, one war: the Free Peoples against the
// forces of Sauron. See src/data/settings.js for what alliances, factions and
// subfactions mean.
import { MAPS } from './maps/index.js';

export const MIDDLE_EARTH = {
  id: 'middle-earth',
  name: 'Middle-earth',
  maps: [MAPS['middle-earth']],
  // Simplest mode: which side of the War of the Ring you're on.
  defaultLevel: 'alliance',
  alliances: [
    { id: 'me-good', name: 'The Free Peoples', color: '#2e7d32', home: 'minas-tirith' },
    { id: 'me-evil', name: 'The Forces of Sauron', color: '#7f0000', home: 'barad-dur' },
  ],
  factions: [
    // The Free Peoples
    { id: 'rohan', name: 'Rohan', color: '#c9a227', home: 'edoras', alliance: 'me-good',
      subfactions: [
        { id: 'me-rohan-westfold', name: 'Rohan — the Westfold', color: '#c9a227', home: 'helms-deep' },
        { id: 'me-rohan-eastfold', name: 'Rohan — the Eastfold', color: '#c9a227', home: 'aldburg' },
      ] },
    { id: 'gondor', name: 'Gondor', color: '#37474f', home: 'minas-tirith', alliance: 'me-good',
      subfactions: [
        { id: 'me-gondor-dol-amroth', name: 'Gondor — the Fief of Dol Amroth', color: '#37474f', home: 'dol-amroth' },
        { id: 'me-gondor-lossarnach', name: 'Gondor — the Fief of Lossarnach', color: '#37474f', home: 'lossarnach' },
        { id: 'me-gondor-lebennin', name: 'Gondor — the Fief of Lebennin', color: '#37474f', home: 'lebennin' },
      ] },
    { id: 'rangers-north', name: 'The Fellowship & Rangers of the North', color: '#6d4c41', home: 'bree', alliance: 'me-good' },
    { id: 'shire', name: 'The Shire', color: '#8bc34a', home: 'hobbiton', alliance: 'me-good',
      subfactions: [
        { id: 'me-shire-north', name: 'The Shire — Northfarthing', color: '#8bc34a', home: 'northfarthing' },
        { id: 'me-shire-south', name: 'The Shire — Southfarthing', color: '#8bc34a', home: 'southfarthing' },
        { id: 'me-shire-east', name: 'The Shire — Eastfarthing', color: '#8bc34a', home: 'eastfarthing' },
        { id: 'me-shire-west', name: 'The Shire — Westfarthing', color: '#8bc34a', home: 'michel-delving' },
      ] },
    { id: 'rivendell', name: 'Rivendell', color: '#1565c0', home: 'rivendell', alliance: 'me-good' },
    { id: 'lothlorien', name: 'Lothlórien', color: '#d4af37', home: 'caras-galadhon', alliance: 'me-good' },
    { id: 'woodland-realm', name: 'The Woodland Realm', color: '#2e7d32', home: 'woodland-realm', alliance: 'me-good' },
    { id: 'durins-folk', name: "Durin's Folk of Erebor", color: '#1a237e', home: 'erebor', alliance: 'me-good' },
    { id: 'iron-hills', name: 'The Iron Hills', color: '#ef6c00', home: 'iron-hills', alliance: 'me-good' },
    { id: 'dale-laketown', name: 'Dale & Lake-town', color: '#fdd835', home: 'dale', alliance: 'me-good' },
    { id: 'fangorn-ents', name: "Fangorn's Ents", color: '#33691e', home: 'fangorn', alliance: 'me-good' },
    { id: 'army-of-the-dead', name: 'The Army of the Dead', color: '#78909c', home: 'paths-of-the-dead', alliance: 'me-good' },
    { id: 'arnor-numenor', name: 'Arnor & Númenor', color: '#0d47a1', home: 'annuminas', alliance: 'me-good' },

    // The forces of Sauron
    { id: 'mordor', name: 'Mordor', color: '#212121', home: 'black-gate', alliance: 'me-evil',
      subfactions: [
        { id: 'me-mordor-cirith-ungol', name: 'Mordor — the Tower of Cirith Ungol', color: '#212121', home: 'cirith-ungol' },
        { id: 'me-mordor-gorgoroth', name: 'Mordor — the Plateau of Gorgoroth', color: '#212121', home: 'gorgoroth' },
      ] },
    { id: 'barad-dur', name: 'Barad-dûr', color: '#b71c1c', home: 'barad-dur', alliance: 'me-evil' },
    { id: 'isengard', name: 'Isengard', color: '#607d8b', home: 'isengard', alliance: 'me-evil' },
    { id: 'moria-goblins', name: "Moria's Goblins", color: '#4e342e', home: 'moria-west-gate', alliance: 'me-evil' },
    { id: 'angmar', name: 'Angmar', color: '#512da8', home: 'carn-dum', alliance: 'me-evil' },
    { id: 'easterlings', name: 'The Easterlings of Rhûn', color: '#bf360c', home: 'rhun-steppes', alliance: 'me-evil' },
    { id: 'haradrim', name: 'The Haradrim', color: '#f9a825', home: 'near-harad', alliance: 'me-evil' },
    { id: 'corsairs-umbar', name: 'The Corsairs of Umbar', color: '#263238', home: 'umbar', alliance: 'me-evil' },
    { id: 'dark-powers-wargs', name: 'The Dark Powers & Wargs', color: '#3e2723', home: 'ettenmoors', alliance: 'me-evil' },
    { id: 'trolls', name: 'The Trolls', color: '#795548', home: 'trollshaws', alliance: 'me-evil' },
    { id: 'dol-guldur', name: 'Dol Guldur', color: '#4a148c', home: 'dol-guldur', alliance: 'me-evil' },
    { id: 'nazgul', name: 'The Nazgûl', color: '#37003c', home: 'minas-morgul', alliance: 'me-evil' },
  ],
};
