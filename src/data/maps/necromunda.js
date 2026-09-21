// Necromunda: the whole hive world, not the quarter of it the old crop showed.
// The plate is the Adeptus Terra cartograph of C.M.42.966, both hemispheres on
// one sheet, and every point here was read off it at 3x on a gridded tile and
// doubled — the shipped image is twice the plate's own 1200x800, so a node's
// x,y is exactly twice what the ruler said. Nothing is estimated off the
// whole-map view. The printed place-names were lifted from the art so the app
// can draw its own; the title cartouche, the icon legend and the surveyor's
// note are left standing, being the plate's chrome rather than labels.
//
// `kind` follows the plate's own legend: a spire is a Major Hive, a dark lens
// a Deep Core Mine, a small square a Major Settlement. Unnamed icons — and the
// plate admits to "approx 1,000+ minor hives excluded from view" — are left
// alone rather than given invented names.
export default {
  "id": "necromunda",
  "name": "Necromunda",
  "title": "Hive world of Segmentum Solar",
  "image": "/maps/necromunda.jpg",
  "width": 2400, "height": 1600,
  "maxEdge": 380, "reach": 140,
  "nodes": [
    // Northern hemisphere of the near face.
    { "id": "stormlands", "name": "The Stormlands", "kind": "region", "region": "The Stormlands", "x": 680, "y": 276 },
    { "id": "bighole", "name": "Bighole", "kind": "mine", "region": "The Stormlands", "x": 908, "y": 418 },
    { "id": "hive-rothgol", "name": "Hive Rothgol", "kind": "hive", "region": "The Stormlands", "x": 338, "y": 532 },
    // The Palatine, four spires within sight of one another.
    { "id": "palatine-cluster", "name": "The Palatine Cluster", "kind": "region", "region": "Palatine Cluster", "x": 800, "y": 524 },
    { "id": "hive-temenos", "name": "Hive Temenos", "kind": "hive", "region": "Palatine Cluster", "x": 760, "y": 582 },
    { "id": "hive-primus", "name": "Hive Primus", "kind": "hive", "region": "Palatine Cluster", "x": 794, "y": 586 },
    { "id": "hive-acropolis", "name": "Hive Acropolis", "kind": "hive", "region": "Palatine Cluster", "x": 856, "y": 620 },
    { "id": "hive-trazior", "name": "Hive Trazior", "kind": "hive", "region": "Palatine Cluster", "x": 790, "y": 656 },
    // The western sea and the road east out of it.
    { "id": "scum-lake", "name": "Scum Lake", "kind": "site", "region": "The Slag Sea", "x": 418, "y": 668 },
    { "id": "great-ash-road-west", "name": "Great Ash Road, western reach", "kind": "region", "region": "Great Equatorial Waste", "x": 560, "y": 740 },
    { "id": "great-ash-road-east", "name": "Great Ash Road, eastern reach", "kind": "region", "region": "Great Equatorial Waste", "x": 1068, "y": 688 },
    { "id": "slag-sea", "name": "The Slag Sea", "kind": "region", "region": "The Slag Sea", "x": 280, "y": 822 },
    { "id": "port-blackwater", "name": "Port Blackwater", "kind": "settlement", "region": "The Slag Sea", "x": 378, "y": 838 },
    { "id": "slag-coasts", "name": "The Slag Coasts", "kind": "region", "region": "The Slag Sea", "x": 260, "y": 904 },
    // The waste that runs the width of the near face.
    { "id": "great-equatorial-waste", "name": "Great Equatorial Waste", "kind": "region", "region": "Great Equatorial Waste", "x": 766, "y": 792 },
    { "id": "xenos-quarantine-zone", "name": "Xenos Quarantine Zone", "kind": "region", "region": "Xenos Quarantine Zone", "x": 980, "y": 842 },
    { "id": "hive-secundus", "name": "Hive Secundus", "kind": "hive", "region": "Xenos Quarantine Zone", "x": 1076, "y": 816 },
    { "id": "hive-skull", "name": "Hive Skull", "kind": "hive", "region": "Great Equatorial Waste", "x": 928, "y": 962 },
    { "id": "mynerva-cluster", "name": "Mynerva Cluster", "kind": "region", "region": "Mynerva Cluster", "x": 676, "y": 1050 },
    { "id": "ceres", "name": "Ceres", "kind": "hive", "region": "Great Equatorial Waste", "x": 1058, "y": 1166 },
    { "id": "vlantia", "name": "Vlantia", "kind": "hive", "region": "The Ash Pole", "x": 674, "y": 1252 },
    { "id": "ash-pole", "name": "The Ash Pole", "kind": "region", "region": "The Ash Pole", "x": 856, "y": 1300 },
    // The far face, north.
    { "id": "ruined-cluster", "name": "The Ruined Cluster", "kind": "region", "region": "The Ruined Cluster", "x": 1676, "y": 332 },
    { "id": "the-spoil", "name": "The Spoil", "kind": "region", "region": "The Spoil", "x": 1406, "y": 440 },
    { "id": "quinspirus-cluster", "name": "Quinspirus Cluster", "kind": "region", "region": "Quinspirus Cluster", "x": 1888, "y": 476 },
    { "id": "worldsump-ocean", "name": "The Worldsump Ocean", "kind": "region", "region": "Quinspirus Cluster", "x": 2060, "y": 524 },
    { "id": "chem-coasts", "name": "The Chem Coasts", "kind": "region", "region": "The Chem Coasts", "x": 1544, "y": 606 },
    { "id": "song-cracks", "name": "Song Cracks", "kind": "region", "region": "Quinspirus Cluster", "x": 1896, "y": 656 },
    { "id": "hive-vosroth", "name": "Hive Vosroth", "kind": "hive", "region": "The Chem Coasts", "x": 1452, "y": 688 },
    { "id": "sulphurous-sea", "name": "The Sulphurous Sea", "kind": "region", "region": "The Chem Coasts", "x": 1520, "y": 696 },
    // Helmawr's Graveyard and its holdings.
    { "id": "cog-tooth-bridge", "name": "Cog-tooth Bridge", "kind": "settlement", "region": "Helmawr's Graveyard", "x": 1846, "y": 748 },
    { "id": "hive-mortis", "name": "Hive Mortis", "kind": "hive", "region": "Helmawr's Graveyard", "x": 1474, "y": 858 },
    { "id": "carrion-town", "name": "Carrion Town", "kind": "settlement", "region": "Helmawr's Graveyard", "x": 1348, "y": 922 },
    { "id": "helmawrs-grasp", "name": "Helmawr's Graveyard", "kind": "region", "region": "Helmawr's Graveyard", "x": 1780, "y": 944 },
    { "id": "pit-city", "name": "Pit City", "kind": "settlement", "region": "Helmawr's Graveyard", "x": 1482, "y": 1012 },
    { "id": "gothruls-needle", "name": "Gothrul's Needle", "kind": "hive", "region": "Helmawr's Graveyard", "x": 1850, "y": 1086 },
    { "id": "great-seismic-basin", "name": "The Great Seismic Basin", "kind": "region", "region": "Helmawr's Graveyard", "x": 1572, "y": 1252 }
  ],
  // None needed: the two hemispheres are drawn overlapping about the middle of
  // the sheet, so the Spoil and the Great Equatorial Waste already bridge them
  // and every point is reachable at this maxEdge. A far-left to far-right wrap
  // would be true of the globe but would draw a line across the whole plate.
  "extraLinks": [],
  "blockedLinks": []
};
