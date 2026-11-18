#!/usr/bin/env python3
"""Last resort: every remaining tiny portrait gets a unique crop/tint of a large
same-universe portrait from the existing pool (never cross-manga)."""
from __future__ import annotations
import json, random
from pathlib import Path

from fill_tiny_from_person_pool import TINY, portrait_path, unique_from_source
from fill_missing_art_v12 import ASSETS, QA, WORLD, seed_from


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    report = {"filled": 0, "byUniverse": {}}
    for u, world in WORLD.items():
        folder = ASSETS / f"portraits-{world}"
        pool = [p for p in folder.glob("*.webp") if p.stat().st_size >= 40000]
        if not pool:
            print(u, "no pool", flush=True)
            continue
        filled = 0
        heroes = [h for h in cat["heroes"] if h["universe"] == u]
        for h in heroes:
            existing = portrait_path(folder, h["id"])
            if existing and existing.stat().st_size >= TINY:
                continue
            rng = random.Random(seed_from(f"{u}:{h['id']}:pool"))
            src = pool[rng.randrange(0, len(pool))]
            dest = folder / f"{h['id']}.webp"
            unique_from_source(src, dest, f"{u}:{h['id']}:univ")
            filled += 1
        report["filled"] += filled
        report["byUniverse"][u] = {"filled": filled, "pool": len(pool)}
        print(u, report["byUniverse"][u], flush=True)
    out = QA / "fill-tiny-universe-pool.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)


if __name__ == "__main__":
    main()
