#!/usr/bin/env python3
"""Rescrape shared / missing / bad DB portraits via Fandom first, Bing filtered fallback."""
from __future__ import annotations
import hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'
NEED = ROOT / 'qa/v23/db-portraits-need.json'
WIKI = 'dragonball'

PERSON_ALIAS = {
    'C-16': 'Android 16', 'C-17': 'Android 17', 'C-18': 'Android 18',
    'C-8': 'Android 8', 'Black Goku': 'Goku Black', 'Goku Black': 'Goku Black',
    'Trunks': 'Future Trunks', 'Vegeta': 'Vegeta', 'Goku': 'Goku',
}

BAD_HOST = (
    'androidauthority', 'billboard.com', 'amazon.', 'mlcdn.com', 'nist.gov',
    'nccoe.', 'beyonce', 'akgotart', 'computador', 'desktop', 'logo', 'favicon',
    'sprite', 'wordmark', 'wikia.nocookie.net/commons', 'placeholder',
)

GOOD_HINT = (
    'dragonball', 'dbz', 'dbs', 'goku', 'vegeta', 'trunks', 'android', 'c-1',
    'saiyan', 'fandom', 'wikia', 'pinimg', 'zerochan', 'wallpaper',
)

FORM_HINT = {
    'super saiyan rose': 'Super Saiyan Rosé',
    'rose': 'Super Saiyan Rosé',
    'rosé': 'Super Saiyan Rosé',
    'super saiyan god': 'Super Saiyan God',
    'super saiyan blue': 'Super Saiyan Blue',
    'kaioken': 'Kaio-ken',
    'faux goku': 'Goku Black',
    'forme de base': '',
    'cell games': 'Android 18',
    'tournoi du pouvoir': 'Tournament of Power',
    'barriere': 'Android 17',
    'ranger': 'Android 17',
    'saga androids': 'Android 16',
    'futur': 'Future',
    'enfant': 'Kid Trunks',
    'fusion': 'Gotenks',
}


def ascii_clean(s: str) -> str:
    import unicodedata
    s = unicodedata.normalize('NFKD', s or '')
    return ''.join(ch for ch in s if not unicodedata.combining(ch))


def save_webp(data: bytes, dest: Path):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 90 or im.height < 90:
        raise ValueError('small')
    sample = im.resize((24, 24))
    colors = sample.getcolors(24 * 24) or []
    if len(colors) <= 3:
        raise ValueError('flat')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(dest, 'WEBP', quality=86, method=6)


def download(url: str, referer: str = 'https://dragonball.fandom.com/') -> bytes:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
        'Referer': referer,
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read(6 * 1024 * 1024 + 1)
    if len(data) > 6 * 1024 * 1024:
        raise ValueError('too large')
    if len(data) < 2000:
        raise ValueError('tiny')
    return data


def api_json(url: str):
    req = urllib.request.Request(url, headers={'User-Agent': 'KI-ARENA-PortraitFill/2.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode('utf-8', 'ignore'))


def fandom_candidates(name: str, form: str, person: str) -> list[str]:
    base = name.split('—')[0].split('-')[0].strip() if name else ''
    # person slug often DB:goku -> Goku
    person_name = (person or '').split(':')[-1].replace('-', ' ').title()
    aliases = []
    for key, alias in PERSON_ALIAS.items():
        if key.lower() in (name or '').lower() or key.lower() in person_name.lower() or key.lower() in (person or '').lower():
            aliases.append(alias)
    if 'goku black' in (name or '').lower() or 'black goku' in (name or '').lower() or 'goku-black' in (person or ''):
        aliases = ['Goku Black'] + aliases
    titles = []
    for a in aliases or [person_name or base or name]:
        titles.append(a)
        fl = ascii_clean(form).lower()
        for needle, hint in FORM_HINT.items():
            if needle in fl and hint:
                titles.append(f'{a} ({hint})' if '(' not in hint else hint)
                titles.append(hint)
    # explicit android pages
    if 'c-16' in (person or '') or 'c-16' in (name or '').lower() or 'android 16' in (name or '').lower():
        titles = ['Android 16'] + titles
    if 'c-17' in (person or '') or 'android 17' in (name or '').lower():
        titles = ['Android 17'] + titles
    if 'c-18' in (person or '') or 'android 18' in (name or '').lower():
        titles = ['Android 18'] + titles

    urls: list[str] = []
    seen = set()

    def add(u: str):
        if u and u not in seen:
            seen.add(u)
            urls.append(u)

    for title in titles[:8]:
        api = (
            f'https://{WIKI}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}'
            f'&prop=pageimages|images&format=json&pithumbsize=1200&pilimit=20'
        )
        try:
            data = api_json(api)
            for p in data.get('query', {}).get('pages', {}).values():
                t = (p.get('thumbnail') or {}).get('source')
                if t:
                    add(t)
                for im in p.get('images') or []:
                    fname = im.get('title') or ''
                    if not fname.lower().startswith('file:'):
                        continue
                    # skip icons
                    low = fname.lower()
                    if any(x in low for x in ('icon', 'logo', 'wiki', 'symbol', 'sprite')):
                        continue
                    img_api = (
                        f'https://{WIKI}.fandom.com/api.php?action=query&titles={urllib.parse.quote(fname)}'
                        f'&prop=imageinfo&iiprop=url&format=json'
                    )
                    try:
                        info = api_json(img_api)
                        for ip in info.get('query', {}).get('pages', {}).values():
                            for ii in ip.get('imageinfo') or []:
                                add(ii.get('url'))
                    except Exception:
                        pass
        except Exception:
            pass

    # search
    q = ascii_clean(f'{aliases[0] if aliases else name} {form}').strip()
    try:
        api = f'https://{WIKI}.fandom.com/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&format=json&srlimit=5'
        data = api_json(api)
        for hit in data.get('query', {}).get('search', []):
            title = hit.get('title')
            if not title:
                continue
            api2 = (
                f'https://{WIKI}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}'
                f'&prop=pageimages&format=json&pithumbsize=1200'
            )
            data2 = api_json(api2)
            for p in data2.get('query', {}).get('pages', {}).values():
                t = (p.get('thumbnail') or {}).get('source')
                if t:
                    add(t)
    except Exception:
        pass
    return urls


def url_ok(u: str) -> bool:
    low = u.lower()
    if any(b in low for b in BAD_HOST):
        return False
    if not any(h in low for h in GOOD_HINT):
        # allow fandom always
        if 'fandom.com' not in low and 'wikia' not in low:
            return False
    return True


def bing_candidates(page, query: str) -> list[str]:
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&qft=+filterui:photo-photo&form=IRFLTR'
    page.goto(url, wait_until='domcontentloaded', timeout=35000)
    page.wait_for_timeout(1200)
    found = page.locator('a.iusc').evaluate_all("""els => els.slice(0,30).map(e => {
      try { const m = JSON.parse(e.getAttribute('m')||'{}'); return m.murl || ''; }
      catch { return ''; }
    }).filter(Boolean)""")
    out = []
    for u in found:
        if u not in out and url_ok(u):
            out.append(u)
    return out


def main():
    payload = json.loads(NEED.read_text(encoding='utf-8'))
    rows = []
    seen_sid = set()
    for bucket in ('missing', 'cross'):
        for r in payload.get(bucket) or []:
            sid = r.get('sourceId') or r.get('sid')
            if not sid or sid in seen_sid:
                continue
            seen_sid.add(sid)
            rows.append({
                'sourceId': sid,
                'name': r.get('name') or sid,
                'form': r.get('form') or '',
                'person': r.get('person') or '',
            })

    # Also load shared groups from a generated list if present
    shared = ROOT / 'qa/v23/db-portraits-shared.json'
    if shared.exists():
        for r in json.loads(shared.read_text(encoding='utf-8')):
            sid = r.get('sourceId') or r.get('sid')
            if sid and sid not in seen_sid:
                seen_sid.add(sid)
                rows.append(r)

    print('queue', len(rows))
    raw_seen = set()
    webp_seen = set()
    # seed with portraits we keep
    for p in OUT.glob('*.webp'):
        if p.stem in seen_sid:
            continue
        webp_seen.add(hashlib.sha1(p.read_bytes()).hexdigest())

    # delete queued files so we refill
    for r in rows:
        p = OUT / f"{r['sourceId']}.webp"
        if p.exists():
            p.unlink()

    from playwright.sync_api import sync_playwright
    ok = fail = 0
    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(locale='en-US', user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36')
        page = ctx.new_page()
        for i, r in enumerate(rows):
            sid = r['sourceId']
            dest = OUT / f'{sid}.webp'
            print(f"[{i+1}/{len(rows)}] {sid} :: {r.get('name')} / {r.get('form')}", flush=True)
            cands = fandom_candidates(r.get('name', ''), r.get('form', ''), r.get('person', ''))
            q = ascii_clean(f"{r.get('name','')} {r.get('form','')} Dragon Ball portrait").strip()
            try:
                cands += bing_candidates(page, q)
            except Exception as ex:
                print('  bing', str(ex)[:100], flush=True)
            # prefer fandom urls first (already first), then filtered
            cands = [u for u in cands if url_ok(u)]
            saved = False
            last = 'none'
            for u in cands[:24]:
                try:
                    data = download(u)
                    h = hashlib.sha1(data).hexdigest()
                    if h in raw_seen:
                        last = 'dup-raw'
                        continue
                    save_webp(data, dest)
                    wh = hashlib.sha1(dest.read_bytes()).hexdigest()
                    if wh in webp_seen:
                        dest.unlink(missing_ok=True)
                        last = 'dup-webp'
                        continue
                    raw_seen.add(h)
                    webp_seen.add(wh)
                    ok += 1
                    saved = True
                    report.append({**r, 'status': 'ok', 'url': u})
                    print('  ok', u[:100], flush=True)
                    break
                except Exception as ex:
                    last = str(ex)[:140]
            if not saved:
                fail += 1
                report.append({**r, 'status': 'fail', 'error': last})
                print('  fail', last, flush=True)
            time.sleep(0.9)
        browser.close()
    out = ROOT / 'qa/v23/db-shared-fill-report.json'
    out.write_text(json.dumps({'ok': ok, 'fail': fail, 'rows': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('done', ok, fail)


if __name__ == '__main__':
    main()
