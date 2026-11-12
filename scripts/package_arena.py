from pathlib import Path
import hashlib,json,zipfile,subprocess,tempfile,sys,shutil
root=Path(__file__).resolve().parent.parent
subprocess.run([sys.executable,str(root/'scripts/verify_impact.py')],cwd=root,check=True)
ignored={'node_modules','__pycache__','.git','.cache'}
files=[p for p in sorted(root.rglob('*')) if p.is_file() and not set(p.relative_to(root).parts)&ignored and p.name!='FILE_MANIFEST_SHA256.json']
manifest={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
(root/'FILE_MANIFEST_SHA256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
out=root.parent/'KI_ARENA_V11_IMPACT_LOCAL_COMPLET.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in [*files,root/'FILE_MANIFEST_SHA256.json']:z.write(p,'KI_ARENA_V11_LOCAL_FINAL/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None;assert len(z.namelist())==len(set(z.namelist()))
 with tempfile.TemporaryDirectory(prefix='kiarena-package-') as temp:
  z.extractall(temp);e=Path(temp)/'KI_ARENA_V11_LOCAL_FINAL'
  for name,sha in manifest.items():assert hashlib.sha256((e/name).read_bytes()).hexdigest()==sha,name
  subprocess.run([sys.executable,'build_preview.py'],cwd=e,check=True)
  assert hashlib.sha256((e/'JOUER_KI_ARENA_V11.html').read_bytes()).hexdigest()==manifest['JOUER_KI_ARENA_V11.html']
  subprocess.run([shutil.which('npm') or 'npm','test'],cwd=e,check=True,stdout=subprocess.DEVNULL)
receipt={'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'entries':len(manifest)+1,'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'PASS','knownBlocked':['Portraits HXH/NARUTO/ONEPIECE absent in handoff','Original soundtracks absent in handoff','Native Windows execution not tested']}
(root.parent/'VERIFICATION_ZIP_V11.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt,indent=2))
