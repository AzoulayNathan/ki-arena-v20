#!/usr/bin/env python3
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORLD = {"DB": "db", "HXH": "hxh", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
EXTS = (".webp", ".png", ".jpg", ".jpeg")


def has(folder: Path, stem: str) -> bool:
    return any((folder / f"{stem}{e}").is_file() and (folder / f"{stem}{e}").stat().st_size > 500 for e in EXTS)


def main():
    cat = json.loads((ROOT / "qa/v23/_catalog-dump.json").read_text(encoding="utf-8"))
    miss_h, miss_i = [], []
    for h in cat["heroes"]:
        folder = ROOT / "assets" / f"portraits-{WORLD[h['universe']]}"
        if not has(folder, h["id"]):
            miss_h.append(f"{h['universe']}:{h['id']}")
    for it in cat["items"]:
        folder = ROOT / "assets" / "equipment" / WORLD[it["universe"]]
        if not has(folder, it["id"]):
            miss_i.append(f"{it['universe']}:{it['id']}")
    relics = re.findall(r"make\('([a-z0-9_]+)'", (ROOT / "src/v22/relics.js").read_text(encoding="utf-8"))
    miss_r = [r for r in relics if not (ROOT / "assets/v22/relics" / f"{r}.svg").exists()]
    out = {
        "heroes_total": len(cat["heroes"]),
        "items_total": len(cat["items"]),
        "relics_total": len(relics),
        "missing_heroes": miss_h,
        "missing_items": miss_i,
        "missing_relics": miss_r,
        "ok": not (miss_h or miss_i or miss_r),
    }
    path = ROOT / "qa/v23/zero-empty-art.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("ok", out["ok"], "miss_h", len(miss_h), "miss_i", len(miss_i), "miss_r", len(miss_r), "->", path)
    return 0 if out["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
