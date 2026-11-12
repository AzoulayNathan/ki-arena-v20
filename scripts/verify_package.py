"""Verify a local distribution; optional ZIP CRC. Nonzero on any failure."""
from pathlib import Path
import csv,json,hashlib,zipfile,sys,re
root=Path(__file__).resolve().parents[1]
for name in ['JOUER_KI_ARENA_V9.html','LANCER_SUR_PC_WINDOWS.bat','LANCER_SERVEUR_WINDOWS.bat','README_JOUER.md','STATUS_V9.md','RAPPORT_QA.md','DESIGN_SYSTEM_V9.md','MANIFEST_ASSETS_ET_DROITS.csv','LISTE_ITEMS_IMPLEMENTES.csv','BACKUP_V8_pre-v9.zip','package.json','AUDIT_V9_3.md','BACKUP_V9_2_sources.tar.gz','BACKUP_V9_3_sources.tar.gz','VERIFICATION_LIVRAISON.md']:
 if not (root/name).is_file():raise SystemExit('Fichier manquant : '+name)
for name in ['src','assets','data','tests','scripts','captures']:
 if not (root/name).is_dir():raise SystemExit('Dossier manquant : '+name)
for report in ['browser-report.json','motion-offline-report.json','polish-report.json','v92-browser-report.json','offline-v92-report.json','v93/browser-report.json','v93/offline-report.json','delivery/browser-report.json','delivery/offline-report.json']:
 if not json.loads((root/'qa'/report).read_text(encoding='utf-8')).get('pass'):raise SystemExit('Recette échouée : '+report)
with (root/'MANIFEST_ASSETS_ET_DROITS.csv').open(encoding='utf-8-sig') as f:
 assets=list(csv.DictReader(f,delimiter=';'))
for row in assets:
 p=root/row['chemin']
 if hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:raise SystemExit('Asset altéré : '+row['chemin'])
if len(list((root/'captures').glob('*.png')))<40:raise SystemExit('Captures insuffisantes')
for image in re.findall(r'!\[[^\]]*\]\(([^)]+)\)',(root/'README_JOUER.md').read_text(encoding='utf-8')):
 if not image.startswith(('http:','https:','data:')) and not (root/image).is_file():raise SystemExit('Capture référencée absente : '+image)
if '--strict' in sys.argv:
 manifest=json.loads((root/'MANIFEST_FICHIERS_SHA256.json').read_text(encoding='utf-8'))
 for name,expected in manifest.items():
  p=(root/name).resolve()
  if not p.is_relative_to(root) or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:raise SystemExit('Fichier absent/altéré : '+name)
 print('INTEGRITE PASS : '+str(len(manifest))+' fichiers SHA256 vérifiés.')
zip_args=[x for x in sys.argv[1:] if x!='--strict']
if zip_args:
 with zipfile.ZipFile(zip_args[0]) as z:
  bad=z.testzip()
  if bad:raise SystemExit('CRC invalide : '+bad)
  prefix=root.name+'/'
  manifest=json.loads(z.read(prefix+'MANIFEST_FICHIERS_SHA256.json'))
  if len(z.namelist())!=len(manifest)+1:raise SystemExit('Entrées ZIP manquantes ou supplémentaires')
  for name,expected in manifest.items():
   if hashlib.sha256(z.read(prefix+name)).hexdigest()!=expected:raise SystemExit('Contenu ZIP altéré : '+name)
print('PACKAGE PASS : fichiers requis, '+str(len(assets))+' assets vérifiés, captures, recettes navigateur et offline réussies.')
print('La certification finale reste distincte : consulter STATUS_V9.md et check_release.py.')
