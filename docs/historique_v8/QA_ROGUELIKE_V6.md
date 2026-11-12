# KI ARENA — Qualification Roguelike V6

## Résultats vérifiés

- **63 tests automatisés** : 17 moteur/catalogue + 12 V3 + 9 V5.1 + 6 V5.2 + 8 gameplay + 3 correctifs d'audit + 8 V6. Résultat PASS.
- **800 runs bots** sur quatre profils (200 starter, 200 uncommon, 200 rare, 200 epic) : **0 exception d'exécution et 0 invariant cassé**. La sortie détaillée est `data/simulation-v6.json`. Il s'agit de bots qui choisissent souvent aléatoirement, pas d'une mesure de performance de joueurs humains : toutes finissent par une défaite avant zone 13, avec profondeur moyenne allant de 13 à 21 nœuds.
- **Graphes :** plus de 150 générations contrôlées sur les zones 1–15, avec connexions réellement respectées. Aucune sélection de nœud non relié autorisée.
- **Calcul de difficulté :** progression de la cible prouvée linéaire pour quatre profils de puissance distincts ; ennemis uniques et effectifs valides.
- **Événements :** 250 variantes générées et résolues sans double récompense ou événement bloqué, coût refusé si la monnaie est insuffisante.
- **Boss :** dix archétypes retrouvés dans un panel de générations déterministes ; combat reproductible à seed constante.
- **Chromium :** tests sur 1360×860 et 390×844 avec apparition de la carte, trois nœuds de départ, interaction réelle avec un nœud, ouverture de rencontre puis combat → récompense lorsqu'un combat apparaît. Aucune erreur JavaScript observée sur ces parcours, aucun overflow horizontal mesuré.
- **Intégrité collection** : le fichier CSV original `data/cartes_600_SOURCE_V52.csv` est conservé. Aucune retouche esthétique des cartes dans la nouvelle feuille `rogue-v6.css`.

## Ce qui reste NON prouvé

1. Reprise navigateur **après fermeture/réouverture en plein combat** : le checkpoint existe dans le code mais le test navigateur d'ouverture de fichier/URL a été bloqué par les restrictions de cet environnement. Il faut vérifier manuellement sur Chrome et Edge localement.
2. Aucun test de jeu manuel de 2–3 heures, panel UX, test tactile sur téléphone physique, ni benchmark FPS réel de la vitesse ×8.
3. La **difficulté linéaire** signifie cible de statistiques croissante linéairement ; les taux de victoire réels ne le seront pas nécessairement. Les sessions bot montrent une forte difficulté au-delà de 2–4 zones avec de mauvaises décisions. L'équilibrage final reste à confronter à des joueurs humains.
4. Les 36 événements ont des choix explicites mais partagent douze familles narratives : ce sont des variantes, pas 36 récits totalement différents.
5. Les modes autres que Roguelike n'ont pas fait l'objet d'une nouvelle campagne complète de validation visuelle ; leur architecture d'origine est conservée.

## Contrôles de reprise recommandés à l'ouverture locale

En Roguelike : lancer une run ; rejoindre un combat ; recharger la page sur l'écran d'avant-combat, puis pendant le combat ; reprendre ; choisir un butin ; recharger ; recruter ; changer d'étape ; fermer et relancer ; vérifier PV, équipe, zénis, récompenses et absence de duplication. Tester le même parcours sur desktop et sur mobile, avec et sans animation réduite.

## Limites de propriété des images

Six **décors SVG originaux** ont été produits dans `assets/rogue`. Les autres illustrations, cartes et fichiers audio sont issus de la base V5.2 fournie et ne sont pas publiés ni distribués séparément ici. Ce projet reste fan-made non officiel.
