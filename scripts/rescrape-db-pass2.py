#!/usr/bin/env python3
"""Pass 2: fill remaining missing DB portraits with unique queries + Playwright request."""
from __future__ import annotations
import hashlib, io, json, time, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'
ROWS = json.loads((ROOT / 'qa/v23/db-portraits-retry2.json').read_text(encoding='utf-8'))

QUERIES = {
    'trunks-dbz-super-saiyan-fusion-avec-goten': 'Gotenks Super Saiyan Dragon Ball',
    'trunks-dbs-super-saiyan-2-retour-du-futur': 'Future Trunks Super Saiyan 2 Dragon Ball Super',
    'trunks-dbs-futur-super-saiyan-2-contre-zamasu': 'Future Trunks vs Zamasu Super Saiyan 2',
    'trunks-dbs-super-saiyan-rage': 'Trunks Super Saiyan Rage Dragon Ball Super',
    'trunks-dbs-super-saiyan-rage-epee-de-l-espoir': 'Trunks Super Saiyan Rage sword hope aura',
    'goku-dbz-kaioken-3-contre-vegeta': 'Goku Kaio-ken times 3 vs Vegeta DBZ',
    'goku-dbz-kaioken-4-kamehameha': 'Goku Kaio-ken x4 Kamehameha Namek',
    'goku-dbz-super-saiyan-2-majin-vegeta': 'Goku Super Saiyan 2 Majin Vegeta fight',
    'vegeta-dbz-saga-freezer-recuperation-sur-namek': 'Vegeta Namek recovery bandage Dragon Ball',
    'goku-black-dbs-faux-goku-lame-de-ki': 'Goku Black scythe pink aura Dragon Ball Super',
    'goku-black-dbs-faux-goku-revele': 'Goku Black black hair potara Dragon Ball Super',
    'goku-black-dbs-forme-de-base': 'Goku Black base form black gi time ring',
    'goku-dbs-super-saiyan-god': 'Goku Super Saiyan God red hair Dragon Ball Super',
    'black-goku-dbs-super-saiyan-rose': 'Goku Black Super Saiyan Rose pink hair',
    'goku-dbs-super-saiyan-blue-kaioken-20': 'Goku Super Saiyan Blue Kaio-ken x20 purple aura',
    'c-18-dbz-cell-games-protegee-par-krilin': 'Android 18 Cell Games blonde jacket Dragon Ball',
    'c-18-dbz-futur-regne-des-cyborgs': 'Future Android 18 Future Trunks timeline',
    'c-17-dbs-ranger-de-l-ile': 'Android 17 island ranger blue shirt Dragon Ball Super',
    'c-17-dbs-barriere-ultime-tournoi-du-pouvoir': 'Android 17 barrier Tournament of Power',
    'c-17-dbs-tournoi-du-pouvoir': 'Android 17 Tournament of Power Dragon Ball Super',
}

DIRECT = {
    'goku-black-dbs-forme-de-base': 'https://static.wikia.nocookie.net/dragonball/images/7/7e/GokuBlack.png/revision/latest?cb=20161031173751',
    'black-goku-dbs-super-saiyan-rose': 'https://static.wikia.nocookie.net/dragonball/images/8/81/Goku_Black_SSR.png/revision/latest?cb=20161115035324',
    'goku-dbs-super-saiyan-god': 'https://static.wikia.nocookie.net/dragonball/images/6/60/SSGGoku.png/revision/latest?cb=20131102192828',
    'goku-dbs-super-saiyan-blue-kaioken-20': 'https://static.wikia.nocookie.net/dragonball/images/4/4c/Goku_SSBKK.png/revision/latest?cb=20171014052641',
    'c-16-dbz-saga-androids': 'https://static.wikia.nocookie.net/dragonball/images/9/9a/Android_16_DBZ_Ep_149_001.png/revision/latest',
    'c-17-dbs-tournoi-du-pouvoir': 'https://static.wikia.nocookie.net/dragonball/images/0/0c/Android_17_DBS_Broly.png/revision/latest',
    'c-18-dbz-vie-de-famille': 'https://static.wikia.nocookie.net/dragonball/images/9/91/Android_18_DB_Super.png/revision/latest',
    'trunks-dbs-super-saiyan-rage': 'https://static.wikia.nocookie.net/dragonball/images/3/3a/Super_Saiyan_Rage_Trunks.png/revision/latest',
    'vegeta-dbz-saga-freezer-recuperation-sur-namek': 'https://static.wikia.nocookie.net/dragonball/images/0/0a/Vegeta_Namek.png/revision/latest',
}

BAD = ('androidauthority', 'billboard', 'amazon.', 'mlcdn', 'nist.gov', 'logo', 'favicon', 'beyonce')


def save(data: bytes, dest: Path):
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 90 or im.height < 90:
        raise ValueError('small')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    canvas.convert('RGB').save(dest, 'WEBP', quality=86, method=6)


JS = """els => els.slice(0,28).map(e => {
  try { return JSON.parse(e.getAttribute('m')||'{}').murl || ''; }
  catch { return ''; }
}).filter(Boolean)"""


def main():
    seen = {hashlib.sha1(p.read_bytes()).hexdigest() for p in OUT.glob('*.webp')}
    raw_seen = set()
    ok = fail = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            locale='en-US',
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        )
        page = ctx.new_page()

        def try_url(u: str, dest: Path) -> str | None:
            if any(b in u.lower() for b in BAD):
                return 'bad-host'
            try:
                resp = ctx.request.get(u, timeout=25000)
                if not resp.ok:
                    return f'http {resp.status}'
                data = resp.body()
                rh = hashlib.sha1(data).hexdigest()
                if rh in raw_seen:
                    return 'dup-raw'
                save(data, dest)
                wh = hashlib.sha1(dest.read_bytes()).hexdigest()
                if wh in seen:
                    dest.unlink(missing_ok=True)
                    return 'dup-webp'
                raw_seen.add(rh)
                seen.add(wh)
                return None
            except Exception as ex:
                return str(ex)[:120]

        for i, r in enumerate(ROWS):
            sid = r['sourceId']
            dest = OUT / f'{sid}.webp'
            if dest.exists() and dest.stat().st_size > 8000:
                print(f'[{i+1}] skip existing {sid}', flush=True)
                ok += 1
                continue
            print(f"[{i+1}/{len(ROWS)}] {sid}", flush=True)
            urls = []
            if sid in DIRECT:
                urls.append(DIRECT[sid])
            q = QUERIES.get(sid) or f"{r.get('name','')} {r.get('form','')} Dragon Ball"
            page.goto('https://www.bing.com/images/search?q=' + urllib.parse.quote(q) + '&form=HDRSC2', wait_until='domcontentloaded', timeout=35000)
            page.wait_for_timeout(1300)
            try:
                urls += page.locator('a.iusc').evaluate_all(JS)
            except Exception:
                pass
            # also try fandom search page scrape via API-like bing site filter
            page.goto('https://www.bing.com/images/search?q=' + urllib.parse.quote(q + ' site:dragonball.fandom.com') + '&form=HDRSC2', wait_until='domcontentloaded', timeout=35000)
            page.wait_for_timeout(1000)
            try:
                urls += page.locator('a.iusc').evaluate_all(JS)
            except Exception:
                pass
            # dedupe
            uniq = []
            for u in urls:
                if u and u not in uniq:
                    uniq.append(u)
            saved = False
            last = 'none'
            for u in uniq[:30]:
                err = try_url(u, dest)
                if err is None:
                    ok += 1
                    saved = True
                    print('  ok', u[:110], flush=True)
                    break
                last = err
            if not saved:
                fail += 1
                print('  fail', last, flush=True)
            time.sleep(1.1)
        browser.close()
    print('done', ok, fail)


if __name__ == '__main__':
    main()
