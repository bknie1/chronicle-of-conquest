"""Crop an arbitrary rect of the plate with a ruler in plate pixels.

    python .scratch-ghur/crop.py <x0> <y0> <x1> <y1> <zoom> <out.png>
"""
import sys
import cv2

SRC = 'public/maps/realms/ghur.jpg'

if __name__ == '__main__':
    x0, y0, x1, y1, zoom = (int(a) for a in sys.argv[1:6])
    out = sys.argv[6]
    img = cv2.imread(SRC)
    t = img[y0:y1, x0:x1].copy()
    t = cv2.resize(t, ((x1 - x0) * zoom, (y1 - y0) * zoom), interpolation=cv2.INTER_LANCZOS4)
    th, tw = t.shape[:2]
    for gx in range(x0 - x0 % 25, x1 + 1, 25):
        x = (gx - x0) * zoom
        if 0 <= x < tw:
            cv2.line(t, (x, 0), (x, th), (0, 0, 255), 1)
            if gx % 50 == 0:
                cv2.putText(t, str(gx), (x + 2, 15), cv2.FONT_HERSHEY_PLAIN, 0.9, (0, 0, 255), 1)
    for gy in range(y0 - y0 % 25, y1 + 1, 25):
        y = (gy - y0) * zoom
        if 0 <= y < th:
            cv2.line(t, (0, y), (tw, y), (0, 0, 255), 1)
            if gy % 50 == 0:
                cv2.putText(t, str(gy), (2, y - 3), cv2.FONT_HERSHEY_PLAIN, 0.9, (0, 0, 255), 1)
    cv2.imwrite(out, t)
    print(f"{x0},{y0}-{x1},{y1} x{zoom} -> {out} {tw}x{th}")
