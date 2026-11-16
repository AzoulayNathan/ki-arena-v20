from pathlib import Path
import zipfile,hashlib,json,subprocess,sys
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,'scripts/verify_v21.py','--integrity'],cwd=root,check=True)
archive=root.parent/'KI_ARENA_V21_ARCADE_LOCAL.zip'
excluded={'dist','.git','.openai','node_modules','__pycache__','.pytest_cache'}
restored={x['file'] for x in json.loads((root/'qa/v21/finish/restored-fixtures.json').read_text())}
files=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(root)
 if any(x in excluded or (x.startswith('BACKUP') and x not in {'BACKUP_PRE_V21','BACKUP_FINITION_V21'}) for x in rel.parts):continue
 if rel.parts[0]=='qa' and not rel.as_posix().startswith('qa/v21/') and rel.as_posix() not in restored:continue
 if p.suffix.lower() in {'.zip','.pyc','.tmp','.part'}:continue
 if p.name in {'recovered-source.json','package.log'}:continue
 files.append(p)
files.sort();prefix='KI_ARENA_V21_ARCADE_LOCAL/'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for directory in ['qa/v10','qa/v14','qa/v15','qa/v16','qa/v17','qa/v18','qa/v19','qa/v20','qa/v193']:z.writestr(prefix+directory+'/',b'')
 for p in files:z.write(p,prefix+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 check=z.testzip()
 if check is not None:raise SystemExit('CRC FAIL: '+check)
 for p in files:
  if hashlib.sha256(z.read(prefix+p.relative_to(root).as_posix())).digest()!=hashlib.sha256(p.read_bytes()).digest():raise SystemExit('Byte verification FAIL: '+str(p))
receipt={'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'crc':'PASS','everyFileByteVerified':True,'productQualityGate':'NOT_PASSED','statusFile':'STATUS_V21.md'}
(root.parent/'VERIFICATION_ZIP_V21.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt,indent=2))

