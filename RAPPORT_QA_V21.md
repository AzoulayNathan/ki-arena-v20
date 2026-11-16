# KI ARENA 21.1 — rapport de vérification

Version de travail corrigée et reconstruite. Elle n’est pas certifiée « finale » ou « 9/10 ». La collection d’images et l’équilibrage restent les limites principales, avec la compatibilité historique globale et le double-clic Windows.

## Corrections intégrées

Voir CHANGELOG_V21_1.md. L’assembleur HTML ne boucle plus entre cartes et packs. Les données binaires sont isolées du code exécuté, dédupliquées et converties en Blob à la demande. Le journal V21 ne coupe plus après 1 100 événements et sa sauvegarde est mutualisée sans perte. L’attribution du DOT et de l’absorption au bilan est corrigée. Les souvenirs conservent la version du combat et utilisent les mêmes cartes composées.

La référence Survie historique retrouve `round(N/4 × (v+t))`. Le solo courant conserve son coefficient 0,5625 dans un module séparé et son prestige. Les rencontres déjà sauvegardées restent acceptées. Les boss et les statistiques brutes n’ont pas été rééquilibrés arbitrairement.

PV de combat agrandis, arme déplacée pour ne pas les recouvrir, zone d’illustration dégagée et texte du panneau de packs contrasté. Changer d’écran revient en haut ; les modales et les filtres conservent la position. Quatre décors de combat suivent les univers sélectionnés.

## Vérification automatique

- `npm run test:release` : PASS. 30 tests V21/correctifs/finition, 21 tests Survie, suites V8, vérification des objets et 12 tests Python. Journal : qa/v21/finish/release-all.log.
- Après la correction de priorité des portraits importés et du cache : douze tests de finition repassés, dont deux nouveaux tests de cache et la cohérence image/carte/miniature. Cela représente 32 tests V21 distincts. Journal : final-finition-tests.log.
- 4 912 assets originaux et quatre modules protégés : mêmes SHA-256. Données, illustrations d’origine et moteur V8 conservés.
- 2 700 rencontres solo : budgets et somme exacte des rangs, univers sélectionnés, 60 difficultés et 15 pools. Référence historique vérifiée séparément, y compris les paliers 18/19/20/21.
- Replay de 1 261 événements : 4 125 106 → 320 849 caractères, soit 92,2 % de réduction, sans troncature ni mutation ; round-trip identique, index forgé rejeté.
- Sauvegarde/import nouveaux et anciens, fin sur défaite avec sept membres dont réserves, Panthéon idempotent et cartes de bilan testés.
- Mini-jeux : Draft Budget, Auto 5 et Coupe sur quinze pools ; mémoire/intrus/relais jusqu’à une fin ; modes entre amis à deux, trois et quatre joueurs, reprise et budgets bornés.

Les tests de coupe et de défaite incluent des fixtures contrôlées du résultat pour vérifier les transitions. Ils ne prouvent pas une difficulté naturelle ni un taux de victoire humain.

## Simulation d’équilibrage

1 000 seeds, quatre politiques et quinze combinaisons, statistiques brutes : zéro exception. Premier acte franchi par 21 équipes sur 1 000. Novice 0/250, puissance 8/250, synergie 9/250, risque 4/250. Ce sont des politiques automatiques simples ; la formule n’est pas falsifiée pour augmenter le résultat. Source : qa/v21/simulation-1000.json et finish/simulation.log. L’équilibrage n’est donc pas déclaré terminé.

## Images et décors

21 images réelles ont été collectées sur les sites Dragon Ball Official, NTV Hunter × Hunter et TV Tokyo Naruto, puis contrôlées visuellement avant publication. La provenance, le recadrage et les empreintes sont dans MANIFEST_PORTRAITS_COLLECTES_V211.csv. Cela ne confère aucune licence commerciale.

Sur les 3 022 fiches : 7 ID utilisent une correspondance exacte contrôlée ; 43 utilisent une référence de personnage partagée et signalée ; 340 restent en substitution ; 2 632 ont encore une source héritée non certifiée. Ce comptage ne signifie pas que les 2 632 sont incorrectes ou validées. Les 342 exclusions antérieures et deux nouvelles exclusions Sakura restent conservées sur disque. Le rendu moderne ne reprend pas les dessins SVG génériques comme portraits canoniques. AUDIT_IMAGES_V211.csv détaille chaque fiche.

Le collecteur facultatif ne prend pas le premier résultat d’une recherche. Il retélécharge uniquement les URL déjà contrôlées et refuse de publier une image dont les pixels ont changé. Les références partagées ne sont pas des illustrations nouvelles de chaque transformation.

Les quatre nouveaux décors proviennent d’un atlas original généré de 1 672 × 941 : panneaux d’environ 836 × 470, WebP. Ce ne sont pas quatre décors 4K. Les droits des assets hérités ne sont pas certifiés par cet inventaire.

## Contrôle navigateur

Le navigateur a été rétabli après une interruption de l’environnement. Parcours rejoué dans l’HTML assemblé : huit choix, inspection/recrutement, carte globale, attribution d’une arme (+16 %, ATQ 24 → 28), combat, pause, passage au résultat, victoire, choix unique, repli, bilan et Panthéon. Sur la scène de combat, les 27 balises image étaient chargées et leurs URL étaient locales Blob/data.

Les conteneurs 390 et 768 ont `scrollWidth = clientWidth` en combat. Le desktop est capturé dans un viewport de 1360, surface utile 1345. Navigation par Entrée utilisée dans le conteneur. Ce sont des tests de conteneurs, pas des téléphones physiques. Les captures V21.1 sont dans qa/v21/finish/captures. Les captures V21 plus anciennes restent des preuves datées distinctes.

Le son subjectif, le FPS sur appareils modestes, tous les mini-jeux et tous les sous-menus n’ont pas de certification exhaustive.

## Régressions historiques

Les attentes contradictoires des anciennes versions sont conservées. Des assertions portent sur les anciennes bandes/compositions du draft, des budgets et des hashes de sources modifiées avant cette livraison. Des écarts réels restent possibles. Elles ne sont pas toutes déclarées obsolètes. Les fixtures manquantes ont été rétablies depuis le ZIP V20, avec leurs empreintes ; les dossiers de sortie sont présents dans le ZIP.

| Suite historique | Réussis | Échecs | Journal |
|---|---:|---:|---|
| v19 | 16 | 2 | qa/v21/finish/historical-v19.log |
| arena | 15 | 4 | qa/v21/finish/historical-arena.log |
| v193 | 5 | 1 | qa/v21/finish/historical-v193.log |
| v17 | 86 | 6 | qa/v21/finish/historical-v17.log |
| v20 | 8 | 3 | qa/v21/finish/historical-v20.log |
| v18 | 0 | 1 | qa/v21/finish/historical-v18.log |

`npm test` est toujours rouge ; il n’a pas été remplacé par une commande qui masque ces échecs.

## HTML et livraison

Les 4 938 assets et les scripts embarqués sont vérifiés avec scripts/verify_v21.py --integrity. Le chargement HTTP de l’HTML final fonctionne maintenant. Le protocole file:// a été refusé par la politique du navigateur ; aucun contournement. L’absence de Windows natif empêche de certifier le double-clic Windows. Le lanceur privilégie le serveur local si Node est installé, sinon l’HTML. Il ouvre une URL de version pour éviter un ancien index en cache ; le service worker privilégie le serveur pour les documents HTML, garde un repli hors ligne et ne supprime pas les caches des autres applications. Ces branches sont testées avec un environnement VM.

Le ZIP est vérifié par CRC et par hash de chaque fichier. Sa taille et son SHA-256 sont dans VERIFICATION_ZIP_V21.json. Les sources, assets, tests, référence Python, snapshots et rapports sont présents, sans node_modules, dépôt Git ni caches.

`npm run check:release` reste volontairement à code 2 tant que des critères sont FAIL/BLOCKED. Les prochaines étapes sont les portraits par forme, l’équilibrage brut fondé sur le classement des personnages, les incompatibilités historiques et les tests Windows/appareils.
