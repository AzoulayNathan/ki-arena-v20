# KI ARENA V7 — Arcade Adventure / Livraison

## Ce qui est livré

- Projet source de KI ARENA V6 **modifié sur place** en V7 pour le Roguelike (le reste des modes est conservé).
- Fichier autonome `KI_ARENA_ROGUEONE_V7_JOUER.html`, compilé avec scripts, CSS, décors et assets intégrés pour une ouverture hors ligne.
- `src/rogue-v7.css` : styles V7 localisés (pas de refonte des cartes).
- `scripts/create_v7_worlds.py` et `assets/rogue/*.svg` : six décors vectoriels originaux.
- `scripts/v7_browser_check.py` et `scripts/v7_scene_qa.py` : contrôles automatisés Chrome/Chromium.
- Documentation : `DESIGN_SYSTEM_V7.md`, `QA_V7.md`, captures d'interface.

## Modifications réellement appliquées

1. HUD de run condensé : étape, zone, zénis, packs, Dragon Balls, survivants, progression.
2. Mise en page de jeu : scène dominante + équipe permanente et contrôles latéraux; tiroirs en mobile.
3. Carte : nœuds emblèmes, couleurs sémantiques, parcours lumineux, marqueur repositionné avec la progression, ambiance à plusieurs plans.
4. Six biomes SVG entièrement redessinés avec langage graphique commun.
5. Pré-combat : portrait des adversaires, danger et indices boss présentés dans des emplacements cohérents; bug de grille corrigé en QA.
6. Combats : cadre d'arène, bandeau, événements et impacts plus lisibles. Portrait de l'événement ancré dans son conteneur.
7. Événement, repos, marchand, trésor, boss, loot, inventaire : surfaces et boutons harmonisés.
8. Nouvelle présentation mobile sans barre inférieure superposée à la carte.
9. Écran d'introduction du mode harmonisé et encart de bilan de dernière run, quand un historique existe.
10. Nouveau cache service-worker V7 : les anciens caches ne doivent plus afficher la vieille CSS après mise à jour.

## Ce qui n'a PAS changé

- 600 cartes, leurs fichiers d'illustration, leurs raretés, attributs et templates.
- Algorithmes de combat, choix de rencontres, courbe de difficulté, récompenses, règles de KO/résurrection et statistiques.
- Structure de sauvegarde (`kiarena_arcade_v3`) et historique utilisateur.
- Les sept autres mini-jeux.

## Démarrer

**Simple :** ouvrir le fichier autonome HTML dans Chrome ou Edge. Aucun serveur n'est nécessaire.

**Sources :** depuis le dossier source : `npm start`, puis ouvrir `http://127.0.0.1:4173`.

**Tests :** `npm test`. Pour reconstruire l'autonome : `npm run build:offline`.

## Validation et limites

Voir `QA_V7.md`. Les tests prouvent le lancement, plusieurs interactions et l'absence d'erreur sur les scénarios parcourus. Ils ne prouvent pas l'absence totale de bugs, ni la compatibilité tactile sur du matériel physique, ni toutes les longueurs possibles d'une run.
