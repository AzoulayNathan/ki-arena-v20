"""Bounded real enrichment pass. No automatic identity approval or bypass of blocked hosts."""
from pathlib import Path
import urllib.request,urllib.parse,urllib.error,json,hashlib,csv,datetime,collections,sys
from html.parser import HTMLParser
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
class Og(HTMLParser):
 def __init__(self):super().__init__();self.url=None
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='meta' and d.get('property')=='og:image':self.url=d.get('content')
def fetch(url,limit=2_000_000):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'KI-Arena-local-asset-audit/1.0'}),timeout=10) as r:return r.read(limit),r.headers.get('Content-Type','')
def main():
 if '--cached' in sys.argv and (ROOT/'qa/v14/image-refresh.json').exists():
  prior=json.loads((ROOT/'qa/v14/image-refresh.json').read_text());print(json.dumps(prior['summary']));return 2 if prior.get('approvedApplied',0)==0 else 0
 items=json.loads((ROOT/'qa/v14/image-sources.json').read_text());blocked={};out=[];folder=ROOT/'qa/v14/image-candidates';folder.mkdir(exist_ok=True)
 for item in items:
  rec={**item,'status':'REVIEW','reason':'','sha256':'','downloaded':''};url=item.get('source','');host=urllib.parse.urlsplit(url).netloc
  if not host:rec.update(status='NO_DIRECT_SOURCE',reason='Aucune source directe exploitable.')
  elif host in blocked:rec.update(status='BLOCKED_HOST',reason=blocked[host])
  else:
   try:
    data,mime=fetch(url)
    if 'image/' not in mime:
     parser=Og();parser.feed(data.decode('utf-8','ignore'));candidate=parser.url
     if not candidate:raise ValueError('Aucune image og:image, revue manuelle nécessaire.')
     rec['candidate']=candidate;data,mime=fetch(candidate,8_000_000)
    if not mime.startswith('image/'):raise ValueError('Le contenu reçu n’est pas une image.')
    path=folder/(item['id'].replace(':','_')+'.candidate');path.write_bytes(data)
    with Image.open(path) as im:im.verify()
    rec.update(status='REVIEW_DOWNLOADED',reason='Image décodable ; identité/forme/objet et droits non approuvés.',sha256=hashlib.sha256(data).hexdigest(),downloaded=str(path.relative_to(ROOT)))
   except urllib.error.HTTPError as e:
    reason='HTTP '+str(e.code)+' à la première tentative sur '+host
    rec.update(status='BLOCKED_HTTP',reason=reason)
    if e.code in [401,402,403,429]:blocked[host]=reason+' ; aucune tentative de contournement.'
   except Exception as e:rec.update(status='BLOCKED_OR_REVIEW',reason=type(e).__name__+': '+str(e))
  out.append(rec)
 inherited=[]
 for p in sorted((ROOT/'assets/equipment').rglob('*.webp')):inherited.append({'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'status':'QUARANTINED_UNREVIEWED','reason':'Hérité V13 ; ne pas proposer une miniature non validée comme portrait exact de l’objet.'})
 groups=collections.defaultdict(list)
 for x in inherited:groups[x['sha256']].append(x['path'])
 result={'runAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'items':out,'inherited':inherited,'exactDuplicateGroups':[g for g in groups.values() if len(g)>1],'summary':dict(collections.Counter(x['status'] for x in out)),'approvedApplied':0,'note':'No image automatically approved. UI uses named editorial drawings or honest symbols until identity is reviewed.'}
 (ROOT/'qa/v14/image-refresh.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 with (ROOT/'MANIFEST_IMAGES_V14.csv').open('w',newline='',encoding='utf-8-sig') as f:
  w=csv.DictWriter(f,fieldnames=['id','name','source','status','reason','sha256','downloaded'],extrasaction='ignore');w.writeheader();w.writerows(out)
 print(json.dumps(result['summary']));return 2 if any(x['status']!='APPLIED' for x in out) else 0
if __name__=='__main__':sys.exit(main())
