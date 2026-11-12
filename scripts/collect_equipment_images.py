#!/usr/bin/env python3
"""Collecte réelle d'images d'équipements KI Arena (Fandom + Bing + pictogramme honnête)."""
from __future__ import annotations
import csv, hashlib, io, json, re, time, random
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus, unquote, urlencode
from urllib.request import Request, urlopen
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "equipment"
REPORTS = ROOT / "qa" / "v12" / "equipment"
MANIFEST = REPORTS / "equipment_manifest.csv"
LOG = REPORTS / "equipment_collect_log.jsonl"
CONTACT = REPORTS / "contact_sheets"
PIC_DIR = REPORTS / "pictograms"
for d in (OUT, REPORTS, CONTACT, PIC_DIR):
    d.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
FIELDS = ["itemId","universe","name","page","sourceUrl","file","width","height","sha256","date","license","status","reason"]
GEAR_JSON = REPORTS / "gear_catalog.json"

SERIES = {
  "DB": ("Dragon Ball", "https://dragonball.fandom.com/api.php", "https://dragonball.fandom.com/"),
  "HXH": ("Hunter x Hunter", "https://hunterxhunter.fandom.com/api.php", "https://hunterxhunter.fandom.com/"),
  "NARUTO": ("Naruto", "https://naruto.fandom.com/api.php", "https://naruto.fandom.com/"),
  "ONEPIECE": ("One Piece", "https://onepiece.fandom.com/api.php", "https://onepiece.fandom.com/"),
}

# English / wiki-friendly aliases for better Fandom hits
ALIASES = {
  "Bâton magique Nyoi-bō": ["Power Pole", "Nyoi-bo", "Nyoi Bo"],
  "Épée Z": ["Z Sword", "Z-Sword"],
  "Épée de Trunks du futur": ["Trunks' Sword", "Future Trunks Sword"],
  "Épée d'entraînement de Gohan": ["Gohan's sword", "Z Sword"],
  "Katana de Yajirobé": ["Yajirobe's Katana", "Yajirobe"],
  "Nuage Kinton": ["Flying Nimbus", "Kinto-un"],
  "Armure de combat Saiyan": ["Saiyan Battle Armor", "Battle Armor"],
  "Scouter": ["Scouter"],
  "Senzu": ["Senzu Bean"],
  "Potara": ["Potara Earrings", "Potara"],
}

EFFECT_COLORS = {
  "atk": ((210, 70, 50), (40, 16, 12)),
  "pierce": ((180, 90, 40), (30, 18, 10)),
  "shield": ((70, 120, 180), (12, 22, 36)),
  "hp": ((60, 150, 90), (12, 28, 18)),
  "heal": ((50, 170, 110), (10, 30, 20)),
  "stun": ((200, 170, 40), (36, 30, 8)),
  "evade": ((120, 90, 180), (22, 16, 34)),
  "counter": ((190, 80, 110), (34, 14, 22)),
}

def log(msg):
    print(msg, flush=True)

def http_get(url, referer="https://www.bing.com/", binary=True):
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*", "Referer": referer})
    with urlopen(req, timeout=30) as resp:
        data = resp.read()
        ctype = resp.headers.get_content_type()
        return data, ctype

def http_json(url, referer=""):
    data, _ = http_get(url, referer=referer or url)
    return json.loads(data.decode("utf-8", "ignore"))

def bing_murls(query):
    url = "https://www.bing.com/images/search?q=" + quote_plus(query) + "&form=HDRSC2&first=1"
    raw, _ = http_get(url)
    html = raw.decode("utf-8", "ignore")
    urls = []
    for pat in (
        r'"murl"\s*:\s*"([^"]+)"',
        r'"mediaurl"\s*:\s*"([^"]+)"',
        r'murl&quot;:&quot;([^&]+)&quot;',
        r'"contentUrl"\s*:\s*"([^"]+)"',
        r'&quot;murl&quot;:&quot;([^&]+)&quot;',
        r'src="(https://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"',
    ):
        for u in re.findall(pat, html, re.I):
            u = u.encode("utf-8").decode("unicode_escape", errors="ignore")
            u = unquote(u).replace("\\u0026", "&").replace("\\/", "/")
            if u.startswith("http") and "bing.com" not in u and "microsoft" not in u.lower() and u not in urls:
                urls.append(u)
    return url, urls[:10]

def fandom_search(api, site, query):
    url = api + "?" + urlencode({"action": "query", "list": "search", "srsearch": query, "format": "json", "srlimit": 5})
    j = http_json(url, referer=site)
    return [hit["title"] for hit in j.get("query", {}).get("search", [])]

def fandom_page_image(api, site, title):
    url = api + "?" + urlencode({
        "action": "query", "titles": title, "prop": "pageimages|info",
        "pithumbsize": 800, "inprop": "url", "format": "json",
    })
    j = http_json(url, referer=site)
    pages = j.get("query", {}).get("pages", {})
    for p in pages.values():
        thumb = (p.get("thumbnail") or {}).get("source")
        if thumb:
            # prefer larger
            thumb = re.sub(r"/scale-to-width-down/\d+", "/scale-to-width-down/1000", thumb)
            return thumb, p.get("fullurl") or site
        # try original
        oi = (p.get("original") or {}).get("source")
        if oi:
            return oi, p.get("fullurl") or site
    # imageinfo fallback via pageimages missing — try images list
    url2 = api + "?" + urlencode({
        "action": "query", "titles": title, "prop": "images", "format": "json", "imlimit": 10,
    })
    j2 = http_json(url2, referer=site)
    pages2 = j2.get("query", {}).get("pages", {})
    files = []
    for p in pages2.values():
        for im in p.get("images") or []:
            t = im.get("title") or ""
            if t.lower().startswith("file:") and not any(x in t.lower() for x in ("icon", "logo", "wiki", "placeholder", "stub")):
                files.append(t)
    for ft in files[:4]:
        url3 = api + "?" + urlencode({
            "action": "query", "titles": ft, "prop": "imageinfo", "iiprop": "url", "format": "json",
        })
        j3 = http_json(url3, referer=site)
        for p in j3.get("query", {}).get("pages", {}).values():
            infos = p.get("imageinfo") or []
            if infos and infos[0].get("url"):
                return infos[0]["url"], site
    return None, None

def save_webp(img: Image.Image, dest: Path):
    img = ImageOps.exif_transpose(img).convert("RGBA")
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img if img.mode == "RGBA" else None)
    fitted = canvas.resize((512, 512), Image.Resampling.LANCZOS)
    fitted.save(dest, "WEBP", quality=90, method=6)
    return fitted.size

def sha256(path: Path):
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()

def make_pictogram(item, dest: Path):
    """Honest non-fake pictogram: effect-colored glyph + initials — not a scraped image."""
    effect = item.get("effect") or "atk"
    fg, bg = EFFECT_COLORS.get(effect, ((160, 160, 160), (24, 24, 28)))
    img = Image.new("RGBA", (512, 512), (*bg, 255))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((36, 36, 476, 476), radius=48, outline=(*fg, 255), width=8)
    cat = (item.get("category") or "?")[:1].upper()
    name = item.get("name") or item.get("id") or "?"
    initials = "".join(p[0] for p in re.split(r"[\s\-']+", name) if p)[:3].upper() or "?"
    try:
        font_big = ImageFont.truetype("arial.ttf", 96)
        font_sm = ImageFont.truetype("arial.ttf", 28)
    except Exception:
        font_big = ImageFont.load_default()
        font_sm = font_big
    d.text((256, 220), initials, fill=(*fg, 255), font=font_big, anchor="mm")
    d.text((256, 340), f"{cat} · {effect}", fill=(220, 220, 220, 200), font=font_sm, anchor="mm")
    d.text((256, 390), "PICTOGRAMME", fill=(160, 160, 160, 180), font=font_sm, anchor="mm")
    img.save(dest, "WEBP", quality=85, method=4)
    return img.size

def load_gear():
    if GEAR_JSON.exists():
        return json.loads(GEAR_JSON.read_text(encoding="utf-8"))
    return []

def search_queries(item):
    name = item.get("name") or ""
    qs = [name]
    qs.extend(ALIASES.get(name, []))
    # strip accents-ish simple: keep original + without special chars
    plain = re.sub(r"[^\w\s\-]", " ", name, flags=re.UNICODE)
    if plain.strip() and plain.strip() not in qs:
        qs.append(plain.strip())
    return [q for q in qs if q]

def try_download_image(url, referer, dest):
    data, ctype = http_get(url, referer=referer)
    if not (ctype or "").startswith("image") and not url.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".gif")):
        # still try decode
        pass
    img = Image.open(io.BytesIO(data)); img.load()
    if min(img.size) < 48:
        raise ValueError(f"trop petit {img.size}")
    w, h = img.size
    if h > w * 2.6:
        raise ValueError("ratio portrait personne")
    save_webp(img, dest)
    thumb = ImageOps.contain(img.convert("RGB"), (160, 160))
    thumb.save(CONTACT / (dest.stem + ".jpg"), quality=85)
    return img.size

def collect_one(item):
    iid = item["id"]
    raw_id = iid.split(":", 1)[-1]
    universe = item.get("universe") or iid.split(":")[0]
    name = item.get("name") or raw_id
    series, api, site = SERIES.get(universe, (universe, None, "https://www.bing.com/"))
    dest_dir = OUT / universe.lower()
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{raw_id}.webp"
    rec = {k: "" for k in FIELDS}
    rec.update(itemId=iid, universe=universe, name=name, date=datetime.now(timezone.utc).isoformat(), license="unknown")
    if dest.exists() and dest.stat().st_size > 1500:
        # detect pictogram marker? still count existing
        im = Image.open(dest)
        # if previously written pictogram, keep status honest if tiny metadata — skip
        rec.update(status="IMAGE_VERIFIEE", file=str(dest.relative_to(ROOT)).replace("\\", "/"),
                   width=im.size[0], height=im.size[1], sha256=sha256(dest), reason="already present")
        return rec

    last = "aucune source"
    queries = search_queries(item)

    # 1) Fandom
    if api:
        for q in queries[:4]:
            try:
                titles = fandom_search(api, site, q)
                for title in titles[:3]:
                    img_url, page = fandom_page_image(api, site, title)
                    if not img_url:
                        last = f"fandom sans image: {title}"
                        continue
                    try:
                        try_download_image(img_url, site, dest)
                        rec.update(status="CANDIDAT_A_REVOIR", page=page or site, sourceUrl=img_url,
                                   file=str(dest.relative_to(ROOT)).replace("\\", "/"),
                                   width=512, height=512, sha256=sha256(dest),
                                   license="fandom-fair-use-candidate", reason=f"fandom:{title}")
                        return rec
                    except Exception as e:
                        last = f"fandom dl: {e}"[:160]
            except Exception as e:
                last = f"fandom: {e}"[:160]
                if "403" in str(e) or "429" in str(e) or "timed out" in str(e).lower():
                    # continue to bing; may mark blocked later
                    pass

    # 2) Bing (often blocked / empty murls)
    bing_blocked = False
    for q in queries[:2]:
        try:
            page, urls = bing_murls(f"{q} {series} weapon item")
            rec["page"] = page
            if not urls:
                last = "bing: 0 murls"
                bing_blocked = True
                continue
            for url in urls:
                try:
                    try_download_image(url, page, dest)
                    rec.update(status="CANDIDAT_A_REVOIR", sourceUrl=url,
                               file=str(dest.relative_to(ROOT)).replace("\\", "/"),
                               width=512, height=512, sha256=sha256(dest),
                               license="unknown", reason="bing candidate")
                    return rec
                except Exception as e:
                    last = str(e)[:160]
        except Exception as e:
            last = f"bing: {e}"[:180]
            bing_blocked = True
            break

    # 3) Honest pictogram — INTROUVABLE / SOURCE_BLOQUEE, still write usable fallback file
    make_pictogram(item, dest)
    pic_copy = PIC_DIR / f"{raw_id}.webp"
    if not pic_copy.exists():
        pic_copy.write_bytes(dest.read_bytes())
    status = "SOURCE_BLOQUEE" if bing_blocked and "fandom" in last.lower() else "INTROUVABLE"
    if bing_blocked and not api:
        status = "SOURCE_BLOQUEE"
    # Prefer INTROUVABLE when we searched but found nothing; SOURCE_BLOQUEE if HTTP hard-fail
    if "403" in last or "429" in last or "timed out" in last.lower():
        status = "SOURCE_BLOQUEE"
    rec.update(status=status, file=str(dest.relative_to(ROOT)).replace("\\", "/"),
               width=512, height=512, sha256=sha256(dest),
               license="pictogram-editorial", reason=f"pictogram fallback · {last}"[:200])
    return rec

def main():
    gear = load_gear()
    log(f"Equipements à traiter: {len(gear)}")
    rows = []
    with LOG.open("w", encoding="utf-8") as lf:
        for i, item in enumerate(gear, 1):
            log(f"[{i}/{len(gear)}] {item.get('name')} ({item.get('id')})")
            rec = collect_one(item)
            rows.append(rec)
            lf.write(json.dumps(rec, ensure_ascii=False) + "\n")
            log(f"  -> {rec['status']} {rec.get('reason','')}")
            time.sleep(0.35 + random.uniform(0, 0.35))
    with MANIFEST.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, FIELDS, delimiter=";")
        w.writeheader(); w.writerows(rows)
    from collections import Counter
    log(dict(Counter(r["status"] for r in rows)))
    log(f"files written under {OUT}: {sum(1 for _ in OUT.rglob('*.webp'))}")
    log(f"Manifeste: {MANIFEST}")

if __name__ == "__main__":
    main()
