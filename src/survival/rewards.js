import {catalog,newUnit} from './catalog.js';
import {pick,shuffle,random} from './random.js';
import {isRefinedRun,usefulLoot,lootWeight} from './economy.js';
import {healLiving,expandField} from './progression.js';
export const RELIC_DEFS={manual:{name:'Manuel d’entraînement',text:'+1 carte dans la main initiale',icon:'▤'},reader:{name:'Vitesse de lecture',text:'2 pioches normales par round',icon:'↗'},garden:{name:'Jardin médicinal',text:'+5 % PV aux vivants après victoire',icon:'✿'}};
export function eligibleItems(run,tier=5){return catalog(run.universe).gear.filter(g=>!run.items.includes(g.id)&&g.tier<=tier&&run.items.length<40);}
export function lootCandidates(run,tier=5){const pool=eligibleItems(run,tier);return isRefinedRun(run)?pool.filter(g=>usefulLoot(run,g)):pool;}
function pickLoot(run,pool){if(!isRefinedRun(run))return pick(run,pool);let ticket=random(run)*pool.reduce((n,g)=>n+lootWeight(run,g),0);for(const g of pool){ticket-=lootWeight(run,g);if(ticket<0)return g;}return pool.at(-1);}
export function rewardPool(run,kind){
 const cat=catalog(run.universe),pool=[{type:'coins',amount:(12+5*run.wave)*(kind==='boss'?2:kind==='elite'?1.5:1)}];pool[0].amount=Math.round(pool[0].amount);
 if(run.units.some(x=>x.hp<x.maxHp))pool.push({type:'heal',amount:kind==='boss'?.35:.2});
 const items=lootCandidates(run,kind==='boss'?5:Math.min(5,2+Math.floor(run.wave/5)));
 if(items.length)pool.push({type:'item',id:pickLoot(run,items).id});
 const seen=new Set([...run.units,...run.dead].map(x=>x.person)),recruits=(run.pending?.units||[]).filter(x=>!seen.has(x.person));
 if(recruits.length&&run.units.length<30)pool.push({type:'recruit',id:pick(run,isRefinedRun(run)?[...recruits].sort((a,b)=>(b.rank||cat.byId.get(b.cardId).rank)-(a.rank||cat.byId.get(a.cardId).rank)||a.cardId.localeCompare(b.cardId)).slice(0,1):recruits).cardId});
 if(kind!=='normal'){
  const relics=Object.keys(RELIC_DEFS).filter(id=>!run.relics.includes(id));if(relics.length&&random(run)<.35)pool.push({type:'relic',id:pick(run,relics)});
  if(kind==='boss'&&run.slots<5&&random(run)<.01)pool.push({type:'slot'});
  if(kind==='boss'&&run.dead.length&&random(run)<.02)pool.push({type:'resurrection',id:pick(run,run.dead).uid});
 }
 return pool;
}
export function rewards(run,kind){let pool=shuffle(run,rewardPool(run,kind));
 if(!['9.1.0','9.2.0','9.3.0'].includes(run.rulesVersion)){for(const amount of [25,40,60])if(pool.length<3)pool.push({type:'coins',amount:amount+run.wave});return pool.slice(0,3).map((x,i)=>({...x,key:`${run.wave}:${run.victories}:${i}`}));}
 // A depleted squad must actually see its eligible recovery option. Rare boss
 // artefacts follow urgent recovery options before ordinary loot.
 const recruit=run.units.length<=3?pool.find(x=>x.type==='recruit'):null,heal=run.units.some(u=>u.hp/u.maxHp<.4)?pool.find(x=>x.type==='heal'):null;
 const priority=[recruit,heal,...pool.filter(x=>['slot','resurrection','relic'].includes(x.type))].filter(Boolean);
 const selected=priority.slice(0,3),remaining=pool.filter(x=>!selected.includes(x));
 selected.push(...remaining.slice(0,3-selected.length));
 // Prefer another usable physical item over redundant currency choices.
 while(selected.length<3){const available=lootCandidates(run,kind==='boss'?5:Math.min(5,2+Math.floor(run.wave/5))).filter(g=>!selected.some(x=>x.type==='item'&&x.id===g.id));if(!available.length)break;selected.push({type:'item',id:pickLoot(run,available).id});}
 for(const amount of [25,40,60])if(selected.length<3)selected.push({type:'coins',amount:amount+run.wave});
 return shuffle(run,selected).map((x,i)=>({...x,key:`${run.wave}:${run.victories}:${i}`}));
}
export function applyReward(run,r){const cat=catalog(run.universe);
 if(r.type==='coins'){run.coins+=r.amount;return true;}
 if(r.type==='heal'){return healLiving(run,r.amount)>0;}
 if(r.type==='item'){if(!eligibleItems(run).some(x=>x.id===r.id))return false;run.items.push(r.id);return true;}
 if(r.type==='recruit'){const c=cat.byId.get(r.id);if(!c||run.units.concat(run.dead).some(x=>x.person===c.person))return false;run.units.push(newUnit(c));return true;}
 if(r.type==='relic'){if(!RELIC_DEFS[r.id]||run.relics.includes(r.id))return false;run.relics.push(r.id);return true;}
 if(r.type==='slot')return expandField(run);
 if(r.type==='resurrection'){const i=run.dead.findIndex(x=>x.uid===r.id);if(i<0)return false;const [u]=run.dead.splice(i,1);u.hp=Math.max(1,Math.round(u.maxHp*.25));run.units.push(u);return true;}
 return false;
}
export function makeShop(run){if(isRefinedRun(run)){let available=lootCandidates(run,Math.min(5,2+Math.floor(run.wave/5)));const chosen=[];for(const family of ['draw','armor','any']){const group=available.filter(g=>family==='draw'?g.draw>0:family==='armor'?g.category==='armure':true),pool=group.length?group:available;if(!pool.length)break;const g=pickLoot(run,pool);chosen.push({id:g.id,price:10+g.tier*10+Math.floor(run.wave/2)});available=available.filter(x=>x.id!==g.id);}return chosen;}const items=shuffle(run,eligibleItems(run,Math.min(5,2+Math.floor(run.wave/5)))).slice(0,3).map(g=>({id:g.id,price:10+g.tier*10+Math.floor(run.wave/2)}));return items;}
export function buy(run,id){if(run.phase!=='shop')return false;const s=run.shop.find(x=>x.id===id);if(!s||s.sold||s.price>run.coins||!applyReward(run,{type:'item',id}))return false;run.coins-=s.price;s.sold=true;return true;}
