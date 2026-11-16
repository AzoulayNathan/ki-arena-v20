> Archive de la version antérieure. État de cette livraison : **STATUS_V13.md** et **RAPPORT_QA_V13.md**. Les preuves historiques ci-dessous ne constituent pas une nouvelle validation V13.

# STATUS_V12 — Arena Impact / Panthéon / assets

Vérifications exécutées sur Windows (2026-11-04 13:25 UTC). Pas de pourcentage global.
Voir aussi `RAPPORT_AUDIT_FINAL_V12.md`.

| Sous-système | État | Preuve / notes |
|---|---|---|
| runId déterministe (= seed affiché) | PASS | `src/arena/engine.js` ; seed-replay deepEqual |
| Tests arena + V12 | PASS | **32/32** (`test-arena` 19 + draft/events/pantheon 13) |
| Sources protégées | PASS | `check-protected.mjs` — 689 fichiers inchangés |
| Draft bands midA/midB/mystery | PASS | 25–35 / 15–45 / 0–60 ; engine aligné |
| Carte 28 / ACT 10 | PASS | MAP_NODES=28 ; immersion `/ 15` retirée |
| Clic carte → inspect studio | PASS | `data-a=inspect` + viewer |
| UI Panthéon + bilan | PASS | Routes pantheon/bilan + metrics |
| gearCard → `equipmentArtUrl` | PASS | `ui.js` + `media.js` |
| Portraits DB/HXH/Naruto/OP | PASS/LIMIT | Placeholders honnêtes Shikuro / Pincemie |
| Équipements images | FAIL* | 95/95 webp ; 94 CANDIDAT_A_REVOIR |
| Simulation arena 100 | PASS | 0 errors |
| HTML offline JOUER V12 | PASS* | `JOUER_KI_ARENA_V12.html` |
| Serveur local | PASS | `LANCER_SERVEUR_WINDOWS.bat` / `local-server-v9.mjs` |
| OST originales | BLOCKED | Non fournies |

\* Candidats équipements à revoir manuellement. Pictogrammes = échec honnête.
