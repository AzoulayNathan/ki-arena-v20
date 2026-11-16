# Ajouts exhaustifs (pack état)

## 1. Lianes retirées partout

- Suppression des points **milieu de bord** sur `seal`.  
- Remplacement de `veins` (zigzags) par `sparks` (étincelles ponctuelles).  
- `split` : pointes **aux coins uniquement** (plus de flancs mid).  
- Cache cartes : `FACE_DESIGN = v20-cards-tmpl33-novine-final`.  
- SW : `ki-arena-v20-20261113-novine-final`.

## 2. Jeu auto (décochable)

- Pref : `localStorage` `kiarena:v20:autoplay`.  
- Case **Jeu auto** / **Auto** : setup + HUD run + header.  
- Module `src/v20/autoplay.js` : équipement auto, chemin aléatoire, draft, rest/event/shop, priorité `recruit` en reward, lance combat.  
- **Ne décide pas** le portail prestige. Décocher = arrêt immédiat.

## 3. Prestige (acte 10)

- Après boss gagné qui fait entrer en **ACTE 10** : phase `prestige`.  
- **Continuer** → `endless=true`, map infinie, boss/vagues via `depthWave` / budget.  
- **Gagner en prestige** → fin de run + choix difficulté P0–P5 (`kiarena:v20:prestigeDiff`) pour runs suivantes (budget/rewards boostés).  
- Fichiers : `src/v20/prestige.js`, hooks `leaveNode` / `continueEndless` / `claimPrestige`.

## 4. Contenu de ce zip (&lt; 100 Mo)

Inclus :

- App : `index.html`, `sw.js`, `manifest.webmanifest`, `LEGACY_V9.html`, `src/`, `vendor/`
- Assets UI : `assets/v9`…`v20`, `equipment`, `sfx`, `theme`, `stylized`, `portraits-db` (si place)
- Templates : `modeles/` + code `src/v19/card-renderer.js` / `card-spec.js`
- Doc : `docs/ETAT_JEU_ACTUEL.md`, `docs/AJOUTS_EXHAUSTIFS.md`

Exclus (trop lourds) : `assets/cards-*`, `portraits-onepiece`, `BACKUP_*`, `art-source-v20`, `qa/`, `tests/`, `JOUER_*`, `ATELIER_*`, `.wrangler`, `node_modules`.

## 5. Fichiers clés touchés

- `src/v19/card-renderer.js`, `card-spec.js`, `polish.js`, `ui.js`, `pages.js`
- `src/v20/engine.js`, `storage.js`, `router.js`, `prestige.js`, `autoplay.js`, `visual.css`
- `sw.js`
