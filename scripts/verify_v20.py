from pathlib import Path
import base64,hashlib,json,re,subprocess,tempfile
from html.parser import HTMLParser
root=Path(__file__).resolve().parent.parent
before=json.loads((root/'qa/v20/protected-before.json').read_text())
changed=[p for p,h in before.items() if not (root/p).is_file() or hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
if changed:raise SystemExit('Protection échouée : '+str(changed))
html=(root/'JOUER_KI_ARENA_V19.html').read_text()
if re.search(r'<script[^>]+src=|<link[^>]+rel="stylesheet"',html):raise SystemExit('Dépendance de chargement dans le HTML')
prefix='globalThis.KI_EMBEDDED_ASSETS='
assets,_=json.JSONDecoder().raw_decode(html[html.index(prefix)+len(prefix):])
for path,uri in assets.items():
 if hashlib.sha256(base64.b64decode(uri.split(',',1)[1])).digest()!=hashlib.sha256((root/path).read_bytes()).digest():raise SystemExit('Asset incorrect '+path)
for name in ['src/v20/visual.css','src/v20/engine.js','src/v20/storage.js','src/v20/draft.js','src/v20/catalog.js','src/v20/events.js','src/v20/run-summary.js','src/v20/pantheon-ui.js','assets/v20/encounters.webp','assets/v20/arena.webp','assets/v20/archive.webp','assets/v20/arcade.webp','README_JOUER.md','STATUS_V20.md','RAPPORT_QA_V20.md','LANCER_SUR_PC_WINDOWS.bat']:
 if not (root/name).is_file():raise SystemExit('Fichier absent '+name)
class Scripts(HTMLParser):
 def __init__(self):super().__init__();self.active=False;self.scripts=[]
 def handle_starttag(self,t,a):
  if t=='script':self.active=True;self.scripts.append('')
 def handle_endtag(self,t):
  if t=='script':self.active=False
 def handle_data(self,d):
  if self.active:self.scripts[-1]+=d
parser=Scripts();parser.feed(html)
for source in parser.scripts:
 with tempfile.NamedTemporaryFile(suffix='.js') as f:
  f.write(source.encode());f.flush();subprocess.run(['node','--check',f.name],check=True,capture_output=True)
result={'version':'20.0.0','protectedFiles':len(before),'protectedChanged':changed,'embeddedAssets':len(assets),'embeddedAssetsByteIdentical':True,'htmlSelfContainedStructure':'PASS','scriptSyntax':'PASS','htmlSha256':hashlib.sha256(html.encode()).hexdigest(),'fileProtocolRuntime':'BLOCKED_BY_BROWSER_POLICY','nativeWindows':'NOT_TESTED','balance':'FAIL_NO_ACT_CLEAR_IN_1000_AUTOMATIC_RUNS'}
(root/'qa/v20/integrity.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
