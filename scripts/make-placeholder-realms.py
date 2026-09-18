"""Generate placeholder realm maps for the Mortal Realms until real art exists.

For each realm this draws a stylised landmass in the realm's colours and places
its named locations on land, writing:
  public/maps/realms/<id>.jpg      the image
  src/data/maps/<id>.js            the map definition (points in image pixels)

Re-running regenerates both; positions are deterministic per realm. Once a realm
has real art, drop it from REALMS here and place its points in the map editor.
Aqshy already uses real art (see src/data/maps/aqshy.js), so it isn't here.
Regenerating overwrites any edits made in the map editor to these realms.

    python scripts/make-placeholder-realms.py
"""
import json
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1600, 1100
FONT = 'C:/Windows/Fonts/georgiab.ttf' if os.name == 'nt' else 'DejaVuSerif-Bold.ttf'
FONT_ITALIC = 'C:/Windows/Fonts/georgiai.ttf' if os.name == 'nt' else 'DejaVuSerif-Italic.ttf'

# id, title, sea, land low, land high, seed, [(point id, name)]
REALMS = [
    ('ghyran', 'Ghyran · The Realm of Life', '#1d3a30', '#55803c', '#c8d98c', 11, [
        ('hammerhal-ghyra', 'Hammerhal Ghyra'), ('athelwyrd', 'The Athelwyrd'), ('verdia', 'Verdia'),
        ('thyria', 'Thyria'), ('jadewound', 'The Jadewound'), ('everdusk', 'Everdusk'),
        ('living-city', 'The Living City'), ('blight-city', 'Blight City'), ('gnarlwood', 'Gnarlwood'),
    ]),
    ('ghur', 'Ghur · The Realm of Beasts', '#33261a', '#9a6a37', '#e3c48e', 23, [
        ('excelsis', 'Excelsis'), ('thondia', 'Thondia'), ('izalend', 'Izalend'), ('beastgrave', 'Beastgrave'),
        ('gallet', 'Gallet'), ('andtor', 'Andtor'), ('coast-of-tusks', 'Coast of Tusks'), ('maw-of-ghur', 'The Maw of Ghur'),
    ]),
    ('shyish', 'Shyish · The Realm of Death', '#18141f', '#5f5872', '#c6bfd4', 37, [
        ('nagashizzar', 'Nagashizzar'), ('glymmsforge', 'Glymmsforge'), ('prosperis', 'Prosperis'),
        ('stygxx', 'Stygxx'), ('carstinia', 'Carstinia'), ('ossia', 'Ossia'), ('shyish-nadir', 'The Shyish Nadir'),
        ('sadmoor', 'The Sadmoor'),
    ]),
    ('chamon', 'Chamon · The Realm of Metal', '#2a2317', '#9c7f34', '#f1dc8e', 41, [
        ('barak-nar', 'Barak-Nar'), ('barak-zon', 'Barak-Zon'), ('barak-thryng', 'Barak-Thryng'),
        ('spiral-crux', 'The Spiral Crux'), ('elixia', 'Elixia'), ('argentine', 'Argentine'), ('molten-vale', 'The Molten Vale'),
    ]),
    ('ulgu', 'Ulgu · The Realm of Shadow', '#0e1317', '#3b4750', '#8f9ba4', 53, [
        ('hagg-nar', 'Hagg Nar'), ('barak-mhornar', 'Barak-Mhornar'), ('misthavn', 'Misthåvn'),
        ('mirrorshade', 'Mirrorshade Isles'), ('ashen-veil', 'The Ashen Veil'), ('dolorous-fens', 'Dolorous Fens'),
        ('umbral-reach', 'The Umbral Reach'),
    ]),
    ('hysh', 'Hysh · The Realm of Light', '#8fa9bd', '#e6dcc0', '#fffaf0', 67, [
        ('xintil', 'Xintil'), ('ymetrica', 'Ymetrica'), ('iliatha', 'Iliatha'), ('syar', 'Syar'),
        ('zaitrec', 'Zaitrec'), ('alumnia', 'Alumnia'), ('mirrorlight-peaks', 'Mirrorlight Peaks'),
    ]),
    ('azyr', 'Azyr · The Celestial Realm', '#0b1433', '#3d5ca3', '#b3c9f5', 71, [
        ('azyrheim', 'Azyrheim'), ('sigmaron', 'Sigmaron'), ('gates-of-azyr', 'The Gates of Azyr'),
        ('celestial-forges', 'The Celestial Forges'), ('azyrite-watch', 'The Azyrite Watch'),
    ]),
]

# The Eightpoints is drawn as a hub: the Varanspire in the middle, an Arcway to each realm around it.
EIGHTPOINTS = ('eightpoints', 'The Eightpoints · Realm of Ruin', '#1a0c0b', '#5a2a22', '#b0705a', 83,
               [('varanspire', 'The Varanspire')], [
                   ('arcway-fire', 'Arcway of Fire'), ('arcway-life', 'Arcway of Life'),
                   ('arcway-beasts', 'Arcway of Beasts'), ('arcway-death', 'Arcway of Death'),
                   ('arcway-metal', 'Arcway of Metal'), ('arcway-shadow', 'Arcway of Shadow'),
                   ('arcway-light', 'Arcway of Light'), ('arcway-heavens', 'The Sealed Arcway'),
               ])


def hex_rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def fractal_noise(rng, octaves=6):
    total = np.zeros((H, W), np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        cells = 3 * 2 ** o
        grid = rng.random((cells + 1, int(cells * W / H) + 1)).astype(np.float32)
        layer = np.asarray(Image.fromarray((grid * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
        total += layer * amp
        norm += amp
        amp *= 0.58
    total /= norm
    # Averaging octaves flattens contrast; stretch back to 0..1 so thresholds bite.
    lo, hi = np.percentile(total, 1), np.percentile(total, 99)
    return np.clip((total - lo) / (hi - lo), 0, 1)


def falloff():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    dx, dy = (x - W / 2) / (W * 0.46), (y - H / 2) / (H * 0.44)
    return np.clip(1 - np.sqrt(dx * dx + dy * dy), 0, 1)


def render(realm_id, title, sea, low, high, elevation, land, rng, stars=False):
    sea_c, low_c, high_c = hex_rgb(sea), hex_rgb(low), hex_rgb(high)
    t = np.clip((elevation - elevation[land].min()) / (np.ptp(elevation[land]) + 1e-6), 0, 1)[..., None] if land.any() else 0
    img = np.where(land[..., None], low_c + (high_c - low_c) * t, sea_c * (0.85 + 0.3 * elevation[..., None]))
    # Parchment grain and a vignette so it reads as a map, not a gradient.
    grain = rng.normal(0, 7, (H, W, 1)).astype(np.float32)
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    vignette = 1 - 0.35 * (((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)[..., None]
    img = np.clip((img + grain) * vignette, 0, 255).astype(np.uint8)
    im = Image.fromarray(img, 'RGB')

    # Coastline: the edge of the land mask, darkened.
    mask = Image.fromarray((land * 255).astype(np.uint8))
    edge = mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    im.paste((25, 18, 12), mask=edge.point(lambda v: 170 if v > 0 else 0))
    if stars:
        d = ImageDraw.Draw(im)
        for _ in range(500):
            sx, sy = rng.integers(0, W), rng.integers(0, H)
            if not land[sy, sx]:
                r = rng.choice([0, 0, 1, 1, 2])
                d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(230, 235, 255))

    d = ImageDraw.Draw(im)
    for inset, width in ((14, 3), (24, 1)):
        d.rectangle((inset, inset, W - inset, H - inset), outline=(200, 170, 110), width=width)
    font = ImageFont.truetype(FONT, 46)
    tw = d.textlength(title.upper(), font=font)
    d.rectangle((W / 2 - tw / 2 - 24, 40, W / 2 + tw / 2 + 24, 104), fill=(24, 18, 12), outline=(200, 170, 110), width=2)
    d.text((W / 2 - tw / 2, 48), title.upper(), font=font, fill=(240, 215, 150))
    small = ImageFont.truetype(FONT_ITALIC, 20)
    note = 'Placeholder map · replace with real art'
    d.text((W - 40 - d.textlength(note, font=small), H - 58), note, font=small, fill=(230, 220, 200))
    out = os.path.join(ROOT, 'public', 'maps', 'realms', f'{realm_id}.jpg')
    im.save(out, quality=84, optimize=True, progressive=True)
    return out


def place_points(land, rng, count, min_dist=170, margin=110):
    ys, xs = np.nonzero(land[margin:H - margin, margin:W - margin])
    candidates = list(zip((xs + margin).tolist(), (ys + margin).tolist()))
    rng.shuffle(candidates)
    points = []
    for dist in (min_dist, min_dist * 0.8, min_dist * 0.6):
        for x, y in candidates:
            if len(points) == count:
                return points
            if all(math.hypot(x - px, y - py) >= dist for px, py in points):
                points.append((x, y))
    raise SystemExit(f'Could not fit {count} points on the landmass')


def write_def(realm_id, title, points, named):
    name = title.split(' · ')[0]
    nodes = [{'id': pid, 'name': pname, 'region': name, 'x': int(x), 'y': int(y)}
             for (pid, pname), (x, y) in zip(named, points)]
    body = {
        'id': realm_id, 'name': name, 'title': title.split(' · ')[1], 'image': f'/maps/realms/{realm_id}.jpg',
        'width': W, 'height': H, 'maxEdge': 420, 'reach': 130, 'placeholder': True, 'nodes': nodes,
    }
    path = os.path.join(ROOT, 'src', 'data', 'maps', f'{realm_id}.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('// Generated by scripts/make-placeholder-realms.py. Placeholder art: points sit on the\n')
        f.write('// generated landmass. Replace the image and re-place points in the map editor.\n')
        f.write(f'export default {json.dumps(body, indent=2, ensure_ascii=False)};\n')
    return path


def main():
    os.makedirs(os.path.join(ROOT, 'public', 'maps', 'realms'), exist_ok=True)
    for realm_id, title, sea, low, high, seed, named in REALMS:
        rng = np.random.default_rng(seed)
        elevation = fractal_noise(rng)
        land = (elevation * 0.7 + falloff() * 0.75) > 0.62
        points = place_points(land, random.Random(seed), len(named))
        print(render(realm_id, title, sea, low, high, elevation, land, rng, stars=realm_id == 'azyr'))
        print(write_def(realm_id, title, points, named))

    realm_id, title, sea, low, high, seed, centre, arcways = EIGHTPOINTS
    rng = np.random.default_rng(seed)
    elevation = fractal_noise(rng)
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.hypot(x - W / 2, (y - H / 2) * 1.35)
    land = ((elevation * 0.7 + falloff() * 0.75) > 0.6) | ((r < 400) & (elevation > 0.25))
    ring = [(W / 2 + 360 * math.cos(a), H / 2 + 360 / 1.35 * math.sin(a))
            for a in (i * math.tau / 8 - math.pi / 2 for i in range(8))]
    print(render(realm_id, title, sea, low, high, elevation, land, rng))
    print(write_def(realm_id, title, [(W / 2, H / 2)] + ring, centre + arcways))


if __name__ == '__main__':
    main()
