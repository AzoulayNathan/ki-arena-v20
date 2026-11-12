# KI ARENA V5.1 — Contrôles et matrice

## Disponible et testé

- Navigation minimale, carrousel animé avec roguelike en premier et raccourcis de modes.
- Toutes les pages existantes : collection, battle, roguelike, draft budget, enchères, tournoi, blind ranking, plus ou moins, profil.
- Moteur canon, 3v9, cibles aléatoires, pouvoirs uniques, boss phase 2.
- Enchères à deux (15 défaut, skip3, surenchères +5, budgets, limites optionnelles), moteur indépendant et reproductible.
- Roguelike : map, boss, marchands, chemin, réserve, reliques, Dragon Balls et vœux.
- Authentification Node locale register/login/whoami/save, cookie sécurisé sur serveur HTTPS (configuration requise), zone de données privées inaccessible via HTTP.
- CSV 600 actualisé, cohérent avec les cartes calculées par le moteur.
- 38 tests Node réussis. Parcours Chromium : menu, enchères avec relance, collection 3D, combats, historique, profil et démarrage roguelike. Pas d'erreur JS signalée dans ces parcours.

## À terminer avant publication publique

- Portraits distincts autorisés par licence pour les 600 cartes ; aujourd'hui largement placeholders.
- Vérification manuelle exhaustive des 600 formes, de leurs périodes, et des rangs narratifs : hiérarchie évaluative, non officielle.
- Contrôle UX complet de tous les embranchements et toutes les tailles d'équipe, tests de charge multijoueur.
- API serveur autoritaire pour la collection et les récompenses, lutte contre la triche, protections anti-abus, vérification d'e-mail, récupération de compte, sauvegardes/DB durable.
- Véritable multijoueur distant et build mobile signé Android/iOS.
- Autorisations de diffusion et de monétisation de l'univers Dragon Ball.
