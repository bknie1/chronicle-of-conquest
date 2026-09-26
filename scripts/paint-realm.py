"""Paint a realm that nobody has ever mapped, in the manner of the ones that have.

Azyr, the Eightpoints and Blight City have no published cartography, so the
app draws them. The earlier drawings were honest diagrams — starfields, shards,
tunnels — and honest is not the same as belonging. This paints them the way the
Everspring Swathe and the Great Parch are painted: a relief map lit from the
north-west, water that shallows towards its coasts, ridges inked where the
ground is steep, forest mottled onto the lowlands, and a coastline you can
follow with a finger.

Each realm is composed on purpose, not from a seed. Azyr is an inland sea
ringed by fair country, the warm paradise its people came down from. The
Eightpoints is that idea inverted: an eight-armed landmass of ash and slag in a
sea that is not water, with the Varanspire on the only mountain. Blight City is
a cutaway of rock with the warrens hollowed out of it, lit from below.

The points come from the map module, and the composition puts ground under
each one, so art and data are one run and cannot disagree.

    python scripts/paint-realm.py azyr|eightpoints|blight-city
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 2600, 1700


# --- noise ---------------------------------------------------------------

def fbm(rng, shape, octaves=6, base=8, gain=0.52, lacunarity=2.0):
    """Fractal noise in [0,1]: smooth random grids, upsampled and summed."""
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp, freq, total = 1.0, base, 0.0
    for _ in range(octaves):
        gh, gw = max(2, int(h / w * freq)), max(2, int(freq))
        grid = rng.random((gh, gw)).astype(np.float32)
        out += amp * cv2.resize(grid, (w, h), interpolation=cv2.INTER_CUBIC)
        total += amp
        amp *= gain
        freq *= lacunarity
    out /= total
    return (out - out.min()) / (np.ptp(out) + 1e-6)


def ridged(rng, shape, octaves=6, base=10):
    """Noise folded about its middle: sharp crests, the way ranges are drawn."""
    n = fbm(rng, shape, octaves=octaves, base=base)
    r = 1 - np.abs(n - 0.5) * 2
    return (r - r.min()) / (np.ptp(r) + 1e-6)


def coastify(field, rng, big=90, small=22):
    """A coastline is fractal: a large wander so bays and capes appear, then a
    fine one so the edge crumbles into headlands and skerries."""
    field = warp(field, rng, strength=big, scale=4)
    field = warp(field, rng, strength=small, scale=24)
    return field


def relief(land_mask, rng, ranges=None, sea=0.36, rise=0.22, grain=0.12, crest_amp=0.5, floor_fall=140.0):
    """Height from a coastline. Ground rises gently with distance from the
    shore, fractal grain sits on top, ranges are added where asked. The sea
    floor falls away from the coast. Because the coast is the mask exactly,
    nothing about the blobs that drew the mask survives into the shading —
    which is what makes the difference between country and bubble-wrap."""
    h, w = land_mask.shape
    land = land_mask.astype(np.uint8)
    inland = cv2.distanceTransform(land, cv2.DIST_L2, 5)
    inland = np.sqrt(inland / (inland.max() + 1e-6))
    offshore = cv2.distanceTransform(1 - land, cv2.DIST_L2, 5)
    detail = fbm(rng, (h, w), octaves=7, base=6)
    fine = fbm(rng, (h, w), octaves=5, base=40)
    height = np.where(land_mask,
                      sea + 0.01 + inland * rise + (detail - 0.5) * grain + (fine - 0.5) * 0.03,
                      sea - 0.02 - np.clip(offshore / floor_fall, 0, 1) * 0.3 + (detail - 0.5) * 0.02)
    if ranges is not None:
        crest = ridged(rng, (h, w), octaves=6, base=9)
        height += np.where(land_mask, ranges * crest * crest_amp, 0)
    return np.clip(height, 0, 1).astype(np.float32)


def rivers(height, sea, rng, count=12, min_start=0.62, max_len=900):
    """Trace water downhill from high ground until it reaches the sea. Each
    river is a polyline in pixels; the painter draws them. A river that stalls
    in a hollow is abandoned rather than drawn as a puddle."""
    h, w = height.shape
    smooth = cv2.GaussianBlur(height, (0, 0), 6)
    gy, gx = np.gradient(smooth)
    out = []
    tries = 0
    while len(out) < count and tries < count * 40:
        tries += 1
        x, y = rng.integers(40, w - 40), rng.integers(40, h - 40)
        if smooth[y, x] < min_start:
            continue
        pts = [(float(x), float(y))]
        px, py = float(x), float(y)
        for _ in range(max_len):
            ix, iy = int(px), int(py)
            if not (2 <= ix < w - 2 and 2 <= iy < h - 2) or height[iy, ix] <= sea:
                break
            dx, dy = -gx[iy, ix], -gy[iy, ix]
            n = np.hypot(dx, dy) + 1e-6
            # A little wander, so it meanders rather than ruling a line.
            ang = np.arctan2(dy, dx) + rng.normal(0, 0.28)
            px += np.cos(ang) * 2.2
            py += np.sin(ang) * 2.2
            pts.append((px, py))
        else:
            continue
        if len(pts) > 90 and height[int(py), int(px)] <= sea:
            out.append(pts)
    return out


def tip_along(land, cx, cy, angle, back=48):
    """Walk out from the centre along a bearing and return the last land
    pixel before the coast, pulled back a little so it sits on the arm."""
    h, w = land.shape
    last = None
    for r in range(0, max(h, w)):
        x, y = int(cx + np.cos(angle) * r), int(cy + np.sin(angle) * r)
        if not (0 <= x < w and 0 <= y < h):
            break
        if land[y, x]:
            last = r
        elif last is not None and r - last > 60:
            break
    r = max(0, (last or 0) - back)
    return int(cx + np.cos(angle) * r), int(cy + np.sin(angle) * r)


def snap_to_land(height, sea, coords, radius=220):
    """Move each point onto the nearest ground rather than flattening the
    ground under it — a stamped disc is the one thing a coastline never has."""
    land = height > sea
    out = {}
    for pid, (x, y) in coords.items():
        x, y = int(x), int(y)
        if land[y, x]:
            out[pid] = (x, y); continue
        best = None
        for r in range(4, radius, 4):
            ys, xs = np.mgrid[max(0, y - r):min(H, y + r + 1), max(0, x - r):min(W, x + r + 1)]
            m = land[ys, xs]
            if m.any():
                d = np.hypot(xs - x, ys - y); d[~m] = 1e9
                i = np.unravel_index(np.argmin(d), d.shape)
                best = (int(xs[i]), int(ys[i])); break
        if best is None:
            raise SystemExit(f'{pid} has no land within {radius}px')
        out[pid] = best
    return out


def warp(field, rng, strength=60, scale=6):
    """Push a field around by a smooth vector noise, so edges wander like coast."""
    h, w = field.shape
    dx = (fbm(rng, (h, w), octaves=3, base=scale) - 0.5) * 2 * strength
    dy = (fbm(rng, (h, w), octaves=3, base=scale) - 0.5) * 2 * strength
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return cv2.remap(field, xx + dx, yy + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def blob(shape, cx, cy, rx, ry, power=1.0):
    """A soft shape that is 1 at the centre and falls to 0 at its edge."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.hypot((xx - cx) / rx, (yy - cy) / ry)
    return np.clip(1 - d, 0, 1) ** power


def star(shape, cx, cy, r_out, r_in, points=8, rot=0.0):
    """An n-pointed star, as a soft field: the Allpoints' own shape."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ang = np.arctan2(yy - cy, xx - cx) - rot
    dist = np.hypot(xx - cx, yy - cy)
    # Radius of the star's edge in this direction: blend between the tips and the notches.
    t = (np.cos(ang * points) + 1) / 2
    edge = r_in + (r_out - r_in) * t ** 1.6
    return np.clip(1 - dist / edge, 0, 1)


# --- the painter -----------------------------------------------------------

def hillshade(height, az=315, alt=42, scale=340.0):
    gy, gx = np.gradient(height * scale)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    a, z = np.radians(az), np.radians(alt)
    shade = np.sin(z) * np.cos(slope) + np.cos(z) * np.sin(slope) * np.cos(a - aspect)
    return np.clip(shade, 0, 1), np.hypot(gx, gy)


def ramp(t, stops):
    """Colour along a list of (position, RGB) stops; t in [0,1]."""
    t = np.clip(t, 0, 1)
    out = np.zeros((*t.shape, 3), np.float32)
    pos = [p for p, _ in stops]
    cols = [np.array(c, np.float32) for _, c in stops]
    for i in range(len(stops) - 1):
        m = (t >= pos[i]) & (t <= pos[i + 1])
        f = ((t - pos[i]) / max(pos[i + 1] - pos[i], 1e-6))[..., None]
        out[m] = (cols[i] * (1 - f) + cols[i + 1] * f)[m]
    out[t < pos[0]] = cols[0]
    out[t > pos[-1]] = cols[-1]
    return out


def paint(height, sea, palette, rng, *, forest=None, glow=None, ink=(30, 24, 20), shore_km=60, streams=None):
    """Turn a heightmap into a plate. Colours are RGB in the palette; BGR out."""
    h, w = height.shape
    land = height > sea
    shade, slope = hillshade(height)

    # --- water: deeper is darker, and a pale shelf runs along every coast.
    dist_to_land = cv2.distanceTransform((~land).astype(np.uint8), cv2.DIST_L2, 5)
    shelf = np.exp(-dist_to_land / shore_km)
    depth = np.clip((sea - height) / max(sea, 1e-6), 0, 1)
    water = ramp(depth, palette['water'])
    water = water * (1 - shelf[..., None] * 0.55) + np.array(palette['shelf'], np.float32) * shelf[..., None] * 0.55
    # A little movement in it.
    ripple = fbm(rng, (h, w), octaves=4, base=palette.get('water_scale', 60)) - 0.5
    water += ripple[..., None] * palette.get('water_grain', 7)
    if 'water_streak' in palette:
        # The Realm of Chaos does not hold still: long streaks torn across it.
        st = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (61, 5), 0)
        st = (st - st.mean()) / (st.std() + 1e-6)
        water += st[..., None] * np.array(palette['water_streak'], np.float32)

    # --- land: by elevation, then lit.
    elev = np.clip((height - sea) / max(1 - sea, 1e-6), 0, 1)
    ground = ramp(elev, palette['land'])
    # Country is not one colour. A second ramp — drier, or lusher — takes over
    # in patches the size of a province, so the land reads as regions.
    if 'land2' in palette:
        patch = np.clip((fbm(rng, (h, w), octaves=4, base=7) - 0.42) * 3.2, 0, 1)[..., None]
        ground = ground * (1 - patch) + ramp(elev, palette['land2']) * patch
    # And the hue drifts a little on top of that, as paint does.
    drift = fbm(rng, (h, w), octaves=3, base=5) - 0.5
    ground += drift[..., None] * np.array(palette.get('drift', (18, 14, 8)), np.float32)
    # Brushwork: a fine streaked grain, so it is a painting and not a render.
    streak = rng.normal(0, 1, (h, w)).astype(np.float32)
    streak = cv2.GaussianBlur(streak, (13, 3), 0)
    streak = (streak - streak.mean()) / (streak.std() + 1e-6)
    ground *= (1 + streak[..., None] * 0.045)
    if forest is not None:
        f = np.clip(forest, 0, 1)[..., None]
        ground = ground * (1 - f * 0.85) + np.array(palette['forest'], np.float32) * f * 0.85
    if palette.get('rubble'):
        # Broken ground: a hard fine grain, and dark pools where it collects.
        grit = fbm(rng, (h, w), octaves=2, base=160)
        ground *= (0.88 + grit[..., None] * 0.24)
        pools = np.clip(fbm(rng, (h, w), octaves=4, base=22) - 0.68, 0, 1) * 4
        ground = ground * (1 - pools[..., None] * 0.6) + np.array(palette['rubble'], np.float32) * pools[..., None] * 0.6
    # Steep ground is rock, and rock is darker and greyer.
    rock = np.clip((slope - 0.5) / 1.4, 0, 1)[..., None]
    ground = ground * (1 - rock * 0.7) + np.array(palette['rock'], np.float32) * rock * 0.7
    # High peaks catch snow, or ash, or whatever the realm keeps up there.
    peak = np.clip((elev - palette.get('peak_from', 0.72)) / 0.2, 0, 1)[..., None]
    ground = ground * (1 - peak * 0.7) + np.array(palette['peak'], np.float32) * peak * 0.7
    # Lit from the north-west.
    lit = 0.42 + 0.92 * shade
    ground *= lit[..., None]

    img = np.where(land[..., None], ground, water)

    # --- bathymetry: faint rings off the coast, as the plates draw them.
    wobble = (fbm(rng, (h, w), octaves=3, base=30) - 0.5) * 16
    for d in (30, 70):
        ring = np.exp(-((dist_to_land + wobble - d) ** 2) / 40.0) * (~land)
        img = img * (1 - ring[..., None] * 0.05) + np.array(palette['shelf'], np.float32) * ring[..., None] * 0.05
    if palette.get('strata'):
        # Bedding planes and cracks through solid stone.
        bed = fbm(rng, (h, w), octaves=2, base=3)
        lines = np.abs(np.sin(bed * 60 + fbm(rng, (h, w), octaves=4, base=20) * 6)) ** 12
        crack = np.clip(ridged(rng, (h, w), octaves=5, base=12) - 0.86, 0, 1) * 7
        stone = (lines * 0.35 + crack) * (~land)
        img = img * (1 - np.clip(stone, 0, 1)[..., None] * 0.5)

    # --- foam: a pale thread on the water side of every shore.
    foam = np.clip(1 - dist_to_land / 7.0, 0, 1) * (~land)
    img = img * (1 - foam[..., None] * 0.35) + np.array(palette['shelf'], np.float32) * foam[..., None] * 0.35

    # --- coastline ink: a fine dark line, and a soft one under it.
    edge = cv2.morphologyEx(land.astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)).astype(np.float32)
    soft = cv2.GaussianBlur(edge, (0, 0), 2.2)
    img = img * (1 - soft[..., None] * 0.35) + np.array(ink, np.float32) * soft[..., None] * 0.35
    img = img * (1 - edge[..., None] * 0.55) + np.array(ink, np.float32) * edge[..., None] * 0.55

    # --- ridge lines where the ground is really steep.
    ridge = np.clip((slope - 1.6) / 1.6, 0, 1) * land
    ridge = cv2.GaussianBlur(ridge.astype(np.float32), (0, 0), 0.8)
    img = img * (1 - ridge[..., None] * 0.45) + np.array(ink, np.float32) * ridge[..., None] * 0.45

    if streams:
        riv = np.zeros((h, w), np.float32)
        for pts in streams:
            cv2.polylines(riv, [np.array(pts, np.int32)], False, 1.0, palette.get('river_width', 2), cv2.LINE_AA)
        riv = cv2.GaussianBlur(riv, (0, 0), 0.7) * land
        col = np.array(palette.get('river', palette['water'][1][1]), np.float32)
        if palette.get('river_glow'):
            halo = cv2.GaussianBlur(riv, (0, 0), 9) * palette['river_glow']
            img += halo[..., None] * col
        img = img * (1 - riv[..., None] * 0.85) + col * riv[..., None] * 0.85

    # --- the realm's own light: a tint and a lift, if it has one.
    if 'tint' in palette:
        t, amt = np.array(palette['tint'], np.float32), palette.get('tint_amount', 0.08)
        img = img * (1 - amt) + t * amt
    if palette.get('luminance'):
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        halo = np.exp(-(((xx - w / 2) / (w * 0.5)) ** 2 + ((yy - h / 2) / (h * 0.5)) ** 2))
        img *= (1 + halo[..., None] * palette['luminance'])

    if glow is not None:
        for (gx, gy, radius, colour, strength) in glow:
            g = np.zeros((h, w), np.float32)
            cv2.circle(g, (int(gx), int(gy)), int(radius), 1.0, -1)
            g = cv2.GaussianBlur(g, (0, 0), radius * 0.6)
            img += g[..., None] * np.array(colour, np.float32) * strength

    # --- the paper: a fine grain, and the edges fall away a touch.
    img += rng.normal(0, 2.4, (h, w, 1))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    vig = 1 - 0.14 * np.clip(np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)) - 0.55, 0, 1)
    img *= vig[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)[..., ::-1]   # RGB -> BGR


# --- reading the module ----------------------------------------------------

def points_of(map_id):
    js = f"import('./src/data/maps/{map_id}.js').then(m=>console.log(JSON.stringify(m.default.nodes)))"
    out = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def write_points(map_id, coords):
    """Set each point's x,y in the module — the only field the art decides."""
    path = os.path.join(ROOT, 'src', 'data', 'maps', f'{map_id}.js')
    src = open(path, encoding='utf8').read()
    import re
    for pid, (x, y) in coords.items():
        # A node block, not the map's own id line — the realm-level point can
        # share the map's name, and matching the map's line ate the first node.
        m = re.search(r'(\{\s*"id":\s*"%s"[^{}]*?)(\})' % re.escape(pid), src, re.S)
        if not m:
            raise SystemExit(f'{pid} is not in {map_id}.js')
        block = re.sub(r'"x":\s*[\d.]+', f'"x": {int(x)}', m.group(1))
        block = re.sub(r'"y":\s*[\d.]+', f'"y": {int(y)}', block)
        src = src[:m.start(1)] + block + src[m.end(1):]
    src = re.sub(r'"width":\s*\d+', f'"width": {W}', src, count=1)
    src = re.sub(r'"height":\s*\d+', f'"height": {H}', src, count=1)
    open(path, 'w', encoding='utf8').write(src)


def check_ground(height, sea, coords, want_land=True):
    bad = [pid for pid, (x, y) in coords.items() if (height[int(y), int(x)] > sea) != want_land]
    if bad:
        raise SystemExit('points off the ground: ' + ' '.join(bad))


# --- Azyr --------------------------------------------------------------------
# A warm sea held in the arms of a fair country: the Mediterranean of the
# heavens. Sigmaron rises on the northern shore, Azyrheim on the great bay to
# the west, and the lesser holds ring the water.

AZYR = {
    'water': [(0, (18, 96, 128)), (0.35, (28, 128, 158)), (1, (12, 66, 98))],
    'shelf': (150, 214, 214),
    'land': [(0, (226, 212, 172)), (0.06, (176, 190, 122)), (0.28, (128, 158, 96)),
             (0.55, (168, 160, 112)), (0.8, (200, 190, 162)), (1, (238, 236, 228))],
    # The drier country: gold hills, olive scrub, pale stone.
    'land2': [(0, (232, 216, 170)), (0.06, (206, 190, 130)), (0.3, (188, 170, 108)),
              (0.55, (178, 158, 108)), (0.8, (204, 192, 160)), (1, (238, 236, 228))],
    'forest': (74, 112, 68),
    'rock': (148, 146, 138),
    'peak': (244, 244, 240),
    'peak_from': 0.7,
    'drift': (16, 12, 6),
    # The heavens: a warm, pale light on everything, brightest at the heart.
    'tint': (255, 244, 214),
    'tint_amount': 0.10,
    'luminance': 0.10,
}


def necklace(shape, rng, cx, cy, rx, ry, n=44, size=(150, 300), skip=(), spread=0.55):
    """Land built as a string of overlapping blobs around an ellipse. Each bead
    is a different size and sits a little off the line, so the coast that comes
    out has bays and capes rather than the ellipse's own smooth edge. `skip` is
    a list of (t0, t1) arcs, in turns, left open for straits."""
    field = np.zeros(shape, np.float32)
    for k in range(n):
        t = k / n
        if any(a <= t <= b for a, b in skip):
            continue
        a = t * 2 * np.pi
        r = rng.uniform(*size)
        off = rng.uniform(-spread, spread) * r
        x = cx + np.cos(a) * (rx + off)
        y = cy + np.sin(a) * (ry + off)
        field = np.maximum(field, blob(shape, x, y, r * rng.uniform(0.8, 1.3), r * rng.uniform(0.7, 1.1), power=0.75))
    return field


def compose_azyr(rng):
    shape = (H, W)
    cx, cy = 1300, 880
    # The country wraps the sea: an inner string of beads makes the shore, an
    # outer one gives it depth. The strait to the ocean is a gap in the west.
    shore = necklace(shape, rng, cx, cy, 880, 480, n=48, size=(170, 300), skip=((0.46, 0.55),))
    hinter = necklace(shape, rng, cx, cy, 1150, 720, n=40, size=(220, 380), skip=((0.44, 0.57),))
    field = np.maximum(shore, hinter)
    # The boot: a chain of beads hanging from the north shore into the sea.
    for k, (bx, by, br) in enumerate([(1300, 560, 150), (1290, 700, 120), (1310, 840, 100), (1330, 960, 75)]):
        field = np.maximum(field, blob(shape, bx, by, br, br * 1.2, power=0.9) * (1 - 0.06 * k))
    # The archipelago in the eastern water.
    for _ in range(14):
        x, y = rng.uniform(1560, 1900), rng.uniform(720, 980)
        r = rng.uniform(22, 60)
        field = np.maximum(field, blob(shape, x, y, r, r * 0.8, power=1.2) * 0.9)
    # Crumble the edge with noise before the warp, so the coast is ragged at
    # every scale and not just wavy.
    field += (fbm(rng, shape, octaves=6, base=18) - 0.5) * 0.4
    field = coastify(field, rng, big=60, small=30)
    land = field > 0.42

    ranges = np.maximum.reduce([
        blob(shape, 1200, 300, 900, 200, power=1.6),     # the northern wall, Sigmaron's mountains
        blob(shape, 2250, 700, 300, 420, power=1.6),     # Starhold's crags in the east
        blob(shape, 330, 700, 220, 380, power=1.6),      # the western heights behind Azyrheim
        blob(shape, 1450, 1480, 520, 160, power=1.7),    # the southern hills
        blob(shape, 1295, 700, 70, 220, power=1.6),      # the boot's own spine
    ])
    ranges = cv2.GaussianBlur(ranges, (0, 0), 18)
    sea = 0.36
    height = relief(land, rng, ranges=ranges, sea=sea, rise=0.2, grain=0.1, crest_amp=0.5)
    height = cv2.GaussianBlur(height, (0, 0), 1.2)

    elev = np.clip((height - sea) / (1 - sea), 0, 1)
    forest = np.clip(fbm(rng, shape, octaves=5, base=11) - 0.5, 0, 1) * 2.8
    forest *= np.clip(1 - np.abs(elev - 0.16) / 0.16, 0, 1)

    coords = snap_to_land(height, sea, {
        'sigmaron': (1300, 520),           # the citadel at the root of the boot, on the north shore
        'sigmarabulum': (1200, 290),       # the ring of forges, up in the peaks above it
        'azyrheim': (520, 700),            # the great city on the western shore, above the strait
        'highheim': (1800, 380),           # the high country to the north-east
        'celestial-forges': (2180, 640),   # under Starhold's crags
        'starhold': (2330, 1000),          # the eastern hold
        'gladitorium': (1720, 840),        # on the archipelago
        'azyrite-watch': (1330, 960),      # the tip of the boot, watching the south
        'gates-of-azyr': (1250, 1400),     # where the realmgates open, on the southern shore
        'skydock': (480, 1160),            # the harbour on the strait
    })
    return height, sea, forest, None, coords, rivers(height, sea, rng, count=14)


# --- The Eightpoints -----------------------------------------------------
# The Allpoints, as the shape says: an eight-armed landmass of ash and slag in
# a sea that is not water, the Varanspire on the only true mountain, and an
# arcway at the tip of every arm.

EIGHTPOINTS = {
    'water': [(0, (64, 14, 26)), (0.4, (34, 8, 18)), (1, (12, 4, 10))],
    'shelf': (130, 48, 36),
    'land': [(0, (78, 60, 52)), (0.12, (66, 52, 46)), (0.35, (98, 66, 48)),
             (0.6, (124, 92, 66)), (0.85, (70, 48, 44)), (1, (44, 30, 30))],
    'forest': (52, 40, 36),
    'rock': (56, 44, 42),
    'peak': (36, 22, 24),
    'peak_from': 0.76,
    'drift': (22, 10, 6),
    'river': (255, 120, 40),      # lava, not water
    'river_width': 3,
    'river_glow': 0.9,
    'water_grain': 12,
    'water_scale': 12,
    'water_streak': (12, 3, 8),
    'tint': (70, 20, 30),
    'tint_amount': 0.06,
}


def compose_eightpoints(rng):
    shape = (H, W)
    cx, cy = 1300, 850
    # The Allpoints as the name says: eight arms out from the Varanspire, with
    # the coast crumbling off every one of them into a sea that is not water.
    field = star(shape, cx, cy, r_out=860, r_in=470, points=8, rot=np.pi / 8) ** 0.55
    # Slag banks and broken ground off the arms, and skerries beyond them.
    for _ in range(60):
        a = rng.uniform(0, 2 * np.pi); d = rng.uniform(420, 900)
        r = rng.uniform(40, 130)
        field = np.maximum(field, blob(shape, cx + np.cos(a) * d, cy + np.sin(a) * d, r, r * 0.8, power=0.9) * rng.uniform(0.7, 1.0))
    field += (fbm(rng, shape, octaves=6, base=16) - 0.5) * 0.5
    field = coastify(field, rng, big=70, small=34)
    land = field > 0.42

    # The Varanspire's mountain at the heart, and a spine down each arm.
    ranges = blob(shape, cx, cy, 260, 260, power=1.1) * 1.4
    for k in range(8):
        a = np.pi / 8 + k * np.pi / 4
        for t in np.linspace(0.25, 0.8, 8):
            ranges = np.maximum(ranges, blob(shape, cx + np.cos(a) * 800 * t, cy + np.sin(a) * 800 * t, 90, 90, power=1.4) * (0.9 - 0.4 * t))
    ranges = cv2.GaussianBlur(ranges, (0, 0), 14)
    sea = 0.36
    height = relief(land, rng, ranges=ranges, sea=sea, rise=0.16, grain=0.12, crest_amp=0.55)
    height = cv2.GaussianBlur(height, (0, 0), 1.2)

    # Slag fields rather than forest: the dark mottle on the low ground.
    elev = np.clip((height - sea) / (1 - sea), 0, 1)
    forest = np.clip(fbm(rng, shape, octaves=5, base=14) - 0.48, 0, 1) * 2.4 * np.clip(1 - elev / 0.35, 0, 1)

    coords = {'varanspire': (cx, cy)}
    arcways = ['arcway-fire', 'arcway-life', 'arcway-beasts', 'arcway-death',
               'arcway-metal', 'arcway-shadow', 'arcway-light', 'arcway-heavens']
    # Fire at the top, then round the compass, so the star reads as a rose.
    for k, pid in enumerate(arcways):
        a = -np.pi / 2 + k * np.pi / 4
        coords[pid] = tip_along(land, cx, cy, a)
    coords['carngrad'] = (cx - 330, cy + 130)
    coords['flayhaunt'] = (cx + 340, cy - 100)
    coords['skarrgrim'] = (cx - 70, cy + 360)
    coords = snap_to_land(height, sea, coords)

    glow = [(x, y, 46, (255, 120, 50), 0.4) for pid, (x, y) in coords.items() if pid.startswith('arcway') and pid != 'arcway-heavens']
    glow.append((coords['arcway-heavens'][0], coords['arcway-heavens'][1], 40, (180, 200, 255), 0.12))
    glow.append((cx, cy, 90, (255, 90, 40), 0.3))
    # Lava runs down from the Varanspire and the spines.
    lava = rivers(height, sea, rng, count=10, min_start=0.6)
    return height, sea, forest, glow, coords, lava


# --- Blight City ------------------------------------------------------------
# Not a country at all: a cutaway of rock with the warrens gnawed out of it.
# The "sea" is stone, the "land" is cavern floor, and the light is the sick
# green of warpstone rather than a sun.

BLIGHT_CITY = {
    'water': [(0, (52, 46, 48)), (0.5, (36, 32, 34)), (1, (22, 18, 20))],
    'shelf': (86, 78, 70),
    'land': [(0, (92, 96, 60)), (0.2, (110, 118, 68)), (0.5, (132, 128, 84)),
             (0.8, (108, 96, 70)), (1, (80, 70, 58))],
    'forest': (70, 92, 46),
    'rock': (66, 60, 54),
    'peak': (60, 52, 48),
    'peak_from': 0.85,
    'drift': (10, 14, 4),
    'river': (120, 200, 80),      # warpstone run-off
    'river_width': 3,
    'river_glow': 0.5,
    'strata': True,
    'rubble': (30, 36, 22),
    'water_grain': 10,
    'water_scale': 30,
    'tint': (40, 60, 30),
    'tint_amount': 0.08,
}


def compose_blight_city(rng):
    shape = (H, W)
    chambers = {
        'blight-city': (1300, 850, 520, 340),
        'skryre-forges': (1920, 500, 300, 210),
        'pestilens-pits': (2020, 1260, 300, 220),
        'moulder-fleshpits': (600, 1280, 300, 210),
        'eshin-shadows': (520, 480, 280, 200),
        'verminus-barracks': (1300, 1480, 320, 170),
    }
    tunnels = [('blight-city', 'skryre-forges'), ('blight-city', 'pestilens-pits'),
               ('blight-city', 'moulder-fleshpits'), ('blight-city', 'eshin-shadows'),
               ('blight-city', 'verminus-barracks'), ('skryre-forges', 'pestilens-pits'),
               ('moulder-fleshpits', 'eshin-shadows'), ('moulder-fleshpits', 'verminus-barracks'),
               ('verminus-barracks', 'pestilens-pits'), ('eshin-shadows', 'skryre-forges')]
    gnawholes = [('skryre-forges', (2480, 250)), ('pestilens-pits', (2480, 1520)),
                 ('moulder-fleshpits', (130, 1530)), ('eshin-shadows', (120, 230))]
    at = {k: (v[0], v[1]) for k, v in chambers.items()}

    def bore(p, q, width, spread=90):
        p, q = np.array(p, float), np.array(q, float)
        n = 40
        t = np.linspace(0, 1, n)[:, None]
        line = p + (q - p) * t
        normal = np.array([-(q - p)[1], (q - p)[0]]); normal /= np.linalg.norm(normal) + 1e-6
        drift = np.cumsum(rng.normal(0, spread / 8, n)); drift -= np.linspace(drift[0], drift[-1], n)
        pts = (line + normal * drift[:, None]).astype(np.int32)
        m = np.zeros(shape, np.float32)
        cv2.polylines(m, [pts], False, 1.0, width)
        return cv2.GaussianBlur(m, (0, 0), width * 0.3)

    field = np.zeros(shape, np.float32)
    for _, (x, y, rx, ry) in chambers.items():
        # A chamber is a cluster of hollows, not one oval.
        for _ in range(14):
            field = np.maximum(field, blob(shape, x + rng.normal(0, rx * 0.4), y + rng.normal(0, ry * 0.4),
                                           rx * rng.uniform(0.3, 0.6), ry * rng.uniform(0.3, 0.6), power=0.8))
    for a, b in tunnels:
        field = np.maximum(field, bore(at[a], at[b], int(rng.integers(40, 64))))
    for a, g in gnawholes:
        field = np.maximum(field, bore(at[a], g, 50))
        field = np.maximum(field, blob(shape, g[0], g[1], 120, 100, power=0.8))
    for _ in range(34):
        a = list(at.values())[int(rng.integers(0, len(at)))]
        ang = rng.uniform(0, 2 * np.pi); L = rng.uniform(140, 460)
        q = (a[0] + np.cos(ang) * L, a[1] + np.sin(ang) * L)
        if 60 < q[0] < W - 60 and 60 < q[1] < H - 60:
            field = np.maximum(field, bore(a, q, int(rng.integers(16, 32))) * 0.9)
    field += (fbm(rng, shape, octaves=6, base=20) - 0.5) * 0.4
    field = coastify(field, rng, big=26, small=22)
    land = field > 0.45   # the floor is the land; the stone is the sea

    sea = 0.4
    # Cavern floors are flat; the "relief" is the walls, so the rise is small
    # and the stone falls away steeply from the wall.
    height = relief(land, rng, ranges=None, sea=sea, rise=0.12, grain=0.16, floor_fall=60.0)
    height = cv2.GaussianBlur(height, (0, 0), 1.0)

    forest = np.clip(fbm(rng, shape, octaves=5, base=18) - 0.48, 0, 1) * 2.4   # fungus and filth
    coords = snap_to_land(height, sea, {k: at[k] for k in chambers})
    glow = [(g[0], g[1], 80, (70, 210, 90), 0.5) for _, g in gnawholes]
    glow.append((1300, 850, 150, (90, 170, 70), 0.2))
    seep = rivers(height, sea, rng, count=6, min_start=0.5, max_len=500)
    return height, sea, forest, glow, coords, seep


REALMS = {
    'azyr': (compose_azyr, AZYR, 5),
    'eightpoints': (compose_eightpoints, EIGHTPOINTS, 8),
    'blight-city': (compose_blight_city, BLIGHT_CITY, 13),
}


def main(realm):
    compose, palette, seed = REALMS[realm]
    rng = np.random.default_rng(seed)
    result = compose(rng)
    height, sea, forest, glow, coords = result[:5]
    streams = result[5] if len(result) > 5 else None
    check_ground(height, sea, coords)
    img = paint(height, sea, palette, rng, forest=forest, glow=glow, streams=streams)
    out = os.path.join(ROOT, 'public', 'maps', 'realms', f'{realm}.jpg')
    cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    known = {n['id'] for n in points_of(realm)}
    missing = known - set(coords)
    if missing:
        raise SystemExit(f'{realm}: no ground composed for ' + ' '.join(sorted(missing)))
    write_points(realm, coords)
    print(f'painted {out} {W}x{H}; placed {len(coords)} points')


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in REALMS:
        raise SystemExit(__doc__)
    main(sys.argv[1])
