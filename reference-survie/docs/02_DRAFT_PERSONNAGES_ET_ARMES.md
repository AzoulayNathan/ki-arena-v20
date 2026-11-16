# Draft initial — 5 personnages + 3 armes

## Règle exacte d'une sélection
Quatre actions possibles : **2 propositions affichées** tirées à rang 25–35 sur une échelle virtuelle 0–60 ; **1 proposition affichée** à rang 15–45 ; **1 carte mystère cachée** à rang 0–60. Le joueur choisit une seule de ces **trois visibles OU l'option mystère**. La borne 0 ne peut pas désigner une carte : elle est transformée en 1.

Cette règle est répétée **5 fois pour les personnages, 3 fois pour les armes**. Les cartes déjà choisies et les autres propositions de la même fenêtre ne se répètent pas. Le mystère doit être généré au même moment que les autres pour qu'il ne dépende pas d'un clic opportuniste.

## Adapter l'échelle à tous les catalogues
Pour un pool de `N` personnages classés, un rang virtuel `r` sur 60 devient `max(1, round(r × N/60))`. Les mêmes fenêtres s'appliquent au pool des **armes physiques transférables** classées par rareté/puissance, avec sa propre taille `W` ; ainsi un nombre différent d'armes DB / HxH ne casse pas le draft.

### Pourquoi séparer les pools
Le draft d'armes de départ contient seulement les lignes `classe=arme`, `compatible_draft=oui`. Les armures, outils, reliques et consommables sont disponibles par les récompenses et boutiques. Les objets de Nen strictement personnels ne sont **jamais distribués à un porteur aléatoire**.

## Régles d'équité
- Une même identité/personnage ne doit pas figurer plusieurs fois au draft de départ. Le moteur évite les ID identiques ; l'intégration UI pourra ajouter la règle anti-formes (même `id_personnage`), recommandée.
- Si un intervalle est vide parce que les choix ont déjà été pris, élargir progressivement la fenêtre plutôt que livrer une option invalide.
- Une carte cachée peut être faible ou exceptionnelle : afficher la probabilité générale et son caractère risqué, jamais sa valeur avant le choix.
- Ne pas afficher de personnages dont le mode Survie ne permet pas d'action réelle.

## Deck initial et limites
`5 personnages + 3 armes = 8 cartes`. Le nombre de cartes du deck est **nombre de recrues vivantes + nombre d'équipements conservés**. Les personnages morts sortent définitivement du deck ; une arme équipée n'est pas détruite, mais se remet dans la pile au début du prochain combat. Les nouveaux recrutements ajoutent leurs propres cartes au deck.

## Questions d'UX résolues
- Aucun joueur ne commence avec zéro carte de personnage en main : la main initiale de 3 garantit au moins une unité.
- Aucune carte ne demande d'attendre 5 rounds avant d'être jouable (pas de mana).
- Le draft ne nécessite pas d'animations longues ; les offres glissent en place, la carte cachée se retourne seulement si sélectionnée.
