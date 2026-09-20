from PIL import Image, ImageDraw
import json

with open('.scratch/existing_nodes.json') as f:
    nodes = json.load(f)

im = Image.open('public/maps/old-world.jpg').convert('RGB')
W, H = im.size
draw = ImageDraw.Draw(im)
for n in nodes:
    x, y = n['x'], n['y']
    draw.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 0, 0), width=3, fill=(255, 255, 0))
    draw.text((x + 8, y - 6), n['id'], fill=(255, 0, 0))

def gridcrop(box, out, step=100, big=200):
    x0, y0, x1, y1 = box
    crop = im.crop(box).copy()
    d = ImageDraw.Draw(crop)
    for x in range(0, x1 - x0 + 1, step):
        gx = x0 + x
        col = (0, 200, 0) if gx % big == 0 else (150, 220, 150)
        w = 2 if gx % big == 0 else 1
        d.line([(x, 0), (x, y1 - y0)], fill=col, width=w)
        if gx % big == 0:
            d.text((x + 2, 2), str(gx), fill=(0, 120, 0))
    for y in range(0, y1 - y0 + 1, step):
        gy = y0 + y
        col = (0, 200, 0) if gy % big == 0 else (150, 220, 150)
        w = 2 if gy % big == 0 else 1
        d.line([(0, y), (x1 - x0, y)], fill=col, width=w)
        if gy % big == 0:
            d.text((2, y + 2), str(gy), fill=(0, 120, 0))
    crop.save(out, quality=90)

boxes = {
    'ow_nw': (0, 0, 1300, 1300),        # Bretonnia, Empire west, Norsca west
    'ow_n':  (900, 0, 2100, 1000),      # Norsca, Kislev north
    'ow_ne': (1700, 0, 2508, 1300),     # Chaos Wastes, Dark Lands north
    'ow_c':  (900, 800, 2000, 1800),    # Empire core, Sylvania, WEM west
    'ow_e':  (1700, 900, 2508, 2100),   # World's Edge Mtns, Dark Lands, Badlands
    'ow_sw': (200, 1400, 1300, 2508),   # Bretonnia south, Tilea, Estalia
    'ow_s':  (1200, 1600, 2100, 2508),  # Border Princes, Badlands, Sylvania south
    'ow_se': (1700, 1700, 2508, 2508),  # SE corner
}
for name, box in boxes.items():
    gridcrop(box, f'.scratch/crops/{name}.jpg')
print('done')
