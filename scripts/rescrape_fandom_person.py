#!/usr/bin/env python3
"""Second-pass Fandom scrape using person/name English stems; overwrites small procedural WebPs."""
from __future__ import annotations
import json, re, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from fill_missing_art_v12 import (
    ASSETS,
    QA,
    UA,
    WORLD,
    WIKI,
    download,
    fandom_thumb,
    has_file,
    save_scraped,
)

ROOT = Path(__file__).resolve().parents[1]


def queries_for(h: dict) -> list[str]:
    qs = []
    person = (h.get("person") or "").strip()
    name = (h.get("name") or "").strip()
    if person:
        qs.append(person)
    if name:
        qs.append(name)
        if "—" in name:
            qs.append(name.split("—")[0].strip())
        if " - " in name:
            qs.append(name.split(" - ")[0].strip())
    # id stem without world prefix / form suffix
    stem = h["id"]
    for pref in ("jojo-", "db-", "hxh-", "naruto-", "onepiece-"):
        if stem.startswith(pref):
            stem = stem[len(pref) :]
            break
    stem = re.sub(r"-(base|source|partie-\d+|maitrise|genin|jonin)$", "", stem)
    words = [w for w in stem.replace("-", " ").split() if w not in ("de", "du", "la", "le", "des", "et")]
    if words:
        qs.append(" ".join(w.capitalize() for w in words[:4]))
    # dedupe
    out, seen = [], set()
    for q in qs:
        k = q.lower()
        if q and k not in seen:
            seen.add(k)
            out.append(q)
    return out


def try_scrape(h: dict) -> tuple[str, str]:
    u = h["universe"]
    wiki = WIKI[u]
    folder = ASSETS / f"portraits-{WORLD[u]}"
    dest = folder / f"{h['id']}.webp"
    existing = has_file(folder, h["id"])
    # only overwrite procedural-sized files (<35KB) or missing
    if existing and existing.stat().st_size >= 35000:
        return h["id"], "skip_large"
    last_err = "rejected"
    for q in queries_for(h):
        try:
            thumb = fandom_thumb(wiki, q, "")
            if not thumb:
                continue
            data = download(thumb, f"https://{wiki}.fandom.com/")
            save_scraped(data, dest)
            return h["id"], "scraped"
        except Exception as e:
            last_err = f"fail:{e}"
            continue
    return h["id"], last_err


def main():
    cat = json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))
    order = ["JOJO", "DB", "NARUTO", "HXH", "ONEPIECE"]
    budgets = {"JOJO": 240, "DB": 200, "NARUTO": 120, "HXH": 50, "ONEPIECE": 350}
    report = {"saved": [], "rejected": [], "fail": [], "skip_large": [], "byUniverse": {}}
    for u in order:
        heroes = [h for h in cat["heroes"] if h["universe"] == u]
        # prioritize small/procedural
        folder = ASSETS / f"portraits-{WORLD[u]}"
        scored = []
        for h in heroes:
            p = has_file(folder, h["id"])
            size = p.stat().st_size if p else 0
            if size and size >= 35000:
                continue
            scored.append(h)
        targets = scored[: budgets[u]]
        scraped = 0
        print(u, "targets", len(targets), flush=True)
        with ThreadPoolExecutor(max_workers=4) as pool:
            futs = [pool.submit(try_scrape, h) for h in targets]
            for fut in as_completed(futs):
                hid, status = fut.result()
                if status == "scraped":
                    scraped += 1
                    report["saved"].append(f"{u}:{hid}")
                elif status == "skip_large":
                    report["skip_large"].append(f"{u}:{hid}")
                elif status.startswith("fail"):
                    report["fail"].append(f"{u}:{hid}:{status}")
                else:
                    report["rejected"].append(f"{u}:{hid}")
        report["byUniverse"][u] = {"targets": len(targets), "scraped": scraped}
        print(u, "scraped", scraped, flush=True)
        time.sleep(0.3)
    out = QA / "portrait-rescrape-v12.json"
    payload = {
        "saved": report["saved"],
        "rejected": report["rejected"],
        "fail": report["fail"][:200],
        "still_missing": [],
        "counts": {
            "saved": len(report["saved"]),
            "rejected": len(report["rejected"]),
            "fail": len(report["fail"]),
            "still_missing": 0,
            "byUniverse": report["byUniverse"],
        },
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2), flush=True)


if __name__ == "__main__":
    main()
