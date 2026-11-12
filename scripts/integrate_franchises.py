#!/usr/bin/env python3
"""Wire DB / HxH / Naruto / One Piece into KI ARENA V9 (catalogues + portraits junctions + equipment clones)."""
from __future__ import annotations
import csv, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAT = ROOT / "reference-survie" / "catalogues"
STUDIOS = {
    "NARUTO": Path(r"c:\Users\User\Downloads\KI_ARENA_NARUTO_CARD_STUDIO"),
    "ONEPIECE": Path(r"c:\Users\User\Downloads\KI_ARENA_ONEPIECE_CARD_STUDIO"),
    "HXH": Path(r"c:\Users\User\Downloads\KI_ARENA_HXH_CARD_STUDIO"),
    "DB": Path(r"c:\Users\User\Downloads\KI_ARENA_CARD_STUDIO_FINAL\KI_ARENA_CARD_STUDIO_FINAL"),
}

# Thematic weapon name overlays when cloning HXH gear → new universe
THEME_GEAR = {
    "NARUTO": [
        ("Kunai standard", "arme", "atk", 8, 1),
        ("Shuriken explosif", "arme", "atk", 12, 2),
        ("Épée de Chakra", "arme", "pierce", 16, 3),
        ("Samehada", "arme", "pierce", 20, 4),
        ("Rasengan focalisé", "arme", "atk", 24, 5),
        ("Gilet de jônin", "armure", "shield", 18, 2),
        ("Bandeau de Konoha", "outil", "draw", 0, 1),
        ("Pilules militaires", "consommable", "heal", 25, 1),
        ("Parchemin de invocation", "outil", "scout", 0, 2),
        ("Marque maudite scellée", "outil", "counter", 0, 3),
        ("Pupille Sharingan", "outil", "evade", 0, 4),
        ("Mode Ermite", "outil", "stun", 0, 5),
        ("Armure de samouraï", "armure", "hp", 22, 3),
        ("Fils de chakra", "arme", "atk", 14, 3),
        ("Épée de Kusanagi", "arme", "pierce", 18, 4),
        ("Bouclier de sable", "armure", "shield", 28, 4),
        ("Bijû bomb draft", "arme", "atk", 22, 5),
        ("Sceau de suppression", "outil", "stun", 0, 3),
        ("Manteau de Hokage", "armure", "hp", 16, 3),
        ("Katana de samouraï", "arme", "atk", 12, 2),
        ("Fûma shuriken", "arme", "pierce", 14, 3),
    ],
    "ONEPIECE": [
        ("Sabre de pirate", "arme", "atk", 8, 1),
        ("Couteau de cuisine", "arme", "atk", 12, 2),
        ("Yoru (réplique)", "arme", "pierce", 16, 3),
        ("Griffes de Mink", "arme", "pierce", 20, 4),
        ("Coup de Haki", "arme", "atk", 24, 5),
        ("Manteau de capitaine", "armure", "shield", 18, 2),
        ("Vivre card", "outil", "draw", 0, 1),
        ("Tonique de l'océan", "consommable", "heal", 25, 1),
        ("Log Pose", "outil", "scout", 0, 2),
        ("Dial explosif", "outil", "counter", 0, 3),
        ("Bubble shield", "outil", "evade", 0, 4),
        ("Seastone tip", "outil", "stun", 0, 5),
        ("Armure de marine", "armure", "hp", 22, 3),
        ("Clima-Tact", "arme", "atk", 14, 3),
        ("Shusui", "arme", "pierce", 18, 4),
        ("Bouclier de Germa", "armure", "shield", 28, 4),
        ("Pistolet de Yasopp", "arme", "atk", 22, 5),
        ("Menottes de Seastone", "outil", "stun", 0, 3),
        ("Cape de Shanks", "armure", "hp", 16, 3),
        ("Hache de Edward", "arme", "atk", 12, 2),
        ("Lance de Neptune", "arme", "pierce", 14, 3),
    ],
}


def copy_cards(universe: str, src_csv: Path):
    dst = CAT / f"{universe}_CARTES_SOURCE.csv"
    shutil.copy2(src_csv, dst)
    # normalize universe column values
    rows = list(csv.DictReader(dst.open(encoding="utf-8-sig"), delimiter=";"))
    fields = rows[0].keys() if rows else []
    with dst.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
        w.writeheader()
        for r in rows:
            if "univers" in r:
                r["univers"] = universe
            if "serie" in r and not r["serie"]:
                r["serie"] = universe
            w.writerow(r)
    print(f"cards {universe}: {len(rows)} → {dst.name}")


def write_equipment(universe: str):
    """Clone structure from HXH equipment + thematic names."""
    base = list(csv.DictReader((CAT / "EQUIPEMENTS_HXH.csv").open(encoding="utf-8-sig"), delimiter=";"))
    theme = THEME_GEAR[universe]
    out = []
    for i, tpl in enumerate(theme):
        name, classe, effect, pct, tier = tpl
        rarity = {1: "common", 2: "uncommon", 3: "rare", 4: "epic", 5: "legendary"}[tier]
        src = base[i % len(base)]
        row = dict(src)
        slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("'", "")
        row["id"] = f"{universe.lower()[:3]}-eq-{i+1:02d}-{slug[:28]}"
        row["univers"] = universe
        row["nom"] = name
        row["porteur_original"] = "KI ARENA · thématique"
        row["classe"] = classe
        row["rarete"] = rarity
        row["rang_rarete"] = str(tier)
        row["effet_principal"] = effect
        row["attaque_bonus_pct"] = str(pct if effect in ("atk", "pierce") else 0)
        row["armure_bouclier_pct"] = str(pct if effect in ("shield", "hp") else 0)
        row["soin_pct"] = str(pct if effect == "heal" else 0)
        row["pioche_supplementaire"] = str(1 if effect in ("draw", "scout") else 0)
        row["cout_action_equipement"] = str(0 if tier <= 2 else 1)
        row["utilisations_par_combat"] = "1"
        row["statut_canon"] = "EDITORIAL_PROPOSE"
        row["compatible_draft"] = "oui" if classe == "arme" else "non"
        row["source"] = f"Adaptation thématique {universe}"
        row["notes"] = "Clone structure HXH · noms thématiques · pas de Nen personnel"
        row["statut_equilibrage"] = "PROPOSITION_A_TESTER"
        out.append(row)
    # keep a few consumables/armors from clone for variety (skip Nen)
    for r in base:
        if r["classe"] in ("consommable", "armure", "outil") and r["statut_canon"] not in (
            "NEN_PERSONNEL",
            "HORS_EQUIPEMENT",
        ):
            row = dict(r)
            row["id"] = f"{universe.lower()[:3]}-{r['id']}"
            row["univers"] = universe
            row["source"] = f"Adapté depuis HXH · {universe}"
            row["statut_canon"] = "EDITORIAL_PROPOSE"
            out.append(row)
            if sum(1 for x in out if x["classe"] == r["classe"]) > 12:
                break
    dst = CAT / f"EQUIPEMENTS_{universe}.csv"
    with dst.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(out[0].keys()), delimiter=";")
        w.writeheader()
        w.writerows(out)
    print(f"equip {universe}: {len(out)} → {dst.name}")


def junction_portraits():
    mapping = {
        "portraits-db": STUDIOS["DB"] / "assets" / "portraits",
        "portraits-hxh": STUDIOS["HXH"] / "assets" / "portraits",
        "portraits-naruto": STUDIOS["NARUTO"] / "assets" / "portraits",
        "portraits-onepiece": STUDIOS["ONEPIECE"] / "assets" / "portraits",
    }
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    for name, target in mapping.items():
        link = assets / name
        if not target.exists():
            print("MISSING portraits", target)
            continue
        if link.exists() or link.is_symlink():
            print("keep", link)
            continue
        # Windows junction via cmd
        import subprocess

        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(link), str(target)],
            check=False,
            capture_output=True,
            text=True,
        )
        print("junction", link, "->", target, "ok" if link.exists() else "FAIL")


def update_config():
    cfg_path = CAT / "CONFIG_SURVIE.json"
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    cfg["univers"] = ["DB", "HXH", "NARUTO", "ONEPIECE"]
    cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("CONFIG universes:", cfg["univers"])


def main():
    copy_cards("NARUTO", STUDIOS["NARUTO"] / "data" / "cards_v52_600.csv")
    copy_cards("ONEPIECE", STUDIOS["ONEPIECE"] / "data" / "cards_v52_600.csv")
    # also refresh HXH from studio if present (portraits ready)
    hxh_studio = STUDIOS["HXH"] / "data" / "cards_v52_600.csv"
    if hxh_studio.exists():
        # keep official HXH_CARTES_SOURCE unless studio is richer — skip overwrite of official
        print("HXH official source kept (reference)")
    write_equipment("NARUTO")
    write_equipment("ONEPIECE")
    update_config()
    junction_portraits()
    print("DONE integrate_franchises")


if __name__ == "__main__":
    main()
