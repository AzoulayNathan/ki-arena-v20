# KI ARENA V23 — état réel de la livraison

La correction fonctionnelle est intégrée. La certification de produit entièrement fini reste **NON VALIDÉE** pour les points ci-dessous.

| Sous-système | État | Preuve |
|---|---|---|
| trois_gains_cumules | **PASS** | Personnage (2 visibles + mystère), arme (2 visibles + mystère), puis soin25 OU relique ; tests V23 et parcours navigateur naturel. |
| atomicite_reprise | **PASS** | Jetons par gain, transactions, snapshot par étape, verrou du mystère, contrôle de révision avant mutation et protection de sauvegarde contre une fenêtre ancienne. |
| armes_apres_remplacement | **PASS** | Tirage au début du draft d’armes, après le remplacement ; régression reproduite depuis simulation325 dans tests/test-v23.mjs. |
| draft_difficulte | **PASS** | 2700 rencontres V22 + 5400 rencontres V20, 60 difficultés, 15 pools ; 15000 drafts historiques actualisés et 900 séquences de gains V23. |
| regression_courante | **PASS** | npm test ; qa/v23/final-tests.log : V23, V22, V21, Survie, V8, items, Python12 et V20. |
| random_et_bonus | **PASS** | Aléatoire crypto, offres figées dès affichage ; tests V22 20000 finitions : or10 / noir45 / blanc45 ; bonus or appliqué une fois. |
| marchand_inventaire_evenements | **PASS** | Contrats V22 maintenus : marchand2+4, vente uniquement sur place, 28 reliques, 16 événements ; tests V22 et parcours V22 conservés. |
| simulations | **PASS** | 1000 parties indépendantes, 4708 combats, zéro exception après correction ; qa/v23/simulation-1000.json. |
| images_branchement | **PASS** | 38 sources officielles contrôlées ; 132 placeholders remplacés ; tests identité, empreinte et existence locale ; références partagées signalées. |
| responsive | **PASS** | Jeu réel en iframe 390/768 et desktop autour de1360 ; absence de débordement global. Carousel lisible et progression des trois gains. |
| integrite | **PASS** | npm run verify:package : 4942 empreintes historiques, chaque asset embarqué, fraîcheur du HTML et syntaxe inline. |
| portraits_complets | **FAIL** | Restent 208 placeholders et 2632 portraits hérités non revus. Les références partagées ne certifient pas chaque transformation. |
| equilibrage_humain | **FAIL** | 72/1000 bots simples passent l’acte1 ; amélioration par rapport aux20/1000 V22, mais taux sévère et aucune recette humaine. Stats et budget verrouillés conservés. |
| anciennes_suites_globales | **FAIL** | npm run test:legacy-all conserve un échec V193 sur un hash historique déjà différent en V22 (src/survival/encounter.js). Les suites suivantes de cette chaîne ne sont pas toutes certifiées. |
| windows_natif | **BLOCKED** | Environnement Linux ; lanceur Windows fourni, pas de Windows natif disponible. |
| file_double_clic | **BLOCKED** | file:// refusé dans cet environnement ; aucun contournement. Intégrité et exécution HTTP du HTML contrôlées séparément. |
| audio_et_tactile_materiels | **BLOCKED** | Routage audio/mute testés ; pas d’écoute humaine ou d’appareil tactile physique certifiés. |

`npm run verify:package` = intégrité technique uniquement. `npm run check:release` doit sortir avec2 tant que les FAIL/BLOCKED subsistent. Le reçu externe VERIFICATION_ZIP_V23.json vérifie chaque fichier archivé et le ZIP complet.

HTML autonome via HTTP : **PASS**, flux complet des trois gains, images locales et polices vérifiées. Contrôle20testsV23. La capture précède le dernier ajustement de couleur des étiquettes ; ce réglage est vérifié par le contraste calculé.
