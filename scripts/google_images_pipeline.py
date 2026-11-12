#!/usr/bin/env python3
"""Low-cost Google Images *candidate* discovery and rights-aware local image import.

Run (on your own internet-connected computer):
  pip install playwright pillow requests
  playwright install chromium
  python scripts/google_images_pipeline.py discover --limit 300
  # inspect data/google_images_candidates.csv; set approved=YES only if license allows use
  python scripts/google_images_pipeline.py import-approved

Google results are not a license, a guarantee of correct character, or a redistribution grant.
The script intentionally does NOT bulk-copy search-result images into a distributable game.
"""
import argparse,csv,json,os,re,sys,time,urllib.parse,urllib.request,io,math
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
BASE=ROOT/'data';ASSETS=ROOT/'assets'/'portraits';BASE.mkdir(exist_ok=True)
FIELDS=['id','nom','serie','version','recherche_google','url_google_images','image_candidate_url','domaine_source','qualite','licence','preuve_droit','approved','image_locale','statut']
def load():return json.loads((BASE/'catalog.v2.json').read_text(encoding='utf8'))['cards']
def query(c):
 # Keep form/saga discriminating otherwise Goku base and Goku UI could share wrong artwork
 return f'"{c["name"]}" "{c["form"]}" Dragon Ball {c["series"]} character portrait'
def rows():
 return [{'id':c['id'],'nom':c['name'],'serie':c['series'],'version':c['form'],'recherche_google':query(c),'url_google_images':'https://www.google.com/search?tbm=isch&q='+urllib.parse.quote(query(c)),'image_candidate_url':'','domaine_source':'','qualite':'','licence':'INCONNUE','preuve_droit':'','approved':'NO','image_locale':'','statut':'a_verifier'} for c in load()]
def write(out,items):
 with open(out,'w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,FIELDS,delimiter=';');w.writeheader();w.writerows(items)
def discover(limit,delay,google):
 dest=BASE/'google_images_candidates.csv'; existing={}
 if dest.exists():
  with open(dest,encoding='utf-8-sig',newline='') as f:existing={r['id']:r for r in csv.DictReader(f,delimiter=';')}
 entries=[{**r,**{k:v for k,v in existing.get(r['id'],{}).items() if k in FIELDS and k not in ('nom','serie','version','recherche_google','url_google_images')}} for r in rows()]
 if google:
  try: from playwright.sync_api import sync_playwright
  except ImportError:raise SystemExit('Installer Playwright : pip install playwright && playwright install chromium')
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True);context=browser.new_context(viewport={'width':1300,'height':980},locale='fr-FR')
   page=context.new_page()
   for i,row in enumerate(entries[:limit]):
    if row['image_candidate_url']:continue
    try:
     page.goto(row['url_google_images'],wait_until='domcontentloaded',timeout=18000)
     # Search pages can change, block automation, or require consent. No CAPTCHA bypass.
     if 'consent.' in page.url or 'sorry/' in page.url:
      row['statut']='consentement_ou_limitation_google';continue
     page.wait_for_timeout(600)
     found=page.locator('img').evaluate_all("""els => els.map(e=>({src:e.currentSrc||e.src,alt:e.alt||'',w:e.naturalWidth,h:e.naturalHeight})).filter(x=>x.src.startsWith('http')&&x.w>=120&&x.h>=120&&!/logo|google|favicon/i.test(x.alt))""")
     if found:
      candidate=found[0];row['image_candidate_url']=candidate['src'];row['qualite']=f'{candidate["w"]}x{candidate["h"]}';row['domaine_source']=urllib.parse.urlparse(candidate['src']).netloc;row['statut']='candidat_non_licencie_a_revoir'
     else: row['statut']='aucune_image_detectee'
    except Exception as ex:row['statut']='erreur_recherche_'+str(ex)[:60]
    if i%10==0:print('Candidats Google traités:',i+1,'/',min(limit,len(entries)),flush=True)
    time.sleep(delay)
   browser.close()
 write(dest,entries)
 print('CSV généré:',dest,'| images intégrées : 0 sans licence validée')
def import_approved():
 from PIL import Image,ImageOps
 filename=BASE/'google_images_candidates.csv'
 if not filename.exists():raise SystemExit('Lancer discover avant import-approved')
 with open(filename,encoding='utf-8-sig',newline='') as f:entries=list(csv.DictReader(f,delimiter=';'))
 approved={};ASSETS.mkdir(parents=True,exist_ok=True)
 for row in entries:
  if row.get('approved','').strip().upper()!='YES':continue
  if not row.get('preuve_droit') or row.get('licence','INCONNUE')=='INCONNUE':
   print('DROITS MANQUANTS:',row['id']);continue
  url=row.get('image_candidate_url','');
  if not url.startswith('https://'):continue
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (KI ARENA, licensed-assets importer)'})
   with urllib.request.urlopen(req,timeout=15) as r:
    content=r.read(8*1024*1024+1)
    if len(content)>8*1024*1024:raise ValueError('image trop grande')
   im=Image.open(io.BytesIO(content)).convert('RGBA');
   if im.width<120 or im.height<120:raise ValueError('image trop petite')
   # Preserve whole subject and center it: contain in 480x640 frame without cropping heads.
   im.thumbnail((450,610),Image.Resampling.LANCZOS)
   out=Image.new('RGBA',(480,640),(0,0,0,0));out.alpha_composite(im,((480-im.width)//2,(640-im.height)//2))
   destination=ASSETS/(row['id']+'.webp');out.save(destination,format='WEBP',quality=83,method=6)
   approved[row['id']]='assets/portraits/'+destination.name;row['image_locale']=approved[row['id']];row['statut']='valide_licence_et_centre'
  except Exception as ex:print('ÉCHEC IMAGE',row['id'],ex)
 write(filename,entries)
 (ROOT/'src'/'approved-images.js').write_text('/* Only reviewed/approved assets. */\nexport const APPROVED_IMAGES = '+json.dumps(approved,ensure_ascii=False,indent=2)+';\n')
 print('Portraits approuvés, centrés et compressés:',len(approved))
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('action',choices=['discover','import-approved']);a.add_argument('--limit',type=int,default=300);a.add_argument('--delay',type=float,default=1.4);a.add_argument('--google',action='store_true',help='Try Google Images via Playwright (network required)');opts=a.parse_args()
 if opts.action=='discover':discover(opts.limit,opts.delay,opts.google)
 else:import_approved()
