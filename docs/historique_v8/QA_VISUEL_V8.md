# QA V8 — Vérifications effectuées

| Cas | État | Preuve |
|---|---|---|
| Test automatisé de toutes les mécaniques héritées | PASS | `QA_TESTS_V8.log` (sortie de `npm test`) |
| Moteur de combat inchangé | PASS | Comparaison binaire avec V7 |
| CSV et catalogue des 600 cartes inchangés | PASS | Comparaison binaire avec V7 |
| CSS des cartes et logique Roguelike inchangés | PASS | Comparaison binaire avec V7 |
| Run démarrée depuis 5 cartes sélectionnées | PASS | Parcours navigateur ciblé |
| 3 cartes de destinations issues de la vraie carte | PASS | `v8_exploration_1360.png` et `v8_exploration_390.png` |
| Boutons de routes inaccessibles désactivés | Structure de code vérifiée | `availableNodes` et disabled, sans injection d'autres routes |
| Tiroir du bas s'ouvre | PASS | `v8_inventory_1360.png` |
| Une rencontre sélectionnée ouvre l'écran dédié | PASS | `v8_encounter_1360.png` |
| 390 px sans débordement horizontal | PASS | Mesure viewport / document |
| 768 px sans débordement horizontal | PASS | Mesure viewport / document |
| 1360 px sans erreur JS sur chemin testé | PASS | Console navigateur |
| Relancer une run complète sur une longue durée | Non vérifié | Reste à tester |
| Reprise après fermeture en plein combat | Non vérifié | Reste à tester |
| Performance sur appareil mobile physique | Non vérifié | Reste à tester |
| Nouvelle direction artistique, décors haute résolution originaux | Partiellement atteint | Assets existants réutilisés, certaines illustrations restent à améliorer |
