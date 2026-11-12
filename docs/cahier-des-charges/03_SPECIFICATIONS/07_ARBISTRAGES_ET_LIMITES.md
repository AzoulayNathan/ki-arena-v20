# Arbitrages préparés pour l'IA et limites importantes

## Décisions prises dans CE dossier

1. **Créer Survie Infinity V2 comme nouveau mode distinct** ; ne pas convertir le Roguelike V8 de 5 actifs en deck à 3 slots.
2. **Conserver le catalogue DB V8 strictement** ; importer séparément les 532 fiches HXH pour ce nouveau mode seulement.
3. **Référence de difficulté du nouveau mode** : rangs exacts, pas formule « moyenne » du mode V8.
4. **98 fiches d'items ne signifie pas 98 armes équipables** ; exclusions et sources restent visibles.
5. Les descriptions de l'œuvre, classements, effets chiffrés et règles de l'autobattle sont éditoriaux, pas des statistiques officielles.
6. Le style artistique attendu est « Dragon Adventure Clean », panoramas et trois grands choix animés ; mobile en cartes horizontales, inventaire en bas.
7. Aucun réseau et aucun paiement ; le jeu doit fonctionner d'abord sur le PC du propriétaire.

## Décisions de réalisation laissées à l'IA (choix raisonnables et documentés)

- Positionnement précis de la nouvelle entrée de menu et des écrans draft/terrain.
- Utiliser modules JS purs ou pipeline TS local **seulement si compilé et livré**.
- Rendu de remplacement HXH quand une illustration manque, sans prétendre avoir des images sous licence.
- Calibration prix, taux de loot et amplitude des bonus qui ne sont que des propositions du simulateur.
- Choix technique pour éviter qu'une pioche ne boucle, gérer la taille de la main et le deck vide.
- Création de nouveaux items éditoriaux uniquement s'ils apportent de vrais choix et sont testés.
- Granularité d'une interface pour 10+ ennemis à haute vague, sans diminuer le budget mathématique.

## Risques réels

- Les textes d'intégration du pack parlent d'un **moteur TS V5.2** : le dépôt fourni actuellement est principalement **ES modules JS V8**.
- Pack Survie Python distinct : son `survie.py` ne prouve pas le fonctionnement dans le navigateur.
- Les assets HXH du CSV peuvent être des chemins non résolus dans V8 ; ne pas prétendre que 532 portraits définitifs sont disponibles sans test.
- Certains objets sont des techniques ou parties du corps ; ne pas transformer leur présence dans un CSV en loot physique.
- Deux systèmes de mort, d'items et de difficulté doivent rester compatibles sans se confondre.
- Droits sur noms/personnages/illustrations Dragon Ball et Hunter × Hunter : **fan-made non officiel**, usage public ou commercial à clarifier indépendamment.
- Le HTML autonome actuel teste V8 ; la future V9 à 1132 fiches devra vérifier charge locale/mémoire, encodage et limites du navigateur.

## Politique de livraison

Toute exigence non testée doit être signalée en statut `BLOCKED` ou `NON TESTÉ`, pas cachée. Si les assets HXH empêchent une version visuellement finale, le dire, tout en livrant DB complet et fonctionnement vérifiable. La créativité est bienvenue, mais la cohérence prime sur l'accumulation.
