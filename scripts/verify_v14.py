"""Validate the actual V14 release and its runtime-bound browser evidence."""
from pathlib import Path
import csv, hashlib, json, subprocess, sys, xml.etree.ElementTree as ET
from PIL import Image
root = Path(__file__).resolve().parents[1]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def verify():
    proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sourceProof} from './scripts/qa-v14-stamp.mjs'; console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
    for name in ['smoke.json','full/browser.json','party/browser.json','natural/browser.json','media/browser.json','effects/browser.json']:
        r=json.loads((root/'qa/v14'/name).read_text())
        assert r.get('ok') is True and not r.get('errors') and not r.get('external'),name
        assert r.get('sourceProof')==proof,'Stale browser evidence: '+name
    ranks=json.loads((root/'qa/v14/rank-simulation.json').read_text())
    assert ranks['ok'] and not ranks['errors'] and ranks['checks']>=2700000 and ranks['seeds']>=1000
    runs=json.loads((root/'qa/v14/gameplay-simulation.json').read_text())
    assert runs['ok'] and not runs['errors'] and runs['seeds']>=1000
    items=json.loads((root/'qa/v14/items-execution.json').read_text())
    assert items['ok'] and not items['errors'] and items['total']==163 and items['active']+items['excluded']==items['total']
    rows=list(csv.DictReader((root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig',newline='')))
    actual={p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
    assert {x['chemin'] for x in rows}==actual,'Incomplete asset inventory'
    for row in rows:
        p=root/row['chemin'];assert p.stat().st_size==int(row['octets'])>0 and sha(p)==row['sha256'],str(p)
        if p.suffix.lower()=='.svg':ET.fromstring(p.read_bytes())
        elif p.suffix.lower() in ['.webp','.png','.jpg','.jpeg','.gif']:
            with Image.open(p) as im:im.verify()
    maps=list((root/'assets/v14/maps').glob('*.webp'));assert len(maps)==6
    for p in maps:
        with Image.open(p) as im:assert im.size==(1536,1024)
    for name in ['README_JOUER.md','STATUS_V14.md','STATUS_V9.md','RAPPORT_QA.md','AUDIT_V14.md','CHANGELOG_V14.md','DESIGN_SYSTEM_V14.md','LISTE_ITEMS_IMPLEMENTES.csv','BACKUP_V13/RESTORE_V13.json']:
        assert (root/name).stat().st_size>0,name
    bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes()
    assert b'JOUER_KI_ARENA_V14.html' in bat and b'\r\n' in bat
    print(json.dumps({'ok':True,'assets':len(rows),'browserReports':6,'rankChecks':ranks['checks'],'runSeeds':runs['seeds'],'activeItems':items['active'],'sourceProof':proof},indent=2))
if __name__=='__main__':
    try:verify()
    except Exception as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
