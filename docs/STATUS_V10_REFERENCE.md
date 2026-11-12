# STATUS_V9 — Arène 10.0.0 / 24 octobre 2026

La dernière demande est réalisée dans un nouveau parcours de cinq cartes automatiques. Les modes précédents restent distincts. **La complétude artistique n’est pas acquise : portraits et OST externes manquent.**

| Sous-système | État | Preuve / limite |
|---|---|---|
| Snapshot et fichiers historiques | **PASS** | BACKUP_V8/PRE_V10_HANDOFF_ORIGINAL.zip ; PRE_V10_HASHES.json ; npm test |
| 600 cartes DB / moteur / finitions | **PASS** | Hashes exacts de src/app.js, battle.js, catalog.js, CSS et CSV ; contrôle historique de 689 fichiers |
| Quatre catalogues, 15 combinaisons, N dynamique | **PASS** | 600 DB + 532 HXH + 313 Naruto + 1577 OP ; tests/test-arena.mjs |
| Normalisation proportionnelle top 5% | **PASS** | Courbe commune ; test écart discret <1,5% ; invariance en ajoutant un univers |
| Draft 5 personnages + 3 armes, trois offres | **PASS** | Tests dans les 15 combinaisons ; aucune main dans Arène |
| Cinq actifs / réserve / équipement avant combat | **PASS** | Tests slots, compatibilité et exclusivité ; items-*.png |
| Graphe réel / carte globale / boss | **PASS** | Tests de chemins ; global-map-*.png ; quatre boss joués puis acte suivant |
| Budgets exacts et continuation au-delà de 20 | **PASS** | 2 700 rencontres réelles jusqu’à 60 vagues + 2 700 000 distributions sur 1000 seeds |
| Combat auto de cartes / pause / x2 / passer | **PASS** | qa/v10/browser.json ; combat-*.png ; commandes stables pendant la lecture |
| KO / soins / XP / récompense unique | **PASS** | Tests de survie, réserve sans XP et idempotence ; récompenses saturées corrigées |
| Marchand / soin / anti-farm | **PASS** | Tests achats et services uniques ; objets utilisables uniquement |
| Tous les items proposés | **PASS** | 95 lignes OK exécutées ; 163 lignes recensées dans LISTE_ITEMS_IMPLEMENTES.csv |
| Nen personnel / contamination entre catalogues | **PASS** | Exclusions motivées ; CSV source intacte ; aucune capacité personnelle en loot transférable |
| Sauvegardes / migration / reprise | **PASS** | Clés séparées ; anciens bytes préservés ; export/import ; version et hash du pool figés |
| Cinq mini-jeux et Auto 5 choisi | **PASS** | qa/v10/browser.json : cinq modes joués à 390/768/1360 |
| Responsive / carrousels / navigation clavier | **PASS** | Aucun débordement horizontal du document ; M, Escape, focus visible ; réduction des mouvements testée |
| Import des portraits et de l’audio | **PASS** | qa/v10/browser.json : persistance après rechargement ; icône et son de test, pas portraits officiels |
| Musiques originales des œuvres incluses | **BLOCKED** | Aucune OST dans le handoff. Import local et volumes fonctionnels, musique 5% par défaut. |
| Portraits HXH/Naruto/One Piece complets | **BLOCKED** | HANDOFF_IA.md : dossiers externes non transmis. Monogrammes explicites et import local. |
| 600 SVG DB fournis | **PASS** | Illustrations source conservées ; portraits réels importés prioritaires |
| Tests V8/V9 + Python + Arène | **PASS** | qa/v10/all-tests.log ; python-final.log : 12 tests ; arena-tests.log : 19 blocs |
| HTML autonome sans serveur | **PASS** | file:// testé : draft complet, combat, récompense et accès aux modes historiques ; zéro requête HTTP |
| Lanceur et serveur Windows | **PASS** | LANCER_SUR_PC_WINDOWS.bat ; npm start ; aucune dépendance npm pour jouer |
| Exécution native Windows | **BLOCKED** | Environnement de validation Linux/Chromium ; le .bat est fourni mais non exécuté sur Windows. |
| Linéarité parfaite des taux de victoire | **BLOCKED** | Non démontrée : effets, soins et équipements non linéaires. Aucun budget falsifié. |
| ZIP / manifeste / restauration | **PASS** | scripts/package_arena.py ; FILE_MANIFEST_SHA256.json ; reçu VERIFICATION_ZIP_V10.json extérieur |

Aucun pourcentage global de complétude annoncé. Les exclusions et blocages restent visibles.
