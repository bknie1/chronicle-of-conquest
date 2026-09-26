// The page that explains what this is, shown on a first visit and from the
// header afterwards. It is also where the maps are accounted for honestly:
// some are published art, several are drawn by a script in this repository,
// and a campaign should know which it is standing on.
import { SETTINGS } from './data/settings.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Where each setting's art comes from. 'real' is published art; 'drawn' is
// painted by scripts/paint-realm.py, on geography this project composed.
const ART = {
  'old-world': ['real', 'A fan-made 7-colour map of the Old World, with Norsca drawn from a dedicated regional map.'],
  'warhammer-fantasy': ['real', 'The Warhammer world map, with every point read off its own labelled edition.'],
  'mortal-realms': ['mixed', 'Seven realms are read off published cartography — the Great Parch, the Everspring Swathe, the Ghurish Heartlands, the Spiral Crux, the Shadrac Convergence, the Ymetrican Geosegment and the Prime Innerlands. Azyr, the Eightpoints and Blight City have never been mapped by anyone, so they are painted here in the same manner.'],
  'legions-imperialis': ['real', 'The Age of Darkness galaxy, and Terra’s own surface read off a labelled techno-barbarian chart.'],
  'horus-heresy': ['real', 'The Age of Darkness galaxy, and Terra’s own surface read off a labelled techno-barbarian chart.'],
  'middle-earth': ['real', 'A chart of the Third Age, with every point read off its own labelled edition of the same drawing.'],
  'warhammer-40k': ['real', "Games Workshop's galaxy art, plus the Armageddon surface map."],
  'necromunda': ['real', 'The Adeptus Terra cartograph of the hive world, and the surveyor’s cutaway of Hive Primus. A cutaway records depth, not ground, so the hive’s places sit at the level they belong to — and a gamemaster can add the rest.'],
};

export function aboutPage() {
  const settings = Object.values(SETTINGS);
  return `
  <article class="about">
    <h2>A map that remembers every game</h2>
    <p class="lead">Chronicle of Conquest turns the games played at a store into a living campaign map.
      Win a battle and your faction's influence spreads from the place you fought over. Stop playing and it fades.
      Nothing about who holds what is stored — the map is worked out afresh from the log of confirmed games,
      which is why the timeline at the bottom can replay a whole season.</p>

    <h3>How a campaign runs</h3>
    <ol>
      <li>An organizer starts a campaign and shares its join code.</li>
      <li>Everyone musters an army: a faction, and a starting ground to begin from.</li>
      <li>Two players agree a battle at a place on the map, and play it on a table.</li>
      <li>One reports the result; the other confirms it. Only then does the map move.</li>
    </ol>
    <p>A faction's home can never fall. Everywhere else is up for grabs, and a place two factions both
      press shows as contested. Influence halves every three weeks, so a campaign rewards turning up.</p>

    <h3>What you can play</h3>
    <ul class="settings-list">${settings.map(s => `<li><b>${esc(s.name)}</b>
      <span class="muted">${s.maps.length > 1 ? `${s.maps.length} maps · ` : ''}${s.nodes.length} places · ${s.factions.length} army books</span></li>`).join('')}</ul>
    <p>A campaign can span several of them at once, each with its own armies and territory.</p>

    <h3>For gamemasters</h3>
    <p>An organizer can freeze a campaign, so nothing can be recorded while the shop is shut, without hiding it.
      They choose which games and which maps are in play, and they can put influence on the map by decree —
      an invasion, a landing, a WAAAGH!, or simply a correction — which holds until it is revoked.</p>
    <p>They can also add places of their own. No shipped map can itemise a hive city or an ash waste, so a
      campaign can put down the dome, the tunnel or the holding it actually fights over, write its lore, and
      have it fought over like anywhere else on the map.</p>

    <h3>About the maps</h3>
    <p>Worth knowing before you plan a campaign around one:</p>
    <ul class="art-list">${settings.map(s => {
      const [kind, note] = ART[s.id] ?? ['real', ''];
      return `<li><span class="art-tag ${kind}">${kind === 'real' ? 'published art' : kind === 'mixed' ? 'part drawn' : 'drawn here'}</span>
        <b>${esc(s.name)}</b> <span class="muted">${esc(note)}</span></li>`;
    }).join('')}</ul>
    <p>Where a map is marked <b>part drawn</b>, three of its plates have no published chart to read from —
      Azyr, which Games Workshop has never mapped; the Eightpoints; and Blight City, which is not the sort
      of thing anyone surveys. Those are painted here in the manner of the plates that do exist: relief lit
      from the north-west, water that shallows to its coasts, ridges inked where the ground is steep. Azyr
      is the warm inland sea its people came down from; the Eightpoints is eight arms of ash around the
      Varanspire in a sea that is not water; Blight City is a cutaway of stone with the warrens gnawed out of
      it. The names are real; the geography is ours, and says so.</p>

    <h3>The art</h3>
    <p>The maps are Games Workshop's, or fan cartographers'. They are used here to run a campaign in one shop.
      The code is ours.</p>

    <div class="row"><button class="primary" data-act="about-close">See the map</button></div>
  </article>`;
}
