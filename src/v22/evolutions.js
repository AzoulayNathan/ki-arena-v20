import {registry} from '../v20/catalog.js';
import {EVOLUTION_MAP} from './evolution-map.js';

function bareId(cardId){
 const s=String(cardId||'');
 const i=s.indexOf(':');
 return i>=0?s.slice(i+1):s;
}
function power(h){return (h?.attack||0)+(h?.maxHp||0)+(h?.speed||0);}

/** Level-up every win played (+10% ATQ/PV/VIT), then try mapped evolution. */
export function applyCombatProgression22(r,played){
 const c=registry(r.worlds,r.statsMode);
 const levelUps=[],evolutions=[];
 for(const uid of played){
  const u=r.units.find(x=>x.uid===uid);
  if(!u)continue;
  u.wins=(u.wins||0)+1;
  const ratio=u.hp>0&&u.maxHp?u.hp/u.maxHp:1;
  u.level=(u.level||1)+1;
  u.attack=Math.round(u.attack*1.1);
  u.maxHp=Math.round(u.maxHp*1.1);
  u.speed=Math.round(u.speed*1.1);
  u.hp=Math.max(1,Math.min(u.maxHp,Math.round(u.maxHp*ratio)));
  levelUps.push({uid:u.uid,cardId:u.cardId,name:u.name||c.byId.get(u.cardId)?.name||u.cardId,level:u.level});
  const evo=tryEvolveUnit(r,u,c);
  if(evo)evolutions.push(evo);
 }
 r.levelUps=levelUps;
 r.evolutions=evolutions;
 return {levelUps,evolutions};
}

export function tryEvolveUnit(r,u,c=registry(r.worlds,r.statsMode)){
 const bare=bareId(u.cardId);
 const edge=EVOLUTION_MAP[bare];
 if(edge==null)return null; // ceiling or unknown — keep leveling
 if(!edge?.to||(u.level||1)<(edge.levelRequired||2))return null;
 const hero=c.byId.get(u.cardId);
 if(!hero)return null;
 const targetId=hero.universe+':'+edge.to;
 const target=c.byId.get(targetId);
 if(!target)return null;
 if(power(target)<=power(hero))return null;
 if(target.person!==hero.person){
  const taken=[...r.units,...(r.dead||[])].some(x=>x.uid!==u.uid&&c.byId.get(x.cardId)?.person===target.person);
  if(taken)return null;
 }
 const from={cardId:u.cardId,name:u.name||hero.name,level:u.level};
 const finish=u.finish||'black';
 const ratio=u.hp>0&&u.maxHp?u.hp/u.maxHp:1;
 u.cardId=target.id;
 u.name=target.name;
 u.person=target.person;
 u.attack=target.attack;
 u.maxHp=target.maxHp;
 u.speed=target.speed;
 u.level=1;
 u.wins=0;
 u.finish=finish;
 u.hp=Math.max(1,Math.min(u.maxHp,Math.round(u.maxHp*ratio)));
 return {uid:u.uid,from:from.cardId,fromName:from.name,to:target.id,toName:target.name,finish};
}
