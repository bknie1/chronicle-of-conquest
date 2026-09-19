# Chronicle of Conquest

A living campaign map for your game store or gaming group. Every game played pushes a faction's influence across the map, and influence fades when nobody plays. The map shows who's playing, who's winning, and where the next fight is.

Settings: **The Old World**, **Age of Sigmar** (the Mortal Realms), **Horus Heresy** and **Warhammer 40,000**.

**Live demo:** https://bknie1.github.io/chronicle-of-conquest/ (demos only; accounts and real campaigns need the full app on a server)

## How it works

- **Demos** at `/` (The Old World), `/demo/mortal-realms`, `/demo/horus-heresy` and `/demo/warhammer-40k`: one made-up store crew playing four months across every setting.
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

Aqshy uses Jared Blando's Great Parch map. The other realms use **generated placeholder maps** (`scripts/make-placeholder-realms.py`, which needs Python with numpy and Pillow) until real art is found; see [docs/map-sources.md](docs/map-sources.md) for candidates. Factions, homes and gates are in `src/data/mortal-realms.js`.

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

### Demo site (GitHub Pages)

Every push to `master` runs the tests and publishes a demo-only static build to GitHub Pages (`.github/workflows/pages.yml`). The build sets `VITE_STATIC=1`, which hides sign-in, join codes and campaign creation, and `BASE_PATH=/<repo>/`, because Pages serves the site under the repository name. To try that build locally:

```bash
VITE_STATIC=1 BASE_PATH=/chronicle-of-conquest/ npm run build
```

## Project layout

```
server/            Express API: Passport sign-in, campaigns, results, SQLite
src/engine.js      Influence rules
src/map.js         Map rendering, pan / zoom / tilt
src/main.js        UI
src/data/          Settings (factions, homes, realmgates) and the demo stores
src/data/maps/     One module per map, written by the editor
src/editor.js      Map editor (dev only), with server/dev-maps.js
scripts/           Placeholder realm map generator
public/maps/       Map images
tests/             node:test suites
```

## Adding or fixing a map

Run `npm run dev` and open **http://localhost:5173/editor.html** (development only; it isn't in the production build).

- Pick a map, then drag points, add them, or select one to rename it or change its region.
- **Link** mode (or shift-click two points) cycles a pair between automatic, forced and blocked neighbours. Use it for sea crossings and mountain passes.
- Tune how far apart neighbours can be (`maxEdge`) and how far colour spreads (`reach`) with the sliders. Ctrl+Z undoes.
- **Save** writes `src/data/maps/<id>.js`. **New map…** starts a map from any image in `public/maps/`.

Every map is a self-contained module in `src/data/maps/` listed in `src/data/maps/index.js`. A setting (`src/data/settings.js`) groups maps with their factions and realmgates, and point ids must be unique across a setting. Saving is refused if it would delete or rename a point that a setting uses as a home or realmgate.

## Credits

Map art: *The Old World* colour map, the Gitzman Old World campaign map (gitzmansgallery.com), Jared Blando's *Great Parch* map, and the Horus Heresy and 40k galaxy maps. See [docs/map-sources.md](docs/map-sources.md). Some are fan works and some are official Games Workshop art: ask the artists (and GW) before any public deployment, and credit them. Warhammer and its settings are trademarks of Games Workshop. This is an unofficial fan project.
