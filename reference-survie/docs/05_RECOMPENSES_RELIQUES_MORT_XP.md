# Récompenses, reliques, recrutement et niveaux

## Règles de survie
- Victoire : +25 % des PV max **aux vivants seulement** (plafond 100 %). KO = définitivement mort pour la run ; il sort du deck et de la liste des combattants. Un Senzu / une réanimation peut être utilisé seulement si un objet précis autorise le retour ; ne jamais ressusciter automatiquement.
- Une place vide demeure vide jusqu'à recrutement. Récompense de type recrutement = choisir une unité réellement vue dans l'équipe ennemie, si disponible.
- Si plus aucune recrue vivante : défaite et fin de run. Les armes n'attaquent pas toutes seules.

## Récompenses : toujours un choix lisible
Normal : proposition de 3 parmi or, soin léger, arme, consommable, recrutement possible. Élite : inclure parfois relique, plus d'or et arme rare. Boss : une offre majeure possible (relique, réanimation, objet rare de +1 place de combat), mais pas les trois gratuitement. Marchand/repos/trésor/événement sont des nœuds séparés ; ne pas afficher six popups après chaque combat.

## Extension de terrain
**3 slots de combattants au départ**, 4 avec le premier artefact extra-rare, **5 maximum dans cette première version** avec un deuxième artefact. Les personnages stockés au deck ne sont pas limités à 5 ; ils attendent la pioche. L'arme ne consomme pas un slot combattant. L'adversaire peut dépasser 5 places à très haute vague puisque son budget de rangs l'impose.

## Reliques (propositions, toutes inventées pour le système de jeu)
- « Manuel d'entraînement » : +1 carte dans la main initiale.
- « Vitesse de lecture » : 2 pioches par round au lieu de 1.
- « Jardin médicinal » : +5 % de PV max après chaque victoire, pour les survivants.
- « Capsules de secours » : chance très rare de choisir une réanimation à la récompense du boss.
- « Étendard de commandement » : +1 emplacement combattant, plafonné à 5.
Les reliques sont **globales** et ne sont pas des armes ; elles n'entrent pas dans le deck. Les trois premières sont câblées dans le moteur de référence ; les deux autres se matérialisent via les offres spéciales de récompense.

## XP de personnages — maximum 5
Un personnage gagne +1 victoire d'XP s'il a été **joué et est survivant au moment de la victoire**. Les unités restées dans le deck / main n'en gagnent pas, les morts non plus.

| Niveau | Victoires depuis niveau précédent | Cumul |
|---|---:|---:|
| 1 | — | 0 |
| 2 | 2 | 2 |
| 3 | 3 | 5 |
| 4 | 4 | 9 |
| 5 | 5 | 14 |

Lors d'un niveau : si une transition explicite approuvée existe dans `catalogues/EVOLUTIONS_VALIDEES.csv`, remplacer la carte par la version plus puissante **du même personnage**, conserver le niveau et préserver proportionnellement les PV. Sinon augmenter ATQ/PV/VIT de +10 %, cumul multiplicatif, jusqu'au niveau 5. Pas de transformation imaginative vers un personnage différent.

### Exclusions importantes
Gon adulte est une transformation sacrificielle exceptionnelle, **pas** une évolution automatiquement accordée après quelques victoires ; la transition est marquée `BLOQUE` dans le fichier. En général, éviter d'utiliser des capacités à conditions tragiques comme simple upgrade gratuit.

## Économie préliminaire
Or de récompense démo `12 + 5 × vague` ; coût des boutiques à calibrer par simulations. Réanimation très rare et pas de réserve infinie : elle ne doit pas annuler la permanence de la mort. Récompenses moyennes plus fréquentes que celles à forte variance pour que le hasard ne décide pas de toute la run.
