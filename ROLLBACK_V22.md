# Revenir à V21.1

Conserver d’abord une copie complète du dossier et exporter les sauvegardes depuis les réglages. BACKUP_PRE_V22 contient les fichiers source modifiés et leurs chemins. Recopier ses fichiers aux mêmes chemins dans le projet, puis reconstruire avec le build_preview.py restauré. Supprimer seulement les nouveaux modules src/v22 et les assets assets/v22 si l’on souhaite retrouver le périmètre original ; ne jamais effacer les clés de sauvegarde historiques.

qa/v22/protected-v21.json contient les SHA256 des 4938 assets d’origine et des quatre modules protégés. qa/v22/before.json contient les empreintes source d’avant intervention. Les clés V22 sont distinctes des clés historiques. Le ZIP d’origine V21.1 avait le SHA256 62235c762718d28411ae61e270d25222774e668f553ff9bad8db6e6eaee73a96.
