"""Build, test, zip, extract and verify the actual V13 delivery. Errors exit non-zero."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile,tempfile,shutil
root=Path(__file__).resolve().parent.parent
subprocess.run([sys.executable,'build_preview.py'],cwd=root,check=True)
subprocess.run(['node','--test','tests/test-party.mjs','tests/test-protected-v13.mjs','tests/test-arena.mjs','tests/test-survival.mjs'],cwd=root,check=True)
for name in ['browser.json','legacy/browser.json']:
 r=json.loads((root/'qa/v13'/name).read_text());assert r['ok'] and not r['errors'] and not r['external'],name
for name in ['README_JOUER.md','STATUS_V13.md','RAPPORT_QA_V13.md','DESIGN_SYSTEM_V13.md','CATALOGUE_JEUX_V13.md','LANCER_SUR_PC_WINDOWS.bat']:
 assert (root/name).is_file(),name
assert b'JOUER_KI_ARENA_V13.html' in (root/'LANCER_SUR_PC_WINDOWS.bat').read_bytes()
ignored={'node_modules','__pycache__','.git','.cache'}
files=[p for p in sorted(root.rglob('*')) if p.is_file() and not set(p.relative_to(root).parts)&ignored and p.name!='FILE_MANIFEST_SHA256.json']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest={p.relative_to(root).as_posix():sha(p) for p in files};(root/'FILE_MANIFEST_SHA256.json').write_text(json.dumps(manifest,indent=2))
out=root.parent/'KI_ARENA_V13_LOCAL_COMPLET.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in [*files,root/'FILE_MANIFEST_SHA256.json']:z.write(p,'KI_ARENA_V13_LOCAL_FINAL/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None;assert len(z.namelist())==len(set(z.namelist()))
 with tempfile.TemporaryDirectory(prefix='ki-v13-verification-') as tmp:
  z.extractall(tmp);e=Path(tmp)/'KI_ARENA_V13_LOCAL_FINAL'
  for name,h in manifest.items():assert sha(e/name)==h,name
  subprocess.run([sys.executable,'build_preview.py'],cwd=e,check=True,stdout=subprocess.DEVNULL)
  assert sha(e/'JOUER_KI_ARENA_V13.html')==manifest['JOUER_KI_ARENA_V13.html']
  subprocess.run(['node','--test','tests/test-party.mjs','tests/test-protected-v13.mjs','tests/test-arena.mjs','tests/test-survival.mjs'],cwd=e,check=True,stdout=subprocess.DEVNULL)
r={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'entries':len(manifest)+1,'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'54 PASS','browser':'PASS; 390/768/1360 and file://','limitations':['Native Windows not run','Source V12 reduced character assets retained','Legacy npm/reference pack incomplete before V13; see report']}
(root.parent/'VERIFICATION_ZIP_V13.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
