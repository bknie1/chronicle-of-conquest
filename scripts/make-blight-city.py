"""Draw Blight City: the skaven under-realm, as caverns rather than a coastline.

No published map of Blight City exists, so this one is drawn — but drawn to be
RIGHT rather than random. The earlier placeholder generated a landmass with a
coastline, which is the one thing Blight City is not. It is a cavernous
sub-realm gnawed out under everything else: chambers for each of the great
clans, winding tunnels between them, and gnawholes chewed clean through
reality into the other realms.

So the drawing is the graph. Each chamber is a cavern, each tunnel is a bored
corridor, and each gnawhole sits at the edge pointing the way it actually goes
in the campaign data. The script prints the coordinates it used, which is what
src/data/maps/blight-city.js is built from — art and points cannot drift apart
because they come out of the same run.
"""
import os

import cv2
import numpy as np

OUT = r"D:\Projects\Chronicle-of-Conquest\public\maps\realms\blight-city.jpg"
W, H = 1600, 1100
rng = np.random.default_rng(13)

# The chambers, and where they sit. The five great clans around the Masterclan.
CHAMBERS = [
    ('blight-city', 'Blight City', 800, 545, 132),
    ('skryre-forges', 'The Skryre Forges', 1155, 360, 104),
    ('pestilens-pits', 'The Pestilens Plague-pits', 1200, 760, 108),
    ('moulder-fleshpits', 'The Moulder Fleshpits', 430, 790, 104),
    ('eshin-shadows', 'The Eshin Shadow-warrens', 375, 345, 96),
    ('verminus-barracks', 'The Verminus Barracks', 800, 900, 100),
]
TUNNELS = [
    ('blight-city', 'skryre-forges'), ('blight-city', 'pestilens-pits'),
    ('blight-city', 'moulder-fleshpits'), ('blight-city', 'eshin-shadows'),
    ('blight-city', 'verminus-barracks'), ('skryre-forges', 'pestilens-pits'),
    ('moulder-fleshpits', 'eshin-shadows'), ('moulder-fleshpits', 'verminus-barracks'),
    ('verminus-barracks', 'pestilens-pits'), ('eshin-shadows', 'skryre-forges'),
]
# Where the gnawholes break out, and which chamber they run from.
GNAWHOLES = [('skryre-forges', 1520, 175), ('pestilens-pits', 1520, 960),
             ('moulder-fleshpits', 95, 975), ('eshin-shadows', 90, 150)]

at = {c[0]: (c[2], c[3]) for c in CHAMBERS}
radius = {c[0]: c[4] for c in CHAMBERS}


def wobble(p, q, spread, steps=26):
    """A bored tunnel wanders; it is gnawed, not surveyed."""
    p, q = np.array(p, float), np.array(q, float)
    t = np.linspace(0, 1, steps)[:, None]
    line = p + (q - p) * t
    normal = np.array([-(q - p)[1], (q - p)[0]])
    normal = normal / (np.linalg.norm(normal) + 1e-6)
    drift = np.cumsum(rng.normal(0, spread, steps))
    drift -= np.linspace(drift[0], drift[-1], steps)     # ends stay put
    return line + normal * drift[:, None]


# --- the rock -------------------------------------------------------------
noise = rng.normal(0, 1, (H // 4, W // 4))
noise = cv2.GaussianBlur(noise, (0, 0), 3)
noise = cv2.resize(noise, (W, H), interpolation=cv2.INTER_CUBIC)
noise = (noise - noise.min()) / (np.ptp(noise) + 1e-6)
rock = np.zeros((H, W, 3), np.float32)
for c, (lo, hi) in enumerate(((16, 38), (18, 42), (22, 50))):   # BGR, cold wet stone
    rock[..., c] = lo + (hi - lo) * noise

# --- what has been hollowed out -------------------------------------------
hollow = np.zeros((H, W), np.float32)
for _, _, x, y, r in CHAMBERS:
    # A chamber is not a circle: it is chewed.
    pts = []
    for a in np.linspace(0, 2 * np.pi, 42, endpoint=False):
        rr = r * (0.74 + 0.34 * rng.random())
        pts.append((x + rr * np.cos(a), y + rr * np.sin(a)))
    cv2.fillPoly(hollow, [np.array(pts, np.int32)], 1.0)
for a, b in TUNNELS:
    path = wobble(at[a], at[b], 11).astype(np.int32)
    cv2.polylines(hollow, [path], False, 1.0, rng.integers(16, 27))
for chamber, gx, gy in GNAWHOLES:
    path = wobble(at[chamber], (gx, gy), 9).astype(np.int32)
    cv2.polylines(hollow, [path], False, 1.0, 21)
    cv2.circle(hollow, (gx, gy), 46, 1.0, -1)
hollow = cv2.GaussianBlur(hollow, (0, 0), 2.2)

# Floors: warmer, filthier, lit by whatever the skaven have set on fire.
floor_noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 7)
floor_noise = (floor_noise - floor_noise.min()) / (np.ptp(floor_noise) + 1e-6)
floor = np.zeros((H, W, 3), np.float32)
for c, (lo, hi) in enumerate(((46, 86), (74, 132), (92, 156))):  # BGR: sick green-brown
    floor[..., c] = lo + (hi - lo) * floor_noise

img = rock * (1 - hollow[..., None]) + floor * hollow[..., None]

# The rim where rock has been bitten away catches the light.
edge = cv2.morphologyEx(hollow, cv2.MORPH_GRADIENT, np.ones((7, 7), np.uint8))
edge = np.clip(cv2.GaussianBlur(edge, (0, 0), 1.6) * 2.4, 0, 1)
img = img * (1 - edge[..., None]) + np.array([96, 150, 178], np.float32) * edge[..., None]

# A gnawhole burns green at its mouth.
for _, gx, gy in GNAWHOLES:
    glow = np.zeros((H, W), np.float32)
    cv2.circle(glow, (gx, gy), 70, 1.0, -1)
    glow = cv2.GaussianBlur(glow, (0, 0), 26)
    img += np.array([34, 118, 62], np.float32) * glow[..., None] * 0.30

# Chisel marks: the rock is worked, not poured.
grit = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.9)
img += (grit * 9)[..., None] * (1 - hollow[..., None] * 0.6)
img = np.clip(img + rng.normal(0, 3.4, (H, W, 1)), 0, 255).astype(np.uint8)

# The app's own frame, as the other drawn plates have.
cv2.rectangle(img, (26, 26), (W - 27, H - 27), (96, 132, 160), 2)
cv2.rectangle(img, (34, 34), (W - 35, H - 35), (70, 96, 120), 1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
cv2.imwrite(OUT, img, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(f"wrote {OUT} {W}x{H}")
for pid, name, x, y, _ in CHAMBERS:
    print(f'    {{ "id": "{pid}", "name": "{name}", "kind": "warren", "region": "Blight City", "x": {x}, "y": {y} }},')
