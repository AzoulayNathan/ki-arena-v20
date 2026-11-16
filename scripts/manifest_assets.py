from pathlib import Path
import csv,hashlib
root=Path(__file__).resolve().parents[1]
with (root/'MANIFEST_ASSETS_ET_DROITS.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f,delimiter=';');w.writerow(['chemin','octets','sha256','provenance','droits_et_limites','usage'])
 for p in sorted((root/'assets').rglob('*')):
  if not p.is_file():continue
  rel=p.relative_to(root).as_posix()
  if '/v9/fonts/' in rel:origin='Barlow Condensed / Outfit distribuées via Fontsource';rights='SIL Open Font License 1.1 ; licences complètes jointes dans assets/v9/fonts';usage='Typographie locale de l’interface Grand Voyage ; noms dédiés AdventureDisplay et AdventureText'
  elif '/v9/' in rel and p.suffix=='.webp':origin='Imagegen intégré — génération du 21 octobre 2026';rights='Environnement original généré ; inspiration fan-made, aucune licence officielle DB/HXH';usage='Panorama ou scène réelle du jeu ; prompts dans ART_PROMPTS_V9.md'
  elif '/v9/' in rel:origin='SVG original codé pour V9';rights='Pictogramme neutre créé pour ce projet, pas portrait canonique';usage='Catégorie/effet d’équipement'
  else:origin='Pack V8 fourni, conservé octet par octet';rights='Droits indépendants non vérifiés ; SVG génériques / concepts hérités / sons synthétiques selon README V8 ; aucune autorisation de diffusion commerciale déduite';usage='Cartes, arcade, sons et scènes historiques'
  w.writerow([rel,p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest(),origin,rights,usage])
print('Manifest assets créé')
