# PROMPT_V12_ULTIME — Arena Impact 12.0.0

## Contrat règles (éditorial gameplay, non-canon œuvres)

| Règle | Valeur |
|---|---|
| ARENA_VERSION | 12.0.0 |
| ACT_LENGTH | 10 (étapes 1–10, boss = étape 10 / row 9) |
| Nœuds / acte | 9×3 + 1 boss = 28 |
| Vague | `g=act*10+row` ; `v=floor(g/3)+1` |
| Draft | 2 visibles virtual ranks [25,35] + 1 mystère [0,60] |
| Mapping rang | `max(1, round(r * N_local / 60))` (recherche plus proche légal) |
| Boss / acte | Avance **uniquement** après victoire boss + choix récompense |
| Spécial carte | `isSpecialEdition(seed,cardId)` → 1/5 (`hash%5===0`) |
| Templates | `*_special.png` (1/5) → `*_arena.png` → portrait → SVG/monogramme |
| Immersion | Pas de TOP%/rangs/budget dans le HUD principal |
| Combat UI | `combat-director` : skill non skippé ; spotlight capacité/KO ~1s |
| Événements | ≥12 IDs, ≥6 familles (`src/arena/events.js`) |
| Migration | Saves 10.x/11.x → 12 ; carte 43 nœuds conservée (`legacyMap`) jusqu'au prochain acte |

## Modules nouveaux
- `src/arena/rules.js`
- `src/arena/combat-director.js`
- `src/arena/spotlight.js`
- `src/arena/events.js`
- `src/arena/event-ui.js`

## Invariants préservés
CSV/stats/effets DB ; `src/battle.js` ; modes historiques ; Fusion/percentile/pool N ; pas de main/mana/pioche en Arène.
