"""Draw Azyr: the celestial realm, as sky rather than coastline.

No published map of Azyr exists — it is the one realm Games Workshop has never
charted — so this is drawn, and the app's own About page says so. The earlier
placeholder generated a landmass with a coastline out of random noise, which is
the one thing Azyr is not: it is heaven, a starfield holding a few known places
and the Sigmarabulum ringing the broken world-core at the centre of it.

So the drawing is the graph. Sigmaron and the Sigmarabulum hold the middle,
Azyrheim and the lesser holds float around them as sky-islands, and the light
between them is the way an army actually travels. The script prints the
coordinates it used, which is what src/data/maps/azyr.js is built from — art
and points cannot drift apart because they come out of the same run.
"""
import os

import cv2
import numpy as np

OUT = r"D:\Projects\Chronicle-of-Conquest\public\maps\realms\azyr.jpg"
W, H = 1600, 1100
rng = np.random.default_rng(7)

# id, name, x, y, how big the island is. Sigmaron and the ring hold the centre.
ISLANDS = [
    ('sigmaron', 'Sigmaron', 800, 540, 150),
    ('sigmarabulum', 'The Sigmarabulum', 800, 420, 0),     # a point on the ring itself
    ('azyrheim', 'Azyrheim', 470, 430, 122),
    ('celestial-forges', 'The Celestial Forges', 1140, 400, 100),
    ('highheim', 'Highheim', 640, 250, 84),
    ('gladitorium', 'The Gladitorium', 1010, 220, 72),
    ('starhold', 'Starhold', 1290, 700, 82),
    ('skydock', 'The Skydock', 400, 745, 76),

    ('azyrite-watch', 'The Azyrite Watch', 1080, 880, 70),
    ('gates-of-azyr', 'The Gates of Azyr', 690, 900, 92),
    ('azyr', 'Azyr', 250, 210, 66),                         # the realm itself, given ground to stand on
]
# What the light runs between.
SPANS = [
    ('sigmaron', 'azyrheim'), ('sigmaron', 'celestial-forges'), ('sigmaron', 'highheim'),
    ('sigmaron', 'gates-of-azyr'), ('azyrheim', 'highheim'), ('azyrheim', 'skydock'),
    ('celestial-forges', 'gladitorium'), ('celestial-forges', 'starhold'),
    ('highheim', 'gladitorium'), ('starhold', 'azyrite-watch'),
    ('azyrite-watch', 'gates-of-azyr'), ('gates-of-azyr', 'skydock'),
    ('skydock', 'azyrheim'), ('sigmaron', 'starhold'),
]
at = {i[0]: (i[2], i[3]) for i in ISLANDS}

# --- the heavens -----------------------------------------------------------
sky = np.zeros((H, W, 3), np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.hypot(xx - 800, (yy - 540) * 1.25) / 900.0
for c, (deep, near) in enumerate(((78, 26), (46, 12), (26, 6))):    # BGR: blue, deepening out
    sky[..., c] = near + (deep - near) * np.clip(1 - r, 0, 1) ** 1.4 + 6

cloud = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 26)
cloud = (cloud - cloud.min()) / (np.ptp(cloud) + 1e-6)
sky += (cloud[..., None] - 0.5) * np.array([26, 14, 8], np.float32)

# Stars, and a few bright ones with flare.
for _ in range(2600):
    x, y = rng.integers(0, W), rng.integers(0, H)
    v = rng.random() ** 3
    cv2.circle(sky, (int(x), int(y)), 1 if v < 0.85 else 2,
               (200 * v + 30, 210 * v + 34, 225 * v + 40), -1)
for _ in range(40):
    x, y = int(rng.integers(40, W - 40)), int(rng.integers(40, H - 40))
    flare = np.zeros((H, W), np.float32)
    cv2.circle(flare, (x, y), 3, 1.0, -1)
    flare = cv2.GaussianBlur(flare, (0, 0), 7)
    sky += flare[..., None] * np.array([150, 170, 190], np.float32) * 1.4

# --- the light between places ---------------------------------------------
beams = np.zeros((H, W), np.float32)
for a, b in SPANS:
    cv2.line(beams, at[a], at[b], 1.0, 2)
beams = cv2.GaussianBlur(beams, (0, 0), 3.5)
sky += beams[..., None] * np.array([150, 190, 215], np.float32) * 0.5

# --- the Sigmarabulum: a ring of forges around the broken world-core -------
ring = np.zeros((H, W), np.float32)
cv2.ellipse(ring, (800, 540), (330, 120), 0, 0, 360, 1.0, 16)
ring = cv2.GaussianBlur(ring, (0, 0), 3)
sky += ring[..., None] * np.array([120, 175, 210], np.float32) * 0.75
core = np.zeros((H, W), np.float32)
cv2.circle(core, (800, 540), 66, 1.0, -1)
core = cv2.GaussianBlur(core, (0, 0), 16)
sky += core[..., None] * np.array([90, 130, 175], np.float32) * 0.9

# --- the islands -----------------------------------------------------------
for _, _, x, y, size in ISLANDS:
    if not size:
        continue
    # A floating plate of rock, not a splat: jitter the radius and then smooth
    # it, so the outline wanders without growing spikes.
    n = 90
    ang = np.linspace(0, 2 * np.pi, n, endpoint=False)
    rr = rng.normal(0, 1, n)
    rr = np.convolve(np.r_[rr, rr, rr], np.ones(13) / 13, 'same')[n:2 * n]
    rr = size * (1.0 + 0.30 * rr / (np.abs(rr).max() + 1e-6))
    rr *= np.where(np.sin(ang) < 0, 1.0, 0.80)       # the sunlit top is broader
    pts = np.c_[x + rr * np.cos(ang), y + rr * np.sin(ang) * 0.58]
    poly = pts.astype(np.int32)
    shape = np.zeros((H, W), np.float32)
    cv2.fillPoly(shape, [poly], 1.0)
    # The underside falls away into cloud.
    below = np.zeros((H, W), np.float32)
    cv2.fillPoly(below, [poly + np.array([0, int(size * 0.30)])], 1.0)
    below = cv2.GaussianBlur(below, (0, 0), size * 0.22) * (1 - shape)
    sky = sky * (1 - below[..., None] * 0.65) + np.array([60, 52, 44], np.float32) * below[..., None] * 0.65

    rock = np.zeros((H, W, 3), np.float32)
    tex = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 3)
    tex = (tex - tex.min()) / (np.ptp(tex) + 1e-6)
    for c, (lo, hi) in enumerate(((96, 152), (118, 186), (140, 214))):   # pale stone, lit from above
        rock[..., c] = lo + (hi - lo) * tex
    shape_s = cv2.GaussianBlur(shape, (0, 0), 1.2)
    sky = sky * (1 - shape_s[..., None]) + rock * shape_s[..., None]
    rim = cv2.morphologyEx(shape, cv2.MORPH_GRADIENT, np.ones((5, 5), np.uint8))
    rim = cv2.GaussianBlur(rim, (0, 0), 1.4)
    sky += rim[..., None] * np.array([190, 215, 235], np.float32) * 0.55

img = np.clip(sky + rng.normal(0, 2.4, (H, W, 1)), 0, 255).astype(np.uint8)
cv2.rectangle(img, (26, 26), (W - 27, H - 27), (150, 175, 200), 2)
cv2.rectangle(img, (34, 34), (W - 35, H - 35), (96, 120, 150), 1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
cv2.imwrite(OUT, img, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(f"wrote {OUT} {W}x{H}")
for pid, name, x, y, _ in ISLANDS:
    print(f'  {pid}: {x},{y}')
