"""Sequential current-runtime browser recipe. Any failed check exits non-zero."""
from pathlib import Path
import json,subprocess,sys
root=Path(__file__).resolve().parents[1]
proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sourceProof} from './scripts/qa-v16-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=root,text=True))
cases=[('qa-v16-menu','menu/browser.json'),('qa-v16-carousel','carousel/browser.json'),('qa-v16-smoke','smoke.json'),('qa-v16-extras','extras/browser.json'),('qa-v16-full','full/browser.json'),('qa-party-v16','party/browser.json'),('qa-v16-pages','pages/browser.json'),('qa-v16-natural','natural/browser.json'),('qa-v16-media','media/browser.json'),('qa-v16-effects','effects/browser.json'),('qa-v16-sealed','sealed/browser.json')]
for name,report in cases:
    p=root/'qa/v16'/report
    if '--resume' in sys.argv and p.exists():
        old=json.loads(p.read_text())
        if old.get('ok') and old.get('sourceProof')==proof:
            print('CURRENT PASS',name,flush=True);continue
    with (root/'qa/v16'/(name+'.log')).open('w') as out:
        result=subprocess.run(['node','scripts/'+name+'.mjs'],cwd=root,stdout=out,stderr=subprocess.STDOUT)
    if result.returncode:
        print('FAIL',name,flush=True);sys.exit(result.returncode)
    now=json.loads(p.read_text())
    if not now.get('ok') or now.get('sourceProof')!=proof:
        print('FAIL stale or incomplete evidence',name,flush=True);sys.exit(1)
    print('PASS',name,flush=True)
