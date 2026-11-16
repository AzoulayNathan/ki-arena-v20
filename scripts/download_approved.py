"""Copie et optimisation d'illustrations uniquement si licence explicite documentée.
Dans data/sources_images.csv renseigner url_illustration_candidate, autorisation_commerciale=OUI
et justificatif_autorisation (URL de licence ou preuve de droit).
Utilisation : python scripts/download_approved.py
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlparse
from PIL import Image
import io,csv,json,hashlib,time
root=Path(__file__).resolve().parent.parent
src=root/'data/sources_images.csv';dest=root/'assets/portraits';dest.mkdir(parents=True,exist_ok=True)
allow=set(json.loads((root/'data/catalog.v2.json').read_text())['cards'][i]['id'] for i in range(len(json.loads((root/'data/catalog.v2.json').read_text())['cards'])))
rows=list(csv.DictReader(src.open(encoding='utf-8-sig'),delimiter=';'))
approved={};cache={}
for row in rows:
 id=row['card_id'];link=row.get('url_illustration_candidate','').strip();auth=row.get('autorisation_commerciale','').strip().upper();proof=row.get('justificatif_autorisation','').strip()
 if id not in allow or not link or auth!='OUI' or not proof:continue
 if urlparse(link).scheme!='https':print('URL ignorée (HTTPS requis)',id);continue
 try:
  if link not in cache:
   with urlopen(Request(link,headers={'User-Agent':'KiArenaLicensedAssetFetcher/1.0'}),timeout=20) as r:data=r.read(7_000_001)
   if len(data)>7_000_000:raise ValueError('Fichier >7MB')
   cache[link]=data;time.sleep(.35)
  image=Image.open(io.BytesIO(cache[link])).convert('RGBA');image.thumbnail((512,768))
  path=dest/(id+'.webp');image.save(path,'WEBP',quality=82,method=5)
  approved[id]=f'assets/portraits/{id}.webp'
 except Exception as e:print('Échec',id,':',e)
js='// Illustrations tierces validées et attribuées dans data/sources_images.csv\nexport const APPROVED_IMAGES = Object.freeze('+json.dumps(approved,ensure_ascii=False,indent=2)+');\n'
(root/'src/approved-images.js').write_text(js)
print('Images téléchargées avec autorisation vérifiée :',len(approved),'/',len(rows))
