"""Full release; same-byte manifest, CRC, extraction, identical rebuild and tests."""
from pathlib import Path
import hashlib,json,subprocess,zipfile,tempfile,uuid,os,sys,shutil
root=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
npm=shutil.which('npm.cmd') if sys.platform=='win32' else shutil.which('npm')
def run(args,cwd=root):return subprocess.run(args,cwd=cwd,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
run([sys.executable,'build_preview.py'])
t=run([npm,'test']);assert b'8 blocs de v' in t.stdout
(root/'qa/v18/package-tests.log').write_bytes(t.stdout)
v=run([sys.executable,'scripts/verify_v18.py']);print(v.stdout.decode(),flush=True)
ignored={'node_modules','__pycache__','.git','.cache','.pytest_cache'}
def include(p):
 rel=p.relative_to(root)
 if set(rel.parts)&ignored or p.name=='FILE_MANIFEST_SHA256.json':return False
 if p.name.startswith('APERCUS_V') and p.name!='APERCUS_V18.html':return False
 if p.name.startswith('JOUER_KI_ARENA_') and p.name!='JOUER_KI_ARENA_V18.html':return False
 if rel.parts[0]=='qa' and len(rel.parts)>1 and rel.parts[1]!='v18' and any(x in p.name.lower() for x in ['.png','.jpg','.jpeg','.webp','.gif']):return False
 return p.suffix.lower() not in ['.pyc','.tmp','.part']
files=[p for p in sorted(root.rglob('*')) if p.is_file() and include(p)]
out=root.parent/'KI_ARENA_V18_HORIZONS_COMPLET.zip';tmp=out.with_suffix('.zip.part');manifest={}
with zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in files:
  name=p.relative_to(root).as_posix();data=p.read_bytes();manifest[name]=hashlib.sha256(data).hexdigest();z.writestr(root.name+'/'+name,data)
 text=json.dumps(manifest,indent=2)+'\n';z.writestr(root.name+'/FILE_MANIFEST_SHA256.json',text)
(root/'FILE_MANIFEST_SHA256.json').write_text(text)
with zipfile.ZipFile(tmp) as z:
 assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
 with tempfile.TemporaryDirectory(prefix='ki-v18-extract-') as d:
  z.extractall(d);e=Path(d)/root.name
  for name,h in manifest.items():assert sha(e/name)==h,name
  run([sys.executable,'build_preview.py'],e);assert sha(e/'JOUER_KI_ARENA_V18.html')==manifest['JOUER_KI_ARENA_V18.html']
  run([npm,'test'],e);run([sys.executable,'scripts/verify_v18.py'],e)
os.replace(tmp,out)
receipt={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'files':len(manifest)+1,'assets':828,'screenshots':sum(1 for p in files if p.relative_to(root).as_posix().startswith('qa/v18/') and p.suffix=='.jpg'),'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'PASS','currentBrowserReports':'8 PASS; 390/768/1360 for game, 390/1360 for independent model','protectedRuntime':'All previous source/data/asset/test bytes preserved except exact visual hook in UI','standaloneHtmlSha256':sha(root/'JOUER_KI_ARENA_V18.html'),'modelSha256':sha(root/'MODELE_CARTE_V18.html'),'limits':['Windows native not tested','Legacy menus preserved, not restyled','Global adventure balance remains unvalidated','Missing portraits and original soundtracks remain missing','Original Python reference pack absent']}
(root.parent/'VERIFICATION_ZIP_V18.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
