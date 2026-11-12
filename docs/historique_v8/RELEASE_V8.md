# KI ARENA — ROGUE ONE V8 • GRAND VOYAGE ARCADE

## Objectif
Refonte **visuelle et ergonomique** du Roguelike V7, directement dans le projet existant. Les cartes, catalogue, stats, moteur de combat, calcul de difficulté et autres modes sont préservés.

## Changements réellement réalisés
- Écran d'exploration remplacé par un grand décor illustré, avec 3 embranchements réels issus du graphe V6, un marqueur joueur et une animation de révélation en séquence (avance de caméra → dessin des chemins → apparition des marqueurs → apparition des cartes).
- Grandes cartes de destination avec illustration réutilisée des assets locaux, type, description, danger et récompenses potentielles ; blocage des routes réellement inaccessibles.
- Mobile : cartes de destination grand format, balayage horizontal avec scroll-snap et aperçu de la carte suivante. Desktop : trois choix côte à côte. En cas de boss, une carte centrale.
- Carte complète toujours accessible dans un accordéon secondaire (les choix ne sont jamais re-générés pour la présentation).
- Équipe et sac/reliques déplacés sous le monde, dans un seul panneau inférieur repliable, avec aperçu des cinq combattants, en conservant les contrôles de gestion originaux.
- HUD mobile corrigé pour afficher toutes les ressources, sans écrêtement horizontal.
- Prise en charge de `prefers-reduced-motion`.
- La présentation utilise le décor Dragon Ball déjà présent `sky-realm.webp`, les artworks locaux du combat et les décors de biomes préexistants. L'apparence des 600 cartes n'est pas modifiée.

## Pour lancer
- Ouvrir `KI_ARENA_ROGUEONE_V8_JOUER.html` dans Chrome/Edge, y compris sans connexion ; aucun serveur indispensable.
- Pour la version source : ouvrir `index.html` avec un serveur local (modules ES). Exécuter `npm test` pour la non-régression et `python build_preview.py` pour régénérer l'HTML autonome.

## Contrôles et limites
- Les tests existants (`npm test`) passent.
- Comparaison binaire avec V7 : fichiers `src/battle.js`, `src/catalog.js`, `src/roguelike.js`, `src/v52.css`, `data/cartes_complet.csv` strictement inchangés.
- Navigateur Chromium en HTML embarqué : lancement d'une run, présence des choix de carte, accès à l'inventaire, sélection d'une rencontre. Captures 1360 px et 390 px ; aucune erreur JavaScript observée sur les parcours vérifiés. Absence de débordement horizontal observée à 390 et 768 px.
- **Limites :** les fonds illustrés reposent pour le moment sur les assets locaux existants, dont certains sont flous et mériteraient un remplacement artistique 2D haute résolution. Les longues sessions, la reprise après fermeture en plein combat et les performances sur smartphones réels ne sont pas certifiées. Ne pas qualifier ceci de version commercialement finalisée.
