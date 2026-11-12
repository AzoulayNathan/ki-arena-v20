# Images : recherche Google et pipeline économique

La première image Google n'est **ni forcément correcte**, ni forcément libre. Le projet destiné à une publication commerciale ne peut pas redistribuer ces images par défaut.

## Recherche des 300 cartes

Chaque carte possède un identifiant, un nom, une saga et une version. La recherche s'appuie sur les quatre afin de réduire les erreurs de doublon :

`"Goku" "Ultra Instinct maîtrisé — Tournoi du Pouvoir" Dragon Ball DBS character portrait`

Fichier prêt : `data/google_images_candidates.csv`, **300 URL Google Images distinctes**.

Avec une connexion Internet et Chromium local :

```bash
pip install pillow requests playwright
playwright install chromium
python scripts/google_images_pipeline.py discover --google --limit 300 --delay 1.5
```

Le script essaie de récupérer la première **vignette candidate** trouvée sur chaque recherche. Google peut présenter un consentement, limiter les recherches automatisées ou modifier son HTML. Le script n'essaie pas de contourner les limitations. Les 300 entrées CSV existent même sans réseau.

## Vérifier et intégrer

Ouvrir `data/google_images_candidates.csv` et inspecter chaque candidat : personne, transformation, série correcte, image de qualité suffisante et **autorisation/licence compatible**.

Ajouter `licence`, `preuve_droit`, puis `approved=YES` aux lignes réellement autorisées.

```bash
python scripts/google_images_pipeline.py import-approved
```

Le script télécharge les seules images approuvées, crée un canvas transparent 480×640, réduit l'image en conservant ses proportions, la centre sans rogner le haut du personnage, exporte au format WebP et génère `src/approved-images.js` pour relier les fichiers aux cartes.

Évite les outils facturant chaque requête tant que ce pipeline gratuit est suffisant. Prévoir une validation humaine, notamment entre différentes transformations ou éditions ; même un modèle visuel ne garantit pas la bonne version.
