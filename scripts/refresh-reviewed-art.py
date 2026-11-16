"""Optional maintenance collector. Default stages candidates; never installs search results.
Requires Pillow. The game remains completely local. --apply-reviewed only publishes identical reviewed pixels.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlparse
from PIL import Image
from io import BytesIO
import argparse,json,hashlib,sys
root=Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--apply-reviewed',action='store_true');opts=args.parse_args()
rows=json.loads((root/'data/portraits-reviewed-v211.json').read_text());stage=root/'qa/art-review';stage.mkdir(parents=True,exist_ok=True)
allowed={'en.dragon-ball-official.com','www.ntv.co.jp','www.tv-tokyo.co.jp'};proof=[]
for row in rows:
 try:
  if urlparse(row['url']).hostname not in allowed:raise ValueError('Source non répertoriée')
  with urlopen(Request(row['url'],headers={'User-Agent':'KI-Arena-reviewed-art/21.1'}),timeout=20)as response:
   if urlparse(response.url).hostname not in allowed:raise ValueError('Redirection non répertoriée')
   data=response.read(12*1024*1024+1)
  if len(data)>12*1024*1024:raise ValueError('Image trop volumineuse')
  im=Image.open(BytesIO(data)).convert('RGBA')
  if hashlib.sha256(im.tobytes()).hexdigest()!=row['reviewedPixelSha256']:raise ValueError('REVIEW : la source a changé ; publication refusée')
  im=im.crop(tuple(row['crop']));candidate=stage/(row['name']+'.webp');im.save(candidate,quality=92,method=6)
  if opts.apply_reviewed:
   destination=(root/row['file']).resolve()
   if not destination.is_relative_to(root/'assets/v21/portraits'):raise ValueError('Destination invalide')
   destination.write_bytes(candidate.read_bytes())
  proof.append({'name':row['name'],'status':'APPLIED'if opts.apply_reviewed else'STAGED','source':row['url'],'sha256':hashlib.sha256(candidate.read_bytes()).hexdigest()})
 except Exception as error:proof.append({'name':row['name'],'status':'FAIL','reason':str(error)})
(stage/'refresh.json').write_text(json.dumps(proof,indent=2,ensure_ascii=False));print(json.dumps({'images':len(proof),'failed':sum(p['status']=='FAIL'for p in proof),'report':'qa/art-review/refresh.json'},indent=2));sys.exit(1 if any(p['status']=='FAIL'for p in proof)else 0)
