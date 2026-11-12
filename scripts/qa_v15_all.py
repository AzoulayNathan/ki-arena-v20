"""Run the complete current browser recipe sequentially, with non-zero failure status."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
names=['qa-v15-menu','qa-v15-extras','qa-v15-smoke','qa-v15-full','qa-party-v15','qa-v15-natural','qa-v15-media','qa-v15-effects']
for name in names:
    with (root/'qa/v15'/(name+'.log')).open('w') as out:
        result=subprocess.run(['node','scripts/'+name+'.mjs'],cwd=root,stdout=out,stderr=subprocess.STDOUT)
    if result.returncode:
        print('FAIL',name,flush=True);sys.exit(result.returncode)
    print('PASS',name,flush=True)
