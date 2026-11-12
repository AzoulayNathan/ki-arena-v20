# Contrat produit — ne pas confondre les deux Survies

## Vision

KI ARENA est une expérience fan-made de **collection de cartes, combats automatiques, progression et roguelikes** inspirée de DB/DBZ/DBS. La priorité demeure **un jeu local Windows réellement beau, fiable, amusant, sans réseau**. Le nouveau pack Survie Infinity élargit le catalogue de mécanismes et propose un univers Hunter × Hunter supplémentaire, **séparé**.

## État actuel vs nouveau mode

| Axe | Rogue One V8 — DÉJÀ LIVRÉ | Survie Infinity V2 — À INTÉGRER |
|---|---|---|
| Sélection | 5 cartes initiales de collection | Draft successif 5 personnages + 3 armes (3 visibles + mystère) |
| Combat | 5 actifs, combat automatique V8 | Deck 8 initial, main 3, terrain 3 actifs (max 5 par artefacts), pioche 1/round |
| Difficulté | Puissance et profondeur, sélection adaptative V8 | Rang `ATQ+PV+VIT` ; budget entier EXACT `round(N/4*(v+t))` |
| Ennemis | Génération de zone/rencontre existante | 1..5 avant v10 ; 5+ ensuite, anti-doublon si mathématiquement possible |
| Déplacement | Graphe de destinations V8 | Peut réutiliser le graphe/les visuels, mais vague = indice de rencontres, non chaque nœud |
| Items | Table existante armes, armures, reliques, consommables | 43 DB + 55 HXH fiches dont exclusions ; équipement piochable, 1 arme+1 armure |
| Progression | Recrutement, packs, reliques, KO, Dragon Balls | XP après combats joués/survivants ; évolutions autorisées ; récompense parmi 3 |
| Univers | 600 cartes DB | 600 DB ou 532 HXH par run, strictement isolés |
| Sauvegarde | localStorage V8 | Nouvel espace versionné par mode/univers ; migration non destructrice |
| Statut | Jouable à partir des sources V8 | Prototype Python de référence et documentation, PAS intégré JS |

### Décision d'intégration

**Nouvelle entrée de menu dédiée “Survie Infinity — Deck & Armes”** sans renommer ou remplacer Rogue One V8. Les deux utilisent la même identité visuelle Dragon Adventure Clean, les mêmes cartes du Card Studio si elles existent, mais des règles de combat/slots différentes. Un système commun d'items peut normaliser catalogues/affichage ; les comportements restent explicitement isolés par adaptateur de mode.

### Sources d'autorité en cas de désaccord

1. Pour les cartes existantes DB, effets existants et les autres modes : fichier exécuté et tests V8.
2. Pour les **nouvelles** règles Survie Infinity : `docs/01...10` + `CONFIG_SURVIE.json` + tests/`engine/survie.py` ; appliquer le document détaillé lorsqu'il est plus précis que le résumé.
3. Pour la direction visuelle actuelle : cible `04_DIRECTION_ARTISTIQUE/01_DRAGON_ADVENTURE_CLEAN_FINAL.md`, puis la réalisation V8 comme base technique à préserver.
4. Pour les items et noms canoniques : les CSV sources, pas les propositions inventées ni les contenus générés.
5. Si une règle V8 et Survie Infinity divergent, **ne pas fusionner sans arbitrage** ; préserver V8, appliquer la nouvelle règle uniquement à la Survie Infinity.

### Liberté d'invention contrôlée

L'IA peut créer des objets éditoriaux, paysages, icônes, animations, événements et synergies, à condition d'utiliser des labels distinguant l'invention de l'œuvre originale. Des armes canoniques ne deviennent pas des pouvoirs « officiels » simplement parce qu'un CSV invente un +16 % ATQ. Ne pas mélanger DB/HXH ou inventer une transformation interdite.
