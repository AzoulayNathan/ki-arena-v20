# KI ARENA V7 — Rapport de qualification visuelle et fonctionnelle

## Résultats vérifiés dans cette livraison

- La suite `npm test` V6 complète passe après la refonte V7 (63 tests/familles annoncés par la V6; voir les logs pour le détail des groupes).
- **Parcours navigateur sur 1360×900, 768×1024 et 390×844** : création de run à partir de cartes possédées, trois destinations actives, navigation sur un nœud réel, pré-combat/entrée dans l'arène, lecture accélérée vers le résultat, retour et choix de butin ou événement selon le seed.
- **14 états visuels ciblés** répartis entre 1360 et 390 px : lancement sans run, butin, marchand, repos, trésor, boss, inventaire ouvert. **Aucun débordement horizontal ni erreur JS observés**.
- Actions réellement testées : gain d'un objet via choix du butin, achat d'objet avec déduction des zénis, utilisation du repos puis retour sur la carte, validation de choix d'événement.
- Correctifs trouvés et vérifiés en audit navigateur : fermeture HTML manquante dans les vignettes adverses (désormais réparée), mot d'ambiance géant superposé au décor (désormais petit), portrait d'attaque live hors de son conteneur (ancrage local CSS).
- Le jeu autonome contient **654 chemins d'assets embarqués** (dont les décors V7), sans ressource requise sur un serveur distant pour la fonction de jeu.
- Les données et les templates de cartes n'ont pas été modifiés par la refonte.

## Captures réelles fournies

`v7_exploration_1360.png`, `v7_exploration_390.png`, `v7_before_combat_1360.png`, `v7_combat_1360.png`, `v7_event_390.png` et captures des écrans `boss`, `butin`, `marchand`, `repos`, `tresor`, `inventaire`, `accueil` aux formats de test lorsque possibles.

Les captures des scènes inhabituelles (boss, marchand, butin, etc.) ont été réalisées en plaçant intentionnellement une run de QA dans cet état pour inspecter son rendu. Ce ne sont pas des preuves d'un parcours joueur intégral jusqu'à chacun de ces écrans.

## Limites et réserves honnêtes

- **Pas de longue campagne de jeu humaine 2–3 h**, de test tactile sur téléphone réel, ni de mesure FPS exhaustive en mode ×8.
- Le bug de reprise après fermeture/réouverture pendant un combat, déjà signalé dans l'audit V6, **n'a pas fait l'objet d'une validation exhaustive** ici. Le code V6 est conservé mais cette preuve manque.
- Les illustrations de cartes stylisées/proxies restent celles du catalogue V5.2, conformément à la consigne. Le projet n'améliore pas leur fidélité ou couverture.
- Le moteur de difficulté linéaire V6 reste inchangé : la progression statistique linéaire n'implique pas une probabilité de victoire constante.
- Les animations visuelles existantes ont été améliorées par des couches CSS et non remplacées par un moteur d'animation spécialisé; toutes les catégories d'effets n'ont pas de cinématique unique.
- Le projet est fan-made non officiel, sans validation de droits de distribution commerciale des images et personnages d'origine.
