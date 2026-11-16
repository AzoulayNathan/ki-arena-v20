#!/usr/bin/env python3
"""Auto-fill missing character portraits via Google Images (first usable result).
Query = full name + form/subtitle + franchise. Saves into assets/portraits-{world}/.
"""
from __future__ import annotations
import argparse, json, re, time, urllib.parse, urllib.request, io, sys
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

def load_missing(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))

def query_for(card):
    franchise = FRANCHISE.get(card['universe'], card['universe'])
    form = (card.get('form') or '').strip()
    name = (card.get('name') or '').strip()
    parts = [f'"{name}"']
    if form:
        parts.append(f'"{form}"')
    parts += [franchise, 'character', 'portrait']
    return ' '.join(parts)

def save_webp(data: bytes, dest: Path):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    if im.width < 80 or im.height < 80:
        raise ValueError('too small')
    im.thumbnail((480, 640), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(dest, format='WEBP', quality=85, method=6)

def fetch_first_google(page, query: str):
    url = 'https://www.google.com/search?tbm=isch&hl=fr&q=' + urllib.parse.quote(query)
    page.goto(url, wait_until='domcontentloaded', timeout=25000)
    if 'consent.' in page.url or 'sorry/' in page.url:
        # try accept consent buttons
        for sel in ['button:has-text("Accept all")', 'button:has-text("Tout accepter")', '#L2AGLb']:
            try:
                page.locator(sel).first.click(timeout=1500)
                page.wait_for_timeout(800)
                break
            except Exception:
                pass
    page.wait_for_timeout(700)
    found = page.locator('img').evaluate_all(
        """els => els.map(e => ({src:e.currentSrc||e.src, w:e.naturalWidth, h:e.naturalHeight, alt:e.alt||''}))
            .filter(x => x.src && x.src.startsWith('http') && x.w >= 120 && x.h >= 120
              && !/logo|google|favicon|sprite|gstatic\\.com\\/images\\/branding/i.test(x.src+x.alt))"""
    )
    if not found:
        return None
    return found[0]['src']

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KI-ARENA-PortraitFill/1.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read(6 * 1024 * 1024 + 1)
    if len(data) > 6 * 1024 * 1024:
        raise ValueError('too large')
    return data

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', default=str(ROOT / 'qa' / 'v23' / 'missing-portraits.json'))
    ap.add_argument('--limit', type=int, default=80)
    ap.add_argument('--delay', type=float, default=1.1)
    ap.add_argument('--offset', type=int, default=0)
    args = ap.parse_args()
    missing = load_missing(Path(args.list))
    batch = missing[args.offset:args.offset + args.limit]
    if not batch:
        print('nothing to fill'); return
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit('pip install playwright pillow && playwright install chromium')
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
                if dest.exists() and dest.stat().st_size > 2000:
                    report.append({**card, 'status': 'already', 'file': dest.as_posix()}); ok += 1; continue
                img = fetch_first_google(page, q)
                if not img:
                    report.append({**card, 'status': 'no_image', 'query': q}); fail += 1; continue
                data = download(img)
                save_webp(data, dest)
                report.append({**card, 'status': 'ok', 'query': q, 'url': img, 'file': str(dest.relative_to(ROOT)).replace('\\', '/')})
                ok += 1
            except Exception as ex:
                report.append({**card, 'status': 'error', 'query': q, 'error': str(ex)[:160]}); fail += 1
            time.sleep(args.delay)
        browser.close()
    out = ROOT / 'qa' / 'v23' / 'auto-portrait-fill-report.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({'ok': ok, 'fail': fail, 'rows': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('done ok=', ok, 'fail=', fail, 'report=', out)

if __name__ == '__main__':
    main()
