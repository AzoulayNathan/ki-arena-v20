"""Découverte économique de MÉTADONNÉES d'images Dragon Ball.
Ne télécharge ni ne diffuse d'illustrations sous copyright.
API communautaire, résultat à vérifier et droits à obtenir avant publication.
Commande : python scripts/discover_images.py
"""
from pathlib import Path
import json, csv, urllib.request, urllib.parse, unicodedata, re, time
root=Path(__file__).resolve().parent.parent
folder=root/'data'/'api_cache';folder.mkdir(parents=True,exist_ok=True)
URL='https://dragonball-api.com/api/characters?limit=100&page=1'
def get(url,key):
 path=folder/(key+'.json')
 if path.exists() and time.time()-path.stat().st_mtime<7*86400:return json.loads(path.read_text())
 req=urllib.request.Request(url,headers={'User-Agent':'KiArenaPrototypeMetadataCollector/1.0 (rights-review-only)'})
 with urllib.request.urlopen(req,timeout=18) as r: obj=json.load(r)
 path.write_text(json.dumps(obj,ensure_ascii=False,indent=2));time.sleep(.5);return obj

def norm(t):
 t=unicodedata.normalize('NFD',str(t).lower());t=''.join(c for c in t if unicodedata.category(c)!='Mn')
 return re.sub('[^a-z0-9]+','',t)
try:
 data=get(URL,'characters_page1');total=data.get('meta',{}).get('totalPages',1);characters=data.get('items',[]) if isinstance(data,dict) else data
 for page in range(2,min(total,8)+1):characters+=get(URL.replace('page=1',f'page={page}'),f'characters_page{page}').get('items',[])
 cards=json.loads((root/'data/catalog.v2.json').read_text())['cards']
 aliases={'krilin':'krillin','c17':'android17','c18':'android18','chaozu':'chiaotzu','tortuegeniale':'masterroshi','freezer':'frieza','blackgoku':'gokublack'}
 index={norm(x.get('name','')):x for x in characters};rows=[]
 for c in cards:
  name=norm(c['name']);match=index.get(name) or index.get(aliases.get(name,''));image=match.get('image','') if match else ''
  rows.append({'card_id':c['id'],'nom':c['name'],'version':c['form'],'image_candidate_url':image,'source_api':URL,'match_statut':'match_nom' if match else 'aucun_match','licence':'À VÉRIFIER','redistribution':'NON AUTORISÉE PAR DÉFAUT'})
 out=root/'data/image_candidates.csv'
 with out.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,rows[0].keys(),delimiter=';');w.writeheader();w.writerows(rows)
 print(f'Métadonnées pour {len(characters)} personnes API, {sum(bool(x["image_candidate_url"]) for x in rows)} candidats; aucune image copiée.')
except Exception as e:
 print('Recherche des métadonnées indisponible (connexion ou API) :',e)
 print('Les fichiers CSV de base restent utilisables hors ligne.')
