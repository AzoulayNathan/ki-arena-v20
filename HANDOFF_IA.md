# Reprise · Horizons V15

Lire README_JOUER.md, STATUS_V15.md et DESIGN_SYSTEM_V15.md. Cette édition ajoute une couche visuelle à la V14 : ne pas réinterpréter ses règles de draft, difficulté, équipement, run ou sauvegarde.

Modules ajoutés dans src/v15 : theme (palettes, scènes et écriture), home (carrousel et gestes), visual (décoration DOM, cadrage et accents d’effet), arcade (trois défis indépendants), deux CSS. Les seules sources existantes modifiées sont les UI arena/party et l’index local d’assets généré. Les visages, finitions et moteurs sont protégés par PRE_V15_HASHES.json et les tests existants.

Les huit rapports qa/v15 sont liés au SHA du runtime et du HTML. Ne jamais corriger leur empreinte à la main : reconstruire et relancer la recette après modification. Commandes : npm test, npm run build:offline, npm run check:release, npm run package:v15. scripts/qa_v15_all.py exécute les huit recettes ; Playwright/Chromium requis pour cette QA, pas pour jouer.

Les effets sont déclenchés par les événements du moteur. Le signal de pression ne modifie aucune statistique. L’expédition conserve ses clés et sa version de règles V14. Les défis visuels ont une clé distincte.

Les portraits et OST manquants restent des limites de source. Douze décors éditoriaux ont été ajoutés, aucune illustration de personnage. Les nouveaux fichiers sont locaux et optimisés. Le patch vérifie la base V14 ; BACKUP_V14 et restore_v14.py permettent une copie de restauration.
