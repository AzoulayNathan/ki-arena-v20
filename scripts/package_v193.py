from pathlib import Path
import hashlib, json, subprocess, sys, zipfile

root = Path(__file__).resolve().parent.parent
subprocess.run([sys.executable,'scripts/verify_v193.py'],cwd=root,check=True)
archive = root.parent / 'KI_ARENA_V19_3_COMBATS.zip'
excluded = {'dist','.git','.openai','node_modules','__pycache__','.pytest_cache'}
files = sorted(p for p in root.rglob('*') if p.is_file() and not any(x in excluded for x in p.relative_to(root).parts) and p.suffix not in {'.zip','.pyc','.tmp'})
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in files:
        z.write(p,root.name+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    if z.testzip() is not None:
        raise SystemExit('Échec CRC du ZIP')
    for p in files:
        if hashlib.sha256(z.read(root.name+'/'+p.relative_to(root).as_posix())).digest()!=hashlib.sha256(p.read_bytes()).digest():
            raise SystemExit('Contenu ZIP incorrect : '+str(p))
receipt = {'version':'19.3.0','archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'everyPackagedFileByteVerified':True,'crc':'PASS','htmlSha256':hashlib.sha256((root/'JOUER_KI_ARENA_V19.html').read_bytes()).hexdigest(),'nativeWindows':'NOT_TESTED','browserFileProtocol':'BLOCKED_BY_BROWSER_POLICY'}
(root.parent/'VERIFICATION_ZIP_V193.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt))
