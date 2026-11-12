# Suite du développement · KI ARENA

## Terminé : refonte locale V2

- Arcade moderne responsive, tuiles colorées et écran de combat animé par déplacement des cartes.
- Cartes minimalistes : 3 valeurs aux coins, nom+version en bas, LED d'effets sur le bord droit, portrait vectoriel local et aperçu pivotable.
- 200 cartes de jeu, 139 noms, 460 effets, 22 mécaniques et répartition de raretés exacte.
- Sept mini-jeux opérationnels localement, paramètres de match, draft à deux joueurs sur le même écran.
- Infinite Run roguelike sans scénario, remplacement temporaire et packs bonifiés permanents.
- Collection en localStorage, code de démonstration `N`, synthèse audio originale, PWA et préparation Capacitor.
- Exports CSV + JSON + scripts d'images vérifiables.

## Ensuite — par ordre de priorité

1. **Validation du catalogue** : construire l'inventaire exhaustif DB/DBZ/DBS anime, vérifier chaque forme/nomenclature et rapporter les sources dans les colonnes CSV. Ne pas confondre les 200 cartes pilotes avec un corpus encyclopédique définitif.
2. **Illustrations** : définir la solution de droits/licence, remplacer chaque SVG de substitution par une illustration propre et autorisée ; mise en cache WebP optimisée.
3. **Améliorer les effets emblématiques** : harmoniser portraits, animations spéciales, timing unique, synergies par personnage ; tests unitaires et équilibres.
4. **Backend** : API Node, PostgreSQL (schéma `db/schema.sql`), auth, données personnelles, décisions de récompense côté serveur, audit anti-triche.
5. **Multijoueur en ligne** : rooms privées, snapshots de drafts, reconnexion, validation serveur, tournois amicaux. Pour le moment : seulement local partagé.
6. **Applications natives** : empaqueter `www` avec Capacitor et réaliser les audits Android/iOS et performance.
7. **Mini-jeux additionnels** : Devine mon personnage, silhouettes, bingo, roue, arène de défis, prédiction de duel.
8. **Commercialisation** : droits de Dragon Ball, droits sur les portraits, mentions légales, protection des mineurs, transparence des tirages, protection données, règles App Store/Play Store.

## Critères de sortie bêta

- Site sans erreur JS dans les principales résolutions et WCAG mobile vérifié.
- Aucune récompense duplicable par resoumission ou rechargement.
- Tests formels des 22 types d'effets + des interactions complexes, victoire vérifiée 100 000 simulations.
- Répartition du catalogue **et** pack standard figées 33/27/21/15/4 ; chances premium affichées.
- Titres des cartes indiquant explicitement leur version/forme ; catalogue documenté.
- Licence/autorisation d'exploitation pour tous les médias et personnages diffusés.
