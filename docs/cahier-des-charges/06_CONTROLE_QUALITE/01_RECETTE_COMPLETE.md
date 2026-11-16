# Recette complète exigée à l'IA — V9 locale

**Attention : la présence d'un fichier ou d'un test unitaire ne suffit pas à dire que l'écran fonctionne.** Cette liste sert de contrat vérifiable avant de qualifier la future version de « finale ».

## P0 — Baseline et données

- [ ] `npm test` V8 réussit avant et après l'intégration.
- [ ] `python -m unittest discover -s tests -v` du pack V2 réussit (12 tests de référence).
- [ ] Les hashes du CSV de 600 cartes, des gabarits et des règles V8 sont identiques si ces fichiers sont verrouillés.
- [ ] Catalogue HXH compte 532 IDs uniques, catalogue DB 600 IDs uniques, pas d'identifiants croisés dans un même run.
- [ ] Items : 43 DB + 55 HXH réellement lus ; exclusions de statut respectées, aucune duplication d'ID par univers.
- [ ] Un état V8 préexistant survit à l'ouverture puis l'export/import V9.

## P1 — Nouveau mode Survie Infinity

- [ ] Menu affiche 2 modes distincts : Rogue One V8 + Survie Infinity V2 ; les sept autres modes ne régressent pas.
- [ ] Choix DB/HXH et seed ; aucun mélange de catalogue ; même seed -> mêmes drafts/ennemis/rewards sous même version.
- [ ] Draft exactement 5 personnages + 3 armes : à chaque choix 3 offres visibles + 1 mystère, bons intervalles, anti-doublon, id/image cohérents.
- [ ] Option mystère créée AVANT clic ; impossible de la reroll par rafraîchissement.
- [ ] Deck 8 initial ; main de départ de 3 avec au moins un personnage ; pas de mana affiché ni requis.
- [ ] Terrain 3 slots initiaux, 4/5 seulement via artefacts éligibles ; pose gratuite de personnage ; une action équipement coût1/round.
- [ ] Chaque unité attaque au plus une fois/round et ordre VIT correct ; animation indépendante du résultat ; l'arme déclenche son effet testé.
- [ ] Pioche +1/round, bonus plafonné, deck vide et main pleine gérés sans boucle.
- [ ] Une arme et une armure maximum sur chaque unité ; échange explicite, retrait propre, pas de double effet.
- [ ] KO retire personnage de la run, du deck et de la main ; soin de victoire seulement vivants +25% max ; résurrection conditionnelle réelle.
- [ ] XP joués+survivants : 2/5/9/14 victoires cumulées -> niveaux 2/3/4/5 ; non-joués ne progressent pas.
- [ ] Transitions de `EVOLUTIONS_VALIDEES.csv` seulement, `BLOQUE` jamais déclenchée.
- [ ] Trois récompenses vraiment distinctes/valides, choix unique, achat et gain une fois, récompense relique/arme/soin/survivant.

## P2 — Difficulté et génération

- [ ] DB `B(v1,normal)=150`, `B(v1,elite)=300`, `B(v1,boss)=450`.
- [ ] DB `B(v18,boss)=3000`, 5 ennemis de rang 600 ; `B(v19,boss)=3150`, minimum 6 ennemis.
- [ ] DB `B(v20,normal)=3000`, `B(v21,normal)=3150` ; pas de reset ni multiplication cachée des stats.
- [ ] HXH `B(v,t)=round(133*(v+t))` ; les rangs restent bornés 1..532.
- [ ] Sur 60 vagues et plusieurs seeds : Σrang ennemi = B exactement, rangs distincts si mathématiquement possible.
- [ ] Armes ennemies évoluent séparément du budget selon paliers, explicitement affichées.
- [ ] Plus de 10 ennemis à haute vague restent visibles et jouables sans bug, pagination/regroupement purement visuel sans supprimer le budget.
- [ ] Simulation multi-profils d'au moins 1000 seeds par univers testable ; taux de survie, richesse, fréquence des soins et usage des reliques mesurés.

## P3 — Items et fidélité

- [ ] Pour chaque item autorisé : effet réel, image objet locale ou icône neutre assumée, porteur, rareté, coût, source, déclaration de fonctionnement dans `LISTE_ITEMS_IMPLEMENTES.csv`.
- [ ] `NEN_PERSONNEL` et `HORS_EQUIPEMENT` exclus du draft et du loot transférable.
- [ ] `stun/evade/counter/pierce` etc. : hooks réellement branchés, journal/effet et tests ; sinon items indisponibles et documentés.
- [ ] Un Senzu de soin ne ranime jamais ; une résurrection ne s'effectue que sur objet dédié, à coût et cible valides.
- [ ] Limites pioche et stacking effectives ; impossible de payer et de ne pas recevoir un objet ou de l'obtenir deux fois.
- [ ] Pas de personnages DB utilisés comme illustrations d'objets ; pas de noms canoniques inventés et présentés comme officiels.

## P4 — Visuel et ergonomie

- [ ] Explo : monde réel au centre, légère avancée -> vrais chemins -> grandes cartes 3 (ou nombre réel) ; focus éclaire route.
- [ ] Carte complète secondaire, visites/seed inchangés.
- [ ] Drawer bas montrant équipe/PV, onglets et scroll, sans masquer le bouton de validation ; la main de jeu du nouveau mode reste accessible séparément.
- [ ] Au moins six biomes visuellement distincts, assets vraiment intégrés en local, pas de fond flou générique dominant.
- [ ] Boutons bien différenciés primaire/secondaire/danger, focus visible, zones tactiles suffisantes.
- [ ] Captures **réelles** 390px, 768px, 1360px pour exploration, draft, combat, items, reward, shop, boss, bilan.
- [ ] Pas de débordement horizontal, texte écrêté, blocage de clic, animation longue imposée, flash agressif.
- [ ] `prefers-reduced-motion`, vitesse x2, skip, navigation clavier et tactile testés.

## P5 — PC local / offline / sauvegarde

- [ ] `npm start` fonctionne sur Windows sans cloud ni internet ; URL `127.0.0.1:4173`.
- [ ] HTML autonome reconstruit contient les nouvelles images, JS, CSS, données DB/HXH, et fonctionne **sans serveur et sans wifi** ; pas de fetch HTTPS caché.
- [ ] Sauvegarde/reprise après draft mystère, achat, pioche, KO, fin combat, choix de loot, transformation, fermeture de fenêtre en plein combat.
- [ ] Une reprise ne duplique ni zénis, ni item, ni XP, ni récompense.
- [ ] Import/export JSON versionné fonctionne ; vieille sauvegarde V8 reste compatible.
- [ ] `README_JOUER.md`, lanceur Windows, ZIP vérifié, screenshots, status précis, licences/limites, manifest hashes.

## Tableau de fin de mission à remplir

| Module | PASS / FAIL / BLOCKED | Preuve (test/capture/log) | Commentaire |
|---|---|---|---|
| Rogue One V8 protégé | À remplir | | |
| Survie Infinity DB | À remplir | | |
| Survie Infinity HXH | À remplir | | |
| Items et effets | À remplir | | |
| Draft et deck | À remplir | | |
| Difficulté budget exact | À remplir | | |
| Reprise et sauvegardes | À remplir | | |
| Explo / animations | À remplir | | |
| Mobile / clavier | À remplir | | |
| HTML offline | À remplir | | |

Ne pas inscrire PASS sans preuve observable. Toute limitation non résolue doit être listée dans `STATUS_V9.md`.
