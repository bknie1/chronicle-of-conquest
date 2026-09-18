// The Old World map definition. Coordinates are in the image's own pixels
// (2000 x 1987). A map editor will replace hand-typed coordinates later.
export const OLD_WORLD = {
  id: 'old-world',
  name: 'The Old World',
  image: '/maps/old-world.jpg',
  width: 2000,
  height: 1987,
  maxEdge: 380, // points further apart than this are not neighbours (seas, mountains)
  reach: 150,   // how far a region's colour bleeds out from its point
  // Each faction's home can never be lost.
  factions: [
    { id: 'empire', name: 'The Empire', color: '#f2c230', home: 'altdorf' },
    { id: 'bretonnia', name: 'Bretonnia', color: '#2f5bd8', home: 'couronne' },
    { id: 'dwarfs', name: 'Dwarfen Mountain Holds', color: '#d0621c', home: 'karaz-a-karak' },
    { id: 'orcs', name: 'Orc & Goblin Tribes', color: '#3f9e3a', home: 'black-crag' },
    { id: 'vampires', name: 'Vampire Counts', color: '#8a2ed0', home: 'drakenhof' },
    { id: 'wood-elves', name: 'Wood Elf Realms', color: '#12a595', home: 'athel-loren' },
    { id: 'kislev', name: 'Kislev', color: '#49c3ef', home: 'kislev' },
    { id: 'chaos', name: 'Warriors of Chaos', color: '#c4102a', home: 'chaos-wastes' },
  ],
  nodes: [
    // The Empire
    { id: 'altdorf', name: 'Altdorf', region: 'Reikland', x: 870, y: 1080 },
    { id: 'middenheim', name: 'Middenheim', region: 'Middenland', x: 930, y: 970 },
    { id: 'nordland', name: 'Nordland', region: 'The Empire', x: 940, y: 776 },
    { id: 'marienburg', name: 'Marienburg', region: 'The Wasteland', x: 770, y: 900 },
    { id: 'ostland', name: 'Ostland', region: 'The Empire', x: 1130, y: 756 },
    { id: 'hochland', name: 'Hochland', region: 'The Empire', x: 1040, y: 850 },
    { id: 'talabheim', name: 'Talabheim', region: 'Talabecland', x: 1150, y: 940 },
    { id: 'ostermark', name: 'Ostermark', region: 'The Empire', x: 1330, y: 940 },
    { id: 'stirland', name: 'Stirland', region: 'The Empire', x: 1200, y: 1080 },
    { id: 'nuln', name: 'Nuln', region: 'Wissenland', x: 1040, y: 1180 },
    { id: 'averheim', name: 'Averheim', region: 'Averland', x: 1220, y: 1200 },
    { id: 'wissenland', name: 'Wissenland', region: 'The Empire', x: 1120, y: 1280 },
    { id: 'moot', name: 'The Moot', region: 'Mootland', x: 1310, y: 1160 },
    { id: 'drakenhof', name: 'Drakenhof', region: 'Sylvania', x: 1330, y: 1040 },
    // Kislev
    { id: 'kislev', name: 'Kislev', region: 'Kislev', x: 1400, y: 730 },
    { id: 'erengrad', name: 'Erengrad', region: 'Kislev', x: 1150, y: 570 },
    { id: 'praag', name: 'Praag', region: 'Kislev', x: 1460, y: 590 },
    { id: 'troll-country', name: 'Troll Country', region: 'Kislev', x: 1400, y: 340 },
    // Norsca
    { id: 'norsca-west', name: 'Bjornling Coast', region: 'Norsca', x: 460, y: 480 },
    { id: 'norsca-heart', name: 'Norscan Heartland', region: 'Norsca', x: 800, y: 340 },
    { id: 'norsca-east', name: 'Norscan Frontier', region: 'Norsca', x: 1200, y: 240 },
    // Chaos Wastes
    { id: 'chaos-wastes', name: 'The Chaos Wastes', region: 'Northern Wastes', x: 1860, y: 160 },
    { id: 'kurgan-steppe', name: 'Kurgan Steppe', region: 'Northern Wastes', x: 1760, y: 320 },
    { id: 'zorn-uzkul', name: 'Zorn Uzkul', region: 'Northern Wastes', x: 1910, y: 600 },
    // World's Edge Mountains
    { id: 'karak-kadrin', name: 'Karak Kadrin', region: "World's Edge Mountains", x: 1560, y: 970 },
    { id: 'karaz-a-karak', name: 'Karaz-a-Karak', region: "World's Edge Mountains", x: 1570, y: 1220 },
    { id: 'black-fire-pass', name: 'Black Fire Pass', region: "World's Edge Mountains", x: 1400, y: 1320 },
    { id: 'eight-peaks', name: 'Karak Eight Peaks', region: "World's Edge Mountains", x: 1600, y: 1690 },
    // Dark Lands
    { id: 'dark-lands', name: 'The Dark Lands', region: 'Dark Lands', x: 1920, y: 940 },
    { id: 'blasted-wastes', name: 'The Blasted Wastes', region: 'Dark Lands', x: 1920, y: 1120 },
    // Badlands & Border Princes
    { id: 'black-crag', name: 'Black Crag', region: 'Badlands', x: 1520, y: 1585 },
    { id: 'badlands', name: 'The Badlands', region: 'Badlands', x: 1220, y: 1580 },
    { id: 'blood-river', name: 'Blood River Valley', region: 'Badlands', x: 1380, y: 1520 },
    { id: 'marshes', name: 'Marshes of Madness', region: 'Badlands', x: 1230, y: 1900 },
    { id: 'azgorh', name: 'Desolation of Azgorh', region: 'Dark Lands', x: 1930, y: 1600 },
    { id: 'border-princes', name: 'Border Princes', region: 'Border Princes', x: 1120, y: 1440 },
    // Bretonnia
    { id: 'couronne', name: 'Couronne', region: 'Bretonnia', x: 600, y: 880 },
    { id: 'languille', name: "L'Anguille", region: 'Bretonnia', x: 510, y: 940 },
    { id: 'lyonesse', name: 'Lyonesse', region: 'Bretonnia', x: 410, y: 1010 },
    { id: 'gisoreux', name: 'Gisoreux', region: 'Bretonnia', x: 580, y: 1000 },
    { id: 'montfort', name: 'Montfort', region: 'Bretonnia', x: 770, y: 1040 },
    { id: 'bastonne', name: 'Bastonne', region: 'Bretonnia', x: 630, y: 1090 },
    { id: 'bordeleaux', name: 'Bordeleaux', region: 'Bretonnia', x: 540, y: 1170 },
    { id: 'aquitaine', name: 'Aquitaine', region: 'Bretonnia', x: 580, y: 1250 },
    { id: 'quenelles', name: 'Quenelles', region: 'Bretonnia', x: 730, y: 1250 },
    { id: 'brionne', name: 'Brionne', region: 'Bretonnia', x: 600, y: 1310 },
    { id: 'carcassonne', name: 'Carcassonne', region: 'Bretonnia', x: 750, y: 1410 },
    { id: 'parravon', name: 'Parravon', region: 'Bretonnia', x: 840, y: 1170 },
    { id: 'athel-loren', name: 'Athel Loren', region: 'The Forest of Loren', x: 900, y: 1300 },
    // Estalia
    { id: 'bilbali', name: 'Bilbali', region: 'Estalia', x: 380, y: 1380 },
    { id: 'magritta', name: 'Magritta', region: 'Estalia', x: 390, y: 1540 },
    { id: 'tobaro', name: 'Tobaro', region: 'Tilea', x: 630, y: 1620 },
    // Tilea
    { id: 'miragliano', name: 'Miragliano', region: 'Tilea', x: 770, y: 1525 },
    { id: 'trantio', name: 'Trantio', region: 'Tilea', x: 810, y: 1585 },
    { id: 'remas', name: 'Remas', region: 'Tilea', x: 780, y: 1665 },
    { id: 'luccini', name: 'Luccini', region: 'Tilea', x: 750, y: 1810 },
    { id: 'sartosa', name: 'Sartosa', region: 'Tilea', x: 700, y: 1910 },
  ],
};
