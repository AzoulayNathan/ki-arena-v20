import {catalog} from './catalog.js';
import {EVOLUTION_MAP} from '../v22/evolution-map.js';
export function healLiving(run,pct){let total=0;for(const u of run.units){const n=Math.min(u.maxHp-u.hp,Math.round(u.maxHp*pct));if(u.hp>0){u.hp+=n;total+=n;}}return total;}
export function killUnit(run,id){const i=run.units.findIndex(x=>x.uid===id);if(i<0)return false;const [u]=run.units.splice(i,1);u.hp=0;run.dead.push(u);return true;}
function power(h){return (h?.attack||0)+(h?.maxHp||0)+(h?.speed||0);}
function tryEvolveSurvival(run,u,cat){
 const edge=EVOLUTION_MAP[u.cardId];
 if(edge==null||!edge?.to||(u.level||1)<(edge.levelRequired||2))return null;
 const cur=cat.byId.get(u.cardId),target=cat.byId.get(edge.to);
 if(!cur||!target||power(target)<=power(cur))return null;
 if(target.person!==cur.person){
  const taken=[...run.units,...run.dead].some(x=>x.uid!==u.uid&&x.person===target.person);
  if(taken)return null;
 }
 const fromName=u.name;
 const ratio=u.hp/u.maxHp;
 u.cardId=target.id;u.name=target.name;u.person=target.person;u.attack=target.attack;u.maxHp=target.maxHp;u.speed=target.speed;u.level=1;u.wins=0;
 u.hp=Math.max(1,Math.min(u.maxHp,Math.round(u.maxHp*ratio)));
 return `${fromName} → ${u.name}`;
}
export function afterVictory(run,played){
 const cat=catalog(run.universe),changes=[];
 healLiving(run,.25+(run.relics.includes('garden')?.05:0));
 for(const u of run.units){if(!played.includes(u.uid))continue;u.wins++;
  const ratio=u.hp/u.maxHp;u.level=(u.level||1)+1;
  u.attack=Math.round(u.attack*1.1);u.maxHp=Math.round(u.maxHp*1.1);u.speed=Math.round(u.speed*1.1);
  u.hp=Math.max(1,Math.min(u.maxHp,Math.round(u.maxHp*ratio)));
  const evo=tryEvolveSurvival(run,u,cat);
  if(evo)changes.push(`${evo} · évolution`);
  else changes.push(`${u.name} : niveau ${u.level} · +10 %`);
 }
 return changes;
}
export function expandField(run){if(run.slots>=5)return false;run.slots++;return true;}
