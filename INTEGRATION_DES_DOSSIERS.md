# Raccordement des dossiers fournis à la version 9.2

Les documents ne sont pas traités comme des écrans déjà développés. Le moteur Survie et ses interfaces sont exécutés en JavaScript. Les originaux du pack de règles sont conservés dans `reference-survie/` ; les spécifications produit, visuelles et de recette sont recopiées dans `docs/cahier-des-charges/`.

| Source | Réalisation exécutable | Vérification |
|---|---|---|
| V8 réelle, catalogue, cartes et battle | Fichiers historiques conservés, adaptateur Survie séparé | Hashes de689 fichiers et de card(), tests V8 |
| Contrat produit et séparation des modes | Accueil dédié, Rogue One et Survie Infinity distincts, clés séparées | Sept classiques + parcours DB/HXH par navigateur |
| Docs01–02 Survie : boucle et draft | catalog.js, draft.js, state-machine.js, draftView | 5+3, 3 visibles+mystère pré-tiré, identité unique |
| Doc03 : difficulté exacte | encounter.js, distributeExact | 360000 rencontres ; budgets et plafonds18/19/20/21 |
| Doc04 : deck, pioche et équipement | deck.js, equipment.js, battle-adapter.js | 3 cartes, pioche1, terrain3→5, arme+armure, action0/1 |
| Doc05 : mort, XP, récompenses | progression.js, rewards.js | KO purgés, soin25%, XP joués/survivants, transformations autorisées |
| Docs06–07 : catalogues d’objets | Compilation des43+55 sources, 77 actives, 21 exclusions | Rapport par ID, exécution de chaque item proposé |
| Doc08 et architecture / migration | Modules ES JavaScript et bundler autonome, version des règles | Build offline, reprise RC1 et schéma0, clés V8 préservées |
| Doc09 : fidélité et limites | Nen personnel exclu, statut source visible, éditorial identifié | LISTE_ITEMS_IMPLEMENTES.csv, DECISIONS_V9.md |
| Doc10 et recette complète | Tests unitaires, simulations, recettes navigateur | Rapports bruts dans qa/, captures réelles |
| Items et économie | Marchand, coûts, anti-doublon, récompenses applicables, poses ciblées | Achats atomiques, limites d’usage et de pioche, comparaisons exactes |
| Difficulté et équilibrage | Budget source inchangé, danger qualitatif, économie mesurée | 6000 runs de la révision9.2 ; mur de difficulté toujours signalé |
| Dragon Adventure Clean | Accueil et typographie refaits, dix scènes locales, cartes dans le panorama | captures/home, map, rogue-v8 ; fonts et assets offline |
| Chemins / transitions | src/adventure.js relie les cartes aux marqueurs ; seulement les destinations accessibles | Mesure de géométrie, deux routes V8 après embranchement, carte complète consultable |
| Sac inférieur | Cinq onglets dans les deux aventures, actions et filtres réels | Toucher, clavier, catégories V8, absence de recouvrement du terrain |
| Responsive / mouvement | 390/768/1360, carousel, focus, ×2/skip/reduced-motion | Rapports navigateur / viewport / offline PASS |
| Windows et livraison | .bat, serveur4173, HTML autonome avec assets intégrés | file:// hors ligne testé ; Windows natif reste non exécuté |

## Points qui restent ouverts

- Deux capacités personnelles de résurrection DB ne s’appliquent pas dans Survie, qui réserve cette exception à un objet dédié. Leur comportement V8 ne change pas.
- Les sources ne fournissent pas les portraits HXH : rendu textuel jouable explicitement annoncé.
- Le budget exact ne garantit pas un bon équilibrage des longues runs ; les simulations montrent encore un mur fréquent vers les vagues4–6.
- Aucun PC Windows n’est disponible pour certifier l’exécution native. Les droits et le canon des catégories d’objets ne sont pas certifiés indépendamment.

Ces limites empêchent de présenter la livraison comme intégralement finale. Elles sont détaillées avec états PASS/FAIL/BLOCKED dans `STATUS_V9.md`.

## Ajouts 9.2 après audit du résultat

Le flux de combat tient désormais dans le viewport ; Carte/M et Sac restent accessibles. Les boss ont un chef du catalogue et une barre de PV, avec budget exact. Le nouveau Combat auto permet de composer cinq cartes et appelle le moteur V8 inchangé. Les animations lisent les événements et techniques réels. La preuve des placements et la comparaison avant/après se trouvent dans AUDIT_V9_2.md et qa/v92-browser-report.json.

## Complément9.3

Voir AUDIT_V9_3.md pour les décisions d’économie, le verrouillage des anciennes règles, les fiches et la correction AFTER_HIT_OR_DODGE. Aucun CSV de personnage, asset historique ou moteur V8 n’a été modifié.
