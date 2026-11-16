from pathlib import Path
import json,hashlib,subprocess,sys,csv
root=Path(__file__).resolve().parent.parent
for p in ['JOUER_KI_ARENA_V11.html','LANCER_SUR_PC_WINDOWS.bat','README_JOUER.md','STATUS_V9.md','RAPPORT_QA.md','DESIGN_SYSTEM_V11.md','LISTE_ITEMS_IMPLEMENTES.csv','MANIFEST_ASSETS_ET_DROITS.csv','vendor/pixi-8.22.0.min.js','vendor/PIXI_LICENSE.txt']:
 assert (root/p).is_file(),p
for p,h in json.loads((root/'PRE_V10_HASHES.json').read_text()).items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h,p
for name in ['browser.json','effects-browser.json']:
 r=json.loads((root/'qa/v11'/name).read_text());assert r.get('ok') is True and not r['errors'],name
 if 'external' in r:assert not r['external']
sim=json.loads((root/'qa/v11/simulation-1000.json').read_text());assert sim['seeds']>=1000 and sim['rankChecks']>=2700000 and not sim['errors']
assets=list((root/'assets/v11').glob('*.webp'));assert len(assets)==9;assert all(p.stat().st_size>10000 for p in assets)
html=(root/'JOUER_KI_ARENA_V11.html').read_text();assert 'type="module" src=' not in html;assert 'src="./vendor/' not in html;assert 'KI_EMBEDDED_ASSETS' in html;assert 'globalThis.KI_OPEN_LEGACY' in html
bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes();assert b'\r\n' in bat and b'\\r\\n' not in bat and b'JOUER_KI_ARENA_V11.html' in bat
assert not any(root.rglob('node_modules'));assert not any(root.rglob('*.ts'))
with (root/'LISTE_ITEMS_IMPLEMENTES.csv').open(encoding='utf-8-sig') as f:items=list(csv.DictReader(f))
assert len(items)==163 and sum(i['statut']=='OK' for i in items)==95
print('PASS: offline bundle, current browser QA and effects, 1000 seeds, protected hashes, assets, Windows launcher, 95 active item proofs.')
print('BLOCKED: complete external character portraits and original OST absent; native Windows execution not available.')
