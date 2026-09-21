// The Eightpoints, drawn by scripts/make-eightpoints.py. Nobody has published
// a map of the Allpoints, so this one is drawn — as a realm broken into shards
// hanging in the Realm of Chaos, not as a continent with a coastline. The
// Varanspire holds the middle, three fortress-holds sit on shards beside it,
// and eight arcways ring it, each burning the colour of the realm it opens
// onto. The script lays the art out from these coordinates, so the two cannot
// drift apart.
export default {
  "id": "eightpoints",
  "name": "The Eightpoints",
  "kind": "settlement",
  "title": "Realm of Ruin",
  "image": "/maps/realms/eightpoints.jpg",
  "width": 1600,
  "height": 1100,
  "maxEdge": 420,
  "reach": 130,
  "nodes": [
    {
      "id": "varanspire",
      "name": "The Varanspire",
      "kind": "fortress",
      "region": "The Eightpoints",
      "x": 800,
      "y": 545
    },
    {
      "id": "carngrad",
      "name": "Carngrad",
      "kind": "fortress",
      "region": "The Eightpoints",
      "x": 595,
      "y": 655
    },
    {
      "id": "flayhaunt",
      "name": "Flayhaunt",
      "kind": "fortress",
      "region": "The Eightpoints",
      "x": 1010,
      "y": 440
    },
    {
      "id": "arcway-fire",
      "name": "The Brimfire Gate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 800,
      "y": 175
    },
    {
      "id": "arcway-life",
      "name": "The Genesis Gate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 1168,
      "y": 285
    },
    {
      "id": "arcway-beasts",
      "name": "The Mawgate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 1320,
      "y": 545
    },
    {
      "id": "arcway-death",
      "name": "The Endgate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 1168,
      "y": 805
    },
    {
      "id": "arcway-metal",
      "name": "The Mercurial Gate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 800,
      "y": 915
    },
    {
      "id": "arcway-shadow",
      "name": "The Penumbral Gate",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 432,
      "y": 805
    },
    {
      "id": "arcway-light",
      "name": "The Arcway of Hysh",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 280,
      "y": 545
    },
    {
      "id": "arcway-heavens",
      "name": "The Meteoric Gate (sealed)",
      "kind": "settlement",
      "region": "The Eightpoints",
      "x": 432,
      "y": 285
    },
    {
      "id": "skarrgrim",
      "name": "Skarrgrim",
      "kind": "fortress",
      "region": "The Eightpoints",
      "x": 760,
      "y": 735
    }
  ],
  "extraLinks": [],
  "blockedLinks": []
};
