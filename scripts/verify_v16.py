"""Validate the exact delivered runtime, browser evidence, protection and assets."""
from pathlib import Path
import csv,hashlib,json,subprocess,sys,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parents[1]
def verify():
    proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sourceProof} from './scripts/qa-v16-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
    names=['smoke.json','menu/browser.json','carousel/browser.json','extras/browser.json','full/browser.json','party/browser.json','pages/browser.json','natural/browser.json','media/browser.json','effects/browser.json','sealed/browser.json']
    for name in names:
        r=json.loads((root/'qa/v16'/name).read_text())
        assert r.get('ok') is True and not r.get('errors') and not r.get('external') and not r.get('missing'),name
        assert r.get('sourceProof')==proof,'Stale evidence: '+name
    allowed={'src/arena/engine.js','src/arena/storage.js','src/arena/ui.js','src/party/ui.js','src/v15/home.js','src/v14/asset-index.js'}
    protected=json.loads((root/'PRE_V16_HASHES.json').read_text())
    for name,h in protected.items():
        if name not in allowed:assert hashlib.sha256((root/name).read_bytes()).hexdigest()==h,name
    rows=list(csv.DictReader((root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig',newline='')))
    assert len(rows)==len({r['chemin'] for r in rows})
    assert {r['chemin'] for r in rows}=={p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
    for row in rows:
        p=root/row['chemin'];data=p.read_bytes()
        assert len(data)==int(row['octets'])>0 and hashlib.sha256(data).hexdigest()==row['sha256'],str(p)
        if p.suffix.lower()=='.svg':ET.fromstring(data)
        elif p.suffix.lower() in ['.png','.webp','.jpeg','.jpg','.gif']:
            with Image.open(p) as im:im.verify()
    new=json.loads((root/'qa/v16/new-assets.json').read_text());assert new['ok'] and new['newIllustrations']==6 and new['totalAssets']==len(rows)==824
    sim=json.loads((root/'qa/v16/simulation.json').read_text());assert sim['ok'] and sim['runs']>=1500 and sim['encounters']==270000
    play=json.loads((root/'qa/v16/gameplay-simulation.json').read_text());assert play['ok'] and play['seeds']>=1000 and not play['errors']
    baseline=json.loads((root/'qa/v16/audit-draft-v15.json').read_text());assert baseline['ok'] and not baseline['outOfBand']
    for name in ['README_JOUER.md','STATUS_V16.md','RAPPORT_QA.md','DESIGN_SYSTEM_V16.md','CHANGELOG_V16.md','BACKUP_V15/BASE.json','LISTE_ITEMS_IMPLEMENTES.csv']:
        assert (root/name).stat().st_size>0,name
    bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes();assert b'JOUER_KI_ARENA_V16.html' in bat and b'\r\n' in bat
    result={'ok':True,'browserReports':len(names),'assets':len(rows),'newArt':6,'protectedBaselineFiles':len(protected),'authorizedExceptions':sorted(allowed),'sourceProof':proof}
    print(json.dumps(result,indent=2));return result
if __name__=='__main__':
    try:verify()
    except Exception as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
