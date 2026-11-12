"""Local-only exact/perceptual audit; suspected matches never approve or delete an image."""
from pathlib import Path
import json,hashlib
from PIL import Image
root=Path(__file__).resolve().parent.parent
p=root/'qa/v14/image-refresh.json';r=json.loads(p.read_text());entries=r['inherited']
for e in entries:
 source=root/e['path'];e['sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
 with Image.open(source) as im:
  g=im.convert('L').resize((9,8));a=g.load();bits=sum(1<<(y*8+x) for y in range(8) for x in range(8) if a[x,y]>a[x+1,y]);e['perceptualDHash64']=f'{bits:016x}'
r['suspectedNearDuplicates']=[]
for i,a in enumerate(entries):
 for b in entries[i+1:]:
  d=(int(a['perceptualDHash64'],16)^int(b['perceptualDHash64'],16)).bit_count()
  if d<=6:r['suspectedNearDuplicates'].append({'a':a['path'],'b':b['path'],'distance':d,'status':'REVIEW_ONLY','note':'Un hash proche ne prouve pas une identité ni un doublon illégitime.'})
p.write_text(json.dumps(r,ensure_ascii=False,indent=2));print(len(entries),'images décodées ;',len(r['suspectedNearDuplicates']),'paires à revoir ; aucune suppression ni approbation automatique.')
