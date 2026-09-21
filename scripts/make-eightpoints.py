"""Draw the Eightpoints: a realm broken into shards, not a landmass.

Nobody has published a map of the Allpoints, so this one is drawn — and drawn
as what it is. It is not a continent. It is a fragment of a realm hanging in
the Realm of Chaos, held together by the Varanspire at its centre, with eight
arcways opening onto the eight Mortal Realms. The placeholder generator gave it
a coastline, which was the one thing it could not have.

So the drawing is the graph, as with Azyr and Blight City. The Varanspire holds
the middle; the three fortress-holds sit on shards near it; the eight arcways
each get a shard out at the points of the star, coloured for the realm it opens
onto. The coordinates are the module's own, so the art is laid out from
src/data/maps/eightpoints.js rather than beside it.
"""
import json
import os
import re
import subprocess

import cv2
import numpy as np

ROOT = r"D:\Projects\Chronicle-of-Conquest"
OUT = os.path.join(ROOT, "public", "maps", "realms", "eightpoints.jpg")
W, H = 1600, 1100
rng = np.random.default_rng(88)

# Read the points from the module, so the art can never drift from the data.
nodes = json.loads(subprocess.run(
    ["node", "-e", "import('./src/data/maps/eightpoints.js').then(m=>console.log(JSON.stringify(m.default.nodes)))"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout)
at = {n["id"]: (n["x"], n["y"]) for n in nodes}

# Each arcway burns the colour of the realm it opens onto.
ARCWAY_LIGHT = {
    "arcway-fire": (60, 90, 235),       # BGR — Aqshy
    "arcway-life": (90, 190, 90),       # Ghyran
    "arcway-beasts": (70, 130, 210),    # Ghur
    "arcway-death": (190, 110, 150),    # Shyish
    "arcway-metal": (150, 190, 205),    # Chamon
    "arcway-shadow": (170, 120, 105),   # Ulgu
    "arcway-light": (170, 215, 235),    # Hysh
    "arcway-heavens": (210, 150, 80),   # Azyr, sealed
}
HOLDS = {"varanspire": 165, "carngrad": 92, "flayhaunt": 86, "skarrgrim": 80}
SPANS = [("varanspire", k) for k in ARCWAY_LIGHT] + [
    ("varanspire", "carngrad"), ("varanspire", "flayhaunt"), ("varanspire", "skarrgrim"),
    ("carngrad", "arcway-shadow"), ("carngrad", "arcway-light"),
    ("flayhaunt", "arcway-beasts"), ("flayhaunt", "arcway-life"),
    ("skarrgrim", "arcway-metal"), ("skarrgrim", "arcway-death"),
]


def shard(cx, cy, size, points=90, rough=0.24):
    """A broken plate of rock: a wandering outline with hard corners."""
    ang = np.linspace(0, 2 * np.pi, points, endpoint=False)
    r = rng.normal(0, 1, points)
    r = np.convolve(np.r_[r, r, r], np.ones(13) / 13, 'same')[points:2 * points]
    r = size * (1.0 + rough * r / (np.abs(r).max() + 1e-6))
    # Chip a couple of edges off flat, so it reads as broken rather than eroded.
    for _ in range(3):
        i = int(rng.integers(0, points))
        w = int(rng.integers(6, 12))
        r[i:i + w] *= 0.82
    return np.c_[cx + r * np.cos(ang), cy + r * np.sin(ang) * 0.68].astype(np.int32)


# --- the Realm of Chaos behind it -----------------------------------------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
d = np.hypot(xx - 800, (yy - 550) * 1.3) / 820.0
void = np.zeros((H, W, 3), np.float32)
for c, (near, far) in enumerate(((30, 12), (26, 10), (44, 20))):   # BGR: a dull ember red
    void[..., c] = far + (near - far) * np.clip(1 - d, 0, 1) ** 1.5

churn = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 22)
churn = (churn - churn.min()) / (np.ptp(churn) + 1e-6)
void += (churn[..., None] - 0.5) * np.array([26, 18, 44], np.float32)
streak = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 2)
streak = cv2.GaussianBlur(np.clip(streak, 0, None), (81, 3), 0)
void += (streak / (streak.max() + 1e-6))[..., None] * np.array([40, 26, 60], np.float32)

# Rifts: the Realm of Chaos does not hold still.
for _ in range(14):
    p0 = (int(rng.integers(0, W)), int(rng.integers(0, H)))
    pts = [p0]
    for _ in range(8):
        pts.append((int(pts[-1][0] + rng.normal(0, 120)), int(pts[-1][1] + rng.normal(0, 90))))
    rift = np.zeros((H, W), np.float32)
    cv2.polylines(rift, [np.array(pts, np.int32)], False, 1.0, 2)
    rift = cv2.GaussianBlur(rift, (0, 0), 6)
    void += rift[..., None] * np.array([34, 22, 60], np.float32) * 0.9

# --- the causeways between shards ------------------------------------------
beams = np.zeros((H, W), np.float32)
for a, b in SPANS:
    cv2.line(beams, at[a], at[b], 1.0, 3)
beams = cv2.GaussianBlur(beams, (0, 0), 4.0)
void += beams[..., None] * np.array([70, 110, 165], np.float32) * 0.55

# --- the shards -------------------------------------------------------------
order = list(HOLDS.items()) + [(k, 74) for k in ARCWAY_LIGHT]
for pid, size in order:
    cx, cy = at[pid]
    poly = shard(cx, cy, size)
    shape = np.zeros((H, W), np.float32)
    cv2.fillPoly(shape, [poly], 1.0)

    # What hangs below a shard: rubble trailing off into the warp.
    below = np.zeros((H, W), np.float32)
    cv2.fillPoly(below, [poly + np.array([0, int(size * 0.42)])], 1.0)
    below = cv2.GaussianBlur(below, (0, 0), size * 0.3) * (1 - shape)
    void = void * (1 - below[..., None] * 0.7) + np.array([28, 22, 30], np.float32) * below[..., None] * 0.7

    tex = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 2.4)
    tex = (tex - tex.min()) / (np.ptp(tex) + 1e-6)
    rock = np.zeros((H, W, 3), np.float32)
    for c, (lo, hi) in enumerate(((54, 104), (58, 116), (70, 140))):   # cold basalt, lit from above
        rock[..., c] = lo + (hi - lo) * tex
    soft = cv2.GaussianBlur(shape, (0, 0), 1.1)
    void = void * (1 - soft[..., None]) + rock * soft[..., None]

    rim = cv2.GaussianBlur(cv2.morphologyEx(shape, cv2.MORPH_GRADIENT, np.ones((5, 5), np.uint8)), (0, 0), 1.3)
    void += rim[..., None] * np.array([120, 150, 185], np.float32) * 0.5

    # An arcway burns with the realm on its far side; the sealed one does not.
    if pid in ARCWAY_LIGHT:
        glow = np.zeros((H, W), np.float32)
        cv2.circle(glow, (cx, cy), 30, 1.0, -1)
        glow = cv2.GaussianBlur(glow, (0, 0), 26)
        strength = 0.28 if pid == 'arcway-heavens' else 0.85
        void += glow[..., None] * np.array(ARCWAY_LIGHT[pid], np.float32) * strength

# The Varanspire throws its own light over the middle of everything.
crown = np.zeros((H, W), np.float32)
cv2.circle(crown, at['varanspire'], 54, 1.0, -1)
crown = cv2.GaussianBlur(crown, (0, 0), 40)
void += crown[..., None] * np.array([90, 120, 190], np.float32) * 0.5

img = np.clip(void + rng.normal(0, 3.0, (H, W, 1)), 0, 255).astype(np.uint8)
cv2.rectangle(img, (26, 26), (W - 27, H - 27), (110, 130, 165), 2)
cv2.rectangle(img, (34, 34), (W - 35, H - 35), (74, 88, 116), 1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
cv2.imwrite(OUT, img, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(f"wrote {OUT} {W}x{H} from {len(nodes)} points in the module")
