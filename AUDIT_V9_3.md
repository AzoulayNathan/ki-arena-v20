# Complément de livraison9.3.1

La vérification et les corrections les plus récentes figurent dans [VERIFICATION_LIVRAISON.md](VERIFICATION_LIVRAISON.md). Sauvegardes illisibles récupérables, imports plus stricts, seeds normalisés et contrôle intégral du paquet.

---

# Audit et corrections V9.3 — 22 octobre 2026

Cette version prolonge la V9.2 : boss nommés, carte accessible en un clic, combat sur un écran et mode auto avec cinq combattants choisis restent en place. La livraison est jouable ; elle ne prétend pas satisfaire une certification finale tant que les limites de STATUS_V9.md persistent.

## Changements réellement intégrés

- Fiche de personnage accessible depuis les trois offres visibles du draft, la main, le terrain et l’équipe. PV, bouclier, statistiques, techniques, déclencheurs, usages et équipement proviennent de l’état réel. Consultation sans action, RNG ni sauvegarde ; la carte mystère reste cachée.
- Butin des nouvelles runs filtré selon l’inventaire : moins d’armes ordinaires redondantes, objets de contrôle et armures utiles, aucune pioche proposée sans cartes à piocher. La recrue prioritaire est la meilleure admissible parmi les ennemis réellement vus.
- Marchand : trois objets distincts seedés, achat visible même à390×700 ; service de soin immédiat de35% des PV max aux vivants,12+2×vague zénis, une fois par visite. Aucun soin des morts.
- Recyclage explicite avec confirmation dans le sac, entre combats :4–12 zénis fixes selon rareté, toujours moins que le prix marchand minimal. Pas de tirage supplémentaire ni de relance du stock. Deux équipements durables minimum conservés, trois avec la relique de main supplémentaire, pour garantir une vraie main initiale sans cartes fabriquées.
- Les animations de transformation, régénération, vol de vie, protection et esquive portent maintenant le véritable nom de la capacité ou de l’objet. Les dégâts périodiques affichent la perte de PV effective.
- Correction des ripostes DB dont le déclencheur source est AFTER_HIT_OR_DODGE : elles peuvent réellement répondre à une esquive, une seule fois par combat, sans chaîne de réactions. Cette correction de règle s’applique uniquement aux nouvelles runs9.3. Le moteur V8 est intact.
- Deux actions différentes rapides, par exemple achat puis soin, sont acceptées. La protection contre le double clic vise le même geste seulement.

## Compatibilité et frontières

Les nouvelles runs portent rulesVersion9.3.0. Une sauvegarde9.2 conserve ses règles de récompenses, de combat et d’économie ; rejouer son seed conserve également sa version. Les clés V8, DB, HXH et5v5 restent séparées. Soixante parties de référence, calculées avec le moteur9.2 extrait avant modification, donnent exactement la même projection de jeu avec le code actuel. Les métadonnées de présentation sont exclues de cette comparaison, pas les PV, tirages, morts, monnaies ou offres.

Le snapshot BACKUP_V9_2_sources.tar.gz contient les sources avant modification ; SHA25609533ae182163d8dd096beea6997bb491cffb9643cf484e9483b43f304f4cace. Les assets n’ont pas changé. Les689 fichiers historiques et la fonction card() sont vérifiés à l’identique ; aucune nouvelle illustration de personnage HXH n’a été inventée.

## Vérifications

- npm test :63 vérifications V8,21 blocs Survie,7 blocs9.2,16 blocs9.3 et hashes protégés. Preuve qa/v93/tests-final.log.
- Python :12 tests de référence. Preuve qa/v93/python-final.log.
- Budget :360000 cas généraux,120000 cas boss et12000 comparaisons9.2/9.3 supplémentaires. Formule, rangs, équipements ennemis et statistiques inchangés.
- Navigateur et HTML isolé :390×844,768×844,1360×844,390×700,1360×768. Fiches clavier/Échap, achat→soin rapide, reprise sans double gain, annulation/confirmation du recyclage, maintien des anciennes règles, absence de scroll de page. Rapports qa/v93/browser-report.json et qa/v93/offline-report.json.
- HTML seul copié dans un dossier temporaire, Chromium offline, seules les requêtes du HTML initial et data/blob autorisées :zéro dépendance de fichier voisine ou réseau.
- Recettes globales :DB/HXH du draft à la vague2, anciens modes, import/export, carte, boss et5v5 ; rapports qa/browser-report.json, qa/v92-browser-report.json, qa/offline-v92-report.json, qa/motion-offline-report.json et qa/polish-report.json.

Les captures captures/v93-*.png sont de véritables écrans Chromium. Les états marchand/blessures et la transformation sont des checkpoints synthétiques de recette, annoncés dans les rapports. La transformation Surpassement est ensuite déclenchée par un vrai round du moteur ; sa couche visuelle est figée à150ms pour la capture, sans changer la sauvegarde. Ces images ne prétendent pas documenter une partie humaine de60 vagues.

## Mesure d’équilibre, sans promesse excessive

6000 runs sur trois politiques historiques, puis2000 runs tactiques, comparées aux mêmes seeds/politiques9.2. Les bots ne consultent ni la future pile ni le futur RNG. Le bot tactique utilise le nouveau service et le recyclage. Plafond40 ; aucune partie censurée dans les campagnes historiques.

| Politique tactique,1000 seeds par univers |9.2|9.3|
|---|---:|---:|
| DB, victoires moyennes |4,141|4,259|
| DB, part ayant gagné5 combats |21,1%|22,3%|
| HXH, victoires moyennes |3,735|4,122|
| HXH, part ayant gagné5 combats |11,2%|15,8%|
| HXH, part ayant gagné10 combats |0,7%|2,8%|

Sources qa/v93/tactical-v92-1000.json et tactical-v93-1000.json ; détail des6000 autres runs dans simulations-v93.json. Ce sont des résultats de bots, pas des probabilités pour un joueur humain. L’amélioration est modeste et le mur fréquent autour des vagues4–6 demeure. L’équilibre des longues runs reste FAIL ; aucun affaiblissement caché du budget ennemi n’a été introduit.

## Limites maintenues

Pas d’essai sur PC Windows natif disponible, même si les lanceurs et le HTML autonome sont livrés. HXH est jouable en fiches textuelles sans portraits. Deux capacités personnelles de résurrection DB restent inactives en Survie, conformément au choix antérieur de mort permanente ; leur comportement V8 est intact. Les statuts canoniques des CSV et les droits des assets hérités ne constituent pas une certification indépendante. Voir STATUS_V9.md, MANIFEST_ASSETS_ET_DROITS.csv et LISTE_ITEMS_IMPLEMENTES.csv.
