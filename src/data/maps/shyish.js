// Shyish: the Prime Innerlands, from the published plate of the same name —
// the Realm of Death's heartland as Games Workshop actually draws it, not a
// generated coastline. Every point below was read off the shipped image at
// 1:1 with a coordinate ruler laid over it, so a name sits where its label
// or its icon sits and nothing has been fitted, scaled or estimated.
//
// Spellings are the plate's own. A handful of labels are drawn too small for
// the plate's resolution to resolve and are omitted rather than guessed at;
// a few more are the best reading the paper allows. The realm's two most
// famous places, Nagashizzar and the Shyish Nadir, are not drawn here at all
// — the plate only points south to them with an arrow — so they sit on that
// arrow at the southern margin.
export default {
  "id": "shyish",
  "name": "Shyish",
  "title": "The Prime Innerlands",
  "image": "/maps/realms/shyish.jpg",
  "width": 2600, "height": 1919,
  "maxEdge": 250, "reach": 90,
  "nodes": [
    // --- The realm and the plate itself ------------------------------------
    {"id": "shyish", "name": "Shyish", "kind": "region", "region": "The Prime Innerlands", "x": 1520, "y": 880},
    {"id": "prime-innerlands", "name": "The Prime Innerlands", "kind": "region", "region": "The Prime Innerlands", "x": 1448, "y": 690},

    // --- Athanasia and the western ocean -----------------------------------
    {"id": "athanasia", "name": "Athanasia", "kind": "region", "region": "Athanasia", "x": 420, "y": 470},
    {"id": "ocean-of-mergheists", "name": "Ocean of Mergheists", "kind": "region", "region": "Athanasia", "x": 170, "y": 560},
    {"id": "haters-choice", "name": "Hater’s Choice", "kind": "settlement", "region": "Athanasia", "x": 281, "y": 352},
    {"id": "indignity", "name": "Indignity", "kind": "settlement", "region": "Athanasia", "x": 544, "y": 422},
    {"id": "dinx", "name": "Dinx", "kind": "settlement", "region": "Athanasia", "x": 441, "y": 545},
    {"id": "dhrath", "name": "Dhrath", "kind": "settlement", "region": "Athanasia", "x": 629, "y": 267},
    {"id": "port-karakathos", "name": "Port Karakathos", "kind": "port", "region": "Stygxx", "x": 664, "y": 519},

    // --- Thystia and the Amethyst Princedoms -------------------------------
    {"id": "thystia", "name": "Thystia", "kind": "region", "region": "Thystia", "x": 1120, "y": 215},
    {"id": "fort-vast", "name": "Fort Vast", "kind": "fortress", "region": "Thystia", "x": 917, "y": 190},
    {"id": "the-light", "name": "The Light", "kind": "settlement", "region": "Thystia", "x": 901, "y": 310},
    {"id": "pioners-rebellion", "name": "Pioner’s Rebellion", "kind": "site", "region": "Thystia", "x": 1000, "y": 271},
    {"id": "amethyst-princedoms", "name": "The Amethyst Princedoms", "kind": "region", "region": "The Amethyst Princedoms", "x": 1197, "y": 278},
    {"id": "hopeline", "name": "Hopeline", "kind": "region", "region": "Thystia", "x": 1040, "y": 310},
    {"id": "thanators-manse", "name": "Thanator’s Manse", "kind": "castle", "region": "The Amethyst Princedoms", "x": 1152, "y": 362},
    {"id": "haggrath-plight", "name": "Haggrath Plight", "kind": "settlement", "region": "The Amethyst Princedoms", "x": 1056, "y": 494},
    {"id": "castle-drachmor", "name": "Castle Drachmor", "kind": "castle", "region": "The Amethyst Princedoms", "x": 1154, "y": 474},
    {"id": "dead-mans-folly", "name": "Dead Man’s Folly", "kind": "region", "region": "The Amethyst Princedoms", "x": 1205, "y": 448},
    {"id": "brackenmarsh", "name": "Brackenmarsh", "kind": "settlement", "region": "The Amethyst Princedoms", "x": 1106, "y": 619},

    // --- Stygxx ------------------------------------------------------------
    {"id": "stygxx", "name": "Stygxx", "kind": "region", "region": "Stygxx", "x": 845, "y": 620},
    {"id": "goodwoad-sprawl", "name": "Goodwoad Sprawl", "kind": "wilds", "region": "Stygxx", "x": 760, "y": 355},
    {"id": "ghastmoor", "name": "Ghastmoor", "kind": "wilds", "region": "Stygxx", "x": 770, "y": 460},
    {"id": "gate-of-whispers", "name": "Gate of Whispers", "kind": "site", "region": "Stygxx", "x": 921, "y": 451},
    {"id": "hookfort", "name": "Hookfort", "kind": "fortress", "region": "Stygxx", "x": 804, "y": 489},
    {"id": "peric-mine", "name": "Peric Mine", "kind": "mine", "region": "Stygxx", "x": 904, "y": 515},
    {"id": "grotskull-mines", "name": "Grotskull Mines", "kind": "mine", "region": "Stygxx", "x": 820, "y": 585},
    {"id": "sadmoor", "name": "The Sadmoor", "kind": "region", "region": "Stygxx", "x": 700, "y": 600},

    // --- The northern coast and the Charnel Court --------------------------
    {"id": "martyrs-rivers", "name": "Martyr’s Rivers", "kind": "region", "region": "Charnel Court", "x": 1330, "y": 190},
    {"id": "helles-conquest", "name": "Helle’s Conquest", "kind": "settlement", "region": "Charnel Court", "x": 1577, "y": 159},
    {"id": "cutters-forest", "name": "Cutter’s Forest", "kind": "wilds", "region": "Charnel Court", "x": 1445, "y": 275},
    {"id": "charnel-court", "name": "Charnel Court", "kind": "region", "region": "Charnel Court", "x": 1470, "y": 540},
    {"id": "wheelers-rest", "name": "Wheeler’s Rest", "kind": "settlement", "region": "Charnel Court", "x": 1340, "y": 585},
    {"id": "betrayers-barrow", "name": "Betrayer’s Barrow", "kind": "ruin", "region": "Charnel Court", "x": 1450, "y": 575},
    {"id": "honours-end", "name": "Honour’s End", "kind": "settlement", "region": "Charnel Court", "x": 1546, "y": 489},
    {"id": "citadel-of-bloody-bones", "name": "Citadel of Bloody Bones", "kind": "fortress", "region": "Charnel Court", "x": 1566, "y": 532},
    {"id": "hateful-gorge", "name": "Hateful Gorge", "kind": "region", "region": "Charnel Court", "x": 1610, "y": 618},
    {"id": "morgaunt", "name": "Morgaunt", "kind": "stronghold", "region": "Charnel Court", "x": 1370, "y": 440},
    {"id": "sea-of-best-hauls", "name": "Sea of Best Hauls", "kind": "region", "region": "Charnel Court", "x": 1660, "y": 400},
    {"id": "haishan", "name": "Haishan", "kind": "region", "region": "Hallost", "x": 1720, "y": 230},
    {"id": "fleet", "name": "Fleet", "kind": "port", "region": "Hallost", "x": 1929, "y": 202},
    {"id": "warmsodi-uplands", "name": "Warmsodi Uplands", "kind": "region", "region": "Hallost", "x": 1862, "y": 372},
    {"id": "booming-seam", "name": "Booming Seam", "kind": "region", "region": "Hallost", "x": 1918, "y": 440},
    {"id": "homestead", "name": "Homestead", "kind": "settlement", "region": "Hallost", "x": 1772, "y": 490},

    // --- Hallost and the eastern shore -------------------------------------
    {"id": "plains-of-fleshland-flood", "name": "Plains of Fleshland Flood", "kind": "region", "region": "Hallost", "x": 1912, "y": 558},
    {"id": "hellbreach", "name": "Hellbreach", "kind": "site", "region": "Hallost", "x": 2017, "y": 415},
    {"id": "vaudenheim", "name": "Vaudenheim", "kind": "settlement", "region": "Hallost", "x": 2232, "y": 520},
    {"id": "hallost", "name": "Hallost", "kind": "region", "region": "Hallost", "x": 2140, "y": 600},
    {"id": "hollowmourne", "name": "Hollowmourne", "kind": "stronghold", "region": "Hallost", "x": 2100, "y": 480},
    {"id": "coast-of-rest", "name": "Coast of Rest", "kind": "region", "region": "Hallost", "x": 2340, "y": 458},
    {"id": "morstend", "name": "Morstend", "kind": "settlement", "region": "Hallost", "x": 2405, "y": 578},
    {"id": "sendport", "name": "Sendport", "kind": "port", "region": "Hallost", "x": 2413, "y": 612},
    {"id": "maghoar-mountains", "name": "Maghoar Mountains", "kind": "region", "region": "Hallost", "x": 2000, "y": 720},
    {"id": "valgur-fjords", "name": "Valgur Fjords", "kind": "region", "region": "Hallost", "x": 2250, "y": 672},

    // --- The Sea of Drowned Sorrows ----------------------------------------
    {"id": "sea-of-drowned-sorrows", "name": "Sea of Drowned Sorrows", "kind": "region", "region": "Athanasia", "x": 600, "y": 940},
    {"id": "zharr-vyxa", "name": "Zharr Vyxa", "kind": "ruin", "region": "Athanasia", "x": 527, "y": 781},
    {"id": "madbastion", "name": "Madbastion", "kind": "fortress", "region": "Athanasia", "x": 370, "y": 848},
    {"id": "hellspoint", "name": "Hellspoint", "kind": "settlement", "region": "Athanasia", "x": 434, "y": 920},
    {"id": "drefurs-folly", "name": "Drefur’s Folly", "kind": "ruin", "region": "Athanasia", "x": 431, "y": 996},
    {"id": "halopate", "name": "Halopate", "kind": "settlement", "region": "Athanasia", "x": 332, "y": 1019},
    {"id": "ghoststake", "name": "Ghoststake", "kind": "region", "region": "Athanasia", "x": 490, "y": 1100},
    {"id": "kraniad-isle", "name": "Kraniad Isle", "kind": "region", "region": "Athanasia", "x": 300, "y": 1132},
    {"id": "piotrs-steers", "name": "Piotr’s Steers", "kind": "region", "region": "Athanasia", "x": 368, "y": 1190},
    {"id": "the-teeth", "name": "The Teeth", "kind": "region", "region": "Athanasia", "x": 495, "y": 1240},
    {"id": "scattered-isles", "name": "Scattered Isles", "kind": "region", "region": "Stygxx", "x": 698, "y": 697},

    // --- Dolorum, the Dwindlesea and Neferatia -----------------------------
    {"id": "urrung-lodgelands", "name": "Urrung Lodgelands", "kind": "stronghold", "region": "Dolorum", "x": 815, "y": 677},
    {"id": "lethis", "name": "Lethis", "kind": "city", "region": "Dolorum", "x": 1024, "y": 656},
    {"id": "haldrann-karr", "name": "Haldrann Karr", "kind": "region", "region": "Dolorum", "x": 1207, "y": 678},
    {"id": "bleakmarsh", "name": "Bleakmarsh", "kind": "region", "region": "Dolorum", "x": 1033, "y": 775},
    {"id": "luxuria", "name": "Luxuria", "kind": "settlement", "region": "Dolorum", "x": 776, "y": 885},
    {"id": "dwindlesea", "name": "Dwindlesea", "kind": "region", "region": "Dolorum", "x": 1120, "y": 870},
    {"id": "the-sea-maw", "name": "The Sea Maw", "kind": "site", "region": "Dolorum", "x": 1220, "y": 935},
    {"id": "dolorum", "name": "Dolorum", "kind": "region", "region": "Dolorum", "x": 870, "y": 1020},
    {"id": "the-chained-lake", "name": "The Chained Lake", "kind": "region", "region": "Dolorum", "x": 795, "y": 1030},
    {"id": "nulahmia", "name": "Nulahmia", "kind": "city", "region": "Dolorum", "x": 780, "y": 1135},
    {"id": "killers-reign", "name": "Killer’s Reign", "kind": "site", "region": "Dolorum", "x": 675, "y": 1196},
    {"id": "sylontum", "name": "Sylontum", "kind": "city", "region": "Dolorum", "x": 914, "y": 1172},
    {"id": "von-carsteins-treachery", "name": "Von Carstein’s Treachery", "kind": "site", "region": "Neferatia", "x": 669, "y": 1285},
    {"id": "neferatia", "name": "Neferatia", "kind": "region", "region": "Neferatia", "x": 790, "y": 1390},
    {"id": "screaming-wastes", "name": "Screaming Wastes", "kind": "region", "region": "Neferatia", "x": 908, "y": 1330},

    // --- Carstinia and the southern tides ----------------------------------
    {"id": "wraithfjords", "name": "Wraithfjords", "kind": "region", "region": "Carstinia", "x": 440, "y": 1330},
    {"id": "sternieste", "name": "Sternieste", "kind": "castle", "region": "Carstinia", "x": 411, "y": 1499},
    {"id": "carstinia", "name": "Carstinia", "kind": "region", "region": "Carstinia", "x": 470, "y": 1620},
    {"id": "desert-peaks", "name": "Desert Peaks", "kind": "region", "region": "Carstinia", "x": 625, "y": 1710},
    {"id": "the-racing-blades", "name": "The Racing Blades", "kind": "region", "region": "Neferatia", "x": 665, "y": 1425},
    {"id": "isle-of-last-sighs", "name": "Isle of Last Sighs", "kind": "region", "region": "Neferatia", "x": 1055, "y": 1418},
    {"id": "draining-tides", "name": "Draining Tides", "kind": "region", "region": "Neferatia", "x": 1165, "y": 1400},
    {"id": "the-slaves", "name": "The Slaves", "kind": "region", "region": "Neferatia", "x": 980, "y": 1550},
    {"id": "necrotic-peaks", "name": "Necrotic Peaks", "kind": "region", "region": "Neferatia", "x": 810, "y": 1640},
    {"id": "abandoned-isles", "name": "Abandoned Isles", "kind": "region", "region": "Neferatia", "x": 908, "y": 1645},
    {"id": "drumi", "name": "Drumi", "kind": "region", "region": "Neferatia", "x": 1058, "y": 1617},
    {"id": "the-gullet", "name": "The Gullet", "kind": "region", "region": "Neferatia", "x": 1150, "y": 1712},
    {"id": "nagashizzar", "name": "Nagashizzar", "kind": "stronghold", "region": "The Prime Innerlands", "x": 1085, "y": 1735},
    {"id": "shyish-nadir", "name": "The Shyish Nadir", "kind": "site", "region": "The Prime Innerlands", "x": 1185, "y": 1745},

    // --- Penultima ----------------------------------------------------------
    {"id": "the-graven-oast", "name": "The Graven Oast", "kind": "site", "region": "Penultima", "x": 1382, "y": 720},
    {"id": "guttering-marsh", "name": "Guttering Marsh", "kind": "region", "region": "Penultima", "x": 1468, "y": 812},
    {"id": "assassins-rest", "name": "Assassin’s Rest", "kind": "settlement", "region": "Penultima", "x": 1695, "y": 890},
    {"id": "embalmers-boulevard", "name": "Embalmer’s Boulevard", "kind": "region", "region": "Penultima", "x": 1893, "y": 740},
    {"id": "necropolis-of-cartoch", "name": "Necropolis of Cartoch", "kind": "ruin", "region": "Penultima", "x": 1908, "y": 817},
    {"id": "barrow-harvest", "name": "Barrow Harvest", "kind": "region", "region": "Penultima", "x": 1900, "y": 903},
    {"id": "sea-of-fading-hope", "name": "Sea of Fading Hope", "kind": "region", "region": "Penultima", "x": 1700, "y": 1120},
    {"id": "piersons-ghost", "name": "Pierson’s Ghost", "kind": "settlement", "region": "Penultima", "x": 1839, "y": 1071},
    {"id": "nyaizar", "name": "Nyaizar", "kind": "settlement", "region": "Penultima", "x": 1850, "y": 1112},
    {"id": "the-wailing-wind", "name": "The Wailing Wind", "kind": "region", "region": "Penultima", "x": 1415, "y": 1085},
    {"id": "desert-of-bones", "name": "Desert of Bones", "kind": "region", "region": "Penultima", "x": 1432, "y": 1170},
    {"id": "abyssal-fires", "name": "Abyssal Fires", "kind": "region", "region": "Penultima", "x": 1573, "y": 1130},
    {"id": "penultima", "name": "Penultima", "kind": "region", "region": "Penultima", "x": 1600, "y": 1300},
    {"id": "ruins-of-shadespire", "name": "Ruins of Shadespire", "kind": "ruin", "region": "Penultima", "x": 1466, "y": 1230},
    {"id": "battle-of-headless-corpses", "name": "Battle of Headless Corpses", "kind": "site", "region": "Penultima", "x": 1665, "y": 1248},
    {"id": "skelt", "name": "Skelt", "kind": "settlement", "region": "Penultima", "x": 1875, "y": 1245},
    {"id": "lockandkey-isle", "name": "Lockandkey Isle", "kind": "region", "region": "Penultima", "x": 1370, "y": 1345},
    {"id": "the-bankers", "name": "The Bankers", "kind": "region", "region": "Penultima", "x": 1445, "y": 1450},
    {"id": "wagonfolks-gulf", "name": "Wagonfolk’s Gulf", "kind": "region", "region": "Penultima", "x": 1680, "y": 1325},
    {"id": "shyish-hook", "name": "Shyish Hook", "kind": "region", "region": "Penultima", "x": 1335, "y": 1480},
    {"id": "hangmans-wood", "name": "Hangman’s Wood", "kind": "wilds", "region": "Penultima", "x": 1470, "y": 1532},
    {"id": "mute-island", "name": "Mute Island", "kind": "region", "region": "Penultima", "x": 1650, "y": 1495},
    {"id": "rapid-rush", "name": "Rapid Rush", "kind": "region", "region": "Penultima", "x": 1707, "y": 1480},
    {"id": "mordhaven", "name": "Mordhaven", "kind": "settlement", "region": "Penultima", "x": 1795, "y": 1448},
    {"id": "moss-spike", "name": "Moss Spike", "kind": "region", "region": "Penultima", "x": 1773, "y": 1575},
    {"id": "battle-of-the-dustsprawl", "name": "Battle of the Dustsprawl", "kind": "site", "region": "Ossia", "x": 1320, "y": 1592},
    {"id": "noll-island", "name": "Noll Island", "kind": "region", "region": "Ossia", "x": 1585, "y": 1618},
    {"id": "thrice-cursed-islands", "name": "Thrice-Cursed Islands", "kind": "region", "region": "Ossia", "x": 1745, "y": 1655},

    // --- Ossia and Gothizzar ------------------------------------------------
    {"id": "ossia", "name": "Ossia", "kind": "region", "region": "Ossia", "x": 1355, "y": 1680},
    {"id": "land-of-living-bone", "name": "Land of Living Bone", "kind": "region", "region": "Ossia", "x": 1452, "y": 1720},
    {"id": "gristlegore", "name": "Gristlegore", "kind": "camp", "region": "Ossia", "x": 1560, "y": 1730},
    {"id": "bottleneck-coast", "name": "Bottleneck Coast", "kind": "region", "region": "Ossia", "x": 1930, "y": 1605},
    {"id": "endgate", "name": "Endgate", "kind": "site", "region": "Ossia", "x": 1925, "y": 1738},
    {"id": "gothizzar", "name": "Gothizzar", "kind": "city", "region": "Ossia", "x": 1871, "y": 1758},

    // --- Nihilus Reach, Lyria and Necros -----------------------------------
    {"id": "nihilus-reach", "name": "Nihilus Reach", "kind": "region", "region": "Lyria", "x": 2150, "y": 830},
    {"id": "myrmid", "name": "Myrmid", "kind": "ruin", "region": "Lyria", "x": 2084, "y": 904},
    {"id": "isle-of-the-dread-gate", "name": "Isle of the Dread Gate", "kind": "region", "region": "Lyria", "x": 2045, "y": 955},
    {"id": "satyrxs-run", "name": "Satyrx’s Run", "kind": "region", "region": "Lyria", "x": 2252, "y": 942},
    {"id": "chora", "name": "Chora", "kind": "settlement", "region": "Lyria", "x": 2205, "y": 945},
    {"id": "cripplecoast", "name": "Cripplecoast", "kind": "region", "region": "Lyria", "x": 2350, "y": 810},
    {"id": "lyria", "name": "Lyria", "kind": "region", "region": "Lyria", "x": 2320, "y": 880},
    {"id": "glymmsforge", "name": "Glymmsforge", "kind": "city", "region": "Lyria", "x": 2368, "y": 948},
    {"id": "the-end", "name": "The End", "kind": "city", "region": "Lyria", "x": 2392, "y": 894},
    {"id": "incinum", "name": "Incinum", "kind": "ruin", "region": "Lyria", "x": 2382, "y": 1029},
    {"id": "incistus", "name": "Incistus", "kind": "ruin", "region": "Lyria", "x": 2399, "y": 1070},
    {"id": "blisterskin", "name": "Blisterskin", "kind": "camp", "region": "Lyria", "x": 2300, "y": 1040},
    {"id": "the-black-nihil", "name": "The Black Nihil", "kind": "region", "region": "Necros", "x": 2178, "y": 1287},
    {"id": "necrarch-coast", "name": "Necrarch Coast", "kind": "region", "region": "Necros", "x": 2245, "y": 1350},
    {"id": "harmon", "name": "Harmon", "kind": "ruin", "region": "Necros", "x": 1991, "y": 1375},
    {"id": "cordiaza", "name": "Cordiaza", "kind": "ruin", "region": "Necros", "x": 2062, "y": 1508},
    {"id": "quintuss-spine", "name": "Quintus’s Spine", "kind": "region", "region": "Necros", "x": 2045, "y": 1590},
    {"id": "necros", "name": "Necros", "kind": "region", "region": "Necros", "x": 2030, "y": 1700},
    {"id": "ort", "name": "Ort", "kind": "region", "region": "Necros", "x": 2203, "y": 1607},
    {"id": "cadavaria", "name": "Cadavaria", "kind": "region", "region": "Necros", "x": 2170, "y": 1757}
  ],
  "extraLinks": [],
  "blockedLinks": []
};
