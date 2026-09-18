# Chronicle of Conquest

A living campaign map for your game store or gaming group. Every game played pushes a faction's influence across the map, and influence fades when nobody plays. The map shows who's playing, who's winning, and where the next fight is.

Settings: **The Old World** and **Age of Sigmar** (the Mortal Realms). Horus Heresy and Warhammer 40,000 are planned.

## How it works

- **Demos** at `/` (The Old World) and `/demo/mortal-realms` (Age of Sigmar), each a made-up store with four months of history.
- **Anyone can look.** A real campaign at `/c/CODE` can be viewed by anyone with the code.
- **Sign in to take part.** Join with the code, then **muster an army**: pick a faction and give the army a name. Players can field several armies and retire one to start fresh.
- **Challenge** someone to fight over a region. It appears on the map as ⚔.
- **Report the result** afterwards. Your opponent **confirms** it, or disputes it and an organizer settles it. The map changes only once a result is confirmed. Unanswered reports confirm themselves after 48 hours.
- **Replay** the whole campaign with the timeline at the bottom.

### Influence rules (`src/engine.js`)

| Rule | Value |
|---|---|
| A win adds influence at the battlefield, its neighbours, and one step further | +10 / +4 / +1 |
| The loser gives some up | −6 / −2 |
| Every win's weight halves every | 21 days |
| A region is claimed once a faction has | 8+ influence |
| It's contested when the runner-up is within | 75% |
| Each faction's homeland | can never fall |

Territory is never stored. It is recalculated from the log of confirmed games, which is how replay, decay and voiding a bad result all work without extra machinery.

### The Mortal Realms

Each realm is its own map, and **realmgates** join a point in one realm to a point in another. Influence crosses a gate exactly as it crosses a border, so a win at Hammerhal Aqsha is felt in Hammerhal Ghyra through the Stormrift Realmgate. **All realms** shows every realm around the Eightpoints, with a line for each set of gates, coloured when one faction holds both ends. Click a portal badge (⟁) on the map to travel through a gate.

Aqshy uses Jared Blando's Great Parch map. The other realms use **generated placeholder maps** (`scripts/make-placeholder-realms.py`, which needs Python with numpy and Pillow) until real art is found. Realms, factions, homes and gates are in `src/data/mortal-realms.js`.

## Running it

Needs Node 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173 (API and front end with hot reload)
npm test           # API and rules-engine tests
```

Production:

```bash
npm run build
npm start          # serves dist/ and the API, default port 5173
```

| Environment variable | Default | |
|---|---|---|
| `PORT` | `5173` | |
| `DATA_DIR` | `./data` | SQLite database and session secret. **Back this up.** |
| `SESSION_SECRET` | generated into `DATA_DIR` | Set explicitly when you run more than one instance. |
| `SECURE_COOKIES` | off | Set to `1` when serving over HTTPS (you should). |

Any host that runs a Node process with a persistent disk works, for example Railway, Render, Fly.io or a small VPS. Mount the disk at `DATA_DIR`.

## Project layout

```
server/            Express API: Passport sign-in, campaigns, results, SQLite
src/engine.js      Influence rules
src/map.js         Map rendering, pan / zoom / tilt
src/main.js        UI
src/data/          Settings (maps, factions, homes, realmgates) and the demo stores
scripts/           Placeholder realm map generator
public/maps/       Map images
tests/             node:test suites
```

## Adding or fixing a map

A map is an image plus a list of points in the image's own pixel coordinates (`src/data/old-world.js`, `src/data/realms/*.js`). Regions, borders and neighbours are generated from the points automatically. A setting (`src/data/settings.js`) groups maps with their factions and the gates between them. Point ids must be unique across a setting.

## Credits

Map art: *The Old World* colour map, the Gitzman Old World campaign map (gitzmansgallery.com), and Jared Blando's *Great Parch* map. These are fan works: ask the artists before any public deployment and credit them. Warhammer and its settings are trademarks of Games Workshop. This is an unofficial fan project.
