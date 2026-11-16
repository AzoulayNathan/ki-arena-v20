# KI ARENA 21.1

1. Extraire entièrement le ZIP dans un dossier de ton PC.
2. Double-cliquer sur `LANCER_SUR_PC_WINDOWS.bat`.
3. Si Node est installé, le lanceur ouvre le jeu sur `http://127.0.0.1:4173/?ki=21.1.0`. Sinon, il ouvre `JOUER_KI_ARENA_V21.html`.

Le jeu ne demande ni compte, ni installation npm, ni connexion réseau. La collecte d’images est un outil de maintenance facultatif ; elle ne s’exécute jamais pendant une partie.

**Accès créateur : Réglages → Accès créateur → code N.** F8 affiche les calculs de draft et de rencontre. La carte globale reste accessible par le bouton Carte ou la touche M.

## Ce qui est vérifié

`npm run test:release` rassemble les tests V21/finition, Survie, V8, objets et les 12 tests Python. Les résultats de cette livraison sont dans `qa/v21/finish/`. `npm run verify:package` contrôle les données embarquées et les fichiers protégés ; `npm run check:release` reste volontairement en échec si un critère de qualité est FAIL/BLOCKED.

L’HTML assemblé a démarré par HTTP lors des essais précédant la réinitialisation de l’environnement : huit choix, carte, combat, pause et reprise exécutés. Ce n’est pas une validation du double-clic sur Windows. Le navigateur a ensuite été rétabli : draft, inspection, arme (+16 % appliqués), combat, pause, victoire, récompense, bilan et Panthéon ont été rejoués sur cette livraison. Les captures V21.1 sont dans qa/v21/finish/captures ; les captures V21 plus anciennes restent distinguées.

## Images

Les 21 portraits contrôlés ont leur provenance, dimensions et empreinte dans `MANIFEST_PORTRAITS_COLLECTES_V211.csv`. Un « Visuel de référence » représente bien le personnage, mais peut être partagé entre plusieurs formes. Les absences et exclusions restent visibles ; aucune collection de 3 022 illustrations finales n’est annoncée.

Le script facultatif `python scripts/refresh-reviewed-art.py` retélécharge uniquement ces sources précises en zone de contrôle. `--apply-reviewed` refuse toute image dont les pixels ont changé depuis le contrôle. Il nécessite Pillow ; cette dépendance ne concerne pas le jeu.

## Revenir en arrière

Exporter la run depuis Réglages avant de changer de navigateur ou de déplacer le jeu. Les sauvegardes restent dans le navigateur. Les sources précédentes sont dans `BACKUP_FINITION_V21`, la référence antérieure dans `BACKUP_PRE_V21`. Conserver le ZIP téléchargé avant cette mise à jour permet une restauration complète. Aucun fichier original d’illustration n’a été écrasé.
