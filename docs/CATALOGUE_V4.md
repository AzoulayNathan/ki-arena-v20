# Catalogue KI ARENA V4 — 600 cartes

## Périmètre
Dragon Ball, DBZ, DBS (anime) ; pas GT, Daima, films seuls, arcs manga seuls.

## Inventaire
600 cartes distinctes ; 304 identités normalisées, 312 libellés de noms ; 1 380 effets. Répartition exacte : communes 198, peu communes 162, rares 126, épiques 90, légendaires 24.

## Fichiers
- `data/cartes_complet.csv` : toutes les cartes, stats, rarités, versions, coûts, effets détaillés et déclencheurs, sources et noms canoniques.
- `data/personnages_index.csv` : familles de cartes et alias.
- `data/effets_complet.csv` : 1 380 compétences, déclencheurs et durée.
- `data/google_images_candidates.csv` : 600 recherches d'images **sans image importée**.
- `data/sources_images.csv` : statut de licence et éventuelle approbation des visuels.
- `data/exclusions_et_audits.csv` : propositions rejetées lors de la curation.
- `data/CATALOGUE_V4_QUALITE.json` : bilan machine.
- `data/catalog.v2.json` : catalogue JSON utilisable dans le jeu.
- `assets/stylized/` : 600 SVG génériques temporaires, **pas les portraits authentiques** des personnages.

## Qualité, limites
Les identifiants carte et les couples identité/série/version sont uniques. Les ratios et le nombre de capacités sont vérifiés. Le CSV est rempli, mais le caractère exhaustif des personnages présents dans chaque épisode et l'exactitude des variantes restent à auditer individuellement. Les statistiques, prix, raretés et effets sont des paramètres du jeu, non officiels. Une page de catégorie Wikipédia/Fandom aide à rechercher un nom, mais ne prouve pas chaque version. Les licences des images trouvées sur Google doivent être validées avant téléchargement et diffusion commerciale.

## Tester
`npm test`, puis `node server.mjs` pour démarrer localement. Le HTML autonome `index_preview_autonome.html` fonctionne sans serveur ; `www/` contient les fichiers pour préparer Capacitor.

**Reproductibilité** : `scripts/export_csv.py` recrée le CSV brut et écrase les champs d'enrichissement V4 ; conserver une copie des CSV livrés avant de régénérer.
