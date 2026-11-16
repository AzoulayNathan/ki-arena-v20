import fs from'node:fs';import {createRun23}from'../src/v23/new-run.js';import * as E from'../src/v20/engine.js';import {exportRun}from'../src/v20/storage.js';
fs.mkdirSync('qa/v23/fixtures',{recursive:true});let success=false;
for(let attempt=0;attempt<30&&!success;attempt++){
 const r=createRun23(['DB']);while(r.phase==='draft'){E.ensureDraft(r);E.chooseDraft(r,r.offers.find(x=>!x.disabled&&x.revealed)?.token||r.offers.find(x=>!x.disabled).token);}
 E.enterNode(r,E.availableNodes(r)[0]);for(const [i,g]of r.items.entries())E.equip(r,g.uid,r.units[i].uid);E.startCombat(r);E.completeCombat(r);if(r.phase!=='reward')continue;r.qaFixture=true;
 fs.writeFileSync('qa/v23/fixtures/hero.json',exportRun(r));
 E.chooseReward(r,r.rewards.findIndex(x=>!x.disabled));fs.writeFileSync('qa/v23/fixtures/weapon.json',exportRun(r));
 E.chooseReward(r,r.rewards.findIndex(x=>!x.disabled));fs.writeFileSync('qa/v23/fixtures/boon.json',exportRun(r));success=true;console.log('Actual first-fight victory; three logical snapshots, no winner override.');
}
if(!success)throw Error('No first-win fixture found');
