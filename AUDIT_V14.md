# Audit interne et décisions · V14

## Base effectivement disponible

Le ZIP KI_ARENA_V13_LOCAL_COMPLET et le pack KI_ARENA_CURSOR_V14_PROMPT_ET_ASSETS ont été matérialisés puis lus. Le code est JavaScript ES modules. Le catalogue actif contient DB 600, HXH 532, Naruto 313, One Piece 1577, soit 3022 personnages dans les quatre univers réunis.

PRE_V14_HASHES.json est le relevé des sources, données et assets avant modification. La source V13 ne contenait ni le pack complet Card Studio ni le dossier reference-survie attendu par les anciens tests Python. Le script npm historique présentait déjà des références manquantes. Ces absences ne sont pas corrigées en fabriquant de fausses références.

Les dernières décisions de l’utilisateur priment sur le brief initial V9 : Arène devient une expédition automatique à cinq, sans main, avec deux offres visibles et une mystère, univers cochables et dix étapes par acte. Le Deck Survival à main et les modes historiques ne sont pas remplacés.

## Défauts constatés et corrections

| Constat | Correction vérifiable |
|---|---|
| Une bande de draft dérivait à mesure des exclusions | Taille du catalogue source immuable, bande locale conservée, offre impossible désactivée |
| Profondeur augmentée seulement toutes les trois étapes | Chaque étape V14 fait avancer v ; anciennes runs conservent la pente précédente |
| Rang global incohérent avec la puissance normalisée | Tri V14 par ATQ + PV + VIT réels puis ID, correspondance cardId/rang testée |
| Boss perdu laissant une carte sans issue | Même boss remis en préparation si des personnages vivent |
| Équipe diminuée sans option de récupération | Recrue ennemie vue proposée parmi trois récompenses si possible |
| Choix consommés deux fois ou callbacks périmés | Contexte, révision, reçu, rollback et courte garde d’entrée |
| Carte et sac imposant des allers-retours | Commande Carte dans la barre haute, équipe/PV/sac dans le bandeau bas |
| Sélection d’équipement peu lisible | Objet puis cible, remplacement explicite, poignée de glisser-déposer |
| K.O. d’une victime attribué visuellement à l’attaquant | Séparation des séquences capacité et mort, cible correcte en gros plan |
| Contributions affectées à une place plutôt qu’un héros | Identité stable via la liste des combattants réellement joués |
| Repli classé comme victoire | Issue retreat distincte et souvenir automatique |
| Import spécial écrasant normal ou arena | Espaces de noms séparés et reprise IndexedDB vérifiée |
| Chemins d’images absents et mauvais doublons d’objets | Index local, fallbacks préservés, miniatures non validées mises en quarantaine |
| Bouton instable au survol et débordement tablette | CTA immobile, largeur du panneau mystère corrigée |
| Focus perdu sur une enchère | Retour au contrôle valide après la garde anti double clic |

## Ce qui reste protégé

Les CSV, illustrations d’origine, CSS de finitions, rendu fighter, moteurs historiques et src/arena/battle.js restent identiques à la source. Les anciennes clés localStorage restent intactes. Une référence indépendante de 60 drafts et 540 rencontres obtenue avec les fichiers du ZIP original contrôle le comportement d’une run V13 chargée dans le moteur actuel.

## Décisions de fidélité

Les effets et valeurs des objets sont des adaptations de jeu ; leur nom n’établit pas un statut canonique. Les exclusions personnelles/Nen restent hors loot transférable. Les décors et textes de chapitre sont éditoriaux. Aucun visage de personnage n’a été généré pour masquer une illustration manquante.

La nouvelle tentative réelle d’acquisition d’images a rencontré des réponses HTTP bloquantes. Les doublons exacts et perceptuels sont recensés, conservés et exclus de l’affichage non validé ; aucune image étrangère n’est présentée comme l’objet attendu.

Les métriques de difficulté servent au diagnostic. Le budget est exact ; il ne garantit pas une difficulté ressentie linéaire, ni une même probabilité de victoire pour les univers et profils. Les résultats des 1000 runs sont publiés sans correction de la formule pour les embellir.
