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


def make_arena(portraits: list[Path], w=1280, h=720) -> Image.Image:
    canvas = Image.new("RGB", (w, h), (14, 8, 28))
    draw = ImageDraw.Draw(canvas)
    for y in range(h):
        t = y / (h - 1)
        draw.line(
            [(0, y), (w, y)],
            fill=(int(24 + 30 * t), int(10 + 15 * t), int(42 + 20 * (1 - t))),
        )
    # floor ellipse
    draw.ellipse([120, 420, w - 120, h - 40], fill=(40, 22, 70))
    # two fighters from pool
    for path, cx in zip(portraits[:2], (340, 940)):
        im = Image.open(path).convert("RGB")
        im = tint_purple(im, 0.22).resize((420, 560), Image.Resampling.LANCZOS)
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).ellipse([20, 20, 400, 540], fill=230)
        mask = mask.filter(ImageFilter.GaussianBlur(8))
        canvas.paste(im, (cx - 210, 90), mask)
    # stand aura rings
    for r in (80, 120, 160):
        draw.ellipse([w // 2 - r, 280 - r // 2, w // 2 + r, 280 + r // 2], outline=(180, 120, 255), width=3)
    return canvas


def main():
    portraits = best_portraits(8)
    if len(portraits) < 3:
        raise SystemExit(f"need JoJo portrait pool, found {len(portraits)}")
    OUT_H.parent.mkdir(parents=True, exist_ok=True)
    OUT_A.parent.mkdir(parents=True, exist_ok=True)
    horizon = make_horizon(portraits[:3])
    arena = make_arena(portraits[3:5] if len(portraits) >= 5 else portraits[:2])
    horizon.save(OUT_H, format="WEBP", quality=88, method=4)
    arena.save(OUT_A, format="WEBP", quality=88, method=4)
    print("wrote", OUT_H, OUT_H.stat().st_size)
    print("wrote", OUT_A, OUT_A.stat().st_size)
    print("from", [p.name for p in portraits[:5]])


if __name__ == "__main__":
    main()
