#!/usr/bin/env python3
from __future__ import annotations
import json, time, urllib.parse, io, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'
rows = json.loads((ROOT / 'qa/v23/db-portraits-cross.json').read_text(encoding='utf-8'))
need = [r for r in rows if not (OUT / f"{r['sourceId']}.webp").exists()]

QUERIES = {
 'c-18-dbz-vie-de-famille': 'Android 18 Dragon Ball blonde',
 'c-18-dbz-cell-games-protegee-par-krilin': 'Android 18 Cell Games',
 'c-18-dbz-futur-regne-des-cyborgs': 'Future Android 18 Dragon Ball',
 'c-16-dbz-saga-androids': 'Android 16 Dragon Ball red vest',
 'c-17-dbs-ranger-de-l-ile': 'Android 17 island ranger Dragon Ball Super',
 'c-17-dbs-barriere-ultime-tournoi-du-pouvoir': 'Android 17 Tournament of Power barrier',
 'c-17-dbs-tournoi-du-pouvoir': 'Android 17 Tournament of Power Dragon Ball Super',
 'goku-black-dbs-faux-goku-lame-de-ki': 'Goku Black ki scythe Dragon Ball Super',
 'goku-black-dbs-faux-goku-revele': 'Goku Black black hair revealed',
 'goku-black-dbs-forme-de-base': 'Goku Black base form black gi',
 'black-goku-dbs-super-saiyan-rose': 'Goku Black Super Saiyan Rose pink',
 'goku-dbs-super-saiyan-god': 'Goku Super Saiyan God red aura',
 'goku-dbs-super-saiyan-blue-kaioken-20': 'Goku Super Saiyan Blue Kaioken',
 'goku-dbz-retour-sur-terre-apres-namek': 'Goku return Earth after Namek',
 'goku-dbs-super-saiyan-2-tournoi-du-pouvoir': 'Goku Super Saiyan 2 Tournament of Power',
}

def save(data: bytes, dest: Path):
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 90 or im.height < 90:
        raise ValueError('small')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    canvas.convert('RGB').save(dest, 'WEBP', quality=86, method=6)

JS = """els => els.slice(0,20).map(e => {
  try { return JSON.parse(e.getAttribute('m')||'{}').murl || ''; }
  catch { return ''; }
}).filter(Boolean)"""

print('need', len(need), [r['sourceId'] for r in need])
seen = set()
# also track existing hashes to avoid colliding with current roster
for p in OUT.glob('*.webp'):
    seen.add(hashlib.sha1(p.read_bytes()).hexdigest())
ok = fail = 0
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(locale='en-US', user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36')
    page = ctx.new_page()
    for i, r in enumerate(need):
        sid = r['sourceId']
        dest = OUT / f'{sid}.webp'
        q = QUERIES.get(sid, r['name'] + ' Dragon Ball')
        print(f'[{i+1}/{len(need)}] {sid} :: {q}', flush=True)
        url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(q) + '&form=HDRSC2'
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=35000)
            page.wait_for_timeout(1400)
            urls = page.locator('a.iusc').evaluate_all(JS)
            saved = False
            last = 'none'
            for u in urls:
                try:
                    resp = ctx.request.get(u, timeout=20000)
                    if not resp.ok:
                        last = f'http {resp.status}'
                        continue
                    data = resp.body()
                    h = hashlib.sha1(data).hexdigest()
                    if h in seen:
                        last = 'dup'
                        continue
                    save(data, dest)
                    seen.add(hashlib.sha1(dest.read_bytes()).hexdigest())
                    ok += 1
                    saved = True
                    print('  ok', u[:90], flush=True)
                    break
                except Exception as ex:
                    last = str(ex)[:120]
            if not saved:
                fail += 1
                print('  fail', last, flush=True)
        except Exception as ex:
            fail += 1
            print('  nav', ex, flush=True)
        time.sleep(1.4)
    browser.close()
print('done', ok, fail)
