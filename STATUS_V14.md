# État de livraison · KI ARENA V14

Mise à jour : 4 novembre 2026. Base V13 fournie + pack de direction V14. Les dernières demandes remplacent la main de cartes dans Arène par une équipe automatique à cinq ; Deck Survival reste distinct. Aucun « 100 % » global : les blocages ci-dessous restent ouverts.

| Sous-système | État | Preuve |
|---|---|---|
| Application locale et HTML autonome | PASS | build.log ; full/browser.json ; party/browser.json ; media/browser.json, parcours file:// |
| Draft deux visibles + mystère, 5+3 | PASS | final-tests.log ; smoke.json ; full/browser.json |
| Bandes 25–35 / 15–45 / 0–60 sur taille source fixe | PASS | test-v14.mjs, 15 combinaisons d’univers ; métadonnées d’offre persistées |
| Univers sélectionnables et normalisation proportionnelle | PASS | catalogue intact, tests des 15 pools, rank-simulation.json |
| N, budget exact, vrais IDs, distincts si possible jusqu’à 60 vagues | PASS | 2 700 000 générations ; rank-simulation.json ; DIFFICULTE_V14.csv |
| Dix étapes et boss obligatoire ; acte suivant | PASS | test-v14.mjs ; natural/browser.json, seed PROFILE-0 sans injection |
| Auto-combat, K.O., soins survivants et XP jouée | PASS | tests JS ; simulations ; résultat navigateur réel |
| Perte de boss sans blocage et récompense unique | PASS | tests ciblés ; ancienne rencontre conservée |
| Équipement au clic, drag, remplacement et réserve | PASS | full/browser.json desktop/mobile ; tests de compatibilité et PV conservés |
| Événements et coûts réels | PASS | tests paiements/pacte/vente/fusion ; aperçu et confirmation navigateur ; combat forcé |
| Six décors, chemins réels, icônes et carte en une commande | PASS | full/browser.json ; captures act-1 à act-6 ; assets-audit.json |
| Responsive 390/768/1360 et toucher/clavier/mouvement réduit | PASS | smoke.json, full/browser.json et party/browser.json ; pas de débordement parasite dans la recette |
| Cinq jeux solo et quatre jeux locaux entre amis | PASS | parcours terminés dans full/browser.json et party/browser.json |
| Collection, filtres et favoris persistants | PASS | party/browser.json, trois tailles |
| Bilan, contributions stables, repli et Panthéon | PASS | tests pantheon/metrics ; natural/browser.json |
| Sauvegardes distinctes, reprise et rejet des doubles actions | PASS | tests de transaction/migration ; rechargements navigateur |
| Cartes, CSV, finitions et moteurs historiques protégés | PASS | PRE_V14_HASHES.json ; test de rendu fighter ; suite V8 |
| Compatibilité des runs V13 | PASS | 60 drafts et 540 rencontres comparés à legacy-v13-golden.json issu du code original |
| Catalogue objets du mode automatique | PASS | 95 actifs exécutés, 68 exclus ; LISTE_ITEMS_IMPLEMENTES.csv ; items-execution.json |
| Imports de portraits et finitions séparés | PASS | media/browser.json ; normal et spécial distincts après reload |
| Audio local et contrôle de volume | PASS | import/lecture/arrêt/volume persistant dans media/browser.json |
| Inventaire de 806 assets locaux | PASS | MANIFEST_ASSETS_ET_DROITS.csv ; assets-audit.json, décodage réel |
| Archive complète et reconstruction | PASS | VERIFICATION_ZIP_V14.json livré à côté : CRC, hashes extraits, HTML identique, tests après extraction |
| Portraits réels complets des quatre univers | BLOCKED | Pack source léger incomplet ; substituts d’origine ou rendu explicite, imports locaux disponibles |
| Nouvelles images exactes d’équipements | BLOCKED | image-refresh.json : accès HTTP bloqués ou source absente, zéro application non validée |
| OST originales des œuvres | BLOCKED | Aucun fichier fourni ; musique locale importable, bruitages présents |
| 12 tests du pack Python de référence | BLOCKED | reference-survie absent de la source fournie ; python-reference-blocked.log |
| Chaîne de tests historiques V9.3 intégrale | BLOCKED | Référence qa/v93/legacy92-golden.json absente avant cette édition ; chaîne conservée sous test:historique |
| Exécution native sous Windows | BLOCKED | Environnement Linux ; .bat vérifié et HTML réellement testé sous Chromium sans serveur |
| Équilibre ressenti uniforme | BLOCKED | Formule exacte, mais résultats différents selon profils/univers ; gameplay-simulation.json publié |

Les blocages d’art ne rendent pas les mécaniques fictives : le jeu reste jouable avec les fallbacks explicités. Six thèmes reviennent par cycles ; les jeux entre amis partagent un appareil, sans multijoueur réseau. Les anciens documents V9–V13 décrivent leurs éditions, pas l’état actuel.

Commandes et limites détaillées dans README_JOUER.md et RAPPORT_QA.md. Le script de livraison s’arrête sur tout échec d’un contrôle exigé pour le paquet.
