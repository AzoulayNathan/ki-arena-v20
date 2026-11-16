# KI ARENA — Survivre à l'infini

## Statut de cette spécification
Règles de design **validées pour prototypage**. Le code joint est un moteur autonome de référence et un simulateur, pas une modification du dépôt original. Aucun mana. Univers Dragon Ball et Hunter × Hunter **séparés** : un seul univers par run.

## Les trois verbes
**Drafter** (5 personnages + 3 armes), **combattre** (piocher, déployer, équiper), **survivre** (choisir une récompense, conserver les vivants, avancer). Maximum 3 combattants sur le terrain au départ ; des artefacts très rares élargissent à 4 puis 5 places. Le deck peut contenir plus de cinq recrues ; seules les places de terrain limitent les simultanéités.

## Parcours du joueur
1. Choisir l'univers puis un seed (facultatif).
2. Cinq sélections successives de personnage ; chaque sélection montre 3 offres visibles et 1 choix mystère. Pas de doublon au draft.
3. Trois sélections d'armes sur la même formule ; des armes sont toujours de vraies cartes de deck.
4. Deck initial : **8 cartes : 5 personnages + 3 armes**. Aucun mana. Main initiale 3 cartes, dont au moins un personnage.
5. Déployer gratuitement les personnages piochés jusqu'au nombre de places ; poser des cartes d'équipement selon leur cadence (gratuites ou une action d'équipement du round).
6. Autocombat : chaque personnage vivant sur le terrain attaque une fois par round, ordre VIT ; capacité spéciale au maximum une fois par combat selon son déclencheur.
7. KO = retrait définitif de la run ; seules les véritables réanimations redonnent le personnage. Victoire : +25 % des PV max des survivants, **aucune** réanimation automatique.
8. Après victoire : XP aux cartes **jouées et survivantes**, puis récompense au choix (3 propositions).
9. Chemins de la carte : combat, élite, boss, repos, boutique, trésor, événement ; l'utilisateur reste libre de choisir un nœud parmi les chemins réellement reliés. Une « vague » numérote l'indice de difficulté des rencontres, pas forcément chaque nœud.
10. Difficulté sans fin : progression linéaire du budget de **rangs** et ajout d'un slot ennemi seulement lorsqu'un plafond est dépassé. Aucune multiplication de stats gratuite au passage de la vague 20.

## Non négociables
- Ne pas remplacer le moteur de combat existant du projet sans tests : le moteur livré prouve la logique et la compatibilité des données.
- L'image et le nom d'une carte doivent provenir de son `id` de catalogue : aucune image inventée ni nom fusionné.
- Le classement se fait par `ATQ + PV + VIT`, tri ascendant, puis ID comme départage stable.
- Toujours afficher une différence visuelle entre cartes-personnages et cartes-équipements, tout en conservant les 10 finitions du Card Studio.
- Les effets de Nen sont des capacités de personnage non transmissibles, sauf proposition explicitement requalifiée en accessoire narratif.

## Interface recommandée
Accueil épuré : « Nouveau run » et « Reprendre ». Draft animé 3 grandes cartes + mystérieuse face cachée, progression 1/5 puis 1/3. Terrain simple : trois places initiales, cartes en main en bas, deck consultable au scroll, petit badge de pioche 1/round, équipements avec icône 🔧, récompenses 3 cartes, chemin fluide. Aucun compteur de mana.
