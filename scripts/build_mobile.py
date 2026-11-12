"""Prépare le dossier web `www` pour un futur empaquetage Capacitor.
Ce script ne produit pas directement de binaires Android/iOS.
"""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
out=root/'www'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['index.html','sw.js','manifest.webmanifest']:
 shutil.copy2(root/name,out/name)
for name in ['src','assets']:
 shutil.copytree(root/name,out/name)
print('App web prête dans www, ajouter Capacitor pour les compilations natives.')
