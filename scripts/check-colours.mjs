// Two factions the same colour is two factions you cannot tell apart on the
// map, which is the one thing the map is for. This reports the pairs that sit
// too close together, per setting, measured in CIE Lab rather than by eye —
// hex codes that look different in a list can be indistinguishable as a
// twenty-pixel marker over painted terrain.
//
//     node scripts/check-colours.mjs [minimum]
//
// The default minimum is 22 ΔE, which is roughly "obviously a different
// colour" at marker size. Faction colours are compared within a setting and
// within a level: alliances only clash with alliances.
import { SETTINGS } from '../src/data/settings.js';

const MIN = Number(process.argv[2] ?? 22);

const srgb = v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function lab(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => srgb(parseInt(h.slice(i, i + 2), 16) / 255));
  // sRGB -> XYZ (D65) -> Lab
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.9505;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.089;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const dE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));

let worst = 0;
let clashes = 0;
for (const setting of Object.values(SETTINGS)) {
  for (const [level, list] of Object.entries(setting.levels)) {
    const seen = [];
    const pairs = [];
    for (const f of list) {
      for (const o of seen) {
        const d = dE(f.color, o.color);
        if (d < MIN) pairs.push({ d, a: o, b: f });
      }
      seen.push(f);
    }
    if (!pairs.length) continue;
    clashes += pairs.length;
    console.log(`\n${setting.name} — ${level}`);
    for (const { d, a, b } of pairs.sort((x, y) => x.d - y.d)) {
      worst = Math.max(worst, MIN - d);
      console.log(`  ΔE ${d.toFixed(1).padStart(5)}  ${a.name} ${a.color}  vs  ${b.name} ${b.color}`);
    }
  }
}
if (!clashes) console.log(`no faction colours closer than ΔE ${MIN}`);
else console.log(`\n${clashes} pair(s) below ΔE ${MIN}`);
process.exit(clashes ? 1 : 0);
