# Items et équipements — système cible cohérent, canon-aware et jouable

## Les données réelles (ne pas gonfler les chiffres)

- 43 fiches DB et 55 fiches HXH, soit **98 entrées référencées**.
- DB : 21 armes, 8 armures, 7 outils, 4 consommables, 2 intrinsèques, 1 technique catégorie `nen` dans la source.
- HXH : 26 armes, 17 Nen (dont plusieurs capacités personnelles), 6 outils, 6 consommables.
- Les sources contiennent **21 entrées non transférables/exclues** selon le triage initial, **47 candidates au draft d'armes** et **30 à examiner pour loot/boutiques**, sans préjuger de leur équilibrage ou canonicité. Cette classification est dérivée, non une décision finale de validation.
- Le seul vrai fichier de source d'objet est le CSV du pack Survie correspondant ; `08_CATALOGUES_ET_ITEMS/INDEX_98_EQUIPEMENTS_POUR_INTEGRATION.csv` est un tableau de travail dérivé.

## Familles fonctionnelles

| Famille | Exemple des sources DB | Usage concret | Contraintes |
|---|---|---|---|
| Arme physique | Bâton magique, épée de Trunks, épée Z, katana de Yajirobé | Bonus ATQ, perforation, déclencheur lié à une attaque | 1 arme/unité, compatible draft si CSV l'autorise |
| Armure | Armure Saiyan, armure de Freezer, cape de Piccolo | PV/bouclier, protection ponctuelle | 1 armure/unité, objets trouvés après draft |
| Outil | Scouter, Dragon Radar, capsule Hoï-Poï | Pioche, reconnaissance, aperçu des récompenses | Slot arme sauf exception testée, distinction carte/outil |
| Consommable | Senzu, machine de soin | Soigner un vivant, défausser après usage | Pas de résurrection par défaut |
| Capacité personnelle | Lame de ki, armement incorporé, technique Nen | Capacité intrinsèque sur une fiche personnage | INTERDIT en carte d'équipement libre |
| Relique globale | Manuel d'entraînement, étendard, jardin | Modifie le deck, la pioche ou capacité terrain | Hors deck, jamais équiper sur slot arme |
| Editorial nouveau | Capsule témoin, badge de tournoi, etc. | Diversification de gameplay seulement si utile | Marquer comme INVENTÉ / à tester, aucun statut « canon » |

## Protocole d'implémentation d'un item

1. **ID stable et univers**, catégorie, statut canon, transfert, rareté, coût, usages, image locale.
2. **Effet opérationnel** avec phase (`onPlay`, `onAttack`, `onRoundStart`, `onDamage`, `onCombatEnd`, `onWin`, `onMapChoice`) et conditions.
3. Calcul d'amplitude, stacking cap et fréquence d'activation documentés.
4. Prévisualisation lisible : « +16 % ATQ », « Bouclier 24 % », « Pioche 1 », et texte détail si ambigu.
5. Journal de combat et feedback graphique montrant les effets déclenchés réellement.
6. Tests : cible valide, coût, limite par round, limite par combat, cumul, KO, échange d'équipement, recharge du deck, sauvegarde/reprise.
7. Table de loot adaptée au mode/univers ; aucun élément inutilisable dans la sélection.
8. Statut d'implémentation : `OK`, `EXCLU`, `REVIEW_CANON`, `EN_COURS`, `BUG`, avec une preuve dans `LISTE_ITEMS_IMPLEMENTES.csv`.

## Règles de stacking et d'anti-exploit

- Un seul slot arme et un seul armure par unité ; pas d'empilement silencieux de plusieurs effets du même slot.
- Une seule action d'équipement payante par round ; effets à coût 0 soumis aux limites d'usage et de pioche.
- Si une carte de pioche supplémentaire déclenche une autre carte de pioche, plafonner à +2 bonus/round ; pas de boucle infinie.
- `heal` ne choisit jamais un mort ; `shield` ne ressuscite jamais ; `stun`, `counter`, `evade` au plus une activation/combat suivant la source ; journaux indispensables.
- Un item dont le déclencheur ne peut pas exister dans le mode courant n'entre pas dans le pool ; même règle pour effets devenus non applicables avec le nouvel état de la run.
- Les achats doivent être atomiques : décrément zénis une fois, création de l'item une fois, persistance avant transition visuelle ; un clic répété ne duplique rien.
- Le hasard doit privilégier des options **utilisables** ; proposer trois choix variés (arme/économie/soin par exemple), pas trois doublons médiocres ou trois options payantes inaccessibles.

## Direction UX de l'inventaire

**Grand principe : le monde d'abord.** En exploration, bande basse avec les personnages vivants et leur PV, icônes raccourcis et poignée. Tiroir déplié : onglets Équipe / Sac / Reliques / Consommables / Effets, scroll interne sur la zone active. Dans Survie Infinity, MAIN et DECK se présentent séparément au-dessus de la zone de jeu pour manipuler les cartes piochées.

Pour une fiche d'item, afficher grande illustration isolée, catégorie, nom, rareté, une phrase d'effet, porteur actuel, emplacement, icône `0 action`/`1 action` et bouton équipable ou grisé avec explication. Un bouton « comparer » affiche les valeurs réelles et ne change rien tant que le joueur n'a pas validé.

## Proposition d'ajouts créatifs (FACULTATIFS, NON CANONIQUES)

- **Cache Capsule** (outil, DB, éditorial) : stocke une carte de main pour le round suivant ; coût une action, maximum un stockage, pas de duplication.
- **Balise de patrouille** (outil, DB, éditorial) : révèle un indice de l'archétype de l'élite suivante, pas de changement arbitraire du tirage.
- **Gants de récupération** (arme, DB, éditorial) : bonus mineur quand le porteur remplace un KO, plafonné une fois/combat.
- **Nécessaire de secours** (consommable, DB, éditorial) : soin des survivants avant rencontre, jamais réanimation.
- **Insigne du tenkaichi** (relique, DB, éditorial) : première victoire d'une zone donne une option de loot légèrement améliorée ; pas une nouvelle monnaie.
- **Trousse de terrain** (outil, HXH, éditorial) : protection légère de la première unité déployée, maximum une activation/combat.

**Ne pas intégrer tous les exemples aveuglément.** Cinq nouveautés uniques et testées valent mieux que cinquante bonus clonés ; rester fidèle aux univers. Les objets editorial sont explicitement inventés, pas présentés comme des artefacts de l'œuvre.

## Économie et loot — hypothèses à calibrer

Le pack de référence propose `12+5*vague` zénis en démonstration : **pas un tarif final**. Simuler dépenses/recettes, fréquence des soins et des remplacements, présence de choix impossibles, saturation du sac, coût des réanimations, progression des niveaux d'armes et nombre de récompenses par 10 combats. Ne pas donner des objets qui rendent la mort permanente sans effet ; limiter les résurrections exceptionnelles.

## Trois audits avant livraison

- **Fidélité** : fiches `CANON_CATEGORIE` et `EDITORIAL`, source ambiguë, transformations, techniques Nen. Les chiffres d'attaque ne sont pas officiels ; ne pas les vendre comme tels.
- **Gameplay** : les 47 armes candidates réellement équipables après validation ont le bon comportement et des tests. Les 21 exclusions restent exclues, les 30 autres font l'objet de statut individuel.
- **Art** : un `image_id` local pour chaque objet utilisable ou une représentation neutre explicitement assumée (icône), jamais réutiliser la photo d'un personnage par défaut.
