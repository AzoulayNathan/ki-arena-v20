from pathlib import Path
from collections import Counter,defaultdict
import csv,json
root=Path(__file__).resolve().parent.parent
cards=json.loads((root/'data/catalog.v2.json').read_text())['cards']

def save(fname,rows,fields):
 with (root/'data'/fname).open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',delimiter=';');w.writeheader();w.writerows(rows)

fields=['id','nom','version','nom_complet','serie','archetype','rarete','attaque','pv','vitesse','cout_ki','nombre_effets','illustration_locale','illustration_photo_licenciee','statut_visuel','source_encyclopedique','statut_validation']
for i in range(1,6): fields+= [f'effet_{i}_nom',f'effet_{i}_type',f'effet_{i}_declencheur',f'effet_{i}_description']
rows=[];effects=[]
for c in cards:
 row={'id':c['id'],'nom':c['name'],'version':c['form'],'nom_complet':f"{c['name']} — {c['form']}",'serie':c['series'],'archetype':c['kit'],'rarete':c['rarity'],'attaque':c['attack'],'pv':c['maxHp'],'vitesse':c['speed'],'cout_ki':c['price'],'nombre_effets':len(c['effects']),'illustration_locale':f"assets/stylized/{c['id']}.svg",'illustration_photo_licenciee':'','statut_visuel':'SVG original de démonstration','source_encyclopedique':'','statut_validation':'provisoire — vérifier existence/version/saga et droits visuels'}
 for j,e in enumerate(c['effects'],1):
  row[f'effet_{j}_nom']=e['name'];row[f'effet_{j}_type']=e['type'];row[f'effet_{j}_declencheur']=e['trigger'];row[f'effet_{j}_description']=e['description']
  effects.append({'card_id':c['id'],'nom_complet':row['nom_complet'],'effet_index':j,'effet_id':e['key'],'nom':e['name'],'type':e['type'],'moment':e['trigger'],'usage':'une seule activation maximum par combat','description':e['description']})
 rows.append(row)
save('cartes_complet.csv',rows,fields)
save('effets_complet.csv',effects,['card_id','nom_complet','effet_index','effet_id','nom','type','moment','usage','description'])
per=defaultdict(list)
for c in cards:per[c['name'].casefold()].append(c)
characters=[{'nom':v[0]['name'],'nb_versions':len(v),'univers':','.join(sorted({x['series'] for x in v})),'versions':' | '.join(x['form'] for x in v),'ids_cartes':' | '.join(x['id'] for x in v),'verification':'à vérifier contre sources officielles DB/DBZ/DBS'} for v in per.values()]
save('personnages_index.csv',characters,['nom','nb_versions','univers','versions','ids_cartes','verification'])
source=[{'card_id':c['id'],'nom':c['name'],'version':c['form'],'source_metadonnees':'https://dragonball-api.com/api/characters','url_illustration_candidate':'','licence_photo':'NON DÉTERMINÉE','autorisation_commerciale':'NON','justificatif_autorisation':'','image_locale_originale':f"assets/stylized/{c['id']}.svg",'image_locale_licenciee':'','statut':'asset original disponible / visuel tiers à sourcer'} for c in cards]
save('sources_images.csv',source,['card_id','nom','version','source_metadonnees','url_illustration_candidate','licence_photo','autorisation_commerciale','justificatif_autorisation','image_locale_originale','image_locale_licenciee','statut'])
summary=Counter(c['rarity'] for c in cards)
print('CSV :',len(rows),'cartes',len(characters),'personnages / noms',len(effects),'effets','répartition',dict(summary))
