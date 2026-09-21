// Blight City, drawn by scripts/make-blight-city.py. No published map of the
// skaven under-realm exists, so this one is drawn — but drawn as what it is: a
// cavern network gnawed out beneath the realms, a chamber for each great clan,
// winding tunnels between them, and gnawholes chewed through reality into
// Aqshy, Ghyran, Ghur and Ulgu. The art and these coordinates come out of the
// same script, so they cannot drift apart.
export default {
  "id": "blight-city",
  "name": "Blight City",
  "kind": "warren",
  "title": "The Hidden Sub-realm",
  "image": "/maps/realms/blight-city.jpg",
  "width": 1600,
  "height": 1100,
  "maxEdge": 420,
  "reach": 130,
  "nodes": [
    {
      "id": "blight-city",
      "name": "Blight City",
      "kind": "warren",
      "region": "Blight City",
      "x": 800,
      "y": 545
    },
    {
      "id": "skryre-forges",
      "name": "The Skryre Forges",
      "kind": "warren",
      "region": "Blight City",
      "x": 1155,
      "y": 360
    },
    {
      "id": "pestilens-pits",
      "name": "The Pestilens Plague-pits",
      "kind": "warren",
      "region": "Blight City",
      "x": 1200,
      "y": 760
    },
    {
      "id": "moulder-fleshpits",
      "name": "The Moulder Fleshpits",
      "kind": "warren",
      "region": "Blight City",
      "x": 430,
      "y": 790
    },
    {
      "id": "eshin-shadows",
      "name": "The Eshin Shadow-warrens",
      "kind": "warren",
      "region": "Blight City",
      "x": 375,
      "y": 345
    },
    {
      "id": "verminus-barracks",
      "name": "The Verminus Barracks",
      "kind": "warren",
      "region": "Blight City",
      "x": 800,
      "y": 900
    }
  ],
  "extraLinks": [
    [
      "pestilens-pits",
      "eshin-shadows"
    ]
  ],
  "blockedLinks": []
};
