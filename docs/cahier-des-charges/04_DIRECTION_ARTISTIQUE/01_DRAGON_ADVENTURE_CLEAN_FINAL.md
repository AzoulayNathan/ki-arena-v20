# KI ARENA V9 — Direction visuelle définitive

**Nom de direction : Grand Voyage Arcade / Dragon Adventure Clean.** Rechercher un rendu simple, lumineux, joyeux, très soigné, immédiatement compréhensible, fidèle aux codes visuels de DB/DBZ/DBS. Le résultat doit **ressembler à un jeu d'aventure**, pas à un dashboard web ni à un tableau de boutons bleus. Les cartes à collectionner sont déjà verrouillées : **ne jamais modifier leur design**.

## Principes visuels à protéger

1. **Le monde est le héros de l'exploration** : vrais panoramas 2D nets, ciel profond, roches aux silhouettes DB, architecture Capsule, horizon respirant.
2. **Trois gros choix** : les embranchements sont révélés APRÈS un léger mouvement d'avancée ; les grandes cartes de rencontre (illustration, type, danger, gain, CTA) arrivent ensuite par étapes. Le nombre doit refléter les routes réellement connectées ; ne pas ajouter de fausse troisième option.
3. **Inventaire au bas** : bande repliée = portraits existants + PV + poignée ; scroll/swipe vers le haut = Équipe / Inventaire / Reliques / Consommables / Effets ; scroll interne du contenu. En mode Survie, la main à jouer n'est pas dissimulée dans l'inventaire.
4. **Soin du détail** : boutons pressables à états précis, microanimations utiles, transitions silencieuses ou légères, cohérence des icônes et des rares effets sonores.
5. **Respiration** : pas de polices minuscules, dix cadres concurrents, bruit permanent, effet néon constant ou panneaux de grande hauteur recouvrant le paysage.

## Six biomes à produire / adapter

- Terres sauvages : plaines vertes, ciel bleu, arbres stylisés, rochers et caps. Rencontre village / Capsule.
- Désert rocheux : canyons, roches arrondies, arènes naturelles, poussière et lumière chaude.
- Plaines de Namek : lacs turquoise/verts, îlots, plateaux et grands horizons singuliers.
- Ruines urbaines : bâtiments futuristes arrondis abîmés, lumières, air légèrement poussiéreux.
- Arène céleste : escarpements hauts, nuages, plateformes et sensation d'altitude.
- Chambre du temps : vastes étendues blanches, horizon subtil, simplicité étrange et silence.

Chaque biome : au moins trois plans (ciel, lointain, premier plan), variantes de cadrage desktop 16:9 et mobile portrait, 2/3 éléments de vie animés maximum. Les vignettes de rencontres doivent être illustrées à la même échelle artistique. **Pas de fond agrandi/flou pour masquer l'absence d'asset.**

## Timing et transitions

1. Entrée sur carte : 200–300ms de stabilisation.
2. Avancée marqueur : 300–500ms, micro-poussière/ki, et pas de caméra agressive.
3. Trois branches réelles se tracent : 200–350ms avec éclairage discret.
4. Cartes de rencontre arrivent en cascade courte : 80–140ms d'écart, 220–330ms chacune, pas de rebond caricatural.
5. Carte sélectionnée : chemin associé s'éclaire et la vignette sort légèrement ; CTA clair. Clic répété désactivé.
6. Validation : déplacement vers le nœud en 300–500ms, puis véritable écran de rencontre.
7. `prefers-reduced-motion`: aucune animation obligatoire, tout visible et actionnable immédiatement.

Ce sont des **cibles d'animation**, pas des obligations ralentissant la partie. Vitesse x2 et skip utilisables.

## Schéma desktop

HUD discret haut : zone/étape, zénis, packs, Dragon Balls, bouton pause. Au centre : grand environnement et les trois cartes illustrées connectées aux chemins. Dans le bas : bande équipe/inventaire fermée avec accès immédiat ; volet ouvert sur demande. La carte complète se consulte sans devenir le centre permanent du jeu.

## Schéma mobile

Header compressé, panorama recadré proprement, trois destinations en carousel horizontal suffisamment larges pour lire sans zoomer, indicateurs de pagination ; nœuds et parcours cohérents avec le desktop. Tiroir bas avec safe-area. Aucune barre de navigation fixe coupant la carte. Boutons suffisamment larges, pas d'écran nécessitant survol.

## Menus et rencontres

- Combat : équipes face à face, attaque/impact lisibles, barres PV intactes, effets selon événements réels.
- Boss : véritable intro courte, symbole, nom et mécanique annoncée, pas d'écran aveuglé par des particules.
- Trésor / rewards : trois propositions visuelles spacieuses, micro-révélation, comparaison d'effet.
- Marchand : boutique Capsule chaleureuse avec vrais objets, prix, état achetable.
- Repos : ambiance calme ; 2 ou 3 actions lisibles (soins, entraînement, réanimation SI autorisée).
- Inventaire : présentation claire des items, catégories, effets utiles, fonds neutres ; des objets non équipables ne sont pas déguisés en armes.
- Bilan : parcours, profondeurs, pertes, survie, récompenses, recommencer.

## Palette et composants

Bleu nuit `#0D1F3A`, acier `#20476B`, orange énergie `#FF942F`, or `#F6C35A`, cyan `#4ED6CF`, violet `#9972ED`. Les personnages/objets et les scènes sont les couleurs principales ; UI parcimonieuse. Utiliser des contours nets, de légères ombres et textures sobres. Rareté = finesse du cadre, pas aura géante omniprésente.

## Exigences assets et droits

- Art 2D authentiquement illustré, cohérent entre biomes, rencontres et objets ; optimize en WebP/PNG/SVG local. Ne pas coller une capture de maquette comme fond d'écran : les boutons et éléments doivent être réellement interactifs.
- Les images de concepts dans `05_PREVISUALISATIONS/CONCEPT_*` représentent une **intention visuelle**, pas des UI à découper ni des assets sous licence.
- Les personnages/finitions existants DB sont conservés intacts ; pour HXH, utiliser les sources réelles et vérifier droits/compatibilité. Les éléments artistiques nouveaux doivent avoir un `MANIFEST_ASSETS_ET_DROITS.csv` avant livraison publique.
- Tests réels sur 390/768/1360 px, des scènes complète, mouvement réduit, vraie navigation clavier/tactile.

## Ce qui signale une vraie réussite

Un nouveau joueur comprend où il va, ce qu'il risque, ce qu'il gagne et comment équiper un objet **en moins de dix secondes**. Les 3 choix sont beaux sans être chargés. Le monde donne envie d'avancer. Les rares coups spéciaux et récompenses prestigieuses ont un impact net. Aucun effet de présentation ne rend le gameplay plus compliqué.
