# État vérifié — KI ARENA V20 Horizons

12 novembre 2026. Livraison jouable construite et contrôlée, **pas une finale certifiée sur tous les critères historiques**. La demande actuelle donne priorité au package visuel et conserve le système de boss existant.

| Sous-système | État | Preuve / limite |
|---|---|---|
| Baseline V19.3 | PASS | qa/v20/baseline.log ; exit 0 |
| Régression complète | PASS | qa/v20/final-tests.log ; exit 0, 117 tests Node historiques + blocs V8 et items |
| Tests V20 finaux | PASS | qa/v20/tests-v20.log ; 11/11 ; exit 0 |
| Données, cartes, moteurs historiques | PASS | hashes qa/v20/protected-before.json ; vérificateur verify_v20.py |
| Retour V19.3 | PASS | BACKUP_V193 + HASHES.json ; procédure README |
| Package visuel | PASS | 4 nouveaux WebP / 11 scènes, PNG sources, manifestes, captures réelles |
| Accueil / navigation / setup | PASS | contrôles desktop, mobile, clavier Entrée ; captures |
| Draft | PASS | 15 000 drafts, 15 pools, deux modes ; centrage 390/768/desktop contrôlé |
| Budgets adverses | PASS | 5 400 rencontres sur difficultés 1–60 ; somme exacte, deux modes, tous pools |
| Boss / actes actuels | PASS | conservés ; test du nouvel acte de 28 nœuds ; pas de réécriture boss |
| Formation / sac / arme | PASS | test ciblage avant-garde ; clic, comparaison, attribution et réordre vérifiés en navigateur |
| États / absorption / KO | PASS | événements réels testés ; premier combat naturel gagné en navigateur |
| Défaite avec réserve | PASS | test V20 ; clôture immédiate et photographie finale de 7 personnages |
| Packs progressifs | PASS | tests 3/5 cartes, mondes, double crédit, panne de stockage ; ouverture animée héritée conservée |
| Événements | PASS | branchement V20 réparé, coûts et invalidité testés ; comparaison/confirmation manuelles |
| Normalisation | PASS | somme de puissance préservée et stats brutes intactes ; profil source proportionnel |
| Capacités canoniques exhaustives | FAIL | overlay éditorial, 17/18 signatures de paramètres Naruto/OP ; validation canonique non exhaustive |
| Bilan / Panthéon | PASS | test + import d’une simulation réelle et capture ; filtres supplémentaires implémentés |
| Collection / arcade | PASS | recherche Goku, filtres visibles, menus contrôlés ; moteurs existants passent leurs tests |
| Recette manuelle de tous les mini-jeux | BLOCKED | un mini-jeu ouvert ; pas de partie complète manuelle de chaque mode dans cette passe |
| Responsive | PASS | accueil/draft à 390 et draft à 768 ; absence de débordement horizontal DOM mesurée ; desktop proche de 1360 |
| Tactile physique / gestes exhaustifs | BLOCKED | aucun appareil tactile ; tentative de drag navigateur interrompue par timeout |
| Calibration agréable | FAIL | 1 000 simulations / 4 politiques / 15 pools : aucun acte terminé ; script exit 2, formule conservée |
| Portraits finaux complets | FAIL | SVG DB provisoires et portraits absents hérités ; aucune prétendue collecte finalisée |
| Audio | PASS | commandes locales et sons existants conservés ; aucune nouvelle musique officielle fournie |
| HTML autonome : structure / assets / syntaxe | PASS | verify_v20.py : assets embarqués identiques + scripts analysés par Node |
| HTML ouvert sans serveur / Windows | BLOCKED | protocole fichier bloqué par l’environnement de vérification ; Windows natif indisponible |
| 12 tests Python de référence | BLOCKED | reference-survie absent ; qa/v20/python-reference.log exit 1 |
| Tests humains / FPS PC de référence | BLOCKED | aucune session humaine ni machine de référence disponible |
| ZIP | PASS | VERIFICATION_ZIP_V20.json externe : CRC et chaque fichier comparé |

Les captures prouvent les écrans concernés, pas une recette exhaustive ni la qualité de tous les portraits. Les échecs de calibration et les validations matérielles manquantes restent des limites essentielles.
