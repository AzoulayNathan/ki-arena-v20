"""Run the current browser recipes sequentially; stop at first failure."""
from pathlib import Path
import subprocess,sys
r=Path(__file__).resolve().parents[1]
for f in ['qa-v18-base.mjs','qa-v18.mjs','qa-v18-games.mjs','qa-party-v18.mjs','qa-v18-extras.mjs','qa-v18-media.mjs','qa-v18-encounters.mjs','qa-v18-model.mjs']:
 print(f,flush=True);subprocess.run(['node','scripts/'+f],cwd=r,check=True)
subprocess.run([sys.executable,'scripts/verify_v18.py'],cwd=r,check=True)
