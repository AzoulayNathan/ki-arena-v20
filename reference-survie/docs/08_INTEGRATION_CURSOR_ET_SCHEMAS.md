# Intégration technique à Cursor et au dépôt KI ARENA

## Ce qui est réellement livré
- `engine/survie.py` : moteur Python de **référence et de validation** (draft, rangs, génération, pioche, équipements, victoire, XP, mort, récompenses). Ce n'est **pas** le moteur TypeScript du jeu, et il n'est pas branché au frontend du ZIP KI ARENA V5.2.
- `catalogues/DB_CARTES_SOURCE.csv` et `HXH_CARTES_SOURCE.csv` : copies des vrais inventaires utilisés dans les tests.
- `catalogues/EQUIPEMENTS_DB.csv` et `EQUIPEMENTS_HXH.csv` : fiches de cartes d'équipement et notes d'origine.
- `catalogues/EVOLUTIONS_VALIDEES.csv` : exceptions de transformation éditorialement approuvées.
- `catalogues/CONFIG_SURVIE.json` : configuration visible des règles, à migrer en TS.
- `exemples/DEMO_*_50_VAGUES.json` : exemples générés de vraie répartition des rangs et équipements ennemis.
- `tests/test_survie.py` : tests automatisés.

## Commandes immédiates (Windows / macOS / Linux)
Dossier racine du pack :\n\n```bash
python -m unittest discover -s tests -v
python -m engine.survie --univers DB --seed 42 --vagues 25 --output exemples/ESSAI_DB.json
python -m engine.survie --univers HXH --seed 77 --vagues 25 --output exemples/ESSAI_HXH.json
```
Tout fonctionne avec la bibliothèque standard Python ; **pas de dépendance pip** pour le moteur. Tester la conversion/affichage du catalogue CSV dans l'UI séparément.

## Modules TypeScript à créer dans le jeu existant
1. `src/survival/catalog.ts` : mapper les colonnes FR, lire sources DB et HXH, score ATQ+PV+VIT, index de rang stable.
2. `src/survival/draft.ts` : générer 3 offres visibles + mystery, choisir 5+3, seed et anti-doublons.
3. `src/survival/encounter.ts` : `rankBudget`, `countEnemies`, `distributeExact`, pool d'armes ennemies, tests d'invariants.
4. `src/survival/deck.ts` : recrues vivantes + équipements, pioche 3 puis 1/round, obligation d'une unité au démarrage.
5. `src/survival/equipment.ts` : 1 emplacement arme/1 armure, action 0/1, hooks de déclenchement du combat.
6. `src/survival/progression.ts` : xp 2/3/4/5, transformations approuvées, morts/résurrections, sauvegarde.
7. `src/survival/rewards.ts` : trois offres, y compris armes, reliques et rare augmentation de slots.
8. `src/survival/ui/` : utiliser l'actuel Card Studio ; ne pas refaire son architecture visuelle sans demande.

## Schémas minimaux
```ts
type EquipmentCard = {
  id: string; universe: 'DB'|'HXH'; name: string;
  rarity: 'common'|'uncommon'|'rare'|'epic'|'legendary';
  category: 'arme'|'armure'|'outil'|'consommable'|'nen'|'intrinseque'|'technique';
  effectCode: string; attackBonusPct: number; shieldPct: number;
  healingPct: number; drawBonus: number; equipActionCost: 0|1;
  originalOwner: string; canonStatus: string;
};
type Encounter = {wave: number; kind:'normal'|'elite'|'boss'; targetBudget:number; ranks:number[];enemyIds:string[];equipmentIds:string[]};
type RunState = {universe:'DB'|'HXH';seed:number;wave:number;aliveIds:string[];deadIds:string[];equipmentIds:string[];relicIds:string[];fieldSlots:number;coins:number};
```

## Intégration dans le moteur actuel
- À l'entrée d'un combat : faire apparaître l'équipe ennemie selon l'Encounter ; mélanger deck personnages+équipements du joueur, mini-deck armes ennemi.
- À chaque round : ouvrir pioche joueur 1, l'auto-bot équipe les cartes jouables avant les attaques ; conserver exactement une attaque par unité vivante et VIT initiative.
- Au KO : enlever instantanément la carte de la run, y compris du deck ; ne pas rendre des PV à une carte morte après victoire.
- À la fin : soigner 25% survivants, XP joués survivants, générer choix de récompenses. Persister immédiatement `RunState` dans localStorage/IndexedDB versionné.
- Les images et 10 templates de rareté viennent du Card Studio existant, pas du scraper ; les équipements utilisent leur propre `image_id`, pas la photo d'un personnage.

## Tests prioritaires de non-régression
N=600, v1 normal150 elite300 boss450 ; v18 boss3000 avec 5 rangs600 ; v19 boss3150 avec 6 unités ; v21 normal3150 avec 6 ; 1 pioche/round ; draft 5+3 ; 3 places terrain ; +1 par artefact rare ; KO définitif ; 14 victoires jouées pour niveau5 ; aucun mélange DB/HXH ; armes Nen personnelles exclues du draft commun.

## Prompt court pour Cursor
> Intègre les règles contenues dans `docs/01_*` à `docs/08_*` dans le jeu V5.2 existant, en gardant sa DA validée, ses cartes et son moteur d'autobattle. Utilise `engine/survie.py` comme référence de calcul, les CSV comme source, et ajoute des tests TypeScript pour les mêmes invariants. Aucun mana. N'annonce pas que l'intégration est finie tant que les tests de run, de save/restore et d'affichage du deck ne passent pas. Ne modifie pas les autres modes.
