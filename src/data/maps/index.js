// Registry of every playable map. Keep this a plain object literal of
// imports so it's easy to extend: add a new setting's data file, then add
// one line here. The map editor (/editor.html) reads this to offer a picker.
import { OLD_WORLD } from '../old-world.js';

export const MAPS = {
  'old-world': OLD_WORLD,
};
