# Difficulté mathématique : deux courbes, deux modes

**Attention : ne pas remplacer une courbe par l'autre.**

## A. Rogue One V8 — préserver

La V8 actuelle estime le danger d'une rencontre sur la base des statistiques de l'équipe, ses bonus, ses survivants et de la profondeur ; le système cible une montée de difficulté linéaire. Les coefficients réels se trouvent dans `01_JEU_V8_CODE_SOURCE/src/roguelike.js`. Ne pas les retoucher dans cette mission uniquement au motif que le nouveau moteur Survie propose une formule différente. Les tests `test-rogue-v6.mjs` et autres garantissent des invariants existants.

## B. Survie Infinity V2 — équation de référence non négociable

Classement : pour chacun des N personnages d'un univers, calculer `P = ATQ + PV + VIT`, trier par P croissant puis par ID, assigner un rang 1..N.

Pour vague `v>=1`, type `t` : normal=0 / élite=1 / boss=2.

`B(v,t)=round((N/4)*(v+t))`.

- DB N=600, incrément = 150 rangs/vague ; vague 1 normal 150, élite 300, boss 450 ; vague 18 boss 3000 ; vague 19 boss 3150 ; vague 20 normal 3000 ; vague 21 normal 3150.
- HXH N=532, incrément = 133 rangs/vague.
- 1<=rang_i<=N ; **somme exactement égale à B**, jamais simplement proche.
- v1..v9 : 1..5 ennemis parmi les tailles faisables ; dès v10 : au moins 5 ennemis ; taille au-delà `max(5, ceil(B/N))`.
- Quand B>kN, augmenter k. Si une décomposition à rangs distincts existe, elle est obligatoire ; sinon répétitions de rang autorisées et explicitées.
- Les armes ennemies montent en quantité/rareté comme documenté ; elles sont un facteur tactique visible indépendant du budget de rangs.
- Pas d'augmentation multiplicative secrète des stats, pas de reset après vague 20.

## Invariants et preuves

| Cas | Budget | Ennemis nécessaires |
|---|---:|---|
| DB v1 normal | 150 | 1..5 selon faisabilité |
| DB v1 élite | 300 | 1..5 |
| DB v1 boss | 450 | 1..5 |
| DB v18 boss | 3000 | 5 de rang 600 |
| DB v19 boss | 3150 | 6 nécessaires |
| DB v20 normal | 3000 | 5 possibles |
| DB v21 normal | 3150 | 6 nécessaires |

La difficulté **mathématiquement linéaire en budget de rangs** n'implique pas une probabilité de victoire linéaire. Des armes et compétences peuvent créer des ruptures ; il faut le mesurer.

## Simulations exigées

1. 1000 seeds au minimum DB ; 1000 HXH (si jouable). Plusieurs profils de départ et de builds, même seeds sur plusieurs exécutions pour le déterminisme.
2. Graphe profondeur de défaite, survie moyenne, rendement soin/achat, taux d'usage d'items, rareté des transformations, coûts, taux de victoire par vague/type, apparition ennemie >5.
3. États impossibles : reward sans option validable, pioche bloquée, personnage KO soigné, budget hors plage, duplications interdites, upgrade transformant en autre identité.
4. Trouver les murs de difficulté, les stratégies dominantes, la saturation des écrans quand k>10, les boucles de pioche et le sursoin.
5. Après correction, re-tester exactement les mêmes seeds et fournir les métriques avant/après ; jamais « parfaitement équilibré » sur 12 tests unitaires.

## Affichage du danger au joueur

Danger calculé avant combat à partir du roster réel, PV actuels, initiative, protections, effets/équipements, mais **ne pas afficher un pourcentage de victoire inventé**. Afficher un palier utile (« favorable », « tendu », « dangereux », « extrême »), les ennemis, l'effet de terrain et les récompenses possibles réellement autorisées. Le multiplicateur d'armes adverses doit être inclus dans l'information du danger, sans altérer le budget de rangs.
