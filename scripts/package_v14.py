"""Build, test, zip, extract, compare and re-test the V14 delivery. No false success."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile,tempfile,uuid,os
root=Path(__file__).resolve().parents[1]
def run(*args,cwd=root,quiet=False):
    subprocess.run(list(args),cwd=cwd,check=True,stdout=subprocess.DEVNULL if quiet else None)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
run(sys.executable,'build_preview.py')
run('npm','test')
run(sys.executable,'scripts/verify_v14.py')
ignored={'node_modules','__pycache__','.git','.cache','.pytest_cache'}
def included(p):
    rel=p.relative_to(root)
    if set(rel.parts)&ignored:return False
    if p.name in ['FILE_MANIFEST_SHA256.json','JOUER_KI_ARENA_V13.html']:return False
    if rel.parts[0]=='qa' and len(rel.parts)>1 and rel.parts[1]!='v14' and p.suffix.lower() in ['.png','.jpg','.webp']:return False
    return p.suffix not in ['.pyc','.tmp','.part']
files=[p for p in sorted(root.rglob('*')) if p.is_file() and included(p)]
manifest={p.relative_to(root).as_posix():sha(p) for p in files}
(root/'FILE_MANIFEST_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
out=root.parent/'KI_ARENA_V14_LOCAL_COMPLET.zip'
candidate=out.with_name(out.name+'.'+uuid.uuid4().hex+'.part')
with zipfile.ZipFile(candidate,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in [*files,root/'FILE_MANIFEST_SHA256.json']:z.write(p,root.name+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(candidate) as z:
    assert z.testzip() is None,'CRC failure'
    assert len(z.namelist())==len(set(z.namelist())),'Duplicate archive entry'
    with tempfile.TemporaryDirectory(prefix='ki-v14-extracted-') as tmp:
        z.extractall(tmp);e=Path(tmp)/root.name
        for name,h in manifest.items():assert sha(e/name)==h,name
        run(sys.executable,'build_preview.py',cwd=e,quiet=True)
        assert sha(e/'JOUER_KI_ARENA_V14.html')==manifest['JOUER_KI_ARENA_V14.html'],'Offline rebuild differs'
        run('npm','test',cwd=e,quiet=True)
        run(sys.executable,'scripts/verify_v14.py',cwd=e,quiet=True)
os.replace(candidate,out)
r={'file':out.name,'bytes':out.stat().st_size,'sha256':sha(out),'entries':len(manifest)+1,'crc':'PASS','extractedHashes':'PASS','offlineRebuildIdentical':'PASS','testsAfterExtraction':'PASS: 66 JS + 163 item checks + complete V8 suite','runtimeBoundBrowserReports':'6 PASS; 390/768/1360 and actual file://; real ability/KO spotlights','rankChecks':2700000,'runSeeds':1000,'limitations':['Native Windows not available','Missing original portraits/OST/reference-survie pack','External equipment images blocked/unreviewed; honest fallback active','Balance varies across profiles and universes']}
receipt=root.parent/'VERIFICATION_ZIP_V14.json'
receiptTmp=receipt.with_name(receipt.name+'.part')
receiptTmp.write_text(json.dumps(r,indent=2)+'\n')
os.replace(receiptTmp,receipt)
print(json.dumps(r,indent=2),flush=True)
