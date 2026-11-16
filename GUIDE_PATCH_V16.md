# Installer le patch V16 sur la V15 de référence

La version complète est recommandée. Le patch est une alternative plus petite ; il inclut la refonte des pages et le nouveau draft mixte, pas uniquement du CSS.

Extraire le patch. Avec Python 3, exécuter `python APPLIQUER_PATCH.py CHEMIN_DU_PROJET_V15`. L’applicateur vérifie les fichiers de référence avant d’écrire, copie les fichiers remplacés dans un dossier de sauvegarde puis reconstruit `JOUER_KI_ARENA_V16.html`. Les sauvegardes navigateur restent locales ; les anciennes runs gardent leurs règles.

Si la base diffère, le script s’arrête avant toute copie. Conserver les médias personnels et exports de run. Ne pas appliquer le patch à une version modifiée par Cursor ; utiliser le projet complet ou intégrer les changements dans une branche séparée.

Après installation, ouvrir `JOUER_KI_ARENA_V16.html` ou le lanceur Windows mis à jour. Restaurer la V15 selon `BACKUP_V15/RESTAURATION.md` si nécessaire.
