# KI ARENA V22 — état vérifié

La livraison est une version jouable enrichie, pas une certification de qualité finale. Les limites ci-dessous restent ouvertes.

| Sous-système | État | Preuve |
|---|---|---|
| regression_courante | **PASS** | npm run test:release — qa/v22/release-all.log |
| draft_et_budgets | **PASS** | 28 tests V22 : 15 combinaisons d’univers, 2700 rencontres sur 60 difficultés, exactitude du budget et fenêtres de draft. |
| recompenses_et_marchand | **PASS** | tests/test-v22.mjs ; parcours navigateur naturel + fixture marchand. |
| reliques_et_evenements | **PASS** | 28 reliques, 16 événements ; exécution des hooks testée, aucun cumul de récompenses. |
| auto_et_replay | **PASS** | Parcours naturel jusqu’à la défaite et replay ; tests réserve, codec et absence de gains. |
| random_et_persistance | **PASS** | crypto live ; offres et résultats persistés ; clés V22 séparées. |
| simulations | **PASS** | 1000 parties, 4 profils, 15 pools, 3944 combats, zéro exception ; qa/v22/simulation-1000.json |
| responsive | **PASS** | Navigateur desktop et iframe du jeu réel 390/768 : clientWidth = scrollWidth. Captures qa/v22/captures/ |
| assets_proteges | **PASS** | npm run verify:package — 4942 empreintes ; tous les assets V21 et 4 modules protégés. |
| equilibrage | **FAIL** | 20 passages de l’acte 1 sur 1000 parties de bots simples ; aucune validation d’équilibrage humain. Formule verrouillée conservée. |
| portraits_finaux | **FAIL** | Catalogue hérité : 3022 cartes, 7 portraits exacts revus, 43 partagés revus, 2632 non revus, 340 placeholders. Les pictogrammes armes sont honnêtes, pas des illustrations canoniques. |
| historique_npm_test | **FAIL** | npm test : 8 réussites, 3 échecs V20 déjà présents avant V22 ; qa/v22/historical-npm-test.log. La commande reste rouge. |
| windows_natif | **BLOCKED** | Environnement Linux ; .bat fourni, lancement sur Windows non exécuté. |
| double_clic_file | **BLOCKED** | file:// non autorisé dans ce navigateur. HTML inspecté intégralement ; exécution HTTP testée séparément. |
| audio_ecoute | **BLOCKED** | Routage audio/mute/rareté testé ; pas d’écoute humaine certifiée ni test matériel tactile. |

`npm run check:release` doit terminer avec le code 2 tant que les FAIL/BLOCKED subsistent. `npm run verify:package` contrôle uniquement l’intégrité technique et doit terminer avec 0. Le reçu ZIP externe contient sa taille, son SHA256 et le contrôle CRC + SHA de chaque fichier.

HTML autonome via HTTP : **PASS** — menu, Solo et reprise événement observés ; largeur 1363/1363. Cela ne valide pas file://.
