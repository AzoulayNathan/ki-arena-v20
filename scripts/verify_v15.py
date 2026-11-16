"""Verify current visual code against the tested browser runtime and all local assets."""
from pathlib import Path
import csv,hashlib,json,subprocess,sys,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parents[1]
def verify():
    proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sourceProof} from './scripts/qa-v15-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
    names=['smoke.json','menu/browser.json','extras/browser.json','full/browser.json','party/browser.json','natural/browser.json','media/browser.json','effects/browser.json']
    for name in names:
        r=json.loads((root/'qa/v15'/name).read_text())
        assert r.get('ok') is True and not r.get('errors') and not r.get('external') and not r.get('missing'),name
        assert r.get('sourceProof')==proof,'Stale evidence: '+name
    rows=list(csv.DictReader((root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig',newline='')))
    assert {r['chemin'] for r in rows}=={p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
    for row in rows:
        p=root/row['chemin'];data=p.read_bytes()
        assert len(data)==int(row['octets'])>0 and hashlib.sha256(data).hexdigest()==row['sha256'],str(p)
        if p.suffix.lower()=='.svg':ET.fromstring(data)
        elif p.suffix.lower() in ['.png','.webp','.jpeg','.jpg','.gif']:
            with Image.open(p) as im:im.verify()
    new=json.loads((root/'qa/v15/new-assets.json').read_text());assert new['ok'] and new['newIllustrations']==12 and new['totalAssets']==len(rows)==818
    for name in ['README_JOUER.md','STATUS_V15.md','RAPPORT_QA.md','DESIGN_SYSTEM_V15.md','CHANGELOG_V15.md','BACKUP_V14/BASE.json']:
        assert (root/name).stat().st_size>0,name
    bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes();assert b'JOUER_KI_ARENA_V15.html' in bat and b'\r\n' in bat
    print(json.dumps({'ok':True,'browserReports':len(names),'assets':len(rows),'newArt':12,'sourceProof':proof},indent=2))
if __name__=='__main__':
    try:verify()
    except Exception as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
