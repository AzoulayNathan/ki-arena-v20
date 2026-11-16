# Rapport QA V13

## Référence et protections

Source : KI_ARENA_V12_LEGER.zip. Les hashes de src/ et data/ ont été pris avant intégration dans PRE_V13_HASHES.json. Les images du ZIP et le corps exact du renderer `fighter` sont protégés séparément. L’intégration modifie src/arena/ui.js pour brancher le salon et la collection, sans changer le renderer des cartes. Les nouveaux modules et styles sont dans src/party/. Les moteurs, données et finitions sont inchangés.

Les fichiers remplacés sont copiés dans BACKUP_V12 ; le ZIP d’origine reste la source de restauration intégrale.

## Commandes et résultats

| Commande | Résultat | Preuve |
|---|---|---|
| npm run test:v13 | 54 tests PASS, dont 1 000 drafts déterministes | qa/v13/final-tests.log |
| node tests/run-tests.mjs | 17 tests V8 PASS | qa/v13/v8-core.log |
| node --test tests/test-arena.mjs | 19 tests PASS, dont 2 700 rencontres et équipement | qa/v13/arena-tests.log |
| node --test --test-name-pattern="Presentation selects\|Speed and reduced\|Object illustrations" tests/test-presentation.mjs | 3 tests de présentation PASS ; contrôle de hash V11 traité séparément | qa/v13/presentation-behavior.log |
| node --test tests/test-survival.mjs | 21 tests PASS | qa/v13/survival-tests.log |
| node scripts/qa-party.mjs | PASS aux trois tailles et file://, zéro erreur JS/requête externe | qa/v13/browser.json |
| node scripts/qa-preservation-v13.mjs | PASS desktop et mobile, cinq anciens mini-jeux et aventure | qa/v13/legacy/browser.json |
| python build_preview.py | HTML 51 modules / 786 assets, environ 27,3 Mio | Sortie du build et reçu de package |
| python scripts/package_v13.py | CRC, extraction, hashes, reconstruction identique, 54 tests depuis le ZIP | VERIFICATION_ZIP_V13.json livré à côté du ZIP |

Les 54 tests englobent 11 tests nouveaux de soirée, 3 protections V13, 19 Arène et 21 Survie. Ils ne s’ajoutent pas aux mêmes sous-tests pour gonfler le bilan.

## Navigateur : comportements réellement exécutés

- Enchère au prix, retrait, prochain premier joueur, fin de draft, cinq contre cinq et résultat réel.
- Rechargement après ouverture d’enchère et reprise de la même soirée.
- Coupe humaine à quatre : deux demi-finales et finale, trois replays du moteur.
- Garder/tenter, abandon puis équipes et combat.
- Duel des goûts : cinq paires, réponses de deux joueurs, récapitulatif final.
- Collection : recherche Goku, favori, filtre favoris et conservation au rechargement.
- Écrans salon/draft/équipes/combat/résultat/collection à 1360, 768 et 390 pixels ; captures PNG réelles dans qa/v13/.
- Sans serveur : enchères jusqu’au résultat, puis revanche dont les animations aboutissent seules au résultat, sans bouton Passer.
- Ancien parcours : choix de quatre univers, draft huit étapes, carte, fenêtre de carte globale, préparation, équipement, combat, reprise, récompense et audio.
- Les cinq anciens mini-jeux atteignent leur résultat sur desktop et mobile.
- Sans serveur : ancien parcours jusqu’à la récompense, accès à l’application historique et retour.

Les tests navigateur sont automatisés avec un vrai Chromium. Les images ont été inspectées visuellement ; elles ne sont pas des mockups de résultat. Les replays sont de vrais résultats du moteur, pas une démonstration vidéo.

## Corrections découvertes pendant la QA

- Débordement du header sur tablette, puis en aventure mobile : navigation secondaire dans Plus de commandes sur téléphone, cibles de 44 pixels et carte directe conservée.
- Contrôles d’enchère sous la carte sur téléphone : deux actions principales persistantes au bas de l’écran.
- Noms difficiles à identifier avec les substituts de portraits : nom et forme visibles dans le décor hors de la carte, sans toucher son template.
- Export ES module nommé laissé dans le script du HTML V12 : le bundler gère désormais les listes d’exports ; le HTML final démarre effectivement en file://.
- Rejouer utilisait des paramètres fixes : réutilisation des paramètres initiaux de la soirée.
- Demi-finale nulle arbitrairement favorable au premier inscrit : tirage seedé explicitement annoncé, combat enregistré nul.

## Échecs préexistants reproduits, sans les masquer

Le ZIP V12 a été extrait séparément et ses commandes lancées avant d’interpréter les erreurs comme des régressions. Les sorties sont conservées : qa/v13/baseline-npm.log et baseline-arena.log.

1. `npm test` sur V12 intact échoue sur la fixture absente `qa/v93/legacy92-golden.json`. Les essais V9.2/V9.3 actuels conservent cette erreur, qa/v13/v92-v93-tests.log. Aucun golden n’a été fabriqué après coup pour prétendre à la non-régression.
2. Le test de présentation V11 attend un ancien hash de src/arena/engine.js. V12 comporte déjà un autre hash. Ce moteur est resté identique entre V12 et V13 ; le nouveau test le prouve. L’ancien test rouge est conservé.
3. Le test Arène écrivait dans qa/v10 inexistant. Le dossier de sortie a été rétabli ; les 19 tests passent sans changer leurs assertions.
4. `scripts/check-protected.mjs` dépend de data/v7-npm-test.log, absent du pack léger. Log dans protected-legacy.log. Le contrôle V13 vérifie directement la référence effectivement fournie.
5. `reference-survie` est absent ; les douze tests Python ne peuvent pas être exécutés. L’échec est conservé dans python.log. Le moteur JS Survie passe ses 21 tests.

L’ensemble npm historique n’est donc pas annoncé vert. Pour le périmètre livré V13, utiliser `npm run test:v13`.

## Limites et décisions

Local : deux à quatre personnes sur un seul écran, aucun réseau entre appareils. Quinze manches est une limite, pas une durée imposée si toutes les équipes ont cinq cartes. Les passes ne sont dépensées que pour refuser une carte sans offre. Les retraits d’enchère sont libres. Un stock trop étroit peut donner des équipes partielles ; une équipe vide bloque les matchs et explique la relance.

Les paramètres sont validés ; une même carte ne se vend qu’une fois. Les formes d’une identité sont exclusives dans une même équipe. La réserve budgétaire est indicative des places restantes, sans promettre une solution de composition dans tous les filtres. Les résultats sont enregistrés une fois, même en sautant l’animation.

Pas de nouvelle certification des images d’équipement, pas d’ajout de portraits originaux manquants ni de bande originale. Le duel des goûts est en mémoire ; les autres soirées sont persistantes. Export JSON de soirée pour diagnostic, sans import UI. Windows natif n’a pas été testé. Le fichier autonome a été testé sur Chromium Linux, sans serveur et sans requête réseau.
