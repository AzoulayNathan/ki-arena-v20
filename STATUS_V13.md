# État vérifié V13

Livraison locale du nouveau salon multijoueur sur la référence KI_ARENA_V12_LEGER.zip. Ce document prévaut sur les anciens rapports présents dans le projet. PASS désigne uniquement le périmètre et la preuve indiqués, pas une validation globale de toutes les demandes historiques.

| Sous-système | État | Preuve / limite |
|---|---|---|
| Draft aux enchères 2–4 joueurs | PASS | tests/test-party.mjs ; 3 passes et 15 manches maximum par défaut à deux, rotation, surenchères, plafonds |
| Simulations de draft | PASS | 1 000 seeds dans qa/v13/final-tests.log, invariants de budget/effectif/terminaison |
| Tournoi humain | PASS | Coupe quatre joueurs, trois vrais matchs ; navigateur et tests ; ligue trois joueurs testée |
| Garder ou tenter | PASS | Abandon limité à deux, équipes puis combat ; navigateur |
| Duel des goûts | PASS | Cinq paires, réponses collectées puis révélées, récapitulatif ; navigateur |
| Sauvegarde des soirées de combat | PASS | Rechargement en enchère ouverte, clé séparée, résultat idempotent ; tests et navigateur |
| Persistance du duel des goûts / import de soirée | BLOCKED | Non implémentés ; petite partie en mémoire, export diagnostic sans import UI |
| Collection et filtres | PASS | Recherche, favoris et filtres persistants ; captures 390/768/1360 |
| Sources, données, images et renderer des cartes protégés | PASS | Trois tests SHA256 V13, PRE_V13_* ; seule l’intégration UI historique change |
| Moteur et normalisation multi-univers hérités | PASS | 19 tests Arène dont 2 700 rencontres ; moteurs et catalogue inchangés |
| Survie historique | PASS | 21 tests JS dédiés ; pas de nouvelle règle introduite par V13 |
| Noyau V8 | PASS | 17 tests, qa/v13/v8-core.log |
| Parcours aventure et cinq mini-jeux historiques | PASS | qa/v13/legacy/browser.json : 1360 et 390, draft/carte/équipement/combat/reprise/récompense/audio/Arcade |
| Nouveaux écrans responsive | PASS | qa/v13/browser.json : 390, 768, 1360 ; pas de débordement document |
| Combat auto sans passer | PASS | Lecture des événements jusqu’au résultat ; même rapport navigateur |
| HTML autonome file:// sans serveur | PASS | Soirée complète et aventure complète, accès historique et retour ; zéro requête HTTP et zéro erreur JS |
| Build autonome | PASS | 51 modules, 786 assets intégrés ; export nommé V12 corrigé dans le bundler |
| Assets V13 et icônes | PASS | Deux nouveaux décors locaux, famille SVG commune ; inventaire SHA256 |
| Portraits réels complets des personnages | BLOCKED | Absents du pack léger ; substituts V12 conservés, import local existant disponible |
| Fidélité/licences des images d’équipement héritées | BLOCKED | Pas de nouvelle certification ; inventaire honnête, fichiers inchangés |
| Bande originale des œuvres | BLOCKED | Non fournie, non ajoutée ; contrôle et import audio locaux conservés |
| Chaîne npm test historique globale | FAIL | Échec déjà reproduit depuis le ZIP V12 intact : fixture qa/v93/legacy92-golden.json absente ; autres contrôles historiques incomplets détaillés dans le rapport |
| Douze tests Python de référence | BLOCKED | reference-survie absent du ZIP léger ; scripts/test_reference.py ne peut pas les exécuter |
| Hash ancien de présentation V11 | FAIL | Même écart moteur déjà présent dans V12 ; baseline conservée, aucune valeur attendue réécrite pour rendre le test vert |
| Lanceur Windows | PASS | BAT CRLF visant le bon HTML ; serveur ouvre le navigateur si win32 |
| Exécution Windows native | BLOCKED | Environnement de QA Linux ; aucun essai Windows déclaré |
| ZIP complet | PASS | Contrôle CRC, hashes après extraction, rebuild autonome identique et 54 tests après extraction exigés par scripts/package_v13.py ; reçu VERIFICATION_ZIP_V13.json livré à côté du ZIP |

Les fonctions ajoutées sont jouables ; les limites du matériel fourni et les contrôles historiques incomplets empêchent d’affirmer que l’intégralité du mandat V9 à V13 est validée.
