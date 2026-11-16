"""Release gate for V17: current evidence, protected runtime and every local asset."""
from pathlib import Path
import csv,hashlib,json,subprocess,sys,wave,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parents[1]
def verify():
    proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sourceProof} from './scripts/qa-v17-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
    report=json.loads((root/'qa/v17/browser.json').read_text());assert report['ok'] and not report['errors'] and not report['missing'] and not report['external'];assert report['sourceProof']==proof,'Stale browser evidence'
    sim=json.loads((root/'qa/v17/draft-simulation.json').read_text());assert sim['ok'] and sim['runs']==1500 and .29<sim['weaponProbability']<.31
    difficulty=json.loads((root/'qa/v17/difficulty.json').read_text());assert difficulty['ok'] and difficulty['encounters']==2700
    protected=json.loads((root/'PRE_V17_HASHES.json').read_text());allowed={'src/arena/engine.js','src/arena/storage.js','src/arena/ui.js','src/v15/home.js','src/v14/asset-index.js'}
    for name,h in protected.items():
        if name not in allowed:assert hashlib.sha256((root/name).read_bytes()).hexdigest()==h,name
    rows=list(csv.DictReader((root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig',newline='')))
    assert len(rows)==828 and {x['chemin'] for x in rows}=={p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
    for row in rows:
        p=root/row['chemin'];data=p.read_bytes();assert len(data)==int(row['octets'])>0 and hashlib.sha256(data).hexdigest()==row['sha256'],str(p)
        if p.suffix=='.svg':ET.fromstring(data)
        elif p.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif']:
            with Image.open(p) as im:im.verify()
        elif p.suffix=='.wav':
            with wave.open(str(p)) as w:assert w.getnframes()>0 and w.getnchannels()>0
    bat=(root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes();assert b'JOUER_KI_ARENA_V17.html' in bat and b'\r\n' in bat
    for name in ['README_JOUER.md','STATUS_V17.md','RAPPORT_QA.md','DESIGN_SYSTEM_V17.md','CHANGELOG_V17.md','docs/ASSETS_V17_GENERATION.json']:
        assert (root/name).stat().st_size>0,name
    result={'ok':True,'sourceProof':proof,'protectedFiles':len(protected),'authorizedExceptions':sorted(allowed),'assets':len(rows),'browserChecks':len(report['checks']),'drafts':sim['runs'],'rankBudgets':difficulty['encounters'],'limits':['Windows natif non disponible','Portraits absents des sources : substitutions explicites conservées','Pack Python de référence absent de la V16 reçue']};print(json.dumps(result,indent=2,ensure_ascii=False));return result
if __name__=='__main__':
    try:verify()
    except Exception as e:print('FAIL',e,file=sys.stderr);sys.exit(1)
