// Warhammer Fantasy: the whole world, not just the Old World. One map, and
// the armies that fight over it. See src/data/settings.js for what alliances,
// factions and subfactions mean.
import { MAPS } from './maps/index.js';

export const WARHAMMER_FANTASY = {
  id: 'warhammer-fantasy',
  name: 'Warhammer Fantasy',
  maps: [MAPS['fantasy-world']],
  // Simplest mode: four sides, one homeland each.
  alliances: [
    { id: 'wf-order', name: 'Order', color: '#2f5bd8', home: 'fw-altdorf' },
    { id: 'wf-destruction', name: 'Destruction', color: '#7cb342', home: 'fw-black-crag' },
    { id: 'wf-chaos', name: 'Chaos', color: '#c4102a', home: 'fw-chaos-wastes-north' },
    { id: 'wf-death', name: 'Death', color: '#8a2ed0', home: 'fw-drakenhof' },
  ],
  factions: [
    {
      id: 'wf-empire', name: 'The Empire', color: '#f2c230', home: 'fw-altdorf', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-reikland', name: 'Reikland', home: 'fw-altdorf' },
        { id: 'wf-middenland', name: 'Middenland', home: 'fw-middenheim' },
        { id: 'wf-talabecland', name: 'Talabecland', home: 'fw-talabheim' },
        { id: 'wf-stirland', name: 'Stirland', home: 'fw-wurtbad' },
      ],
    },
    {
      id: 'wf-bretonnia', name: 'Bretonnia', color: '#2f5bd8', home: 'fw-couronne', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-couronne-dukedom', name: 'Couronne', home: 'fw-couronne' },
        { id: 'wf-bastonne-dukedom', name: 'Bastonne', home: 'fw-bastonne' },
        { id: 'wf-carcassonne-dukedom', name: 'Carcassonne', home: 'fw-carcassonne' },
      ],
    },
    {
      id: 'wf-dwarfs', name: 'Dwarfen Mountain Holds', color: '#b5651d', home: 'fw-karaz-a-karak', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-karaz-a-karak', name: 'Karaz-a-Karak', home: 'fw-karaz-a-karak' },
        { id: 'wf-karak-kadrin', name: 'Karak Kadrin', home: 'fw-karak-kadrin' },
        { id: 'wf-zhufbar', name: 'Zhufbar', home: 'fw-zhufbar' },
      ],
    },
    {
      id: 'wf-high-elves', name: 'High Elves', color: '#5c6bc0', home: 'fw-lothern', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-eataine', name: 'Eataine', home: 'fw-lothern' },
        { id: 'wf-nagarythe', name: 'Nagarythe', home: 'fw-armheim' },
        { id: 'wf-avelorn', name: 'Avelorn', home: 'fw-gaen-vale' },
        { id: 'wf-caledor', name: 'Caledor', home: 'fw-caledor' },
      ],
    },
    { id: 'wf-wood-elves', name: 'Wood Elf Realms', color: '#2e7d32', home: 'fw-athel-loren', alliance: 'wf-order',
      // The glades of Athel Loren, as the Old World knows them.
      subfactions: [
        { id: 'wf-torgovann', name: 'Torgovann', color: '#2e7d32', home: 'fw-torgovann' },
        { id: 'wf-wydrioth', name: 'Wydrioth', color: '#2e7d32', home: 'fw-wydrioth' },
        { id: 'wf-talsyn', name: 'Talsyn', color: '#2e7d32', home: 'fw-talsyn' },
      ] },
    {
      id: 'wf-lizardmen', name: 'Lizardmen', color: '#26a69a', home: 'fw-itza', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-itza-city', name: 'Itza', home: 'fw-itza' },
        { id: 'wf-hexoatl-city', name: 'Hexoatl', home: 'fw-hexoatl' },
        { id: 'wf-tlaxtlan-city', name: 'Tlaxtlan', home: 'fw-tlaxtlan' },
      ],
    },
    { id: 'wf-kislev', name: 'Kislev', color: '#49c3ef', home: 'fw-kislev-city', alliance: 'wf-order',
      // Kislev's cities and the oblasts they watch over.
      subfactions: [
        { id: 'wf-erengrad', name: 'Erengrad', color: '#49c3ef', home: 'fw-erengrad' },
        { id: 'wf-praag', name: 'Praag', color: '#49c3ef', home: 'fw-praag' },
        { id: 'wf-southern-oblast', name: 'The Southern Oblast', color: '#49c3ef', home: 'fw-southern-oblast' },
        { id: 'wf-eastern-oblast', name: 'The Eastern Oblast', color: '#49c3ef', home: 'fw-eastern-oblast' },
      ] },
    {
      id: 'wf-cathay', name: 'Grand Cathay', color: '#1b7a5a', home: 'fw-wei-jin', alliance: 'wf-order',
      subfactions: [
        { id: 'wf-cathay-north', name: 'The Northern Provinces', home: 'fw-nan-gau' },
        { id: 'wf-cathay-west', name: 'The Western Provinces', home: 'fw-shang-yang' },
      ],
    },
    {
      id: 'wf-dark-elves', name: 'Dark Elves', color: '#4a0e6b', home: 'fw-naggarond', alliance: 'wf-chaos',
      subfactions: [
        { id: 'wf-naggarond-city', name: 'Naggarond', home: 'fw-naggarond' },
        { id: 'wf-har-ganeth', name: 'Har Ganeth', home: 'fw-har-ganeth' },
        { id: 'wf-hag-graef', name: 'Hag Graef', home: 'fw-hag-graef' },
      ],
    },
    {
      id: 'wf-skaven', name: 'Skaven', color: '#7a4a24', home: 'fw-skavenblight', alliance: 'wf-chaos',
      subfactions: [
        { id: 'wf-clan-mors', name: 'Clan Mors', home: 'fw-eight-peaks' },
        { id: 'wf-clan-pestilens', name: 'Clan Pestilens', home: 'fw-oyxl' },
        { id: 'wf-clan-eshin', name: 'Clan Eshin', home: 'fw-xing-po' },
      ],
    },
    {
      id: 'wf-vampires', name: 'Vampire Counts', color: '#8a2ed0', home: 'fw-drakenhof', alliance: 'wf-death',
      subfactions: [
        { id: 'wf-von-carstein', name: 'Von Carstein', home: 'fw-drakenhof' },
        { id: 'wf-lahmians', name: 'The Lahmian Sisterhood', home: 'fw-lahmia' },
      ],
    },
    {
      id: 'wf-tomb-kings', name: 'Tomb Kings of Khemri', color: '#b8860b', home: 'fw-khemri', alliance: 'wf-death',
      subfactions: [
        { id: 'wf-khemri-city', name: 'Khemri', home: 'fw-khemri' },
        { id: 'wf-zandri-city', name: 'Zandri', home: 'fw-zandri' },
        { id: 'wf-lybaras', name: 'Court of Lybaras', home: 'fw-lybaras' },
      ],
    },
    { id: 'wf-chaos-warriors', name: 'Warriors of Chaos', color: '#c4102a', home: 'fw-chaos-wastes-north', alliance: 'wf-chaos',
      // The Norscan tribes march under the same banner here as in the Old
      // World: a marauder host begins among its own people, not in the Wastes.
      subfactions: [
        { id: 'wf-bjornlings', name: 'The Bjornlings', color: '#c4102a', home: 'fw-norsca-west' },
        { id: 'wf-skaelings', name: 'The Skaelings', color: '#c4102a', home: 'fw-norsca-heart' },
        { id: 'wf-sarls', name: 'The Sarls', color: '#c4102a', home: 'fw-trollheim-mountains' },
        { id: 'wf-aeslings', name: 'The Aeslings', color: '#c4102a', home: 'fw-norsca-east' },
        { id: 'wf-vargs', name: 'The Vargs', color: '#c4102a', home: 'fw-cold-mires' },
        { id: 'wf-kurgan', name: 'The Kurgan', color: '#c4102a', home: 'fw-shard-lands' },
      ] },
    { id: 'wf-daemons', name: 'Daemons of Chaos', color: '#c2185b', home: 'fw-chaos-wastes-south', alliance: 'wf-chaos',
      // Where the veil is thinnest, an age before the Old World's rifts.
      subfactions: [
        { id: 'wf-bloodfire-falls', name: 'Bloodfire Falls', color: '#c2185b', home: 'fw-bloodfire-falls' },
        { id: 'wf-blood-marshes', name: 'The Blood Marshes', color: '#c2185b', home: 'fw-blood-marshes' },
      ] },
    { id: 'wf-beastmen', name: 'Beastmen Brayherds', color: '#5d4037', home: 'fw-drakwald', alliance: 'wf-chaos',
      // Brayherds keep to the deep forests in either age.
      subfactions: [
        { id: 'wf-arden-herds', name: 'The Arden Herds', color: '#5d4037', home: 'fw-forest-of-arden' },
        { id: 'wf-chalons-herds', name: 'The Chalons Herds', color: '#5d4037', home: 'fw-forest-of-chalons' },
        { id: 'wf-loren-herds', name: 'The Wild Herds', color: '#5d4037', home: 'fw-athel-loren' },
      ] },
    { id: 'wf-chaos-dwarfs', name: 'Chaos Dwarfs', color: '#455a64', home: 'fw-zharr-naggrund', alliance: 'wf-chaos',
      // Zharr's other holdings, as the Old World has them.
      subfactions: [
        { id: 'wf-uzkulak', name: 'Uzkulak', color: '#455a64', home: 'fw-uzkulak' },
        { id: 'wf-zorn-uzkul', name: 'Zorn Uzkul', color: '#455a64', home: 'fw-zorn-uzkul' },
        { id: 'wf-zharrduk', name: 'The Plain of Zharrduk', color: '#455a64', home: 'fw-plain-of-zharrduk' },
      ] },
    { id: 'wf-ogres', name: 'Ogre Kingdoms', color: '#e65100', home: 'fw-mountains-of-mourn', alliance: 'wf-destruction',
      // The Mawtribes' roads and the gnoblar country beneath them.
      subfactions: [
        { id: 'wf-ivory-road', name: 'The Ivory Road', color: '#e65100', home: 'fw-ivory-road' },
        { id: 'wf-gnoblar-country', name: 'Gnoblar Country', color: '#e65100', home: 'fw-gnoblar-country' },
      ] },
    { id: 'wf-orcs', name: 'Orc & Goblin Tribes', color: '#7cb342', home: 'fw-black-crag', alliance: 'wf-destruction',
      // The greenskin holds of the Badlands, as in the Old World.
      subfactions: [
        { id: 'wf-eastern-badlands', name: 'The Eastern Badlands', color: '#7cb342', home: 'fw-eastern-badlands' },
        { id: 'wf-western-badlands', name: 'The Western Badlands', color: '#7cb342', home: 'fw-western-badlands' },
        { id: 'wf-death-pass', name: 'Death Pass', color: '#7cb342', home: 'fw-death-pass' },
      ] },
    { id: 'wf-araby', name: 'Araby', color: '#a1662f', home: 'fw-al-haikk', alliance: 'wf-order',
      // Araby's ports, each its own power.
      subfactions: [
        { id: 'wf-lashiek', name: 'Lashiek', color: '#a1662f', home: 'fw-lashiek' },
        { id: 'wf-copher', name: 'Copher', color: '#a1662f', home: 'fw-copher' },
        { id: 'wf-martek', name: 'Martek', color: '#a1662f', home: 'fw-martek' },
      ] },
  ],
};
