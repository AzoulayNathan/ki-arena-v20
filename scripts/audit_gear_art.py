#!/usr/bin/env python3
import json, re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORLD = {"DB": "db", "HXH": "hxh", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
cat = json.loads((ROOT / "qa/v23/_catalog-dump.json").read_text(encoding="utf-8"))

by = defaultdict(Counter)
sizes = defaultdict(list)
for it in cat["items"]:
    w = WORLD[it["universe"]]
    c = it.get("category") or "outil"
    p = ROOT / "assets" / "equipment" / w / f"{it['id']}.webp"
    sz = p.stat().st_size if p.exists() else 0
    by[it["universe"]][c] += 1
    sizes[(it["universe"], c)].append(sz)

print("=== items by universe/category ===")
for u in WORLD:
    print(u, dict(by[u]))
print("=== size bands ===")
for (u, c), arr in sorted(sizes.items()):
    miss = sum(1 for s in arr if s < 500)
    tiny = sum(1 for s in arr if 500 <= s < 12000)
    mid = sum(1 for s in arr if 12000 <= s < 30000)
    big = sum(1 for s in arr if s >= 30000)
    print(f"{u:8} {c:12} n={len(arr):4} miss={miss} <12k={tiny} mid={mid} big={big}")

relics = re.findall(r"make\('([a-z0-9_]+)'", (ROOT / "src/v22/relics.js").read_text(encoding="utf-8"))
rd = ROOT / "assets/v22/relics"
print(
    "relics",
    len(relics),
    "svg",
    sum(1 for r in relics if (rd / f"{r}.svg").exists()),
    "webp",
    sum(1 for r in relics if (rd / f"{r}.webp").exists()),
)
eq = list((ROOT / "assets/equipment").rglob("*.webp"))
print("equipment webp total", len(eq), "ge20k", sum(1 for p in eq if p.stat().st_size >= 20000))
print("v22/equipment", list((ROOT / "assets/v22/equipment").glob("*")) if (ROOT / "assets/v22/equipment").exists() else None)
