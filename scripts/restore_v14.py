"""Restore original V14 into a new directory; never overwrite the current game."""
from pathlib import Path
import shutil,json,subprocess,sys,hashlib
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit('Usage: python scripts/restore_v14.py NEW_DESTINATION')
out=Path(sys.argv[1]).resolve()
if out.exists() or out==root or root in out.parents:raise SystemExit('Use a new directory outside V15.')
shutil.copytree(root,out,ignore=shutil.ignore_patterns('node_modules','__pycache__','.git'))
for p in (root/'BACKUP_V14/FILES').rglob('*'):
    if p.is_file():
        dest=out/p.relative_to(root/'BACKUP_V14/FILES');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
for rel in ['src/v15','assets/v15']:shutil.rmtree(out/rel,ignore_errors=True)
(out/'JOUER_KI_ARENA_V15.html').unlink(missing_ok=True)
subprocess.run([sys.executable,'build_preview.py'],cwd=out,check=True)
for name,sha in json.loads((root/'PRE_V15_HASHES.json').read_text()).items():assert hashlib.sha256((out/name).read_bytes()).hexdigest()==sha,name
print('V14 restored, 897 runtime hashes identical:',out)
