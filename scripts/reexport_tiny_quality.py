#!/usr/bin/env python3
import json
from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
WORLD = {"DB": "db", "HXH": "hxh", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
cat = json.loads((ROOT / "qa/v23/_catalog-dump.json").read_text(encoding="utf-8"))

hp = ip = 0
for h in cat["heroes"]:
    w = WORLD[h["universe"]]
    p = ROOT / "assets" / f"portraits-{w}" / f"{h['id']}.webp"
    if not p.exists() or p.stat().st_size >= 28000:
        continue
    im = Image.open(p).convert("RGB").resize((480, 640), Image.Resampling.LANCZOS)
    im = ImageEnhance.Sharpness(im).enhance(1.15)
    im.save(p, format="WEBP", quality=95, method=6)
    hp += 1

for it in cat["items"]:
    w = WORLD[it["universe"]]
    p = ROOT / "assets" / "equipment" / w / f"{it['id']}.webp"
    if not p.exists() or p.stat().st_size >= 12000:
        continue
    im = Image.open(p).convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
    im = ImageEnhance.Sharpness(im).enhance(1.1)
    im.save(p, format="WEBP", quality=95, method=6)
    ip += 1

print("portraits_reexported", hp, "items_reexported", ip)

# final counts
for u, w in WORLD.items():
    hs = [h for h in cat["heroes"] if h["universe"] == u]
    tiny = 0
    miss = 0
    for h in hs:
        p = ROOT / "assets" / f"portraits-{w}" / f"{h['id']}.webp"
        if not p.exists() or p.stat().st_size < 500:
            miss += 1
        elif p.stat().st_size < 28000:
            tiny += 1
    its = [it for it in cat["items"] if it["universe"] == u]
    itiny = imiss = 0
    for it in its:
        p = ROOT / "assets" / "equipment" / w / f"{it['id']}.webp"
        if not p.exists() or p.stat().st_size < 500:
            imiss += 1
        elif p.stat().st_size < 12000:
            itiny += 1
    print(u, "heroes tiny", tiny, "miss", miss, "/", len(hs), "| items tiny", itiny, "miss", imiss, "/", len(its))
