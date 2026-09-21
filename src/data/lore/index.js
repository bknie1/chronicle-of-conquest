// A line or two of lore for a place, shown beside its battle record.
//
// One module per setting, each exporting a plain object keyed by point id:
//
//     export const OLD_WORLD_LORE = {
//       altdorf: 'Seat of the Emperor, where the Reik meets the Talabec...',
//     };
//
// Nothing is required: a point with no entry simply shows its region instead.
// Keep entries to two or three sentences — enough to place somewhere in the
// world and say why anyone would fight over it, not an encyclopedia.
//
// The Horus Heresy and Legions Imperialis share one galaxy map, so they share
// one file of lore too.
import { OLD_WORLD_LORE } from './old-world.js';
import { WARHAMMER_FANTASY_LORE } from './warhammer-fantasy.js';
import { MORTAL_REALMS_LORE } from './mortal-realms.js';
import { AGE_OF_DARKNESS_LORE } from './age-of-darkness.js';
import { TERRA_LORE } from './terra.js';
import { NECROMUNDA_LORE } from './necromunda.js';
import { WARHAMMER_40K_LORE } from './warhammer-40k.js';
import { MIDDLE_EARTH_LORE } from './middle-earth.js';

const LORE = {
  'old-world': OLD_WORLD_LORE,
  'warhammer-fantasy': WARHAMMER_FANTASY_LORE,
  'mortal-realms': MORTAL_REALMS_LORE,
  // Both ages of darkness share the galaxy map and Terra's surface, so they
  // share their lore too.
  'horus-heresy': { ...AGE_OF_DARKNESS_LORE, ...TERRA_LORE },
  'legions-imperialis': { ...AGE_OF_DARKNESS_LORE, ...TERRA_LORE },
  'warhammer-40k': WARHAMMER_40K_LORE,
  'necromunda': NECROMUNDA_LORE,
  'middle-earth': MIDDLE_EARTH_LORE,
};

export const loreFor = (settingId, nodeId) => LORE[settingId]?.[nodeId] ?? null;
