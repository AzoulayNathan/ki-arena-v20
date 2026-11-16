# Difficulté infinie — budgets de rangs EXACTS

## Rangs
Trier le roster de `N` cartes selon `P = ATQ + PV + VIT` (croissant). Chaque rang entier entre 1 et N représente une carte ; conserver le vrai P pour le combat, sans le remplacer par un rang synthétique. Toute édition du CSV invalide l'ordre et exige un nouveau classement.

## Budgets au lancement d'une rencontre
Soit `Δ=N/20`, la vague `v>=1` et le genre `t` : normal=0, élite=1, boss=2.

`B(v,t)=round(5 × Δ × (v+t)) = round((N/4) × (v+t))`.

Pour `N=600`, vague 1 = 150 / 300 / 450 ; vague 2 = 300 / 450 / 600. Cette formule continue après la vague 20 : **aucune remise à zéro ni nouvelle augmentation artificielle de stats.** Pour `N=532`, la marche vaut 133.

## Nombre de monstres
Vagues 1–9 : tirer 1 à 5 ennemis **uniquement parmi les nombres compatibles avec le budget**. Dès vague 10 : **au moins 5** ennemis, sans tirage de taille. Après, le nombre requis est `max(5, ceil(B/N))`.

On commence donc à 5 slots à la vague 10. Lorsque le budget dépasse `5N`, il faut passer à 6 emplacements (capacité `6N`), puis à 7 quand il dépasse `6N`, etc. Exemple : boss vague 18 avec `B=3000` → cinq fois le rang 600 possible et exact ; boss vague 19 `B=3150` → 6 ennemis. Cela reflète la demande de ne **jamais gaspiller de budget**, sans décimales de puissance arbitraires.

## Répartition exacte
Pour `k` ennemis, tirer `r1...rk` entiers avec `1<=ri<=N` et `Σri=B`. Tant qu'une solution sans doublon de rang existe, elle est **obligatoire**. Sinon les doublons sont autorisés mathématiquement, notamment au plafond `k×N`. L'identité peut se répéter à ce plafond, ce qui constitue une exception affichée, non un bug silencieux.

Une solution de rangs tous distincts existe si `k<=N` et `k(k+1)/2 <= B <= k(2N-k+1)/2`. Le code choisit une répartition valide directement. Les personnages sont aléatoires parce que la décomposition aléatoire change ; le seed garantit une répétabilité lors de tests.

## Adaptation des armes ennemies
Les équipements sont **un deuxième axe de difficulté visible**, et ne modifient pas le budget de rangs des unités. Par défaut : quantité ennemie `min(k, floor((v-1)/5) + (élite?1:0) + (boss?1:0))`, rareté max `min(5, 1+floor((v-1)/5)+(boss?1:0))`.

Les ennemis déploient immédiatement les personnages de leur équipe, puis **piochent leurs équipements** dans un mini-deck et les posent avec la même cadence que le joueur. Leur puissance augmente par fréquence et rareté d'armes, pas en inventant une nouvelle statistique cachée. Tester le cumul avec les rangs : la somme exacte porte sur les rangs des personnages, les armes sont un multiplicateur tactique séparé annoncé au joueur.

## Progression au-delà de 20
Exemple DB : vague 20 normal B=3000 (5 slots), boss B=3300 (6 slots). Vague 21 normal B=3150 (6 slots), boss B=3450 (6 slots). Vague 25 boss B=4050 (7 slots). Aucun reset en 21/20 ; seulement une graduation linéaire de la difficulté et de la taille des équipes ennemies.

## Précautions
- Les rangs sont une approximation imparfaite de la difficulté tactique : effets, VIT, composition et soin jouent beaucoup.
- Une run ne doit pas devenir impossible à cause d'un nombre infini d'ennemis sur le même écran. Pour très hautes vagues, envisager des escouades successives ou une représentation compacte **sans modifier le budget**.
- Les rangs faibles n'ont pas de bonus gratuit en cycle 2 ; c'est l'augmentation du nombre d'adversaires et de l'équipement qui assure la difficulté.
