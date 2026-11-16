> Édition actuelle : voir RAPPORT_QA_V193.md et STATUS_V193.md. Le rapport ci-dessous est historique.

# Recette V18

Baseline V17 : `qa/baseline-v18.log` ; `npm test` exécuté avant modification, code 0. Empreintes avant modification : `PRE_V18_HASHES.json`. Six fichiers modifiés préservés dans `BACKUP_V17/FILES/`.

Validation finale : `npm test` = nouveau test de protection V18 + 92 tests Node existants, vérification des items et suites V8 (tous passent). La simulation des 1500 drafts et les 2700 budgets sur 60 profondeurs / 15 pools sont rejoués par les tests V17, sans modifier leurs règles.

Huit recettes navigateur sont incluses. Leurs rapports sont dans `qa/v18/` : base, components, games, party, extras, media, encounters et model. Chaque recette échoue avec code non nul si une assertion échoue. Les sept recettes du jeu enregistrent l’empreinte du runtime et du HTML autonome, contrôlée avant livraison par `verify_v18.py`.

Les largeurs 390, 768 et 1360 sont vérifiées pour le jeu : menus principaux et secondaires, réglages, collection et filtres, inventaire et assignation réelle, réserve, carte, événements, marchand, repos, trésor, mini-jeux et résultats, enchères/tournoi/dilemmes, bilan et Panthéon. Les captures sont de vraies captures Chromium de l’application. Le modèle indépendant est vérifié à 390 et 1360, avec un fanart généré pour cette maquette uniquement ; aucun portrait du jeu n’est remplacé.

Les actes 2–6 et certains événements sont ouverts par des sauvegardes de QA construites via les fonctions du moteur ; ils ne démontrent pas qu’une run réelle peut franchir l’acte I. Les soins, achats, décisions et contributions affichées proviennent ensuite des opérations du moteur. Les imports de portraits utilisent deux icônes KI temporaires uniquement dans le navigateur de test, sans les incorporer au catalogue.

Le HTML `file://` est testé hors ligne : draft, combat, récompense, reprise, jeu de mémoire et enchères ; la lecture naturelle des combats rejoint aussi le résultat sans utiliser le bouton de saut. Les imports médias, volumes, finitions, sauvegardes et retour au moteur historique sont vérifiés. Le modèle ne fait aucun appel réseau.

Le paquet est créé à partir des mêmes octets que le manifeste SHA-256, vérifié CRC, extrait, contrôlé fichier par fichier, reconstruit en HTML identique puis retesté. Le reçu `VERIFICATION_ZIP_V18.json` accompagne le téléchargement.

Limites assumées : pas de recette Windows native, pas de nouvelle refonte du moteur historique V8, équilibrage de l’aventure toujours non validé, portraits et OST manquants toujours absents, pack original Python non disponible. Les listes déroulantes gardent leur menu natif. L’étude de carte est une maquette de présentation ; les démonstrations KO/capacité ne sont pas un nouveau moteur de combat.
