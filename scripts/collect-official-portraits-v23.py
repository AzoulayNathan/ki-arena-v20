"""Bounded, cached collector. Only source-published art; human review required before integration.
No image generation, no form inference, no automatic approval. Run: python scripts/collect-official-portraits-v23.py
"""
from pathlib import Path
import urllib.request,urllib.parse,re,json,html,concurrent.futures,time,hashlib
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa/v23/portrait-candidates';OUT.mkdir(parents=True,exist_ok=True)
BASE='https://en.dragon-ball-official.com'
queries=['Cymbal','Monaka','Bora','Giran','Grandpa Gohan','Bulma','Goku','Vegeta','Frieza','Cell','Majin Buu','Piccolo','Krillin','Yamcha','Tien','Yajirobe','Ninja Murasaki','General Blue','General Black','Mercenary Tao','Pilaf','Future Bulma']
# Sources already resolved through the official site's indexed articles.
known={'Cymbal':'/news/01_2439.html','Monaka':'/news/01_3996.html','Vegeta':'/news/01_3929.html','Grandpa Gohan':'/news/01_612.html','Bulma':'/news/01_3933.html','Pilaf':'/news/01_777.html','Future Bulma':'/news/01_2351.html'}
def get(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'KI-Arena-local-art-review/23'}),timeout=20).read()
def collect(name):
 path=OUT/(re.sub(r'[^a-z0-9]+','-',name.lower())+'.json')
 if path.exists():return json.loads(path.read_text())
 row={'query':name,'status':'REVIEW','rights':'Source officielle ; contenu protégé, aucune licence commerciale revendiquée.'}
 try:
  urls=[urllib.parse.urljoin(BASE,known[name])]if name in known else []
  if not urls:
   listing=get(BASE+'/news/?search='+urllib.parse.quote(name)).decode()
   # Anchor blocks include the actual displayed article title, not an invented search match.
   for match in re.finditer(r'<a\b[^>]*href=["\']([^"\']*?/news/01_\d+\.html)["\'][^>]*>(.*?)</a>',listing,re.S|re.I):
    title=html.unescape(re.sub('<[^>]+>',' ',match[2]));title=' '.join(title.split())
    subject=re.split(r'\bfrom\b|\bof the\b',title.split(':',1)[-1],flags=re.I)[0].strip(' ![]');
    if 'Showcase'in title and subject.lower()==name.lower():urls.append(urllib.parse.urljoin(BASE,match[1]))
  if not urls:raise ValueError('Aucun portrait officiel résolu dans la liste ; recherche manuelle nécessaire.')
  page=urls[0];source=get(page).decode();title=html.unescape(re.search(r'<title>(.*?)</title>',source,re.S)[1]);imgs=re.findall(r'<img[^>]+src=["\']([^"\']+)["\']',source)
  candidates=[urllib.parse.urljoin(BASE,u.split('?')[0])for u in imgs if '/dragonball/'in u and re.search(r'(?:chara|character).*?(?:_1|_01)\.(?:jpg|png)',u,re.I)]
  if not candidates:raise ValueError('Premier portrait non résolu, examen du HTML nécessaire.')
  image_url=candidates[0];blob=get(image_url);im=Image.open(__import__('io').BytesIO(blob));im.load()
  if min(im.size)<100:raise ValueError('Source trop petite')
  file=path.with_suffix('.webp');im.convert('RGB').save(file,'WEBP',quality=92)
  row.update(page=page,title=title,url=image_url,file=file.relative_to(ROOT).as_posix(),sourceSize=list(im.size),sha256=hashlib.sha256(blob).hexdigest(),downloaded=True)
 except Exception as e:row.update(status='BLOCKED',error=str(e))
 path.write_text(json.dumps(row,ensure_ascii=False,indent=2));return row
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:rows=list(pool.map(collect,queries))
(OUT/'index.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print(json.dumps([{k:r[k]for k in ['query','status','downloaded','error']if k in r}for r in rows],ensure_ascii=False))
good=[r for r in rows if r.get('downloaded')]
if good:
 sheet=Image.new('RGB',(5*240,((len(good)+4)//5)*330),'#eee9dc');d=ImageDraw.Draw(sheet)
 for i,r in enumerate(good):
  im=Image.open(ROOT/r['file']);im=ImageOps.contain(im,(220,290));x=(i%5)*240+(240-im.width)//2;y=(i//5)*330;sheet.paste(im,(x,y));d.text(((i%5)*240+8,y+295),str(i)+' '+r['query'],fill='black')
 sheet.save(OUT/'review.jpg',quality=92)
if any(r['status']=='BLOCKED'for r in rows):raise SystemExit(2)
