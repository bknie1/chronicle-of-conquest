// Hive Primus, in section. The plate is the surveyor's cutaway of the hive —
// spire, wall, hive city, underhive, sump and the heat sink under all of it —
// with its printed labels and callouts lifted off so the app can draw its own.
//
// A cutaway is not a survey. What this drawing actually records is DEPTH: how
// far below the Spire a place sits. So the zones it names are placed where it
// draws them, and the underhive settlements are placed at the level they
// belong to rather than at a grid reference nobody has ever published. A hive
// of a hundred million people cannot be itemised, which is what the gamemaster
// tools are for: add the dome, the tunnel or the drinking hole your campaign
// actually fights over.
export default {
  "id": "hive-primus",
  "name": "Hive Primus",
  "title": "The hive in section, spire to sump",
  "image": "/maps/hive-primus.jpg",
  "width": 1407, "height": 2000,
  "maxEdge": 480, "reach": 230,
  "nodes": [
    // The Spire — House Helmawr and the nobility, above the cloud.
    { "id": "hp-the-palatine", "name": "The Palatine", "kind": "stronghold", "region": "The Spire", "x": 722, "y": 252 },
    { "id": "hp-imperial-fists-chapter-house", "name": "Imperial Fists Chapter House", "kind": "fortress", "region": "The Spire", "x": 754, "y": 366 },
    { "id": "hp-the-spire", "name": "The Spire", "kind": "city", "region": "The Spire", "x": 706, "y": 478 },
    { "id": "hp-landing-field", "name": "The Landing Field", "kind": "port", "region": "The Spire", "x": 864, "y": 694 },
    { "id": "hp-the-shell", "name": "The Shell", "kind": "site", "region": "The Spire", "x": 684, "y": 640 },

    // The Wall, and everything the Spire keeps on the other side of it.
    { "id": "hp-the-wall", "name": "The Wall", "kind": "fortress", "region": "Hive City", "x": 668, "y": 850 },
    { "id": "hp-hab-zones", "name": "The Hab Zones", "kind": "settlement", "region": "Hive City", "x": 648, "y": 1014 },
    { "id": "hp-manufactory-zones", "name": "The Manufactory Zones", "kind": "forge", "region": "Hive City", "x": 830, "y": 1120 },
    { "id": "hp-ruined-manufactories", "name": "The Ruined Manufactories", "kind": "ruin", "region": "Hive City", "x": 556, "y": 1128 },
    { "id": "hp-hive-city", "name": "Hive City", "kind": "hive", "region": "Hive City", "x": 762, "y": 1250 },
    { "id": "hp-subsidiary-spires", "name": "The Subsidiary Spires", "kind": "city", "region": "Hive City", "x": 944, "y": 1012 },
    { "id": "hp-the-strangers-spire", "name": "The Stranger's Spire", "kind": "stronghold", "region": "Hive City", "x": 1186, "y": 1244 },
    { "id": "hp-external-shanty-sprawl", "name": "The External Shanty Sprawl", "kind": "camp", "region": "The Ash Wastes", "x": 202, "y": 1390 },

    // Below the surface level: the underhive, and what is under that.
    { "id": "hp-the-underhive", "name": "The Underhive", "kind": "region", "region": "The Underhive", "x": 730, "y": 1402 },
    { "id": "hp-dust-falls", "name": "Dust Falls", "kind": "settlement", "region": "The Underhive", "x": 452, "y": 1428 },
    { "id": "hp-two-tunnels", "name": "Two Tunnels", "kind": "settlement", "region": "The Underhive", "x": 968, "y": 1424 },
    { "id": "hp-glory-hole", "name": "The Glory Hole", "kind": "site", "region": "The Underhive", "x": 610, "y": 1466 },
    { "id": "hp-hive-bottom", "name": "Hive Bottom", "kind": "region", "region": "Hive Bottom", "x": 726, "y": 1508 },
    { "id": "hp-the-sump", "name": "The Sump", "kind": "region", "region": "The Sump", "x": 718, "y": 1608 },
    { "id": "hp-sump-sea", "name": "The Sump Sea", "kind": "wilds", "region": "The Sump", "x": 986, "y": 1690 },
    { "id": "hp-primary-heat-sink", "name": "The Primary Heat Sink", "kind": "plant", "region": "The Sump", "x": 722, "y": 1860 }
  ],
  // A hive is one shaft: everything is connected to what is directly above and
  // below it, whatever the horizontal distance makes it look like.
  "extraLinks": [
    ["hp-the-palatine", "hp-the-spire"],
    ["hp-the-spire", "hp-the-shell"],
    ["hp-the-shell", "hp-the-wall"],
    ["hp-the-wall", "hp-hive-city"],
    ["hp-external-shanty-sprawl", "hp-dust-falls"],
    ["hp-the-strangers-spire", "hp-two-tunnels"],
    ["hp-hive-city", "hp-the-underhive"],
    ["hp-the-underhive", "hp-hive-bottom"],
    ["hp-hive-bottom", "hp-the-sump"],
    ["hp-the-sump", "hp-primary-heat-sink"],
    ["hp-sump-sea", "hp-primary-heat-sink"]
  ],
  "blockedLinks": []
};
