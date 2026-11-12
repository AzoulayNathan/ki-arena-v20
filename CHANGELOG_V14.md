# Changements livrés · V14

## Expédition et difficulté

- Cinq combattants en automatique, préparation et inventaire sans main ni mana dans Arène. Deck Survival reste distinct.
- Draft 5 personnages + 3 armes ; une offre virtuelle 25–35, une 15–45, une mystère 0–60. Aucun rang affiché au joueur.
- Source de rang fixe sur le catalogue complet de chaque univers avant exclusions ; aucun dénominateur rétréci après un choix.
- Mystère seedé avant le clic ; identités possédées ou mortes et doublons d’offre exclus ; offre impossible désactivée avec raison.
- Univers cochables, normalisation proportionnelle par position source, N recalculé selon le pool actif. Rang ennemi V14 trié par puissance normalisée réelle puis ID.
- Budget exact round((N/4)*(v+t)), somme exacte des rangs, nombre minimal d’ennemis et rangs distincts quand possible. Pas de reset après vingt vagues.
- Dix étapes par acte, boss obligatoire à la dixième, profondeur augmentée à chaque étape. Les armes ennemies sont annoncées séparément.
- Proposition de recrue vue si l’équipe est réduite et qu’une recrue compatible existe ; toujours une seule récompense choisie.
- Défaite de boss avec survivants : retour à la préparation du même groupe, sans blocage ni reroll.

## Visuels et circulation

- Six panoramas WebP locaux, palettes, disposition des routes et courts textes de chapitre distincts, puis cycle de thèmes.
- Carte complète dans la barre haute ou M ; chemins réels seulement ; survol et focus soulignent la liaison.
- Icônes par rencontre, mystère signalé par un point d’interrogation ; commandes de carte redondantes retirées.
- Bandeau d’équipe compact avec PV et sac, tiroir visuel, filtres, réserves et emplacements.
- Objet puis cible visuelle, remplacement explicite ou glisser-déposer par poignée ; même opération métier.
- Rotation au toucher, annulation propre, respect du scroll et mouvement réduit. CTA explicite pour recruter.
- Combats : présentation partagée entre modes, capacité et K.O. séparés, carte de la victime pour son K.O. Résultats moteurs préservés.
- Événements à deux ou trois panneaux, aperçu puis confirmation, coûts et sacrifices nommés, combats forcés signalés.
- Correction du paiement sans fonds, double bonus de pacte, vente d’actif, fusion entre univers et dette empilée.
- Responsive 390/768/1360, focus après enchère, draft immobile sous le pointeur. Cartes, templates et finitions intacts.

## Jeux, bilans et médias

- Accès Entre amis depuis l’accueil ; Draft Budget solo distinct de Draft Challenge aux enchères.
- Cinq jeux solo terminables, limite de cinq identités, budget protégé, reprise du draft et combats/résultats réels.
- Quatre jeux locaux vérifiés : enchères, tournoi, garder/tenter et goûts. Reprise d’enchères et filtres/favoris de collection persistants.
- Contributions du bilan rattachées à l’identité stable du combattant ; réservistes non crédités d’un combat non joué.
- Repli distingué d’une victoire, souvenir automatique au Panthéon, identité d’une run distincte de sa seed, renommage conservé.
- Import normal/spécial/arena distinct et persistant, fallback DB conservé, chemins d’images inexistants évités.
- Tentative réelle d’enrichissement tracée ; accès source bloqué, zéro miniature appliquée sans contrôle. Audit des doublons, aucun effacement automatique.
- 163 objets classés : 95 utilisables exécutés et 68 exclus avec raison dans Arène.
- Audio local importable, lecture/arrêt et volumes séparés persistants ; aucune OST des œuvres fournie.

## Fiabilité

- Sauvegarde V14 séparée ; anciennes clés conservées et anciennes runs sous leurs règles précédentes.
- Contexte, révision et reçu d’action : rejet du callback périmé, double choix, paiement ou gain ; rollback sur refus.
- Hashes des données, images et moteurs protégés ; rendu des cartes comparé à l’original.
- 60 drafts et 540 rencontres V13 comparés à une référence produite avec le code original.
- 66 tests JS actuels, suite V8, contrôles des 163 objets, 2 700 000 rencontres et 1 000 runs simulées.
- Parcours navigateur et HTML sans serveur ; ZIP contrôlé par CRC, hashes extraits, reconstruction identique et tests après extraction.

Limites restantes explicites : portraits source incomplets, nouvelles images externes non acquises, OST absente, référence Python manquante et Windows natif non disponible.
