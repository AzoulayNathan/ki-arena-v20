"""Create a separate runnable V13 copy, never edit the current game or browser saves."""
from pathlib import Path
import json,shutil,subprocess,sys
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit('Usage: python scripts/restore_v13.py NEW_EMPTY_DESTINATION')
dest=Path(sys.argv[1]).resolve()
if dest.exists() or dest==root or root in dest.parents:raise SystemExit('Refus: utiliser un dossier inexistant hors du projet V14.')
shutil.copytree(root,dest,ignore=shutil.ignore_patterns('node_modules','__pycache__','.git'))
meta=json.loads((root/'BACKUP_V13/RESTORE_V13.json').read_text())
for rel in meta['addedFiles']:
    (dest/rel).unlink(missing_ok=True)
for p in (root/'BACKUP_V13/FILES_ORIGINAUX').rglob('*'):
    if p.is_file():
        target=dest/p.relative_to(root/'BACKUP_V13/FILES_ORIGINAUX');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
(dest/'JOUER_KI_ARENA_V14.html').unlink(missing_ok=True)
subprocess.run([sys.executable,'build_preview.py'],cwd=dest,check=True)
print('Copie V13 jouable créée :',dest)
