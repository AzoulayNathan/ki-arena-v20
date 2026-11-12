# État · KI ARENA V16 Horizons

5 novembre 2026. Base : ZIP V15 livré précédemment, SHA256 `9d3c4e698aa7bcc7e4ed902988a8e8eaa5322914ef90eee7ec2b5951810db2d6`. Périmètre : qualité des pages et nouveau recrutement solo, sans modification des cartes ou des moteurs de combat.

| Sous-système | État | Preuve |
|---|---|---|
| Accueil, quatre univers, thème et choix mémorisé | PASS | `qa/v16/menu/browser.json`, 390/768/1360 |
| Trois grands choix, rotation lente, pause, navigation | PASS | `carousel/browser.json`, géométrie et arrêt au survol/focus |
| Seize entrées vers leurs vrais modes | PASS | `carousel/browser.json`, manga sélectionné transmis |
| Préparation des mondes solo et arcade | PASS | `pages/browser.json`, quatre univers et fusion aux trois tailles |
| Refonte arcade, jeux entre amis, collection et modales | PASS | `full`, `party`, `pages`, `extras` : captures et interactions réelles |
| Six nouveaux décors locaux, 824 assets intègres | PASS | `new-assets.json`, manifeste complet, décodage et SHA256 |
| Nouveau draft mixte en six tours | PASS | `tests/test-v16.mjs`, `simulation.json` : 1 500 drafts |
| Deux offres personnages / une arme, deux visibles / mystère | PASS | 27 000 propositions contrôlées, tirage mis en cache |
| Bandes de rangs exactes et sans élargissement | PASS | audit V15 avant modification ; tests et 24 632 offres actives V16 |
| Composition jouable, identité unique, armes compatibles | PASS | 15 combinaisons d’univers, quatre stratégies de sélection |
| Anciennes runs V15 en huit étapes conservées | PASS | `pages/browser.json`, reprise réelle après import ; tests des clés séparées |
| Règles de difficulté et N des univers fusionnés | PASS | 270 000 rencontres, vagues 1–60 ; budget exact et nombre d’ennemis |
| Historique V15 reproduit | PASS | 240 drafts et 5 040 rencontres identiques au golden pré-modification |
| Cartes, données, finitions, assets et moteurs historiques | PASS | `PRE_V16_HASHES.json` : 915 fichiers de référence, six exceptions explicites |
| Inventaire, équipement, réserve, événements et carte globale | PASS | `full/browser.json` ; clic et glisser-déposer, double choix rejeté |
| Huit mini-jeux menés au résultat | PASS | `full` et `extras`, reprise et sauvegardes séparées |
| Enchères, quatre jeux entre amis, tournoi et préférences | PASS | `party/browser.json`, 390/768/1360 et HTML autonome |
| Effets et K.O. réellement joués | PASS | `effects/browser.json`, captures des événements de combat |
| Acte I gagné puis acte II et Panthéon sans injection | PASS | `natural/browser.json`, seed PROFILE-210 |
| Simulations de gameplay | PASS | 1 000 seeds, 5 044 combats, trois profils, zéro erreur de parcours |
| Tests actuels et suites V8 | PASS | `final-tests.log` : 87 tests JS, contrôles items et suites V8 |
| Onze rapports liés au code et au HTML livré | PASS | `verify_v16.py`, comparaison des empreintes |
| HTML autonome sans réseau ni serveur | PASS | `full`, `extras`, `party`, `media` : parcours `file://` |
| ZIP, extraction, reconstruction et patch | PASS | `package_v16.py`, reçu externe `VERIFICATION_ZIP_V16.json` |
| Windows natif | BLOCKED | Environnement Linux ; lanceur CRLF contrôlé, pas de PC Windows de recette |
| Portraits et musiques originales absents des sources | BLOCKED | Limite héritée ; substitutions typographiques explicites, import local conservé |
| Douze tests Python de référence | BLOCKED | `reference-python-status.json` ; pack absent du ZIP V15 reçu |

La difficulté mathématique reste la référence. Elle ne garantit pas une progression parfaite des taux de victoire : capacités, composition, équipement et décisions créent des écarts. Les simulations n’ont servi à modifier ni les statistiques ni la formule. Les captures d’actes 2–6 et certains événements utilisent des fixtures annoncées ; le parcours naturel prouve séparément une victoire de boss.

Les six exceptions au hash sont les deux UI, l’accueil V15, l’index d’assets généré, le routeur de draft dans le moteur Arène et le stockage versionné. Les moteurs `src/battle.js` et `src/arena/battle.js` restent identiques. Les anciennes règles sont protégées par les goldens et restent sélectionnées lors de la reprise.
