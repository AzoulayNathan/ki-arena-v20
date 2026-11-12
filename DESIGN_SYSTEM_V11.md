# Arena Impact 11 — direction et implémentation

## Langage graphique

Interface ivoire et graphite, orange pour l’action principale, cyan pour l’énergie et vert pour les PV. Cartes sombres à coins partiellement arrondis, filet métallique discret, bande d’univers, portrait séparé des statistiques. Les cadres et textes sont rendus dans l’interface, jamais aplatis dans une image.

La collection et les finitions historiques sont inchangées dans leurs modes. Le nouveau cadre de terrain est une couche de présentation indépendante. Aucun portrait de personnage n’a été généré pour cette livraison ; les ressources manquantes restent explicitement signalées.

## Ressources

assets/v11/ : six paysages WebP, world-map.webp, impact-atlas.webp (4 × 2 images d’impact avec alpha), objects-atlas.webp (4 × 2 objets). Prompts exacts : docs/V11_ASSET_PROMPTS.json. Création avec l’outil intégré de génération d’images, puis encodage WebP pour la distribution. Paysages 1 672 × 941, carte 1 024 × 1 536. Ce sont des illustrations éditoriales pour le projet, pas des captures du jeu ni des assets officiels.

Seuls les objets correspondants reçoivent l’image : bâton magique, épée de Trunks, armure de combat Saiyan, scouter, Senzu, Dragon Radar, kunai et chapeau de paille si présent dans le pool autorisé. Les autres gardent un pictogramme d’effet honnête. Une épée Z ne reçoit pas l’illustration de celle de Trunks.

## Combat

HTML pour les cartes, informations et commandes. Une couche PixiJS 8.22.0 pour les trajectoires, anneaux, particules et impacts ; repli Canvas2D si l’initialisation graphique échoue. Bibliothèque incluse localement dans vendor/ et intégrée au HTML autonome. Aucun CDN requis au lancement.

Familles : frappe, rayon, projectile, lame, éclair, combo, riposte, soin, protection, esquive, aura, altération, KO. Sélection par événement réel et nom de technique ou arme. Déclinaison chromatique par univers. Une famille générique reste possible lorsque la technique n’a pas d’illustration spécifique ; aucune animation articulée de personnage ni animation Spine n’est incluse.

Les effets n’écrivent ni dégâts, ni PV, ni RNG de gameplay. Le moteur calcule l’issue ; l’interface lit ses événements. Pour les impacts, l’affichage des PV est différé jusqu’à la collision. Pause, ×2 et Passer restent accessibles. Le rendu utilise une scène partagée, un nombre limité de particules et des animations brèves ; pas de garantie de 60 FPS sur tout appareil.

## Navigation et carte

Le graphe réel de 43 nœuds se superpose au décor. Les rencontres accessibles produisent les grandes cartes de choix. Hover/focus illumine le nœud et la liaison correspondants. Marqueur sur la dernière étape visitée. Carte globale : M, bouton haut ou bouton du tiroir bas. Les sélections impossibles restent impossibles.

Mobile : carrousels locaux pour les choix et rangées de combattants, suivi de l’attaquant/cible, résumé des cinq PV en bas. Les raccourcis de navigation restent accessibles dans la barre haute. Aucun débordement horizontal du document testé à 390, 768 et 1 360 px.

## Validation visuelle

qa/v11/*-390.jpg, *-768.jpg et *-1360.jpg : vraies captures navigateur de la run et des mini-jeux. Les fichiers fx-desktop-*, fx-mobile-* et fx-fallback-* sont un banc de test visuel : événements de présentation contrôlés sur un terrain réel, pas la preuve qu’une capacité particulière a été acquise dans cette run. fx-offline-real-combat.jpg est une capture du déroulement réel du combat dans le HTML autonome.
