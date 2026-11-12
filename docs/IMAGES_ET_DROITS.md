# Images & coût minimal — approche reproductible

## Statut des illustrations livrées

- **200 SVG originaux** dessinés pour tester la taille, les cadres, la lisibilité des stats, la couleur de rareté et les animations. Un SVG peut utiliser des formes proches d'une esthétique manga générique mais **ne doit pas être présenté comme un portrait officiel et fidèle** d'un personnage Dragon Ball.
- **Aucune illustration Dragon Ball tierce téléchargée et incorporée à ce ZIP.** Les métadonnées/API/URL d'illustrations sont des indices de recherche, pas une autorisation d'utilisation.

## Processus proposé avec coût réseau faible

1. Générer le catalogue versionné via `node scripts/export_all.mjs && python scripts/export_csv.py`.
2. Tenter `python scripts/discover_images.py` sur une machine ayant accès à Internet. Script léger, mises en cache JSON des pages d'une API communautaire, faible débit, matching approximatif des personnages. Il génère **uniquement** `data/image_candidates.csv` sans télécharger les illustrations.
3. Vérifier manuellement les éventuels URL candidates et la licence applicable à chaque image (les images d'encyclopédies et les médias repris dans une API ne sont pas nécessairement libres, même si la page comporte une licence pour le texte).
4. Quand une illustration est **effectivement utilisable commercialement avec justificatif**, remplir `url_illustration_candidate`, `autorisation_commerciale=OUI`, `justificatif_autorisation` dans `data/sources_images.csv`.
5. Lancer `python scripts/download_approved.py` après installation de Pillow. Le script réutilise les URL identiques, limite les téléchargements à 7 Mo, réduit les images à 512×768 et exporte en `.webp` de qualité 82, puis remplit automatiquement `src/approved-images.js`.
6. Relancer `python build_preview.py` et `python scripts/build_mobile.py` pour faire apparaître les nouvelles illustrations dans le site et dans le client mobile.

**À ne pas faire pour un jeu monétisé :** récupérer en masse des images de personnages depuis Fandom, Google Images ou une API et considérer qu'elles sont commercialement réutilisables sans licence, ou republier des visuels officiels sans autorisation.

## Politique fallback

Par défaut, `src/approved-images.js` est vide ; le moteur d'affichage utilise `assets/stylized/<card_id>.svg`. En cas d'image autorisée introuvable ou d'URL cassée, il repasse automatiquement à un dessin vectoriel de substitution. Chaque image tierce approuvée reste traçable dans le fichier de sources CSV.

## Bibliothèque finale envisagée

Pour un rendu final premium : une illustration autorisée par **forme** (peut réutiliser un portrait si cela reste cohérent), overlays d'aura de rareté fabriqués en CSS, effets de combat CSS/Canvas légers, animations de déplacement communes à toutes les cartes. Aucun moteur d'IA ou serveur GPU payant n'est requis pour les effets d'interface.
