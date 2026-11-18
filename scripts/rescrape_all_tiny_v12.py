#!/usr/bin/env python3
"""Rescrape EVERY catalog hero/item still on tiny procedural art. One attempt chain per id.
Portraits: Fandom via curl. Equipment: remap old pool then keep unique generated if no match.
Writes qa/v23/rescrape-all-tiny.json
"""
from __future__ import annotations
import json, re, shutil, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from fill_missing_art_v12 import (
    ASSETS,
    QA,
    WORLD,
    WIKI,
    best_eq_match,
    download,
    fandom_thumb,
    gen_item_icon,
    gen_portrait,
    has_file,
    index_equipment,
    save_scraped,
)
from rescrape_fandom_person import queries_for

ROOT = Path(__file__).resolve().parents[1]
PORTRAIT_TINY = 28000
ITEM_TINY = 8000


def portrait_size(folder: Path, stem: str) -> int:
    p = has_file(folder, stem)
    return p.stat().st_size if p else 0


def scrape_hero(h: dict) -> tuple[str, str]:
    u = h["universe"]
    wiki = WIKI[u]
    folder = ASSETS / f"portraits-{WORLD[u]}"
    dest = folder / f"{h['id']}.webp"
    for q in queries_for(h):
        try:
            thumb = fandom_thumb(wiki, q, "")
            if not thumb:
                continue
            data = download(thumb, f"https://{wiki}.fandom.com/")
            save_scraped(data, dest)
            if dest.stat().st_size >= PORTRAIT_TINY:
                return h["id"], "scraped"
        except Exception:
            continue
    # ensure non-empty unique file remains
    if portrait_size(folder, h["id"]) < 500:
        gen_portrait(dest, f"{u}:{h['id']}", h.get("name") or h["id"])
        return h["id"], "generated"
    return h["id"], "kept_tiny"


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    report = {
        "portraits": {"scraped": [], "kept_tiny": [], "generated": [], "byUniverse": {}},
        "equipment": {"remapped": [], "generated": [], "already_ok": [], "byUniverse": {}},
    }
    order = ["JOJO", "DB", "NARUTO", "HXH", "ONEPIECE"]

    # --- portraits ---
    for u in order:
        folder = ASSETS / f"portraits-{WORLD[u]}"
        targets = [
            h
            for h in cat["heroes"]
            if h["universe"] == u and portrait_size(folder, h["id"]) < PORTRAIT_TINY
        ]
        print(u, "portrait targets", len(targets), flush=True)
        scraped = kept = gen = 0
        with ThreadPoolExecutor(max_workers=5) as pool:
            futs = [pool.submit(scrape_hero, h) for h in targets]
            done = 0
            for fut in as_completed(futs):
                hid, status = fut.result()
                key = f"{u}:{hid}"
                if status == "scraped":
                    scraped += 1
                    report["portraits"]["scraped"].append(key)
                elif status == "generated":
                    gen += 1
                    report["portraits"]["generated"].append(key)
                else:
                    kept += 1
                    report["portraits"]["kept_tiny"].append(key)
                done += 1
                if done % 50 == 0:
                    print(u, "progress", done, "/", len(targets), "scraped", scraped, flush=True)
        report["portraits"]["byUniverse"][u] = {
            "targets": len(targets),
            "scraped": scraped,
            "kept_tiny": kept,
            "generated": gen,
        }
        print(u, "done", report["portraits"]["byUniverse"][u], flush=True)

    # --- equipment remap / ensure ---
    idx = index_equipment()
    # Prefer larger source files in index
    for stem, p in list(idx.items()):
        if p.stat().st_size < ITEM_TINY:
            del idx[stem]

    for u in order:
        world = WORLD[u]
        folder = ASSETS / "equipment" / world
        folder.mkdir(parents=True, exist_ok=True)
        remapped = gen = ok = 0
        for it in [x for x in cat["items"] if x["universe"] == u]:
            dest = folder / f"{it['id']}.webp"
            existing = has_file(folder, it["id"])
            if existing and existing.stat().st_size >= ITEM_TINY:
                ok += 1
                report["equipment"]["already_ok"].append(f"{u}:{it['id']}")
                continue
            src = best_eq_match(it, idx)
            if src and src.resolve() != dest.resolve() and src.stat().st_size >= ITEM_TINY:
                try:
                    shutil.copyfile(src, dest)
                    remapped += 1
                    report["equipment"]["remapped"].append(f"{u}:{it['id']}")
                    continue
                except Exception:
                    pass
            gen_item_icon(dest, f"{u}:{it['id']}", it.get("category") or "outil")
            gen += 1
            report["equipment"]["generated"].append(f"{u}:{it['id']}")
        report["equipment"]["byUniverse"][u] = {
            "remapped": remapped,
            "generated": gen,
            "already_ok": ok,
        }
        print(u, "equipment", report["equipment"]["byUniverse"][u], flush=True)

    out = {
        "portraits_scraped": len(report["portraits"]["scraped"]),
        "portraits_kept_tiny": len(report["portraits"]["kept_tiny"]),
        "portraits_generated": len(report["portraits"]["generated"]),
        "equipment_remapped": len(report["equipment"]["remapped"]),
        "equipment_generated": len(report["equipment"]["generated"]),
        "byUniverse": {
            "portraits": report["portraits"]["byUniverse"],
            "equipment": report["equipment"]["byUniverse"],
        },
        "sample_scraped": report["portraits"]["scraped"][:40],
        "sample_kept_tiny": report["portraits"]["kept_tiny"][:40],
    }
    path = QA / "rescrape-all-tiny.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: out[k] for k in out if k.startswith(("portraits", "equipment", "by"))}, indent=2), flush=True)
    print("wrote", path, flush=True)


if __name__ == "__main__":
    main()
