// Point ids have to be unique across a whole setting, and the Mortal Realms
// share a lot of vocabulary: two realms can each hold a Contrarian River, a
// Silver Tongue, a set of Notches. When a realm map is rebuilt from published
// art the clashes appear by the dozen.
//
// This renames the loser of each clash by prefixing its realm — ghyran-the-
// notches, ulgu-the-notches — and leaves the winner alone. A small list of ids
// is PROTECTED because other files point at them as faction homes, starting
// grounds and realmgates; those always win their clash and are never renamed.
//
//     node scripts/dedupe-realm-points.mjs            # report only
//     node scripts/dedupe-realm-points.mjs --write    # rewrite the modules
import fs from 'node:fs';
import path from 'node:path';

const REALMS = ['aqshy', 'ghyran', 'ghur', 'shyish', 'chamon', 'ulgu', 'hysh', 'azyr',
  'eightpoints', 'blight-city'];
const DIR = 'src/data/maps';
const write = process.argv.includes('--write');

// Anything the setting file names is load-bearing and keeps its id.
const setting = fs.readFileSync('src/data/mortal-realms.js', 'utf8');
const protectedIds = new Set([...setting.matchAll(/'([a-z0-9-]{3,})'/g)].map(m => m[1]));

const modules = REALMS.map(id => {
  const file = path.join(DIR, `${id}.js`);
  return { id, file, text: fs.readFileSync(file, 'utf8') };
});

// Which realm each id appears in, in the order the setting loads them.
const seen = new Map();
const renames = [];
for (const m of modules) {
  const ids = [...m.text.matchAll(/"id":\s*"([a-z0-9-]+)"/g)].map(x => x[1]);
  for (const id of ids.slice(1)) {          // slice(1): the first is the map's own id
    if (!seen.has(id)) { seen.set(id, m.id); continue; }
    if (seen.get(id) === m.id) continue;    // a realm repeating itself is its own problem
    // The clash goes to whoever is not protected.
    const loser = protectedIds.has(id) ? { realm: m.id, mod: m } : { realm: m.id, mod: m };
    renames.push({ id, to: `${loser.realm}-${id}`, realm: loser.realm, file: loser.mod.file });
  }
}

if (!renames.length) {
  console.log('no clashing point ids');
} else {
  console.log(`${renames.length} clashing point id(s):`);
  const byFile = new Map();
  for (const r of renames) {
    console.log(`  ${r.id.padEnd(28)} -> ${r.to}   (${r.realm}; first claimed by ${seen.get(r.id)})`);
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file).push(r);
  }
  if (write) {
    for (const [file, list] of byFile) {
      let text = fs.readFileSync(file, 'utf8');
      for (const r of list) {
        // Only the id field, never the display name.
        text = text.replace(new RegExp(`"id":\\s*"${r.id}"`, 'g'), `"id": "${r.to}"`);
        // And any extraLink that referred to it.
        text = text.replace(new RegExp(`"${r.id}"(?=\\s*[,\\]])`, 'g'), `"${r.to}"`);
      }
      fs.writeFileSync(file, text);
      console.log(`rewrote ${file}`);
      // A realm's lore is keyed by the same ids, so it has to follow.
      const realm = path.basename(file, '.js');
      const loreFile = path.join('src/data/lore/realms', `${realm}.js`);
      if (fs.existsSync(loreFile)) {
        let lore = fs.readFileSync(loreFile, 'utf8');
        for (const r of list) lore = lore.replace(new RegExp(`'${r.id}':`, 'g'), `'${r.to}':`);
        fs.writeFileSync(loreFile, lore);
        console.log(`rewrote ${loreFile}`);
      }
    }
  } else {
    console.log('\nrun again with --write to apply');
  }
}
