#!/usr/bin/env python3
"""Give every catalog item (arme/armure/outil/consommable) a unique photographic WebP
from the same-universe image pool (+ optional remap from large equipment files).
Never cross mangas. Also builds relic WebPs from SVG + pool texture.
Writes qa/v23/fill-all-gear.json
"""
from __future__ import annotations
import json, random, re, xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from fill_missing_art_v12 import ASSETS, QA, WORLD, best_eq_match, has_file, hsl_to_rgb, index_equipment, seed_from

ROOT = Path(__file__).resolve().parents[1]
MIN_SRC = 25000
OUT_MIN = 18000


def universe_pool(world: str) -> list[Path]:
    portraits = [
        p
        for p in (ASSETS / f"portraits-{world}").glob("*.webp")
        if p.stat().st_size >= MIN_SRC
    ]
    equipment = [
        p
        for p in (ASSETS / "equipment" / world).glob("*.webp")
        if p.stat().st_size >= 35000
    ]
    # prefer larger photographic portraits; keep some big eq
    pool = sorted(portraits + equipment, key=lambda p: p.stat().st_size, reverse=True)
    return pool


def pick_src(pool: list[Path], key: str, prefer: Path | None = None) -> Path:
    if prefer and prefer.exists() and prefer.stat().st_size >= MIN_SRC:
        return prefer
    rng = random.Random(seed_from(key))
    return pool[rng.randrange(0, len(pool))]


def category_frame(im: Image.Image, category: str, key: str, label: str) -> Image.Image:
    w, h = 512, 640
    rng = random.Random(seed_from(key + ":frame"))
    base = im.convert("RGB")
    # unique crop
    bw, bh = base.size
    zoom = 1.05 + rng.randrange(0, 25) / 100
    cw, ch = int(bw / zoom), int(bh / zoom)
    left = rng.randrange(0, max(1, bw - cw))
    top = rng.randrange(0, max(1, bh - ch))
    base = base.crop((left, top, left + cw, top + ch)).resize((w, h), Image.Resampling.LANCZOS)
    if rng.random() < 0.3:
        base = ImageOps.mirror(base)
    # category color grade
    grades = {
        "arme": (0.22, (40, 10, 10)),
        "armure": (0.2, (10, 20, 45)),
        "outil": (0.18, (10, 35, 20)),
        "consommable": (0.2, (45, 30, 5)),
    }
    strength, tint = grades.get(category, (0.18, (30, 20, 40)))
    overlay = Image.new("RGB", (w, h), tint)
    base = Image.blend(base, overlay, strength)
    base = ImageEnhance.Contrast(base).enhance(1.12)
    base = ImageEnhance.Color(base).enhance(1.08)

    # gear plate / vignette
    plate = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(plate)
    d.rounded_rectangle([18, 18, w - 19, h - 19], radius=28, outline=(255, 255, 255, 70), width=3)
    # bottom banner
    d.rectangle([0, h - 110, w, h], fill=(8, 8, 14, 170))
    # category chip
    chip = {
        "arme": ("ARME", (220, 80, 60)),
        "armure": ("ARMURE", (70, 120, 220)),
        "outil": ("OUTIL", (70, 180, 110)),
        "consommable": ("BONUS", (230, 170, 50)),
    }.get(category, ("ITEM", (180, 140, 220)))
    d.rounded_rectangle([24, 24, 150, 64], radius=12, fill=(*chip[1], 210))
    # silhouette accent by category
    if category == "arme":
        d.polygon([(380, 80), (470, 120), (430, 520), (360, 500)], fill=(255, 255, 255, 35))
    elif category == "armure":
        d.ellipse([150, 120, 360, 420], outline=(255, 255, 255, 40), width=6)
    elif category == "consommable":
        d.ellipse([200, 160, 310, 420], fill=(255, 255, 255, 28))
    else:
        d.rectangle([90, 280, 420, 340], fill=(255, 255, 255, 30))

    out = Image.alpha_composite(base.convert("RGBA"), plate).convert("RGB")
    # monogram
    letters = "".join(ch for ch in label.upper() if ch.isalnum())[:3] or "KA"
    draw = ImageDraw.Draw(out)
    draw.text((32, h - 78), letters, fill=(240, 235, 230))
    draw.text((32, 34), chip[0], fill=(255, 255, 255))
    return out


def save_gear(dest: Path, src: Path, category: str, key: str, name: str):
    im = Image.open(src)
    framed = category_frame(im, category, key, name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    framed.save(dest, format="WEBP", quality=92, method=6)


def parse_svg_colors(svg_text: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    cols = re.findall(r"#([0-9a-fA-F]{6})", svg_text)
    if not cols:
        return (120, 80, 180), (40, 30, 70)
    def hex_to(c):
        return tuple(int(c[i : i + 2], 16) for i in (0, 2, 4))
    c1 = hex_to(cols[0])
    c2 = hex_to(cols[1] if len(cols) > 1 else cols[0])
    return c1, c2


def make_relic_webp(rid: str, name: str, svg_path: Path, pool: list[Path], dest: Path):
    rng = random.Random(seed_from("relic:" + rid))
    src = pool[rng.randrange(0, len(pool))] if pool else None
    w = h = 512
    if src:
        im = Image.open(src).convert("RGB")
        bw, bh = im.size
        z = 1.1 + rng.randrange(0, 20) / 100
        cw, ch = int(bw / z), int(bh / z)
        left = rng.randrange(0, max(1, bw - cw))
        top = rng.randrange(0, max(1, bh - ch))
        im = im.crop((left, top, left + cw, top + ch)).resize((w, h), Image.Resampling.LANCZOS)
        im = Image.blend(im, Image.new("RGB", (w, h), (30, 20, 55)), 0.35)
    else:
        im = Image.new("RGB", (w, h), (24, 16, 40))
    c1, c2 = (120, 80, 180), (40, 30, 70)
    if svg_path.exists():
        c1, c2 = parse_svg_colors(svg_path.read_text(encoding="utf-8", errors="ignore"))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.ellipse([56, 56, 456, 456], fill=(*c2, 180))
    d.ellipse([96, 96, 416, 416], fill=(*c1, 200))
    # star / relic glyph
    d.polygon(
        [(256, 120), (286, 210), (380, 210), (304, 268), (330, 360), (256, 310), (182, 360), (208, 268), (132, 210), (226, 210)],
        fill=(255, 255, 255, 220),
    )
    d.rounded_rectangle([18, 18, w - 19, h - 19], radius=28, outline=(255, 220, 140, 90), width=4)
    d.rectangle([0, h - 90, w, h], fill=(10, 8, 18, 180))
    out = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    ImageDraw.Draw(out).text((28, h - 62), (name or rid)[:18].upper(), fill=(245, 235, 210))
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, format="WEBP", quality=92, method=6)


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    idx = {k: v for k, v in index_equipment().items() if v.stat().st_size >= MIN_SRC}
    report = {"items": {"remapped": 0, "pooled": 0, "byUniverse": {}}, "relics": 0}

    for u, world in WORLD.items():
        pool = universe_pool(world)
        if not pool:
            raise SystemExit(f"empty pool for {u}")
        folder = ASSETS / "equipment" / world
        folder.mkdir(parents=True, exist_ok=True)
        rem = pooled = 0
        for it in [x for x in cat["items"] if x["universe"] == u]:
            key = f"{u}:{it['id']}"
            dest = folder / f"{it['id']}.webp"
            category = it.get("category") or "outil"
            prefer = best_eq_match(it, idx)
            # Always rebuild to photographic pool style unless already a large remapped photo (>40k from old eq)
            existing = has_file(folder, it["id"])
            if existing and existing.stat().st_size >= 40000 and prefer and prefer.resolve() == existing.resolve():
                rem += 1
                continue
            src = pick_src(pool, key, prefer if prefer and prefer.stat().st_size >= MIN_SRC else None)
            save_gear(dest, src, category, key, it.get("name") or it["id"])
            if prefer and src.resolve() == prefer.resolve():
                rem += 1
            else:
                pooled += 1
        report["items"]["remapped"] += rem
        report["items"]["pooled"] += pooled
        report["items"]["byUniverse"][u] = {"remapped": rem, "pooled": pooled, "pool": len(pool)}
        print(u, report["items"]["byUniverse"][u], flush=True)

    # relics — use a mixed large pool (prefer JOJO/DB large portraits for variety but keep editorial)
    relic_js = (ROOT / "src" / "v22" / "relics.js").read_text(encoding="utf-8")
    relic_ids = re.findall(r"make\('([a-z0-9_]+)'\s*,\s*'([^']*)'", relic_js)
    # fallback if names not captured
    if not relic_ids:
        relic_ids = [(rid, rid) for rid in re.findall(r"make\('([a-z0-9_]+)'", relic_js)]
    mixed = []
    for w in WORLD.values():
        mixed.extend(universe_pool(w)[:40])
    relics_dir = ASSETS / "v22" / "relics"
    for rid, name in relic_ids:
        svg = relics_dir / f"{rid}.svg"
        dest = relics_dir / f"{rid}.webp"
        make_relic_webp(rid, name, svg, mixed or universe_pool("db"), dest)
        report["relics"] += 1
    print("relics", report["relics"], flush=True)

    out = QA / "fill-all-gear.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)
    print("wrote", out, flush=True)


if __name__ == "__main__":
    main()
