"""Every province a map's art draws, and which of them have no point.

Run it after adding points to see what a map still leaves empty:

    python scripts/provinces.py [map-id]

Only useful on art that inks a border around each province, which is the
Warhammer Fantasy world map. On the Old World's flat-colour art it measures
colour regions instead, and its numbers mean nothing.

The map inks a thin border around each Total War province. Land is pale
parchment, sea a darker wash, borders and rivers darker still. Thresholding
the ink and taking connected components of what is left gives the provinces;
each one's centroid (pulled inside the shape) is a guaranteed-on-land slot.
"""
import json, subprocess
import numpy as np
import cv2

import sys
MAP = sys.argv[1] if len(sys.argv) > 1 else "fantasy-world"
img = cv2.imread(f"public/maps/{MAP}.jpg")
H, W = img.shape[:2]
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

land = g > 148                      # parchment; sea and ink are darker
ink = g < 132
body = (land & ~ink).astype(np.uint8)
body = cv2.morphologyEx(body, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

n, labels, stats, cents = cv2.connectedComponentsWithStats(body, connectivity=4)
nodes = json.loads(subprocess.run(
    ["node", "-e", f"import('./src/data/maps/{MAP}.js').then(m=>console.log(JSON.stringify(m.default.nodes)))"],
    capture_output=True, text=True, encoding="utf8").stdout)

# which component each existing point falls in
taken = set()
for nd in nodes:
    x, y = min(max(nd["x"], 0), W - 1), min(max(nd["y"], 0), H - 1)
    lab = labels[y, x]
    if lab:
        taken.add(int(lab))

provinces, empty = [], []
for i in range(1, n):
    x, y, w, h, area = stats[i]
    if not (700 <= area <= 400_000):
        continue
    if w > W * 0.5 or h > H * 0.5:          # the ocean wash, if it slips through
        continue
    mask = (labels[y:y + h, x:x + w] == i).astype(np.uint8)
    # A centroid can fall outside a bent shape; use the deepest interior point.
    dist = cv2.distanceTransform(cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT, 0), cv2.DIST_L2, 3)
    _, maxv, _, maxloc = cv2.minMaxLoc(dist)
    cx, cy = x + maxloc[0] - 1, y + maxloc[1] - 1
    rec = {"x": int(cx), "y": int(cy), "area": int(area), "inradius": round(float(maxv), 1), "label": int(i)}
    provinces.append(rec)
    if i not in taken:
        empty.append(rec)

print(f"provinces: {len(provinces)}   with a point: {len(provinces) - len(empty)}   empty: {len(empty)}")
print("empty by size:")
for r in sorted(empty, key=lambda r: -r["area"])[:20]:
    print(f"   ({r['x']},{r['y']})  area={r['area']:6}  inradius={r['inradius']}")
json.dump({"provinces": provinces, "empty": empty}, open(f".scratch2/{MAP}-provinces.json", "w"))

out = img.copy()
for r in provinces:
    cv2.circle(out, (r["x"], r["y"]), 7, (0, 0, 255) if r in empty else (0, 190, 0), 2)
for nd in nodes:
    cv2.circle(out, (nd["x"], nd["y"]), 4, (255, 0, 0), -1)
cv2.imwrite(f".scratch2/{MAP}-provinces.jpg", out, [cv2.IMWRITE_JPEG_QUALITY, 85])
