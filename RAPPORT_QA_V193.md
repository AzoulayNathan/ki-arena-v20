# Vérification V19.3 — 11 novembre 2026

Le travail part de l’archive KI_ARENA_V19_2_POLISH.zip, sans fichier du catalogue ni moteur réécrit. La comparaison complète conserve tous les fichiers d’origine ; les seuls changements de données de QA proviennent des fixtures régénérées par les tests. Aucun test historique n’a été modifié.

## Vérifications exécutées

1. npm test avant modification : succès, baseline.log.
2. npm test après intégration : succès, 117 tests Node recensés et blocs des scripts historiques ; tests-final.log.
3. npm run test:v193 : succès après les derniers détails d’aperçu, six tests dont 25 combats DB/HXH/Naruto/One Piece/fusion ; tous leurs événements gardent leur ordre, les événements d’action ont une famille prise en charge.
4. 894 fichiers protégés comparés par SHA-256 : identiques. Inclut données, assets, moteurs historiques, src/arena, src/survival et src/v18 ainsi que moteur/draft/catalogue V19.
5. Navigateur réel sur aperçu local : création DB, choix des six propositions, arme et cinq alliés, carte, équipement de Pan avec Épée de Shu, préparation et combat. Pause et vitesse ×2. Victoire naturelle, choix du Fusil de Lunch, retour carte et sac. Pas de fixture renforcée ni de gain simulé pour ce parcours.
6. Vingt-trois boutons de galerie activés : famille et sous-groupe corrects ; cartes hydratées ; aucun message d’erreur propre à l’application. La galerie est une scène technique, pas une partie.
7. Glisser réel de la poignée du Fusil de Lunch sur Colonel Violet : équipement et badge du porteur mis à jour. Clic sur un équipement, désélection, aperçu d’Akkuman, fermeture avec retour à l’inventaire : observés.
8. Formats 390/768/1360 via iframe de l’application réelle : équipes gauche/droite, cartes dans le terrain, aucun défilement interne des équipes, pas de débordement horizontal de document. Le navigateur de bureau réserve 15 px à sa barre verticale : les largeurs utiles étaient 375/753/1345 px. Captures conservées avec le cadre de contrôle.
9. Build : 832 assets embarqués identiques aux fichiers locaux, JS/CSS intégrés. ZIP : CRC et comparaison de chaque fichier avec les sources par le script de packaging.

## Corrections issues de l’observation

Les cartes étaient recréées à chaque coup et le directeur regroupait parfois un impact avec le KO : nouvelle file de présentation et mises à jour des cartes existantes. Les valeurs ATQ utilisaient le mauvais champ d’instantané : atk est maintenant affiché. Des règles CSS historiques imposaient un terrain trop court sur mobile et un min-width de 130 px : règles spécifiques corrigées. Les boucliers avaient un inset bas résiduel qui les étirait sur la carte : badge remis à sa taille. Le sac se trouvait sous les cibles : objets remontés dans une rangée compacte. Les ticks de dégâts persistants et les tours interrompus ont désormais une présentation explicite.

## Limites non masquées

L’ouverture file:// a été refusée par la politique du navigateur de test (protocole non autorisé). Aucun contournement n’a été utilisé ; le fonctionnement par double-clic sur Windows n’est donc pas déclaré validé. Le HTML a été reconstruit et son embarquement vérifié, tandis que les interactions finales ont été vérifiées sur les mêmes modules servis localement. Une première construction autonome a également été parcourue avant les derniers ajustements CSS.

La commande npm run test:python échoue car le dossier reference-survie n’existe pas dans l’archive de départ. Son log et le code de sortie non nul sont conservés ; les 12 tests ne sont pas déclarés passants. Aucun module Python de référence n’a été recréé artificiellement.

Les portraits de la référence ne sont pas un jeu d’illustrations final complet. Les assets et le design de carte sont conservés ; cette version améliore la scène et les animations sans prétendre remplacer les portraits manquants. Les sons sont synthétiques et leur perception doit être contrôlée sur le matériel du joueur. Le tactile physique et l’option système de mouvement réduit n’ont pas été testés sur appareil dédié. La galerie et les FX sont partagés avec les combats V19 ; la conservation du DOM et la nouvelle disposition ont été particulièrement travaillées et vérifiées dans l’Expédition.

## Preuves

- qa/v193/baseline.log, tests-final.log, focused-tests.log, python.log.
- qa/v193/protected-before.json, source-diff.json, integrity.json.
- qa/v193/browser/combat-390.jpg, combat-768.jpg, combat-1360.jpg.
- qa/v193/browser/inventaire-390.jpg, inventaire-1360.jpg.
- qa/v193/browser/galerie-ko.jpg et galerie-faisceau.jpg : captures réelles de démonstration.
- Reçu du ZIP fourni séparément : VERIFICATION_ZIP_V193.json.
