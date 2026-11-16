# Cartes d'armes, pioche et combat — PAS DE MANA

## Deck unique, deux familles de cartes
**Personnages** : une carte par recrue vivante. **Équipements** : une carte par arme/armure/outil possédé. Le deck initial contient donc 8 cartes après le draft. Toute arme est une carte piochable : l'illustration montre l'objet, le cadre varie selon la rareté et le bandeau d'effet indique une phrase au maximum.

## Pioche et pose
Main de départ de 3 dont au moins 1 personnage ; puis **1 pioche à chaque nouveau round**. Le joueur peut poser gratuitement ses personnages si une place est disponible. Il n'y a aucune énergie ou mana. Pour les armes : un équipement `cout_action_equipement=0` se pose immédiatement ; un équipement `=1` utilise **l'unique pose d'équipement payante du round** ; il n'y a jamais de réserve de mana. Certaines armes déclenchent en plus `+1 pioche` lors de leur pose (plafond de +2 cartes bonus par round pour éviter une boucle). Une arme ne peut s'activer qu'une fois dans ce combat.

## Emplacements d'un combattant
1 emplacement arme + 1 emplacement armure. Les outils et manifestations autorisées utilisent l'emplacement arme par défaut ; consommables s'appliquent immédiatement et sont défaussés pour le combat. Un remplacement explicite requiert un échange de carte, pour éviter qu'une suite de petites armes ne multiplie les bonus sans limite.

## Effets courts (propositions de gameplay, non pouvoirs officiels)
- `atk` : bonus ATQ lors de la pose ; attaque normale supplémentaire **non** accordée.
- `pierce` : bonus ATQ avec potentiel d'ignorer une partie de l'armure ; à brancher sur le moteur V5.2.
- `shield` / `hp` : barrière temporaire ou protection, pas de résurrection.
- `draw` / `scout` : pioche une autre carte.
- `heal` : soin ponctuel sur une unité vivante.
- `stun`, `evade`, `counter` : statut léger, au plus une activation par combat dans le moteur de production. Le simulateur livré ne calcule que les bonus ATQ / bouclier / soin / pioche : les autres effets sont des **hooks à connecter**.

## Ennemis
Leur équipe de monstres est déployée directement pour garantir un combat immédiat. Ils possèdent cependant **un mini-deck d'équipements**, 3 cartes de main initiale au maximum, puis 1 pioche par round. Les cartes gratuites sont équipées immédiatement et les autres suivent 1 action d'équipement par round. Aucun mana ennemi non plus.

## Durée & UI
Cible : 20–60 s un combat normal, 40–90 s un boss, option accélérer x2 et animations non bloquantes. La main est visible en bas d'écran et peut être ouverte au scroll ; éviter le dessin d'une carte au-dessus des combattants pendant trop longtemps. Visuel de l'arme équipée : une LED + petite icône du bon grade près du portrait de son porteur.

## Compatibilité
Les objets du CSV marqués `NEN_PERSONNEL` sont répertoriés pour fidélité à Hunter × Hunter, mais ne deviennent **pas** des armes librement échangeables. Ils doivent éventuellement rejoindre le système de capacité liée à la carte du personnage. Les entrées `HORS_EQUIPEMENT` sont exclues. Les autres utilisent la même interface `EquipmentCard` côté DB ou HXH.
