"""Prepare a published Mortal Realms plate for the app.

The realm maps GW publishes are pale grey line drawings on near-white paper.
Dropped into this app they glare next to the Great Parch, so each plate is
pulled onto the same parchment the rest of the maps are drawn on: the drawing's
own tonal range is stretched to use the page properly, then mapped between a
shadow and a highlight colour sampled from the Aqshy plate that is already
shipped. Nothing about the drawing itself changes — no labels are touched here
(see strip-map-labels.py for that), nothing is redrawn, nothing is invented.

    python scripts/realm-art.py <source> <out.jpg> [width]

Width defaults to 2600, which is what the other maps ship at. A plate is never
enlarged past its own resolution by more than a little; if the source is small,
pass a smaller width rather than stretching it.
"""
import os
import sys

import cv2
import numpy as np

# Sampled from public/maps/realms/aqshy.jpg, the one realm already on real art.
PARCHMENT_SHADOW = np.array([58, 74, 92], np.float32)     # BGR, the inked lows
PARCHMENT_LIGHT = np.array([196, 214, 232], np.float32)   # BGR, lit paper


def convert(src, out, width=2600):
    img = cv2.imread(src)
    if img is None:
        raise SystemExit(f"cannot read {src}")
    h, w = img.shape[:2]

    # Some of these plates are published in colour and some as pale line
    # drawings. A painted one keeps its own colour — it is already the best
    # version of itself — and only gets graded so it sits with the others.
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sat = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[..., 1].mean()
    # Some plates are published almost black — a night rendition rather than a
    # painting. Graded as if painted they come out as harsh monochrome, so they
    # get the blacks lifted and the whites pulled back instead. The drawing is
    # not altered, only the exposure it was printed at.
    if np.percentile(g, 50) < 90:
        return finish(soften(img), src, out, w, h, width, 'dark plate')
    if sat > 28:
        out_img = grade(img)
        return finish(out_img, src, out, w, h, width, 'painted')

    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0

    # These plates use a narrow band near white. Stretch what the drawing
    # actually occupies, ignoring the extremes so a stray speck cannot set it.
    lo, hi = np.percentile(lum, 2), np.percentile(lum, 98)
    lum = np.clip((lum - lo) / max(hi - lo, 1e-6), 0, 1) ** 1.12
    tone = PARCHMENT_SHADOW + (PARCHMENT_LIGHT - PARCHMENT_SHADOW) * lum[..., None]

    # Keep whatever colour the plate does carry — realmgate icons, cartouches —
    # rather than flattening the whole thing to a duotone.
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    colour = (hsv[..., 1].astype(np.float32) / 255.0)[..., None]
    colour = np.clip((colour - 0.12) * 2.6, 0, 0.75)
    out_img = tone * (1 - colour) + img.astype(np.float32) * colour

    # A little grain, so a flat remap does not read as plastic.
    rng = np.random.default_rng(17)
    out_img = np.clip(out_img + rng.normal(0, 2.6, (h, w, 1)), 0, 255).astype(np.uint8)

    return finish(out_img, src, out, w, h, width, 'toned')


def soften(img):
    """Bring a near-black plate back onto the page.

    Everything is squeezed into a narrower, warmer band so it sits beside the
    parchment maps instead of punching a hole in the page, and the extremes are
    rolled off rather than clipped so the linework keeps its detail.
    """
    x = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    lo, hi = np.percentile(x, 1), np.percentile(x, 99)
    x = np.clip((x - lo) / max(hi - lo, 1e-6), 0, 1)
    x = x ** 0.78                                   # open the shadows
    x = 0.20 + 0.66 * x                             # and keep off both ends
    dark = np.array([46, 44, 52], np.float32)       # BGR: cold shadow, faintly violet
    light = np.array([188, 196, 206], np.float32)   # BGR: pale, not white
    out = dark + (light - dark) * x[..., None]
    rng = np.random.default_rng(23)
    return np.clip(out + rng.normal(0, 2.4, (*x.shape, 1)), 0, 255).astype(np.uint8)


def grade(img):
    """Settle a painted plate: a touch of warmth, and the contrast the rest
    of the maps are drawn with. The painting itself is not repainted."""
    x = img.astype(np.float32)
    x = np.clip((x - 128) * 1.06 + 128, 0, 255)      # a little more depth
    x[..., 0] *= 0.97                                 # less blue
    x[..., 2] *= 1.03                                 # more red
    hsv = cv2.cvtColor(np.clip(x, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= 0.88                               # off the postcard, onto the table
    return cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)


def finish(out_img, src, out, w, h, width, how):
    scale = width / w
    size = (width, round(h * scale))
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LANCZOS4
    out_img = cv2.resize(out_img, size, interpolation=interp)
    cv2.imwrite(out, out_img, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(f"{os.path.basename(src)} {w}x{h} {how} -> {out} {size[0]}x{size[1]} (x{scale:.3f})")
    return size


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    convert(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2600)
