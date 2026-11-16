"""Non-zero release gate. Known inherited limits are reported, never converted to PASS."""
from pathlib import Path
import json,subprocess,hashlib,csv,xml.etree.ElementTree as ET,wave
from PIL import Image
root=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def verify():
 proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{sourceProof}from'./scripts/qa-v18-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
 reports=['base','components','games','party','extras','media','encounters']
 for name in reports:
  r=json.loads((root/'qa/v18'/name/'browser.json').read_text());assert r['ok'],name+': '+str(r.get('failure'));assert r['sourceProof']==proof,name+' stale evidence'
  for k in ['errors','external','missing']:assert not r.get(k),name+': '+k
 m=json.loads((root/'qa/v18/model/browser.json').read_text());assert m['ok'] and not m['errors'] and not m['external'];assert m['modelSha256']==sha(root/'MODELE_CARTE_V18.html'),'Stale model evidence'
 protected=json.loads((root/'PRE_V18_HASHES.json').read_text())
 for name,h in protected.items():
  if name!='src/arena/ui.js':assert sha(root/name)==h,name
 ui=(root/'src/arena/ui.js').read_text().replace("import {polishV18} from '../v18/polish.js';\n",'').replace('polishV18(app,{page,run});','');assert hashlib.sha256(ui.encode()).hexdigest()==protected['src/arena/ui.js']
 rows=list(csv.DictReader((root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig',newline='')));assert len(rows)==828
 assert {r['chemin'] for r in rows}=={p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
 for row in rows:
  p=root/row['chemin'];assert p.stat().st_size==int(row['octets']) and sha(p)==row['sha256'],str(p)
  if p.suffix=='.svg':ET.fromstring(p.read_bytes())
  elif p.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif']:
   with Image.open(p) as im:im.verify()
  elif p.suffix=='.wav':
   with wave.open(str(p)) as w:assert w.getnframes()>0
 for n in ['README_JOUER.md','STATUS_V18.md','STATUS_V9.md','RAPPORT_QA.md','DESIGN_SYSTEM_V18.md','CHANGELOG_V18.md','APERCUS_V18.html','MODELE_CARTE_V18.html']:
  assert (root/n).stat().st_size>0,n
 bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes();assert b'JOUER_KI_ARENA_V18.html' in bat and b'\r\n' in bat
 for n in ['draft-simulation.json','difficulty.json']:
  r=json.loads((root/'qa/v17'/n).read_text());assert r['ok']
 result={'ok':True,'reports':reports+['model'],'sourceProof':proof,'protectedFiles':len(protected),'assets':828,'modelSha256':sha(root/'MODELE_CARTE_V18.html'),'limits':['Windows native not tested','Legacy visual menus intentionally unchanged','Global adventure balance remains unvalidated','Missing portraits and OST remain missing','12-test original Python pack absent']}
 (root/'qa/v18/release-check.json').write_text(json.dumps(result,indent=2)+'\n');return result
if __name__=='__main__':print(json.dumps(verify(),indent=2))
