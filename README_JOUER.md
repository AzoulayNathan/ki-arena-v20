# KI ARENA V23 — jouer localement

Extrais entièrement le ZIP. Sur Windows, lance **LANCER_SUR_PC_WINDOWS.bat**. Avec Node18+, il ouvre le serveur local sur http://127.0.0.1:4173. Aucun npm install nécessaire. Sans Node, le lanceur essaie le HTML autonome.

**JOUER_KI_ARENA_V23.html** contient tous les scripts, styles et assets nécessaires. Il est construit pour l’ouverture autonome, mais l’ouverture directe et Windows natif n’ont pas pu être certifiés ici. Le chargement du HTML via HTTP local est vérifié séparément. Aucun compte ni réseau n’est nécessaire au jeu.

Après une victoire, récupère **trois gains**, dans cet ordre :

1. Un personnage : deux cartes visibles et un mystère pré-tiré.
2. Une arme : deux cartes visibles et un mystère, tirés selon l’équipe après recrutement.
3. Un soin de25 % des PV max à tous les vivants **ou** une relique aléatoire.

Chaque étape est sauvegardée. L’or et le soin de victoire historique de25 % restent automatiques ; le soin choisi en troisième gain est supplémentaire. Une équipe pleine nécessite un remplacement, avec conservation des équipements. La carte du monde revient après le troisième gain seulement. Le trésor garde son propre choix unique.

**Sac** : choisis l’arme puis son porteur, ou glisse sa poignée vers un personnage. **Carte** reste à un clic. **Jeu auto** équipe, déploie et poursuit les rencontres après le draft ; le draft initial et le choix de prestige restent manuels. Une ancienne fenêtre se synchronise au lieu d’écraser des gains plus récents.

Le marchand conserve deux recrues et quatre armes ; c’est le seul lieu de vente. Défaite du combat = fin de run même avec réserve. Le bilan et le Panthéon conservent l’équipe fatale et son replay, sans nouvelle récompense à la relecture.

Les parties V22 sont reprises sans effacer leur ancienne clé. Une récompense V22 déjà affichée garde son tirage et son choix unique ; les trois gains s’activent ensuite. V20/V21 et modes historiques conservent leurs règles. Pour découvrir immédiatement le parcours V23, choisis **Nouvelle aventure**.

Accès créateur local : réglages → accès créateur → code **N** (F8). Volume et mouvement réduit restent accessibles. Ce code est un raccourci local, pas une sécurité de compte.

```sh
npm start
npm test
npm run simulate:v23
npm run build:offline
npm run verify:package
npm run check:release
npm run package
```

`npm test` est la recette courante : V23/V22/V21/Survie/V8/items/Python12 et V20 actualisé. L’ancienne chaîne intégrale reste accessible avec `npm run test:legacy-all` ; ses attentes de versions anciennes ne sont pas toutes au vert. `check:release` reste volontairement rouge pour les limites réelles détaillées dans STATUS_V23.md.

Les scripts de collecte d’art sont des outils de développement facultatifs ; ils nécessitent Python/Pillow et le réseau. Ils ne sont jamais lancés par le jeu. Toute nouvelle image reste REVIEW jusqu’à contrôle de son identité et de sa provenance.

![Gain arme](qa/v23/captures/recompense-arme-1360.jpg)
![Choix final](qa/v23/captures/recompense-bonus-768.jpg)
