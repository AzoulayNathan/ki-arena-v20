# Plan de réalisation V9 — ordre de priorité

## P0 — Préserver

1. Baseline des deux moteurs et des données ; construire cartes de dépendances ; figer un rollback.
2. Séparer les modes et les namespaces de sauvegarde. Ne pas toucher au système de collection historique.
3. Préparer des fixtures DB/HXH, catalogue items et status exclusions.

## P1 — Survivre sans bugs

1. Implémenter le générateur de rangs, les budgets exacts et le draft seedé.
2. État unique de run + transitions sûres, terrain trois places, main/pioche/pose, mini-deck adverse.
3. Adaptateur combat, effets d'items et KO, progression XP, récompenses, persistance idempotente.
4. 60 vagues de tests + checks anti-mélange + simulations.

## P2 — Interface jouable

1. Choix univers et draft visuel 5+3, mystère authentique.
2. Exploration fidèle aux trois chemins V8, écran pré-combat et pose d'unités.
3. Main, deck, équipement et effets actifs toujours lisibles ; récompense trois choix.
4. Merchant/Rest/Inventory/Recrutement/Defeat complets. Navigation souris/clavier/tactile.

## P3 — Polish visuel prioritaire

1. Produire/remplacer les **six biomes HD** dans un style DB homogène.
2. Grande carte + chemins + trois grosses cartes révélées, tiroir bas soigné, boutons premium.
3. Art d'items/rencontres et transitions utiles ; effets spéciaux liés aux résultats réels.
4. Mobile natif, perf, reduced-motion, son discret.

## P4 — Qualification finale

1. Relancer toutes suites existantes, nouvelles suites, simulations longues et tests reprenant sauvegardes V8.
2. Captures réelles et tests 390/768/1360, interactions, aucune erreur JS, vérification PC Windows offline.
3. Générer HTML autonome et nouveau ZIP ; valider leur contenu et les chemins relatifs.
4. Remplir PASS/FAIL/BLOCKED sans ambiguïté ; livrer le journal, les différences et les limites.

**Ne pas annoncer une version finale si P1, P2 ou P4 n'est pas prouvé.** Une animation réussie ne remplace pas les tests.
