# Map sources

Where the map art comes from, and where to look for what's still missing.

## In use

| Map | File | Source |
|---|---|---|
| The Old World | `public/maps/old-world.jpg` | "The Old World" 7-colour fan map |
| The Old World (alternative, not yet placed) | `public/maps/old-world-gitzman.jpg` | Gitzman Old World campaign map, gitzmansgallery.com |
| Age of Sigmar — Aqshy | `public/maps/realms/aqshy.jpg` | **Real art**: Lexicanum *Great Parch Map 06*, 4764×3246, shipped at 2600 wide. Points placed off its own labels |
| Age of Sigmar — the other realms and Blight City | `public/maps/realms/*.jpg` | **Generated placeholders** (`scripts/make-placeholder-realms.py`). The place names are real; the coastlines and positions are invented, so they do not match any published map |
| Horus Heresy | `public/maps/heresy-galaxy.jpg` | 30k galaxy map (official art, labeled) |
| Warhammer 40,000 | `public/maps/galaxy-40k.jpg` | Games Workshop's unlabeled "Interactive Map" header art, with its logo painted out and upscaled 1.4× |

Unlabeled art works best: the app labels every point itself, so printed labels only compete with it.

**The realm maps are the weak point of this project.** No realm has a single
published map of the whole realm — Games Workshop publishes *focal point* maps
of regions instead, like the Great Parch in Aqshy. The nine still on generated
art show invented geography under real names, which is worth knowing before
anyone plans a campaign around them. Replacing one means dropping a focal
point map into `public/maps/realms/`, pointing the realm's `image`, `width`
and `height` at it, and re-placing its points off the new art's own labels.

Official Games Workshop art is fine for private use in a store. Ask before publishing it anywhere public.

## Real art candidates, if you ever want them

Found in September 2026. All are official GW art, mostly book scans hosted on Lexicanum's per-realm map categories (`ageofsigmar.lexicanum.com/wiki/Category:<Realm>_maps`). No realm has one map of the whole realm; each is a region.

| Realm | Best candidate | Notes |
|---|---|---|
| Ghur | Ghurish Heartlands map 02 (Broken Realms: Kragnos) | 2604×1714. The best map found; covers Thondia, Gallet |
| Ghyran | Everspring Swathe maps 01 and 02 | About 2300×1160 and 2060×1360 |
| Shyish | Prime Innerlands map 04 | 2250×1661 |
| Ulgu | Shadrac Convergence map 02 | 2064×1364 |
| Hysh | Ymetrica map 02; "Realm of Hysh" whole-realm diagram | Region map is large; the whole-realm diagram is small (about 950 px) |
| Chamon | Spiral Crux map 02 | 2044×1222. Chamon is floating sub-realms, so no single map exists |
| Azyr | None | Nothing usable exists; keep the placeholder or commission art |
| Eightpoints | Bloodwind Spoil map 01 | One district only, 1856×1204 |
| All realms | Warhammer Community, "What exactly are the Mortal Realms"; Lexicanum Cosmos-Map.jpg; Mortal Realms map 03 | Diagrams of the realms around the Eightpoints |

Switching a realm to real art: put the image in `public/maps/realms/`, point the realm's `image`, `width` and `height` at it in `src/data/maps/<realm>.js`, then move the points in the map editor. Point ids used as homes or realmgates must stay; the editor refuses saves that drop them.

## Ideas parked

- **City maps.** `Map-City-Altdorf-3-Vector.pdf` in the assets folder is a street map of Altdorf. A city could one day be its own small map, the way Blight City is, for skirmish campaigns fought street by street. Low priority: a whole map for one city is a lot of scaffolding for a small payoff.
- **References kept for naming** (not shipped, see `.mapref/`): the labeled Old World and Heresy maps, both Total War faction maps, Gitzman tiles, and a detailed Norsca map.
