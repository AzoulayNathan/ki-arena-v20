# KI ARENA 21.1 — état vérifié

Version intégrée et jouable. Validation finale non acquise pour les critères FAIL/BLOCKED.

| Sous-système | État | Preuve / limite |
|---|---|---|
| sources_protegees | PASS | tests/test-v21.mjs ; qa/v21/protected-before.json : 4 912 assets originaux et 4 modules inchangés |
| moteur_v21 | PASS | 32 tests distincts : 30 dans release-all.log, puis 12 ciblés dont deux nouveaux tests de cache dans final-finition-tests.log. |
| v8 | PASS | Suite V8 complète ; qa/v21/finish/release-all.log |
| items_historiques | PASS | 163 entrées, 95 actives, 68 exclues ; qa/v21/finish/release-all.log |
| python_reference | PASS | 12 tests Python ; qa/v21/finish/release-all.log |
| budgets_courants | PASS | 2 700 rencontres solo, 60 difficultés × 15 pools × 3 types ; coefficient courant 0,5625 conservé. Référence historique rétablie, testée séparément. |
| simulations_execution | PASS | 1 000 seeds, 4 politiques, 15 pools, zéro exception ; qa/v21/simulation-1000.json |
| equilibrage | FAIL | Simulation 1 000 seeds : zéro exception, 21 actes franchis. Pas un taux humain ; statistiques brutes et boss courants conservés. |
| portraits_finis | FAIL | 21 visuels contrôlés couvrent 7 ID exacts et 43 références partagées. 340 placeholders, 2 632 sources non certifiées. AUDIT_IMAGES_V211.csv |
| interface_parcours_verifies | PASS | V21.1 : huit choix, inspection, arme +16 %, carte globale, combat, pause, victoire, récompense, bilan et Panthéon ; captures V21.1 |
| responsive_conteneurs | PASS | Conteneurs 390 et 768 : scrollWidth=clientWidth ; desktop 1360 (surface utile 1345). Tests clavier par Entrée. Téléphones physiques non testés. |
| mini_jeux_et_tous_sous_menus | BLOCKED | Moteurs des mini-jeux testés. Aucun audit manuel exhaustif de tous les écrans et appareils. |
| html_integrite | PASS | 4 938 fichiers embarqués ; payloads et sources protégées vérifiés par scripts/verify_v21.py --integrity |
| html_execution_autonome | BLOCKED | file:// a été refusé par la politique du navigateur de test ; aucun contournement. Le test HTTP ne certifie pas le double-clic Windows. |
| windows_natif | BLOCKED | Aucun Windows natif accessible ; lanceur fourni, codes d’erreur corrigés. |
| regressions_globales | FAIL | Suites historiques toujours rouges ; détails dans qa/v21/finish/historical-results.json. Tests et assertions archivés conservés. |
| replays_longs | PASS | 1 261 événements sans troncature ; 4 125 106 → 320 849 caractères sans perte ; replay-size.json |
| arcade_moteurs | PASS | Draft Budget, Auto 5, Coupe sur 15 pools ; paires/intrus/relais terminés ; enchères/tournois à 2–4 ; tests/test-v21-finition.mjs |
| html_execution_http | PASS | L’HTML autonome reconstruit démarre par HTTP ; parcours de jeu exécuté, 27 images chargées sans URL d’image externe sur la scène de contrôle. |
| cache_local | PASS | HTML en réseau prioritaire, repli cache, conservation des caches des autres applications ; tests VM du service worker. |

`npm run verify:package` contrôle l’intégrité ; `npm run check:release` renvoie 2 tant que les limites restent ouvertes. `npm test` reste en échec dans certaines suites historiques.
