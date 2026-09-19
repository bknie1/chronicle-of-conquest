// Age of Sigmar: the Mortal Realms. Each realm is its own map; realmgates
// join a point on one realm to a point on another, and influence flows
// through them exactly as it does between neighbouring regions.
import { MAPS } from './maps/index.js';

export const MORTAL_REALMS = {
  id: 'mortal-realms',
  name: 'Age of Sigmar',
  maps: ['aqshy', 'ghyran', 'ghur', 'shyish', 'chamon', 'ulgu', 'hysh', 'azyr', 'eightpoints', 'blight-city'].map(id => MAPS[id]),
  // Every home can never fall.
  factions: [
    // Order
    { id: 'stormcast', name: 'Stormcast Eternals', color: '#f2c230', home: 'azyrheim' },
    { id: 'cities', name: 'Cities of Sigmar', color: '#2f5bd8', home: 'hammerhal-aqsha' },
    { id: 'fyreslayers', name: 'Fyreslayers', color: '#e8671c', home: 'vostargi-mont' },
    { id: 'sylvaneth', name: 'Sylvaneth', color: '#4f7942', home: 'athelwyrd' },
    { id: 'kharadron', name: 'Kharadron Overlords', color: '#b87333', home: 'barak-nar' },
    { id: 'daughters', name: 'Daughters of Khaine', color: '#c4102a', home: 'hagg-nar' },
    { id: 'lumineth', name: 'Lumineth Realm-lords', color: '#a7d8f5', home: 'xintil' },
    { id: 'idoneth', name: 'Idoneth Deepkin', color: '#1f6f8b', home: 'morladron' },
    { id: 'seraphon', name: 'Seraphon', color: '#00b894', home: 'azyrite-watch' },
    // Chaos
    { id: 'slaves', name: 'Slaves to Darkness', color: '#4a4a4a', home: 'varanspire' },
    { id: 'khorne', name: 'Blades of Khorne', color: '#7a0a0a', home: 'khuls-ravage' },
    { id: 'tzeentch', name: 'Disciples of Tzeentch', color: '#0288d1', home: 'spiral-crux' },
    { id: 'slaanesh', name: 'Hedonites of Slaanesh', color: '#d81b60', home: 'uhl-gysh' },
    { id: 'nurgle', name: 'Maggotkin of Nurgle', color: '#827717', home: 'rotwater-blight' },
    { id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'blight-city' },
    { id: 'helsmiths', name: 'Helsmiths of Hashut', color: '#9e3d22', home: 'anvil-of-hashut' },
    // Death
    { id: 'soulblight', name: 'Soulblight Gravelords', color: '#8a2ed0', home: 'nagashizzar' },
    { id: 'nighthaunt', name: 'Nighthaunt', color: '#8fe3cf', home: 'stygxx' },
    { id: 'ossiarch', name: 'Ossiarch Bonereapers', color: '#d9d2c3', home: 'gothizzar' },
    { id: 'flesh-eaters', name: 'Flesh-eater Courts', color: '#7b5e57', home: 'morgaunt' },
    // Destruction
    { id: 'orruks', name: 'Orruk Warclans', color: '#9acd32', home: 'thondia' },
    { id: 'gloomspite', name: 'Gloomspite Gitz', color: '#5c6bc0', home: 'gallet' },
    { id: 'ogors', name: 'Ogor Mawtribes', color: '#c98d5a', home: 'maw-of-ghur' },
    { id: 'behemat', name: 'Sons of Behemat', color: '#bcaaa4', home: 'krondskol' },
  ],
  // [point, point, name]. A gate joins two points on different realms.
  gates: [
    ['hammerhal-aqsha', 'hammerhal-ghyra', 'The Stormrift Realmgate'],
    ['brimstone-peninsula', 'gates-of-azyr', 'The Whispering Gate'],
    ['gates-of-azyr', 'excelsis', 'Gate of Azyr'],
    ['gates-of-azyr', 'glymmsforge', 'Gate of Azyr'],
    ['syar', 'misthavn', 'The Twilight Gate'],
    ['argentine', 'floating-city', 'Skyport Route'],
    // The Arcways out of the Eightpoints. Azyr's, the Meteoric Gate, is sealed.
    ['arcway-fire', 'khuls-ravage', 'The Brimfire Gate'],
    ['arcway-life', 'jadewound', 'The Genesis Gate'],
    ['arcway-beasts', 'maw-of-ghur', 'The Mawgate'],
    ['arcway-death', 'shyish-nadir', 'The Endgate'],
    ['arcway-metal', 'molten-vale', 'The Mercurial Gate'],
    ['arcway-shadow', 'ashen-veil', 'The Penumbral Gate'],
    ['arcway-light', 'mirrorlight-peaks', 'The Arcway of Hysh'],
    // Gnawholes: where Blight City breaks into the realms.
    ['skryre-forges', 'the-gnaw', 'Gnawhole'],
    ['pestilens-pits', 'rotwater-blight', 'Gnawhole'],
    ['moulder-fleshpits', 'amber-steppes', 'Gnawhole'],
    ['eshin-shadows', 'umbral-reach', 'Gnawhole'],
  ],
};
