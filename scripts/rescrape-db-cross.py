#!/usr/bin/env python3
"""Force-differentiated Dragon Ball portraits for cross-person collisions."""
from __future__ import annotations
import json, time, urllib.parse, urllib.request, io
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'

# Explicit English queries that separate lookalikes.
QUERIES = {
    'c-8-db-cyborg-pacifique': 'Android 8 Hatchan Dragon Ball cyborg pacifist portrait',
    'c-16-dbz-saga-androids': 'Android 16 Dragon Ball Z red vest portrait',
    'c-17-dbz-saga-androids': 'Android 17 Dragon Ball Z black shirt bandana portrait',
    'c-17-dbs-ranger-de-l-ile': 'Android 17 Super Dragon Ball Heroes island ranger portrait',
    'c-17-dbs-barriere-ultime-tournoi-du-pouvoir': 'Android 17 Tournament of Power barrier Dragon Ball Super',
    'c-17-dbs-tournoi-du-pouvoir': 'Android 17 Tournament of Power Dragon Ball Super official',
    'c-18-dbz-vie-de-famille': 'Android 18 Dragon Ball Z family life blonde portrait',
    'c-18-dbz-cell-games-protegee-par-krilin': 'Android 18 Cell Games Dragon Ball Z portrait',
    'c-18-dbz-futur-regne-des-cyborgs': 'Android 18 Future Trunks timeline Dragon Ball',
    'c-18-dbs-protection-de-krilin': 'Android 18 Dragon Ball Super protecting Krillin',
    'goku-dbz-retour-sur-terre-apres-namek': 'Goku after Namek return to Earth Dragon Ball Z',
    'goku-dbs-super-saiyan-2-tournoi-du-pouvoir': 'Goku Super Saiyan 2 Tournament of Power Dragon Ball Super',
    'goku-dbs-super-saiyan-god': 'Goku Super Saiyan God red hair Dragon Ball Super',
    'goku-dbs-super-saiyan-blue-kaioken-20': 'Goku Super Saiyan Blue Kaioken x20 Dragon Ball Super',
    'goku-black-dbs-faux-goku-lame-de-ki': 'Goku Black ki blade Dragon Ball Super',
    'goku-black-dbs-faux-goku-revele': 'Goku Black revealed black hair Dragon Ball Super',
    'goku-black-dbs-forme-de-base': 'Goku Black base form black gi Dragon Ball Super',
    'black-goku-dbs-super-saiyan-rose': 'Goku Black Super Saiyan Rose pink hair Dragon Ball Super',
    'iru-dbs-kaioshin-univers-8': 'Iru Kaioshin Universe 8 Dragon Ball Super',
}

def save_webp(data: bytes, dest: Path):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 90 or im.height < 90:
        raise ValueError('too small')
    sample = im.resize((24, 24))
    colors = sample.getcolors(24 * 24) or []
    if len(colors) <= 3:
        raise ValueError('too flat')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(dest, format='WEBP', quality=86, method=6)

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
        'Referer': 'https://www.bing.com/',
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read(6 * 1024 * 1024 + 1)
    if len(data) > 6 * 1024 * 1024:
        raise ValueError('too large')
    return data

def bing(page, query: str):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&qft=+filterui:photo-photo&form=IRFLTR'
    page.goto(url, wait_until='domcontentloaded', timeout=35000)
    page.wait_for_timeout(1200)
    return page.locator('a.iusc').evaluate_all("""els => els.slice(0,16).map(e => {
      try { const m = JSON.parse(e.getAttribute('m')||'{}'); return m.murl || ''; }
      catch { return ''; }
    }).filter(Boolean)""")

def fandom(title: str):
    api = f'https://dragonball.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=1000'
    req = urllib.request.Request(api, headers={'User-Agent': 'KI-ARENA/1.2'})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode('utf-8', 'ignore'))
    urls = []
    for p in data.get('query', {}).get('pages', {}).values():
        t = p.get('thumbnail', {}).get('source')
        if t:
            urls.append(t)
    return urls

FANDOM_TITLE = {
    'c-8-db-cyborg-pacifique': 'Android 8',
    'c-16-dbz-saga-androids': 'Android 16',
    'c-17-dbz-saga-androids': 'Android 17',
    'c-17-dbs-ranger-de-l-ile': 'Android 17',
    'c-17-dbs-barriere-ultime-tournoi-du-pouvoir': 'Android 17',
    'c-17-dbs-tournoi-du-pouvoir': 'Android 17',
    'c-18-dbz-vie-de-famille': 'Android 18',
    'c-18-dbz-cell-games-protegee-par-krilin': 'Android 18',
    'c-18-dbz-futur-regne-des-cyborgs': 'Android 18',
    'c-18-dbs-protection-de-krilin': 'Android 18',
    'goku-black-dbs-faux-goku-lame-de-ki': 'Goku Black',
    'goku-black-dbs-faux-goku-revele': 'Goku Black',
    'goku-black-dbs-forme-de-base': 'Goku Black',
    'black-goku-dbs-super-saiyan-rose': 'Goku Black',
    'goku-dbs-super-saiyan-god': 'Goku',
    'goku-dbs-super-saiyan-blue-kaioken-20': 'Goku',
    'goku-dbz-retour-sur-terre-apres-namek': 'Goku',
    'goku-dbs-super-saiyan-2-tournoi-du-pouvoir': 'Goku',
    'iru-dbs-kaioshin-univers-8': 'Iru',
}

def main():
    rows = json.loads((ROOT / 'qa/v23/db-portraits-cross.json').read_text(encoding='utf-8'))
    from playwright.sync_api import sync_playwright
    ok = fail = 0
    report = []
    seen_hashes = set()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(locale='en-US', viewport={'width': 1280, 'height': 900}).new_page()
        for i, card in enumerate(rows):
            sid = card['sourceId']
            dest = OUT / f'{sid}.webp'
            q = QUERIES.get(sid) or f"{card['name']} {card.get('form','')} Dragon Ball"
            print(f'[{i+1}/{len(rows)}] {sid} :: {q}', flush=True)
            candidates = []
            try:
                if sid in FANDOM_TITLE:
                    candidates += fandom(FANDOM_TITLE[sid])
            except Exception:
                pass
            try:
                candidates += bing(page, q)
            except Exception as ex:
                print('  bing', str(ex)[:100], flush=True)
            saved = False
            last = 'none'
            for url in candidates[:14]:
                try:
                    data = download(url)
                    # reject duplicate bytes across this batch
                    import hashlib
                    h = hashlib.sha1(data).hexdigest()
                    if h in seen_hashes:
                        last = 'dup_bytes'; continue
                    save_webp(data, dest)
                    seen_hashes.add(hashlib.sha1(dest.read_bytes()).hexdigest())
                    report.append({**card, 'status': 'ok', 'url': url, 'query': q})
                    ok += 1; saved = True; break
                except Exception as ex:
                    last = str(ex)[:120]
            if not saved:
                report.append({**card, 'status': 'fail', 'error': last, 'query': q}); fail += 1
            time.sleep(1.3)
        browser.close()
    (ROOT / 'qa/v23/auto-portrait-fill-report.json').write_text(json.dumps({'ok': ok, 'fail': fail, 'rows': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('done ok=', ok, 'fail=', fail)

if __name__ == '__main__':
    main()
