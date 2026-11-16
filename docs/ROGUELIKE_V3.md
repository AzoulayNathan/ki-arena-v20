# KI ARENA V3 — Conception du roguelike

**Sans campagne narrative.** But : repousser le plus longtemps possible la défaite.

## Structure d'une run

- Départ : cinq cartes déjà possédées, une place de réserve vide, 80 zénis, un Senzu.
- Zone N : `min(10, 3+N)` rencontres ordinaires + un boss obligatoire. Deux propositions de chemin par rencontre (sauf boss). Biomes alternés : terres sauvages, désert, Namek, ruines, ciel, chambre du temps.
- Rencontre : combat (ennemis, or, pack, recrue potentielle), élite (difficulté et gain supérieurs), marchand (achats), repos (+30 % PV), événement (aléatoire), quête secondaire (élite facultatif), coffre (objet ou relique), vide (repos de risque), boss.
- Chaque victoire : zénis + pack temporairement gagné + possibilité de recruter une des cartes ennemies. Les packs acquis sont enregistrés dans le compteur de butin, puis attribués à la fin de la run.
- Recrutement : placer dans la réserve, ou remplacer l'une des cinq cartes si elle est pleine. Les cartes recrutées restent temporaires jusqu'au bilan de fin de run. Une fois un boss vaincu, les recrues de cette run sont débloquées en collection à sa conclusion.
- Défaite : butin de packs et recrues admissibles attribués à la collection permanente, record enregistré.
- Abandon manuel : retour au menu sans conserver ce butin, pour éviter un jeu optimal consistant à s'arrêter juste après les combats faciles.

## Combat

Cinq cartes au plus sur le terrain, chaque personnage vivant a une attaque normale par round dans l'ordre décroissant de vitesse. Chaque effet se déclenche au maximum une fois par combat. Les PV actuels passent au combat suivant ; les effets temporaires de combat disparaissent entre les combats. Les équipements augmentent ATQ, PV, VIT ou bouclier, les reliques améliorent globalement les cartes ou la progression.

## Objets

- 9 équipements : ATQ / PV / VIT / bouclier, slot arme ou armure selon l'objet, par personnage.
- 3 consommables : Haricot Senzu, Capsule médicale, Disque d'entraînement.
- 9 reliques globales : soins automatiques après combat, réserve accrue, bonus ATQ/PV/VIT ou zénis.
- Équipements et reliques non conservés après la run. Les packs et recrues admissibles sont les gains permanents.

## Probabilités

Catalogue 33/27/21/15/4 ; pack standard identique. Packs Bronze, Argent, Or et Divin plus généreux, avec distributions séparées dans `src/games.js`. Les récompenses spéciales ne changent pas la répartition du catalogue.

## Idées futures (non codées)

Emplacements de routes cachées, adversaires à affinités de biome, reliques maudites, boss à phases, choix « quitte ou double », statistiques de run, boss hebdomadaires et défis seedés.
