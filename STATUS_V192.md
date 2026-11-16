# État V19.2

| Sous-système | État | Preuve |
|---|---|---|
| Ordre visuel ATQ / VIT / PV | PASS | test-v192.mjs, rendu carte partagé |
| Guide première partie | PASS | parcours navigateur, onboarding.js |
| Disposition gauche/droite | PASS | parcours navigateur, ancien grid corrigé |
| Nouveaux FX et bruitages | PASS | combat réel ; types et thèmes dans effects.js |
| Packs scellés + retournement + agrandissement | PASS | ouverture réelle navigateur |
| Cinq cartes, fin du cumul par étage | PASS | tests packs ; collection-rewards.js |
| Probabilités par carte / univers | PASS | 10 000 packs / 50 000 cartes |
| Reprise et crédit unique | PASS | migration, stockage défaillant, double ouverture |
| Cartes non possédées grisées | PASS | collection inspectée à 390px |
| Collection/packs 390/768/1360 | PASS | iframe de test, aucun débordement mesuré |
| Équilibrage sur ton classement manuel | BLOCKED | JSON approuvé encore attendu |
| Tous les portraits réels finis | BLOCKED | catalogue hérité partiellement générique/manquant |
| Windows natif et file:// de V19.2 | BLOCKED | navigateur de test refuse file:// |
| Nouveau solo ouvert | BLOCKED | design proposé, développement non lancé |
| Tests historiques et intégrité | PASS | npm test, verify_v192.py, comparaison ZIP |

Le statut PASS des FX prouve leur branchement, pas une note artistique ni une vérification de chaque technique individuelle.
