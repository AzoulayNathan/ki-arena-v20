# KI ARENA V20 — HORIZONS

Version locale reconstruite, interface illustrée et corrections V20. Le système de boss et les cartes collectionnables restent conservés. Consulte STATUS_V20.md pour les limites de validation.

## Jouer

1. Extraire complètement le ZIP dans un dossier.
2. Ouvrir LANCER_SUR_PC_WINDOWS.bat, ou JOUER_KI_ARENA_V19.html.
3. Choisir un univers sur l’accueil, puis l’expédition ou un autre jeu.

Le nom du HTML reste celui de la distribution précédente pour limiter les changements de chemin. Son contenu est bien V20. Le double-clic Windows n’a pas été vérifié sur une machine Windows dans cette livraison. Un déplacement ou changement de navigateur peut changer l’espace de sauvegarde : exporter la run et le Panthéon avant de déplacer des fichiers.

Pour jouer avec le serveur local si Node 18+ est installé : `npm start`. Adresse : http://127.0.0.1:4173. Aucune installation de dépendance npm n’est nécessaire. Refaire le HTML : `npm run build:offline` avec Python 3.

## Découvrir

- Recrutement : six choix, deux propositions visibles et une mystère ; au moins trois personnages.
- Préparation : ouvrir le sac, choisir une arme puis son porteur. Le glisser est facultatif. Les deux premières places forment l’avant-garde.
- Combat automatique : pause, vitesse ×2 et passage. Une défaite clôt la run, même avec une réserve vivante.
- Carte complète : bouton Carte ou M. F8 après accès créateur pour les calculs.
- Réglages → Accès créateur → code **N**. C’est un outil local de confort, pas une authentification.
- Collection : recherche, univers, rareté, finition, favoris et formes. Les cartes non acquises restent grisées.

## Aperçus réels

![Accueil](qa/v20/browser/01-accueil-1360.jpg)
![Carte](qa/v20/browser/02-carte-1360.jpg)
![Combat](qa/v20/browser/04-combat.jpg)
![Mobile](qa/v20/browser/11-draft-390.jpg)

Les captures 390/768 sont prises dans une fenêtre de recette de largeur contrôlée ; ce ne sont pas des tests sur téléphone physique. Le Panthéon de démonstration a été importé depuis une simulation réelle, conservée dans qa/v20/fixtures.

## Vérifier et reconstruire

- `npm test` : tests V20 et toutes les suites de régression du projet.
- `npm run simulate:v20` : 1 000 runs, quatre politiques ; retourne 2 si aucune ne termine l’acte.
- `npm run build:offline` puis `npm run verify:package` : construction et intégrité du HTML/ressources.
- `npm run package` : archive complète, CRC et comparaison de chaque fichier.

Restent à finir : portraits canoniques manquants/provisoires, calibration humaine, tactile physique, validation Windows hors serveur. La formule de difficulté est exacte mais la campagne automatique reste trop punitive ; ce point n’est pas masqué.

## Restauration V19.3

Exporter les sauvegardes avant toute manipulation. BACKUP_V193 contient les sources d’origine, index.html, package.json, build_preview.py et HASHES.json. Dans une copie du projet, remettre ces fichiers à la racine puis exécuter `python build_preview.py`. Les données/assets historiques étant inchangés, cela rétablit l’entrée V19.3. Les nouvelles clés V20 ne remplacent pas les clés V19. Ne pas effacer les données du navigateur.
