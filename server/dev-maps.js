// Dev-only endpoints behind /api/dev, used by the map editor (/editor.html)
// to list source images and write map JSON back to disk. Mounted from
// server/index.js only when NOT running in production (see the guard there).
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { HttpError, wrap } from './util.js';

const ID_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/; // lowercase-kebab, matches node/map id rules
const RESERVED_IDS = new Set(['index']); // src/data/maps/index.js is the registry; never overwrite it
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

// The Old World's JSON only holds the editable subset (its id/name/image/width/
// height are structural and live in src/data/old-world.js). A brand-new map has
// no such wrapper, so its JSON is the whole map definition (see MAPS_INDEX_HINT
// in the client). Keep this list in sync with any other maps given a JS wrapper.
const WRAPPED_MAP_IDS = new Set(['old-world']);
const WRAPPED_SHAPE_FIELDS = ['maxEdge', 'reach', 'factions', 'nodes', 'extraLinks', 'blockedLinks'];

function safeTarget(dir, id) {
  const target = path.join(dir, `${id}.json`);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) throw new HttpError(400, 'Invalid map id.');
  return target;
}

function validateNodes(nodes, bounds) {
  if (!Array.isArray(nodes) || !nodes.length) return 'nodes must be a non-empty array.';
  const seen = new Set();
  for (const n of nodes) {
    if (!n || typeof n !== 'object') return 'Every node must be an object.';
    if (typeof n.id !== 'string' || !ID_RE.test(n.id)) return `Node id "${n.id}" must be lowercase-kebab.`;
    if (seen.has(n.id)) return `Duplicate node id "${n.id}".`;
    seen.add(n.id);
    if (typeof n.name !== 'string' || !n.name.trim()) return `Node "${n.id}" needs a name.`;
    if (typeof n.x !== 'number' || !Number.isFinite(n.x)) return `Node "${n.id}" has a bad x.`;
    if (typeof n.y !== 'number' || !Number.isFinite(n.y)) return `Node "${n.id}" has a bad y.`;
    if (bounds && (n.x < 0 || n.x > bounds.width || n.y < 0 || n.y > bounds.height)) {
      return `Node "${n.id}" is outside the image (${bounds.width}x${bounds.height}).`;
    }
  }
  return null;
}

function validateLinks(links, label, nodeIds) {
  if (links == null) return null;
  if (!Array.isArray(links)) return `${label} must be an array.`;
  for (const pair of links) {
    if (!Array.isArray(pair) || pair.length !== 2) return `${label} entries must be [idA, idB] pairs.`;
    const [a, b] = pair;
    if (!nodeIds.has(a) || !nodeIds.has(b)) return `${label} references an unknown node id.`;
  }
  return null;
}

function validateFactions(factions, nodeIds) {
  if (factions == null) return null;
  if (!Array.isArray(factions)) return 'factions must be an array.';
  const seen = new Set();
  for (const f of factions) {
    if (!f || typeof f !== 'object') return 'Every faction must be an object.';
    if (typeof f.id !== 'string' || !f.id) return 'Every faction needs an id.';
    if (seen.has(f.id)) return `Duplicate faction id "${f.id}".`;
    seen.add(f.id);
    if (typeof f.name !== 'string' || !f.name.trim()) return `Faction "${f.id}" needs a name.`;
    if (typeof f.color !== 'string' || !f.color) return `Faction "${f.id}" needs a color.`;
    if (typeof f.home !== 'string' || !nodeIds.has(f.home)) return `Faction "${f.id}"'s home must be a valid node id.`;
  }
  return null;
}

// Returns an error string, or null if the payload is good to write.
function validateMapPayload(body) {
  if (!body || typeof body !== 'object') return 'Payload must be an object.';
  const bounds = typeof body.width === 'number' && typeof body.height === 'number'
    ? { width: body.width, height: body.height } : null;
  const nodeErr = validateNodes(body.nodes, bounds);
  if (nodeErr) return nodeErr;
  const nodeIds = new Set(body.nodes.map(n => n.id));
  const factionErr = validateFactions(body.factions, nodeIds);
  if (factionErr) return factionErr;
  const extraErr = validateLinks(body.extraLinks, 'extraLinks', nodeIds);
  if (extraErr) return extraErr;
  const blockedErr = validateLinks(body.blockedLinks, 'blockedLinks', nodeIds);
  if (blockedErr) return blockedErr;
  if (body.maxEdge != null && (typeof body.maxEdge !== 'number' || body.maxEdge <= 0)) return 'maxEdge must be a positive number.';
  if (body.reach != null && (typeof body.reach !== 'number' || body.reach <= 0)) return 'reach must be a positive number.';
  return null;
}

export function devMapRoutes(root) {
  const router = express.Router();
  const mapsDir = path.join(root, 'src', 'data', 'maps');
  const publicMapsDir = path.join(root, 'public', 'maps');

  router.use(express.json({ limit: '2mb' })); // map JSON (many nodes) can be bigger than the main API's 20kb cap

  router.get('/map-images', wrap(async (req, res) => {
    let files = [];
    try { files = await fs.promises.readdir(publicMapsDir); } catch { /* no maps dir yet */ }
    res.json({ images: files.filter(f => IMAGE_RE.test(f)).sort() });
  }));

  router.post('/maps/:id', wrap(async (req, res) => {
    const id = req.params.id;
    if (!ID_RE.test(id) || RESERVED_IDS.has(id)) throw new HttpError(400, 'Map id must be lowercase-kebab.');
    const target = safeTarget(mapsDir, id);

    const err = validateMapPayload(req.body);
    if (err) throw new HttpError(400, err);

    // A map with a JS wrapper (see src/data/old-world.js) keeps only the
    // editable subset in JSON; everything else is written as a complete,
    // self-contained map definition (id/name/image/width/height included).
    const toWrite = WRAPPED_MAP_IDS.has(id)
      ? Object.fromEntries(WRAPPED_SHAPE_FIELDS.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]))
      : req.body;

    await fs.promises.mkdir(mapsDir, { recursive: true });
    await fs.promises.writeFile(target, `${JSON.stringify(toWrite, null, 2)}\n`);
    res.json({ ok: true, wrote: `src/data/maps/${id}.json`, wrapped: WRAPPED_MAP_IDS.has(id) });
  }));

  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Something went wrong.' : err.message });
  });

  return router;
}
