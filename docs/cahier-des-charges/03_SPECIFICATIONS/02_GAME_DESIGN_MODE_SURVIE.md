# Game design exécutable — Survie Infinity V2

Document opérationnel de raccordement. Les sources `02_SURVIE_INFINITY_V2_SOURCE_COMPLETE/docs/01...10` contiennent les règles complètes et leurs valeurs de référence ; **ce texte n'en remplace aucune**.

## Boucle du joueur

1. **Choisir son univers** DB ou HXH et son seed (rejouable).
2. **Drafter 8 cartes** : cinq personnages puis trois armes, chaque tour trois propositions visibles et une mystère, vrais portraits/objets.
3. **Explorer le biome** en choisissant une des routes réellement reliées, parmi grandes cartes illustrées et détails concis.
4. **Préparer les 3 premières places de terrain**, puis choisir les poses dans la main de 3. La main est accessible sous le plateau, distincte de l'inventaire du mode aventure. Aucun mana.
5. **Lancer le round** : poses admissibles, pioche (sauf premier round selon règle du moteur), puis chaque unité vivante déployée attaque une fois ; initiative VIT et effets équipés.
6. **Fin de combat** : KO supprimés définitivement, +25% PV vivants, XP aux survivants joués, une récompense parmi trois, mise à jour du deck et autosave.
7. **Répéter** : vague normale, élite, boss, marchand, trésor, repos, événement. Difficulté par rang augmente à chaque vague de combat, sans cycle magique ni reset.

## Détail de la main / pose

- Main initiale 3 dont au moins une carte personnage garantie.
- Pioche normale 1 au début de chaque round suivant ; bonus de pioche plafonné à 2 dans le round.
- Combattants piochés jouables immédiatement si place ; 3 emplacements initialement, rare extension 4 puis 5.
- Une arme et une armure par combattant ; une seule pose à coût d'action 1 par round, poses 0 libres suivant les règles, pas de ressource mana.
- L'arme d'une unité KO reste régie par les règles de deck/recirculation, sans « résurrection accidentelle ».
- Ennemis : déploiement de leur équipe immédiat, mini-deck d'équipement, pose automatique 0 ou 1 action/round.
- Capacités spéciales déclenchées seulement sur des événements réels, avec limite par combat et rapport d'effets.

## Déroulé des interactions

| Écran | Action principale | Micro-animation |
|---|---|---|
| Mode | Choisir univers et run | Transition courte vers panorama |
| Draft | Choisir visible / mystère | 3 cartes + dos mystère, focus clair, retournement après choix |
| Carte | Choisir un des chemins réels | Avancée du marqueur, embranchements, cartes de choix |
| Pré-combat | Comparer menace et équipe | Portraits viennent en place, badge de danger lisible |
| Terrain | Jouer unités et équipement depuis la main | Carte glisse vers un emplacement, effet court distinct |
| Combat | Voir ATQ/PV/VIT, action du round | Impact, bouclier, soin, esquive ; x2/saut possibles |
| Récompense | Choisir une seule récompense | Trois grands choix d'items illustrés |
| Repos/marchand | Soigner/acheter/équiper | Inventaire dans panneau bas |
| Défaite | Revoir profondeur, objets, record | Bilan court et option rejouer |

## Situations critiques à programmer

- Première main avec trois armes -> impossible : garantir au moins un combattant.
- Plus aucun survivant -> défaite immédiate ; pas de combat d'armes seules.
- Carte d'équipement non compatible / slot plein -> expliquer, ne pas consommer.
- Une arme de capacité intrinsèque ou Nen personnel -> impossible de la distribuer.
- Pioche bonus avec pile vide / main pleine -> pas de boucle ni blocage.
- Relique augmentant le terrain au-delà de 5 -> plafonner ; afficher l'effet réel.
- Recrutement d'un ennemi non rencontré -> interdit.
- Récompense non applicable -> la remplacer AVANT affichage, pas la valider puis annuler.
- Run rechargée après KO / achat / XP -> opération unique, pas de double gain.
- Vague 20 -> 21 -> difficulté poursuit sa progression ; conservation du seed et des ressources.

## Fidélité narrative

DB/DBZ/DBS : styles de lieux, personnages et techniques seulement tirés du catalogue fourni. HXH : Nen personnel reste personnel, arcs et continuités vérifiés. Les effets chiffrés sont des **choix de gameplay** et non des données officielles de l'œuvre.
