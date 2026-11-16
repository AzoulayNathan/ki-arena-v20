# Revenir à V22

Exporter la partie avant intervention. BACKUP_PRE_V23 contient les versions V22 de chaque fichier d’origine modifié, avec chemins conservés. Les recopier à leurs emplacements, retirer les nouveaux modules src/v23 si nécessaire, puis relancer le build_preview.py restauré pour produire le HTMLV22. Les assets originaux ne sont pas modifiés ; retirer seulement assets/v23 et les nouveaux fichiers data/portraits-*-v23.json si l’on souhaite retrouver exactement le périmètre précédent.

Les anciennes clés V22/V20/V21 sont conservées. La clé V23 est distincte ; ne pas supprimer les anciennes clés. Une reprise V22 en récompense garde son offre déjà tirée et change de contrat après cette décision. Les versions antérieures restent aussi dans l’historique du fichier livré.

qa/v23/changed-from-v22.json documente les octets avant/après. qa/v22/protected-v21.json vérifie4942fichiers protégés. Le ZIPV22 d’entrée avait SHA256 2bdb64cd82c5e347d636fb57c6034133140b82bfc2e3668693ccf52b6a8b66b8.
