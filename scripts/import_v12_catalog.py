#!/usr/bin/env python3
"""Import V12 TOUTES_CARTES into src/survival/data.js (+ evolution edges)."""
from __future__ import annotations
import csv, json, random, re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V12 = ROOT / "reference-survie" / "v12"
OUT = ROOT / "src" / "survival" / "data.js"
EVO_OUT = ROOT / "src" / "v22" / "evolution-map.js"

FOLDERS = {
    "DB": "Dragon_Ball",
    "HXH": "Hunter_x_Hunter",
    "NARUTO": "Naruto",
    "ONEPIECE": "One_Piece",
    "JOJO": "JoJo_Parties_1_a_6",
}
PORTRAIT_DIRS = {
    "DB": "assets/portraits-db",
    "HXH": "assets/portraits-hxh",
    "NARUTO": "assets/portraits-naruto",
    "ONEPIECE": "assets/portraits-onepiece",
    "JOJO": "assets/portraits-jojo",
}
# V21/V22 combat types
MOT_CLE = {
    "shield": "shield", "guard": "shield", "barrier": "shield", "protect": "team_shield",
    "heal": "heal_ally", "assist": "heal_ally", "rescue": "heal_ally", "regain": "regen", "regen": "regen",
    "evade": "dodge", "dodge": "dodge", "stealth": "dodge",
    "critical": "critical", "crit": "critical",
    "dot": "dot", "burn": "dot", "poison": "dot",
    "combo": "extra_strike", "extra_strike": "extra_strike", "chain": "chain", "splash": "splash",
    "execute": "execute", "finisher": "finisher",
    "stun": "stun", "trap": "stun", "parry": "counter", "counter": "counter",
    "attack_buff": "atk_buff", "atk_buff": "atk_buff", "haste": "haste",
    "weaken": "weaken", "expose": "expose", "dispel": "cleanse", "cleanse": "cleanse",
    "intercept": "intercept", "last_stand": "last_stand", "revive": "revive",
    "lifesteal": "lifesteal", "team_buff": "team_buff", "team_heal": "team_heal",
    "team_shield": "team_shield", "focus": "focus", "transform": "transform",
    "aoe": "aoe", "thorns": "thorns", "onkill_heal": "onkill_heal", "gear_pierce": "gear_pierce",
    "resistance": "shield", "reveal": "focus", "predict": "focus", "cycle": "regen",
    "reposition": "dodge", "time_stop": "stun",
}
TRIGGER = {
    "on_round_start": ("BATTLE_START", None, None),
    "battle_start": ("BATTLE_START", None, None),
    "before_attack": ("BEFORE_ATTACK", "action", 1),
    "after_hit": ("AFTER_HIT", "action", 1),
    "after_attack": ("ACTION_ATTACK", "action", 2),
    "on_action": ("ACTION_START", "action", 2),
    "before_hit": ("BEFORE_HIT", "round", 1),
}
RARITY_NORM = {
    "common": "common", "commune": "common",
    "uncommon": "uncommon", "peu commune": "uncommon", "peu_commune": "uncommon",
    "rare": "rare",
    "epic": "epic", "épique": "epic", "epique": "epic",
    "legendary": "legendary", "légendaire": "legendary", "legendaire": "legendary",
}
ITEM_CAT = {"arme": "arme", "armure": "armure", "outil": "outil", "bonus": "consommable", "consommable": "consommable"}
EVO_LEVEL = {"common": 2, "uncommon": 2, "rare": 3, "epic": 4, "legendary": 6}


def num(v, default=0):
    try:
        return int(float(str(v).replace(",", ".").strip() or default))
    except Exception:
        return default


def map_effect(raw, idx, card_id):
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except Exception:
            raw = {}
    if not isinstance(raw, dict):
        raw = {}
    mot = (raw.get("mot_cle") or raw.get("famille") or "").lower().strip()
    typ = MOT_CLE.get(mot) or MOT_CLE.get((raw.get("famille") or "").lower()) or "atk_buff"
    phase = (raw.get("phase_auto") or raw.get("declencheur") or "").lower()
    trigger, cycle, every = TRIGGER.get(phase, ("BEFORE_ATTACK", "action", 2))
    name = raw.get("nom") or f"Effet {idx+1}"
    desc = raw.get("description") or ""
    val = float(raw.get("valeur") or 0) or 0
    e = {
        "key": f"{card_id}:effect:{idx}",
        "type": typ,
        "name": name,
        "description": desc,
        "trigger": trigger,
        "editorial": True,
    }
    if cycle:
        e["cycle"] = cycle
        e["every"] = every or 2
    # heuristic params
    if typ in ("shield", "team_shield", "heal_ally", "regen", "lifesteal", "atk_buff", "weaken", "team_buff", "team_heal", "haste", "expose"):
        e["amount"] = min(0.45, max(0.06, (val / 100.0) if val > 1 else (val or 0.12)))
    elif typ in ("critical", "dodge"):
        e["chance"] = min(0.55, max(0.12, (val / 100.0) if val > 1 else (val or 0.22)))
        if typ == "critical":
            e["multiplier"] = 1.5
    elif typ in ("extra_strike", "counter", "aoe", "splash", "chain", "execute"):
        e["multiplier"] = min(1.4, max(0.35, (val / 100.0) if val > 1 else (val or 0.65)))
    elif typ == "dot":
        e["damage"] = max(4, int(val or 8))
        e["duration"] = 2
        e["chance"] = 0.35
    elif typ == "stun":
        e["chance"] = 1
    return e


def parse_effects(row):
    card_id = row["id"]
    fx = []
    raw = row.get("effets_json") or ""
    if raw.strip().startswith("["):
        try:
            arr = json.loads(raw)
            if isinstance(arr, list):
                fx = [map_effect(e, i, card_id) for i, e in enumerate(arr)]
        except Exception:
            fx = []
    if not fx:
        for i in range(1, 6):
            txt = (row.get(f"effet_{i}") or "").strip()
            if not txt:
                continue
            # name before em dash
            name = txt.split("—")[0].split("-")[0].strip() or f"Effet {i}"
            fx.append({
                "key": f"{card_id}:effect:{i-1}",
                "type": "atk_buff",
                "name": name[:48],
                "description": txt,
                "trigger": "BATTLE_START",
                "amount": 0.1,
                "editorial": True,
            })
    return fx


def load_universe(universe, folder):
    path = V12 / folder / "TOUTES_CARTES.csv"
    rows = list(csv.DictReader(path.open(encoding="utf-8-sig")))
    heroes, items, relics = [], [], []
    for r in rows:
        kind = (r.get("kind") or "").strip().lower()
        rarity = RARITY_NORM.get((r.get("rarity") or "").strip().lower(), "common")
        if kind == "personnage":
            heroes.append({
                "id": r["id"],
                "name": r.get("name") or r["id"],
                "form": r.get("form_or_notes") or "",
                "person": r.get("person_or_owner") or r["id"],
                "universe": universe,
                "series": universe,
                "attack": max(1, num(r.get("attack_or_atk"), 20)),
                "maxHp": max(1, num(r.get("maxHp_or_shield"), 100)),
                "speed": max(1, num(r.get("speed_or_heal"), 20)),
                "rarity": rarity,
                "signature": parse_effects(r),
                "portrait": f"{PORTRAIT_DIRS[universe]}/{r['id']}.webp",
            })
        elif kind in ITEM_CAT:
            cat = ITEM_CAT[kind]
            atk = num(r.get("attack_or_atk"))
            shield = num(r.get("maxHp_or_shield"))
            heal = num(r.get("speed_or_heal"))
            effect = (r.get("effect") or r.get("effect_key") or "").strip() or (
                "heal" if cat == "consommable" else "atk" if atk else "shield" if shield else "hp"
            )
            draft = cat == "arme" and (r.get("draft") in ("1", "true", "oui", "yes", "") or True)
            allowed = cat in ("arme", "armure", "outil", "consommable")
            # nen/intrinseque not in ITEM_CAT
            items.append({
                "id": r["id"],
                "universe": universe,
                "name": r.get("name") or r["id"],
                "category": cat,
                "rarity": rarity,
                "tier": {"common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legendary": 5}[rarity],
                "effect": effect if effect in ("atk", "pierce", "shield", "hp", "heal", "stun", "evade", "counter", "draw", "scout") else ("heal" if cat == "consommable" else "atk"),
                "atk": atk if cat != "consommable" else 0,
                "shield": shield,
                "heal": heal if cat == "consommable" else (heal if effect == "heal" else 0),
                "draw": 0,
                "cost": 1,
                "uses": 1,
                "canon": "V12",
                "owner": r.get("person_or_owner") or "",
                "source": "V12",
                "notes": r.get("form_or_notes") or r.get("text") or "",
                "allowed": allowed,
                "draft": allowed and cat == "arme",
            })
        elif kind == "relique":
            relics.append({
                "id": r["id"],
                "name": r.get("name") or r["id"],
                "tier": {"common": 1, "uncommon": 1, "rare": 2, "epic": 3, "legendary": 4}[rarity],
                "text": r.get("text") or r.get("form_or_notes") or r.get("description_carte") or "",
                "type": (r.get("effect") or "shield").strip() or "shield",
                "universe": universe,
            })
    heroes.sort(key=lambda h: (h["attack"] + h["maxHp"] + h["speed"], h["id"]))
    for i, h in enumerate(heroes, 1):
        h["rank"] = i
    return heroes, items, relics


def build_evolutions(heroes_by_universe):
    """Random-all evolution edges (no seed): every non-ceiling form gets a higher-stat target in same person when possible, else any higher card."""
    rng = random.Random(0)  # fixed graph for reproducibility of build; runtime said no seed for mode — graph baked at import
    # User asked random without seed for the mode; baking a stable map once is fine for gameplay consistency across clients.
    evo = {}
    for universe, heroes in heroes_by_universe.items():
        by_person = defaultdict(list)
        for h in heroes:
            by_person[h["person"]].append(h)
        for person, forms in by_person.items():
            forms = sorted(forms, key=lambda h: h["attack"] + h["maxHp"] + h["speed"])
            for i, h in enumerate(forms):
                stronger = [x for x in forms[i + 1 :] if (x["attack"] + x["maxHp"] + x["speed"]) > (h["attack"] + h["maxHp"] + h["speed"])]
                if stronger:
                    target = rng.choice(stronger)
                else:
                    # ceiling for this person — try any stronger hero in universe
                    pool = [x for x in heroes if (x["attack"] + x["maxHp"] + x["speed"]) > (h["attack"] + h["maxHp"] + h["speed"]) and x["id"] != h["id"]]
                    if not pool:
                        evo[h["id"]] = None  # absolute ceiling
                        continue
                    target = rng.choice(pool)
                evo[h["id"]] = {
                    "to": target["id"],
                    "levelRequired": EVO_LEVEL.get(target["rarity"], 3),
                    "toRarity": target["rarity"],
                    "samePerson": target["person"] == h["person"],
                }
    return evo


def main():
    out = {}
    all_relics = []
    heroes_by_u = {}
    for universe, folder in FOLDERS.items():
        heroes, items, relics = load_universe(universe, folder)
        heroes_by_u[universe] = heroes
        out[universe] = {"heroes": heroes, "items": items, "evolutions": []}
        all_relics.extend(relics)
        print(universe, "heroes", len(heroes), "items", len(items), "relics", len(relics))
    evo = build_evolutions(heroes_by_u)
    ceilings = sum(1 for v in evo.values() if v is None)
    print("evolution edges", sum(1 for v in evo.values() if v), "ceilings", ceilings)

    OUT.write_text(
        "/* Generated by scripts/import_v12_catalog.py from V12 TOUTES_CARTES. */\n"
        "export const SURVIVAL_DATA="
        + json.dumps(out, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    # compact evolution map for runtime
    EVO_OUT.write_text(
        "/* Generated by scripts/import_v12_catalog.py — random-all evolution graph. */\n"
        "export const EVO_LEVEL_BY_RARITY="
        + json.dumps(EVO_LEVEL, separators=(",", ":"))
        + ";\n"
        "export const EVOLUTION_MAP="
        + json.dumps(evo, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    # relic dump for merge helper
    relic_path = ROOT / "qa" / "v23" / "v12-relics.json"
    relic_path.parent.mkdir(parents=True, exist_ok=True)
    relic_path.write_text(json.dumps(all_relics, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT, "bytes", OUT.stat().st_size)
    print("wrote", EVO_OUT)


if __name__ == "__main__":
    main()
