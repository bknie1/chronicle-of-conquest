from PIL import Image, ImageDraw
import json, re

with open('src/data/maps/old-world.js', encoding='utf-8') as f:
    content = f.read()

nodes = []
for m in re.finditer(r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"region":\s*"([^"]+)",\s*"x":\s*(\d+),\s*"y":\s*(\d+)\s*\}', content):
    nodes.append({'id': m.group(1), 'name': m.group(2), 'region': m.group(3), 'x': int(m.group(4)), 'y': int(m.group(5))})

print(len(nodes))
im = Image.open('public/maps/old-world.jpg').convert('RGB')
draw = ImageDraw.Draw(im)
for n in nodes:
    x, y = n['x'], n['y']
    draw.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 0, 0), width=3, fill=(255, 255, 0))
    draw.text((x + 8, y - 6), n['id'], fill=(255, 0, 0))
im.save('.scratch/crops/oldworld_marked_full.jpg', quality=92)

with open('.scratch/existing_nodes.json', 'w') as f:
    json.dump(nodes, f)
print('saved')
