from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parent.parent
before=json.loads((root/'qa/v192/protected-before.json').read_text())
changed=[p for p,h in before.items() if hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
if changed:raise SystemExit('Protected files changed: '+str(changed))
html=(root/'JOUER_KI_ARENA_V19.html').read_text();assert not re.search(r'<script[^>]+src=|<link[^>]+rel="stylesheet"',html)
for p in (root/'assets/v192').glob('*'):assert p.stat().st_size>1000
out={'protectedFiles':len(before),'changed':changed,'htmlSha256':hashlib.sha256(html.encode()).hexdigest(),'selfContainedReferences':True}
(root/'qa/v192/integrity.json').write_text(json.dumps(out,indent=2));print(json.dumps(out))
