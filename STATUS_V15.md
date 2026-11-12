# État · KI ARENA V15 Horizons

5 novembre 2026. Périmètre : refonte visuelle de la V14, avec trois défis visuels facultatifs. Les règles et formats des modes existants restent V14.

| Élément | État | Preuve |
|---|---|---|
| Accueil titre / sous-titre / quatre univers | PASS | menu/browser.json, 390/768/1360 |
| Carrousel en boucle, balayage et clavier | PASS | menu/browser.json ; préférence et choix initial conservés |
| Quatre thèmes coordonnés | PASS | captures menu DB/HXH/NARUTO/ONEPIECE aux trois tailles |
| Douze nouvelles illustrations locales | PASS | new-assets.json ; manifeste de 818 assets ; rasters décodés |
| Écriture légère et progression visuelle | PASS | tests V15 ; captures de carte, boss et acte suivant |
| Cadrage des combats et santé au-dessus du sac | PASS | smoke.json : géométrie contrôlée aux trois tailles |
| Cinq cartes visibles dans les matchs entre amis | PASS | party/browser.json, géométrie et parcours réels |
| Inventaire, rencontres, arcade et mini-combats | PASS | full/browser.json ; cinq jeux solo terminés |
| Trois nouveaux défis visuels, résultat et reprise | PASS | extras/browser.json ; tests unitaires ; sauvegarde isolée |
| Capacités et K.O. réellement joués | PASS | effects/browser.json, 1360 et 390 |
| Parcours naturel jusqu’au boss puis acte suivant | PASS | natural/browser.json, sans injection d’état |
| Imports et application historique | PASS | media/browser.json, serveur et fichier autonome |
| Cartes, données, finitions, moteurs et règles conservés | PASS | PRE_V15_HASHES.json : 897 fichiers, seules 2 UI et l’index généré sont autorisés à différer |
| Tests actuels et suite V8 | PASS | final-tests.log : 78 tests JS, contrôles d’objets puis suite V8 |
| Huit rapports liés au runtime et au HTML actuels | PASS | verify_v15.py compare leurs SHA256 au code livré |
| HTML autonome sans serveur | PASS | parcours file:// dans full, extras, party et media |
| ZIP complet / patch / extraction / reconstruction | PASS | VERIFICATION_ZIP_V15.json livré à côté, contrôles du script de livraison |
| Windows natif | BLOCKED | Environnement Linux ; .bat contrôlé, pas de PC Windows de recette |
| Portraits officiels et OST absents de la V14 | BLOCKED | Non fournis ; aucun ajout fictif, fallbacks et imports V14 préservés |
| Pack Python historique absent | BLOCKED | Limite héritée de la V14, hors refonte visuelle |

Le signal de pression est une traduction visuelle de la progression, pas une nouvelle formule de difficulté. Les décors et textes sont éditoriaux, les six thèmes de chapitre cycliques. Les captures d’actes 2–6 du script complet utilisent des états de recette annoncés ; le parcours natural prouve séparément un acte gagné sans injection.

Le patch refuse une base différente de la V14 attendue. Aucun fichier de sauvegarde du navigateur n’est modifié par son applicateur. Les limites détaillées de la V14 restent archivées dans STATUS_V14.md.
