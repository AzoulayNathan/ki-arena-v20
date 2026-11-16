from pathlib import Path
import hashlib,json,subprocess,zipfile,tempfile,os,sys,shutil
NPM=shutil.which('npm.cmd') if sys.platform=='win32' else shutil.which('npm')
R=Path(__file__).resolve().parents[1];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def run(args,cwd=R):return subprocess.run(args,cwd=cwd,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
run([sys.executable,'build_preview.py']);run(['node','scripts/build-studio-v19.mjs']);t=run([NPM,'test']);(R/'qa/v19/package-tests.log').write_bytes(t.stdout)
print(run([sys.executable,'scripts/verify_v19.py','--allow-documented-limitations']).stdout.decode(),flush=True)
ignored={'node_modules','__pycache__','.git','.cache','.pytest_cache'}
def include(p):
 rel=p.relative_to(R)
 if set(rel.parts)&ignored or p.name=='FILE_MANIFEST_SHA256.json':return False
 if p.name.startswith('JOUER_KI_ARENA_') and p.name!='JOUER_KI_ARENA_V19.html':return False
 if p.name.startswith('APERCUS_V') and p.name!='APERCUS_V19.html':return False
 if rel.parts[0]=='qa' and len(rel.parts)>1 and rel.parts[1]!='v19' and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp','.gif'}:return False
 if rel.parts[0]=='qa' and len(rel.parts)==3 and rel.parts[1]=='v19' and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'}:return False
 if rel.as_posix() in ['qa/v19/media/failure.jpg','qa/v19/media/project.json','qa/v19/svg-probe.png']:return False
 return p.suffix.lower() not in {'.pyc','.tmp','.part'}
files=[p for p in sorted(R.rglob('*')) if p.is_file() and include(p)]
out=R.parent/'KI_ARENA_V19_PORTRAIT_POLISH_VERIFIE.zip';tmp=out.with_suffix('.zip.part');manifest={}
with zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in files:
  name=p.relative_to(R).as_posix();data=p.read_bytes();manifest[name]=hashlib.sha256(data).hexdigest();z.writestr(R.name+'/'+name,data)
 contents=json.dumps(manifest,indent=2)+'\n';z.writestr(R.name+'/FILE_MANIFEST_SHA256.json',contents)
(R/'FILE_MANIFEST_SHA256.json').write_text(contents)
with zipfile.ZipFile(tmp) as z:
 assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
 with tempfile.TemporaryDirectory(prefix='ki-v19-verify-') as d:
  z.extractall(d);e=Path(d)/R.name
  for name,h in manifest.items():assert sha(e/name)==h,name
  run([sys.executable,'build_preview.py'],e);assert sha(e/'JOUER_KI_ARENA_V19.html')==manifest['JOUER_KI_ARENA_V19.html']
  run(['node','scripts/build-studio-v19.mjs'],e);assert sha(e/'ATELIER_CARTES_V19.html')==manifest['ATELIER_CARTES_V19.html']
  run([NPM,'test'],e);run([sys.executable,'scripts/verify_v19.py','--allow-documented-limitations'],e)
os.replace(tmp,out)
receipt={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'files':len(manifest)+1,'assets':sum(1 for p in (R/'assets').rglob('*') if p.is_file()),'screenshots':sum(1 for p in files if p.suffix=='.jpg' and p.relative_to(R).as_posix().startswith('qa/v19/')),'CRC':'PASS','extractedHashes':'PASS','rebuildIdentical':'PASS','testsAfterExtraction':'PASS','acceptance':'Open issues documented; not certified 9/10 or complete balance','gameHtmlSha256':sha(R/'JOUER_KI_ARENA_V19.html'),'studioHtmlSha256':sha(R/'ATELIER_CARTES_V19.html')}
(R.parent/'VERIFICATION_ZIP_V19.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
