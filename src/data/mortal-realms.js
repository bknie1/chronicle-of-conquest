// Age of Sigmar: the Mortal Realms. Each realm is its own map; realmgates
// join a point on one realm to a point on another, and influence flows
// through them exactly as it does between neighbouring regions.
import { MAPS } from './maps/index.js';

export const MORTAL_REALMS = {
  id: 'mortal-realms',
  name: 'Age of Sigmar',
  maps: ['aqshy', 'ghyran', 'ghur', 'shyish', 'chamon', 'ulgu', 'hysh', 'azyr', 'eightpoints', 'blight-city'].map(id => MAPS[id]),
  // Simplest mode: four Grand Alliances, one stronghold each.
  alliances: [
    { id: 'aos-order', name: 'Order', color: '#2f5bd8', home: 'azyrheim' },
    { id: 'aos-chaos', name: 'Chaos', color: '#c4102a', home: 'varanspire' },
    { id: 'aos-death', name: 'Death', color: '#8a2ed0', home: 'nagashizzar' },
    { id: 'aos-destruction', name: 'Destruction', color: '#9acd32', home: 'thondia' },
  ],
  // Every home can never fall.
  factions: [
    // Order
    { id: 'stormcast', name: 'Stormcast Eternals', color: '#f2c230', home: 'azyrheim', alliance: 'aos-order' },
    { id: 'cities', name: 'Cities of Sigmar', color: '#2f5bd8', home: 'hammerhal-aqsha', alliance: 'aos-order' },
    { id: 'fyreslayers', name: 'Fyreslayers', color: '#e8671c', home: 'vostargi-mont', alliance: 'aos-order' },
    { id: 'sylvaneth', name: 'Sylvaneth', color: '#4f7942', home: 'athelwyrd', alliance: 'aos-order' },
    { id: 'kharadron', name: 'Kharadron Overlords', color: '#b87333', home: 'barak-nar', alliance: 'aos-order' },
    { id: 'daughters', name: 'Daughters of Khaine', color: '#c4102a', home: 'hagg-nar', alliance: 'aos-order' },
    { id: 'lumineth', name: 'Lumineth Realm-lords', color: '#a7d8f5', home: 'xintil', alliance: 'aos-order' },
    { id: 'idoneth', name: 'Idoneth Deepkin', color: '#1f6f8b', home: 'morladron', alliance: 'aos-order' },
    { id: 'seraphon', name: 'Seraphon', color: '#00b894', home: 'azyrite-watch', alliance: 'aos-order' },
    // Chaos
    { id: 'slaves', name: 'Slaves to Darkness', color: '#4a4a4a', home: 'varanspire', alliance: 'aos-chaos' },
    { id: 'khorne', name: 'Blades of Khorne', color: '#7a0a0a', home: 'khuls-ravage', alliance: 'aos-chaos' },
    { id: 'tzeentch', name: 'Disciples of Tzeentch', color: '#0288d1', home: 'spiral-crux', alliance: 'aos-chaos' },
    { id: 'slaanesh', name: 'Hedonites of Slaanesh', color: '#d81b60', home: 'uhl-gysh', alliance: 'aos-chaos' },
    { id: 'nurgle', name: 'Maggotkin of Nurgle', color: '#827717', home: 'rotwater-blight', alliance: 'aos-chaos' },
    { id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'blight-city', alliance: 'aos-chaos' },
    { id: 'helsmiths', name: 'Helsmiths of Hashut', color: '#9e3d22', home: 'anvil-of-hashut', alliance: 'aos-chaos' },
    // Death
    { id: 'soulblight', name: 'Soulblight Gravelords', color: '#8a2ed0', home: 'nagashizzar', alliance: 'aos-death' },
    { id: 'nighthaunt', name: 'Nighthaunt', color: '#8fe3cf', home: 'stygxx', alliance: 'aos-death' },
    { id: 'ossiarch', name: 'Ossiarch Bonereapers', color: '#d9d2c3', home: 'gothizzar', alliance: 'aos-death' },
    { id: 'flesh-eaters', name: 'Flesh-eater Courts', color: '#7b5e57', home: 'morgaunt', alliance: 'aos-death' },
    // Destruction
    { id: 'orruks', name: 'Orruk Warclans', color: '#9acd32', home: 'thondia', alliance: 'aos-destruction' },
    { id: 'gloomspite', name: 'Gloomspite Gitz', color: '#5c6bc0', home: 'gallet', alliance: 'aos-destruction' },
    { id: 'ogors', name: 'Ogor Mawtribes', color: '#c98d5a', home: 'maw-of-ghur', alliance: 'aos-destruction' },
    { id: 'behemat', name: 'Sons of Behemat', color: '#bcaaa4', home: 'krondskol', alliance: 'aos-destruction' },
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
