# Rapport QA — Horizons

## Portée réelle

Construction à partir du ZIP V19.3 fourni. Modules V20 isolés ; carte et boss existants conservés sur instruction du joueur. Le renderer de cartes, les finitions et les CSV sources restent intacts. Sources de restauration incluses. Aucun nouveau mini-jeu ni remplacement du moteur historique.

## Commandes et résultats

| Commande | Résultat |
|---|---|
| npm test avant modification | exit 0 — baseline.log |
| npm test après intégration | exit 0 — final-tests.log ; 10 tests V20 à cet instant + 117 tests Node historiques et vérifications V8/items |
| node --test tests/test-v20.mjs final | exit 0 — 11 tests, dont le test supplémentaire défaite/réserve/Panthéon |
| node scripts/simulate-v20.mjs | exit 2 — 1 000 runs, aucun acte terminé, zéro exception |
| python build_preview.py | exit 0 — HTML 46,39 MiB, 836 assets, 114 modules |
| python scripts/test_reference.py | exit 1 — dossier reference-survie absent, pas de réussite revendiquée |
| python scripts/verify_v20.py | contrôle hashes, assets embarqués et syntaxe de chaque script ; voir integrity.json |
| python scripts/package_v20.py | CRC et comparaison SHA-256 de chaque fichier archivé ; reçu externe |

## Tests V20

15 000 drafts répartis sur les quinze combinaisons de mangas, en alternant harmonisé/original. Vérifications : propositions légales, héros jamais légendaires au départ, bandes figées, composition finale d’au moins trois héros, six choix exactement et validation des sauvegardes. La probabilité brute 70/30 par offre est conditionnée par la compatibilité et la garantie de trois héros ; elle ne promet pas 70/30 dans chaque équipe.

5 400 rencontres : difficultés 1 à 60 × 15 pools × 2 modes de statistiques × 3 types. Chaque somme de rangs est égale au budget source. Test séparé du maintien des actes et boss. Une formule exacte n’est pas une preuve de bon équilibrage.

Autres tests : somme cible de normalisation conservée, stats originales inchangées ; clés V19 intactes, sauvegarde/import/export V20 ; packs progressifs, mondes, idempotence et panne atomique ; ciblage de l’avant-garde ; états, absorption et K.O. réels ; actions d’événement impossibles bloquées ; défaite immédiate malgré réserve et photographie finale pour le Panthéon.

## Parcours navigateur observé

Accueil → setup DB harmonisé → six choix → vraie carte → préparation → sac → Fusil de Lunch sur Idasa avec comparaison ATQ 37→40 → réordre de l’équipe → combat automatique → pause → passage → victoire avec K.O. d’Idasa → récompense Nok affichée sous forme de vraie carte → recrutement → événement Autel de puissance → comparaison puis confirmation d’une issue → retour à la carte. Carte complète ouverte en un clic.

Collection : recherche Goku et résultats vérifiés. Arcade et Power Duel ouverts. Réglages et accès créateur N vérifiés. Panthéon : import d’un souvenir issu du moteur (FULL20-0, données dans qa/v20/fixtures), photographie et filtres affichés. Ce souvenir importé ne remplace pas la preuve d’une run humaine terminée.

Captures JPEG réelles dans qa/v20/browser : accueil, carte, sac, combat, récompense, événement, collection, arcade, draft mobile/tablette/desktop, réglages, Panthéon. Certains écrans ont été recadrés ensuite par les corrections CSS : les captures intermédiaires ne constituent pas toutes une preuve du tout dernier espacement.

Responsive : fenêtre de recette 390 et 768 px ; clientWidth/scrollWidth égaux (375/375 et 753/753, hors barre de défilement). Desktop proche de 1360, largeur disponible mesurée 1333 dans la fenêtre. Les carrousels horizontaux intentionnels restent défilables ; pas de débordement horizontal de la page dans ces états. La première proposition du draft mobile a été recentrée après observation. Le menu mobile ouvre les commandes audio/réglages. La tentative de drag a rencontré un timeout de l’outil ; aucun geste tactile physique validé.

## Calibration : résultat non validé

Quatre politiques : novice, puissance, synergie, risque ; huit groupes de 125 runs en harmonisé/original, répartis sur quinze pools. Aucun acte terminé. Étape résolue moyenne d’environ 2,81 à 5,19 selon le groupe. Les premières campagnes V19 fournies avaient également zéro acte terminé ; ce résultat demeure un problème de design. La priorité visuelle et la conservation du système actuel n’autorisent pas à maquiller la formule ou annoncer une balance réussie. Voir full-run-1000.json, avec statistiques par étape et exemples de seeds.

## Art et contenu

Quatre décors originaux générés, intégrés en WebP et sources PNG incluses. Ils apportent onze scènes, sans faux portraits de personnages. Provenance/poids/hash dans MANIFEST_ASSETS_V20.csv ; les anciens manifestes restent valables pour les images héritées.

Les portraits DB génériques et les portraits absents HXH/Naruto/One Piece restent une limite visible. Aucun scraping externe finalisé dans cette passe. Les images/pictogrammes d’objets existants sont conservés. Les variantes de capacités Naruto/OP sont des adaptations éditoriales ; leur diversité de paramètres (17/18) ne prouve pas 17/18 stratégies distinctes ni une fidélité canonique complète. CAPACITES_V20.csv conserve le statut REVIEW.

## Limites de sortie

Le HTML est reconstruit et ses assets sont vérifiés octet pour octet, sans dépendance de chargement JS/CSS externe. Le navigateur de recette refuse le protocole file:// : aucun contournement, et aucune validation de double-clic ou de Windows natif revendiquée. Les douze tests Python ne peuvent pas s’exécuter sans leur référence absente. Tous les mini-jeux n’ont pas reçu une recette manuelle complète. Aucun test humain ni mesure de FPS de référence.

Ce package est une version jouable avec amélioration visuelle réelle, pas une certification de produit entièrement finalisé.
