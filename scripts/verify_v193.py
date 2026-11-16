from pathlib import Path
import base64, hashlib, json, re

root = Path(__file__).resolve().parent.parent
before = json.loads((root / 'qa/v193/protected-before.json').read_text())
changed = [p for p, h in before.items() if not (root / p).is_file() or hashlib.sha256((root / p).read_bytes()).hexdigest() != h]
if changed:
    raise SystemExit('Fichiers protégés modifiés : ' + str(changed))
html = (root / 'JOUER_KI_ARENA_V19.html').read_text(encoding='utf-8')
if re.search(r'<script[^>]+src=|<link[^>]+rel="stylesheet"', html):
    raise SystemExit('Dépendance de chargement externe dans le HTML autonome')
prefix = 'globalThis.KI_EMBEDDED_ASSETS='
assets, _ = json.JSONDecoder().raw_decode(html[html.index(prefix) + len(prefix):])
for path, uri in assets.items():
    if hashlib.sha256(base64.b64decode(uri.split(',', 1)[1])).digest() != hashlib.sha256((root / path).read_bytes()).digest():
        raise SystemExit('Asset embarqué incorrect : ' + path)
for name in ['src/v193/profiles.js','src/v193/director.js','src/v193/fx.js','src/v193/inventory.js','src/v193/tutorial.js','src/v193/lab.js','src/v193/game.css','STATUS_V193.md','RAPPORT_QA_V193.md','README_JOUER.md','LANCER_SUR_PC_WINDOWS.bat']:
    if not (root / name).is_file():
        raise SystemExit('Fichier absent : ' + name)
result = {'version':'19.3.0','protectedFiles':len(before),'protectedChanged':changed,'embeddedAssets':len(assets),'embeddedAssetsByteIdentical':True,'htmlSha256':hashlib.sha256(html.encode()).hexdigest(),'htmlSelfContainedStructure':'PASS','browserFileProtocol':'BLOCKED_BY_BROWSER_POLICY','nativeWindows':'NOT_TESTED'}
(root / 'qa/v193/integrity.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
