# Rapport QA — KI ARENA V22

## Conclusion

Les nouveautés sont codées, intégrées et testées ; le paquet est jouable localement. La qualité finale demandée n’est pas entièrement validée : portraits provisoires, équilibrage insuffisamment convaincant et absence d’essai Windows/file://. STATUS_V22.md expose ces limites sans les masquer. Date de contrôle : 16 novembre 2026.

## Contrôles automatisés

- Baseline avant intervention : V21, Survie JS, V8, items et 12 tests Python réussis (qa/v22/baseline-release.log).
- `npm run test:release` : 28 tests V22, 32 V21, 21 Survie JS, suites V8, contrôle items et 12 Python. Voir release-all.log. Une attente de version du test cache V21 a été adaptée et renforcée pour V22 ; original sauvegardé.
- Invariants V22 : 15 combinaisons d’univers, 60 difficultés × 3 types, soit 2700 compositions ennemies ; budgets exacts, rangs bornés et distincts si possible, absence de reset. 21 000 nœuds intermédiaires vérifiés pour la distribution. Draft : vrais IDs et rangs, rejet d’un ID puissant maquillé en rang faible.
- 20 000 finitions : vérification de la fréquence or/noir/blanc ; bonus or appliqué une fois. Hooks des 28 reliques, armes, cibles, coûts, soins, K.O., état de reprise et idempotence couverts.
- `npm test` reste en échec : 8 réussites / 3 échecs V20 hérités, déjà présents dans la baseline historique. Leurs attentes concernent notamment l’ancien draft/budget/hash. Ces tests n’ont pas été supprimés pour obtenir du vert. Log historical-npm-test.log. L’ensemble des autres suites anciennes hors release n’a pas été réexécuté exhaustivement.

## Simulation et équilibre

`npm run simulate:v22` : 1000 parties réellement renouvelées, 4 politiques simples, 15 pools, 3944 combats, zéro exception. Vingt parties ont passé l’acte 1 ; toutes ont perdu avant trois actes. Profils prudent/puissance/reliques/audace : profondeurs moyennes 8,04 / 8,18 / 7,98 / 6,97 ; passages acte1 : 5/5/4/6 sur 250 chacun. Cela teste la robustesse, pas le plaisir humain. Ce résultat signale une difficulté sévère : l’équilibrage n’est pas déclaré réussi. La formule et les stats verrouillées n’ont pas été modifiées pour embellir les chiffres.

## Parcours navigateur réels

Une nouvelle aventure DB complète son draft de huit choix, équipe une arme, gagne son premier combat, choisit une relique puis enchaîne plusieurs étapes en auto jusqu’à une défaite réelle à l’étape 4. Le bug de contexte qui arrêtait l’auto a été corrigé puis revérifié. L’auto déploie désormais aussi les réservistes plus forts (test dédié).

Le bilan a montré les cartes de l’équipe fatale, ses statistiques et finitions ; le replay a été joué et avancé sans nouveau gain. Un pack gagné a été ouvert puis révélé progressivement : cinq cartes, compteur de packs diminué une seule fois. Les portraits provisoires observés dans ce pack sont un défaut réel, pas masqué dans le rapport.

Un état marchand préparé par les vraies transitions (draft, victoire, récompense, nœud accessible) a permis de vérifier deux recrues et quatre armes. Achat à 28 : 107→79 ; vente d’une arme à 9 : 79→88 ; vente confirmée d’une recrue à 18 : 88→106, équipement conservé. Stocks figés, achat unique, sac mis à jour. Ce test utilise une fixture explicitement signalée, pas une partie naturelle présentée comme telle.

Une fixture événement vérifie deux coûts distincts (45 zénis ou danger au combat suivant), choix figés après reload et panneaux illustrés différents. À 390 et 768, clientWidth=scrollWidth ; le débordement interne des choix mobiles est volontaire pour le swipe. Captures dans qa/v22/captures. Desktop réel inspecté autour de 1360 px ; tablette/mobile sont des largeurs de viewport, pas des appareils physiques.

Le HTML autonome est vérifié par son manifeste de build et chaque payload décodé ; les scripts sont analysés par Node. Voir build.log et integrity.log. Son chargement navigateur HTTP est documenté dans browser-proof.json. L’ouverture directe file:// a été bloquée par les règles de cet environnement et n’a pas été contournée. Windows natif non testé.

## Images, sons et limites

4938 assets V21 inchangés ; 46 nouveaux assets : six scènes originales, 28 icônes de reliques, douze pictogrammes de catégories d’armes. Manifeste avec empreintes et provenance fourni. Les pictogrammes ne sont pas des illustrations canoniques exactes. Catalogue hérité : 3022 cartes, 7 portraits exacts revus, 43 partagés revus, 2632 non revus et 340 placeholders. Aucun prétendu scrap complet.

Audio original synthétisé, tests du volume/mute et des événements ; pas d’écoute humaine certifiée. Mouvement réduit pris en compte ; pas de validation matérielle tactile exhaustive. Tous les mini-jeux et toutes les langues ne sont pas certifiés par un nouveau parcours manuel complet.

## Intégrité et packaging

`npm run verify:package` contrôle les 4942 fichiers protégés, la fraîcheur du build, tous les assets embarqués et la syntaxe inline. `npm run package` contrôle le CRC et les octets SHA256 de chaque fichier archivé. Le reçu VERIFICATION_ZIP_V22.json fournit taille et SHA256 du ZIP. Le contrôle qualité global conserve un code non zéro tant que les FAIL/BLOCKED restent ouverts.
