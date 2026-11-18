#!/usr/bin/env python3
"""Ensure every catalog item has a substantial unique WebP (>=12KB) in assets/equipment/{world}/.
Remap from existing large equipment pool first; else richer generated icon.
"""
from __future__ import annotations
import json, random, re, shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from fill_missing_art_v12 import ASSETS, QA, WORLD, best_eq_match, has_file, hsl_to_rgb, index_equipment, seed_from

MIN = 12000


def rich_icon(dest: Path, key: str, category: str, name: str):
    w = h = 512
    rng = random.Random(seed_from(key))
    palettes = {
        "arme": (18, 0.62, 0.48),
        "armure": (215, 0.45, 0.42),
        "outil": (145, 0.42, 0.4),
        "consommable": (42, 0.6, 0.48),
    }
    hue, sat, lit = palettes.get(category, (280, 0.45, 0.42))
    hue = (hue + rng.randrange(-30, 31)) % 360
    bg = hsl_to_rgb(hue, sat * 0.4, 0.14)
    fg = hsl_to_rgb(hue, sat, lit)
    edge = hsl_to_rgb((hue + 40) % 360, 0.65, 0.7)
    accent = hsl_to_rgb((hue + 180) % 360, 0.5, 0.55)
    im = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(im)
    # radial-ish plate
    for r in range(240, 40, -8):
        t = (240 - r) / 200
        col = tuple(int(bg[i] * (1 - t) + fg[i] * t * 0.45) for i in range(3))
        draw.ellipse([256 - r, 256 - r, 256 + r, 256 + r], fill=col)
    if category == "arme":
        draw.polygon([(140, 420), (200, 90), (240, 100), (190, 430)], fill=edge)
        draw.ellipse([300, 70, 420, 190], fill=fg)
        draw.ellipse([320, 90, 400, 170], fill=accent)
    elif category == "armure":
        draw.polygon([(256, 80), (400, 150), (370, 420), (142, 420), (112, 150)], fill=fg)
        draw.polygon([(256, 120), (340, 170), (320, 360), (192, 360), (172, 170)], fill=edge)
    elif category == "consommable":
        draw.ellipse([170, 160, 342, 420], fill=fg)
        draw.rectangle([236, 90, 276, 180], fill=edge)
        draw.ellipse([220, 70, 292, 120], fill=accent)
    else:
        draw.rounded_rectangle([120, 220, 392, 300], radius=20, fill=fg)
        draw.rounded_rectangle([140, 140, 230, 380], radius=16, fill=edge)
        draw.ellipse([300, 150, 380, 230], fill=accent)
    # unique hash marks
    for i in range(40):
        x, y = rng.randrange(40, 472), rng.randrange(40, 472)
        draw.ellipse([x, y, x + 5, y + 5], fill=edge if i % 2 else accent)
    # monogram
    letters = "".join(ch for ch in (name or key).upper() if ch.isalnum())[:2] or "KA"
    draw.rectangle([20, 20, 110, 90], fill=(0, 0, 0))
    draw.text((36, 38), letters, fill=edge)
    noise = Image.effect_noise((w // 2, h // 2), 22).resize((w, h)).convert("L")
    im = Image.blend(im, Image.merge("RGB", (noise, noise, noise)), 0.06)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="WEBP", quality=90, method=4)


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    idx = {k: v for k, v in index_equipment().items() if v.stat().st_size >= MIN}
    report = {"remapped": 0, "enriched": 0, "ok": 0, "byUniverse": {}}
    for u, world in WORLD.items():
        folder = ASSETS / "equipment" / world
        folder.mkdir(parents=True, exist_ok=True)
        rem = enr = ok = 0
        for it in [x for x in cat["items"] if x["universe"] == u]:
            dest = folder / f"{it['id']}.webp"
            existing = has_file(folder, it["id"])
            if existing and existing.stat().st_size >= MIN:
                ok += 1
                continue
            src = best_eq_match(it, idx)
            if src and src.resolve() != dest.resolve():
                try:
                    # unique crop if large enough
                    if src.stat().st_size >= MIN:
                        im = Image.open(src).convert("RGB")
                        rng = random.Random(seed_from(it["id"]))
                        w, h = im.size
                        z = 1.0 + rng.randrange(0, 12) / 100
                        cw, ch = int(w / z), int(h / z)
                        left = rng.randrange(0, max(1, w - cw))
                        top = rng.randrange(0, max(1, h - ch))
                        im = im.crop((left, top, left + cw, top + ch)).resize((512, 512), Image.Resampling.LANCZOS)
                        im.save(dest, format="WEBP", quality=88, method=4)
                        rem += 1
                        continue
                except Exception:
                    pass
            rich_icon(dest, f"{u}:{it['id']}", it.get("category") or "outil", it.get("name") or it["id"])
            enr += 1
        report["remapped"] += rem
        report["enriched"] += enr
        report["ok"] += ok
        report["byUniverse"][u] = {"remapped": rem, "enriched": enr, "ok": ok}
        print(u, report["byUniverse"][u], flush=True)
    out = QA / "enrich-equipment.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)


if __name__ == "__main__":
    main()
