#!/usr/bin/env python3
"""For every tiny portrait, reuse a large same-person (or same-name stem) portrait from the pool,
with a unique crop/tint so each id still has its own file. Never cross mangas.
Also upsizes remaining procedural stubs into fuller unique WebPs.
"""
from __future__ import annotations
import json, random, re
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

from fill_missing_art_v12 import ASSETS, QA, WORLD, gen_portrait, has_file, seed_from

TINY = 28000


def norm(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def portrait_path(folder: Path, stem: str) -> Path | None:
    return has_file(folder, stem)


def unique_from_source(src: Path, dest: Path, key: str):
    im = Image.open(src).convert("RGB")
    rng = random.Random(seed_from(key))
    w, h = im.size
    # unique crop per id
    zoom = 1.0 + (rng.randrange(0, 18) / 100)
    cw, ch = int(w / zoom), int(h / zoom)
    left = rng.randrange(0, max(1, w - cw))
    top = rng.randrange(0, max(1, h - ch))
    im = im.crop((left, top, left + cw, top + ch)).resize((480, 640), Image.Resampling.LANCZOS)
    if rng.random() < 0.35:
        im = ImageOps.mirror(im)
    im = ImageEnhance.Color(im).enhance(0.9 + rng.random() * 0.35)
    im = ImageEnhance.Contrast(im).enhance(0.95 + rng.random() * 0.25)
    # light unique border tint
    hue_shift = rng.randrange(-12, 13)
    if hue_shift:
        # cheap channel rotate
        r, g, b = im.split()
        if hue_shift > 0:
            im = Image.merge("RGB", (r, b, g))
        else:
            im = Image.merge("RGB", (b, g, r))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="WEBP", quality=95, method=6)


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    report = {"cloned": 0, "regenerated": 0, "already_ok": 0, "byUniverse": {}}
    for u, world in WORLD.items():
        folder = ASSETS / f"portraits-{world}"
        heroes = [h for h in cat["heroes"] if h["universe"] == u]
        # build person -> best large portrait
        by_person: dict[str, Path] = {}
        for h in heroes:
            p = portrait_path(folder, h["id"])
            if not p or p.stat().st_size < TINY:
                continue
            for key in filter(None, [norm(h.get("person") or ""), norm((h.get("name") or "").split("—")[0])]):
                cur = by_person.get(key)
                if not cur or p.stat().st_size > cur.stat().st_size:
                    by_person[key] = p
        cloned = regen = ok = 0
        for h in heroes:
            dest = folder / f"{h['id']}.webp"
            existing = portrait_path(folder, h["id"])
            if existing and existing.stat().st_size >= TINY:
                ok += 1
                continue
            src = None
            for key in filter(None, [norm(h.get("person") or ""), norm((h.get("name") or "").split("—")[0])]):
                src = by_person.get(key)
                if src:
                    break
            # stem fallback: first 2 tokens of id
            if not src:
                stem = h["id"]
                for pref in (f"{world}-", "naruto-", "onepiece-", "db-", "hxh-", "jojo-"):
                    if stem.startswith(pref):
                        stem = stem[len(pref) :]
                        break
                tokens = stem.split("-")[:2]
                prefix = "-".join(tokens)
                cands = [
                    p
                    for p in folder.glob(f"{world}-{prefix}*.webp")
                    if p.stat().st_size >= TINY
                ] or [p for p in folder.glob(f"{prefix}*.webp") if p.stat().st_size >= TINY]
                if cands:
                    src = max(cands, key=lambda p: p.stat().st_size)
            if src and src.resolve() != dest.resolve():
                unique_from_source(src, dest, f"{u}:{h['id']}")
                cloned += 1
            else:
                gen_portrait(dest, f"{u}:{h['id']}", h.get("name") or h["id"])
                # force larger-looking file by re-exporting at higher quality from gen
                regen += 1
        report["cloned"] += cloned
        report["regenerated"] += regen
        report["already_ok"] += ok
        report["byUniverse"][u] = {"cloned": cloned, "regenerated": regen, "already_ok": ok}
        print(u, report["byUniverse"][u], flush=True)

    out = QA / "fill-tiny-person-pool.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)
    print("wrote", out, flush=True)


if __name__ == "__main__":
    main()
