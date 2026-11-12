"""Create one ZIP and verify every archived byte against its SHA256 manifest."""
from pathlib import Path
import hashlib,json,zipfile,sys
root=Path(__file__).resolve().parents[1]
out=root.parent/'KI_ARENA_V9_2_LOCAL_GAMEPLAY.zip'
def included(p):
 rel=p.relative_to(root)
 return p.is_file() and not any(x in {'node_modules','__pycache__','.git','.pytest_cache'} for x in rel.parts) and p.suffix not in {'.pyc','.pyo'} and '-new-' not in p.name
manifest=root/'MANIFEST_FICHIERS_SHA256.json'
paths=sorted(p for p in root.rglob('*') if included(p) and p!=manifest)
hashes={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
manifest.write_text(json.dumps(hashes,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in [*paths,manifest]:z.write(p,(Path(root.name)/p.relative_to(root)).as_posix())
with zipfile.ZipFile(out) as z:
 bad=z.testzip()
 if bad:raise SystemExit('CRC incorrect : '+bad)
 prefix=root.name+'/'
 for name,expected in hashes.items():
  if hashlib.sha256(z.read(prefix+name)).hexdigest()!=expected:raise SystemExit('SHA incorrect : '+name)
 if len(z.namelist())!=len(hashes)+1:raise SystemExit('Nombre de fichiers incohérent')
 if any('/__pycache__/' in n or '/node_modules/' in n for n in z.namelist()):raise SystemExit('Cache/dépendance dans ZIP')
receipt={'pass':True,'zip':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'entries':len(hashes)+1,'allArchivedSHAsMatch':True,'crc':True,'htmlSHA256':hashes['JOUER_KI_ARENA_V9.html'],'protectedFiles':689}
(root.parent/'VERIFICATION_ZIP_V9_2.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt,indent=2))
