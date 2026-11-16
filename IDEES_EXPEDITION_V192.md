# Deuxième solo : trois propositions jouables

Ces propositions ne sont pas implémentées dans cette livraison.

## A — Chasse nomade (recommandation)
Une carte ouverte générée par assemblage de régions illustrées. Une escouade représentée par son capitaine se déplace ; les ennemis poursuivent sur une courte distance et les camps restent visibles. Toucher un groupe immobilise le terrain et ouvre le combat de cartes gauche/droite sur place, avec le moteur existant. Aucun ennemi ne touche le joueur pendant qu'il regarde le combat. PV conservés, défaite = fin de run.

Objectif de 18 minutes à tester : capturer trois balises pour localiser un boss. Chaque balise augmente d'un cran la menace annoncée. On peut prendre un détour pour un marchand ou un allié, couper par un canyon dangereux ou affronter un élite optionnel. Pas de difficulté qui grimpe pendant les menus ou les animations.

Décisions : recruter jusqu'à cinq, spécialiser une équipe autour de riposte/protection/vitesse, prendre un coffre qui réveille un poursuivant, se séparer d'un allié pour débloquer un passage. Les ennemis vaincus ne réapparaissent pas pour du farm gratuit. Plan généré avec contrôle de connectivité et objectifs atteignables ; même seed = même terrain/loot.

## B — Caravane sous pression
L'équipe avance automatiquement vers un refuge. Le joueur choisit latéralement la route de la caravane, les détours et les haltes. Les cartes restent visibles autour du convoi ; rencontres et attaques sont résolues par le moteur actuel. Le risque vient des distances entre refuges et des choix de haltes, pas d'un test de réflexe. Une malle peut coûter des PV, un marchand peut proposer un troc plutôt qu'un achat. Défaite = convoi perdu, bilan de l'équipe.

Plus simple sur mobile : un doigt pour choisir une direction, trois boutons maximum pour la halte. Bon angle pour sessions courtes. Moins ouvert que A, mais plus facile à comprendre et à terminer.

## C — Horde tactique de cartes
Déplacement continu d'une escouade ; les cartes attaquent automatiquement selon leurs vitesses, portées et cibles. Positionnement, dash et ramassage d'XP donnent le rythme. Environnements à obstacles, élites et boss télégraphiés. Les événements/choix mettent le monde en pause. Les cartes restent cartes, avec les mêmes visuels.

Cette variante demande un moteur spatial : collisions, portées, cadence continue, navigation et nouveaux tests de capacités. Elle réutilise les définitions d'effets mais ne peut pas prétendre réutiliser sans changement un moteur de combats clos. À prototyper séparément.

## Expérience originale à tester
- Sillage : un coffre laisse une piste suivie par un chasseur ; atteindre le refuge ou le vaincre.
- Rival visible : il progresse vers le même trésor ; contourner ou l'affronter.
- Deux balises : l'une révèle la map, l'autre donne une recrue mais alerte un élite.
- Équipe fragile : transporter un allié blessé jusqu'au camp pour le recruter.
- Boss attiré : choisir son terrain de combat parmi trois zones à effets annoncés.
- Fuite préparée : une extraction disponible avant le boss avec récompenses réduites, sans recréer un pack à chaque rechargement.

Premier prototype conseillé : A avec un biome, une seed, 8 types de points d'intérêt, un boss et un cycle exploration–combat–loot–reprise de moins de 60 secondes. Mesurer lisibilité, décisions et envie de rejouer avant d'étendre.
