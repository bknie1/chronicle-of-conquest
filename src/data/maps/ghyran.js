// Ghyran as the published Everspring Swathe plate draws it: the Jade Kingdoms
// of Aquia, Thyria and Verdia, the rotting isthmus north of the Gulf of
// Thorns, and the long southern reach through Yska, Humidia and Quogmia down
// to the Amnios Sea. Every point was read off the shipped 2600x1716 image at
// 1:1 with a coordinate ruler drawn over it, so a name sits where its icon
// sits and not where a shrunk overview guessed it did.
//
// Three names the campaign needs are not drawn on this plate — the Phoenicium,
// the Everdusk and the Gnarlwood. They are kept as points on the most
// defensible ground the cartography allows; see the notes beside them.
export default {
  "id": "ghyran",
  "name": "Ghyran",
  "title": "The Realm of Life",
  "image": "/maps/realms/ghyran.jpg",
  "width": 2600, "height": 1716,
  "maxEdge": 220, "reach": 85,
  "nodes": [
    {"id": "ghyran", "name": "Ghyran", "kind": "region", "region": "Verdia", "x": 1300, "y": 858},

    // --- Aquia, the north-western kingdom ------------------------------------
    {"id": "electria-sea", "name": "Electria Sea", "kind": "region", "region": "Aquia", "x": 140, "y": 375},
    {"id": "creeping-nail", "name": "Creeping Nail", "kind": "region", "region": "Aquia", "x": 378, "y": 268},
    {"id": "the-sog", "name": "The Sog", "kind": "region", "region": "Aquia", "x": 410, "y": 315},
    {"id": "lake-vigour", "name": "Lake Vigour", "kind": "region", "region": "Aquia", "x": 355, "y": 420},
    {"id": "lake-crud", "name": "Lake Crud", "kind": "region", "region": "Aquia", "x": 452, "y": 442},
    {"id": "lake-triad", "name": "Lake Triad", "kind": "region", "region": "Aquia", "x": 300, "y": 578},
    {"id": "jutting-nail", "name": "Jutting Nail", "kind": "region", "region": "Aquia", "x": 118, "y": 635},
    {"id": "shrug-slough", "name": "Shrug Slough", "kind": "region", "region": "Aquia", "x": 430, "y": 640},
    {"id": "aquia", "name": "Aquia", "kind": "region", "region": "Aquia", "x": 150, "y": 745},
    {"id": "mistral-peaks", "name": "Mistral Peaks", "kind": "region", "region": "Aquia", "x": 377, "y": 802},
    {"id": "the-spurn", "name": "The Spurn", "kind": "region", "region": "Aquia", "x": 197, "y": 812},
    {"id": "geet-lake", "name": "Geet Lake", "kind": "region", "region": "Aquia", "x": 107, "y": 845},
    {"id": "hauntcave-coast", "name": "Hauntcave Coast", "kind": "region", "region": "Aquia", "x": 193, "y": 940},

    // --- The Greenglades and the northern water ------------------------------
    {"id": "sea-of-elemental-truths", "name": "Sea of Elemental Truths", "kind": "region", "region": "The Greenglades", "x": 810, "y": 170},
    {"id": "tiara", "name": "Tiara", "kind": "region", "region": "The Greenglades", "x": 670, "y": 365},
    {"id": "slidecrown-isle", "name": "Slidecrown Isle", "kind": "region", "region": "The Greenglades", "x": 640, "y": 450},
    {"id": "heldenhammers-triumph", "name": "Heldenhammer's Triumph", "kind": "site", "region": "The Greenglades", "x": 950, "y": 512},
    {"id": "battle-of-the-white-krakens", "name": "Battle of the White Krakens", "kind": "site", "region": "The Greenglades", "x": 660, "y": 535},
    {"id": "viscus-river", "name": "Viscus River", "kind": "region", "region": "The Greenglades", "x": 815, "y": 525},
    {"id": "kingdom-of-the-greenglades", "name": "Kingdom of the Greenglades", "kind": "city", "region": "The Greenglades", "x": 868, "y": 545},

    // --- Thyria --------------------------------------------------------------
    {"id": "plaguespire", "name": "Plaguespire", "kind": "temple", "region": "Thyria", "x": 537, "y": 620},
    {"id": "slumping-groves", "name": "Slumping Groves", "kind": "wilds", "region": "Thyria", "x": 697, "y": 672},
    {"id": "lake-innis", "name": "Lake Innis", "kind": "region", "region": "Thyria", "x": 700, "y": 727},
    {"id": "lake-reflux", "name": "Lake Reflux", "kind": "region", "region": "Thyria", "x": 530, "y": 745},
    {"id": "silverwyr-gates", "name": "Silverwyr Gates", "kind": "site", "region": "Thyria", "x": 825, "y": 762},
    {"id": "morbidus-warren", "name": "Morbidus Warren (Full)", "kind": "warren", "region": "Thyria", "x": 678, "y": 775},
    {"id": "vindpool", "name": "Vindpool", "kind": "region", "region": "Thyria", "x": 750, "y": 828},
    {"id": "thyria", "name": "Thyria", "kind": "region", "region": "Thyria", "x": 495, "y": 827},
    {"id": "living-city", "name": "The Living City", "kind": "city", "region": "Thyria", "x": 868, "y": 855},
    {"id": "gloet-marsh", "name": "Gloet Marsh", "kind": "region", "region": "Thyria", "x": 674, "y": 866},
    {"id": "extermination-wars", "name": "Extermination Wars", "kind": "site", "region": "Thyria", "x": 922, "y": 907},
    {"id": "sludgemoot", "name": "Sludgemoot", "kind": "town", "region": "Thyria", "x": 701, "y": 913},
    {"id": "the-potence", "name": "The Potence", "kind": "region", "region": "Thyria", "x": 550, "y": 955},
    {"id": "slicston", "name": "Slicston", "kind": "town", "region": "Thyria", "x": 893, "y": 1005},
    {"id": "futilia-wood", "name": "Futilia Wood", "kind": "wilds", "region": "Thyria", "x": 763, "y": 1010},
    {"id": "heartwound-lake", "name": "Heartwound Lake", "kind": "region", "region": "Thyria", "x": 375, "y": 1020},
    {"id": "dearth-coast", "name": "Dearth Coast", "kind": "region", "region": "Thyria", "x": 935, "y": 1032},
    {"id": "kernelstone", "name": "Kernelstone (Ruined)", "kind": "ruin", "region": "Thyria", "x": 672, "y": 1035},

    // --- The Squelchlobe Nations --------------------------------------------
    {"id": "city-of-seven-bells", "name": "City of Seven Bells (Ruined)", "kind": "ruin", "region": "The Squelchlobe Nations", "x": 908, "y": 733},
    {"id": "globos-gulf", "name": "Globos Gulf", "kind": "region", "region": "The Squelchlobe Nations", "x": 975, "y": 795},
    {"id": "chittersquirm-realmgate", "name": "Chittersquirm Realmgate", "kind": "site", "region": "The Squelchlobe Nations", "x": 1095, "y": 805},
    {"id": "squelchlobe-nations", "name": "Squelchlobe Nations", "kind": "region", "region": "The Squelchlobe Nations", "x": 1035, "y": 865},
    {"id": "undergut", "name": "Undergut", "kind": "town", "region": "The Squelchlobe Nations", "x": 1095, "y": 885},
    {"id": "vyras", "name": "Vyras", "kind": "town", "region": "The Squelchlobe Nations", "x": 1062, "y": 903},
    {"id": "bloth", "name": "Bloth", "kind": "town", "region": "The Squelchlobe Nations", "x": 1090, "y": 938},

    // --- The Gulf of Thorns and the drowned north ----------------------------
    {"id": "epiglot-point", "name": "Epiglot Point", "kind": "region", "region": "The Gulf of Thorns", "x": 1105, "y": 252},
    {"id": "coast-of-impossible-odds", "name": "Coast of Impossible Odds", "kind": "region", "region": "The Gulf of Thorns", "x": 1450, "y": 272},
    {"id": "scorpion-tip", "name": "Scorpion Tip", "kind": "region", "region": "The Gulf of Thorns", "x": 1095, "y": 348},
    {"id": "gulf-of-hags", "name": "Gulf of Hags", "kind": "region", "region": "The Gulf of Thorns", "x": 1185, "y": 425},
    {"id": "the-quagmares", "name": "The Quagmares", "kind": "region", "region": "The Gulf of Thorns", "x": 1665, "y": 48},
    {"id": "the-sludge", "name": "The Sludge", "kind": "region", "region": "The Gulf of Thorns", "x": 1905, "y": 20},
    {"id": "gulf-of-thorns", "name": "Gulf of Thorns", "kind": "region", "region": "The Gulf of Thorns", "x": 1708, "y": 206},
    {"id": "hewing-peaks", "name": "Hewing Peaks", "kind": "region", "region": "The Gulf of Thorns", "x": 2010, "y": 315},
    {"id": "the-goblet", "name": "The Goblet", "kind": "region", "region": "The Gulf of Thorns", "x": 1827, "y": 372},

    // --- Verdia --------------------------------------------------------------
    {"id": "new-summercourt", "name": "New Summercourt", "kind": "city", "region": "Verdia", "x": 1424, "y": 395},
    {"id": "verdigris", "name": "Verdigris", "kind": "town", "region": "Verdia", "x": 1645, "y": 400},
    {"id": "slithid-jutt", "name": "Slithid Jutt", "kind": "region", "region": "Verdia", "x": 1765, "y": 415},
    {"id": "the-neck", "name": "The Neck", "kind": "region", "region": "Verdia", "x": 1396, "y": 420},
    {"id": "nailthwaites-crossing", "name": "Nailthwaite's Crossing (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1557, "y": 458},
    {"id": "the-pale-gorge", "name": "The Pale Gorge", "kind": "region", "region": "Verdia", "x": 1163, "y": 466},
    {"id": "verdia", "name": "Verdia", "kind": "region", "region": "Verdia", "x": 1450, "y": 500},
    {"id": "lestermere-realmgate", "name": "Lestermere Realmgate", "kind": "site", "region": "Verdia", "x": 1085, "y": 508},
    {"id": "gate-of-the-seventh-shard", "name": "Gate of the Seventh Shard", "kind": "site", "region": "Verdia", "x": 1230, "y": 515},
    {"id": "titansrest", "name": "Titansrest (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1383, "y": 571},
    {"id": "scabrous-sprawl", "name": "Scabrous Sprawl", "kind": "settlement", "region": "Verdia", "x": 1423, "y": 572},
    {"id": "greywater-fastness", "name": "Greywater Fastness", "kind": "city", "region": "Verdia", "x": 1070, "y": 614},
    {"id": "fort-gardus", "name": "Fort Gardus (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1352, "y": 620},
    {"id": "furtherfield", "name": "Furtherfield (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1506, "y": 637},
    {"id": "nevergreen-peaks", "name": "Nevergreen Peaks", "kind": "region", "region": "Verdia", "x": 1345, "y": 645},
    {"id": "dhoshgar-fyrelodge", "name": "Dhoshgar Fyrelodge", "kind": "forge", "region": "Verdia", "x": 1056, "y": 648},
    {"id": "pickmanspire", "name": "Pickmanspire", "kind": "town", "region": "Verdia", "x": 1428, "y": 658},
    // Not drawn on this plate. The Phoenicium is the third Seed of Hope beside
    // Greywater Fastness and the Living City, raised at the foot of a mountain;
    // it is set here on the southern skirts of the Nevergreen Peaks, in reach
    // of both its sister-seeds and of Hammerhal Ghyra.
    {"id": "phoenicium", "name": "Phoenicium", "kind": "temple", "region": "Verdia", "x": 1290, "y": 700},
    {"id": "river-clot", "name": "River Clot", "kind": "region", "region": "Verdia", "x": 1161, "y": 710},
    {"id": "hammerhal-ghyra", "name": "Hammerhal Ghyra", "kind": "city", "region": "Verdia", "x": 1418, "y": 755},
    {"id": "the-resurgence", "name": "The Resurgence", "kind": "region", "region": "Verdia", "x": 1533, "y": 764},
    {"id": "breakers-lake", "name": "Breaker's Lake", "kind": "region", "region": "Verdia", "x": 1358, "y": 806},
    {"id": "hardwon", "name": "Hardwon (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1165, "y": 832},
    {"id": "boilslick", "name": "Boilslick (Ruined)", "kind": "ruin", "region": "Verdia", "x": 1522, "y": 866},
    {"id": "gates-of-dawn", "name": "Gates of Dawn", "kind": "site", "region": "Verdia", "x": 1395, "y": 891},
    {"id": "tundra-bubonicus", "name": "Tundra Bubonicus", "kind": "region", "region": "Verdia", "x": 1239, "y": 933},
    {"id": "oak-of-ages-past", "name": "The Oak of Ages Past", "kind": "site", "region": "Verdia", "x": 1351, "y": 934},
    {"id": "rotwater-blight", "name": "Rotwater Blight", "kind": "region", "region": "Verdia", "x": 1341, "y": 969},
    {"id": "unquiet-graves", "name": "Unquiet Graves", "kind": "region", "region": "Verdia", "x": 1185, "y": 990},
    {"id": "athelwyrd", "name": "Athelwyrd", "kind": "glade", "region": "Verdia", "x": 1340, "y": 997},

    // --- Erosia --------------------------------------------------------------
    {"id": "elmir-bay", "name": "Elmir Bay", "kind": "region", "region": "Erosia", "x": 1805, "y": 533},
    {"id": "necrotic-edge", "name": "Necrotic Edge", "kind": "region", "region": "Erosia", "x": 1910, "y": 622},
    {"id": "mantis-coast", "name": "Mantis Coast", "kind": "region", "region": "Erosia", "x": 2045, "y": 672},
    {"id": "vineport", "name": "Vineport", "kind": "port", "region": "Erosia", "x": 1775, "y": 694},
    {"id": "supcliffe", "name": "Supcliffe", "kind": "town", "region": "Erosia", "x": 1992, "y": 718},
    {"id": "erosia", "name": "Erosia", "kind": "region", "region": "Erosia", "x": 1875, "y": 728},
    {"id": "battle-of-mosscairn", "name": "Battle of Mosscairn", "kind": "site", "region": "Erosia", "x": 1725, "y": 738},
    {"id": "sap-volcanoes", "name": "Sap Volcanoes", "kind": "region", "region": "Erosia", "x": 1600, "y": 765},
    {"id": "widdershins", "name": "Widdershins (Ruined)", "kind": "ruin", "region": "Erosia", "x": 1928, "y": 784},
    {"id": "colostrum", "name": "Colostrum", "kind": "town", "region": "Erosia", "x": 1918, "y": 883},
    {"id": "gushing-rapids", "name": "Gushing Rapids", "kind": "region", "region": "Erosia", "x": 1725, "y": 950},
    {"id": "lake-serf", "name": "Lake Serf", "kind": "region", "region": "Erosia", "x": 1570, "y": 955},
    {"id": "oakenbrow-seed", "name": "Oakenbrow Seed", "kind": "glade", "region": "Erosia", "x": 1834, "y": 963},

    // --- Invidia -------------------------------------------------------------
    {"id": "etiolated-coast", "name": "Etiolated Coast", "kind": "region", "region": "Invidia", "x": 2247, "y": 157},
    {"id": "sickling-sea", "name": "Sickling Sea", "kind": "region", "region": "Invidia", "x": 2480, "y": 195},
    {"id": "invidia", "name": "Invidia", "kind": "region", "region": "Invidia", "x": 2210, "y": 270},
    {"id": "bleeding-gate", "name": "Bleeding Gate", "kind": "site", "region": "Invidia", "x": 2410, "y": 328},
    {"id": "minuet-rivers", "name": "Minuet Rivers", "kind": "region", "region": "Invidia", "x": 2265, "y": 357},
    {"id": "princes-contention", "name": "Prince's Contention", "kind": "region", "region": "Invidia", "x": 2125, "y": 365},
    {"id": "mannfreds-gambit", "name": "Mannfred's Gambit", "kind": "site", "region": "Invidia", "x": 2430, "y": 400},
    {"id": "claim-of-horticulous", "name": "Claim of Horticulous", "kind": "region", "region": "Invidia", "x": 2320, "y": 407},
    {"id": "the-reality-sores", "name": "The Reality Sores", "kind": "site", "region": "Invidia", "x": 2388, "y": 458},
    {"id": "splitskin-peaks", "name": "Splitskin Peaks", "kind": "region", "region": "Invidia", "x": 2265, "y": 487},
    {"id": "castrominus-sludge", "name": "Castrominus Sludge", "kind": "region", "region": "Invidia", "x": 2505, "y": 505},
    {"id": "toxic-irrigations", "name": "Toxic Irrigations", "kind": "region", "region": "Invidia", "x": 2422, "y": 558},
    {"id": "clotted-choke", "name": "Clotted Choke", "kind": "region", "region": "Invidia", "x": 2075, "y": 565},
    {"id": "gryst", "name": "Gryst", "kind": "region", "region": "Invidia", "x": 2180, "y": 600},
    {"id": "nothingwell", "name": "Nothingwell", "kind": "region", "region": "Invidia", "x": 2364, "y": 624},
    {"id": "greenhaunch-sea", "name": "Greenhaunch Sea", "kind": "region", "region": "Invidia", "x": 2120, "y": 725},
    {"id": "sliming-woad", "name": "Sliming Woad", "kind": "wilds", "region": "Invidia", "x": 2400, "y": 748},
    {"id": "the-vertebrae", "name": "The Vertebrae", "kind": "region", "region": "Invidia", "x": 2272, "y": 772},
    {"id": "grimscale-peaks", "name": "The Grimscale Peaks", "kind": "region", "region": "Invidia", "x": 2520, "y": 810},
    {"id": "hind-sea", "name": "Hind Sea", "kind": "region", "region": "Invidia", "x": 2530, "y": 960},

    // --- Neos and the Jadewound ---------------------------------------------
    {"id": "dirtwoad", "name": "Dirtwoad", "kind": "region", "region": "Neos", "x": 2060, "y": 1065},
    {"id": "jadewound", "name": "The Jadewound", "kind": "wilds", "region": "Neos", "x": 1828, "y": 1097},
    {"id": "neos", "name": "Neos", "kind": "region", "region": "Neos", "x": 1635, "y": 1125},
    // Not drawn on this plate. The Everdusk is a twilight wood of the
    // Sylvaneth; it is set in the unlabelled deep timber between the Oakenbrow
    // Seed and the Jadewound, the only stretch of old forest on the plate that
    // no other name already claims.
    {"id": "everdusk", "name": "Everdusk", "kind": "glade", "region": "Neos", "x": 1880, "y": 1030},
    {"id": "rotwoad", "name": "Rotwoad", "kind": "region", "region": "Neos", "x": 2015, "y": 1195},
    {"id": "congelush-veldt", "name": "Congelush Veldt", "kind": "region", "region": "Neos", "x": 1575, "y": 1205},
    {"id": "lamenter-peaks", "name": "Lamenter Peaks", "kind": "region", "region": "Neos", "x": 1783, "y": 1231},
    {"id": "greencloud-bay", "name": "Greencloud Bay", "kind": "region", "region": "Neos", "x": 1887, "y": 1268},
    {"id": "amber-littoral", "name": "Amber Littoral", "kind": "region", "region": "Neos", "x": 1752, "y": 1302},

    // --- Quogmia -------------------------------------------------------------
    {"id": "dreamloss-realmgate", "name": "Dreamloss Realmgate", "kind": "site", "region": "Quogmia", "x": 1225, "y": 1028},
    {"id": "healers-folly", "name": "Healer's Folly", "kind": "region", "region": "Quogmia", "x": 1465, "y": 1005},
    {"id": "quogmia", "name": "Quogmia", "kind": "region", "region": "Quogmia", "x": 1440, "y": 1055},
    {"id": "spire-glacis", "name": "Spire Glacis", "kind": "town", "region": "Quogmia", "x": 1328, "y": 1057},
    {"id": "blackpyre", "name": "Blackpyre", "kind": "temple", "region": "Quogmia", "x": 1164, "y": 1060},
    {"id": "lake-trog", "name": "Lake Trog", "kind": "region", "region": "Quogmia", "x": 1090, "y": 1135},
    {"id": "the-great-shear", "name": "The Great Shear", "kind": "region", "region": "Quogmia", "x": 1472, "y": 1150},
    {"id": "pested-caves", "name": "Pested Caves", "kind": "warren", "region": "Quogmia", "x": 1343, "y": 1167},
    {"id": "troggoth-isles", "name": "Troggoth Isles", "kind": "region", "region": "Quogmia", "x": 1181, "y": 1177},
    {"id": "ogor-hinterlands", "name": "Ogor Hinterlands", "kind": "wilds", "region": "Quogmia", "x": 1346, "y": 1229},
    {"id": "sea-of-blades", "name": "Sea of Blades", "kind": "region", "region": "Quogmia", "x": 1382, "y": 1267},
    {"id": "thrall-point", "name": "Thrall Point", "kind": "region", "region": "Quogmia", "x": 1495, "y": 1305},
    // Not drawn on this plate. The Gnarlwood is an ancient, ill-tempered
    // forest; it is set in the unnamed old timber west of the Verdural
    // Forests, on the southern Quogmian landmass.
    {"id": "gnarlwood", "name": "Gnarlwood", "kind": "wilds", "region": "Quogmia", "x": 1290, "y": 1395},
    {"id": "verdural-forests", "name": "Verdural Forests", "kind": "wilds", "region": "Quogmia", "x": 1340, "y": 1425},
    {"id": "ochre-cliffs", "name": "Ochre Cliffs", "kind": "region", "region": "Quogmia", "x": 1365, "y": 1490},

    // --- Humidia -------------------------------------------------------------
    {"id": "drug-throat", "name": "Drug Throat", "kind": "region", "region": "Humidia", "x": 1035, "y": 1040},
    {"id": "hernia-promontory", "name": "Hernia Promontory", "kind": "region", "region": "Humidia", "x": 945, "y": 1140},
    {"id": "scab-tongue", "name": "Scab Tongue", "kind": "region", "region": "Humidia", "x": 934, "y": 1208},
    {"id": "shimmerfalls-of-gloriphus", "name": "The Shimmerfalls of Gloriphus", "kind": "site", "region": "Humidia", "x": 1002, "y": 1262},
    {"id": "threadwyrm-river", "name": "Threadwyrm River", "kind": "region", "region": "Humidia", "x": 965, "y": 1300},
    {"id": "humidia", "name": "Humidia", "kind": "region", "region": "Humidia", "x": 1010, "y": 1310},
    {"id": "behemath-gnaw", "name": "Behemath Gnaw", "kind": "region", "region": "Humidia", "x": 945, "y": 1462},

    // --- Yska ----------------------------------------------------------------
    {"id": "hardship", "name": "Hardship (Ruined)", "kind": "ruin", "region": "Yska", "x": 880, "y": 1068},
    {"id": "the-birth-scars", "name": "The Birth Scars", "kind": "region", "region": "Yska", "x": 537, "y": 1072},
    {"id": "ysrian-veldt", "name": "The Ysrian Veldt", "kind": "region", "region": "Yska", "x": 665, "y": 1085},
    {"id": "the-lackslough", "name": "The Lackslough", "kind": "region", "region": "Yska", "x": 760, "y": 1102},
    {"id": "greenhill-massacre", "name": "Greenhill Massacre", "kind": "site", "region": "Yska", "x": 652, "y": 1142},
    {"id": "yska", "name": "Yska", "kind": "region", "region": "Yska", "x": 500, "y": 1180},
    {"id": "the-southern-seas", "name": "The Southern Seas", "kind": "region", "region": "Yska", "x": 812, "y": 1182},
    {"id": "touchwood", "name": "Touchwood", "kind": "town", "region": "Yska", "x": 762, "y": 1198},
    {"id": "chanters-cliffs", "name": "Chanter's Cliffs", "kind": "region", "region": "Yska", "x": 482, "y": 1230},
    {"id": "southerncrust", "name": "Southerncrust", "kind": "town", "region": "Yska", "x": 680, "y": 1237},
    {"id": "tendril-reach", "name": "Tendril Reach", "kind": "region", "region": "Yska", "x": 795, "y": 1318},

    // --- Decrepita and the western isles -------------------------------------
    {"id": "slaughters-haven", "name": "Slaughter's Haven", "kind": "region", "region": "Decrepita", "x": 340, "y": 1150},
    {"id": "naiad-archipelago", "name": "Naiad Archipelago", "kind": "region", "region": "Decrepita", "x": 255, "y": 1185},
    {"id": "decrepita", "name": "Decrepita", "kind": "region", "region": "Decrepita", "x": 35, "y": 1250},
    {"id": "sanctum-isle", "name": "Sanctum Isle", "kind": "region", "region": "Decrepita", "x": 455, "y": 1310},
    {"id": "mortis-isles", "name": "Mortis Isles", "kind": "region", "region": "Decrepita", "x": 40, "y": 1440},
    {"id": "tendril-sea", "name": "Tendril Sea", "kind": "region", "region": "Decrepita", "x": 415, "y": 1445},

    // --- Kurnotheal ----------------------------------------------------------
    {"id": "neodine-canal", "name": "Neodine Canal", "kind": "region", "region": "Kurnotheal", "x": 2204, "y": 1197},
    {"id": "heartwood-coast", "name": "Heartwood Coast", "kind": "region", "region": "Kurnotheal", "x": 2515, "y": 1235},
    {"id": "undying-tract", "name": "Undying Tract", "kind": "wilds", "region": "Kurnotheal", "x": 2441, "y": 1361},
    {"id": "kurnotheal", "name": "Kurnotheal", "kind": "region", "region": "Kurnotheal", "x": 2450, "y": 1430},
    {"id": "lurkers-cove", "name": "Lurker's Cove", "kind": "region", "region": "Kurnotheal", "x": 2314, "y": 1454},

    // --- The Amnios Sea and the southern shore -------------------------------
    {"id": "the-fleeing-siblings", "name": "The Fleeing Siblings", "kind": "region", "region": "The Amnios Sea", "x": 1837, "y": 1386},
    {"id": "ellipsis-isles", "name": "Ellipsis Isles", "kind": "region", "region": "The Amnios Sea", "x": 1650, "y": 1432},
    {"id": "amnios-sea", "name": "Amnios Sea", "kind": "region", "region": "The Amnios Sea", "x": 1620, "y": 1510},
    {"id": "pensids-gamble", "name": "Pensid's Gamble", "kind": "site", "region": "The Southern Shore", "x": 1550, "y": 1667},
    {"id": "ymbolqui-lakes", "name": "Ymbolqui Lakes", "kind": "region", "region": "The Southern Shore", "x": 1214, "y": 1670},
    {"id": "wintercoast", "name": "Wintercoast", "kind": "region", "region": "The Southern Shore", "x": 975, "y": 1685}
  ],
  // The plate is mostly ocean, and Delaunay plus maxEdge leaves the far
  // islands, the polar shore and the eastern seas with no neighbour inside
  // reach. These are the crossings the cartography itself implies: the
  // archipelago chains, the southern coasting run, and the water routes that
  // tie Invidia and Kurnotheal to the rest of the Swathe.
  "extraLinks": [
    ["electria-sea", "jutting-nail"],
    ["electria-sea", "creeping-nail"],
    ["sea-of-elemental-truths", "tiara"],
    ["sea-of-elemental-truths", "the-quagmares"],
    ["the-sludge", "the-quagmares"],
    ["the-sludge", "gulf-of-thorns"],
    ["hewing-peaks", "gulf-of-thorns"],
    ["hewing-peaks", "mantis-coast"],
    ["mantis-coast", "clotted-choke"],
    ["sickling-sea", "etiolated-coast"],
    ["hind-sea", "grimscale-peaks"],
    ["hind-sea", "dirtwoad"],
    ["greenhaunch-sea", "the-vertebrae"],
    ["greenhaunch-sea", "mantis-coast"],
    ["dirtwoad", "rotwoad"],
    ["neodine-canal", "rotwoad"],
    ["heartwood-coast", "neodine-canal"],
    ["decrepita", "naiad-archipelago"],
    ["decrepita", "mortis-isles"],
    ["mortis-isles", "tendril-sea"],
    ["tendril-sea", "sanctum-isle"],
    ["tendril-sea", "tendril-reach"],
    ["the-southern-seas", "tendril-reach"],
    ["behemath-gnaw", "tendril-reach"],
    ["amnios-sea", "ellipsis-isles"],
    ["amnios-sea", "ochre-cliffs"],
    ["the-fleeing-siblings", "ellipsis-isles"],
    ["the-fleeing-siblings", "amber-littoral"],
    ["ymbolqui-lakes", "amnios-sea"],
    ["ymbolqui-lakes", "wintercoast"],
    ["pensids-gamble", "amnios-sea"],
    ["wintercoast", "behemath-gnaw"],
    ["electria-sea", "aquia"],
    ["slidecrown-isle", "battle-of-the-white-krakens"],
    ["epiglot-point", "the-pale-gorge"],
    ["scorpion-tip", "gulf-of-hags"]
  ],
  "blockedLinks": []
};
