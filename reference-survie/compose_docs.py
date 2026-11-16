from pathlib import Path
import csv,json,collections,random,datetime
from engine.survie import Catalog,rank_budget,generate_enemy,Run
R=Path(__file__).resolve().parent
D=R/'docs'

def write(name,s): (D/name).write_text(s.strip()+'\n',encoding='utf-8')

def read_csv(path):
 with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=';'))
DB=read_csv(R/'catalogues'/'EQUIPEMENTS_DB.csv'); HX=read_csv(R/'catalogues'/'EQUIPEMENTS_HXH.csv')
M={'common':'Commune','uncommon':'Peu commune','rare':'Rare','epic':'Épique','legendary':'Légendaire'}
C={'CANON_NOMME':'Objet nommé / attesté','CANON_CATEGORIE':'Catégorie attestée','NEN_PERSONNEL':'Nen personnel','EDITORIAL':'Extrapolation éditoriale','HORS_EQUIPEMENT':'Exclu du draft'}

write('01_VISION_ET_BOUCLE_SURVIE.md',r'''
# KI ARENA — Survivre à l'infini

## Statut de cette spécification
Règles de design **validées pour prototypage**. Le code joint est un moteur autonome de référence et un simulateur, pas une modification du dépôt original. Aucun mana. Univers Dragon Ball et Hunter × Hunter **séparés** : un seul univers par run.

## Les trois verbes
**Drafter** (5 personnages + 3 armes), **combattre** (piocher, déployer, équiper), **survivre** (choisir une récompense, conserver les vivants, avancer). Maximum 3 combattants sur le terrain au départ ; des artefacts très rares élargissent à 4 puis 5 places. Le deck peut contenir plus de cinq recrues ; seules les places de terrain limitent les simultanéités.

## Parcours du joueur
1. Choisir l'univers puis un seed (facultatif).
2. Cinq sélections successives de personnage ; chaque sélection montre 3 offres visibles et 1 choix mystère. Pas de doublon au draft.
3. Trois sélections d'armes sur la même formule ; des armes sont toujours de vraies cartes de deck.
4. Deck initial : **8 cartes : 5 personnages + 3 armes**. Aucun mana. Main initiale 3 cartes, dont au moins un personnage.
5. Déployer gratuitement les personnages piochés jusqu'au nombre de places ; poser des cartes d'équipement selon leur cadence (gratuites ou une action d'équipement du round).
6. Autocombat : chaque personnage vivant sur le terrain attaque une fois par round, ordre VIT ; capacité spéciale au maximum une fois par combat selon son déclencheur.
7. KO = retrait définitif de la run ; seules les véritables réanimations redonnent le personnage. Victoire : +25 % des PV max des survivants, **aucune** réanimation automatique.
8. Après victoire : XP aux cartes **jouées et survivantes**, puis récompense au choix (3 propositions).
9. Chemins de la carte : combat, élite, boss, repos, boutique, trésor, événement ; l'utilisateur reste libre de choisir un nœud parmi les chemins réellement reliés. Une « vague » numérote l'indice de difficulté des rencontres, pas forcément chaque nœud.
10. Difficulté sans fin : progression linéaire du budget de **rangs** et ajout d'un slot ennemi seulement lorsqu'un plafond est dépassé. Aucune multiplication de stats gratuite au passage de la vague 20.

## Non négociables
- Ne pas remplacer le moteur de combat existant du projet sans tests : le moteur livré prouve la logique et la compatibilité des données.
- L'image et le nom d'une carte doivent provenir de son `id` de catalogue : aucune image inventée ni nom fusionné.
- Le classement se fait par `ATQ + PV + VIT`, tri ascendant, puis ID comme départage stable.
- Toujours afficher une différence visuelle entre cartes-personnages et cartes-équipements, tout en conservant les 10 finitions du Card Studio.
- Les effets de Nen sont des capacités de personnage non transmissibles, sauf proposition explicitement requalifiée en accessoire narratif.

## Interface recommandée
Accueil épuré : « Nouveau run » et « Reprendre ». Draft animé 3 grandes cartes + mystérieuse face cachée, progression 1/5 puis 1/3. Terrain simple : trois places initiales, cartes en main en bas, deck consultable au scroll, petit badge de pioche 1/round, équipements avec icône 🔧, récompenses 3 cartes, chemin fluide. Aucun compteur de mana.
''')

write('02_DRAFT_PERSONNAGES_ET_ARMES.md',r'''
# Draft initial — 5 personnages + 3 armes

## Règle exacte d'une sélection
Quatre actions possibles : **2 propositions affichées** tirées à rang 25–35 sur une échelle virtuelle 0–60 ; **1 proposition affichée** à rang 15–45 ; **1 carte mystère cachée** à rang 0–60. Le joueur choisit une seule de ces **trois visibles OU l'option mystère**. La borne 0 ne peut pas désigner une carte : elle est transformée en 1.

Cette règle est répétée **5 fois pour les personnages, 3 fois pour les armes**. Les cartes déjà choisies et les autres propositions de la même fenêtre ne se répètent pas. Le mystère doit être généré au même moment que les autres pour qu'il ne dépende pas d'un clic opportuniste.

## Adapter l'échelle à tous les catalogues
Pour un pool de `N` personnages classés, un rang virtuel `r` sur 60 devient `max(1, round(r × N/60))`. Les mêmes fenêtres s'appliquent au pool des **armes physiques transférables** classées par rareté/puissance, avec sa propre taille `W` ; ainsi un nombre différent d'armes DB / HxH ne casse pas le draft.

### Pourquoi séparer les pools
Le draft d'armes de départ contient seulement les lignes `classe=arme`, `compatible_draft=oui`. Les armures, outils, reliques et consommables sont disponibles par les récompenses et boutiques. Les objets de Nen strictement personnels ne sont **jamais distribués à un porteur aléatoire**.

## Régles d'équité
- Une même identité/personnage ne doit pas figurer plusieurs fois au draft de départ. Le moteur évite les ID identiques ; l'intégration UI pourra ajouter la règle anti-formes (même `id_personnage`), recommandée.
- Si un intervalle est vide parce que les choix ont déjà été pris, élargir progressivement la fenêtre plutôt que livrer une option invalide.
- Une carte cachée peut être faible ou exceptionnelle : afficher la probabilité générale et son caractère risqué, jamais sa valeur avant le choix.
- Ne pas afficher de personnages dont le mode Survie ne permet pas d'action réelle.

## Deck initial et limites
`5 personnages + 3 armes = 8 cartes`. Le nombre de cartes du deck est **nombre de recrues vivantes + nombre d'équipements conservés**. Les personnages morts sortent définitivement du deck ; une arme équipée n'est pas détruite, mais se remet dans la pile au début du prochain combat. Les nouveaux recrutements ajoutent leurs propres cartes au deck.

## Questions d'UX résolues
- Aucun joueur ne commence avec zéro carte de personnage en main : la main initiale de 3 garantit au moins une unité.
- Aucune carte ne demande d'attendre 5 rounds avant d'être jouable (pas de mana).
- Le draft ne nécessite pas d'animations longues ; les offres glissent en place, la carte cachée se retourne seulement si sélectionnée.
''')

write('03_DIFFICULTE_MATHEMATIQUE_ET_VAGUES.md',r'''
# Difficulté infinie — budgets de rangs EXACTS

## Rangs
Trier le roster de `N` cartes selon `P = ATQ + PV + VIT` (croissant). Chaque rang entier entre 1 et N représente une carte ; conserver le vrai P pour le combat, sans le remplacer par un rang synthétique. Toute édition du CSV invalide l'ordre et exige un nouveau classement.

## Budgets au lancement d'une rencontre
Soit `Δ=N/20`, la vague `v>=1` et le genre `t` : normal=0, élite=1, boss=2.

`B(v,t)=round(5 × Δ × (v+t)) = round((N/4) × (v+t))`.

Pour `N=600`, vague 1 = 150 / 300 / 450 ; vague 2 = 300 / 450 / 600. Cette formule continue après la vague 20 : **aucune remise à zéro ni nouvelle augmentation artificielle de stats.** Pour `N=532`, la marche vaut 133.

## Nombre de monstres
Vagues 1–9 : tirer 1 à 5 ennemis **uniquement parmi les nombres compatibles avec le budget**. Dès vague 10 : **au moins 5** ennemis, sans tirage de taille. Après, le nombre requis est `max(5, ceil(B/N))`.

On commence donc à 5 slots à la vague 10. Lorsque le budget dépasse `5N`, il faut passer à 6 emplacements (capacité `6N`), puis à 7 quand il dépasse `6N`, etc. Exemple : boss vague 18 avec `B=3000` → cinq fois le rang 600 possible et exact ; boss vague 19 `B=3150` → 6 ennemis. Cela reflète la demande de ne **jamais gaspiller de budget**, sans décimales de puissance arbitraires.

## Répartition exacte
Pour `k` ennemis, tirer `r1...rk` entiers avec `1<=ri<=N` et `Σri=B`. Tant qu'une solution sans doublon de rang existe, elle est **obligatoire**. Sinon les doublons sont autorisés mathématiquement, notamment au plafond `k×N`. L'identité peut se répéter à ce plafond, ce qui constitue une exception affichée, non un bug silencieux.

Une solution de rangs tous distincts existe si `k<=N` et `k(k+1)/2 <= B <= k(2N-k+1)/2`. Le code choisit une répartition valide directement. Les personnages sont aléatoires parce que la décomposition aléatoire change ; le seed garantit une répétabilité lors de tests.

## Adaptation des armes ennemies
Les équipements sont **un deuxième axe de difficulté visible**, et ne modifient pas le budget de rangs des unités. Par défaut : quantité ennemie `min(k, floor((v-1)/5) + (élite?1:0) + (boss?1:0))`, rareté max `min(5, 1+floor((v-1)/5)+(boss?1:0))`.

Les ennemis déploient immédiatement les personnages de leur équipe, puis **piochent leurs équipements** dans un mini-deck et les posent avec la même cadence que le joueur. Leur puissance augmente par fréquence et rareté d'armes, pas en inventant une nouvelle statistique cachée. Tester le cumul avec les rangs : la somme exacte porte sur les rangs des personnages, les armes sont un multiplicateur tactique séparé annoncé au joueur.

## Progression au-delà de 20
Exemple DB : vague 20 normal B=3000 (5 slots), boss B=3300 (6 slots). Vague 21 normal B=3150 (6 slots), boss B=3450 (6 slots). Vague 25 boss B=4050 (7 slots). Aucun reset en 21/20 ; seulement une graduation linéaire de la difficulté et de la taille des équipes ennemies.

## Précautions
- Les rangs sont une approximation imparfaite de la difficulté tactique : effets, VIT, composition et soin jouent beaucoup.
- Une run ne doit pas devenir impossible à cause d'un nombre infini d'ennemis sur le même écran. Pour très hautes vagues, envisager des escouades successives ou une représentation compacte **sans modifier le budget**.
- Les rangs faibles n'ont pas de bonus gratuit en cycle 2 ; c'est l'augmentation du nombre d'adversaires et de l'équipement qui assure la difficulté.
''')

write('04_DECK_PIOCHE_EQUIPEMENTS_COMBAT.md',r'''
# Cartes d'armes, pioche et combat — PAS DE MANA

## Deck unique, deux familles de cartes
**Personnages** : une carte par recrue vivante. **Équipements** : une carte par arme/armure/outil possédé. Le deck initial contient donc 8 cartes après le draft. Toute arme est une carte piochable : l'illustration montre l'objet, le cadre varie selon la rareté et le bandeau d'effet indique une phrase au maximum.

## Pioche et pose
Main de départ de 3 dont au moins 1 personnage ; puis **1 pioche à chaque nouveau round**. Le joueur peut poser gratuitement ses personnages si une place est disponible. Il n'y a aucune énergie ou mana. Pour les armes : un équipement `cout_action_equipement=0` se pose immédiatement ; un équipement `=1` utilise **l'unique pose d'équipement payante du round** ; il n'y a jamais de réserve de mana. Certaines armes déclenchent en plus `+1 pioche` lors de leur pose (plafond de +2 cartes bonus par round pour éviter une boucle). Une arme ne peut s'activer qu'une fois dans ce combat.

## Emplacements d'un combattant
1 emplacement arme + 1 emplacement armure. Les outils et manifestations autorisées utilisent l'emplacement arme par défaut ; consommables s'appliquent immédiatement et sont défaussés pour le combat. Un remplacement explicite requiert un échange de carte, pour éviter qu'une suite de petites armes ne multiplie les bonus sans limite.

## Effets courts (propositions de gameplay, non pouvoirs officiels)
- `atk` : bonus ATQ lors de la pose ; attaque normale supplémentaire **non** accordée.
- `pierce` : bonus ATQ avec potentiel d'ignorer une partie de l'armure ; à brancher sur le moteur V5.2.
- `shield` / `hp` : barrière temporaire ou protection, pas de résurrection.
- `draw` / `scout` : pioche une autre carte.
- `heal` : soin ponctuel sur une unité vivante.
- `stun`, `evade`, `counter` : statut léger, au plus une activation par combat dans le moteur de production. Le simulateur livré ne calcule que les bonus ATQ / bouclier / soin / pioche : les autres effets sont des **hooks à connecter**.

## Ennemis
Leur équipe de monstres est déployée directement pour garantir un combat immédiat. Ils possèdent cependant **un mini-deck d'équipements**, 3 cartes de main initiale au maximum, puis 1 pioche par round. Les cartes gratuites sont équipées immédiatement et les autres suivent 1 action d'équipement par round. Aucun mana ennemi non plus.

## Durée & UI
Cible : 20–60 s un combat normal, 40–90 s un boss, option accélérer x2 et animations non bloquantes. La main est visible en bas d'écran et peut être ouverte au scroll ; éviter le dessin d'une carte au-dessus des combattants pendant trop longtemps. Visuel de l'arme équipée : une LED + petite icône du bon grade près du portrait de son porteur.

## Compatibilité
Les objets du CSV marqués `NEN_PERSONNEL` sont répertoriés pour fidélité à Hunter × Hunter, mais ne deviennent **pas** des armes librement échangeables. Ils doivent éventuellement rejoindre le système de capacité liée à la carte du personnage. Les entrées `HORS_EQUIPEMENT` sont exclues. Les autres utilisent la même interface `EquipmentCard` côté DB ou HXH.
''')

write('05_RECOMPENSES_RELIQUES_MORT_XP.md',r'''
# Récompenses, reliques, recrutement et niveaux

## Règles de survie
- Victoire : +25 % des PV max **aux vivants seulement** (plafond 100 %). KO = définitivement mort pour la run ; il sort du deck et de la liste des combattants. Un Senzu / une réanimation peut être utilisé seulement si un objet précis autorise le retour ; ne jamais ressusciter automatiquement.
- Une place vide demeure vide jusqu'à recrutement. Récompense de type recrutement = choisir une unité réellement vue dans l'équipe ennemie, si disponible.
- Si plus aucune recrue vivante : défaite et fin de run. Les armes n'attaquent pas toutes seules.

## Récompenses : toujours un choix lisible
Normal : proposition de 3 parmi or, soin léger, arme, consommable, recrutement possible. Élite : inclure parfois relique, plus d'or et arme rare. Boss : une offre majeure possible (relique, réanimation, objet rare de +1 place de combat), mais pas les trois gratuitement. Marchand/repos/trésor/événement sont des nœuds séparés ; ne pas afficher six popups après chaque combat.

## Extension de terrain
**3 slots de combattants au départ**, 4 avec le premier artefact extra-rare, **5 maximum dans cette première version** avec un deuxième artefact. Les personnages stockés au deck ne sont pas limités à 5 ; ils attendent la pioche. L'arme ne consomme pas un slot combattant. L'adversaire peut dépasser 5 places à très haute vague puisque son budget de rangs l'impose.

## Reliques (propositions, toutes inventées pour le système de jeu)
- « Manuel d'entraînement » : +1 carte dans la main initiale.
- « Vitesse de lecture » : 2 pioches par round au lieu de 1.
- « Jardin médicinal » : +5 % de PV max après chaque victoire, pour les survivants.
- « Capsules de secours » : chance très rare de choisir une réanimation à la récompense du boss.
- « Étendard de commandement » : +1 emplacement combattant, plafonné à 5.
Les reliques sont **globales** et ne sont pas des armes ; elles n'entrent pas dans le deck. Les trois premières sont câblées dans le moteur de référence ; les deux autres se matérialisent via les offres spéciales de récompense.

## XP de personnages — maximum 5
Un personnage gagne +1 victoire d'XP s'il a été **joué et est survivant au moment de la victoire**. Les unités restées dans le deck / main n'en gagnent pas, les morts non plus.

| Niveau | Victoires depuis niveau précédent | Cumul |
|---|---:|---:|
| 1 | — | 0 |
| 2 | 2 | 2 |
| 3 | 3 | 5 |
| 4 | 4 | 9 |
| 5 | 5 | 14 |

Lors d'un niveau : si une transition explicite approuvée existe dans `catalogues/EVOLUTIONS_VALIDEES.csv`, remplacer la carte par la version plus puissante **du même personnage**, conserver le niveau et préserver proportionnellement les PV. Sinon augmenter ATQ/PV/VIT de +10 %, cumul multiplicatif, jusqu'au niveau 5. Pas de transformation imaginative vers un personnage différent.

### Exclusions importantes
Gon adulte est une transformation sacrificielle exceptionnelle, **pas** une évolution automatiquement accordée après quelques victoires ; la transition est marquée `BLOQUE` dans le fichier. En général, éviter d'utiliser des capacités à conditions tragiques comme simple upgrade gratuit.

## Économie préliminaire
Or de récompense démo `12 + 5 × vague` ; coût des boutiques à calibrer par simulations. Réanimation très rare et pas de réserve infinie : elle ne doit pas annuler la permanence de la mort. Récompenses moyennes plus fréquentes que celles à forte variance pour que le hasard ne décide pas de toute la run.
''')


def weapons_doc(uni,rows):
 title='Dragon Ball / DBZ / DBS' if uni=='DB' else 'Hunter × Hunter'
 st=collections.Counter(r['statut_canon'] for r in rows)
 intro=f'''# Catalogue d'équipements — {title}\n\n**{len(rows)} entrées de travail**, dont {sum(r['compatible_draft']=='oui' for r in rows)} disponibles dans le pool général d'équipement. Le **draft initial de trois armes** ne tire que dans les lignes `classe=arme` et `compatible_draft=oui` ({sum(r['classe']=='arme' and r['compatible_draft']=='oui' for r in rows)} références). Les statistiques sont des créations de game design et **ne correspondent pas à des valeurs officielles**.\n\nLe catalogue couvre les objets identifiés, des types d'armes courants des arcs et les équipements remarquables ; il n'est **pas garanti exhaustif** pour toutes les armes anonymes visibles dans toutes les cases du manga. Le champ `source` et le statut de preuve sont essentiels avant publication.\n\n### Portée canonique\n'''
 for k,v in st.items():intro+=f'- {C.get(k,k)} : {v}\n'
 intro+='''\n**Important :** les armes corporelles et les effets de Nen ne sont pas des objets physiquement transférables. Les équipements personnels de Nen sont consignés mais exclus du pool générique. Les objets issus de jeux, films, GT ou Daima ne doivent pas être ajoutés automatiquement à Dragon Ball.\n\n## Inventaire détaillé\n\n| # | Objet | Porteur / contexte | Type | Rareté | Effet de jeu | Fiabilité |\n|---:|---|---|---|---|---|---|\n'''
 for i,r in enumerate(rows,1):
  intro+=f"| {i} | [{r['nom']}]({r['source']}) | {r['porteur_original']} | {r['classe']} | {M[r['rarete']]} | {r['effet_principal']} | {C.get(r['statut_canon'],r['statut_canon'])} |\n"
 intro+='''\n## Équilibrage / intégration\nLes colonnes `attaque_bonus_pct`, `armure_bouclier_pct`, `soin_pct` et `pioche_supplementaire` sont **des paramètres proposés**. `cout_action_equipement=0` signifie pose gratuite ; `=1` utilise une action d'équipement du round sans constituer un système de mana. `utilisations_par_combat=1` limite l'activation de l'effet ; la carte retourne dans le deck au prochain combat si son propriétaire survit.\n\nLes variantes de même famille (« fusil », « armure Saiyan », etc.) ne sont pas de nouveaux artefacts canoniques nommés : elles élargissent seulement le pool visuel et doivent être regroupées si elles deviennent redondantes. Les sources Fandom sont des encyclopédies communautaires à recouper avec l'œuvre avant d'annoncer une fidélité parfaite.\n'''
 return intro
write('06_CATALOGUE_ARMES_DRAGON_BALL.md',weapons_doc('DB',DB))
write('07_CATALOGUE_ARMES_HUNTER_X_HUNTER.md',weapons_doc('HXH',HX))

write('08_INTEGRATION_CURSOR_ET_SCHEMAS.md',r'''
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
  category: 'arme'|'armure'|'outil'|'consommable'|'nen'|'intrinseque';
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
''')

write('09_AUDIT_CANON_SOURCES_LIMITES.md',r'''
# Audit de fidélité et limites — à lire avant distribution

## Classification de chaque fiche d'équipement
`CANON_NOMME` : objet identifiable nommé et présent dans des encyclopédies d'œuvre ; l'effet de jeu reste inventé. `CANON_CATEGORIE` : type d'objet physiquement plausible et attesté de manière générale, mais **pas** un artefact nommé ; détails et porteurs à vérifier. `NEN_PERSONNEL` : manifestation/capacité propre au personnage, **pas** transférable à autrui ; exclu du draft global. `EDITORIAL` : invention générique du système de jeu, clairement indiquée. `HORS_EQUIPEMENT` : objet/capacité non équippable ou incompatible avec le mode, exclu.

## Important pour Dragon Ball
DB / DBZ / DBS comme le catalogue original, sans GT, Daima ou univers des jeux vidéo. Les fan-wikis mélangent souvent produits dérivés et continuités : vérifier toute arme dont la page mêle jeux, films ou scènes anime avant de la qualifier de manga canonique. L'épée Z est canonique mais son pouvoir réel a des particularités : la « puissance » de l'arme ne signifie pas +500% officiel.

## Important pour Hunter × Hunter
Certaines « armes » sont des techniques Nen (Chaos Slots, chaînes de Kurapika, Blinky, etc.) et ne peuvent être traitées comme objets qu'avec une règle explicitement **non canonique**. Les cartes Greed Island obéissent dans l'œuvre à des règles d'usage propres au jeu ; le fait de les placer dans un roguelike extérieur est une adaptation créative. Aucun chiffre ATQ/PV/VIT n'est officiel. L'arc Guerre de succession possède beaucoup d'armes génériques non nommées, dont les pages secondaires restent à recouper case par case.

## Statut des données et droit d'auteur
Les deux catalogues personnages d'entrée sont des assemblages de travail, pas des bases officielles certifiées exhaustives. Les illustrations doivent être créées ou utilisées avec droits adéquats avant distribution publique ; fournir un lien Google Images ne donne aucun droit de réutilisation. Les sources URL intégrées sont des pistes d'audit et certaines peuvent être obsolètes ou traiter d'autres continuités. Ne pas exporter automatiquement une fiche non validée comme certitude.

## Cas sensibles déjà traités
- « Nuage magique » → outil, pas arme tranchante ; légendé comme tel.
- « Senzu » / « Souffle de l'Ange » → consommables (soin), pas des armes.
- « Lame de ki de Goku Black » → une technique, pas une épée ramassable.
- « Gon adulte » → transformation exceptionnelle, non upgrade libre.
- « Nen de Kurapika » et « Crazy Slots » → lié à un possesseur, pas donné à n'importe quel combattant.

## Vérification recommandée avant version définitive
Priorité 1 : objets ayant le statut `EDITORIAL` ou `CANON_CATEGORIE`. Priorité 2 : pages de source ambiguës et éléments de l'anime non repris dans le manga. Priorité 3 : multiples variantes d'une même arme ou plusieurs interprétations d'un nom. Retirer/regrouper au besoin : la qualité prévaut sur la longueur de la liste.

## Sources principales
- Dragon Ball Wiki, inventaire d'armes : https://dragonball.fandom.com/wiki/Category:Weapons
- Scouter : https://dragonball.fandom.com/wiki/Scouter
- Z Sword : https://dragonball.fandom.com/wiki/Z_Sword
- Bansho Fan : https://dragonball.fandom.com/wiki/Bansho_Fan
- Hunterpedia, Melee Weapons : https://hunterxhunter.fandom.com/wiki/Melee_Weapons
- Nen : https://hunterxhunter.fandom.com/wiki/Nen
- Kite : https://hunterxhunter.fandom.com/wiki/Kite
- Greed Island Card Lists : https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists
- Sword of Truth : https://hunterxhunter.fandom.com/wiki/Sword_of_Truth
- Paladin's Necklace : https://hunterxhunter.fandom.com/wiki/Paladin%27s_Necklace
''')

# wave projections, all variants
rows=[]
for universe in ['DB','HXH']:
 cat=Catalog(universe);rng=random.Random(123)
 for w in range(1,61):
  for kind in ('normal','elite','boss'):
   en=generate_enemy(cat,w,kind,rng)
   rows.append(dict(univers=universe,vague=w,rencontre=kind,budget=en.budget,nb_ennemis=en.enemy_slots,plafond=en.enemy_slots*cat.N,somme_tirage=en.spent,rangs='|'.join(map(str,en.ranks)),nb_equipements_ennemis=len(en.gears),niveau_arme_max=min(5,1+(w-1)//5+(kind=='boss'))))
with (R/'catalogues'/'PROGRESSION_60_VAGUES_DB_HXH.csv').open('w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=';');writer.writeheader();writer.writerows(rows)

cfg={'version':'Survie Infinity V2 / 2026-10-21','univers':['DB','HXH'],'draft':{'personnages':5,'armes':3,'offres_visibles':[(25,35),(25,35),(15,45)],'option_mystere':(0,60)},'combat':{'mana':False,'main_depart':3,'pioche_par_round':1,'slots_allies_initiaux':3,'slots_allies_max_v2':5,'attaque_normale_par_unite_round':1,'soin_victoire_pct_vivants':25,'mort_permanente':True},'equipements':{'equip_par_unite':1,'armure_par_unite':1,'cout_en_actions_round':[0,1],'action_equipement_par_round':1,'pioche_bonus_plafond_par_round':2},'difficulte':{'rank_field':'attaque+pv+vitesse','increment_rangs':'N/20','normal':'5*(N/20)*vague','elite':'5*(N/20)*(vague+1)','boss':'5*(N/20)*(vague+2)','ennemis_aleatoires_jusque_vague':9,'ennemis_base_vague_10':5,'slots_supplementaires_si_budget_depassant_kN':True,'budget_exact':True,'anti_doublons_si_mathematiquement_possible':True},'xp':{'niveau_max':5,'victoires_par_seuil':[2,3,4,5],'stat_bonus_pct_si_pas_devolution':10}}
(R/'catalogues'/'CONFIG_SURVIE.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2),encoding='utf-8')

write('10_TESTS_ET_CRITERES_LIVRAISON.md',r'''
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
''')

(R/'README.md').write_text('''# KI ARENA — SURVIE INFINITY V2\n\n**Dossier indépendant et documenté** pour le nouveau mode Survie, avec les deux univers DB et Hunter × Hunter. Ne remplace pas le ZIP du jeu.\n\n## Contenu\n- `docs/01_...10_...md` : dix documents de conception distincts, inventaires complets par manga, intégration et limites\n- `catalogues/EQUIPEMENTS_DB.csv` : 43 entrées (y compris les exclusions et les objets non équipables pour audit)\n- `catalogues/EQUIPEMENTS_HXH.csv` : 55 entrées (y compris manifestations Nen non échangeables)\n- `catalogues/DB_CARTES_SOURCE.csv` : 600 cartes Dragon Ball issues du catalogue fourni\n- `catalogues/HXH_CARTES_SOURCE.csv` : 532 cartes Hunter × Hunter issues du catalogue fourni\n- `catalogues/PROGRESSION_60_VAGUES_DB_HXH.csv` : 360 rencontres de référence, rangs et armes ennemies\n- `catalogues/EVOLUTIONS_VALIDEES.csv` : transitions autorisées explicitement\n- `catalogues/CONFIG_SURVIE.json` : règles paramétrables\n- `engine/survie.py` : moteur de référence Python sans dépendance externe\n- `tests/test_survie.py` : tests de cohérence et de faisabilité\n- `exemples/DEMO_*_50_VAGUES.json` : sorties du simulateur sur catalogues réels\n- `rapports/TESTS.txt` : résultat des tests exécutés\n\n## Tester\nOuvrir un terminal dans ce dossier puis :\n\n```bash\npython -m unittest discover -s tests -v\npython -m engine.survie --univers DB --seed 42 --vagues 25\npython -m engine.survie --univers HXH --seed 42 --vagues 25\n```\n\nLes règles de référence du draft, du deck, des rangs et des récompenses sont décrites dans les documents. **Sans mana.** Le code de démonstration n'intègre pas encore les pages ni les animations du jeu V5.2 existant.\n''',encoding='utf-8')
print('documents',len(list(D.glob('*.md'))),'projection rows',len(rows))
