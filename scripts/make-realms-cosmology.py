"""Build the Mortal Realms cosmology plate, from the source, in one pass.

This drawing is the orrery of the Mortal Realms: eight realms, their moons and
orbits, the Aetheric Void between them and the Varanspire at the centre of it.
It backs the All Realms view.

Two things happen here. The realm NAMES come off, because the app writes its
own on the cards; each realm's subtitle stays, since "Realm of Heavens" is the
part worth reading. Then the plate is inverted so the void reads as void — the
source is dark ink on pale paper, which is the wrong way round for a starfield
— and landed at a brightness that is actually legible when it is scaled down
behind a dozen cards.

It must be built from the source every time. Re-lifting an already-lifted plate
stacks the correction and washes the void out to grey, which is exactly what
happened the first time this was tried.
"""
import cv2
import numpy as np

SRC = r"D:\Projects\Assets\Warhammer\Mortal_Realms_map_03.jpg"
OUT = r"D:\Projects\Chronicle-of-Conquest\public\maps\realms\mortal-realms.jpg"
WIDTH = 2600

# The realm names, in source pixels: centre x, centre y, half width, half height.
NAMES = [
    (1190, 152, 70, 26),    # AZYR
    (828, 224, 72, 26),     # HYSH
    (1535, 224, 95, 26),    # GHYRAN
    (1829, 500, 70, 26),    # GHUR
    (1734, 880, 100, 26),   # CHAMON
    (647, 888, 92, 26),     # SHYISH
    (555, 497, 72, 26),     # ULGU
    (1190, 988, 88, 26),    # AQSHY
    (1621, 1259, 130, 28),  # BLIGHT CITY
]

img = cv2.imread(SRC)
if img is None:
    raise SystemExit(f"cannot read {SRC}")
H, W = img.shape[:2]
print(f"source {W}x{H}")

# Inside each box only the ink is text; the paper around it is the fill.
mask = np.zeros((H, W), np.uint8)
for cx, cy, hw, hh in NAMES:
    cv2.rectangle(mask, (cx - hw, cy - hh), (cx + hw, cy + hh), 1, -1)
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
ink = ((g < 150) & (mask == 1)).astype(np.uint8)
ink = cv2.dilate(ink, np.ones((5, 5), np.uint8))
clean = cv2.inpaint(img, ink, 4, cv2.INPAINT_TELEA)

# Dark, with the hues kept: the paper becomes void, the orbits stay coloured.
hsv = cv2.cvtColor(clean, cv2.COLOR_BGR2HSV).astype(np.int16)
hsv[..., 2] = 255 - hsv[..., 2]
hsv[..., 1] = np.clip(hsv[..., 1] * 1.7, 0, 255)
out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32) / 255.0

# Inverting leaves everything bunched near black. Open the midtones so the
# orrery survives being scaled down, while the void itself stays dark.
out = np.power(np.clip(out, 0, 1), 0.62)
out = np.clip((out - 0.5) * 1.12 + 0.5, 0, 1)
out = np.clip((out - 0.03) / 0.97, 0, 1)

# A touch of warmth, so it belongs to the same app as the parchment maps.
out = out * 0.93 + np.array([0.085, 0.075, 0.065], np.float32) * 0.07
final = np.clip(out * 255, 0, 255).astype(np.uint8)

lum = cv2.cvtColor(final, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
print('luma p50 %.3f p90 %.3f p99 %.3f' % tuple(np.percentile(lum, p) for p in (50, 90, 99)))

scale = WIDTH / W
final = cv2.resize(final, (WIDTH, round(H * scale)), interpolation=cv2.INTER_LANCZOS4)
cv2.imwrite(OUT, final, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(f"wrote {OUT} {final.shape[1]}x{final.shape[0]}")
