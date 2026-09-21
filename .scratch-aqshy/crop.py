"""Ruled crop of the shipped plate, in the plate's own pixels.

    python .scratch-aqshy/crop.py x0 y0 x1 y1 [zoom] [out]
"""
import sys
import cv2

SRC = 'public/maps/realms/aqshy.jpg'


def crop(x0, y0, x1, y1, zoom=4, out='.scratch-aqshy/crop.png'):
    img = cv2.imread(SRC)
    t = img[y0:y1, x0:x1]
    t = cv2.resize(t, ((x1 - x0) * zoom, (y1 - y0) * zoom), interpolation=cv2.INTER_LANCZOS4)
    th, tw = t.shape[:2]
    step = 25
    for gx in range(x0 - x0 % step, x1 + 1, step):
        x = (gx - x0) * zoom
        if 0 <= x < tw:
            cv2.line(t, (x, 0), (x, th), (0, 0, 255), 1)
            cv2.putText(t, str(gx), (x + 2, 13), cv2.FONT_HERSHEY_PLAIN, 0.8, (0, 0, 255), 1)
    for gy in range(y0 - y0 % step, y1 + 1, step):
        y = (gy - y0) * zoom
        if 0 <= y < th:
            cv2.line(t, (0, y), (tw, y), (0, 0, 255), 1)
            cv2.putText(t, str(gy), (2, y - 3), cv2.FONT_HERSHEY_PLAIN, 0.8, (0, 0, 255), 1)
    cv2.imwrite(out, t)
    print(f"{out} {tw}x{th}")


if __name__ == '__main__':
    a = sys.argv[1:]
    crop(int(a[0]), int(a[1]), int(a[2]), int(a[3]),
         int(a[4]) if len(a) > 4 else 4,
         a[5] if len(a) > 5 else '.scratch-aqshy/crop.png')
