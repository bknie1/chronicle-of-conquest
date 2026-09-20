# Build fantasy-world node list: estimate coords in labeled-image space (2481x1496),
# convert to unlabeled image space (2584x1558), check spacing, draw overlay for review.
from PIL import Image, ImageDraw, ImageFont
import json, math

LAB_W, LAB_H = 2481, 1496
UNL_W, UNL_H = 2584, 1558
SX = UNL_W / LAB_W
SY = UNL_H / LAB_H

POINTS = [
    ("fw-altdorf", "Altdorf", "Reikland", 955, 520),
    ("fw-nuln", "Nuln", "Wissenland", 1000, 600),
    ("fw-marienburg", "Marienburg", "The Wasteland", 810, 400),
    ("fw-middenheim", "Middenheim", "Middenland", 990, 430),
    ("fw-nordland", "Nordland", "The Empire", 965, 340),
    ("fw-ostland", "Ostland", "The Empire", 1080, 345),
    ("fw-hochland", "Hochland", "The Empire", 1055, 400),
    ("fw-talabheim", "Talabheim", "Talabecland", 1110, 455),
    ("fw-ostermark", "Ostermark", "The Empire", 1200, 470),
    ("fw-wurtbad", "Wurtbad", "Stirland", 1080, 545),
    ("fw-averland", "Averland", "The Empire", 1120, 580),
    ("fw-solland", "Solland", "The Empire", 1100, 630),
    ("fw-drakenhof", "Drakenhof", "Sylvania", 1200, 560),
    ("fw-drakwald", "The Drakwald", "Middenland", 900, 400),
    ("fw-athel-loren", "Athel Loren", "The Forest of Loren", 880, 600),
    ("fw-couronne", "Couronne", "Bretonnia", 840, 450),
    ("fw-bastonne", "Bastonne", "Bretonnia", 825, 570),
    ("fw-carcassonne", "Carcassonne", "Bretonnia", 865, 700),
    ("fw-lyonesse", "Lyonesse", "Bretonnia", 790, 500),
    ("fw-quenelles", "Quenelles", "Bretonnia", 900, 650),
    ("fw-bordeleaux", "Bordeleaux", "Bretonnia", 760, 620),
    ("fw-kislev-city", "Kislev", "Kislev", 1160, 320),
    ("fw-erengrad", "Erengrad", "Kislev", 1010, 280),
    ("fw-praag", "Praag", "Kislev", 1260, 230),
    ("fw-norsca-heart", "Norscan Heartland", "Norsca", 1000, 150),
    ("fw-norsca-west", "Bjornling Coast", "Norsca", 850, 110),
    ("fw-norsca-east", "Norscan Frontier", "Norsca", 1150, 100),
    ("fw-chaos-wastes-north", "The Chaos Wastes", "Northern Wastes", 1300, 60),
    ("fw-border-princes", "Border Princes", "Border Princes", 1180, 700),
    ("fw-tilea", "Tilea", "Tilea", 950, 820),
    ("fw-miragliano", "Miragliano", "Tilea", 980, 880),
    ("fw-sartosa", "Sartosa", "Tilea", 870, 900),
    ("fw-estalia", "Estalia", "Estalia", 830, 860),
    ("fw-magritta", "Magritta", "Estalia", 780, 920),
    ("fw-badlands", "The Badlands", "Badlands", 1150, 850),
    ("fw-black-crag", "Black Crag", "Badlands", 1250, 900),
    ("fw-karaz-a-karak", "Karaz-a-Karak", "World's Edge Mountains", 1290, 540),
    ("fw-karak-kadrin", "Karak Kadrin", "World's Edge Mountains", 1320, 650),
    ("fw-eight-peaks", "Karak Eight Peaks", "World's Edge Mountains", 1250, 800),
    ("fw-zhufbar", "Zhufbar", "World's Edge Mountains", 1350, 700),
    ("fw-black-fire-pass", "Black Fire Pass", "World's Edge Mountains", 1300, 600),
    ("fw-skavenblight", "Skavenblight", "The Blighted Marshes", 860, 770),
    ("fw-albion", "Albion", "The Great Ocean", 740, 360),
    ("fw-great-ocean-isle", "The Isles", "The Great Ocean", 630, 460),
    ("fw-lothern", "Lothern", "Eataine", 620, 700),
    ("fw-eataine", "Eataine", "Ulthuan", 540, 750),
    ("fw-caledor", "Caledor", "Ulthuan", 500, 730),
    ("fw-saphery", "Saphery", "Ulthuan", 620, 650),
    ("fw-tor-yvresse", "Tor Yvresse", "Ulthuan", 645, 620),
    ("fw-chrace", "Chrace", "Ulthuan", 560, 590),
    ("fw-avelorn", "Avelorn", "Ulthuan", 520, 610),
    ("fw-ellyrion", "Ellyrion", "Ulthuan", 470, 660),
    ("fw-cothique", "Cothique", "Ulthuan", 600, 610),
    ("fw-tiranoc", "Tiranoc", "Ulthuan", 460, 720),
    ("fw-nagarythe", "Nagarythe", "Ulthuan", 480, 600),
    ("fw-armheim", "Armheim", "Nagarythe", 460, 580),
    ("fw-gaen-vale", "Gaen Vale", "Avelorn", 590, 545),
    ("fw-blighted-isle", "The Blighted Isle", "Ulthuan", 495, 480),
    ("fw-naggarond", "Naggarond", "Naggaroth", 480, 300),
    ("fw-clar-karond", "Clar Karond", "Naggaroth", 400, 500),
    ("fw-hag-graef", "Hag Graef", "Naggaroth", 550, 350),
    ("fw-karond-kar", "Karond Kar", "Naggaroth", 350, 550),
    ("fw-ghrond", "Ghrond", "Naggaroth", 500, 120),
    ("fw-har-ganeth", "Har Ganeth", "Naggaroth", 420, 440),
    ("fw-itza", "Itza", "Lustria", 420, 850),
    ("fw-hexoatl", "Hexoatl", "Lustria", 400, 950),
    ("fw-tlaxtlan", "Tlaxtlan", "Lustria", 380, 1050),
    ("fw-chaqua", "Chaqua", "Lustria", 500, 900),
    ("fw-vampire-coast", "The Vampire Coast", "Lustria", 600, 1030),
    ("fw-skeggi", "Skeggi", "Lustria", 370, 680),
    ("fw-khemri", "Khemri", "Nehekhara", 1100, 1080),
    ("fw-zandri", "Zandri", "Nehekhara", 1050, 1000),
    ("fw-lahmia", "Lahmia", "Nehekhara", 1150, 1000),
    ("fw-lybaras", "Lybaras", "Nehekhara", 1120, 1150),
    ("fw-land-of-the-dead", "The Land of the Dead", "Nehekhara", 1170, 1080),
    ("fw-great-mortis-delta", "Great Mortis Delta", "Nehekhara", 1060, 1120),
    ("fw-shifting-sands", "Shifting Sands", "Nehekhara", 1180, 1180),
    ("fw-devils-backbone", "Devil's Backbone", "The Southlands", 1230, 1020),
    ("fw-serpent-coast", "Serpent Coast", "The Southlands", 1180, 1400),
    ("fw-oyxl", "Oyxl", "Lustria", 460, 1080),
    ("fw-al-haikk", "Al-Haikk", "Araby", 930, 1010),
    ("fw-lashiek", "Lashiek", "Araby", 850, 1000),
    ("fw-martek", "Martek", "Araby", 950, 1050),
    ("fw-copher", "Copher", "Araby", 1000, 1000),
    ("fw-zharr-naggrund", "Zharr-Naggrund", "The Dark Lands", 1560, 560),
    ("fw-plain-of-zharrduk", "The Plain of Zharrduk", "The Dark Lands", 1500, 600),
    ("fw-mount-grimfang", "Mount Grimfang", "The Dark Lands", 1450, 500),
    ("fw-mountains-of-mourn", "Mountains of Mourn", "Ogre Kingdoms", 1650, 630),
    ("fw-great-bastion", "The Great Bastion", "Grand Cathay", 1900, 460),
    ("fw-celestial-lake", "The Celestial Lake", "Grand Cathay", 1970, 680),
    ("fw-wei-jin", "Wei-Jin", "Grand Cathay", 1900, 550),
    ("fw-nan-gau", "Nan-Gau", "Grand Cathay", 1870, 410),
    ("fw-shang-yang", "Shang-Yang", "Grand Cathay", 1830, 610),
    ("fw-qiang", "Qiang", "Grand Cathay", 1770, 660),
    ("fw-hanyu-port", "Hanyu Port", "Grand Cathay", 2060, 540),
    ("fw-xing-po", "Xing Po", "Grand Cathay", 2000, 620),
    ("fw-jinshen", "The Wastelands of Jinshen", "Grand Cathay", 1790, 715),
    ("fw-broken-lands-tian-li", "The Broken Lands of Tian Li", "Grand Cathay", 1860, 830),
    ("fw-mount-li", "Mount Li", "Grand Cathay", 2050, 800),
    ("fw-ind", "Ind", "Ind", 1550, 950),
    ("fw-nippon", "Nippon", "Nippon", 2080, 900),
    ("fw-chaos-wastes-south", "The Southern Chaos Wastes", "Southern Wastes", 1050, 1480),
    # --- additional flavor / spread points, names printed on the labeled reference ---
    ("fw-vanaheim-mountains", "Vanaheim Mountains", "Norsca", 870, 245),
    ("fw-troll-country", "Troll Country", "Kislev", 1155, 275),
    ("fw-mountains-of-naglfar", "Mountains of Naglfar", "Northern Wastes", 960, 180),
    ("fw-gash-kadrak", "Gash Kadrak", "The Dark Lands", 1540, 445),
    ("fw-chimera-plateau", "Chimera Plateau", "The Dark Lands", 1690, 300),
    ("fw-the-skull-road", "The Skull Road", "The Dark Lands", 1450, 240),
    ("fw-ancient-giant-lands", "Ancient Giant Lands", "The Dark Lands", 1630, 490),
    ("fw-bone-road", "Bone Road", "The Dark Lands", 1705, 565),
    ("fw-rib-peaks", "Rib Peaks", "World's Edge Mountains", 1350, 590),
    ("fw-black-water", "Black Water", "World's Edge Mountains", 1260, 560),
    ("fw-peak-pass", "Peak Pass", "World's Edge Mountains", 1270, 495),
    ("fw-deadrock-gap", "Deadrock Gap", "World's Edge Mountains", 1330, 780),
    ("fw-the-wolf-lands", "The Wolf Lands", "World's Edge Mountains", 1400, 850),
    ("fw-death-pass", "Death Pass", "Border Princes", 1140, 920),
    ("fw-blood-river-valley", "Blood River Valley", "Border Princes", 1200, 900),
    ("fw-eastern-badlands", "Eastern Badlands", "Badlands", 1250, 855),
    ("fw-western-badlands", "Western Badlands", "Badlands", 1060, 805),
    ("fw-marshes-of-madness", "Marshes of Madness", "Badlands", 1120, 960),
    ("fw-blightwater", "Blightwater", "The Southlands", 1250, 970),
    ("fw-the-barrier-idols", "The Barrier Idols", "The Southlands", 950, 930),
    ("fw-parravon", "Parravon", "Bretonnia", 880, 540),
    ("fw-mousillon", "Mousillon", "Bretonnia", 700, 550),
]

print("total points:", len(POINTS))

ids = [p[0] for p in POINTS]
assert len(ids) == len(set(ids)), "duplicate ids!"

ULTHUAN_IDS = {
    "fw-lothern", "fw-eataine", "fw-caledor", "fw-saphery", "fw-tor-yvresse",
    "fw-chrace", "fw-avelorn", "fw-ellyrion", "fw-cothique", "fw-tiranoc",
    "fw-nagarythe", "fw-blighted-isle", "fw-armheim", "fw-gaen-vale",
}
cx = sum(p[3] for p in POINTS if p[0] in ULTHUAN_IDS) / len(ULTHUAN_IDS)
cy = sum(p[4] for p in POINTS if p[0] in ULTHUAN_IDS) / len(ULTHUAN_IDS)
SCALE_ULTHUAN = 1.35

adj_points = []
for pid, name, region, lx, ly in POINTS:
    if pid in ULTHUAN_IDS:
        lx = cx + (lx - cx) * SCALE_ULTHUAN
        ly = cy + (ly - cy) * SCALE_ULTHUAN
    adj_points.append((pid, name, region, lx, ly))

converted = []
for pid, name, region, lx, ly in adj_points:
    x = round(lx * SX)
    y = round(ly * SY)
    converted.append((pid, name, region, x, y))

too_close = []
for i in range(len(converted)):
    for j in range(i+1, len(converted)):
        _, _, _, x1, y1 = converted[i]
        _, _, _, x2, y2 = converted[j]
        d = math.hypot(x1-x2, y1-y2)
        if d < 45:
            too_close.append((converted[i][0], converted[j][0], round(d,1)))

print("too close pairs (<45px):", len(too_close))
for a in too_close:
    print(" ", a)

oob = [c for c in converted if not (0 <= c[3] <= UNL_W and 0 <= c[4] <= UNL_H)]
print("out of bounds:", oob)

with open("points_converted.json", "w") as f:
    json.dump(converted, f, indent=2)

img = Image.open(r"D:\Projects\Chronicle-of-Conquest\public\maps\fantasy-world.jpg").convert("RGB")
draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font = ImageFont.load_default()

for pid, name, region, x, y in converted:
    r = 6
    draw.ellipse((x-r, y-r, x+r, y+r), fill=(220,20,20), outline=(0,0,0))
    draw.text((x+8, y-8), name, fill=(0,0,0), font=font)

img.save("overlay_full.png")
print("saved overlay_full.png", img.size)
