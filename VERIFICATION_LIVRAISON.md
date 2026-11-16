# Vérification · Horizons V15

VERIFICATION_ZIP_V15.json est livré à côté de l’archive et contient son SHA256. FILE_MANIFEST_SHA256.json dans le projet donne les empreintes de tous les fichiers inclus, hors lui-même.

npm run package:v15 : construction, tests, vérification des huit rapports navigateur et des assets, ZIP atomique, extraction et comparaison, reconstruction identique du HTML, tests après extraction. Un échec arrête la commande avec un code non nul.

Le patch séparé conserve les autres fichiers de la V14. Son applicateur vérifie la base avant de sauvegarder et remplacer les fichiers modifiés. Voir GUIDE_PATCH_VISUEL.md.

Les images de qa/v15 sont des captures du navigateur réel. Les douze panoramas générés sont des assets de scène, jamais présentés comme des captures de fonctionnement. Les états de recette injectés sont distingués du parcours naturel sans injection.

Le .bat ouvre le navigateur Windows par défaut ; ce n’est pas un exécutable natif. Windows natif reste non testé dans cet environnement.
