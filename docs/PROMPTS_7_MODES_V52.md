# KI ARENA V5.2 — Sept prompts de finition des modes

**Contexte commun NON NÉGOCIABLE :** projet web/PWA 100 % local (IndexedDB/localStorage + export/import JSON), hors-ligne, UI Dragon Ball arcade « ciel Capsule / orange / bleu / espaces respirants », sept modes existants à améliorer sans repartir de zéro. Ne pas ajouter de serveur, compte ou boutique en ligne. Catalogue de 600 cartes, grade fixe dérivé du rang de puissance éditorial, cinq probabilités 33/27/21/15/4, 1 à 5 effets uniques, jeux libres avec toutes les cartes, Solo avec collection. Un seul moteur de combat pour tous les modes : VIT détermine l'ordre, une attaque normale par combattant vivant par round, cible aléatoire sauf effet prioritaire, capacités uniques, animations déterministes construites sur le journal d'événements, ATQ affichée +20 % par rapport aux anciennes valeurs V5.1. Répondre en livrant du code testable, captures desktop/mobile, tests automatisés, et documentation précise de chaque règle.

**Règles artistiques partagées :** priorité portrait, texte réduit à l'action ; pas de panneau noir opaque au bas des cartes ; nom et forme intégrés à l'image ; chiffres ATQ rouge, VIT bleu, PV ambre dans de petites gemmes ; LED de compétences sur la droite ; VFX de grade cumulatifs (commun mat, vert halo, bleu profondeur/foil, violet prisme animée, or holo + particules/flash). Respecter `prefers-reduced-motion`, son désactivable et réglage du volume. L'illustration réelle n'est chargée que si ses droits sont vérifiés, sinon placeholder identifiable.

---

## Prompt 01 — Team ×5 / Tirage libre

Tu es lead game designer + frontend animator. Rendre « Team ×5 » aussi satisfaisant qu'une ouverture de capsules : cinq cartes apparaissent une à une avec anticipation courte, flash couleur lié à leur grade, son unique pour épique/légendaire, puis composition propre. Configurer taille de chaque équipe (1 à 15 sans limite rigide hors garde-fou moteur), saga, rareté maximale et autorisation de doublons. En deux étapes : Tirage → duel automatique. Après tirage, permettre **Remplacer**, **Relancer uniquement une carte** (nombre au choix) et **Regarder les détails** ; l'équipe adverse peut être aléatoire ou configurée manuellement. Conserver la loi de rareté sur chaque tirage normal.

**UX :** un bouton principal « TIRER » puis « COMBATTRE », deux listes compactes et un bouton réglages ; pas de texte explicatif permanent. Démonstration visuelle : reveal fondu et zoom 450 ms, audio bref par grade, chute de carte amortie. Un joueur doit pouvoir terminer une partie en moins de 45 secondes en mode rapide.

**Tests :** pas de duplication illégale, aucun dépassement de taille, distribution des grades vérifiée statistiquement, sauvegarde du seed et du résultat, usage du moteur canon partagé, responsive 320 px et 1440 px.

## Prompt 02 — Draft à budget

Recrutement stratégique en 2 joueurs local ou contre CPU. Départ : même budget pour chaque joueur, aucune carte, puis 2 ou 3 propositions par prise. La carte choisie coûte son prix canon. Les deux joueurs et le CPU doivent subir strictement les mêmes règles : budget restant, nombres de choix, éventuel coût minimal et limites optionnelles d'équipe. Mode **Économie** : peu de KI ; mode **Chaos** : plusieurs propositions ; mode **Canon** : grands écarts de puissance conservés.

**Innovation :** affiche un comparatif de coûts sans prédire artificiellement le vainqueur ; montrer de petites synergies d'univers (Saiyan, Namek, etc.) sans les transformer en système de puissance caché. En fin de draft, afficher les deux équipes et leur dépense totale ; combat automatique optionnel. Utiliser une révélation de type porte Capsule, pas une grosse fenêtre de confirmation.

**Tests :** invariants budget jamais négatif, CPU soumis aux règles, aucun choix inaccessible, fin conditionnelle lorsque les équipes sont prêtes ou budget épuisé, combinaisons asymétriques possibles.

## Prompt 03 — Enchères locales à deux joueurs

Implémenter exactement le protocole : **deux joueurs commencent avec zéro carte**, 15 lots/rounds par défaut. Chaque lot est proposé au joueur dont c'est le tour avec mise de base. Le joueur 1 dit « OUI » (il mène l'offre), ou « PASSER ». Le joueur 2 peut passer ou **surenchérir d'exactement 5 KI** ; les joueurs alternent jusqu'à ce que l'un cède. L'autre remporte la carte et paie la dernière offre engagée. Chaque joueur commence avec 3 passes au total par défaut, ou passes illimitées en option. Les joueurs ne doivent jamais payer un lot perdu. Nombre de rounds configurable, aucune limite d'équipe par défaut : une finale 3v9 doit fonctionner. Alternatives : équipe plafonnée à 3, 5 ou 10 ; budget configurable ; ordre alterné de premier joueur par lot ; cache de prix optionnel.

**UX :** une carte géante, compteur KI lisible, une pastille indiquant qui doit jouer et seulement deux boutons « MISER / +5 » et « PASSER ». Mini-avatar de l'équipe acquise, pas de liste de texte. Animation d'enchère : compteur saute, lueur autour du gagnant, carte glisse physiquement vers sa colonne ; son de marteau à l'adjudication. Vérifier que le prochain lot ne démarre pas avant l'animation d'attribution.

**Tests :** budget/cap exacts, passes finies/illimitées, tour alterné, zéro carte au départ, dernier lot, égalité, cas les deux passent, déconnexion impossible (local only), aucun joueur inactif bloquant le jeu.

## Prompt 04 — Tournoi automatique

Créer un véritable tableau de tournoi 8/16/32, équipes 1 à 15, participants générés ou sélectionnés. **Ne pas afficher tous les vainqueurs immédiatement** : révéler match par match, avec choix « REGARDER » ou « SIMULER ». Montrer les rencontres dans un bracket interactif avec connexion des branches, portrait du gagnant et animation d'avancement. Finale : éclairage spécial, bruit d'arène, trophée animé, résumé du meilleur combattant et du nombre de KO.

**Variantes :** solo versus équipes, saga unique, équipe personnelle, tournoi aléatoire, graine du jour locale sans serveur. Les statistiques et les résultats doivent être les mêmes si l'on regarde ou si l'on simule directement (seed inchangé).

**Tests :** un seul champion, progression cohérente des rounds, 2^n entrants, résultat replayable, sauvegarde de l'état du tableau.

## Prompt 05 — Blind Ranking

Classer cinq ou dix cartes inconnues. Critère affiché au départ : attaque canon, PV, vitesse, rang canon, force de l'équipe, ou appréciation subjective « mes favoris » (sans prétendre qu'il existe un classement canonique unique). Les prochaines cartes restent secrètes ; une fois placée, une carte ne peut plus bouger. Placer par **glisser-déposer** ou toucher un emplacement, avec vibrations optionnelles. Reveal final cascade et score explicite seulement pour critères objectifs ; aucun faux score d'exactitude pour une préférence subjective.

**Variantes :** rapidité 30 s, deux joueurs locaux en alternance, saga unique, cinq/dix places, personnages familiers. Une partie doit tenir sur un petit écran sans défilement horizontal frustrant.

**Tests :** exactement N cartes distinctes, cases verrouillées, règle de score transparente et replay seed.

## Prompt 06 — Plus ou moins

Un duel court de connaissances : comparer deux cartes pour un seul attribut caché, attaque/PV/vitesse, ou rang canon éditorial. Les deux choix doivent pouvoir être faits en touchant directement les cartes ; les valeurs masquées ne sont révélées qu'après le vote. Série de bonnes réponses → multiplicateur de score, puis une erreur termine la série ou enlève une vie suivant le preset.

**Variantes :** contre-la-montre, trois vies, saga à thème, comparaison d'un personnage à une forme supérieure du même personnage, « plus proche » pour tension. Audio d'erreur doux, flash de valeur, transition sous 450 ms.

**Tests :** ne jamais révéler à l'avance la valeur cachée, gérer égalités explicitement, bon score, mêmes cartes selon la graine, touch-friendly.

## Prompt 07 — Roguelike Solo ∞

**PRIORITÉ ABSOLUE.** Implémenter le prompt approfondi `ROGUELIKE_DEEP_PROMPT_V52.md` ; ne pas le remplacer par une campagne. Équipe initiale composée de cinq cartes réellement possédées, réserves et recrutement temporaires, carte persistante à plusieurs embranchements et boss de fin de zone. Combats, élites, quêtes facultatives, repos, marchand, trésors, passages vides, événements narrativement très courts, équipements par personnage, reliques globales, Dragon Balls + Shenron. Chaque victoire soigne **25 % des PV max à tous les membres**, y compris les cartes KO qui reviennent à 25 % entre combats ; les reliques de soin s'ajoutent avec un plafond de 100 %. Recrutement après chaque victoire et packs de collection gagnés à la fin de run. Aucune campagne scénarisée.

**Tests :** run gagnable/perdable, décision de branche irréversible, sauvegarde locale au moindre changement, reprise depuis l'état sauvegardé, progression de difficulté mesurable, compatibilité mobile, échange de réserve non destructeur, traitements cohérents des objets/doublons et vœux.
