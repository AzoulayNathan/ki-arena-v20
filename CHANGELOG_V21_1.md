# KI ARENA 21.1 — correctifs intégrés

- HTML : suppression d’une boucle d’import packs/cartes qui provoquait `Maximum call stack size exceeded` dans l’assembleur autonome. Payloads d’images stockés dans des blocs HTML inertes, conversion Blob à la demande, écran de démarrage et message d’erreur utile.
- Difficulté : référence historique Survie rétablie à `round(N/4 × (v+t))`. Coefficient courant 0,5625 conservé dans un module réservé au solo V20/V21. Reprise des rencontres déjà sauvegardées avec les anciens coefficients conservée. Aucun nouveau système de boss, aucune nouvelle normalisation.
- Replay : les événements après le 1 100e ne sont plus supprimés. Sauvegarde compacte sans perte par mutualisation des instantanés. Export/import anciens et nouveaux testés ; limite d’import portée à 20 Mo.
- Contributions : attribution des dégâts persistants à leur véritable source, dégâts subis plafonnés aux PV perdus et absorption prise en compte. Comptabilisation idempotente.
- Panthéon et bilan : vraies cartes composées avec identité, finition et statistiques du souvenir. Version de combat conservée dans les souvenirs. Fin de run sur défaite, même avec réserves, et équipe finale complète vérifiées.
- Combat : PV agrandis, ATQ/VIT retirées des petites cartes de combat et accessibles à l’inspection, zone d’illustration distincte du texte, contraste du contrôle Auto corrigé.
- Décors : quatre nouvelles ambiances de combat pour DB, HXH, Naruto et One Piece ; dans une fusion, alternance entre les univers sélectionnés à chaque acte. Atlas 1 672 × 941, panneaux d’environ 836 × 470, compressés en WebP. Ce ne sont pas quatre images 4K.
- Images : 21 sources réelles collectées et contrôlées. Les références partagées entre des formes sont explicitement signalées. Deux autres images de Sakura hors sujet sont écartées. Les anciens fichiers restent intacts. La collection complète n’est pas certifiée.
- Navigation : chaque changement d’écran revient en tête ; ouvrir/fermer une modale et filtrer une liste conservent leur position. Le texte du panneau de packs gagnés est contrasté.
- Accessibilité : guide mobile plus lisible, textarea et liens inclus dans la navigation clavier des modales, détails des effets de l’unité équipée cohérents avec le combat.
- Cache : documents HTML en réseau prioritaire avec repli local, lancement Windows sur une URL de version et conservation des caches des autres applications.
- Windows : erreurs du lanceur remontées avec un code non nul ; lien HTML de repli indiqué. Windows natif reste à tester.
- QA : dix tests de finition supplémentaires ; fixtures historiques manquantes rétablies depuis le ZIP V20 et conservées dans la distribution.

Les CSV, statistiques brutes, raretés et 4 912 assets d’origine restent inchangés. L’équilibrage global et la correction de tous les portraits restent ouverts.
