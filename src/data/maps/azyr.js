// Azyr, drawn by scripts/make-azyr.py. Games Workshop has never published a
// map of the celestial realm, so this one is drawn — but drawn as sky rather
// than as a coastline: a starfield holding the few known places, the
// Sigmarabulum ringing the broken world-core, and the light that runs between
// them. The art and these coordinates come out of the same script, so they
// cannot drift apart.
export default {
  "id": "azyr",
  "name": "Azyr",
  "kind": "settlement",
  "title": "The Celestial Realm",
  "image": "/maps/realms/azyr.jpg",
  "width": 1600,
  "height": 1100,
  "maxEdge": 420,
  "reach": 130,
  "nodes": [
    {
      "id": "azyrheim",
      "name": "Azyrheim",
      "kind": "fortress",
      "region": "Azyr",
      "x": 250,
      "y": 210
    },
    {
      "id": "sigmaron",
      "name": "Sigmaron",
      "kind": "fortress",
      "region": "Azyr",
      "x": 800,
      "y": 540
    },
    {
      "id": "gates-of-azyr",
      "name": "The Gates of Azyr",
      "kind": "temple",
      "region": "Azyr",
      "x": 690,
      "y": 900
    },
    {
      "id": "celestial-forges",
      "name": "The Celestial Forges",
      "kind": "fortress",
      "region": "Azyr",
      "x": 1140,
      "y": 400
    },
    {
      "id": "azyrite-watch",
      "name": "The Azyrite Watch",
      "kind": "temple",
      "region": "Azyr",
      "x": 1080,
      "y": 880
    },
    {
      "id": "sigmarabulum",
      "name": "The Sigmarabulum",
      "kind": "fortress",
      "region": "Azyr",
      "x": 800,
      "y": 420
    },
    {
      "id": "highheim",
      "name": "Highheim",
      "kind": "fortress",
      "region": "Azyr",
      "x": 640,
      "y": 250
    },
    {
      "id": "gladitorium",
      "name": "The Gladitorium",
      "kind": "temple",
      "region": "Azyr",
      "x": 1010,
      "y": 220
    },
    {
      "id": "starhold",
      "name": "Starhold",
      "kind": "fortress",
      "region": "Azyr",
      "x": 1290,
      "y": 700
    },
    {
      "id": "skydock",
      "name": "The Skydock",
      "kind": "temple",
      "region": "Azyr",
      "x": 400,
      "y": 745
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
