// Blight City, painted by scripts/paint-realm.py. No published map of the
// skaven under-realm exists, so this one is drawn — as a cutaway of stone
// with the warrens gnawed out of it: a chamber for each great clan around the
// city's own cavern, tunnels between them, and gnawholes chewed through into
// Aqshy, Ghyran, Ghur and Ulgu. The art and these coordinates come out of the
// same script, so they cannot drift apart.
export default {
  "id": "blight-city",
  "name": "Blight City",
  "kind": "warren",
  "title": "The Hidden Sub-realm",
  "image": "/maps/realms/blight-city.jpg",
  "width": 2600,
  "height": 1700,
  "maxEdge": 1100,
  "reach": 300,
  "nodes": [
    {
      "id": "blight-city",
      "name": "Blight City",
      "kind": "warren",
      "region": "Blight City",
      "x": 1300,
      "y": 850
    },
    {
      "id": "skryre-forges",
      "name": "The Skryre Forges",
      "kind": "warren",
      "region": "Blight City",
      "x": 1920,
      "y": 500
    },
    {
      "id": "pestilens-pits",
      "name": "The Pestilens Plague-pits",
      "kind": "warren",
      "region": "Blight City",
      "x": 2020,
      "y": 1260
    },
    {
      "id": "moulder-fleshpits",
      "name": "The Moulder Fleshpits",
      "kind": "warren",
      "region": "Blight City",
      "x": 600,
      "y": 1280
    },
    {
      "id": "eshin-shadows",
      "name": "The Eshin Shadow-warrens",
      "kind": "warren",
      "region": "Blight City",
      "x": 520,
      "y": 480
    },
    {
      "id": "verminus-barracks",
      "name": "The Verminus Barracks",
      "kind": "warren",
      "region": "Blight City",
      "x": 1300,
      "y": 1480
    }
  ],
  "extraLinks": [
    ["blight-city", "skryre-forges"],
    ["blight-city", "pestilens-pits"],
    ["blight-city", "moulder-fleshpits"],
    ["blight-city", "eshin-shadows"],
    ["blight-city", "verminus-barracks"],
    ["skryre-forges", "pestilens-pits"],
    ["moulder-fleshpits", "eshin-shadows"],
    ["moulder-fleshpits", "verminus-barracks"],
    ["verminus-barracks", "pestilens-pits"],
    ["eshin-shadows", "skryre-forges"]
  ],
  "blockedLinks": []
};
