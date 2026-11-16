from pathlib import Path
import json,zipfile,hashlib,subprocess,sys
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,'scripts/verify_v22.py','--integrity'],cwd=root,check=True)
archive=root.parent/'KI_ARENA_V22_LOCAL.zip'
restored={x['file'] for x in json.loads((root/'qa/v21/finish/restored-fixtures.json').read_text())}
exclude={'dist','.git','.openai','node_modules','__pycache__','.pytest_cache'}
backups={'BACKUP_PRE_V21','BACKUP_FINITION_V21','BACKUP_PRE_V22'}
files=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(root)
 if any(x in exclude or x.startswith('BACKUP')and x not in backups for x in rel.parts):continue
 if rel.parts[0]=='qa' and not(rel.as_posix().startswith(('qa/v21/','qa/v22/'))or rel.as_posix()in restored):continue
 if p.suffix.lower()in {'.zip','.pyc','.tmp','.part'}or p.name in {'JOUER_KI_ARENA_V21.html','package.log','recovered-source.json'}:continue
 files.append(p)
files.sort();prefix='KI_ARENA_V22_LOCAL/'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for d in ['qa/v10','qa/v14','qa/v15','qa/v16','qa/v17','qa/v18','qa/v19','qa/v20','qa/v193']:z.writestr(prefix+d+'/',b'')
 for p in files:z.write(p,prefix+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive)as z:
 bad=z.testzip()
 if bad:raise SystemExit('CRC FAIL: '+bad)
 for p in files:
  if hashlib.sha256(z.read(prefix+p.relative_to(root).as_posix())).digest()!=hashlib.sha256(p.read_bytes()).digest():raise SystemExit('SHA FAIL: '+str(p))
receipt={'version':'22.0.0','archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'crc':'PASS','everyFileByteVerified':True,'productQualityGate':'NOT_PASSED','statusFile':'STATUS_V22.md'}
(root.parent/'VERIFICATION_ZIP_V22.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt,indent=2))
