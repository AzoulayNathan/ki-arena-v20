#!/usr/bin/env python3
"""Replace remaining shared DB portrait groups with distinct Fandom thumbs."""
from __future__ import annotations
import hashlib, io, json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'portraits-db'

# One kept file per hash-group stays as-is; others get a distinct source.
TARGETS = [
  # C-17 trio — keep c-17-dbs-tournoi-du-pouvoir.webp
  ('c-17-dbs-barriere-ultime-tournoi-du-pouvoir',
   'https://static.wikia.nocookie.net/dragonball/images/4/4b/Android_17_DBS_Broly.png/revision/latest/scale-to-width-down/800'),
  ('c-17-dbs-ranger-de-l-ile',
   'https://static.wikia.nocookie.net/dragonball/images/9/9d/Android_17_%28DBS%29.png/revision/latest/scale-to-width-down/800'),
  # C-18 pair — keep c-18-dbz-cell-games-protegee-par-krilin.webp
  ('c-18-dbz-futur-regne-des-cyborgs',
   'https://static.wikia.nocookie.net/dragonball/images/8/81/Future_Android_18.png/revision/latest/scale-to-width-down/800'),
  # Goku Black pair — keep goku-black-dbs-faux-goku-revele.webp
  ('goku-black-dbs-faux-goku-lame-de-ki',
   'https://static.wikia.nocookie.net/dragonball/images/7/7d/Goku_Black.png/revision/latest/scale-to-width-down/800'),
  # Goku SSG / Kaioken shared — keep goku-dbs-super-saiyan-god.webp
  ('goku-dbz-kaioken-3-contre-vegeta',
   'https://static.wikia.nocookie.net/dragonball/images/5/5b/Goku_Kaioken.png/revision/latest/scale-to-width-down/800'),
]

UA = 'KI-ARENA-PortraitFix/1.0 (local repair; +https://ki-arena-v20.pages.dev)'

def fetch(url: str) -> bytes:
  req = urllib.request.Request(url, headers={
    'User-Agent': UA,
    'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
    'Referer': 'https://dragonball.fandom.com/',
  })
  with urllib.request.urlopen(req, timeout=30) as r:
    data = r.read(8 * 1024 * 1024 + 1)
  if len(data) > 8 * 1024 * 1024:
    raise ValueError('too large')
  return data

def save_webp(data: bytes, dest: Path):
  from PIL import Image
  im = Image.open(io.BytesIO(data)).convert('RGBA')
  if im.width < 80 or im.height < 80:
    raise ValueError('too small')
  im.thumbnail((480, 640), Image.Resampling.LANCZOS)
  canvas = Image.new('RGBA', (480, 640), (0, 0, 0, 0))
  canvas.alpha_composite(im, ((480 - im.width) // 2, (640 - im.height) // 2))
  dest.parent.mkdir(parents=True, exist_ok=True)
  canvas.convert('RGB').save(dest, format='WEBP', quality=86, method=6)

def main():
  report = []
  for sid, url in TARGETS:
    dest = OUT / f'{sid}.webp'
    before = hashlib.sha1(dest.read_bytes()).hexdigest() if dest.exists() else None
    try:
      data = fetch(url)
      save_webp(data, dest)
      after = hashlib.sha1(dest.read_bytes()).hexdigest()
      ok = after != before
      report.append({'id': sid, 'ok': ok, 'bytes': dest.stat().st_size, 'url': url})
      print(('OK' if ok else 'SAME'), sid, dest.stat().st_size)
    except Exception as e:
      report.append({'id': sid, 'ok': False, 'error': str(e), 'url': url})
      print('FAIL', sid, e)
  out = ROOT / 'qa' / 'v23' / 'shared-db-portraits-fix.json'
  out.write_text(json.dumps(report, indent=2), encoding='utf-8')
  print('wrote', out)

if __name__ == '__main__':
  main()
