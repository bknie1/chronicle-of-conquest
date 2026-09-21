// Sound for the map. Off by default and remembered, like the place labels:
// a shop is a noisy place already, and nobody wants a browser tab that
// startles them. Nothing is fetched until sound is switched on.
import { Howl, Howler } from 'howler';

const SOUNDS = {
  'select-default': 'Selecting a place',
  'select-battles': 'A place with battles arranged',
  'select-city-order': 'A city held by Order',
  'select-city-death': 'A city held by Death',
  'select-city-destruction': 'A city held by Destruction',
  'select-wild': 'A place held by Chaos, or by nobody',
  'select-military': 'A fortress or stronghold',
  'select-industry': 'A forge, mine or works',
  'select-village': 'A village or hamlet',
  challenge: 'Issuing a challenge',
  accept: 'Reporting a result',
};

const loaded = new Map();
let on = false;
try { on = localStorage.getItem('sound') === 'on'; } catch { /* private mode */ }

const url = name => `${import.meta.env.BASE_URL}audio/${name}.ogg`;

function sound(name) {
  if (!loaded.has(name)) {
    loaded.set(name, new Howl({ src: [url(name)], volume: 0.5, preload: true, html5: false }));
  }
  return loaded.get(name);
}

// Which sound a place gets: what is happening there first, then what sort of
// place it is, then who holds it. A place says one thing about itself, not three.
export function soundForPlace({ kind, alliance, hasEvents }) {
  if (hasEvents) return 'select-battles';
  if (kind === 'fortress' || kind === 'stronghold' || kind === 'castle') return 'select-military';
  if (kind === 'forge' || kind === 'mine' || kind === 'plant' || kind === 'warren') return 'select-industry';
  if (kind === 'city' || kind === 'hive') {
    if (alliance === 'death') return 'select-city-death';
    if (alliance === 'destruction') return 'select-city-destruction';
    if (alliance === 'chaos') return 'select-wild';
    return 'select-city-order';
  }
  if (kind === 'wilds' || kind === 'camp' || kind === 'glade' || kind === 'ruin') return 'select-wild';
  if (kind === 'village' || kind === 'town' || kind === 'settlement' || kind === 'hamlet') return 'select-village';
  return 'select-default';
}

export function play(name) {
  if (!on || !SOUNDS[name]) return;
  const s = sound(name);
  s.stop();                 // a quick series of clicks should not pile up
  s.play();
}

export const soundOn = () => on;

export function setSound(next) {
  on = !!next;
  try { localStorage.setItem('sound', on ? 'on' : 'off'); } catch { /* ignore */ }
  Howler.mute(!on);
  if (on) play('select-default');   // one quiet confirmation that it works
  return on;
}

Howler.mute(!on);
