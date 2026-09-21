"""Take the printed labels off a map plate, without chewing up the drawing.

Written for the Hive Primus cutaway, and kept because the technique generalises
to any plate whose labels sit ON the art rather than in a margin.

The usual inpainters are the wrong tool. cv2.INPAINT_TELEA smears flat terrain
and pencil grain into mush, and a ring-median fill flattens linework. What
works is to steal from the plate itself: for each label box, search nearby for
a patch whose surrounding frame best matches this one, level-match it, and lay
it in under the ink only. Grain stays grain; structure stays structure.

Two things learned the hard way, both visible in the output if you get them
wrong. Detect the ink with a threshold computed per box, from that box's own
paper, or a dark corner of the drawing gets eaten. And do not go hunting for
leftover callout lines with a loose Hough sweep — it scars clean sky far faster
than it finds strokes. Name the leaders and step along them instead.

The boxes below are for one specific plate. Measure your own on 1:1 gridded
tiles of the drawing rather than off a shrunken view.
"""
import cv2
import numpy as np

SRC = r"D:\Projects\Assets\Warhammer\necromunda-hive-primus.jpg"
OUT = r"D:\Projects\Chronicle-of-Conquest\public\maps\hive-primus.jpg"
PREVIEW = r"D:\Projects\Chronicle-of-Conquest\.scratch\primus-clean-preview.jpg"
MASKSHOW = r"D:\Projects\Chronicle-of-Conquest\.scratch\primus-mask.jpg"

# x0, y0, x1, y1 — measured off the gridded tiles.
LABELS = [
    (165, 148, 490, 212),    # Hive Primus
    (180, 206, 380, 258),    # The Palatine
    (163, 352, 462, 394),    # Imperial House Helmawr — one line at a time, so
    (163, 390, 350, 416),    # that each box is small enough to find a donor
    (163, 412, 452, 442),    # for
    (163, 555, 330, 600),    # Great Houses
    (163, 592, 250, 725),    # the six Great House names
    (163, 958, 315, 1002),   # Clan Houses
    (163, 998, 275, 1135),   # the six Clan House names
    (495, 522, 595, 557),    # The Shell
    (823, 402, 950, 452),    # Imperial Fists Chapter House
    (900, 640, 1030, 675),   # Landing Field
    (1140, 288, 1270, 395),  # Lower Atmospheric Level
    (412, 750, 495, 785),    # The Wall
    (320, 852, 505, 918),    # Hab Zones / Manufactory Zones / Ruined Manufactories
    (968, 880, 1115, 915),   # Subsidary Spires
    (1132, 785, 1305, 835),  # Cloud Cover
    (1138, 980, 1295, 1050),  # Poisonous Undercloud
    (1162, 1135, 1295, 1185),  # The Stranger's Spire
    (983, 1338, 1160, 1370),  # Current Surface Level
    (95, 1420, 230, 1478),   # External Shanty Sprawl
    (68, 1925, 605, 1962),   # the surveyor's caption
    # Over the drawing itself — the hard ones.
    (695, 645, 785, 735),    # The Spire
    (650, 945, 805, 995),    # Hive City
    (625, 1380, 835, 1425),  # The Underhive
    (630, 1480, 810, 1525),  # Hive Bottom
    (645, 1575, 800, 1620),  # The Sump
    (588, 1832, 875, 1895),  # Primary Heat Sink
]

# Scale ticks down both margins, each a numeral and a dash.
TICKS = [(98, 222, 145, 256), (98, 352, 145, 388), (98, 478, 145, 512),
         (98, 608, 145, 642), (98, 740, 145, 775), (98, 866, 145, 902),
         (98, 990, 145, 1025), (98, 1115, 145, 1150), (98, 1245, 145, 1278),
         (1262, 1425, 1305, 1458), (1268, 1552, 1310, 1585),
         (1268, 1678, 1310, 1710), (1268, 1805, 1310, 1838)]

# The leader lines that tie a callout to what it points at: (x0,y0)-(x1,y1).
LEADERS = [((578, 555), (686, 642)),    # The Shell
           ((828, 418), (752, 368)),    # Imperial Fists Chapter House
           ((872, 715), (940, 684)),    # Landing Field
           ((470, 762), (668, 848)),    # The Wall
           ((518, 930), (646, 1020)),   # the hab and manufactory zones
           ((1050, 914), (980, 1006)),  # Subsidary Spires
           ((1170, 1152), (1122, 1210)),  # The Stranger's Spire
           ((105, 1374), (156, 1432))]  # External Shanty Sprawl

img = cv2.imread(SRC)
H, W = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# The ink to lift: inside each box, whatever is markedly darker than that box's
# own paper. A per-box threshold keeps a dark corner of the drawing out of it.
mask = np.zeros((H, W), np.uint8)
for x0, y0, x1, y1 in LABELS + TICKS:
    box = gray[y0:y1, x0:x1]
    paper = np.percentile(box, 72)
    ink = box < paper - 16
    mask[y0:y1, x0:x1] |= ink.astype(np.uint8)
for a, b in LEADERS:
    cv2.line(mask, a, b, 1, 7)
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
print("ink pixels:", int(mask.sum()))

out = img.copy()
PAD = 26


def transplant(x0, y0, x1, y1):
    """Fill this box's ink from the best-matching patch nearby."""
    bx0, by0 = max(0, x0 - PAD), max(0, y0 - PAD)
    bx1, by1 = min(W, x1 + PAD), min(H, y1 + PAD)
    bw, bh = bx1 - bx0, by1 - by0
    frame = np.zeros((bh, bw), bool)
    frame[:PAD, :] = frame[-PAD:, :] = frame[:, :PAD] = frame[:, -PAD:] = True
    frame &= ~mask[by0:by1, bx0:bx1].astype(bool)
    target = gray[by0:by1, bx0:bx1].astype(np.float32)

    best, bestd = None, None
    for dy in range(-260, 261, 13):
        for dx in range(-260, 261, 13):
            if abs(dx) < bw // 2 and abs(dy) < bh // 2:
                continue  # too close: it would drag the label along with it
            sx0, sy0 = bx0 + dx, by0 + dy
            if sx0 < 0 or sy0 < 0 or sx0 + bw > W or sy0 + bh > H:
                continue
            if mask[sy0:sy0 + bh, sx0:sx0 + bw].any():
                continue  # donors must be clean
            d = np.abs(gray[sy0:sy0 + bh, sx0:sx0 + bw].astype(np.float32) - target)[frame].mean()
            if bestd is None or d < bestd:
                bestd, best = d, (sx0, sy0)
    if best is None:
        return False
    sx0, sy0 = best
    donor = img[sy0:sy0 + bh, sx0:sx0 + bw].astype(np.float32)
    # Match the donor's overall level to this spot before it is laid in.
    donor += (target[frame].mean() - gray[sy0:sy0 + bh, sx0:sx0 + bw].astype(np.float32)[frame].mean())

    soft = cv2.GaussianBlur(mask[by0:by1, bx0:bx1].astype(np.float32), (0, 0), 1.6)[..., None]
    soft = np.clip(soft, 0, 1)
    region = out[by0:by1, bx0:bx1].astype(np.float32)
    out[by0:by1, bx0:bx1] = np.clip(region * (1 - soft) + donor * soft, 0, 255).astype(np.uint8)
    return True


for box in LABELS + TICKS:
    if not transplant(*box):
        print("no donor for", box)
for a, b in LEADERS:
    steps = max(2, int(np.hypot(b[0] - a[0], b[1] - a[1]) // 22))
    for i in range(steps + 1):
        cx = round(a[0] + (b[0] - a[0]) * i / steps)
        cy = round(a[1] + (b[1] - a[1]) * i / steps)
        transplant(max(0, cx - 14), max(0, cy - 14), min(W, cx + 14), min(H, cy + 14))

# Warm the grey pencil a little so the hive sits with the parchment maps.
warm = out.astype(np.float32)
warm[..., 0] *= 0.94   # less blue
warm[..., 2] *= 1.05   # more red
warm = np.clip((warm - 128) * 1.06 + 128, 0, 255).astype(np.uint8)
cv2.imwrite(OUT, warm, [cv2.IMWRITE_JPEG_QUALITY, 90])
print("wrote", OUT, warm.shape[1], "x", warm.shape[0])

cv2.imwrite(PREVIEW, out, [cv2.IMWRITE_JPEG_QUALITY, 88])
shown = img.copy()
shown[mask.astype(bool)] = (0, 0, 255)
cv2.imwrite(MASKSHOW, shown, [cv2.IMWRITE_JPEG_QUALITY, 80])
print("wrote preview and mask")
