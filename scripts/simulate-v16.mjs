import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';import {createRunV16,ensureDraft,chooseDraft,makeEncounter,runCatalog,startCombat,completeCombat,equip} from '../src/arena/engine.js';import {registry,WORLDS} from '../src/arena/catalog.js';import {validate} from '../src/arena/storage.js';import {draftSource} from '../src/v16/draft.js';import {DRAFT_BANDS,virtualToLocalRank} from '../src/arena/rules.js';
const result={runs:0,offers:0,disabled:0,bandChecks:0,compositions:{},encounters:0,firstCombat:{wins:0,losses:0},policies:{},pools:{},ok:false};
for(let mask=1;mask<16;mask++)for(let seed=0;seed<100;seed++){
 const worlds=WORLDS.filter((_,i)=>mask>>i&1),r=createRunV16(worlds,'V16-'+mask+'-'+seed),c=registry(worlds),policy=['hero','weapon','mixed','mystery'][seed%4];ensureDraft(r);
 for(let step=0;step<6;step++){
  validate(r);assert.equal(r.offers.filter(o=>o.kind==='hero').length,2);assert.equal(r.offers.filter(o=>o.kind==='weapon').length,1);
  for(const o of r.offers){result.offers++;if(o.disabled){result.disabled++;continue;}const full=draftSource(worlds,o.universe,o.kind),b=DRAFT_BANDS[o.band];assert.equal(full[o.localRank-1].id,o.id);assert(o.localRank>=virtualToLocalRank(b.lo,full.length)&&o.localRank<=virtualToLocalRank(b.hi,full.length));result.bandChecks++;}
  const valid=r.offers.filter(o=>!o.disabled),preferred=policy==='mystery'?valid.find(o=>o.band==='mystery'):policy==='mixed'?valid[(seed+step)%valid.length]:valid.find(o=>o.kind===policy),o=preferred||valid[0],copy=structuredClone(r);assert(chooseDraft(r,o.token));assert(chooseDraft(copy,o.token));assert.deepEqual(r.offers,copy.offers);assert.equal(r.rng,copy.rng);
 }
 validate(r);assert(r.units.length>=3&&r.units.length<=5&&r.items.length>=1);for(const g of r.items){const target=r.units.find(u=>c.byId.get(u.cardId).universe===c.byItem.get(g.cardId).universe);assert(target);equip(r,g.uid,target.uid);}
 const k=r.units.length+'+'+r.items.length;result.compositions[k]=(result.compositions[k]||0)+1;result.pools[c.key]=(result.pools[c.key]||0)+1;result.policies[policy]=(result.policies[policy]||0)+1;
 const check=structuredClone(r);for(let v=1;v<=60;v++)for(const kind of ['normal','elite','boss']){check.act=Math.floor((v-1)/10);const e=makeEncounter(check,{id:'simulation',kind,row:(v-1)%10});assert.equal(e.ranks.reduce((a,b)=>a+b,0),Math.round(c.N/4*(v+({normal:0,elite:1,boss:2}[kind]))));assert(e.ranks.every(n=>n>=1&&n<=c.N));if(v>=10)assert.equal(e.enemies.length,Math.max(5,Math.ceil(e.budget/c.N)));result.encounters++;}
 r.pending=makeEncounter(r,{id:r.nodes[0].id,row:0,kind:'normal'});r.phase='prepare';assert(startCombat(r));const victory=r.combat.result.winner==='A';completeCombat(r);result.firstCombat[victory?'wins':'losses']++;result.runs++;
}
result.ok=true;writeFileSync('qa/v16/simulation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
