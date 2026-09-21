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
// A realm rebuilt on published cartography carries hundreds of places, so each
// keeps its own file rather than swelling one.
import { AQSHY_LORE } from './realms/aqshy.js';
import { GHYRAN_LORE } from './realms/ghyran.js';
import { GHUR_LORE } from './realms/ghur.js';
import { CHAMON_LORE } from './realms/chamon.js';
import { ULGU_LORE } from './realms/ulgu.js';
import { HYSH_LORE } from './realms/hysh.js';

const LORE = {
  'old-world': OLD_WORLD_LORE,
  'warhammer-fantasy': WARHAMMER_FANTASY_LORE,
  // The realm files come last: where a realm was rebuilt from published art,
  // its own entry is the one that describes the place actually on the map.
  'mortal-realms': {
    ...MORTAL_REALMS_LORE,
    ...AQSHY_LORE, ...GHYRAN_LORE, ...GHUR_LORE,
    ...CHAMON_LORE, ...ULGU_LORE, ...HYSH_LORE,
  },
  // Both ages of darkness share the galaxy map and Terra's surface, so they
  // share their lore too.
  'horus-heresy': { ...AGE_OF_DARKNESS_LORE, ...TERRA_LORE },
  'legions-imperialis': { ...AGE_OF_DARKNESS_LORE, ...TERRA_LORE },
  'warhammer-40k': WARHAMMER_40K_LORE,
  'necromunda': NECROMUNDA_LORE,
  'middle-earth': MIDDLE_EARTH_LORE,
};

export const loreFor = (settingId, nodeId) => LORE[settingId]?.[nodeId] ?? null;
