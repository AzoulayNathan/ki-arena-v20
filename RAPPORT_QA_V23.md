# Rapport QA — KI ARENA V23

Date :16 novembre2026. Référence d’entrée : KI_ARENA_V22_LOCAL.zip, version2, SHA256 2bdb64cd82c5e347d636fb57c6034133140b82bfc2e3668693ccf52b6a8b66b8.

## État de livraison

Le parcours des trois gains est corrigé, intégré et vérifié. Le paquet est complet en sources et assets disponibles. Le produit entièrement fini demandé n’est pas certifié : des portraits restent provisoires, l’équilibrage humain n’est pas validé et Windows/file:// ne sont pas testables ici. STATUS_V23.md garde ces limites visibles et le contrôle global retourne un code non nul.

## Recette automatisée

Baseline V22 : release courante réussie ; ancienne commande npm test arrêtée sur3 attentes V20 (draft ancien6, budget source antérieur, empreintes de modules déjà modifiés avantV22).

Recette courante `npm test` :20 testsV23 (18logiques +2assets),28V22,32V21,21SurvieJS, suitesV8, vérification items,12Python,11V20 actualisés. Voir qa/v23/final-tests.log. Les tests V20 comprennent15000 drafts,15 pools et deux modes de stats, plus5400 compositions ennemies. V22 vérifie2700 compositions sur60 difficultés et15 pools ; V23 vérifie900 séquences de récompenses avec sélection effective, rangs et univers contrôlés à chaque étape.

Les attentes V20 ont été modernisées :8cartes=5+3, nom de champ globalRank, coefficient solo courant0,5625.852 empreintes préV20 sont conservées. Quatre modules historiques déjà différents avantV23 sont comparés aux octets du ZIP V22 d’entrée, pas aux changements de cette intervention. Originales et justification sont conservées dans BACKUP_PRE_V23 et historical-expectation-update.json.

`npm run test:legacy-all` conserve l’ancienne chaîne. Elle révèle encore une attente d’empreinte V193 sur src/survival/encounter.js, déjà différente dansV22 et inchangée ici. Les anciennes suites après ce point ne sont pas toutes certifiées par cette chaîne. Elles ne sont ni supprimées ni annoncées comme toutes réussies. Le changement de commande par défaut est explicite : npm test exécute la recette courante complète.

## Récompenses et fiabilité

Personnage, arme, puis soin25 OU relique sont trois gains cumulés. Les étapes sont enregistrées une à une. Le mystère est tiré avant son clic. Un remplacement garde les armes dans le sac et verrouille l’offre engagée. La carte ne revient qu’après le dernier choix ; un boss ne change d’acte qu’à ce moment.

Un lot de simulations a révélé une arme devenue incompatible après le départ du dernier allié de son univers. Correction : génération du draft d’armes après recrutement, puis gel de ses offres. La fixture orphan-weapon-before-fix.json conserve le contre-exemple ; le test le reproduit. Autre défaut détecté manuellement : une ancienne fenêtre pouvait écraser un gain plus récent. Le contrôleur vérifie maintenant la sauvegarde avant mutation et synchronise l’écran sans appliquer l’ancien choix ; garde supplémentaire des préfixes de gains à la sauvegarde. Le test final à deux fenêtres a montré le message de synchronisation et conservé la relique choisie.

## Simulation finale

1000 nouvelles parties crypto,4 politiques simples,15 combinaisons d’univers. **4708 combats, zéro exception**,76 boss vaincus,72 parties ayant franchi l’acte1. 999défaites ; 1partie(s) arrêtée(s) à la borne de recette (3actes ou350transitions), pas une victoire artificielle. Chiffres détaillés : simulation-1000.json.

Le taux de passage d’acte1 est 7.2 % chez ces bots, contre2 % dans le précédent lotV22. Les lots utilisent des entropies différentes : cette comparaison est indicative, pas une étude appariée. L’équilibre reste sévère et non validé humainement. Les stats brutes et le budget verrouillés n’ont pas été multipliés pour améliorer les résultats ; seule la progression de loot a été corrigée.

## Navigateur

Parcours naturel DB : draft8choix, première victoire réelle, Yamcha recruté, arme mystère révélée (étoiles de Murasaki), troisième choix, carte puis sac4. Rechargement entre les gains : mêmes offres, acquisition conservée. La première vérification multi-fenêtre a révélé un défaut, corrigé et retesté avec une fixture issue d’un véritable premier combat gagné, sans modifier le vainqueur.

Captures réelles : récompenses arme et choix final desktop, tablette768, mobile390. Le jeu mobile utilise un carousel natif pour les drafts. À390, la largeur utile peut être375 à cause de la barre de défilement classique du navigateur ; scrollWidth=clientWidth. À768 et desktop, aucune extension globale non voulue n’est observée. Ce sont des vues navigateur, pas des appareils physiques. Les résultats de l’auto, de l’HTML et des derniers contrôles sont consignés dans browser-proof.json.

## Images et droits

38sources officielles téléchargées et identité contrôlée visuellement,132placeholders remplacés. La source de Piccolo Junior a été refusée pour son père. Les images incorrectement trouvées via les mots d’un arc ne sont pas branchées sur le mauvais personnage. Manifestes, tailles, URL de provenance et SHA256 fournis. Tous les assets du jeu restent locaux.

Restent208placeholders,2632portraits hérités non revus ;175références partagées et7portraits exacts revus selon la classification courante. Une référence partagée ne certifie pas la transformation affichée sur la fiche. Les archives officielles n’ont pas toutes été récupérées : un lot a reçu503 et n’a pas été présenté comme complet. Les collecteurs restent des outils facultatifs de revue, jamais un appel réseau au lancement du jeu.

Les4938assets d’origine, les4modules protégés et leurs empreintes restent contrôlés. Les nouveautésV22 (46assets) sont conservées,38portraits s’ajoutent :5022assets de production. Le manifeste de provenance ne confère aucune licence commerciale sur les œuvres.

## Limites et intégrité

Windows natif non disponible. Le protocole file:// a été refusé ici et n’a pas été contourné ; le HTML est contrôlé par son contenu embarqué et chargé viaHTTP. Audio : hooks/volume/muet testés, pas d’écoute humaine certifiée. Pas de nouvelle recette manuelle exhaustive de chaque mini-jeu et des3022cartes.

`npm run verify:package` vérifie fraîcheur du build, empreintes protégées, chaque payload d’asset décodé et syntaxe JavaScript. `npm run package` vérifie CRC et SHA256 de chaque fichier archivé. Le reçu ZIP externe est la preuve de taille et d’empreinte de la livraison. `npm run check:release` reste volontairement en échec tant que les limites produit ne sont pas résolues.

Le contrôle final du HTML a corrigé un BOM CSS intermédiaire qui supprimait la déclaration Arena Display lors de la concaténation. Le navigateur confirme les six familles de police embarquées, les images en blob local chargées, et la séquence personnage → arme → soin → carte. Contraste des boutons d’inspection et des étiquettes de gains renforcé ; les captures précèdent le dernier réglage de couleur des étiquettes. Sur390×844, le bas du bouton d’inspection est à813,58px ; le carousel passe de0 à532px au clavier, sans débordement global.
