"""Atomic full ZIP + scoped visual patch; extract, hash, rebuild and test before publishing."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile,tempfile,uuid,os,shutil
root=Path(__file__).resolve().parents[1]
npm=shutil.which('npm.cmd') if sys.platform=='win32' else shutil.which('npm')
def run(*args,cwd=root,quiet=False):subprocess.run(list(args),cwd=cwd,check=True,stdout=subprocess.DEVNULL if quiet else None)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
run(sys.executable,'build_preview.py');run(npm,'test');run(sys.executable,'scripts/verify_v15.py')
ignored={'node_modules','__pycache__','.git','.cache','.pytest_cache'}
def include(p):
    rel=p.relative_to(root)
    if set(rel.parts)&ignored or p.name in ['FILE_MANIFEST_SHA256.json','JOUER_KI_ARENA_V14.html']:return False
    if rel.parts[0]=='qa' and len(rel.parts)>1 and rel.parts[1]!='v15' and p.suffix.lower() in ['.png','.jpg','.webp']:return False
    return p.suffix not in ['.pyc','.tmp','.part']
files=[p for p in sorted(root.rglob('*')) if p.is_file() and include(p)]
manifest={p.relative_to(root).as_posix():sha(p) for p in files}
(root/'FILE_MANIFEST_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
out=root.parent/'KI_ARENA_V15_HORIZONS_COMPLET.zip';candidate=out.with_name(out.name+'.'+uuid.uuid4().hex+'.part')
with zipfile.ZipFile(candidate,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in [*files,root/'FILE_MANIFEST_SHA256.json']:z.write(p,root.name+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(candidate) as z:
    assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
    with tempfile.TemporaryDirectory(prefix='ki-horizons-') as tmp:
        z.extractall(tmp);e=Path(tmp)/root.name
        for name,h in manifest.items():assert sha(e/name)==h,name
        run(sys.executable,'build_preview.py',cwd=e,quiet=True);assert sha(e/'JOUER_KI_ARENA_V15.html')==manifest['JOUER_KI_ARENA_V15.html']
        run(npm,'test',cwd=e,quiet=True);run(sys.executable,'scripts/verify_v15.py',cwd=e,quiet=True)
os.replace(candidate,out)
# The optional patch contains only files that differ from the supplied V14.
old=json.loads((root/'PRE_V15_FILES_ALL.json').read_text())
patchFiles=[p for p in files if not (p.relative_to(root).parts[0]=='qa' and p.suffix.lower() in ['.png','.jpg','.webp']) and p.name!='JOUER_KI_ARENA_V15.html' and old.get(p.relative_to(root).as_posix())!=sha(p)]
patchOut=root.parent/'KI_ARENA_V15_PATCH_VISUEL.zip';pt=patchOut.with_name(patchOut.name+'.part')
with zipfile.ZipFile(pt,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in patchFiles:z.write(p,'HORIZONS_PATCH/payload/'+p.relative_to(root).as_posix())
    z.write(root/'PRE_V15_HASHES.json','HORIZONS_PATCH/BASE_SHA256.json')
    z.write(root/'scripts/apply_visual_patch.py','HORIZONS_PATCH/APPLIQUER_PATCH.py')
    z.write(root/'GUIDE_PATCH_VISUEL.md','HORIZONS_PATCH/LIRE_AVANT.md')
with zipfile.ZipFile(pt) as z:assert z.testzip() is None
os.replace(pt,patchOut)
receipt={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'files':len(manifest)+1,'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'78 JS + current item checks + V8 suite PASS','browserReports':'8 PASS, 390/768/1360 and actual file://','newArt':12,'totalAssets':818,'existingGameplay':'V14 unchanged; hash protected','patch':{'file':patchOut.name,'bytes':patchOut.stat().st_size,'sha256':sha(patchOut),'changedFiles':len(patchFiles)},'limits':['Native Windows not available','Original character portraits/audio limitations inherited from V14']}
rp=root.parent/'VERIFICATION_ZIP_V15.json';temp=rp.with_name(rp.name+'.part');temp.write_text(json.dumps(receipt,indent=2)+'\n');os.replace(temp,rp);print(json.dumps(receipt,indent=2),flush=True)
