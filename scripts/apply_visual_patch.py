"""Apply the scoped Horizons patch only to the exact supplied V14 base."""
from pathlib import Path
import hashlib,json,shutil,subprocess,sys,time
pack=Path(__file__).resolve().parent
if len(sys.argv)!=2:raise SystemExit('Usage: python APPLIQUER_PATCH.py PATH_TO_V14_PROJECT')
target=Path(sys.argv[1]).resolve();expected=json.loads((pack/'BASE_SHA256.json').read_text())
for name,h in expected.items():
    p=target/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=h:raise SystemExit('Base V14 différente, aucun changement effectué : '+name)
backup=target/('BACKUP_AVANT_HORIZONS_'+time.strftime('%Y%m%d_%H%M%S'));backup.mkdir()
for p in sorted((pack/'payload').rglob('*')):
    if not p.is_file():continue
    rel=p.relative_to(pack/'payload');dest=target/rel
    if dest.is_file():
        previous=backup/rel;previous.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dest,previous)
    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
subprocess.run([sys.executable,'build_preview.py'],cwd=target,check=True)
print('Habillage installé. Sauvegardes navigateur conservées. Ouvrir JOUER_KI_ARENA_V15.html.')
