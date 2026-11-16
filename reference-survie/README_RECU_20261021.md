# KI ARENA — SURVIE INFINITY V2

**Dossier indépendant et documenté** pour le nouveau mode Survie, avec les deux univers DB et Hunter × Hunter. Ne remplace pas le ZIP du jeu.

## Contenu
- `00_APERCU_CATALOGUES.html` : aperçu interactif consultable hors ligne des 98 équipements et de la progression de vague
- `docs/01_...10_...md` : dix documents de conception distincts, inventaires complets par manga, intégration et limites
- `catalogues/EQUIPEMENTS_DB.csv` : 43 entrées (y compris les exclusions et les objets non équipables pour audit)
- `catalogues/EQUIPEMENTS_HXH.csv` : 55 entrées (y compris manifestations Nen non échangeables)
- `catalogues/DB_CARTES_SOURCE.csv` : 600 cartes Dragon Ball issues du catalogue fourni
- `catalogues/HXH_CARTES_SOURCE.csv` : 532 cartes Hunter × Hunter issues du catalogue fourni
- `catalogues/PROGRESSION_60_VAGUES_DB_HXH.csv` : 360 rencontres de référence, rangs et armes ennemies
- `catalogues/EVOLUTIONS_VALIDEES.csv` : transitions autorisées explicitement
- `catalogues/CONFIG_SURVIE.json` : règles paramétrables
- `engine/survie.py` : moteur de référence Python sans dépendance externe
- `tests/test_survie.py` : tests de cohérence et de faisabilité
- `exemples/DEMO_*_50_VAGUES.json` : sorties du simulateur sur catalogues réels
- `rapports/TESTS.txt` : résultat des tests exécutés

## Tester
Ouvrir un terminal dans ce dossier puis :

```bash
python -m unittest discover -s tests -v
python -m engine.survie --univers DB --seed 42 --vagues 25
python -m engine.survie --univers HXH --seed 42 --vagues 25
```

Les règles de référence du draft, du deck, des rangs et des récompenses sont décrites dans les documents. **Sans mana.** Le code de démonstration n'intègre pas encore les pages ni les animations du jeu V5.2 existant.
