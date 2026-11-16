"""Install only on the verified V15 runtime, backing up replacements first."""
from pathlib import Path
import hashlib,json,shutil,subprocess,sys,time,uuid
pack=Path(__file__).resolve().parent
if len(sys.argv)!=2:raise SystemExit('Usage: python APPLIQUER_PATCH.py "CHEMIN_DU_PROJET_V15"')
target=Path(sys.argv[1]).resolve()
if not target.is_dir():raise SystemExit('Dossier du projet absent.')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for name,h in json.loads((pack/'BASE_SHA256.json').read_text()).items():
    p=target/name
    if not p.is_file() or sha(p)!=h:raise SystemExit('Base V15 différente, aucun changement effectué : '+name)
payload=json.loads((pack/'PAYLOAD_SHA256.json').read_text())
for name,h in payload.items():
    p=pack/'payload'/name;dest=(target/name).resolve()
    if not p.is_file() or sha(p)!=h or target not in dest.parents:raise SystemExit('Payload ou destination invalide : '+name)
backup=target/('BACKUP_AVANT_V16_'+time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:6]);backup.mkdir()
for name in payload:
    src=pack/'payload'/name;dest=target/name
    if dest.is_file():
        previous=backup/name;previous.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dest,previous)
    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
subprocess.run([sys.executable,'build_preview.py'],cwd=target,check=True)
print('V16 installée. Les sauvegardes navigateur restent locales. Ouvrir JOUER_KI_ARENA_V16.html.')
