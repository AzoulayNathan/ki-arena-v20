# MASTER PROMPT — KI ARENA SOLO ∞, roguelike de cartes Dragon Ball

Tu es **game director, systems designer, spécialiste roguelike, UX motion lead, sound designer et ingénieur TypeScript**. Tu reprends le code réel de KI ARENA V5.2. L'objectif n'est PAS d'ajouter une campagne ni des tonnes de textes, mais de construire la **meilleure boucle de survie locale possible**, visuellement identifiable, rejouable, rapide, avec des risques et une montée en puissance lisibles.

Inspiration de mécaniques **et non copie graphique** : planification d'itinéraires/rencontres de *Slay the Spire*, amélioration d'unités et synergies de *Monster Train*, effets de collection graduels (foil / prism / flare) observés dans *Marvel Snap*. Concevoir des mécaniques originales Dragon Ball/Capsule, sans réutilisation des musiques et assets protégés sans autorisation.

## 0. Non négociable

- L'application reste **100 % locale/offline** ; pas de login, boutique payante, matchmaking, microtransactions ni nécessité de réseau.
- DB, DBZ, DBS ; ne pas inventer des films/GT/Daima si exclus de l'inventaire. Ne pas déclarer un casting exhaustif sans audit.
- Équipe de départ **exactement 5 cartes possédées**. Tous les autres modes ont accès libre à 600 cartes.
- Une run est **infinie** jusqu'à défaite/abandon ; elle progresse en zones 1, 2, 3… de plus en plus exigeantes.
- Le moteur de combat est partagé : VIT pour l'ordre, attaques aléatoires (sauf effet), une attaque normale par combattant par round, 1 utilisation maximum par effet et par combat, puissance canonique, ATQ de V5.2 augmentée de 20 %.
- Après **chaque victoire**, +25 % PV max pour tous les membres (un KO revient à 25 %) et bonus des reliques ajouté, plafonné à 100 %.
- Début visuel en moins de 10 secondes, transitions accélérables, état enregistré après chaque action.

## 1. Vision du joueur

L'utilisateur doit se dire : « Je connais mes cinq cartes, je choisis une route, je gagne une amélioration, j'hésite entre sécurité et prise de risque, j'ai un boss impressionnant, puis je peux tenter d'aller encore plus loin. » Tout est montré par **icônes + carte du monde + mini-scènes animées** ; éviter un tableau de texte et les modals à répétition.

Le joueur doit percevoir rapidement 4 choses : (a) combien de combats avant le boss ; (b) quelle route promet des récompenses ; (c) l'état de son équipe et son équipement ; (d) la récompense potentielle d'une rencontre difficile.

## 2. Départ : préparation courte mais intéressante

- Écran « TON ÉQUIPE » : 5 slots, tri rareté, version, saga, rang de puissance ; carte pivotable si l'on reste appuyé.
- Un seul bouton « COMMENCER » ; un bouton discret « PRÉRÉGLAGE RAPIDE » pour charger les cinq dernières cartes.
- 80 zénis et un Senzu. Aucun équipement gratuit qui court-circuite les choix du premier marchand.
- Aperçu de la première zone et de son boss, sans révéler toutes les prochaines rencontres.
- Après défaite, bouton « RELANCER » avec cinq mêmes cartes ou recommencer la sélection.

## 3. Carte du monde : vraie navigation, pas deux boutons

Chaque zone est une **carte verticale à chemins connectés**, avec arrière-plan illustré par biome : monde Dragon Ball/forêt, désert de DBZ, Namek, ville ruinée, arène céleste DBS, vide cosmique. Utiliser 5 couches : ciel/parallaxe, monuments, chemin, nœuds interactifs, halos. Ne pas afficher de dizaines de textes permanents.

- Zone 1 : **quatre rencontres possibles successives + boss**, zone 2 : cinq + boss, etc., +1 nœud jusqu'à plafond raisonnable (10 rencontres + boss).
- Générer **trois voies** en largeur (sécurité, opportunité, risque), avec jonctions et bifurcations vérifiables. À chaque colonne, 2–3 nœuds possibles, reliés uniquement aux voisins accessibles ; le joueur voit au moins **deux étapes d'avance**.
- Les chemins ne se chevauchent pas de manière absurde. Quand le joueur clique un nœud, les connexions non choisies s'estompent ; sa route devient lumineuse et un personnage miniature parcourt le chemin (0,5 s).
- Boss de fin de zone sur une île différente. Faire apparaître un portail / aura rouge quand le boss est proche.
- Reprendre une run exactement à l'étape choisie ; le seed fixe la carte, les offres, les ennemis et les événements.

**Nœuds (icônes fixes)** : ⚔ combat ; ☠ élite ; ◈ marchand ; ✚ repos ; ✧ trésor ; ? événement ; ⚑ défi facultatif ; ☁ passage calme ; ★ boss. Une brève info de 1 ligne apparaît sur appui prolongé. Les zones disposent d'un indicateur de progression discret.

## 4. Rencontres : donner un vrai choix

**Combat standard** : 2–5 adversaires variables, puissance dépendante de zone, packs standard/bonifiés, or, possibilité de recrutement après victoire.

**Élite** : un semi-boss identifiable, 25–40 % plus dangereux qu'une rencontre standard du même niveau, récompense : équipement rare ou relique / zénis majorés.

**Boss** : une unité emblématique et des renforts ; phase 2 sous 50 % de PV, changement de teinte, musique et compétences ponctuelles (pas de buff infini). Le boss suivant doit être plus dur, sans simplement multiplier aveuglément les PV ; améliorer composition, stats et mécanique. Par exemple protections puis ripostes, boucliers puis double frappe ; les pouvoirs restent à usage unique.

**Marchand Capsule** : quatre offres avec prix et trois icônes (arme / armure / relique) ; possibilité de quitter, achat immédiat, état conservé. Objet acheté s'applique une seule fois, pas de duplication après reprise.

**Repos** : choix entre soigner le groupe (+30 % PV), améliorer un équipement temporairement, ou échanger sans coût une recrue/réserve. Le soin normal de 25 % ne se déclenche PAS sur un nœud repos car il n'y a pas de combat.

**Trésor** : ouverture façon Capsule Corp avec 2 cartes de choix : relique globale ou équipement dédié ; l'option non choisie disparaît. Une Dragon Ball peut apparaître occasionnellement avec probabilité affichée.

**Événement aléatoire** : maximum **deux phrases** et deux options compréhensibles. Exemples cohérents Dragon Ball : machine de gravité (= +ATQ temporaire, −PV), laboratoire Capsule (= gadget contre zénis), rencontre Karin (= Senzu ou repos), entraînement Kaio (= bonus VIT ou risque), Shenron en gestation (= dragon ball). Les événements doivent respecter les personnages et les arcs ou utiliser des lieux génériques propres à l'univers.

**Quête secondaire** : un objectif optionnel pour deux combats (vaincre sans KO, recruter un adversaire, protéger Dendé, accumuler du bouclier). Il expire clairement et donne une vraie récompense ; ne jamais bloquer la route.

**Passage vide** : respiration visuelle courte et déplacement immédiat ; pas de popup « Rien ne se passe ».

## 5. Équipe et recrutement

Le joueur a toujours **cinq combattants actifs max**. Après CHAQUE victoire, il peut recruter une carte ennemie vue durant le combat (dans les limites de la réserve), la mettre en réserve ou remplacer un actif. Il n'a pas à relancer une acquisition payante.

- Réserve de départ : 1 carte, améliorable par reliques/Dragon Balls.
- Interface « glisser la recrue sur un emplacement » ou boutons accessibles sur mobile.
- Le personnage sortant peut rejoindre la réserve si place disponible ; sinon avertir avant suppression de la run.
- Le portrait du personnage recruté doit afficher nom, saga, forme et grade de rareté.
- Les recrues sont temporaires pendant la run ; le déblocage permanent dépend des règles de fin de run annoncées à l'avance.

## 6. Inventaire profond mais UI simple

Deux inventaires DISTINCTS : **équipement lié à un personnage**, et **relique globale active dès acquisition**.

Équipements : 2 slots par personnage, arme et armure. Exemples cohérents : Bâton extensible (+ATQ), Scouter (+VIT), Tenue lestée (+PV max), Gants de ki (+ATQ), Armure Capsule (+PV). Les équiper se fait sur une ligne de slots sous l'équipe ; comparer l'objet actuel / nouveau en une petite infobulle.

Reliques globales : Jardin Senzu (+soin post-combat), Sceau de Kaio (+ATQ équipe), Capsule tactique (+1 réserve), Médaille des univers (+zénis), Dragon Ball (fragment de progression vers Shenron). Limiter la pile d'effets trop puissants et expliquer les combinaisons en survol.

Consommables : Senzu, capsule médicale, entraînement. Utilisation entre rencontres, jamais en combat si l'on conserve l'autobattle intégral. Afficher seulement une rangée d'icônes, nombre × et tooltip.

**Combos intéressants et novateurs** (à construire avec tests) :

- « Contre-attaque Namek » : regen unique + bouclier d'équipe, réponse au burst ennemi.
- « Rush Saiyan » : équipement VIT + première attaque puissante + carte faible en rôle de finisher.
- « Capsule survival » : plus d'or → achats → synergies ; contrepartie : parfois route élite forcée pour récompenser une spéculation.
- « Les 7 Dragon Balls » : réunion de sept morceaux pendant la run → écran bref Shenron avec **trois choix équilibrés** : restauration intégrale, +1 capacité de réserve, ou deux packs Or. Le même vœu peut être répété seulement en recouvrant 7 boules distinctes.

## 7. Équilibrage du roguelike et rythme

**Pas de mode équilibré** ; tous les rangs de puissance restent cohérents avec la hiérarchie canonique du game design. La difficulté doit venir de composition adverse, type de rencontre, sélection d'équipe et gestion des ressources.

- Attention aux dieux/non-combattants : leur rôle ne se traduit pas mécaniquement par « 20 milliards d'ATQ » ; revoir au besoin la liste éligible en mode Solo.
- Courbe indicative : début zone 1 = 60–75 % de la puissance effective de l'équipe moyenne ; boss zone 1 = 110–125 % ; progression +8 à 14 % par zone sur les compositions adverses, plafonner l'augmentation des PV et diversifier les pouvoirs.
- Après chaque victoire : +25 % PV max sur **tous les cinq slots, KO inclus (retour à 25 %)**, plus reliques ; jamais après défaite, repos ou marchand. Cette règle crée une boucle accessible, à compenser par les élites et les boss.
- Après n combats successifs, augmenter l'importance des synergies adverses plutôt que rendre les combats interminables.
- Durée cible : 1 combat standard ≤ 45 s avec accélération ×2, élite ≤ 60 s, boss ≤ 90 s ; pour les runs longues, résultat direct disponible.
- Mesures automatiques : taux victoire, durée, rounds, fréquence déclenchement des effets, progression moyenne en zones, conversion du recrutement, valeur moyenne des objets et capacité de comeback.

## 8. Cinématiques, VFX, audio, UI

L'art direction V5.2 est une référence : ciel bleu, terres flottantes, Capsule, orange, bleu, cartes compactes, halo doux. Les animations doivent raconter le jeu, pas juste faire clignoter l'écran.

- Passage d'un nœud : personnage marche/saute sur une arête ; la prochaine rencontre grossit puis remplit l'écran.
- Combat : attaque normale = carte sort de sa case, déplacement vers cible puis impact ; PV décroissent ; événement live affiche portrait / pouvoir. Raccourci ×2/×4/×8 et Skip.
- Effet buff = anneau orangé, défense = dôme bleu, soin = particules vertes ascendantes, esquive = deux after-images translucides, ultime = cadre doré et éclat concentré, KO = portrait agrandi 1 s puis dissolution.
- Grosse récompense = apparition d'un Capsule « capsule-drop », puis carte qui retourne sur sa face et devient holographique si légendaire.
- SFX originaux : pas d'emprunt aux doublages ni thèmes Dragon Ball ; impacts graves, montée ki, souffle, KO grave, tintement heal. Volume global réglable. `prefers-reduced-motion` supprime les zooms.
- Microcopie : max une ligne par action. L'information détaillée vit dans un volet « ? », jamais sur la carte.

## 9. Récompenses et collection

Le mode Solo utilise uniquement les cartes possédées **au départ de la run**. Les ennemis peuvent être temporairement recrutés, les nouveaux packs et déblocages ne sont transférés à la collection permanente qu'en fin de run, et les cartes de doublon passent par le système de fragments standard.

Packs standards : raretés 33/27/21/15/4. Packs de profondeur : chances bonifiées montrées avant l'ouverture ; aucune garantie implicite. Le joueur doit connaître les conséquences d'un abandon (perte du butin) avant de confirmer.

## 10. Enregistrement et sécurité locale

Sauvegarde automatique atomique après nœud sélectionné, combat gagné, achat, équipement, recrutement, vœu, récompense. Garder un journal d'événements local et un seed reproductible. Export/import JSON strictement validé et limité en taille ; aucune donnée personnelle requise. Ne pas dépendre du serveur Node pour le gameplay. Seules les fonctions de sauvegarde locales doivent être présentes dans le profil.

## 11. Tests de validation obligatoires

1. 100 runs sur 30 zones simulées en automatique sans boucle, plantage ni items dupliqués.
2. Run interrompue/reprise au milieu d'un marchand, d'un recrutement et d'une préparation de boss ; mêmes résultats.
3. Trois routes distinctes, liens valides, 2 étapes d'avance, un boss à la fin de chaque zone.
4. Combat standard, élite et boss déclenchent des récompenses distinctes, correctement payées une seule fois.
5. KO entre combats passe à 25 % PV (pas 1 %), puis éventuels bonus appliqués une seule fois.
6. Un remplacement ne perd pas silencieusement l'équipement ou la carte mise en réserve.
7. 7 Dragon Balls donnent un vœu unique, avec vérification de déduction.
8. Packs à taux annoncés, inventaire cohérent et doublons gérés.
9. Vérifications desktop 1440 px, tablette, mobile 375 px et 320 px, mode réduire les animations, son coupé.
10. Tests à données extrêmes : 3v9, 5v5, ennemis de rareté max, Boss phase 2, défaites par sacrifice et fin de round.

## 12. Livraison attendue

Un ZIP exécutable localement, capture vidéo ou série de captures réelles des écrans (préparation, itinéraire, combat, marchand, coffre, boss, récompense), `README`, CSV objets/reliques, tests, historique des corrections et liste honnête des limitations non résolues. **Ne jamais déclarer une fonctionnalité finie sans test réellement exécuté.**
