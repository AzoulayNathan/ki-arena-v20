import {exportRun} from '../src/v20/storage.js';
import {upsertMemory,exportPantheon} from '../src/v20/pantheon-storage.js';
import {writeFileSync} from 'node:fs';
import {WORLDS} from '../src/v20/catalog.js';
import {createRunV19,ensureDraft,chooseDraft,runCatalog,availableNodes,enterNode,equip,startCombat,completeCombat,chooseReward,rest,resolveEvent,buy,buyCare,leaveNode} from '../src/v20/router.js';
import {eventOption} from '../src/v20/events.js';
const sets=Array.from({length:15},(_,i)=>WORLDS.filter((_,j)=>(i+1)&(1<<j))),summary={},errors=[],examples=[],stages={};
for(let i=0;i<1;i++){
 const mode=i%2?'raw':'normalized',profile=['novice','puissance','synergie','risque'][Math.floor(i/2)%4],worlds=sets[i%15],r=createRunV19(worlds,'FULL20-'+i,mode),key=mode+'/'+profile;
 const s=summary[key]??={runs:0,actClears:0,losses:0,limit:0,furthestStep:0,totalSteps:0,totalInitialHeroes:0,totalCombatRounds:0,combats:0};s.runs++;let actions=0,furthest=0;
 try{
  ensureDraft(r);while(r.phase==='draft'){
   const offers=r.offers.filter(o=>!o.disabled),heroes=offers.filter(o=>o.kind==='hero').sort((a,b)=>b.globalRank-a.globalRank),weapons=offers.filter(o=>o.kind==='weapon');
   const o=profile==='novice'?offers[0]:profile==='risque'?offers.find(o=>o.band==='mystery')||offers[0]:profile==='synergie'&&r.units.length>=3&&weapons.length&&!r.items.length?weapons[0]:heroes[0]||offers[0];chooseDraft(r,o.token);
  }
  s.totalInitialHeroes+=r.units.length;
  while(r.phase!=='end'&&r.act<1&&actions++<120){
   const c=runCatalog(r);if(profile==='synergie'&&['map','prepare'].includes(r.phase))r.units.sort((a,b)=>b.maxHp-a.maxHp||a.uid.localeCompare(b.uid));
   for(const g of r.items){const def=c.byItem.get(g.cardId);if(!['arme','armure'].includes(def.category))continue;const u=r.units.slice(0,5).find(u=>c.byId.get(u.cardId).universe===def.universe&&!u[def.category==='armure'?'armor':'weapon']);if(u)equip(r,g.uid,u.uid);}
   if(r.phase==='map'){
    const choices=r.nodes.filter(n=>availableNodes(r).includes(n.id)),order=profile==='risque'?['event','elite','treasure','normal','shop','rest','boss']:profile==='novice'?['normal','treasure','shop','event','elite','rest','boss']:['rest','shop','treasure','event','normal','elite','boss'];choices.sort((a,b)=>order.indexOf(a.kind)-order.indexOf(b.kind));enterNode(r,choices[0].id);
   }else if(r.phase==='prepare'){
    startCombat(r);s.totalCombatRounds+=r.combat.result.rounds;s.combats++;completeCombat(r);const h=r.history.at(-1),st=stages[mode+'/'+h.wave]??={wins:0,losses:0};st[h.win?'wins':'losses']++;
   }else if(r.phase==='reward'){
    const ratio=r.units.reduce((a,u)=>a+u.hp/u.maxHp,0)/Math.max(1,r.units.length),order=r.units.length<5?['recruit','heal','item','passive','training','vigor','coins']:ratio<.65?['heal','item','passive','recruit','training','vigor','coins']:['item','passive','training','vigor','recruit','coins','heal'];const best=r.rewards.map((rw,i)=>({i,score:order.indexOf(rw.type)})).sort((a,b)=>a.score-b.score)[0];chooseReward(r,profile==='novice'?0:best.i);
   }else if(r.phase==='shop'){if(profile!=='risque')buyCare(r);for(let j=0;j<r.shop.length;j++)buy(r,j);leaveNode(r);
   }else if(r.phase==='rest')rest(r,profile==='risque'?'train':'heal');
   else if(r.phase==='event'){const choices=r.activeEvent.scenes.filter(x=>eventOption(r,x.id).ok),o=(profile==='risque'?choices.find(x=>x.tone==='risk'):choices.find(x=>x.tone==='safe'))||choices[0];if(!o)throw Error('Aucune issue valide');resolveEvent(r,o.id);}
   else if(r.phase==='result')leaveNode(r);else throw Error('Phase inattendue '+r.phase);
   furthest=Math.max(furthest,r.highestResolvedEncounterDepth||0);
  }
  s.furthestStep=Math.max(s.furthestStep,furthest);s.totalSteps+=furthest;if(r.act>0)s.actClears++;else if(r.phase==='end')s.losses++;else s.limit++;
  if(i===0&&r.phase==='end'){writeFileSync('qa/v20/fixtures/natural-ended-run.json',exportRun(r));const m=new Map(),storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};upsertMemory(r.receipt,{},storage);writeFileSync('qa/v20/fixtures/natural-pantheon.json',exportPantheon(storage));}
  if(i<24)examples.push({seed:r.seed,mode,profile,worlds,phase:r.phase,act:r.act,step:furthest});
 }catch(e){errors.push({seed:r.seed,error:e.message});}
}
for(const s of Object.values(summary)){s.averageSteps=Number((s.totalSteps/s.runs).toFixed(2));s.averageInitialHeroes=Number((s.totalInitialHeroes/s.runs).toFixed(2));s.averageCombatRounds=Number((s.totalCombatRounds/Math.max(1,s.combats)).toFixed(2));}
const result={seeds:1000,profiles:4,worldCombinations:15,summary,stages,errors,examples,note:'Politiques automatiques explicites, aucune estimation de compétence humaine. La formule de budget est conservée. Code 2 si aucun acte terminé : objectif de calibration non validé.'};writeFileSync('qa/v20/fixtures/natural-run-summary.json',JSON.stringify(result,null,2));console.log(JSON.stringify({summary,errors},null,2));process.exitCode=errors.length?1:0;
