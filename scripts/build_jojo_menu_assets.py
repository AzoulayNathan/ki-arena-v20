#!/usr/bin/env python3
"""Build JoJo menu horizon + arena from the JoJo portrait pool (never copy other mangas)."""
from __future__ import annotations
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
POOL = ROOT / "assets" / "portraits-jojo"
OUT_H = ROOT / "assets" / "v15" / "worlds" / "jojo-horizon.webp"
OUT_A = ROOT / "assets" / "v15" / "battles" / "jojo-arena.webp"
OUT_R = ROOT / "assets" / "v16" / "jojo-recruit.webp"


def best_portraits(n: int) -> list[Path]:
    files = [p for p in POOL.glob("*.webp") if p.stat().st_size >= 35000]
    files.sort(key=lambda p: p.stat().st_size, reverse=True)
    # diversify: pick spaced across sorted list
    if len(files) <= n:
        return files
    step = max(1, len(files) // n)
    picked = [files[i * step] for i in range(n) if i * step < len(files)]
    return picked[:n]


def tint_purple(im: Image.Image, strength=0.28) -> Image.Image:
    overlay = Image.new("RGB", im.size, (90, 40, 140))
    return Image.blend(im.convert("RGB"), overlay, strength)


def make_horizon(portraits: list[Path], w=1600, h=900) -> Image.Image:
    canvas = Image.new("RGB", (w, h), (20, 10, 36))
    draw = ImageDraw.Draw(canvas)
    # gradient night
    for y in range(h):
        t = y / (h - 1)
        col = (
            int(18 + 40 * t),
            int(8 + 20 * t),
            int(36 + 50 * (1 - abs(t - 0.35))),
        )
        draw.line([(0, y), (w, y)], fill=col)
    # collage strips from JoJo faces
    slots = [
        (0, 80, 520, 820),
        (480, 40, 1040, 860),
        (980, 100, 1600, 840),
    ]
    for path, box in zip(portraits, slots):
        im = Image.open(path).convert("RGB")
        im = ImageEnhance.Color(im).enhance(1.15)
        im = tint_purple(im, 0.18)
        tw, th = box[2] - box[0], box[3] - box[1]
        im = im.resize((tw, th), Image.Resampling.LANCZOS)
        # soft mask
        mask = Image.new("L", (tw, th), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, tw - 1, th - 1], radius=36, fill=220)
        mask = mask.filter(ImageFilter.GaussianBlur(10))
        canvas.paste(im, (box[0], box[1]), mask)
    # vignette
    vig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    vd.rectangle([0, 0, w, h], outline=(0, 0, 0, 160), width=90)
    vig = vig.filter(ImageFilter.GaussianBlur(40))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), vig).convert("RGB")
    return canvas


def make_arena(portraits: list[Path], w=1672, h=941) -> Image.Image:
    canvas = Image.new("RGB", (w, h), (14, 8, 28))
    draw = ImageDraw.Draw(canvas)
    for y in range(h):
        t = y / (h - 1)
        draw.line(
            [(0, y), (w, y)],
            fill=(int(24 + 30 * t), int(10 + 15 * t), int(42 + 20 * (1 - t))),
        )
    # floor ellipse
    draw.ellipse([160, 560, w - 160, h - 50], fill=(40, 22, 70))
    # two fighters from pool
    for path, cx in zip(portraits[:2], (420, 1250)):
        im = Image.open(path).convert("RGB")
        im = tint_purple(im, 0.22).resize((520, 700), Image.Resampling.LANCZOS)
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).ellipse([24, 24, 496, 676], fill=230)
        mask = mask.filter(ImageFilter.GaussianBlur(8))
        canvas.paste(im, (cx - 260, 120), mask)
    # stand aura rings
    for r in (100, 150, 200):
        draw.ellipse([w // 2 - r, 360 - r // 2, w // 2 + r, 360 + r // 2], outline=(180, 120, 255), width=3)
    return canvas


def make_recruit(portraits: list[Path], w=1672, h=941) -> Image.Image:
    """Mode / monde choice art — JoJo pool only (never DB copy)."""
    canvas = Image.new("RGB", (w, h), (16, 8, 30))
    draw = ImageDraw.Draw(canvas)
    for y in range(h):
        t = y / (h - 1)
        draw.line(
            [(0, y), (w, y)],
            fill=(int(22 + 50 * t), int(10 + 18 * t), int(48 + 40 * (1 - abs(t - 0.4)))),
        )
    slots = [
        (40, 60, 560, 880),
        (520, 30, 1150, 900),
        (1100, 80, 1630, 860),
    ]
    for path, box in zip(portraits, slots):
        im = Image.open(path).convert("RGB")
        im = ImageEnhance.Color(im).enhance(1.2)
        im = tint_purple(im, 0.16)
        tw, th = box[2] - box[0], box[3] - box[1]
        im = im.resize((tw, th), Image.Resampling.LANCZOS)
        mask = Image.new("L", (tw, th), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, tw - 1, th - 1], radius=42, fill=230)
        mask = mask.filter(ImageFilter.GaussianBlur(12))
        canvas.paste(im, (box[0], box[1]), mask)
    # star motif
    for cx, cy, r in ((836, 120, 18), (200, 200, 10), (1480, 160, 12)):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(230, 200, 255))
    vig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(vig).rectangle([0, 0, w, h], outline=(0, 0, 0, 150), width=100)
    vig = vig.filter(ImageFilter.GaussianBlur(48))
    return Image.alpha_composite(canvas.convert("RGBA"), vig).convert("RGB")


def main():
    portraits = best_portraits(10)
    if len(portraits) < 5:
        raise SystemExit(f"need JoJo portrait pool, found {len(portraits)}")
    OUT_H.parent.mkdir(parents=True, exist_ok=True)
    OUT_A.parent.mkdir(parents=True, exist_ok=True)
    OUT_R.parent.mkdir(parents=True, exist_ok=True)
    horizon = make_horizon(portraits[:3], 1672, 941)
    arena = make_arena(portraits[3:5])
    recruit = make_recruit(portraits[5:8] if len(portraits) >= 8 else portraits[:3])
    for path, im in ((OUT_H, horizon), (OUT_A, arena), (OUT_R, recruit)):
        im.save(path, format="WEBP", quality=90, method=4)
        print("wrote", path, path.stat().st_size)
    print("from", [p.name for p in portraits[:8]])


if __name__ == "__main__":
    main()
