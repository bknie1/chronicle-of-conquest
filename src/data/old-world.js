// The Old World map definition. Points, factions, maxEdge/reach and link
// overrides live in JSON (src/data/maps/old-world.json) so /editor.html can
// write them back; id/name/image/width/height are structural and stay here.
// Coordinates are in the image's own pixels (2000 x 1987).
import DATA from './maps/old-world.json' assert { type: 'json' };

export const OLD_WORLD = {
  id: 'old-world',
  name: 'The Old World',
  image: '/maps/old-world.jpg',
  width: 2000,
  height: 1987,
  maxEdge: DATA.maxEdge, // points further apart than this are not neighbours (seas, mountains)
  reach: DATA.reach,     // how far a region's colour bleeds out from its point
  // Each faction's home can never be lost.
  factions: DATA.factions,
  nodes: DATA.nodes,
  extraLinks: DATA.extraLinks || [],
  blockedLinks: DATA.blockedLinks || [],
};
