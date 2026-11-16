"""Technical integrity and an honest separate product-quality gate (non-zero on failure)."""
from pathlib import Path
import sys,json,re,hashlib,base64,subprocess,tempfile
root=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check():
 html=root/'JOUER_KI_ARENA_V22.html'
 if not html.is_file():raise RuntimeError('HTML autonome absent : npm run build:offline')
 manifest=json.loads((root/'qa/v22/build-manifest.json').read_text())
 if sha(html)!=manifest['htmlSha256']:raise RuntimeError('HTML différent du build contrôlé')
 for path,expected in manifest['sources'].items():
  if sha(root/path)!=expected:raise RuntimeError('Source modifiée après build : '+path)
 protected=json.loads((root/'qa/v22/protected-v21.json').read_text())
 for path,expected in protected.items():
  if sha(root/path)!=expected:raise RuntimeError('Source/asset protégé modifié : '+path)
 text=html.read_text();m=re.search(r'<script id="ki-asset-index" type="application/json">(.*?)</script>',text,re.S)
 if not m:raise RuntimeError('Index offline absent')
 paths=json.loads(m[1]);payloads={}
 for m in re.finditer(r'<script type="application/octet-stream" id="ki-payload-(\d+)" data-mime="[^"]+">(.*?)</script>',text,re.S):
  payloads[int(m[1])]=hashlib.sha256(base64.b64decode(m[2],validate=True)).hexdigest()
 current={p.relative_to(root).as_posix():p for p in (root/'assets').rglob('*') if p.is_file() and p.suffix.lower() not in {'.tmp','.part','.pyc'}}
 if set(paths)!=set(current):raise RuntimeError('Liste des assets embarqués différente des sources')
 for path,p in current.items():
  if payloads.get(paths[path])!=sha(p):raise RuntimeError('Payload différent : '+path)
 if re.search(r'<script[^>]+src=|<link[^>]+rel="stylesheet"',text,re.I):raise RuntimeError('Dépendance JS/CSS externe à l’HTML')
 scripts=re.findall(r'<script>(.*?)</script>',text,re.S)
 with tempfile.TemporaryDirectory()as td:
  for i,source in enumerate(scripts):
   p=Path(td)/f'inline-{i}.js';p.write_text(source);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
 proof={'technical':'PASS','protectedFiles':len(protected),'assets':len(current),'payloads':len(payloads),'sourceFiles':len(manifest['sources']),'htmlBytes':html.stat().st_size,'htmlSha256':sha(html),'scope':'Intégrité et syntaxe ; ne certifie ni Windows natif ni file://.'}
 print(json.dumps(proof,ensure_ascii=False,indent=2))
 if '--integrity'not in sys.argv:
  status=json.loads((root/'qa/v22/status.json').read_text());bad={k:v for k,v in status.items()if v['status']!='PASS'}
  if bad:print('QUALITÉ PRODUIT NON VALIDÉE : '+', '.join(bad));return 2
 return 0
try:sys.exit(check())
except Exception as error:print('FAIL : '+str(error),file=sys.stderr);sys.exit(1)
