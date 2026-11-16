"""Artifact integrity is independent from the product quality gate.
--integrity verifies the packaged bytes; default also fails for unresolved exit criteria.
"""
from pathlib import Path
import json,hashlib,base64,re,subprocess,tempfile,argparse
root=Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--integrity',action='store_true');opts=args.parse_args()
def check(value,message):
 if not value:raise SystemExit('FAIL: '+message)
html_path=root/'JOUER_KI_ARENA_V21.html';text=html_path.read_text(encoding='utf-8')
decoder=json.JSONDecoder()
def payload(marker):
 i=text.index(marker)+len(marker)
 return decoder.raw_decode(text[i:])[0]
paths=json.loads(re.search(r'<script id="ki-asset-index" type="application/json">(.*?)</script>',text,re.S)[1])
data={int(i):(mime,encoded) for i,mime,encoded in re.findall(r'<script type="application/octet-stream" id="ki-payload-(\d+)" data-mime="([^"]+)">(.*?)</script>',text,re.S)}
assets=sorted(p for p in (root/'assets').rglob('*') if p.is_file() and p.suffix.lower() not in {'.tmp','.part','.pyc'})
check(len(paths)==len(assets),'Inventaire autonome incomplet')
digests={}
for p in assets:
 name=p.relative_to(root).as_posix();check(name in paths,'Asset absent : '+name)
 i=paths[name]
 if i not in digests:digests[i]=hashlib.sha256(base64.b64decode(data[i][1],validate=True)).hexdigest()
 check(digests[i]==hashlib.sha256(p.read_bytes()).hexdigest(),'Asset altéré : '+name)
for name,digest in json.loads((root/'qa/v21/protected-before.json').read_text()).items():
 check(hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,'Source protégée altérée : '+name)
check('src/v21/battle.js' in text and 'v21-face' in text and '--v21-battle-art' in text,'Intégration V21 absente')
check('type="module" src=' not in text and 'rel="stylesheet" href=' not in text,'Chargement de module ou CSS externe obligatoire')
scripts=re.findall(r'<script>(.*?)</script>',text,re.S)
with tempfile.TemporaryDirectory(prefix='ki-v21-verify-') as folder:
 for n,js in enumerate(scripts):
  p=Path(folder)/('bundle-'+str(n)+'.js');p.write_text(js);r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
  check(r.returncode==0,r.stderr[-2000:])
receipt={'status':'PASS','assets':len(paths),'uniquePayloads':len(data),'allAssetsByteVerified':True,'inlineScriptsSyntax':'PASS','htmlBytes':html_path.stat().st_size,'htmlSha256':hashlib.sha256(html_path.read_bytes()).hexdigest(),'fileProtocolWindows':'NOT_VALIDATED'}
(root/'qa/v21/offline-integrity.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt,indent=2))
if not opts.integrity:
 quality=json.loads((root/'qa/v21/status.json').read_text())
 unresolved={k:v for k,v in quality.items() if v['status']!='PASS'}
 if unresolved:
  print('QUALITY GATE NOT PASSED: '+', '.join(unresolved))
  raise SystemExit(2)

