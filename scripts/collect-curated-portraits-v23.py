"""Collect only explicitly curated official pages. Outputs REVIEW, never automatic approval.
Requires Python + Pillow for image conversion and the review sheet; not needed to play.
"""
from pathlib import Path
import urllib.request,urllib.parse,re,json,concurrent.futures,io,hashlib
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa/v23/curated-candidates';OUT.mkdir(parents=True,exist_ok=True)
plan=json.loads((ROOT/'data/portraits-curated-sources-v23.json').read_text())
def collect(row):
 row={**row,'status':'REVIEW','rights':'Illustration de source officielle protégée ; aucune licence commerciale conférée.'};slug=row['person'].split(':')[1]+'-'+Path(row['page']).stem;meta=OUT/(slug+'.json')
 if meta.exists():
  try:
   text=meta.read_text(encoding='utf-8').strip();
   if text:return json.loads(text)
  except Exception:pass
  meta.unlink(missing_ok=True)
 try:
  page=urllib.parse.urljoin('https://en.dragon-ball-official.com',row['page']);source=urllib.request.urlopen(page,timeout=20).read().decode();title=re.search(r'<title>(.*?)</title>',source,re.S)[1]
  imgs=re.findall(r'<img[^>]+src=["\']([^"\']+)["\']',source);links=[urllib.parse.urljoin(page,u.split('?')[0])for u in imgs if '/dragonball/'in u and re.search(r'(?:chara|character).*?(?:_1|_01)\.(?:jpg|png)',u,re.I)]
  if not links:raise ValueError('Portrait non résolu')
  data=urllib.request.urlopen(links[0],timeout=20).read();im=Image.open(io.BytesIO(data));im.load();dest=OUT/(slug+'.webp');im.convert('RGB').save(dest,'WEBP',quality=92)
  row.update(page=page,title=title,url=links[0],file=dest.relative_to(ROOT).as_posix(),sourceSize=list(im.size),sourceSha256=hashlib.sha256(data).hexdigest(),downloaded=True)
 except Exception as e:row.update(status='BLOCKED',error=str(e))
 meta.write_text(json.dumps(row,ensure_ascii=False,indent=2),encoding='utf-8');return row
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:rows=list(pool.map(collect,plan))
(OUT/'index.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8');good=[x for x in rows if x.get('downloaded')]
for part in range((len(good)+14)//15):
 group=good[part*15:(part+1)*15];sheet=Image.new('RGB',(5*210,((len(group)+4)//5)*300),'#eee9dc');d=ImageDraw.Draw(sheet)
 for i,r in enumerate(group):
  im=ImageOps.contain(Image.open(ROOT/r['file']),(200,265));sheet.paste(im,((i%5)*210+(210-im.width)//2,(i//5)*300));d.text(((i%5)*210+5,(i//5)*300+272),str(part*15+i)+' '+r['query'],fill='black')
 sheet.save(OUT/f'review-{part+1}.jpg',quality=92)
print(json.dumps([{'person':x['person'],'status':x['status'],'downloaded':x.get('downloaded',False),'error':x.get('error')}for x in rows],ensure_ascii=False))
if any(x['status']=='BLOCKED'for x in rows):raise SystemExit(2)
