from pathlib import Path
import hashlib,json,zipfile,subprocess
root=Path(__file__).resolve().parent.parent
subprocess.run(['python3','scripts/verify_v192.py'],cwd=root,check=True)
original=root.parent.parent/'v192-source/KI_ARENA_V19_1_COMBAT_PANTHEON.zip'
protected=[]
with zipfile.ZipFile(original) as z:
 for n in z.namelist():
  rel=n.split('/',1)[-1]
  if not rel or n.endswith('/'):continue
  if rel.startswith(('assets/','data/','src/')) and not rel.startswith(('src/v19/','src/v192/')):
   file=root/rel
   if not file.exists() or hashlib.sha256(file.read_bytes()).digest()!=hashlib.sha256(z.read(n)).digest():raise SystemExit('Protected mismatch: '+rel)
   protected.append(rel)
archive=root.parent/'KI_ARENA_V19_2_POLISH.zip'
files=sorted(p for p in root.rglob('*') if p.is_file() and not any(x in p.relative_to(root).parts for x in ['node_modules','.git','.openai','preview192','__pycache__']) and p.suffix not in ['.zip','.pyc','.tmp'])
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,root.name+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert z.read(root.name+'/JOUER_KI_ARENA_V19.html')==(root/'JOUER_KI_ARENA_V19.html').read_bytes()
receipt={'version':'19.2.0','archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'historicalProtectedIdentical':len(protected),'htmlSha256':hashlib.sha256((root/'JOUER_KI_ARENA_V19.html').read_bytes()).hexdigest(),'crc':'PASS','browserFileProtocol':'BLOCKED','nativeWindows':'NOT_TESTED'}
(root.parent/'VERIFICATION_ZIP_V192.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
