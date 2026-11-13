# KI Arena V20 — État actuel du jeu

Fan game local **Horizons / Édition 20** (`rulesVersion` `20.0.0`). Point d’entrée : `index.html`.

## Architecture

| Couche | Rôle |
|--------|------|
| `src/v19/ui.js` | UI solo (shell, phases, HUD, auto-jeu) |
| `src/v20/engine.js` | Run : draft/roster, map, combat, rewards, prestige |
| `src/v20/router.js` | Bascule v19 legacy ↔ v20 |
| `src/v20/battle.js` | Combat auto (ciblage aléatoire) |
| `src/v19/card-renderer.js` + `card-spec.js` | Templates canvas des cartes (bulles ATQ/PV/VIT, FX rareté) |
| `src/v20/collection-rewards.js` | Collection / packs débloqués |
| `sw.js` | Service worker (cache bust `novine-final`) |

## Phases de run

`draft` → `map` → (`prepare` → `combat` → `reward`) | `rest` | `shop` | `event` | `treasure` → …  
À l’entrée **ACTE 10** (`act === 9` après boss) : phase `prestige` (survie infinie **ou** gain prestige).  
Fin : `end` + bilan / panthéon.

## Difficulté

- Budget rencontre : `rankBudget(N, wave, kind) = round(N/4 * (wave+kindBonus) * 0.5625)`  
- Prestige persisté (`kiarena:v20:prestigeDiff`, 0–5) : budget × `(1 + 0.2 * P)` ; récompenses zénis × `(1 + 0.15 * P)`.

## Cartes / templates

- Gabarit code : `src/v19/card-renderer.js` (`renderCard`, 900×1350).  
- FX cumulés par rareté : `seal` → `sparks` → `split` → `aurora` → `embers` (+ `prism` spécial).  
- **Aucun trait type liane** (coins seulement pour seal/split ; sparks = points intérieurs).  
- Modèles doc / étude : dossier `modeles/`.  
- Portraits locaux : `assets/portraits-*` (import Card Studio possible).

## Modes annexes

Arcade, multi/party, collection, survie legacy V9 (`LEGACY_V9.html`), atelier créateur (mot de passe session).

## Lancer en local

Ouvrir `index.html` via un serveur statique (ex. `npx serve .`) pour le SW / modules ES. Sans serveur, les modules peuvent être bloqués selon le navigateur.
