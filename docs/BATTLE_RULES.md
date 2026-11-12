# Moteur de combat automatique · KI ARENA V2

## Objectif

Comportement universel identique en duel, 3v3, 5v5, draft et roguelike. **Zéro intervention humaine après le lancement.** VIT détermine l'ordre des combattants au début de chaque round. Chaque unité qui survit jusqu'à sa position dans l'ordre exécute **au maximum une action normale dans ce round**. Les effets de carte peuvent ajouter une frappe ou une réaction, pas une nouvelle action normale.

## Cycle exact

1. Création des unités : statistiques et paramètres du match ; registre d'effets déjà utilisés initialement vide.
2. **Avant round 1** : appliquer UNE FOIS les bonus d'attaque, boucliers et bonus collectifs d'ouverture, créer les événements de replay.
3. **Début du round** : appliquer dégâts persistants, puis régénération si pertinent ; traiter les KO.
4. Calculer une fois l'ordre de VIT décroissante parmi les combattants vivants (égalité : identifiant stable). Le bonus VIT acquis pendant le round ne change l'ordre qu'au round suivant.
5. Pour chaque acteur encore vivant : si étourdi, passe son action ; sinon soin allié ponctuel possible ; choix de cible (70 % de probabilité de viser l'ennemi au plus faible pourcentage de PV) ; attaque normale ; interception éventuelle ; esquive éventuelle ; dégâts/boucliers ; riposte éventuelle ; seuil de PV (transformations / ultime / sacrifice), vol de vie, altérations et achèvement ; si encore vivant, coup additionnel ponctuel à partir du round 2, et attaque de zone ponctuelle à partir du round 3.
6. **Fin de round** : réduire les durées d'états persistants ; vérifier qu'il reste un combattant vivant dans chaque camp ; continuer au round suivant ou arrêter.
7. Après 16 rounds maximum par défaut, résoudre par pourcentage total de PV restants ; égalité possible, départage seed en bracket.

L'attaque normale utilise les paramètres internes du jeu : `max(8, round(ATQ_effective × 0,72 × multiplicateur_mode × multiplicateur_technique))` ; mode canon `multiplicateur_mode=1`, équilibré `0,84`. En équilibré, les stats sont compressées avant le combat : `ATQ = 64 + (ATQ−64) × 0,75`, `PV = 280 + (PV−280) × 0,78`, `VIT = 66 + (VIT−66) × 0,78`, puis arrondies.

## Effets, LED et coût de déclenchement

Chaque carte possède 1, 2, 3, 4 ou 5 effets selon sa rareté. **Chacun d'eux ne peut être consommé qu'une fois par combat**, même si une chance d'esquive, critique ou altération échoue : cela consomme sa tentative d'activation. Certains effets restent en attente jusqu'à satisfaire leur condition (soin lorsque quelqu'un est blessé, effet de seuil, achèvement sur ennemi affaibli, etc.). Une icône LED utilisée s'éteint dans le replay. En collection, survol/toucher d'une LED affiche sa signature, sa mécanique et son timing.

| Type | Déclenchement/effet (une fois maximum) |
|---|---|
| `atk_buff` | Début du combat : bonus ATQ personnel |
| `shield` | Début du combat : bouclier personnel |
| `team_buff` | Début du combat : bonus ATQ collectif |
| `team_shield` | Début du combat : bouclier collectif |
| `heal_ally` | Première action de la carte avec un allié blessé |
| `regen` | Premier début de round où le porteur est blessé |
| `critical` | Première attaque normale : tentative de coup critique |
| `dodge` | Première attaque normale subie : tentative d'esquive |
| `counter` | Première attaque subie si survivant, ou après esquive réussie : riposte ponctuelle |
| `intercept` | Première attaque normalement fatale pour un allié admissible : interposition |
| `lifesteal` | Première frappe normale : soin selon dégâts infligés |
| `dot` | Première frappe normale : tentative de dégâts persistants |
| `weaken` | Première frappe normale : affaiblissement ponctuel |
| `stun` | Première frappe normale : effet de contrôle ponctuel |
| `execute` | Première frappe amenant la cible sous un seuil : impact de finition |
| `extra_strike` | Première attaque normale à partir du round 2 : coup additionnel |
| `aoe` | Première attaque normale à partir du round 3 : frappe de zone |
| `transform` | Premier passage sous un seuil de PV : bonus ATQ et VIT |
| `finisher` | Premier passage sous un seuil de PV : frappe ultime immédiate |
| `sacrifice` | Premier passage sous un seuil : explosion adverse puis KO volontaire |
| `last_stand` | Premier coup normalement fatal : reste à 1 PV |
| `revive` | Premier coup normalement fatal : restaure un pourcentage des PV |

Les effets de riposte/technique ne déclenchent pas de cascades de ripostes. Les impacts enregistrent un snapshot des combattants pour que les animations restent fidèles au résultat exact de la simulation.

## Animation

1. Les cartes de l'équipe active sont positionnées sur le plateau.
2. À chaque `attack`, la carte avance vers sa cible puis revient ; un impact fait trembler brièvement la cible.
3. `skill`, `ultimate`, `heal`, `dodge`, `ko` sont accompagnés de halos/codes sonores synthétiques. La simulation est calculée instantanément, seules les étapes du replay sont animées.
4. Contrôles : pause/reprise, lecture ×2/×4 et résultat immédiat ; la bande son se coupe via SON. Pas de téléchargement audio ni d'abonnement sonore.

## Tests & limites

La graine RNG et les réglages garantissent une simulation reproductible. Les tests automatisés contrôlent notamment les taux standard, 1v1/5v5, les PV, l'absence de boucle, l'unicité de consommation des effets, l'ordre de VIT et une action normale par combattant/round. Ceci **ne prouve pas encore l'équilibrage parfait** : il faudra des simulations statistiques massives pour valider les taux de victoire et les interactions avancées, puis un serveur autoritaire pour les parties publiques.
