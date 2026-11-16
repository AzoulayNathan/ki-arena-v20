# Patch Horizons · Projet source V14

Le ZIP complet et le HTML V15 sont déjà prêts à jouer. Ce patch est une alternative pour conserver un projet source V14 et y installer uniquement les fichiers nouveaux ou modifiés par Horizons. Il contient aussi les trois défis visuels facultatifs. Aucune donnée de carte, illustration héritée ni règle de mode existant n’est remplacée.

1. Exporter par prudence la sauvegarde JSON depuis le jeu. Les clés du navigateur ne sont pas touchées par l’applicateur.
2. Extraire le patch dans un dossier séparé.
3. Depuis HORIZONS_PATCH, exécuter avec Python 3 :

```sh
python APPLIQUER_PATCH.py "C:\chemin\KI_ARENA_V14_LOCAL_FINAL"
```

L’applicateur vérifie les 897 empreintes de la base fournie avant le premier changement. Si le projet a été modifié ailleurs, il refuse l’installation et indique le fichier différent. Ne pas forcer l’écrasement. Les fichiers remplacés sont copiés dans BACKUP_AVANT_HORIZONS avant installation.

Le HTML autonome V15 est reconstruit, puis peut être ouvert par le lanceur Windows. La construction requiert Python 3 ; le jeu construit n’en a pas besoin. Le patch contient les médias locaux optimisés, pas les PNG de travail ni les captures volumineuses. Le ZIP complet contient les captures.

Les formats et clés de sauvegarde restent V14. En mode fichier, un changement de chemin HTML peut nécessiter l’export/import JSON selon le navigateur.

Pour une restauration strictement intégrale de l’édition d’origine, conserver le ZIP V14 source : SHA256 4343b4293cfb1b04d369ca7fcdebbdf87eedc86e56edb3f72c0f27ab95ab95e7.
