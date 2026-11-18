#!/usr/bin/env python3
"""Export full collection dossier: stats/effects CSV+JSON + copied art + templates note."""
from __future__ import annotations
import csv, json, re, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "EXPORT_COLLECTION_V23"
WORLD = {"DB": "db", "HXH": "hxh", "NARUTO": "naruto", "ONEPIECE": "onepiece", "JOJO": "jojo"}
HERO_FX = {"common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legendary": 5}
WEAPON_FX = {"common": 1, "uncommon": 1, "rare": 2, "epic": 2, "legendary": 3}


def dump_via_node():
    script = r"""
import {SURVIVAL_DATA} from '../src/survival/data.js';
import {catalog} from '../src/survival/catalog.js';
import {weaponEffects,weaponEffectCount} from '../src/v22/effects.js';
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const heroes=[], items=[], audit={heroesOk:true,weaponsOk:true,rarity:[],weaponFxBad:[],heroFxBad:[]};
for (const u of Object.keys(SURVIVAL_DATA)){
  const c=catalog(u);
  const hc={}; for(const h of c.heroes){hc[h.rarity]=(hc[h.rarity]||0)+1;
    heroes.push({universe:u,id:h.id,name:h.name,form:h.form||'',person:h.person,rarity:h.rarity,rank:h.rank,attack:h.attack,maxHp:h.maxHp,speed:h.speed,effects:(h.effects||[]).map(e=>({type:e.type,name:e.name,trigger:e.trigger||''})),effectCount:(h.effects||[]).length,portrait:`assets/portraits-${({DB:'db',HXH:'hxh',NARUTO:'naruto',ONEPIECE:'onepiece',JOJO:'jojo'})[u]}/${h.id}.webp`});
    const want={common:1,uncommon:2,rare:3,epic:4,legendary:5}[h.rarity];
    if((h.effects||[]).length!==want){audit.heroesOk=false;audit.heroFxBad.push(u+':'+h.id+':'+h.rarity+':'+((h.effects||[]).length));}
  }
  const n=c.heroes.length; audit.rarity.push({universe:u,n,share:Object.fromEntries(Object.entries(hc).map(([k,v])=>[k,+(100*v/n).toFixed(2)]))});
  for(const it of c.items||[]){
    const fx=weaponEffects({...it,universe:u,id:u+':'+it.id});
    items.push({universe:u,id:it.id,name:it.name,category:it.category,rarity:it.rarity,effect:it.effect,atk:it.atk,shield:it.shield,heal:it.heal,tier:it.tier,effects:fx.map(e=>({type:e.type,name:e.name})),effectCount:fx.length,art:`assets/equipment/${({DB:'db',HXH:'hxh',NARUTO:'naruto',ONEPIECE:'onepiece',JOJO:'jojo'})[u]}/${it.id}.webp`});
    if(it.category==='arme'){
      const want=weaponEffectCount(it.rarity);
      if(fx.length!==want){audit.weaponsOk=false;audit.weaponFxBad.push(u+':'+it.id+':'+it.rarity+':'+fx.length+'/want'+want);}
    }
  }
}
const relics=[];
const js=fs.readFileSync(path.join(root,'src/v22/relics.js'),'utf8');
for(const m of js.matchAll(/make\('([a-z0-9_]+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'[^']*'\s*,\s*'([^']*)'/g)){
  relics.push({id:m[1],name:m[2],tier:+m[3],text:m[4],asset:`assets/v22/relics/${m[1]}.webp`});
}
fs.mkdirSync(path.join(root,'qa','v23'),{recursive:true});
fs.writeFileSync(path.join(root,'qa','v23','_export-dump.json'), JSON.stringify({heroes,items,relics,audit},null,2));
console.log('heroes',heroes.length,'items',items.length,'relics',relics.length,'heroesOk',audit.heroesOk,'weaponsOk',audit.weaponsOk,'weaponBad',audit.weaponFxBad.length);
"""
    p = ROOT / "scripts" / "_export_dump.mjs"
    p.write_text(script, encoding="utf-8")
    subprocess.run(["node", str(p)], cwd=ROOT, check=True)
    return json.loads((ROOT / "qa/v23/_export-dump.json").read_text(encoding="utf-8"))


def copy_if(src: Path, dest: Path):
    if src.is_file():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        return True
    return False


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    data = dump_via_node()
    (OUT / "json").mkdir(parents=True)
    (OUT / "csv").mkdir(parents=True)
    (OUT / "images" / "heroes").mkdir(parents=True)
    (OUT / "images" / "equipment").mkdir(parents=True)
    (OUT / "images" / "relics").mkdir(parents=True)
    (OUT / "templates").mkdir(parents=True)

    (OUT / "json" / "heroes.json").write_text(json.dumps(data["heroes"], ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "json" / "items.json").write_text(json.dumps(data["items"], ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "json" / "relics.json").write_text(json.dumps(data["relics"], ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "json" / "audit.json").write_text(json.dumps(data["audit"], ensure_ascii=False, indent=2), encoding="utf-8")

    with (OUT / "csv" / "heroes.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["universe", "id", "name", "form", "person", "rarity", "rank", "attack", "maxHp", "speed", "effectCount", "effects", "portrait"],
        )
        w.writeheader()
        for h in data["heroes"]:
            w.writerow({**{k: h[k] for k in w.fieldnames if k != "effects"}, "effects": " | ".join(f"{e['type']}:{e['name']}" for e in h["effects"])})

    with (OUT / "csv" / "items.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["universe", "id", "name", "category", "rarity", "effect", "atk", "shield", "heal", "tier", "effectCount", "effects", "art"],
        )
        w.writeheader()
        for it in data["items"]:
            w.writerow({**{k: it.get(k) for k in w.fieldnames if k != "effects"}, "effects": " | ".join(f"{e['type']}:{e['name']}" for e in it["effects"])})

    with (OUT / "csv" / "relics.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "name", "tier", "text", "asset"])
        w.writeheader()
        for r in data["relics"]:
            w.writerow(r)

    # copy images
    miss_h = miss_i = miss_r = 0
    for h in data["heroes"]:
        src = ROOT / h["portrait"]
        dest = OUT / "images" / "heroes" / h["universe"] / Path(h["portrait"]).name
        if not copy_if(src, dest):
            miss_h += 1
    for it in data["items"]:
        src = ROOT / it["art"]
        dest = OUT / "images" / "equipment" / it["universe"] / Path(it["art"]).name
        if not copy_if(src, dest):
            miss_i += 1
    for r in data["relics"]:
        src = ROOT / r["asset"]
        dest = OUT / "images" / "relics" / Path(r["asset"]).name
        if not copy_if(src, dest):
            miss_r += 1

    # templates / rules note
    (OUT / "templates" / "RULES.md").write_text(
        """# KI ARENA — dossier collection V23

## Ratios rareté (héros, chaque manga)
33% commune / 27% peu commune / 21% rare / 15% épique / 4% légendaire

## Nombre d'effets
- Héros : commune 1 · peu commune 2 · rare 3 · épique 4 · légendaire 5
- Armes : commune & peu commune 1 · rare & épique 2 · légendaire 3

## Templates carte
Face design `tmpl33` (src/v19/polish.js FACE_DESIGN).
Rareté → surface illustration croissante (CARD_LAYOUTS).
Finitions : noire / blanche / dorée (SKIN_ODDS 45/45/10).

## Contenu
- `csv/` inventaires lisibles
- `json/` dump complet + audit
- `images/heroes|equipment|relics/` copies locales
""",
        encoding="utf-8",
    )
    # copy a couple of template css/js pointers
    for rel in ["src/v19/card-spec.js", "src/v21/cards.js"]:
        src = ROOT / rel
        if src.exists():
            shutil.copy2(src, OUT / "templates" / src.name)

    readme = {
        "folder": str(OUT),
        "heroes": len(data["heroes"]),
        "items": len(data["items"]),
        "relics": len(data["relics"]),
        "missing_hero_images": miss_h,
        "missing_item_images": miss_i,
        "missing_relic_images": miss_r,
        "audit": data["audit"],
    }
    (OUT / "README.json").write_text(json.dumps(readme, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(readme, indent=2))


if __name__ == "__main__":
    main()
