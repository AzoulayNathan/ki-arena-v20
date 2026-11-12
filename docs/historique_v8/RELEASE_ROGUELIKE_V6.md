# KI ARENA — ROGUELIKE SOLO V6 · Livraison de gameplay

## Lancement

**Sans installation** : ouvrir `KI_ARENA_ROGUELIKE_V6_JOUER.html` dans Chrome ou Edge. Toutes les illustrations, les ambiances, les scripts, les styles et l'audio sont intégrés dans l'HTML local autonome.

**Pour développement** : `npm start` dans le dossier extrait, puis ouvrir l'adresse locale indiquée par le serveur. `npm test` exécute les régressions du jeu ; `npm run simulate` exécute 800 sessions bot. `npm run build:offline` régénère l'HTML autonome.

## Changements réels

- **Carte de parcours persistante** : 3 couloirs, connexions déterministes, chemins réellement limités aux branches voisines, boss final annoncé, 6 nouveaux décors SVG vectoriels originaux par biome, étapes futures visibles, sélection sécurisée par ID unique.
- **Combat préparé** : écran de pré-combat avec nombre d'adversaires, menace estimée, capacités particulières des boss, possibilité de retraite à coût visible hors boss. Possibilité de récupérer le combat après un redémarrage via un checkpoint de statut.
- **Courbe mathématique** : score des cartes fondé sur ATQ, PV et VIT normalisés puis moyenne de l'effectif, avec bonus d'équipement/relique, cible de puissance ennemie croissant linéairement par zone et étape. L'amélioration de l'équipe n'est répercutée que partiellement sur la difficulté : les bons drops gardent leur intérêt.
- **Boss** : 10 profils (barrière, riposte, AoE, ciblage, régénération, vitesse/esquive, vol de vie, buff collectif, frappe supplémentaire, transformation) construits avec les effets du véritable moteur de combat ; indice avant affrontement ; deuxième phase du moteur conservée.
- **36 scènes à choix** (12 familles × 3 variantes) : trois conséquences disponibles, coûts et risques visibles. Les événements ne s'appliquent plus automatiquement sans validation.
- **Objets** : extension à 17 équipements et 20 reliques, dont bonus conditionnels (survivants, équipement, ressources, recrutements, santé basse), 7 consommables. Une relique ouvre les routes futures, une autre offre une quatrième récompense.
- **Progression et survie** : KO définitif de run, résurrection explicite, équipiers de réserve, objets de soins, packs permanents distribués moins souvent après combats ordinaires, récompenses à choisir et zénis de secours.
- **Mise en scène** : interface Roguelike entièrement restylée autour d'une carte illustrée ; accents par type de destination, animation légère des chemins, réactivité et focus clavier des actions ; fond de combat enrichi, effets de victoire ; règles de réduction des animations.
- **Compatibilité** : les 600 cartes existantes, leur catalogue et leur style n'ont pas été modifiés. Les autres modes ont conservé leur logique. Les sauvegardes de runs V5.2 migrent en conservant les objets/recrues et en régénérant uniquement la carte obsolète ; les anciennes images et le contenu restent dans le projet.

## Détail de la formule de difficulté

Puissance d'une carte : moyenne géométrique normalisée, pondération **ATQ 48 %, PV 39 %, VIT 13 %**. La puissance d'équipe est une moyenne des puissances individuelles, ajustée à l'effectif ; les équipements et les reliques modifient les statistiques calculées, **jamais les statistiques du catalogue**.

Puissance cible ennemie :

`puissance_initiale × [0,54 + 0,045 × (zone−1) + 0,010 × étape + supplément_type] × [1 + 0,18 × amélioration_positive]`

Suppléments : élite +0,08, boss +0,115, défi +0,09. Multiplicateur d'ajustement final limité à **0,83–1,19** pour corriger les trous de puissance du catalogue. Nombre de combattants adverses variable, avec cinq ennemis en élite et boss. Ainsi la cible progresse **par incréments constants** à équipe inchangée : ce n'est ni un palier de rareté arbitraire, ni une croissance exponentielle.

**Attention** : le *score cible* est linéaire ; les probabilités de victoire ne peuvent pas être mathématiquement linéaires, car elles dépendent des synergies, de la santé et des compositions.

## Vérification et limites

Lire `QA_ROGUELIKE_V6.md`. Les tests automatisés, les simulations bot et les contrôles Chromium cités y sont distingués de la validation manuelle sur appareil réel. Les fonctions livrées sont jouables ; **une certification « 100 % sans bug » n'est pas démontrée**.
