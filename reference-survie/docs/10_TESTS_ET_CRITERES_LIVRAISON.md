# Validation fonctionnelle et critères d'acceptation

## Exécuter les tests
```bash
python -m unittest discover -s tests -v
python -m engine.survie --univers DB --vagues 50 --output exemples/DEMO_DB_50_VAGUES.json
python -m engine.survie --univers HXH --vagues 50 --output exemples/DEMO_HXH_50_VAGUES.json
```
Le fichier `rapports/TESTS.txt` contient la sortie réelle des tests du dossier. Les exemples sont des tirages générés à partir des deux catalogues.

## Contrôles automatisés
1. 600 fiches DB et 532 fiches HXH lues par ID.
2. Draft 5 personnages uniques + 3 armes uniques et deck initial 8 cartes.
3. Main initiale 3 cartes avec au moins un personnage ; 1 pioche au round suivant.
4. Budget de rangs **exact**, rangs toujours entre 1 et N.
5. À partir de vague10 au moins 5 ennemis, puis +1 dès dépassement du plafond.
6. Vague18 boss DB = 3000 = cinq rangs 600 ; vague19 boss DB = 3150 = six ennemis.
7. Absence de doublon de rang lorsque faisable ; doublons permis seulement s'ils sont mathématiquement nécessaires.
8. Mort définitive / réanimation conditionnelle ; récupération uniquement des survivants.
9. XP aux cartes jouées et survivantes : 14 victoires pour niveau5.
10. Possibilité de lier équipements aux unités dans un combat de référence.

## Pas encore validé
- Intégration de l'UI réelle V5.2 (non effectuée dans ce pack séparé).
- Transposition du moteur autonome en TypeScript.
- Toutes les interactions complexes `stun`, `counter`, `evade`, `pierce` (hooks documentés, pas implémentation complète dans le simulateur).
- Équilibrage du gain en or, de la puissance réelle des armes, du taux de victoire des runs longues.
- Vérification de **chaque** arme contre chaque planche manga, droits d'illustrations.

## Tests manuels futurs prioritaires
- Une arme « piocher 1 » sur une main pleine ; la pioche ne boucle pas.
- Equiper plusieurs armes du même type sur la même unité ; l'emplacement bloque le cumul illégal.
- Sauver et reprendre une run juste après la mort d'un personnage ou la transformation d'une carte.
- Choisir l'option mystère sans avoir vu le résultat, puis constater le bon ID et son portrait.
- Appuyer sur « Continuer » après vague20, vérifier que la vague21 n'est pas un reset.
- Performances avec 15+ ennemis à très haute vague ; réduire visuellement les éléments sans réduire le budget.
