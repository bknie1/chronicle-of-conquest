// Age of Sigmar: the Mortal Realms. Each realm is its own map; realmgates
// join a point on one realm to a point on another, and influence flows
// through them exactly as it does between neighbouring regions.
import { MAPS } from './maps/index.js';

export const MORTAL_REALMS = {
  id: 'mortal-realms',
  name: 'Age of Sigmar',
  maps: ['aqshy', 'ghyran', 'ghur', 'shyish', 'chamon', 'ulgu', 'hysh', 'azyr', 'eightpoints', 'blight-city'].map(id => MAPS[id]),
  // Every realm at once, over the cosmology: the eight realms, their moons and
  // orbits, and the Varanspire in the Aetheric Void between them.
  overview: {
    name: 'All realms',
    image: '/maps/realms/mortal-realms.jpg',
    art: [2600, 1811],
    // Each realm sits on its own sigil on the cosmology, read off the plate.
    spots: {
      azyr: [0.532, 0.147], hysh: [0.373, 0.208], ghyran: [0.698, 0.208],
      ulgu: [0.248, 0.388], ghur: [0.820, 0.391], shyish: [0.293, 0.660],
      aqshy: [0.533, 0.739], chamon: [0.770, 0.682],
      eightpoints: [0.533, 0.373], 'blight-city': [0.727, 0.847],
    },
  },
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
    {
      id: 'stormcast', name: 'Stormcast Eternals', color: '#f2c230', home: 'azyrheim', alliance: 'aos-order',
      subfactions: [
        { id: 'stormhost-hammers-of-sigmar', name: 'Hammers of Sigmar', home: 'azyrheim' },
        { id: 'stormhost-hallowed-knights', name: 'Hallowed Knights', home: 'sigmaron' },
        { id: 'stormhost-celestial-vindicators', name: 'Celestial Vindicators', home: 'highheim' },
        { id: 'stormhost-anvils-of-heldenhammer', name: 'Anvils of the Heldenhammer', home: 'sigmarabulum' },
        { id: 'stormhost-knights-excelsior', name: 'Knights Excelsior', home: 'celestial-forges' },
        { id: 'stormhost-tempest-lords', name: 'Tempest Lords', home: 'starhold' },
      ],
    },
    {
      id: 'cities', name: 'Cities of Sigmar', color: '#2f5bd8', home: 'hammerhal-aqsha', alliance: 'aos-order',
      subfactions: [
        { id: 'city-hammerhal', name: 'Hammerhal', home: 'hammerhal-aqsha' },
        { id: 'city-living-city', name: 'Living City', home: 'living-city' },
        { id: 'city-greywater-fastness', name: 'Greywater Fastness', home: 'greywater-fastness' },
        { id: 'city-hallowheart', name: 'Hallowheart', home: 'hallowhart' },
        { id: 'city-anvilgard', name: 'Anvilgard (Har Kuron)', home: 'anvilgard' },
        { id: 'city-tempests-eye', name: "Tempest's Eye", home: 'tempests-eye' },
        { id: 'city-excelsis', name: 'Excelsis', home: 'excelsis' },
      ],
    },
    {
      // The duardin of the realms under one book: the Fyreslayer lodges and the
      // Dispossessed holds both muster as Khazalid Holds, and a player picks
      // which of them to begin among, the way an Orruk picks a warclan.
      id: 'khazalid-holds', name: 'Khazalid Holds', color: '#e8671c', home: 'vostargi-mont', alliance: 'aos-order',
      subfactions: [
        { id: 'lodge-vostarg', name: 'Vostarg Lodge', home: 'vostargi-mont' },
        { id: 'lodge-greyfyrd', name: 'Greyfyrd Lodge', home: 'magmar-fjords' },
        { id: 'lodge-hermdar', name: 'Hermdar Lodge', home: 'steel-spike' },
        { id: 'lodge-lofnir', name: 'Lofnir Lodge', home: 'golvaria' },
        { id: 'hold-glymmsforge', name: 'The Dispossessed of Glymmsforge', home: 'glymmsforge' },
        { id: 'hold-celestial-forges', name: 'The Dispossessed of the Celestial Forges', home: 'celestial-forges' },
        { id: 'hold-hallowheart', name: 'The Dispossessed of Hallowheart', home: 'hallowhart' },
      ],
    },
    {
      id: 'sylvaneth', name: 'Sylvaneth', color: '#4f7942', home: 'athelwyrd', alliance: 'aos-order',
      subfactions: [
        { id: 'glade-oakenbrow', name: 'Oakenbrow', home: 'athelwyrd' },
        { id: 'glade-gnarlroot', name: 'Gnarlroot', home: 'gnarlwood' },
        { id: 'glade-heartwood', name: 'Heartwood', home: 'verdia' },
        { id: 'glade-ironbark', name: 'Ironbark', home: 'everdusk' },
        { id: 'glade-winterleaf', name: 'Winterleaf', home: 'thyria' },
        { id: 'glade-dreadwood', name: 'Dreadwood', home: 'jadewound' },
      ],
    },
    {
      id: 'kharadron', name: 'Kharadron Overlords', color: '#b87333', home: 'barak-nar', alliance: 'aos-order',
      subfactions: [
        { id: 'port-barak-nar', name: 'Barak-Nar', home: 'barak-nar' },
        { id: 'port-barak-zilfin', name: 'Barak-Zilfin', home: 'barak-zilfin' },
        { id: 'port-barak-zon', name: 'Barak-Zon', home: 'barak-zon' },
        { id: 'port-barak-urbaz', name: 'Barak-Urbaz', home: 'barak-urbaz' },
        { id: 'port-barak-thryng', name: 'Barak-Thryng', home: 'barak-thryng' },
        { id: 'port-barak-mhornar', name: 'Barak-Mhornar', home: 'barak-mhornar' },
      ],
    },
    {
      id: 'daughters', name: 'Daughters of Khaine', color: '#c4102a', home: 'hagg-nar', alliance: 'aos-order',
      subfactions: [
        { id: 'temple-hagg-nar', name: 'Hagg Nar', home: 'hagg-nar' },
        { id: 'temple-draichi-ganeth', name: 'Draichi Ganeth', home: 'mirrorshade' },
        { id: 'temple-khailebron', name: 'Khailebron', home: 'dolorous-fens' },
        { id: 'temple-khelt-nar', name: 'Khelt Nar', home: 'caizan' },
      ],
    },
    {
      id: 'lumineth', name: 'Lumineth Realm-lords', color: '#a7d8f5', home: 'xintil', alliance: 'aos-order',
      subfactions: [
        { id: 'nation-ymetrica', name: 'Ymetrica', home: 'ymetrica' },
        { id: 'nation-syar', name: 'Syar', home: 'syar' },
        { id: 'nation-iliatha', name: 'Iliatha', home: 'iliatha' },
        { id: 'nation-zaitrec', name: 'Zaitrec', home: 'zaitrec' },
        { id: 'nation-alumnia', name: 'Alumnia', home: 'alumnia' },
        { id: 'nation-helon', name: 'Helon', home: 'helon' },
      ],
    },
    {
      id: 'idoneth', name: 'Idoneth Deepkin', color: '#1f6f8b', home: 'morladron', alliance: 'aos-order',
      subfactions: [
        { id: 'enclave-ionrach', name: 'Ionrach', home: 'morladron' },
        { id: 'enclave-dhom-hain', name: 'Dhom-Hain', home: 'klarondu' },
        { id: 'enclave-fuethan', name: 'Fuethán', home: 'va-leth' },
        { id: 'enclave-morphann', name: "Mor'phann", home: 'ulguroth' },
        { id: 'enclave-nautilar', name: 'Nautilar', home: 'misthavn' },
      ],
    },
    {
      id: 'seraphon', name: 'Seraphon', color: '#00b894', home: 'azyrite-watch', alliance: 'aos-order',
      subfactions: [
        { id: 'constellation-koatls-claw', name: "Koatl's Claw", home: 'azyrite-watch' },
        { id: 'constellation-thunder-lizard', name: 'Thunder Lizard', home: 'gladitorium' },
        { id: 'constellation-dracothions-tail', name: "Dracothion's Tail", home: 'skydock' },
        { id: 'constellation-fangs-of-sotek', name: 'Fangs of Sotek', home: 'gates-of-azyr' },
      ],
    },
    // Chaos
    {
      id: 'slaves', name: 'Slaves to Darkness', color: '#4a4a4a', home: 'varanspire', alliance: 'aos-chaos',
      subfactions: [
        { id: 'warband-ravagers', name: 'Ravagers', home: 'varanspire' },
        { id: 'warband-cabalists', name: 'Cabalists', home: 'carngrad' },
        { id: 'warband-despoilers', name: 'Despoilers', home: 'flayhaunt' },
        { id: 'warband-idolators', name: 'Idolators', home: 'skarrgrim' },
      ],
    },
    {
      id: 'khorne', name: 'Blades of Khorne', color: '#7a0a0a', home: 'khuls-ravage', alliance: 'aos-chaos',
      subfactions: [
        { id: 'khorne-reapers-of-vengeance', name: 'Reapers of Vengeance', home: 'khuls-ravage' },
        { id: 'khorne-bloodlords', name: 'Bloodlords', home: 'hel-crown' },
        { id: 'khorne-goretide', name: 'Goretide', home: 'mordacious-sound' },
        { id: 'khorne-skullfiend-tribe', name: 'Skullfiend Tribe', home: 'sulphuria' },
      ],
    },
    {
      id: 'tzeentch', name: 'Disciples of Tzeentch', color: '#0288d1', home: 'spiral-crux', alliance: 'aos-chaos',
      subfactions: [
        { id: 'tzeentch-eternal-conflagration', name: 'Eternal Conflagration', home: 'spiral-crux' },
        { id: 'tzeentch-hosts-duplicitous', name: 'Hosts Duplicitous', home: 'prosperis' },
        { id: 'tzeentch-transient-form', name: 'Cult of the Transient Form', home: 'molten-vale' },
      ],
    },
    {
      id: 'slaanesh', name: 'Hedonites of Slaanesh', color: '#d81b60', home: 'uhl-gysh', alliance: 'aos-chaos',
      subfactions: [
        { id: 'slaanesh-invaders', name: 'Invaders', home: 'uhl-gysh' },
        { id: 'slaanesh-pretenders', name: 'Pretenders', home: 'ashen-veil' },
        { id: 'slaanesh-godseekers', name: 'Godseekers', home: 'umbral-reach' },
      ],
    },
    {
      id: 'nurgle', name: 'Maggotkin of Nurgle', color: '#827717', home: 'rotwater-blight', alliance: 'aos-chaos',
      subfactions: [
        { id: 'nurgle-drowned-men', name: 'Drowned Men', home: 'rotwater-blight' },
        { id: 'nurgle-blessed-sons', name: 'Blessed Sons', home: 'phoenicium' },
        { id: 'nurgle-munificent-wanderers', name: 'Munificent Wanderers', home: 'quogmia' },
      ],
    },
    {
      id: 'skaven', name: 'Skaven', color: '#8b5a2b', home: 'blight-city', alliance: 'aos-chaos',
      subfactions: [
        { id: 'clan-skryre', name: 'Skryre', home: 'skryre-forges' },
        { id: 'clan-pestilens', name: 'Pestilens', home: 'pestilens-pits' },
        { id: 'clan-moulder', name: 'Moulder', home: 'moulder-fleshpits' },
        { id: 'clan-eshin', name: 'Eshin', home: 'eshin-shadows' },
        { id: 'clan-verminus', name: 'Verminus', home: 'verminus-barracks' },
        { id: 'clan-masterclan', name: 'Masterclan', home: 'blight-city' },
      ],
    },
    // Helsmiths of Hashut has no well-established sub-factions in the current lore; left undivided.
    { id: 'helsmiths', name: 'Helsmiths of Hashut', color: '#9e3d22', home: 'anvil-of-hashut', alliance: 'aos-chaos' },
    // Death
    {
      id: 'soulblight', name: 'Soulblight Gravelords', color: '#8a2ed0', home: 'nagashizzar', alliance: 'aos-death',
      subfactions: [
        { id: 'dynasty-kastelai', name: 'Kastelai', home: 'nagashizzar' },
        { id: 'dynasty-legion-of-blood', name: 'Legion of Blood', home: 'carstinia' },
        { id: 'dynasty-legion-of-night', name: 'Legion of Night', home: 'sylontum' },
        { id: 'dynasty-vyrkos', name: 'Vyrkos', home: 'sadmoor' },
        { id: 'dynasty-avengorii', name: 'Avengorii', home: 'amethyst-princedoms' },
      ],
    },
    {
      id: 'nighthaunt', name: 'Nighthaunt', color: '#8fe3cf', home: 'stygxx', alliance: 'aos-death',
      subfactions: [
        { id: 'procession-emerald-host', name: 'Emerald Host', home: 'stygxx' },
        { id: 'procession-scarlet-doom', name: 'Scarlet Doom', home: 'ossia' },
        { id: 'procession-grieving-legion', name: 'Grieving Legion', home: 'nulahmia' },
      ],
    },
    {
      id: 'ossiarch', name: 'Ossiarch Bonereapers', color: '#d9d2c3', home: 'gothizzar', alliance: 'aos-death',
      subfactions: [
        { id: 'legion-mortis-praetorians', name: 'Mortis Praetorians', home: 'gothizzar' },
        { id: 'legion-petrifex-elite', name: 'Petrifex Elite', home: 'prime-innerlands' },
        { id: 'legion-null-myriad', name: 'Null Myriad', home: 'shyish-nadir' },
        { id: 'legion-ivory-host', name: 'Ivory Host', home: 'glymmsforge' },
      ],
    },
    {
      id: 'flesh-eaters', name: 'Flesh-eater Courts', color: '#7b5e57', home: 'morgaunt', alliance: 'aos-death',
      subfactions: [
        { id: 'court-morgaunt', name: 'Morgaunt', home: 'morgaunt' },
        { id: 'court-hollowmourne', name: 'Hollowmourne', home: 'hollowmourne' },
        { id: 'court-blisterskin', name: 'Blisterskin', home: 'blisterskin' },
        { id: 'court-gristlegore', name: 'Gristlegore', home: 'gristlegore' },
      ],
    },
    // Destruction
    {
      id: 'orruks', name: 'Orruk Warclans', color: '#9acd32', home: 'thondia', alliance: 'aos-destruction',
      // The army book's own divisions, not individual warclans.
      subfactions: [
        { id: 'orruk-ironjawz', name: 'Ironjawz', color: '#c2a03a', home: 'thondia' },
        { id: 'orruk-kruleboyz', name: 'Kruleboyz', color: '#6b8f3a', home: 'beastgrave' },
        { id: 'orruk-bonesplitterz', name: 'Bonesplitterz', color: '#b5c46a', home: 'amber-steppes' },
        { id: 'orruk-big-waaagh', name: 'Big Waaagh!', color: '#8bbf2a', home: 'crawling-city' },
      ],
    },
    {
      id: 'gloomspite', name: 'Gloomspite Gitz', color: '#5c6bc0', home: 'gallet', alliance: 'aos-destruction',
      subfactions: [
        { id: 'gitz-gloggs-megamob', name: "Glogg's Megamob", home: 'gallet' },
        { id: 'gitz-jaws-of-mork', name: 'Jaws of Mork', home: 'andtor' },
        { id: 'gitz-skulkabomz', name: 'Skulkabomz', home: 'vanderhal' },
      ],
    },
    {
      id: 'ogors', name: 'Ogor Mawtribes', color: '#c98d5a', home: 'maw-of-ghur', alliance: 'aos-destruction',
      subfactions: [
        { id: 'tribe-meatfist', name: 'Meatfist', home: 'maw-of-ghur' },
        { id: 'tribe-bloodgullet', name: 'Bloodgullet', home: 'rondhol' },
        { id: 'tribe-underguts', name: 'Underguts', home: 'izalend' },
        { id: 'tribe-winterbite', name: 'Winterbite', home: 'frostmaw-reach' },
        { id: 'tribe-boulderhead', name: 'Boulderhead', home: 'stonejaw-flats' },
      ],
    },
    {
      id: 'behemat', name: 'Sons of Behemat', color: '#bcaaa4', home: 'krondskol', alliance: 'aos-destruction',
      subfactions: [
        { id: 'behemat-taker-tribe', name: 'Taker Tribe', home: 'krondskol' },
        { id: 'behemat-stomper-tribe', name: 'Stomper Tribe', home: 'gruesome-heights' },
        { id: 'behemat-breaker-tribe', name: 'Breaker Tribe', home: 'colossus-shoal' },
      ],
    },
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
