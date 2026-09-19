// Registry of every map. Each map is a self-contained module (`export default
// { id, name, image, width, height, maxEdge, reach, nodes, ... }`) that the map
// editor (/editor.html) can rewrite. Settings (../settings.js) group maps.
import oldWorld from './old-world.js';
import aqshy from './aqshy.js';
import ghyran from './ghyran.js';
import ghur from './ghur.js';
import shyish from './shyish.js';
import chamon from './chamon.js';
import ulgu from './ulgu.js';
import hysh from './hysh.js';
import azyr from './azyr.js';
import eightpoints from './eightpoints.js';
import blightCity from './blight-city.js';
import heresyGalaxy from './heresy-galaxy.js';
import galaxy40k from './galaxy-40k.js';

export const MAPS = Object.fromEntries(
  [oldWorld, aqshy, ghyran, ghur, shyish, chamon, ulgu, hysh, azyr, eightpoints, blightCity, heresyGalaxy, galaxy40k].map(m => [m.id, m]),
);
