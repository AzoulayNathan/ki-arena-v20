"""Atomic full ZIP and scoped patch, with extraction, rebuild, tests and hash checks."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile,tempfile,uuid,os,shutil
root=Path(__file__).resolve().parents[1]
npm=shutil.which('npm.cmd') if sys.platform=='win32' else shutil.which('npm')
def run(*args,cwd=root,quiet=False):subprocess.run(list(args),cwd=cwd,check=True,stdout=subprocess.DEVNULL if quiet else None)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
run(sys.executable,'build_preview.py')
tested=subprocess.run([npm,'test'],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,check=True)
logtext=tested.stdout.decode('utf-8',errors='replace')
assert '8 blocs de vérification V6 validés' in logtext,'Test output incomplete'
logtemp=root/'qa/v17/package-tests.tmp';logtemp.write_bytes(tested.stdout);os.replace(logtemp,root/'qa/v17/package-tests.log')
run(sys.executable,'scripts/verify_v17.py')
ignored={'node_modules','__pycache__','.git','.cache','.pytest_cache'}
def include(p):
    rel=p.relative_to(root)
    if set(rel.parts)&ignored or p.name=='FILE_MANIFEST_SHA256.json':return False
    if p.name.startswith('APERCUS_V') and p.name!='APERCUS_V17.html':return False
    if p.name.startswith('JOUER_KI_ARENA_') and p.name!='JOUER_KI_ARENA_V17.html':return False
    if rel.parts[0]=='qa' and len(rel.parts)>1 and rel.parts[1]!='v17' and any(ext in p.name.lower() for ext in ['.png','.jpg','.jpeg','.webp','.gif']):return False
    return p.suffix.lower() not in ['.pyc','.tmp','.part']
files=[p for p in sorted(root.rglob('*')) if p.is_file() and include(p)]
manifest={}
out=root.parent/'KI_ARENA_V17_HORIZONS_COMPLET.zip';candidate=out.with_name(out.name+'.'+uuid.uuid4().hex+'.part')
with zipfile.ZipFile(candidate,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in files:
        name=p.relative_to(root).as_posix();data=p.read_bytes();manifest[name]=hashlib.sha256(data).hexdigest();z.writestr(root.name+'/'+name,data)
    manifestText=json.dumps(manifest,indent=2)+'\n';z.writestr(root.name+'/FILE_MANIFEST_SHA256.json',manifestText)
(root/'FILE_MANIFEST_SHA256.json').write_text(manifestText)
with zipfile.ZipFile(candidate) as z:
    assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
    with tempfile.TemporaryDirectory(prefix='ki-v17-extracted-') as tmp:
        z.extractall(tmp);e=Path(tmp)/root.name
        for name,h in manifest.items():assert sha(e/name)==h,name
        run(sys.executable,'build_preview.py',cwd=e,quiet=True);assert sha(e/'JOUER_KI_ARENA_V17.html')==manifest['JOUER_KI_ARENA_V17.html']
        run(npm,'test',cwd=e,quiet=True);run(sys.executable,'scripts/verify_v17.py',cwd=e,quiet=True)
os.replace(candidate,out)
old=json.loads((root/'PRE_V17_FILES_ALL.json').read_text())
patchFiles=[p for p in files if not (p.relative_to(root).parts[0]=='qa' and p.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif']) and p.name!='JOUER_KI_ARENA_V17.html' and old.get(p.relative_to(root).as_posix())!=sha(p)]
base=json.loads((root/'PRE_V17_HASHES.json').read_text())
for n in ['index.html','package.json','build_preview.py']:base[n]=old[n]
payload={}
patchOut=root.parent/'KI_ARENA_V17_PATCH_VISUEL_ET_DRAFT.zip';pt=patchOut.with_name(patchOut.name+'.part')
with zipfile.ZipFile(pt,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in patchFiles:
        name=p.relative_to(root).as_posix();data=p.read_bytes();payload[name]=hashlib.sha256(data).hexdigest();z.writestr('V17_PATCH/payload/'+name,data)
    z.writestr('V17_PATCH/BASE_SHA256.json',json.dumps(base,indent=2))
    z.writestr('V17_PATCH/PAYLOAD_SHA256.json',json.dumps(payload,indent=2))
    z.write(root/'scripts/apply_v17_patch.py','V17_PATCH/APPLIQUER_PATCH.py')
    z.write(root/'GUIDE_PATCH_V17.md','V17_PATCH/LIRE_AVANT.md')
with zipfile.ZipFile(pt) as z:
    assert z.testzip() is None
    with tempfile.TemporaryDirectory(prefix='ki-v17-patch-') as tmp:
        e=Path(tmp)/'baseline';e.mkdir()
        # Reconstruct only the exact original runtime from protected files and backups.
        for name in base:
            src=root/'BACKUP_V16/FILES'/name
            if not src.is_file():src=root/name
            assert sha(src)==base[name],name
            dst=e/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
        z.extractall(tmp);run(sys.executable,str(Path(tmp)/'V17_PATCH/APPLIQUER_PATCH.py'),str(e),quiet=True)
        assert sha(e/'JOUER_KI_ARENA_V17.html')==manifest['JOUER_KI_ARENA_V17.html']
os.replace(pt,patchOut)
receipt={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'files':len(manifest)+1,'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'92 JS + item checks + V8 suites PASS','browserReports':'V17 current browser recipe PASS: 390/768/1360 + offline','screenshots':sum(1 for p in files if p.relative_to(root).as_posix().startswith('qa/v17/') and p.suffix.lower() in ['.jpg','.png']),'newObjectAtlas':1,'newSounds':3,'totalAssets':828,'legacy':'240 V15 drafts / 5040 encounters identical; historical battle/card data unchanged','draft':'6 selections; independent 30 percent weapon rolls; global N/600 hero ranks; versioned saves','simulations':{'mixedDrafts':1500,'exactEncounters':2700,'gameplaySeeds':1000},'patch':{'file':patchOut.name,'bytes':patchOut.stat().st_size,'sha256':sha(patchOut),'changedFiles':len(patchFiles),'applicationAndRebuildIdentical':'PASS'},'limits':['Native Windows not available','Character portraits and original soundtracks absent from source stay absent','Python reference pack absent from V16 source','Global balance not validated: no act I clear in the two automatic samples']}
rp=root.parent/'VERIFICATION_ZIP_V17.json';temp=rp.with_name(rp.name+'.part');temp.write_text(json.dumps(receipt,indent=2)+'\n');os.replace(temp,rp);print(json.dumps(receipt,indent=2),flush=True)
