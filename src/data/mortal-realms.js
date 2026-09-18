// Age of Sigmar: the Mortal Realms. Each realm is its own map; realmgates
// join a point on one realm to a point on another, and influence flows
// through them exactly as it does between neighbouring regions.
import { MAPS } from './maps/index.js';

export const MORTAL_REALMS = {
  id: 'mortal-realms',
  name: 'Age of Sigmar',
  maps: ['aqshy', 'ghyran', 'ghur', 'shyish', 'chamon', 'ulgu', 'hysh', 'azyr', 'eightpoints'].map(id => MAPS[id]),
  // Every home can never fall.
  factions: [
    { id: 'stormcast', name: 'Stormcast Eternals', color: '#f2c230', home: 'azyrheim' },
    { id: 'cities', name: 'Cities of Sigmar', color: '#2f5bd8', home: 'hammerhal-aqsha' },
    { id: 'fyreslayers', name: 'Fyreslayers', color: '#e8671c', home: 'vostargi-mont' },
    { id: 'sylvaneth', name: 'Sylvaneth', color: '#16a085', home: 'athelwyrd' },
    { id: 'orruks', name: 'Orruk Warclans', color: '#7cc22a', home: 'thondia' },
    { id: 'soulblight', name: 'Soulblight Gravelords', color: '#8a2ed0', home: 'nagashizzar' },
    { id: 'kharadron', name: 'Kharadron Overlords', color: '#49c3ef', home: 'barak-nar' },
    { id: 'daughters', name: 'Daughters of Khaine', color: '#c4102a', home: 'hagg-nar' },
    { id: 'lumineth', name: 'Lumineth Realm-lords', color: '#ee5fc7', home: 'xintil' },
    { id: 'slaves', name: 'Slaves to Darkness', color: '#4a4a4a', home: 'varanspire' },
    { id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'blight-city' },
  ],
  // [point, point, name]. A gate joins two points on different realms.
  gates: [
    ['hammerhal-aqsha', 'hammerhal-ghyra', 'The Stormrift Realmgate'],
    ['gates-of-azyr', 'excelsis', 'Gate of Azyr'],
    ['gates-of-azyr', 'glymmsforge', 'Gate of Azyr'],
    ['gates-of-azyr', 'tempests-eye', 'Gate of Azyr'],
    ['syar', 'misthavn', 'The Twilight Gate'],
    ['argentine', 'floating-city', 'Skyport Route'],
    ['arcway-fire', 'khuls-ravage', 'The Arcway of Fire'],
    ['arcway-life', 'jadewound', 'The Arcway of Life'],
    ['arcway-beasts', 'maw-of-ghur', 'The Arcway of Beasts'],
    ['arcway-death', 'shyish-nadir', 'The Arcway of Death'],
    ['arcway-metal', 'molten-vale', 'The Arcway of Metal'],
    ['arcway-shadow', 'ashen-veil', 'The Arcway of Shadow'],
    ['arcway-light', 'mirrorlight-peaks', 'The Arcway of Light'],
  ],
};
