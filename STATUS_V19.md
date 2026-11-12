> Passe actuelle : STATUS_V193.md. Le contenu ci-dessous décrit une version historique.

# État actuel V19.1

La recette actuelle de la modification est qa/v191/ : défaite immédiate, dernier effectif au Panthéon, bilan et nouveaux effets. Voir RAPPORT_QA_V191.md. Images complètes : BLOCKED. Équilibrage : non recalibré. Les tableaux suivants sont l’audit de la base V19, à lire comme historique ; leurs empreintes ne certifient pas le build V19.1.

# État KI ARENA V19 · Portrait Clean

**Build jouable localement, polish intégré. Acceptation globale : FAIL.** Le moteur et les interfaces passent leurs contrôles fonctionnels ; les portraits complets, l’équilibrage du premier acte et la validation Windows native empêchent de qualifier ce résultat de version totalement finale ou « 9/10 ».

| Sous-système | État | Preuve / limite |
|---|---|---|
| Référence pré-V19 et intégrité V18 | PASS | PRE_V19_HASHES.json, BACKUP_V18/, npm test ; tous les anciens src/data/assets/tests identiques |
| Navigation, boutons droits, focus | PASS | qa/v19/browser : 390, 768, 1360 ; navbar sombre à libellés clairs |
| Noir/blanc/doré 45/45/10 | PASS | 100 000 tirages dans qa/v19/finish-distribution.json ; RNG de run inchangé |
| Cinq gabarits, plus d’image, techniques conservées | PASS | 3 022 fiches et 1–5 techniques contrôlées ; qa/v19/cards/report.json |
| Centrage du draft et mobile | PASS | Captures et mesures de centrage ; aucun débordement documentaire en 390/768/1360 |
| Six choix, plages faibles N/600, mystère pré-tiré | PASS | qa/v19/draft-1000.json ; propositions incompatibles désactivées, repli d’épuisement documenté |
| Fusion harmonisée/brute et sauvegardes séparées | PASS | tests/test-v19.mjs ; UI brute testée ; anciennes clés conservées |
| Formule et distribution adverses | PASS | qa/v19/budgets-60.json : 5 400 rencontres, 15 pools × 2 modes × 60 vagues × 3 types |
| Rangs distincts quand mathématiquement possibles | PASS | Test sur toutes ces rencontres, plafonds des vagues 18/19/20/21 inclus |
| Récompense unique, magasin, événements | PASS | Tests de mutation/reprise et qa/v19/events-all-branches.json ; aucun gain sur nœud déjà résolu |
| Vraie carte de recrue, cadres d’armes, liaison ID | PASS | Captures récompense/collection/sac, import de portrait exact et rejet du mauvais univers |
| Carte et six actes | PASS | Six scènes conservées, disposition desktop revue, M et bouton Carte fonctionnels |
| 17 événements dont 3 nouveaux rares | PASS | Branches réellement exécutées, scènes locales et captures ; choix prévisualisable puis confirmé |
| Arcade, jeux visuels, enchères et tournoi | PASS | qa/v19/modes, extras, party ; résultats obtenus par les interactions réelles |
| Atelier, recadrage, PNG HD, projets | PASS | Export 900×1350, 15 PNG d’étude, recadrage/import dans le jeu et reprise du projet |
| Rotation au toucher / mouvement réduit | PASS | Entrées tactiles CDP, retour au repos et désactivation en mouvement réduit |
| Accès créateur N | PASS | Réglages → Accès créateur ; diagnostics F8 vérifiés |
| HTML autonome hors serveur | PASS | file://, requêtes HTTP(S) interdites, draft/portraits/import/arcade/partie locale vérifiés |
| ZIP, extraction, rebuild et tests après extraction | PASS | VERIFICATION_ZIP_V19.json joint à la livraison ; manifeste des mêmes octets, CRC et rebuild identique |
| Équilibrage d’une run entière | FAIL | qa/v19/full-run-1000.json : 0 premier acte franchi / 1 000 runs, deux profils ; progression atteint parfois l’étape 10. Aucune correction cachée de la formule |
| Tous les portraits fidèles / images exactes d’équipement | BLOCKED | Visuels DB génériques hérités, portraits HXH/Naruto/One Piece absents, catégories/pictogrammes explicites pour des objets ; aucun scraping complet revendiqué |
| Windows natif | BLOCKED | Lanceur BAT fourni et HTML vérifié sous Chromium/Linux ; pas de machine Windows dans cet environnement |
| 12 tests Python du pack de référence initial | BLOCKED | Ce pack n’est pas inclus dans la source V18 disponible ; aucune validation inventée |

Les assertions et contrôles techniques sortent en code non nul sur échec. Le contrôle d’acceptation stricte `npm run check:release` sort volontairement en **2** tant que les limites ci-dessus restent ouvertes. La création du ZIP vérifie l’intégrité avec les limites documentées ; elle ne transforme pas ces limites en PASS. `node scripts/simulate-v19.mjs` sort également en 2 si aucun profil ne franchit l’acte.
