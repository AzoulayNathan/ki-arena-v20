# V5 — État de livraison

- Direction validée : ciel clair, capsule futuriste, CTA orange, panneaux bleu nuit, cartes 3D et raretés lumineuses.
- Toutes les interfaces de jeu utilisent le même système CSS V5, desktop et mobile : accueil, collection, combat, roguelike, drafts, ranking, tournois et quiz.
- Nouvelle carte de roguelike : nœuds réellement cliquables avec lignes pointillées, progression par étape. L'état reste géré par `roguelike.js`.
- Contrôles : options repliées par mode, accélération ×1/×2/×4/×8, journal des combats, audio, sauvegarde locale et installation web.
- Collection : chargement progressif par pages de 84, recherche sur toutes les cartes, filtres série / rareté, aperçu 3D.
- Catalogue repris du V4, sans nouvelle validation biographique des variantes et sans images officielles scrapées.
- Illustration de thème : assets conceptuels reconstruits depuis les maquettes IA validées. Les portraits SVG génériques subsistent sur les fiches non couvertes.
- Aucun APK/IPA natif, backend sécurisé ou multijoueur distant n'est inclus.
- Tests automatisés : 29/29. Tests sur Chromium isolé : démarrage de run, rencontre, navigation, mode combat, rendu desktop et mobile, 0 erreur JavaScript durant parcours contrôlés.
