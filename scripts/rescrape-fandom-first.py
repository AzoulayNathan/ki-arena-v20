#!/usr/bin/env python3
"""Fill remaining portraits preferring Fandom thumbnails, then Bing with ASCII queries."""
from __future__ import annotations
import json, time, urllib.parse, urllib.request, io, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'
WIKI = 'dragonball'

def ascii_q(s: str) -> str:
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return s.replace('—', '-').replace('–', '-').encode('ascii', 'ignore').decode('ascii')

def save_webp(data: bytes, dest: Path):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 80 or im.height < 80:
        raise ValueError('too small')
    sample = im.resize((32, 32))
    colors = sample.getcolors(32 * 32) or []
    if len(colors) <= 4:
        raise ValueError('too flat')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(dest, format='WEBP', quality=85, method=6)

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
        'Referer': 'https://dragonball.fandom.com/',
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read(6 * 1024 * 1024 + 1)
    if len(data) > 6 * 1024 * 1024:
        raise ValueError('too large')
    return data

def fandom_urls(name: str, form: str = ''):
    titles = [name]
    # common english aliases
    aliases = {
        'C-17': 'Android 17', 'C-18': 'Android 18', 'C-16': 'Android 16', 'C-8': 'Android 8',
        'Black Goku': 'Goku Black', 'Kid Buu': 'Kid Buu', 'Garlic Jr.': 'Garlic Jr.',
        'Buu': 'Majin Buu',
    }
    if name in aliases:
        titles.append(aliases[name])
    if form:
        titles.append(f'{name} ({form})')
    urls = []
    for title in titles:
        api = f'https://{WIKI}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages|images&format=json&pithumbsize=1000&pilimit=10'
        try:
            req = urllib.request.Request(api, headers={'User-Agent': 'KI-ARENA-PortraitFill/1.1'})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode('utf-8', 'ignore'))
            for p in data.get('query', {}).get('pages', {}).values():
                t = p.get('thumbnail', {}).get('source')
                if t:
                    urls.append(t)
        except Exception:
            pass
    # search API fallback
    try:
        q = urllib.parse.quote(name + ' ' + (form or ''))
        api = f'https://{WIKI}.fandom.com/api.php?action=query&list=search&srsearch={q}&format=json&srlimit=3'
        req = urllib.request.Request(api, headers={'User-Agent': 'KI-ARENA-PortraitFill/1.1'})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode('utf-8', 'ignore'))
        for hit in data.get('query', {}).get('search', []):
            title = hit.get('title')
            if not title:
                continue
            api2 = f'https://{WIKI}.fandom.com/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=1000'
            req2 = urllib.request.Request(api2, headers={'User-Agent': 'KI-ARENA-PortraitFill/1.1'})
            with urllib.request.urlopen(req2, timeout=15) as r2:
                data2 = json.loads(r2.read().decode('utf-8', 'ignore'))
            for p in data2.get('query', {}).get('pages', {}).values():
                t = p.get('thumbnail', {}).get('source')
                if t:
                    urls.append(t)
    except Exception:
        pass
    out = []
    for u in urls:
        if u not in out:
            out.append(u)
    return out

def bing_urls(page, query: str):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&qft=+filterui:photo-photo&form=IRFLTR'
    page.goto(url, wait_until='domcontentloaded', timeout=35000)
    page.wait_for_timeout(1100)
    found = page.locator('a.iusc').evaluate_all("""els => els.slice(0,20).map(e => {
      try { const m = JSON.parse(e.getAttribute('m')||'{}'); return m.murl || m.turl || ''; }
      catch { return ''; }
    }).filter(Boolean)""")
    out = []
    for u in found:
        if u not in out:
            out.append(u)
    return out

def main():
    rows = json.loads((ROOT / 'qa/v23/db-portraits-retry.json').read_text(encoding='utf-8'))
    from playwright.sync_api import sync_playwright
    ok = fail = 0
    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(locale='en-US', viewport={'width': 1280, 'height': 900}).new_page()
        for i, card in enumerate(rows):
            source = card.get('sourceId') or card['id'].split(':', 1)[-1]
            dest = OUT / f'{source}.webp'
            name = card.get('name') or ''
            form = card.get('form') or ''
            print(f'[{i+1}/{len(rows)}] {card["id"]}', flush=True)
            try:
                if dest.exists() and dest.stat().st_size > 15000:
                    report.append({**card, 'status': 'already'}); ok += 1; continue
                candidates = fandom_urls(name, form)
                q = ascii_q(f'"{name}" "{form}" Dragon Ball character portrait' if form else f'"{name}" Dragon Ball character portrait')
                try:
                    candidates += bing_urls(page, q)
                except Exception as ex:
                    print('  bing skip', str(ex)[:80], flush=True)
                saved = False
                last = 'no_candidate'
                for url in candidates[:12]:
                    try:
                        data = download(url)
                        save_webp(data, dest)
                        report.append({**card, 'status': 'ok', 'url': url})
                        ok += 1; saved = True; break
                    except Exception as ex:
                        last = str(ex)[:140]
                if not saved:
                    report.append({**card, 'status': 'fail', 'error': last}); fail += 1
            except Exception as ex:
                report.append({**card, 'status': 'error', 'error': str(ex)[:160]}); fail += 1
            time.sleep(1.2)
        browser.close()
    out = ROOT / 'qa/v23/auto-portrait-fill-report.json'
    out.write_text(json.dumps({'ok': ok, 'fail': fail, 'rows': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('done ok=', ok, 'fail=', fail)

if __name__ == '__main__':
    main()
