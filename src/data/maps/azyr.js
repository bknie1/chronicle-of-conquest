// Azyr, painted by scripts/paint-realm.py. Games Workshop has never published
// a map of the celestial realm, so this one is drawn — as the warm inland sea
// its people came down from: a fair country wrapped around bright water, open
// to the ocean by one strait, Sigmaron on the northern shore and Azyrheim on
// the western. The art and these coordinates come out of the same script, so
// they cannot drift apart.
export default {
  "id": "azyr",
  "name": "Azyr",
  "kind": "settlement",
  "title": "The Celestial Realm",
  "image": "/maps/realms/azyr.jpg",
  "width": 2600,
  "height": 1700,
  "maxEdge": 1100,
  "reach": 260,
  "nodes": [
    {
      "id": "azyrheim",
      "name": "Azyrheim",
      "kind": "fortress",
      "region": "Azyr",
      "x": 520,
      "y": 700
    },
    {
      "id": "sigmaron",
      "name": "Sigmaron",
      "kind": "fortress",
      "region": "Azyr",
      "x": 1300,
      "y": 520
    },
    {
      "id": "gates-of-azyr",
      "name": "The Gates of Azyr",
      "kind": "temple",
      "region": "Azyr",
      "x": 1250,
      "y": 1400
    },
    {
      "id": "celestial-forges",
      "name": "The Celestial Forges",
      "kind": "fortress",
      "region": "Azyr",
      "x": 2180,
      "y": 640
    },
    {
      "id": "azyrite-watch",
      "name": "The Azyrite Watch",
      "kind": "temple",
      "region": "Azyr",
      "x": 1328,
      "y": 962
    },
    {
      "id": "sigmarabulum",
      "name": "The Sigmarabulum",
      "kind": "fortress",
      "region": "Azyr",
      "x": 1200,
      "y": 290
    },
    {
      "id": "highheim",
      "name": "Highheim",
      "kind": "fortress",
      "region": "Azyr",
      "x": 1800,
      "y": 380
    },
    {
      "id": "gladitorium",
      "name": "The Gladitorium",
      "kind": "temple",
      "region": "Azyr",
      "x": 1744,
      "y": 872
    },
    {
      "id": "starhold",
      "name": "Starhold",
      "kind": "fortress",
      "region": "Azyr",
      "x": 2330,
      "y": 1000
    },
    {
      "id": "skydock",
      "name": "The Skydock",
      "kind": "temple",
      "region": "Azyr",
      "x": 480,
      "y": 1160
    }
  ],
  "extraLinks": [
    [
      "azyrheim",
      "azyrite-watch"
    ]
  ],
  "blockedLinks": []
};
