import {writeFileSync,readFileSync} from 'node:fs';import{registry,WORLDS}from'../src/v20/catalog.js';
const rows=[['ID','Univers','Nom','Role','Capacites','Parametres','Validation','Preuve']],summary={};
for(const w of WORLDS){const c=registry([w]);summary[w]={characters:c.N,patterns:new Set(c.heroes.map(h=>JSON.stringify(h.effects.map(({name,description,key,...e})=>e)))).size};for(const h of c.heroes)rows.push([h.id,w,h.name,h.strategyRole,h.effects.map(e=>e.type).join('|'),JSON.stringify(h.effects),'REVIEW_CANON · ADAPTATION_GAMEPLAY_V20','src/v20/catalog.js; src/v20/battle.js; tests/test-v20.mjs']);}
const csv=r=>r.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(';')).join('\n')+'\n';
writeFileSync('CAPACITES_V20.csv',csv(rows));writeFileSync('qa/v20/content-summary.json',JSON.stringify(summary,null,2));
let items=readFileSync('LISTE_ITEMS_V19.csv','utf8').replaceAll('src/v19/engine.js','src/v20/engine.js');writeFileSync('LISTE_ITEMS_V20.csv',items);
console.log(summary);
