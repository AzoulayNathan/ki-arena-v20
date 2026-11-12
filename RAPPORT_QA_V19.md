# Rapport QA V19

Le jeu et l’atelier sont exécutés dans Chromium, avec tests en serveur local et file:// sans serveur. Les images du dossier qa/v19/ sont de vraies captures de l’application. Les événements et actes particuliers utilisent des sauvegardes de présentation identifiées dans qa/v19/fixtures/README.md. Ils ne prétendent pas démontrer un taux de victoire naturel.

## Contrôles automatisés

`npm test` exécute 11 nouveaux tests Node, la protection V18, les 92 tests modernes historiques, la validation des objets et les suites V8. Les sorties sont conservées dans qa/v19/final-tests.log et package-tests.log. Le pré-audit est dans baseline.log. Aucun ancien test n’est modifié pour contourner une protection.

Les nouveaux tests couvrent les données brutes et harmonisées, le classement par ATQ+PV+VIT, les 15 sous-ensembles non vides de mangas, les bornes du draft, l’intégrité des offres avant le clic, les identités, les armes transférables, les altérations d’import, les sauvegardes séparées, les achats, les récompenses répétées et toutes les branches des 17 événements. Les 1 000 seeds du draft n’ont offert aucune légendaire de départ. Les 11 offres épuisées/incompatibles de ce corpus sont désactivées, pas réinventées.

Les bornes sont 25–35 / 15–45 / 0–60 **sur N/600**. Pour N=600, elles donnent directement ces faibles rangs ; N/60 aurait déplacé le draft au milieu du catalogue et violé la correction demandée. La troisième carte reste cachée. Le tirage de type 30/70 utilise un repli déterministe si un personnage ou une arme compatible ne peut plus être proposé. Les armes initiales sont limitées aux deux premiers paliers de rareté.

Le budget adverse reste arrondi(N/4 × (vague + bonus)), bonus normal 0, élite 1, boss 2. Les 5 400 rencontres testées couvrent 60 vagues, les deux modes de statistiques et tous les pools. Sommes exactes, bornes 1..N, rangs distincts quand possibles et croissance sans reset sont contrôlés. DB : boss vague 18 = 3 000, cinq rangs 600 ; vague 19 = 3 150, six adversaires.

100 000 tirages cosmétiques donnent 45 136 noires, 44 907 blanches et 9 957 dorées dans le corpus enregistré. Ce sont des fréquences observées autour des probabilités exactes 45/45/10, indépendantes de la rareté. Elles ne modifient ni une technique ni une statistique de combat.

## Vérification visuelle et interactions

390, 768 et 1360 px : accueil, choix de mangas et statistiques, draft, carte locale/globale, préparation, combat, victoire, sac, porteur d’équipement, collection, fiche, audio, accès créateur, Arcade et salon entre amis. Les tests vérifient le centrage des cartes et l’absence de scroll horizontal du document ; les carrousels restent intentionnellement défilables.

Le même moteur de dessin sert au jeu et à l’atelier. Tous les 3 022 noms sont rendus avec les polices locales sans chevaucher les statistiques. Les 15 gabarits d’étude sont exportés à 900×1350. L’étude de rareté n’ajoute aucune technique fictive à Goku : il demeure réellement Commun et possède une technique. Les cartes réellement rares possèdent le nombre de techniques d’origine.

Un portrait recadré est exporté depuis l’atelier, importé par son ID dans le jeu, refusé pour le mauvais manga, conservé en IndexedDB puis revu après rechargement. L’entrée tactile native est utilisée pour vérifier la rotation, sa remise au repos et prefers-reduced-motion. Les récompenses de recrutement montrent l’ID de la vraie recrue ; les objets signalent les images adaptées, images de catégorie et pictogrammes.

Les cinq mini-jeux avec statistiques, les trois jeux visuels, le Draft Challenge et le tournoi local atteignent leurs résultats par l’UI. L’accès créateur N et F8 ne consomment pas le RNG. Les saves normalisées/brutes sont distinctes ; les clés V8/V18 restent intactes.

## Limites qui restent ouvertes

**Équilibrage : FAIL.** Les deux profils explicites prudent/offensif, répartis entre modes harmonisé/brut et les différents pools, donnent 0/1 000 actes franchis. Aucun run ne plante et certains atteignent le boss, mais ce résultat ne constitue pas une difficulté satisfaisante. La première rencontre DB seule est gagnée 999/1 000 fois par le profil de plus haut rang proposé ; cela met en évidence une progression trop sévère plutôt qu’un simple bug de premier adversaire. Aucun coefficient caché n’a été ajouté pour embellir ce résultat. Une calibration du loot/progression ou une nouvelle décision de règles est nécessaire ; la formule protégée est conservée.

**Portraits : BLOCKED.** La nouvelle étude de Goku est utilisable. Les 600 SVG DB fournis sont génériques et parfois peu fidèles ; ils sont conservés et signalés. Les autres mangas n’ont pas de bibliothèque de portraits canoniques complète dans la source fournie. Les remplacer par des images inventées sous un autre nom serait trompeur. Les droits des franchises ne sont pas concédés par ce pack.

**Windows natif et référence Python initiale : BLOCKED.** Le BAT et le HTML sont présents, le parcours offline est exécuté sous Chromium/Linux. Il n’y a ni VM Windows ni pack initial des douze tests Python dans cette source V18. L’acceptation globale demeure donc FAIL, même si les contrôles techniques du build passent.

## Reproduction

```sh
npm test
node scripts/simulate-v19.mjs
node scripts/qa-v19.mjs
node scripts/qa-v19-cards.mjs
node scripts/qa-v19-media.mjs
node scripts/qa-v19-modes.mjs
node scripts/qa-v19-extras.mjs
node scripts/qa-party-v19.mjs
node scripts/qa-v19-events.mjs
npm run check:release
```

Pour la QA navigateur, installer Playwright et indiquer KI_CHROMIUM si nécessaire. Les exécutables de test et caches du navigateur ne sont pas livrés. `check:release` sort en 2 pour les limites connues ; `python scripts/verify_v19.py --allow-documented-limitations` vérifie le build sans certifier l’acceptation globale. Le ZIP est créé par scripts/package_v19.py, contrôlé par CRC, extrait, comparé octet par octet, reconstruit puis retesté.
