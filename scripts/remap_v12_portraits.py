#!/usr/bin/env python3
"""Remap existing portraits onto V12 hero IDs (never stylized). Copies matches; reports missing."""
from __future__ import annotations
import json, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
DATA = ROOT / "src" / "survival" / "data.js"
FOLDERS = {
    "DB": ASSETS / "portraits-db",
    "HXH": ASSETS / "portraits-hxh",
    "NARUTO": ASSETS / "portraits-naruto",
    "ONEPIECE": ASSETS / "portraits-onepiece",
    "JOJO": ASSETS / "portraits-jojo",
}
EXTS = (".webp", ".png", ".jpg", ".jpeg")

def norm(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

def index_folder(folder: Path) -> dict[str, Path]:
    out = {}
    if not folder.exists():
        return out
    for p in folder.iterdir():
        if p.suffix.lower() in EXTS and p.is_file():
            out[norm(p.stem)] = p
    return out

def parse_heroes() -> dict[str, list[dict]]:
    text = DATA.read_text(encoding="utf-8")
    # SURVIVAL_DATA is export const SURVIVAL_DATA={...};
    m = re.search(r"export const SURVIVAL_DATA=(\{.*\})\s*;?\s*$", text, re.S)
    if not m:
        raise SystemExit("SURVIVAL_DATA not found")
    # data.js may use JS trailing commas / unquoted keys — use node instead if needed
    raw = m.group(1)
    # cheap: pull id/name/person/universe via regex per hero block
    by_u: dict[str, list[dict]] = {u: [] for u in FOLDERS}
    for u in FOLDERS:
        block = re.search(rf'"{u}"\s*:\s*\{{(.*?)\n\s*\}}(?=\s*,\s*"|\s*\}}\s*$)', raw, re.S)
        if not block:
            # try unquoted
            block = re.search(rf'{u}\s*:\s*\{{(.*?)\n\s*\}}(?=\s*,\s*\w|\s*\}}\s*$)', raw, re.S)
        if not block:
            continue
        heroes_m = re.search(r"heroes\s*:\s*\[(.*)\]\s*,\s*items", block.group(1), re.S)
        if not heroes_m:
            continue
        for hm in re.finditer(r'\{[^{}]*?"id"\s*:\s*"([^"]+)"[^{}]*?\}', heroes_m.group(1), re.S):
            chunk = hm.group(0)
            id_ = hm.group(1)
            name = re.search(r'"name"\s*:\s*"([^"]*)"', chunk)
            person = re.search(r'"person"\s*:\s*"([^"]*)"', chunk)
            by_u[u].append({
                "id": id_,
                "name": name.group(1) if name else id_,
                "person": person.group(1) if person else id_,
            })
    return by_u

def best_match(hero: dict, idx: dict[str, Path]) -> Path | None:
    candidates = [
        norm(hero["id"]),
        norm(hero["id"].split(":", 1)[-1]),
        norm(hero["person"]),
        norm(hero["name"]),
        norm(f"{hero['person']}-{hero['name']}"),
    ]
    for c in candidates:
        if c in idx:
            return idx[c]
    # fuzzy: stem contains person token
    person = norm(hero["person"])
    if len(person) >= 4:
        hits = [p for k, p in idx.items() if person in k]
        if len(hits) == 1:
            return hits[0]
    return None

def main():
    for folder in FOLDERS.values():
        folder.mkdir(parents=True, exist_ok=True)
    heroes = parse_heroes()
    report = {"copied": 0, "already": 0, "missing": [], "byUniverse": {}}
    for u, list_ in heroes.items():
        folder = FOLDERS[u]
        idx = index_folder(folder)
        # also search sibling folders for remaps (esp. DB id changes)
        pooled = dict(idx)
        for other, of in FOLDERS.items():
            if other == u:
                continue
            for k, p in index_folder(of).items():
                pooled.setdefault(k, p)
        miss = []
        matched = 0
        for h in list_:
            dest = folder / f"{h['id']}.webp"
            if dest.exists() or any((folder / f"{h['id']}{e}").exists() for e in EXTS):
                report["already"] += 1
                matched += 1
                continue
            src = best_match(h, pooled)
            if not src:
                miss.append(h["id"])
                continue
            if src.suffix.lower() == ".webp":
                shutil.copy2(src, dest)
            else:
                # keep original extension if not webp
                dest = folder / f"{h['id']}{src.suffix.lower()}"
                shutil.copy2(src, dest)
            report["copied"] += 1
            matched += 1
        report["byUniverse"][u] = {"heroes": len(list_), "matched": matched, "missing": len(miss)}
        report["missing"].extend(f"{u}:{x}" for x in miss)
    out = ROOT / "qa" / "v23" / "portrait-remap-v12.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report["byUniverse"], indent=2))
    print("copied", report["copied"], "already", report["already"], "missing", len(report["missing"]))
    print("wrote", out)

if __name__ == "__main__":
    main()
