# Architecture d'intégration V8 → V9

## Ne pas confondre les technologies

- Le dépôt V8 existant est en **JavaScript ES modules** (`src/*.js`), lancé par un serveur Node intégré. Il n'a pas de compilateur TypeScript obligatoire.
- Le moteur Python `engine/survie.py` du pack ajouté est une **référence de calcul**, pas un service de runtime JavaScript accessible au navigateur hors ligne.
- La proposition `src/survival/*.ts` du document source indique des modules souhaités, et non des fichiers déjà intégrés.

## Modules cibles recommandés (JS pur pour intégration rapide)

```text
src/survival/
  catalog.js       charge les cartes/objets CSV précompilés en JSON local ; tri P + rang stable
  draft.js         5+3, offres 3+1 mystère, anti-doublons, seed
  encounter.js     budget rang exact et décomposition sans doublons si faisable
  deck.js          cartes perso+équipements, main, pioche, recyclage
  equipment.js     catégories, slots, effets, limites d'actions, incompatibilités
  battle-adapter.js  raccord au moteur actuel sans casser le combat V8
  progression.js   morts, soins vivants, XP, transformations autorisées
  rewards.js       génération puis validation des 3 choix de loot
  storage.js       versionnage, migrations, checkpoints, idempotence
  state-machine.js transitions et validation par état
  ui.js            rendu draft / carte / combat / inventaire / récompenses
```

Le projet peut évoluer en TypeScript SI l'IA établit un pipeline local et un build HTML autonome fiable ; ne pas ajouter du `.ts` brut non servi par le navigateur.

## Modèle de données recommandé

- `CardRef` : `{universe,id,type:'character',baseStats}` issu du vrai CSV et `id` stable.
- `EquipmentDefinition` : `{id,universe,category,rarity,canonicalStatus,draftEligible,effectCode,cost,uses,imageId}` ; graphismes d'objets distincts du Card Studio personnages.
- `UnitRunState` : `{cardId,hpCurrent,level,xpWins,alive,weaponId,armorId}`.
- `SurvivalRunState` : `{schemaVersion:'survival-v1',mode:'survival-infinity-v2',universe,seed,wave,phase,liveUnits,deadIds,drawPile,hand,discardPile,fieldSlots,fieldUnits,items,relics,coins,rngState,history,checkpointId}`.
- `RogueV8RunState` : laissé tel quel ; aucune conversion destructive.

## Persistance robuste

- Keys locales préfixées pour séparer `kiarena:v8:...` (héritage existant inchangé) et `kiarena:v9:survival:<universe>...` (nouveau).
- Migrer/afficher les anciennes sauvegardes sans effacer les données lors du premier démarrage.
- Un identifiant stable d'événement récompense/KO/checkpoint garantit qu'une reprise ne duplique pas un item, XP ou des zénis.
- Sauvegarder la RNG interne et les tirages déjà proposés, notamment le mystère. Pas de nouveau tirage suite à rafraîchissement.
- Flux en modes finis (`draft-char`, `draft-weapon`, `map`, `prebattle`, `combat`, `reward`, `shop`, `rest`, `run-end`). Refuser les clics hors état.
- Export/import sauvegardes locales versionnées et restaurables ; tests anti-corruption, format inconnu et vieux snapshot.

## Build local et offline

- `npm start` V8 expose déjà `http://127.0.0.1:4173` sans réseau extérieur ; préserver.
- `npm run build:offline` crée le HTML autonome. Vérifier qu'il inclut les nouveaux assets et données HXH sans chargement HTTP.
- Fournir `.bat` Windows et `README_JOUER.md` non technique.
- Optimiser au chargement les 1132 cartes (600+532), éviter de charger toutes les images d'un coup ; `loading=lazy`, caches locaux, zéro URL d'images obligatoires.

## Barrières de non-régression

- SHA256 du CSV original DB, des templates carte et moteur V8 avant/après.
- Tests V8 exécutés avant et après.
- Un adaptateur de battle pour Survie Infinity, sans réécrire directement les règles V8.
- Plusieurs profils de sauvegardes : V8 actif, V8 terminé, Survie DB/HXH à draft, combat, KO, récompense.
