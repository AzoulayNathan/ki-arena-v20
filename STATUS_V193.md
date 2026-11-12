# État de livraison — KI ARENA V19.3

Passe ciblée : présentation des combats, tutoriel et équipement. Le niveau de finition est à juger sur les captures réelles et le jeu ; aucune note commerciale « 9/10 » n’est attribuée sans joueur externe.

| Sous-système | État | Preuve |
|---|---|---|
| Baseline V19.2 | PASS | qa/v193/baseline.log — npm test avant modification |
| Moteurs / difficulté / catalogue / assets historiques | PASS | 894 hashes protégés identiques, qa/v193/integrity.json |
| Tests JS et suites historiques | PASS | npm test : 117 tests Node recensés + blocs historiques, zéro échec ; qa/v193/tests-final.log |
| Tests dédiés V19.3 | PASS | 6 tests, dont 25 combats réels et aperçu moteur sans mutation ; qa/v193/focused-tests.log |
| Directeur et effets | PASS | Impacts puis KO séparés, six familles/23 variantes ; fx-checks.json et captures galerie |
| Parcours navigateur réel | PASS | Départ → six choix → carte → équipement → combat ×2 → victoire → récompense et sac |
| Clic, aperçu, retour au sac, glisser | PASS | Fusil de Lunch glissé sur Colonel Violet ; état « Lié à Colonel Violet » observé |
| Responsive | PASS | Cadres 390/768/1360 px, aucune largeur de document supérieure à la zone visible, équipes sans scroll ; captures |
| Mouvement réduit | PASS / contrôle physique restant | Branches JS et CSS, test des durées ; système d’exploitation non modifié pendant la QA |
| Build HTML autonome | PASS structure / assets | 832 assets embarqués vérifiés octet par octet ; aucun script/style externe au chargement |
| Ouverture file:// | BLOCKED | Le navigateur de test autorise uniquement http/https et refuse le protocole local |
| Windows natif / audio sur PC | BLOCKED | Aucun PC Windows disponible dans cet environnement |
| 12 tests Python du pack Survie | BLOCKED | reference-survie absent de l’archive V19.2 fournie ; commande non nulle conservée dans python.log |
| Portraits finaux de tous les mangas | INCOMPLET HÉRITÉ | SVG DB provisoires et portraits manquants conservés, signalés dans le jeu |
| ZIP et restauration | PASS après génération | scripts/package_v193.py vérifie CRC et chaque fichier ; BACKUP_V192/RESTAURER.md |

Le jeu n’a pas reçu de nouvel équilibrage. Les règles de réserve, loot, packs, finitions, effets de combat et progression sont celles de la V19.2. Les anciens documents restent dans le projet pour traçabilité ; ce fichier décrit la passe actuelle.
