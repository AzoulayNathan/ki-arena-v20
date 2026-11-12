# KI ARENA V17 · État vérifié

5 novembre 2026. Base : V16 Horizons, archive SHA256 `b1b81273d6f340dbc88ff0edda83a1a59df6b5ca0bb5c3e4d836e29179b71c8a`.

| Élément | État | Preuve |
|---|---|---|
| Accueil clavier, Entrée, Solo fixe et jeux glissants | PASS | `qa/v17/browser.json`, essais 390/768/1360 et mouvement réel |
| Images cliquables, grandes icônes, pied de page retiré de l’accueil | PASS | captures `home-*` |
| Préparation solo et Arcade simplifiées | PASS | captures `setup-*`, `arcade-*`, vrais lancements |
| Draft global corrigé : référence 600, bas du pool fusionné | PASS | `tests/test-v17.mjs`, exemples 600/1200/3022 |
| Tirages des types 30% arme / 70% personnage | PASS | 27 000 tirages, 29,696% de tirages arme ; sans quota fixe par tour |
| Pas de personnage légendaire initial dans les pools actuels | PASS | 1 500 drafts, 15 combinaisons, zéro légendaire |
| Six sélections, reprise et absence de blocage | PASS | simulation + parcours réel et reprise `file://` |
| Contraintes de compatibilité et garde-fous | PASS | une arme doit avoir un porteur ; au moins un personnage au départ |
| Récompenses illustrées, victoire et défaite | PASS | captures réelles, contrôle de la phase moteur |
| Sons locaux de résultat et récompense | PASS | WAV décodables ; lecture réelle des sons victoire/défaite résolue et volume respecté |
| F8 : diagnostic sans modification de la run | PASS | contrôle du RNG avant/après, rangs et calculs réels |
| Difficulté adverse exacte inchangée | PASS | 2 700 rencontres, 60 profondeurs et 15 pools |
| Cartes, finitions, données, moteurs et anciens drafts | PASS | snapshot `PRE_V17_HASHES.json`, 92 tests JS + suites V8 + contrôles items |
| Assets locaux et HTML autonome | PASS | 828 assets contrôlés, navigateur hors connexion |
| ZIP et patch | PASS | reçu externe `VERIFICATION_ZIP_V17.json`, extraction, tests et reconstruction identique |
| Équilibrage global après le départ affaibli | FAIL | 0 acte I franchi dans chacun des deux échantillons automatiques de 1 000 seeds ; voir rapport |
| Windows natif | BLOCKED | Recette sous Linux ; `.bat` CRLF contrôlé, exécution Windows non revendiquée |
| Portraits et OST absents des sources | BLOCKED | Imports locaux conservés ; aucune illustration de personnage inventée |
| Pack Python de référence | BLOCKED | Absent de la V16 fournie, limite héritée |

La formule adverse demandée reste `round(N/4 × (profondeur + bonus))`. La correction du draft enlève l’avantage initial involontaire. Les parcours automatisés montrent une difficulté globale très sévère ; cela ne démontre pas une impossibilité mathématique, mais interdit de déclarer l’équilibrage validé. Aucun multiplicateur caché ni modification des statistiques protégées n’a été ajouté pour masquer ce résultat.

Les règles de récompense, de recrutement et de progression restent celles du moteur existant. Les données des anciennes runs sont conservées. Pour tester le départ corrigé, créer une **nouvelle aventure V17** ; reprendre une ancienne run conserve sa version de règles.
