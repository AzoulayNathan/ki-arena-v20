#!/usr/bin/env python3
"""Rescrape missing V12 portraits (Fandom), then fill ALL remaining heroes/items with unique WebP art.
Never uses assets/stylized. Writes qa/v23/art-fill-v12.json + portrait-rescrape-v12.json.
"""
from __future__ import annotations
import hashlib, io, json, math, random, re, subprocess, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
QA = ROOT / "qa" / "v23"
WORLD = {"DB": "db", "HXH": "hxh", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
WIKI = {"DB": "dragonball", "HXH": "hunterxhunter", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
EXTS = (".webp", ".png", ".jpg", ".jpeg")
UA = "KI-ARENA-ArtFill/2.1 (+https://ki-arena-v20.pages.dev)"
TIMEOUT = 6


def dump_catalog():
    script = r"""
import {SURVIVAL_DATA} from '../src/survival/data.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out={heroes:[],items:[]};
for (const [u,d] of Object.entries(SURVIVAL_DATA)){
  for (const h of d.heroes||[]) out.heroes.push({universe:u,id:h.id,name:h.name,person:h.person,form:h.form||''});
  for (const it of d.items||[]) out.items.push({universe:u,id:it.id,name:it.name,category:it.category||'outil'});
}
fs.mkdirSync(path.join(root,'qa','v23'),{recursive:true});
fs.writeFileSync(path.join(root,'qa','v23','_catalog-dump.json'), JSON.stringify(out));
console.log(out.heroes.length, out.items.length);
"""
    (ROOT / "qa" / "v23").mkdir(parents=True, exist_ok=True)
    tmp = ROOT / "scripts" / "_dump_catalog_v12.mjs"
    tmp.write_text(script, encoding="utf-8")
    subprocess.run(["node", str(tmp)], cwd=ROOT, check=True)
    return json.loads((QA / "_catalog-dump.json").read_text(encoding="utf-8"))


def has_file(folder: Path, stem: str) -> Path | None:
    for e in EXTS:
        p = folder / f"{stem}{e}"
        if p.is_file() and p.stat().st_size > 500:
            return p
    return None


def seed_from(s: str) -> int:
    return int(hashlib.sha1(s.encode("utf-8")).hexdigest()[:8], 16)


def hsl_to_rgb(h, s, l):
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    return tuple(int((v + m) * 255) for v in (r, g, b))


def gen_portrait(dest: Path, key: str, label: str):
    w, h = 480, 640
    rng = random.Random(seed_from(key))
    hue = rng.randrange(0, 360)
    bg1 = hsl_to_rgb(hue, 0.35, 0.18)
    bg2 = hsl_to_rgb((hue + 40) % 360, 0.45, 0.32)
    accent = hsl_to_rgb((hue + 180) % 360, 0.55, 0.55)
    skin = hsl_to_rgb(rng.choice([20, 28, 35, 15]), 0.35, rng.uniform(0.45, 0.7))
    hair = hsl_to_rgb(rng.choice([0, 30, 200, 280, 50]), 0.4, rng.uniform(0.15, 0.4))
    im = Image.new("RGB", (w, h), bg1)
    draw = ImageDraw.Draw(im)
    for y in range(0, h, 4):
        t = y / (h - 1)
        col = tuple(int(bg1[i] * (1 - t) + bg2[i] * t) for i in range(3))
        draw.rectangle([0, y, w, y + 4], fill=col)
    # grain
    noise = Image.effect_noise((w // 2, h // 2), 28).resize((w, h), Image.Resampling.NEAREST).convert("L")
    im = Image.blend(im, Image.merge("RGB", (noise, noise, noise)), 0.08)
    draw = ImageDraw.Draw(im)
    cx, cy = w // 2, int(h * 0.42)
    # bust
    draw.ellipse([cx - 110, cy, cx + 110, cy + 280], fill=tuple(max(0, c // 3 + 30) for c in accent))
    # head + hair
    draw.ellipse([cx - 78, cy - 95, cx + 78, cy + 95], fill=skin)
    draw.ellipse([cx - 90, cy - 90, cx + 90, cy - 10], fill=hair)
    # unique slash
    slant = 0.35 + (seed_from(key) % 50) / 100
    for i in range(-2, 3):
        pts = [(40 + i, 80), (w - 40 + i, int(80 + (w - 80) * slant))]
        draw.line(pts, fill=accent, width=3)
    # vignette-ish edge darken via border
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([0, 0, w, h], outline=(0, 0, 0, 90), width=28)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="WEBP", quality=86, method=4)


def gen_item_icon(dest: Path, key: str, category: str):
    w = h = 256
    rng = random.Random(seed_from(key + ":" + category))
    palettes = {
        "arme": (15, 0.55, 0.45),
        "armure": (210, 0.4, 0.4),
        "outil": (140, 0.4, 0.38),
        "consommable": (45, 0.55, 0.45),
    }
    hue, sat, lit = palettes.get(category, (280, 0.4, 0.4))
    hue = (hue + rng.randrange(-25, 26)) % 360
    bg = hsl_to_rgb(hue, sat * 0.5, 0.16)
    fg = hsl_to_rgb(hue, sat, lit)
    edge = hsl_to_rgb((hue + 30) % 360, 0.6, 0.65)
    im = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(im)
    draw.ellipse([20, 20, 236, 236], fill=tuple(int(bg[i] * 0.7 + fg[i] * 0.3) for i in range(3)))
    if category == "arme":
        draw.line([(80, 40), (175, 210)], fill=edge, width=14)
        draw.ellipse([147, 42, 203, 98], fill=fg)
    elif category == "armure":
        draw.polygon([(128, 55), (190, 90), (175, 195), (81, 195), (66, 90)], fill=fg)
    elif category == "consommable":
        draw.ellipse([93, 85, 163, 195], fill=fg)
        draw.rectangle([122, 55, 134, 95], fill=edge)
    else:
        draw.rectangle([55, 118, 200, 138], fill=fg)
        draw.rectangle([56, 70, 84, 186], fill=edge)
    # unique speckles
    for _ in range(18):
        x, y = rng.randrange(30, 226), rng.randrange(30, 226)
        draw.ellipse([x, y, x + 3, y + 3], fill=edge)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="WEBP", quality=85, method=4)


def normalize_fandom_image_url(url: str) -> str:
    """Prefer thumblr scale URLs — raw /revision/latest often 403s behind CF."""
    if "static.wikia.nocookie.net" not in url and "vignette.wikia.nocookie.net" not in url:
        return url
    # strip query, force scale-to-width-down
    base = url.split("?")[0]
    if "/revision/latest" in base and "scale-to-width-down" not in base:
        base = base.rstrip("/") + "/scale-to-width-down/1000"
    return base


def download(url: str, referer: str) -> bytes:
    url = normalize_fandom_image_url(url)
    # curl bypasses CF challenges that block Python urllib
    cmd = [
        "curl.exe",
        "-fsSL",
        "--max-time",
        str(TIMEOUT),
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "-e",
        referer,
        "-H",
        "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        url,
    ]
    proc = subprocess.run(cmd, capture_output=True, check=False)
    if proc.returncode != 0 or not proc.stdout:
        raise ValueError(f"curl:{proc.returncode}:{proc.stderr[:120]!r}")
    data = proc.stdout
    if len(data) < 2000 or len(data) > 6 * 1024 * 1024:
        raise ValueError("size")
    return data


def save_scraped(data: bytes, dest: Path):
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    if im.width < 80 or im.height < 80:
        raise ValueError("too small")
    sample = im.resize((32, 32))
    colors = sample.getcolors(32 * 32) or []
    if len(colors) <= 4:
        raise ValueError("too flat")
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(dest, format="WEBP", quality=85, method=4)


def fandom_thumb(wiki: str, name: str, form: str = "") -> str | None:
    titles = [name]
    if form:
        titles.append(f"{name} ({form})")
    if "—" in name:
        titles.append(name.split("—")[0].strip())
    if " - " in name:
        titles.append(name.split(" - ")[0].strip())
    for title in titles[:3]:
        api = (
            f"https://{wiki}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}"
            f"&prop=pageimages&format=json&pithumbsize=1000"
        )
        try:
            req = urllib.request.Request(api, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                data = json.loads(r.read().decode("utf-8", "ignore"))
            for p in data.get("query", {}).get("pages", {}).values():
                t = (p.get("thumbnail") or {}).get("source")
                if t:
                    return t
        except Exception:
            continue
    try:
        q = urllib.parse.quote((name.split("—")[0].strip() if "—" in name else name).strip())
        api = f"https://{wiki}.fandom.com/api.php?action=query&list=search&srsearch={q}&format=json&srlimit=1"
        req = urllib.request.Request(api, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            data = json.loads(r.read().decode("utf-8", "ignore"))
        for hit in data.get("query", {}).get("search", [])[:1]:
            title = hit.get("title")
            if not title:
                continue
            api2 = (
                f"https://{wiki}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}"
                f"&prop=pageimages&format=json&pithumbsize=1000"
            )
            req2 = urllib.request.Request(api2, headers={"User-Agent": UA})
            with urllib.request.urlopen(req2, timeout=TIMEOUT) as r2:
                data2 = json.loads(r2.read().decode("utf-8", "ignore"))
            for p in data2.get("query", {}).get("pages", {}).values():
                t = (p.get("thumbnail") or {}).get("source")
                if t:
                    return t
    except Exception:
        return None
    return None


def index_equipment() -> dict[str, Path]:
    out = {}
    root = ASSETS / "equipment"
    if not root.exists():
        return out
    for p in root.rglob("*"):
        if p.suffix.lower() in EXTS and p.is_file():
            out[re.sub(r"[^a-z0-9]+", "-", p.stem.lower()).strip("-")] = p
    return out


def best_eq_match(item: dict, idx: dict[str, Path]) -> Path | None:
    keys = [
        re.sub(r"[^a-z0-9]+", "-", item["id"].lower()).strip("-"),
        re.sub(r"[^a-z0-9]+", "-", item["name"].lower()).strip("-"),
    ]
    for k in list(keys):
        for pref in ("db-", "hxh-", "naruto-", "onepiece-", "jojo-", "eq-", "arme-", "armure-", "outil-"):
            if k.startswith(pref):
                keys.append(k[len(pref) :])
    for k in keys:
        if k in idx:
            return idx[k]
    for k in keys:
        if len(k) < 6:
            continue
        hits = [p for stem, p in idx.items() if k in stem or stem in k]
        if len(hits) == 1:
            return hits[0]
    return None


def scrape_one(hero: dict, wiki: str, dest: Path) -> tuple[str, str]:
    """Returns (id, status) status in scraped|rejected|fail."""
    try:
        thumb = fandom_thumb(wiki, hero["name"], hero.get("form") or "")
        if not thumb:
            return hero["id"], "rejected"
        data = download(thumb, f"https://{wiki}.fandom.com/")
        save_scraped(data, dest)
        return hero["id"], "scraped"
    except Exception:
        return hero["id"], "fail"


def main():
    cat = dump_catalog()
    report = {
        "scraped": 0,
        "generated_portraits": 0,
        "already_portraits": 0,
        "eq_remapped": 0,
        "eq_generated": 0,
        "eq_already": 0,
        "scrape_fail": [],
        "byUniverse": {},
        "rescrape": {"saved": [], "rejected": [], "still_missing": [], "fail": []},
    }
    order = ["JOJO", "DB", "NARUTO", "HXH", "ONEPIECE"]
    heroes_by_u = {u: [] for u in order}
    for h in cat["heroes"]:
        heroes_by_u.setdefault(h["universe"], []).append(h)

    scrape_budget = {"JOJO": 240, "DB": 200, "NARUTO": 120, "HXH": 50, "ONEPIECE": 400}

    # Phase A: guarantee every hero has a local file (generate missing fast)
    print("phase A: generate missing portraits", flush=True)
    for u in order:
        folder = ASSETS / f"portraits-{WORLD[u]}"
        folder.mkdir(parents=True, exist_ok=True)
        already = gen_u = 0
        for h in heroes_by_u.get(u, []):
            if has_file(folder, h["id"]):
                already += 1
                continue
            dest = folder / f"{h['id']}.webp"
            gen_portrait(dest, f"{u}:{h['id']}", h["name"])
            gen_u += 1
            report["generated_portraits"] += 1
        report["already_portraits"] += already
        report["byUniverse"][u] = {
            "heroes": len(heroes_by_u.get(u, [])),
            "scraped": 0,
            "generated": gen_u,
            "already": already,
        }
        print(u, "generated", gen_u, "already", already, flush=True)

    # Phase B: Fandom overwrite for missing-was / budget (prefer overwrite generated)
    print("phase B: fandom scrape overwrite", flush=True)
    for u in order:
        folder = ASSETS / f"portraits-{WORLD[u]}"
        wiki = WIKI[u]
        budget = scrape_budget.get(u, 100)
        # Prefer heroes that were just generated (smaller files / procedural) OR all under budget
        targets = []
        for h in heroes_by_u.get(u, []):
            p = has_file(folder, h["id"])
            # scrape if under budget; prioritize smaller/generated (< 25KB typical procedural)
            if p and p.stat().st_size < 28000:
                targets.append(h)
            elif not p:
                targets.append(h)
        targets = targets[:budget]
        scraped_u = 0
        if not targets:
            print(u, "scrape skip (no targets)", flush=True)
            continue
        with ThreadPoolExecutor(max_workers=8) as pool:
            futs = {
                pool.submit(scrape_one, h, wiki, folder / f"{h['id']}.webp"): h
                for h in targets
            }
            for fut in as_completed(futs):
                hid, status = fut.result()
                if status == "scraped":
                    scraped_u += 1
                    report["scraped"] += 1
                    report["rescrape"]["saved"].append(f"{u}:{hid}")
                elif status == "rejected":
                    report["rescrape"]["rejected"].append(f"{u}:{hid}")
                else:
                    report["rescrape"]["fail"].append(f"{u}:{hid}")
                    report["scrape_fail"].append(f"{u}:{hid}")
        report["byUniverse"][u]["scraped"] = scraped_u
        print(u, "scraped", scraped_u, "/", len(targets), flush=True)

    # still_missing should be empty after phase A
    for u in order:
        folder = ASSETS / f"portraits-{WORLD[u]}"
        for h in heroes_by_u.get(u, []):
            if not has_file(folder, h["id"]):
                report["rescrape"]["still_missing"].append(f"{u}:{h['id']}")

    # Phase C: equipment
    print("phase C: equipment", flush=True)
    idx = index_equipment()
    for it in cat["items"]:
        world = WORLD[it["universe"]]
        folder = ASSETS / "equipment" / world
        folder.mkdir(parents=True, exist_ok=True)
        if has_file(folder, it["id"]):
            report["eq_already"] += 1
            continue
        src = best_eq_match(it, idx)
        dest = folder / f"{it['id']}.webp"
        if src and src.resolve() != dest.resolve():
            try:
                if src.suffix.lower() == ".webp":
                    dest.write_bytes(src.read_bytes())
                else:
                    Image.open(src).convert("RGB").save(dest, format="WEBP", quality=85, method=4)
                report["eq_remapped"] += 1
                continue
            except Exception:
                pass
        gen_item_icon(dest, f"{it['universe']}:{it['id']}", it.get("category") or "outil")
        report["eq_generated"] += 1

    # relics
    relics_dir = ASSETS / "v22" / "relics"
    relics_dir.mkdir(parents=True, exist_ok=True)
    relic_js = (ROOT / "src" / "v22" / "relics.js").read_text(encoding="utf-8")
    relic_made = 0
    for rid in re.findall(r"make\('([a-z0-9_]+)'", relic_js):
        svg = relics_dir / f"{rid}.svg"
        if svg.exists():
            continue
        hue = seed_from(rid) % 360
        c1 = "#%02x%02x%02x" % hsl_to_rgb(hue, 0.5, 0.45)
        c2 = "#%02x%02x%02x" % hsl_to_rgb((hue + 40) % 360, 0.4, 0.25)
        svg.write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
            f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/></linearGradient></defs>'
            f'<circle cx="32" cy="32" r="28" fill="url(#g)"/>'
            f'<path d="M32 12 38 28h16l-13 10 5 16-14-10-14 10 5-16-13-10h16z" fill="#fff" opacity=".9"/>'
            f"</svg>",
            encoding="utf-8",
        )
        relic_made += 1
    report["relics_generated"] = relic_made

    out = QA / "art-fill-v12.json"
    out.write_text(json.dumps({k: v for k, v in report.items() if k != "rescrape"}, ensure_ascii=False, indent=2), encoding="utf-8")
    rescrape_out = QA / "portrait-rescrape-v12.json"
    rescrape_out.write_text(
        json.dumps(
            {
                "saved": report["rescrape"]["saved"],
                "rejected": report["rescrape"]["rejected"],
                "fail": report["rescrape"]["fail"],
                "still_missing": report["rescrape"]["still_missing"],
                "counts": {
                    "saved": len(report["rescrape"]["saved"]),
                    "rejected": len(report["rescrape"]["rejected"]),
                    "fail": len(report["rescrape"]["fail"]),
                    "still_missing": len(report["rescrape"]["still_missing"]),
                },
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    summary = {k: report[k] for k in report if k not in ("scrape_fail", "rescrape")}
    print(json.dumps(summary, indent=2), flush=True)
    print(
        "rescrape",
        {k: len(report["rescrape"][k]) for k in ("saved", "rejected", "fail", "still_missing")},
        "wrote",
        out,
        rescrape_out,
        flush=True,
    )


if __name__ == "__main__":
    main()
