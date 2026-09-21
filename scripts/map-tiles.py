"""Cut a map plate into 1:1 tiles with a coordinate ruler drawn over them.

This is how a point gets its position. Reading a label off a whole-map view
that has been shrunk to fit is how settlements end up in the sea: the eye
estimates, and the estimate is wrong by tens of pixels. A tile at native
resolution with a ruler on it is read, not estimated.

    python scripts/map-tiles.py <plate> <out-dir> [tile] [zoom]

The ruler is always drawn in the PLATE's own pixels, so a position read off a
tile needs no conversion — even when `zoom` is used to enlarge a small plate
enough to read. Every tile is named tRC by row and column.
"""
import os
import sys

import cv2


def tiles(src, out_dir, tile=1024, zoom=1):
    img = cv2.imread(src)
    if img is None:
        raise SystemExit(f"cannot read {src}")
    os.makedirs(out_dir, exist_ok=True)
    h, w = img.shape[:2]
    if zoom != 1:
        img = cv2.resize(img, (w * zoom, h * zoom), interpolation=cv2.INTER_LANCZOS4)
    H, W = img.shape[:2]

    # A line every 50 plate-pixels, numbered every 100.
    step, label_every = 50 * zoom, 100
    rows, cols = (H + tile - 1) // tile, (W + tile - 1) // tile
    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * tile, r * tile
            t = img[y0:y0 + tile, x0:x0 + tile].copy()
            th, tw = t.shape[:2]
            if th < 32 or tw < 32:
                continue
            for gx in range(x0 - x0 % step, x0 + tw, step):
                x = gx - x0
                if 0 <= x < tw:
                    cv2.line(t, (x, 0), (x, th), (0, 0, 255), 1)
                    if (gx // zoom) % label_every == 0:
                        cv2.putText(t, str(gx // zoom), (x + 2, 15), cv2.FONT_HERSHEY_PLAIN, 0.9, (0, 0, 255), 1)
            for gy in range(y0 - y0 % step, y0 + th, step):
                y = gy - y0
                if 0 <= y < th:
                    cv2.line(t, (0, y), (tw, y), (0, 0, 255), 1)
                    if (gy // zoom) % label_every == 0:
                        cv2.putText(t, str(gy // zoom), (2, y - 3), cv2.FONT_HERSHEY_PLAIN, 0.9, (0, 0, 255), 1)
            cv2.imwrite(os.path.join(out_dir, f"t{r}{c}.png"), t)
    print(f"{w}x{h} -> {rows}x{cols} tiles of {tile}px in {out_dir}" + (f" (read at x{zoom})" if zoom != 1 else ""))


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    tiles(sys.argv[1], sys.argv[2],
          int(sys.argv[3]) if len(sys.argv) > 3 else 1024,
          int(sys.argv[4]) if len(sys.argv) > 4 else 1)
