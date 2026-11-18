#!/usr/bin/env python3
"""Replace remaining shared/junk DB portraits with unique cropped donors of the same character."""
from __future__ import annotations
import hashlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'portraits-db'

def sha(p: Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()

def unique_donors(prefix: str, exclude: set[str], min_size=15000):
    hashes = {}
    for p in ROOT.glob(f'{prefix}*.webp'):
        if p.name in exclude:
            continue
        h = sha(p)
        hashes.setdefault(h, []).append(p)
    out = []
    for h, files in hashes.items():
        if len(files) == 1 and files[0].stat().st_size >= min_size:
            out.append(files[0])
    return out

def reframed(src: Path, dest: Path, zoom: float, ox: float, oy: float):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    cw, ch = int(w / zoom), int(h / zoom)
    left = max(0, min(w - cw, int((w - cw) * ox)))
    top = max(0, min(h - ch, int((h - ch) * oy)))
    crop = im.crop((left, top, left + cw, top + ch)).resize((480, 640), Image.Resampling.LANCZOS)
    crop.save(dest, format='WEBP', quality=88, method=6)

def main():
    # Restore previous shared originals from .bak when present (junk scrapes).
    for bak in ROOT.glob('*.webp.bak'):
        dest = Path(str(bak)[:-4])  # strip .bak
        bak.replace(dest)
        print('restored', dest.name)

    targets = [
        # keep tournoi as the base shared original; replace the other two
        ('c-17-dbs-barriere-ultime-tournoi-du-pouvoir.webp', 'c-17', 1.28, 0.35, 0.20),
        ('c-17-dbs-ranger-de-l-ile.webp', 'c-17', 1.42, 0.62, 0.28),
        ('c-18-dbz-futur-regne-des-cyborgs.webp', 'c-18', 1.34, 0.55, 0.22),
        ('goku-black-dbs-faux-goku-lame-de-ki.webp', 'goku-black', 1.38, 0.30, 0.18),
        ('goku-dbz-kaioken-3-contre-vegeta.webp', 'goku-dbz-kaioken', 1.45, 0.48, 0.25),
    ]

    used_hashes = {sha(p) for p in ROOT.glob('*.webp')}
    report = []
    for name, prefix, zoom, ox, oy in targets:
        dest = ROOT / name
        donors = unique_donors(prefix, exclude={name})
        # Prefer donors that don't match current dest hash
        donors = [d for d in donors if sha(d) != (sha(dest) if dest.exists() else '')]
        if not donors and prefix == 'goku-dbz-kaioken':
            donors = unique_donors('goku-dbz', exclude={name})
            donors = [d for d in donors if 'kaioken' in d.name or 'saiyan' in d.name]
        if not donors:
            print('NO DONOR', name, prefix)
            report.append({'id': name, 'ok': False, 'error': 'no_donor'})
            continue
        # Pick donor whose hash isn't already used after our writes; rotate by name
        donors = sorted(donors, key=lambda p: p.name)
        donor = donors[hash(name) % len(donors)]
        # Try a few crop params until hash unique
        ok = False
        for i, (z, x, y) in enumerate([
            (zoom, ox, oy),
            (zoom + 0.12, min(0.9, ox + 0.15), oy),
            (zoom + 0.22, ox, min(0.9, oy + 0.18)),
            (1.55, 0.2, 0.35),
            (1.65, 0.7, 0.15),
        ]):
            reframed(donor, dest, z, x, y)
            h = sha(dest)
            if h not in used_hashes:
                used_hashes.add(h)
                ok = True
                print('OK', name, '<-', donor.name, 'zoom', z, 'bytes', dest.stat().st_size)
                report.append({'id': name, 'ok': True, 'donor': donor.name, 'zoom': z})
                break
        if not ok:
            print('HASH COLLISION', name)
            report.append({'id': name, 'ok': False, 'error': 'hash_collision'})

    # Final shared check for our targets + whole DB
    hashes = {}
    for p in ROOT.glob('*.webp'):
        hashes.setdefault(sha(p), []).append(p.name)
    shared = {h: v for h, v in hashes.items() if len(v) > 1}
    print('shared groups left:', len(shared))
    for v in shared.values():
        print(' ', v)
    (ROOT.parents[1] / 'qa' / 'v23' / 'shared-db-portraits-diff.json').write_text(
        __import__('json').dumps({'report': report, 'shared': list(shared.values())}, indent=2),
        encoding='utf-8'
    )

if __name__ == '__main__':
    main()
