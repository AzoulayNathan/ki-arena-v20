# KI ARENA V7 — Design System Roguelike / Arcade Adventure

## Portée

Cette surcouche ne retouche **aucun template, statistique, animation intrinsèque ou illustration de carte**. Elle est scoppée à `.rogue-v7`, `.is-rogue-page` et `.rogue-battle`. Le moteur V6, ses sept autres modes et l'économie restent en place.

## Direction artistique

Arcade Premium + Aventure Cosmique, avec impacts Anime Fighting uniquement aux moments critiques. Les six scènes vectorielles originales de `/assets/rogue/` partagent les mêmes conventions graphiques (ciel nuancé, halo de lumière, trois plans de relief, détail d'architecture, éléments de premier plan) : `wilderness`, `desert`, `namek`, `ruins`, `sky`, `void`.

| Token | Valeur | Usage |
|---|---|---|
| Bleu nuit | `#0D1F3A` | Arrière-plan, scène |
| Bleu acier | `#20476B` | Surfaces et HUD |
| Orange énergétique | `#FF942F` | Action primaire, combat |
| Or | `#F6C35A` | Récompense, boss, monnaie |
| Cyan Ki | `#4ED6CF` | Survie, soin, chemin actif |
| Violet | `#9972ED` | Événement, mystère |

## Hiérarchie visuelle

1. **HUD** — zone et étape + zénis, packs, Dragon Balls, survivants + progression vers le boss.
2. **Scène principale** — carte connectée ou écran de rencontre; elle reçoit la priorité d'espace.
3. **Équipe** — cinq portraits miniatures avec jauges PV; état KO visible.
4. **Panneaux à la demande** — composition complète, inventaire, reliques, utilisation des objets.
5. **Actions secondaires** — sortie/abandon et retour à la navigation générale.

## Nœuds de la carte

- Un emblème circulaire et un socle labellisé; le boss adopte une silhouette distincte.
- Typologie colorée : orange (combat), turquoise (repos), violet (événement/défi), or (trésor/marchand), rouge (élite), prisme/rouge-or (boss).
- États : `reachable`, `muted`, `cleared`, `is-boss`; distinguer l'accessible, le futur et le terminé.
- Connexions : clair/or pour chemin passé, cyan lumineux pour la suite immédiatement accessible, gris bleuté pour les futures voies.
- Aucune zone non connectée n'est rendue sélectionnable : c'est le moteur d'itinéraires V6 qui décide.

## Motion / retours d'action

- Boutons : translations faibles (2–4 px) et relief physique; effet de pression sans rebond prolongé.
- Lieux : lueur légère, panorama à couches, brume et halo très lent.
- Combat : effets d'impact et de protection rattachés aux événements déjà calculés par le moteur.
- `prefers-reduced-motion` coupe les animations décoratives V7.
- La simulation et les accélérations de combat restent découplées des animations.

## Responsive

- **≥ 781 px** : écran principal + barre latérale de 276 px (238 px sous 1100 px).
- **≤ 780 px** : scène pleine largeur, puis aperçu des cinq personnages en ligne; gestion et sac en tiroirs HTML `<details>`.
- **≤ 520 px** : HUD sur deux lignes, destination principale conservée à taille tactile, navigation inférieure générale masquée pendant la run.
- La carte conserve l'ordre et les connexions de la V6 sur tous les écrans.

## Préservation de l'existant

- Fichiers de données inchangés; aucune modification de `src/v52.css` ou de la fonction de rendu `card()`.
- Les illustrations de portrait sont réutilisées uniquement dans le HUD et dans les previews, sans modifier leur design.
- Tous les nouveaux SVG sont des décors de biome, pas des illustrations de carte.
- Le mode fan-made reste non officiel.
