import {GEAR,RELICS,CONSUMABLES,MAP_TYPES,BACKGROUNDS} from '../src/roguelike.js';
import {writeFile} from 'node:fs/promises';
function csv(rows){const keys=[...new Set(rows.flatMap(x=>Object.keys(x)))];const esc=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\ufeff'+keys.join(';')+'\n'+rows.map(r=>keys.map(k=>esc(r[k])).join(';')).join('\n')+'\n';}
await writeFile('data/items_et_reliques.csv',csv([...GEAR.map(x=>({categorie:'equipement',...x})),...RELICS.map(x=>({categorie:'relique',...x})),...CONSUMABLES.map(x=>({categorie:'consommable',...x}))]));
await writeFile('data/rencontres_roguelike.csv',csv(Object.entries(MAP_TYPES).map(([id,x])=>({id,...x}))));
console.log(GEAR.length,'équipements',RELICS.length,'reliques',CONSUMABLES.length,'consommables',Object.keys(MAP_TYPES).length,'types de rencontres');
