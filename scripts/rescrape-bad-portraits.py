#!/usr/bin/env python3
"""Rescrape bad/template portraits via Bing Images (Google often blocks)."""
from __future__ import annotations
import argparse, json, re, time, urllib.parse, urllib.request, io, hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_WORLD = {
    'DB': ROOT / 'assets' / 'portraits-db',
    'HXH': ROOT / 'assets' / 'portraits-hxh',
    'NARUTO': ROOT / 'assets' / 'portraits-naruto',
    'ONEPIECE': ROOT / 'assets' / 'portraits-onepiece',
}
FRANCHISE = {
    'DB': 'Dragon Ball',
    'HXH': 'Hunter x Hunter',
    'NARUTO': 'Naruto',
    'ONEPIECE': 'One Piece',
}

def query_for(card):
    franchise = FRANCHISE.get(card['universe'], card['universe'])
    form = (card.get('form') or '').strip()
    name = (card.get('name') or '').strip()
    parts = [f'"{name}"']
    if form and form.lower() not in ('base', 'base manga'):
        parts.append(f'"{form}"')
    parts += [franchise, 'character', 'portrait']
    return ' '.join(parts)

def save_webp(data: bytes, dest: Path):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 80 or im.height < 80:
        raise ValueError('too small')
    # Reject near-solid / blank canvases (common placeholder junk).
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.bing.com/',
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read(6 * 1024 * 1024 + 1)
    if len(data) > 6 * 1024 * 1024:
        raise ValueError('too large')
    return data

def bing_candidates(page, query: str, limit=8):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&qft=+filterui:photo-photo&form=IRFLTR'
    page.goto(url, wait_until='domcontentloaded', timeout=30000)
    page.wait_for_timeout(900)
    # Bing embeds murl in metadata attributes.
    found = page.locator('a.iusc').evaluate_all("""els => els.slice(0,24).map(e => {
      try { const m = JSON.parse(e.getAttribute('m')||'{}'); return m.murl || m.turl || ''; }
      catch { return ''; }
    }).filter(Boolean)""")
    if not found:
        found = page.locator('img').evaluate_all("""els => els.map(e => e.currentSrc||e.src||'')
          .filter(u => u.startsWith('http') && !/bing\\.com\\/(th|rp|sa)|logo|favicon/i.test(u))""")
    out = []
    for u in found:
        if u not in out:
            out.append(u)
        if len(out) >= limit:
            break
    return out

def fandom_candidates(card):
    wiki = {
        'DB': 'dragonball',
        'HXH': 'hunterxhunter',
        'NARUTO': 'naruto',
        'ONEPIECE': 'onepiece',
    }.get(card['universe'])
    if not wiki:
        return []
    name = (card.get('name') or '').strip()
    if not name:
        return []
    title = urllib.parse.quote(name.replace(' ', '_'))
    api = f'https://{wiki}.fandom.com/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=800'
    try:
        req = urllib.request.Request(api, headers={'User-Agent': 'KI-ARENA-PortraitFill/1.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode('utf-8', 'ignore'))
        pages = data.get('query', {}).get('pages', {})
        urls = []
        for p in pages.values():
            t = p.get('thumbnail', {}).get('source')
            if t:
                urls.append(t)
        return urls
    except Exception:
        return []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', default=str(ROOT / 'qa' / 'v23' / 'missing-portraits.json'))
    ap.add_argument('--limit', type=int, default=80)
    ap.add_argument('--delay', type=float, default=0.85)
    ap.add_argument('--offset', type=int, default=0)
    args = ap.parse_args()
    missing = json.loads(Path(args.list).read_text(encoding='utf-8'))
    batch = missing[args.offset:args.offset + args.limit]
    if not batch:
        print('nothing to fill'); return
    from playwright.sync_api import sync_playwright
    ok = fail = 0
    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(locale='fr-FR', viewport={'width': 1280, 'height': 900}).new_page()
        for i, card in enumerate(batch):
            source = card.get('sourceId') or card['id'].split(':', 1)[-1]
            world = card['universe']
            dest = OUT_WORLD[world] / f'{source}.webp'
            q = query_for(card)
            print(f'[{i+1}/{len(batch)}] {card["id"]} :: {q}', flush=True)
            try:
                if dest.exists() and dest.stat().st_size > 15000:
                    report.append({**card, 'status': 'already', 'file': str(dest.relative_to(ROOT)).replace('\\','/')}); ok += 1; continue
                candidates = fandom_candidates(card) + bing_candidates(page, q)
                saved = False
                last_err = 'no_candidate'
                for url in candidates[:10]:
                    try:
                        data = download(url)
                        save_webp(data, dest)
                        report.append({**card, 'status': 'ok', 'query': q, 'url': url, 'file': str(dest.relative_to(ROOT)).replace('\\','/'), 'sha1': hashlib.sha1(data).hexdigest()[:12]})
                        ok += 1; saved = True; break
                    except Exception as ex:
                        last_err = str(ex)[:120]
                if not saved:
                    report.append({**card, 'status': 'fail', 'query': q, 'error': last_err}); fail += 1
            except Exception as ex:
                report.append({**card, 'status': 'error', 'query': q, 'error': str(ex)[:160]}); fail += 1
            time.sleep(args.delay)
        browser.close()
    out = ROOT / 'qa' / 'v23' / 'auto-portrait-fill-report.json'
    out.write_text(json.dumps({'ok': ok, 'fail': fail, 'rows': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('done ok=', ok, 'fail=', fail, 'report=', out)

if __name__ == '__main__':
    main()
