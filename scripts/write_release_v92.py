from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
def write(name,text): (root/name).write_text(text,encoding='utf-8')
def append(name,text):
 p=root/name;previous=p.read_text(encoding='utf-8');marker=text.strip().splitlines()[0];previous=previous.split(marker)[0].rstrip();p.write_text(previous+'\n\n'+text.strip()+'\n',encoding='utf-8')
q=json.loads((root/'qa/v92-browser-report.json').read_text());before=json.loads((root/'qa/audit-v92-before.json').read_text());sims=json.loads((root/'qa/simulations-6000.json').read_text())['results']
metrics='\n'.join(f"| {v['width']} × {v['height']} | {v['geometry']['documentHeight']} px | Oui | Oui |" for v in q['viewports'])
write('AUDIT_V9_2.md',f'''# Audit et corrections V9.2 — 22 octobre 2026

L’audit porte sur le ZIP Grand Voyage 9.1 précédemment livré. Le menu était amélioré, mais la recette précédente ne contrôlait que le débordement horizontal : elle ne prouvait pas qu’un combat tenait à l’écran. Ce critère était insuffisant pour une interface de jeu.

| Constat vérifié dans le code / navigateur | Correction livrée | Preuve |
|---|---|---|
| Boss = groupe générique toutes les cinq vagues, sans chef nommé dans Survie | Chef issu du véritable catalogue, portrait existant, technique, badge et PV dédiés ; compte à rebours jusqu’au boss | src/survival/boss.js, captures/v92-boss-1360.png |
| Main à 994–1059 px du haut pour une fenêtre haute de844px | Terrain, main, pioche et commande de round dans le même viewport ; déploiement groupé gratuit | qa/audit-v92-before.json, qa/v92-browser-report.json |
| Carte enfouie dans la page | Bouton Carte permanent, touche M, fenêtre fermable avec Échap ; graphe V8 et parcours Survie propre au mode | captures/v92-map-overlay-390.png, v92-rogue-map-1360.png |
| Animations génériques peu liées aux techniques | Effet sélectionné à partir du nom/type réels de l’événement : rayon, lame, impact, zone, soin, protection, aura, esquive, état, KO | src/combat-fx.js, qa/offline-v92-report.json |
| Pas de composition5v5 directe et explicite depuis l’accueil | Combat auto : choix manuel de cinq cartes sur600, CPU seedé ou adversaire composé ; moteur V8 exact | src/auto5.js, tests/test-v92.mjs, captures/v92-auto5-team-390.png |

## Mesures après correction

| Fenêtre | Hauteur du document | Terrain/main/commandes visibles ensemble | Carte à1clic |
|---|---:|---|---|
{metrics}

La main et les très grands groupes ennemis possèdent leur propre défilement horizontal. La pioche reste épinglée. Le catalogue de composition et les contenus longs de sac ont leur propre défilement. Les pré-combats, le draft et les détails peuvent défiler dans leur panneau : aucun bloc important ne repose sur une alternance de scroll de page. Le sac ouvert est une superposition volontaire et dispose d’un bouton Fermer ; fermé, il ne recouvre pas le terrain.

## Décisions et limites

- « Boss » est un rôle éditorial de rencontre, pas un nouvel état canonique. Pour une nouvelle run9.2, un chef reconnu est inclus lorsqu’une solution exacte et distincte le permet. Si le budget impose une autre composition, son unité la plus puissante porte ce rôle. Aucun multiplicateur de statistiques ni modification de la formule. Les groupes restent possibles : le boss peut avoir des accompagnants.
- Les noms, formes, portraits et techniques proviennent des données existantes. Certaines illustrations héritées sont des placeholders V8 ; aucune nouvelle illustration de personnage n’est revendiquée.
- Les rangs sont toujours distincts quand mathématiquement possible. Vague18 boss DB = cinq600 ; vague19 boss = six ennemis. 120000 cas boss9.2 testés, chacun régénéré pour prouver le déterminisme, en plus des360000 cas généraux.
- Les sauvegardes9.0/9.1 gardent leurs règles et leurs tirages ; les informations de chef manquantes sont dérivées pour l’affichage sans réécrire leurs rencontres. Seules les nouvelles runs portent9.2.
- Une technique intitulée Kamehameha mais définie comme bonus dans le catalogue historique affiche une aura de bonus. On respecte l’effet exécuté, sans inventer une attaque ni changer ses dégâts.
- La capture `v92-real-playback-kamehameha-1360.png` arrête la lecture au vrai événement Kamehameha originel et fige sa couche d’animation pour la lisibilité. Les PV et le journal sont ceux de cette lecture réelle. Les autres scènes avancées de QA emploient les checkpoints annoncés dans qa/fixtures ; elles ne prouvent pas un parcours humain jusqu’à la vague60.
- Windows natif, illustrations HXH et équilibre des longues runs restent non certifiés. Consulter STATUS_V9.md.

Snapshot avant modification : BACKUP_V9_1_sources.tar.gz. Baseline : qa/pre-v92-tests.log. Sauvegarde V8 complète : BACKUP_V8_pre-v9.zip. Les689 fichiers et la fonction card() protégés sont inchangés.
''')
write('README_JOUER.md','''# KI ARENA V9.2 — jeu local

Extrais le ZIP, puis double-clique **LANCER_SUR_PC_WINDOWS.bat**, ou ouvre **JOUER_KI_ARENA_V9.html** dans Chrome ou Edge. Le HTML peut être copié seul : assets, deux polices et code sont embarqués. Aucun compte, installation npm ou réseau nécessaire.

## Choisir son jeu

- **Survie Infinity** : Dragon Ball ou HXH, draft5personnages+3armes, main à jouer, terrain3→5, rounds puis récompenses. HXH est jouable sous forme de fiches textuelles, sans portraits fournis.
- **Combat auto · équipe libre** : choisis cinq combattants parmi600. Le CPU affiche son équipe seedée ; « Choisir aussi » permet de composer les cinq adversaires. Lance le duel avec le moteur historique V8. Retire une carte de sa place pour la remplacer. Le seed reproduit l’adversaire et le résultat à équipes identiques.
- **Rogue One V8** et les six autres classiques restent dans le carrousel historique. Leurs règles, cartes et sauvegardes sont préservées.

## Commandes utiles

**Carte**, en haut, ouvre le véritable parcours depuis toute phase d’aventure. **M** l’ouvre aussi ; **Échap** la ferme. Elle ne tire aucune rencontre supplémentaire. Les routes disponibles restent celles du moteur.

En Survie, **Déployer tout** pose les personnages actuellement en main jusqu’à la limite de places. Les réserves ne sont pas déployées automatiquement. **Équiper / utiliser** ouvre le choix de cible et la comparaison ; un échange doit être confirmé. Une seule pose à coût1 par round, pas de mana. Clique **Lancer le round** puis rejoue ta main après la pioche. ×2 et Raccourcir accélèrent la présentation.

Les boss arrivent aux vagues5,10,15… Leur nom, technique et PV sont affichés. Une halte facultative de préparation est possible avant le boss pour les runs9.1/9.2. Aucun boss n’est contourné par cette halte.

Le terrain, la main, la pioche et les commandes partagent l’écran. Fais glisser la main pour voir ses autres cartes ; la pioche reste à gauche. **Sac**, ou la poignée du bas, ouvre équipe, inventaire, reliques, objets et effets. **Fermer le sac** revient immédiatement au terrain.

En combat auto : **Pause**, bouton de vitesse1/2/4/8, **Résultat**, puis **Retour**. Les rayons, lames, soins, boucliers et auras suivent les capacités réellement déclenchées. La préférence système de mouvement réduit est respectée.

## Sauvegardes

Les runs DB/HXH et la composition5v5 sont séparées du profil V8. Une ancienne run conserve ses règles ; les nouvelles portent9.2. Les données restent dans ce navigateur et à cette adresse/ce chemin de fichier. Utilise **↓ Export** et **↑ Importer une sauvegarde** pour déplacer une run Survie entre le HTML et le serveur, ou avant de changer de navigateur/dossier. Le profil V8 garde son export dans Profil.

## Captures réelles

![Boss et plateau desktop](captures/v92-boss-combat-1360.png)

![Combat mobile sans scroll de page](captures/v92-hand-390.png)

![Composition cinq contre cinq](captures/v92-auto5-team-390.png)

Toutes ces images viennent de Chromium exécutant le code. Les checkpoints avancés sont identifiés dans RAPPORT_QA.md. Les portraits conceptuels/placeholders hérités restent ceux de la V8 ; HXH n’a pas reçu d’illustrations inventées.

## Commandes facultatives de développement

Node18+ : `npm start` ouvre http://127.0.0.1:4173 sous Windows. `LANCER_SERVEUR_WINDOWS.bat` fait de même. Aucune dépendance npm à installer.

- `npm test` : historique, Survie et V9.2, puis hashes protégés.
- `npm run test:python` : Python3, douze tests de référence.
- `npm run build:offline` : Python3, reconstruit le HTML autonome.
- `npm run simulate:survival` :6000 runs instrumentées.
- `npm run verify:package` : contrôle de livraison.
- `npm run check:release` : renvoie volontairement un échec tant que les FAIL/BLOCKED de STATUS_V9.md persistent.

La QA navigateur optionnelle nécessite Playwright/Chromium dans l’environnement de test, jamais pour jouer. Voir RAPPORT_QA.md.

## Retour à une référence

Pour V8, extrais BACKUP_V8_pre-v9.zip dans un autre dossier. Vérifie avec qa/pre-v9-sha256.json. Pour revenir au code9.1, extrais BACKUP_V9_1_sources.tar.gz sur une copie de ce projet puis reconstruis le HTML ; les assets n’ont pas changé. Aucun profil n’est effacé par cette opération. L’audit détaillé et les limites restantes figurent dans AUDIT_V9_2.md et STATUS_V9.md.
''')
write('STATUS_V9.md','''# STATUS V9.2 — 22 octobre 2026

Jeu local livré et vérifié sous Chromium/Linux. « Final intégral » n’est pas revendiqué ; les limites connues restent ci-dessous.

| Sous-système | État | Preuve | Résultat / limite |
|---|---|---|---|
| Baselines / snapshots | PASS | qa/baseline-v8.log, qa/baseline-python.log, qa/pre-v92-tests.log, BACKUP_V8_pre-v9.zip, BACKUP_V9_1_sources.tar.gz | Références conservées |
| Cartes et moteur historique | PASS | qa/tests-final.log, qa/protected-verification.json |689 fichiers protégés et card() identiques |
| Tests JS | PASS | npm test, qa/tests-final.log |63 vérifications V8 +21 blocs Survie +7 blocs V9.2 |
| Référence Python | PASS | qa/python-final.log |12/12 |
| Modes et sauvegardes séparés | PASS | qa/browser-report.json, qa/v92-browser-report.json, tests |7 classiques, Survie DB/HXH et nouveau5v5 |
| Draft, main, deck, terrain, action0/1 | PASS | tests/test-survival.mjs, captures/v92-hand-390.png |5+3, main3 dont personnage, pioche1, bonus2, slots3→5 |
|98 sources d’items et hooks | PASS | LISTE_ITEMS_IMPLEMENTES.csv, qa/item-execution-proof.json |77 sources actives +1 outil éditorial ;21 exclusions, pas98 armes |
| KO, soin25%, XP, évolutions | PASS | tests/test-survival.mjs |XP joués/survivants, seuils2/5/9/14, BLOQUE respecté |
| Parité des revive personnels DB | FAIL | DECISIONS_V9.md |Deux capacités personnelles inactives en Survie ; V8 inchangée |
| Budget exact et infini | PASS | qa/tests-final.log |360000 cas généraux +120000 cas boss9.2 régénérés ; aucun reset ni boost caché |
| Boss identifiés | PASS | tests/test-v92.mjs, captures/v92-boss-*.png |Chef du catalogue, technique, badge, PV et progression ; rôle éditorial annoncé |
| Récompenses / économie / halte | PASS | tests, qa/simulations-6000.json |Un choix/3, achats uniques, anti-farm, boss non contourné |
| Reprise9.0/9.1 et profil V8 | PASS | tests, qa/browser-report.json |RNG/offres/règles conservées, affichage enrichi sans migration forcée |
| Combat auto5v5 choisi | PASS | tests/test-v92.mjs, qa/v92-browser-report.json |600 choix, CPU ou adversaire manuel, résultat identique à runBattle V8 |
| Combat sans scroll de page | PASS | qa/audit-v92-before.json, qa/v92-browser-report.json |390×844,768×844,1360×844,390×700,1360×768 ; terrain/main/commandes visibles |
| Carte1clic et sac refermable | PASS | qa/v92-browser-report.json, qa/polish-report.json |M/Échap, focus, graphe V8 réel ; aucune mutation de sauvegarde par consultation |
| Animations par effet réel | PASS | tests/test-v92.mjs, qa/offline-v92-report.json |Rayons/lames/soins/protection/aura ; vrai Kamehameha observé pendant la lecture |
|×2 / skip / mouvement réduit | PASS | qa/motion-offline-report.json, qa/offline-v92-report.json |Présentation indépendante du résultat, aucun double gain |
| HTML seul offline | PASS | qa/offline-v92-report.json, qa/browser-report.json |3largeurs,600 cartes5v5, boss, carte, fontes, zéro requête externe |
| Windows natif | BLOCKED | RAPPORT_QA.md |Lanceurs livrés ; pas de PC Windows pour essai matériel |
| Portraits HXH | BLOCKED | Sources, captures/hxh-*.png |Fiches textuelles jouables annoncées ; illustrations absentes |
| Canon / droits indépendamment certifiés | BLOCKED | Manifest et CSV items |Statuts sources et adaptations éditoriales conservés, revue exhaustive non effectuée |
| Équilibre des longues runs | FAIL | qa/simulations-6000.json |6000 runs, mur fréquent4–6 ; pas de qualification d’équilibre final |

`npm run verify:package` valide le paquet. `npm run check:release` retourne non-zéro tant que les limites essentielles persistent. Aucun contrôle FAIL n’est transformé en PASS pour obtenir un label final.
''')
rows='\n'.join(f"| {r['summary']['universe']} | {r['summary']['strategy']} | {r['summary']['meanVictories']:.3f} | {r['summary']['meanPurchases']:.3f} | {r['summary']['meanEquipmentUses']:.2f} |" for r in sims)
write('RAPPORT_QA.md',f'''# Rapport QA V9.2 — 22 octobre 2026

Environnement : Linux, Node24, Python3, Chromium153. Aucun essai Windows natif n’est revendiqué.

## Contrôles exécutés

| Commande / campagne | Résultat | Sortie |
|---|---|---|
| npm test | PASS :63 vérifications historiques +21 blocs Survie +7 blocs V9.2 ;689 fichiers/card() protégés | qa/tests-final.log |
| npm run test:python | PASS :12tests | qa/python-final.log |
| npm run simulate:survival | PASS exécution :6000runs, absence de blocage | qa/v92-simulations.log, qa/simulations-6000.json |
| npm run build:offline | PASS :680assets,27modules, fontes locales | qa/v92-build.log |
| npm run qa:browser | PASS :DB/HXH, import/export, tous les classiques, fixtures avancées et HTML isolé | qa/browser-report.json |
| npm run qa:polish | PASS :mystère, niveaux, routes, onglets et graphe V8 | qa/polish-report.json |
| npm run qa:gameplay | PASS :5formats, map1clic, boss,5v5 manuel et victoire sans fixture | qa/v92-browser-report.json |
| npm run qa:offline | PASS :HTML seul, réseau coupé,3largeurs, nouvelle sélection600cartes et boss ; technique réellement observée en lecture | qa/offline-v92-report.json |
| node scripts/qa-motion-and-offline.mjs | PASS :×2, skip, équipement, victoire et fontes offline | qa/motion-offline-report.json |
| npm run verify:package | PASS attendu seulement après contrôles des fichiers et CRC | qa/package-verification.log |

La recette V9.1 ne vérifiait que le débordement horizontal. Elle pouvait passer avec une main sous la fenêtre. AUDIT_V9_2.md conserve les mesures avant/après et explique cette correction de critère.

## Tests nouveaux

- 5v5 :cinq IDs connus et uniques, refus des équipes incomplètes/doublons, CPU seedé et adversaire manuel. Résultat structurellement égal au runBattle V8 direct. Clé de composition distincte ; corruption ignorée sans modifier les autres modes.
- Solveur de boss :existence comparée à toutes les combinaisons pour N≤12. Puis1000seeds×60vagues×2univers=120000rencontres boss9.2, chacune régénérée à l’identique. Chef réel, budget exact, unicité lorsque possible, statistiques du catalogue inchangées et plafonds18/19. S’ajoutent les360000cas généraux existants.
- Déployer tout :une seule révision atomique, trois places respectées, action équipement conservée, checkpoint valide, clic périmé refusé.
- Sauvegarde9.1 :règles et tirages préservés, aucune conversion forcée. Affichage du chef dérivé pour les anciennes rencontres.
- Animations :nom et type de l’effet issus de la carte réelle. Rayon Kamehameha, Galick Gun défini comme buff donc aura, lames ; soin, protection, état, esquive et KO. Les animations ne calculent ni dégâts ni RNG.

## Navigateur et captures

Fenêtres390×844,768×844,1360×844,390×700 et1360×768. Les rectangles du terrain, de la main, de la pioche, du HUD et du bouton de round sont contrôlés dans la fenêtre. Aucun scroll de page pendant le combat. Les panneaux de catalogue, main, armées nombreuses et sac ont un défilement interne annoncé. Le sac fermé ne couvre pas le terrain ; ouvert, il est une superposition refermable.

Carte ouverte puis fermée depuis le combat, l’exploration et le pré-combat ; comparaison exacte de la sauvegarde avant/après. Touches M et Échap, focus restauré, graphe V8 réel. Équipement ciblé dans une boîte native modale, comparaison et application, aucun saut de page.

Pour chaque format :composition manuelle de cinq cartes, lancement contre CPU, résultat/retour, puis composition manuelle des cinq adversaires. Un parcours séparé commence dans un stockage vide :huit choix de draft, déploiement groupé réel, rounds, victoire.

`v92-real-playback-kamehameha-1360.png` provient d’une lecture5v5 réelle, seed1, avec Tortue Géniale du catalogue. La QA observe le vrai événement, met la lecture en pause et fige sa couche d’animation à150ms. Le journal et les PV correspondent à ce moment. Il s’agit d’une capture du jeu, pas d’une image générée ni d’un résultat inventé.

Les boss vague5, marchand, équipement de recette, recrue niveau2 et vague60 sont des checkpoints avancés explicitement synthétiques conservés dans qa/fixtures. Ils prouvent leur rendu/interactions ; ils ne prétendent pas constituer un parcours humain de60vagues. DB et HXH sont aussi parcourus du départ à la vague2 sans fixture dans la campagne complète.

Le HTML final est copié seul dans un répertoire temporaire. Chromium est placé offline ; aucune requête HTTP requise. Les nouvelles fonctions5v5, boss, carte et fontes sont contrôlées à390/768/1360. La recette couvre Chromium/Linux, pas tous les navigateurs Windows.

## Items et fidélité

98sources :77actives,21exclues ;1outil éditorial additionnel, soit78objets utilisables.47armes de draft. Le CSV garde56OK,22REVIEW,21EXCLU. Chaque item actif a une preuve d’exécution par ID dans qa/item-execution-proof.json. Les manifestations Nen personnelles ne sont jamais transférées.

Les portraits DB hérités comprennent des placeholders V8 préservés. Le mode HXH utilise des fiches sans portrait, annoncé à l’entrée. Les adaptations de compétences et les rôles de boss sont éditoriaux ; aucune certification canonique globale n’est revendiquée. Deux revive personnels DB restent inactifs en Survie pour respecter sa mort permanente ; leur version V8 ne change pas.

## Calibration9.2

1000seeds par profil/univers. Les bots sont des heuristiques de test, pas des joueurs humains. Le budget source et les statistiques n’ont pas été falsifiés pour améliorer les scores.

| Univers | Profil | Victoires/run | Achats/run | Équipements posés/run |
|---|---|---:|---:|---:|
{rows}

Le mur4–6 reste fréquent. Les nouvelles compositions identifiées de boss modifient la distribution des effets et donc les résultats, tout en conservant le budget exact. Les longues runs restent FAIL dans le statut. Aucune validation de confort de jeu humain sur plusieurs heures n’est annoncée.

## Reproduire

Node18+ et Python3 pour le projet. QA navigateur facultative :Playwright et Chromium dans l’environnement de test ; fournir PLAYWRIGHT_NODE_MODULES et CHROMIUM_EXECUTABLE si besoin. Les outils QA ne sont pas des dépendances de jeu.

```text
npm test
npm run test:python
npm run simulate:survival
npm run build:offline
npm run qa:browser
npm run qa:polish
npm run qa:gameplay
npm run qa:offline
npm run verify:package
```

Les scripts terminent sur échec avec un code non nul. Le contrôle `npm run check:release` est volontairement non vert tant que STATUS_V9.md contient FAIL/BLOCKED.
''')
append('DESIGN_SYSTEM_V9.md','''

## V9.2 — interface de jeu

`src/viewport.css` compose un écran limité à100dvh :barre générale avec Carte/Sac, HUD court, scène extensible, commandes et main, puis poignée48px(44mobile). La page ne défile pas pendant un combat. Les contenus secondaires défilent dans leur panneau.

La pioche reste épinglée à gauche de la main. « Déployer tout » réduit les clics sans sortir de la règle de places. Une cible d’équipement se choisit dans un dialogue natif, avec confirmation d’échange. Sac et carte deviennent des superpositions volontaires, refermables et utilisables au clavier. Le graphe complet V8 est accessible en un clic, sans être supprimé.

Les boss portent une couleur prune/cuivre distincte, un vrai nom de carte, une technique annoncée et des PV persistants. Les portraits sont ceux déjà présents ; pas de nouveau personnage inventé.

Le5v5 sépare les dix emplacements du catalogue avec recherche et série. Le catalogue600cartes défile à l’intérieur. Le bouton Lancer reste visible. Images de personnages et pictogrammes d’objets ne sont pas confondus.

Les cartes collectionnables sont mises à l’échelle intégralement dans les emplacements compacts ; leur template, leurs finitions et leurs données restent identiques. Les nouvelles animations sont des couches SVG/CSS contextuelles, pas de nouveaux décors SVG génériques :rayon, lame, impact, zone, soin, bouclier, aura, esquive et KO selon le véritable événement. La préférence de mouvement réduit supprime ces couches. Les temps n’affectent pas le résultat.
''')
append('DECISIONS_V9.md','''

## Révision9.2 — audit de jeu

- L’ancienne décision « tiroir dans le flux et round sticky pendant le défilement » est remplacée par un viewport de jeu sans scroll de page. Le sac fermé occupe sa ligne ; ouvert, c’est une superposition explicite avec Fermer. La carte se consulte en1clic ou M.
- Nouveau mode `auto5.js` :composition libre de cinq cartes, adversaire CPU seedé ou manuel ; appel direct à runBattle V8. Aucun deck, mana ni règle Survie. Clé `kiarena:auto5:v1`, les anciennes clés restent intactes.
- Nouvelles runs9.2 :un chef reconnu du catalogue est inclus dans le budget boss quand le solveur exact le permet. Sans solution, le plus puissant de la composition exacte porte le rôle. Le rôle de chef est éditorial ; ni nouvelles stats, ni nouvelle forme. Anciennes runs9.0/9.1 gardent leurs tirages/règles. Les métadonnées d’affichage manquantes sont calculées sans écriture de sauvegarde.
- La bibliothèque d’animation lit les événements et effets réels, sans modifier l’état ni le moteur historique. Les noms d’attaque ne prennent pas le pas sur un effet exécuté de soin/buff/protection. Les métadonnées ajoutées au moteur Survie servent uniquement la présentation.
- Déployer tout est une commande atomique qui réutilise le déploiement gratuit existant jusqu’aux places disponibles ; aucune réserve non piochée n’est appelée automatiquement.
''')
append('CHANGELOG_V9.md','''

##9.2.0 —22octobre2026

- Audit mesuré du scroll avant/après, corrections du HUD et des emplacements.
- Combat en un écran, main compacte, pioche épinglée, Déployer tout ; équipement dans un dialogue de cible.
- Carte permanente1clic/M, fermeture Échap, graphe V8 et parcours Survie sans tirage supplémentaire.
- Boss avec chef, portrait disponible, technique, PV et progression ; budget exact et anciennes sauvegardes préservés.
- Nouveau Combat auto équipe libre :cinq cartes choisies sur600, CPU ou adversaire manuel, moteur V8 exact.
- Animations par technique/type réellement exécutés ; nouveau rayon/lame/soin/protection/aura et contrôle de mouvement réduit.
- Recettes390/768/1360 et petites hauteurs, HTML seul offline,28blocs nouveaux,6000simulations ; limites restantes visibles.
''')
print('Rapports9.2 écrits. Leurs PASS renvoient aux sorties de commande, pas à une certification Windows.')
