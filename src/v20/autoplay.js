const power=u=>(u?.attack||0)+(u?.maxHp||0)+(u?.speed||0);
import {int as liveInt} from '../v22/random.js';
const KEY='kiarena:v20:autoplay';

export function isAutoplay(){
  try{return localStorage.getItem(KEY)==='1';}catch{return false;}
}
export function setAutoplay(on){
  try{localStorage.setItem(KEY,on?'1':'0');}catch{}
  return !!on;
}

function pickRand(arr){
  if(!arr?.length)return null;
  return arr[Math.floor(Math.random()*arr.length)];
}

/** Random unequipped gear for a unit (weapon/armor slots). */
function autoEquipAll(r,{equip,registry}){
  const c=registry(r.worlds,r.statsMode);
  if(r.contentVersion==='22.0.0')for(const u of r.units){u.weapon=null;u.armor=null;}
  const used=new Set();
  for(const u of r.units){if(u.weapon)used.add(u.weapon);if(u.armor)used.add(u.armor);}
  for(const u of r.units.slice(0,5)){
    const uni=c.byId.get(u.cardId)?.universe;
    for(const slot of['weapon','armor']){
      if(u[slot])continue;
      const candidates=r.items.filter(it=>{
        if(used.has(it.uid))return false;
        const g=c.byItem.get(it.cardId);
        if(!g||g.universe!==uni||g.category==='consommable')return false;
        if(slot==='armor')return g.category==='armure';
        return g.category==='arme'||g.category==='outil';
      });
      const pick=pickRand(candidates);
      if(pick&&equip(r,pick.uid,u.uid))used.add(pick.uid);
    }
  }
}

/**
 * One autoplay decision. Returns true if an action was taken.
 * helpers: engine fns + mutate wrapper style callbacks.
 */
export function autoStep(r,h){
  if(!r||!isAutoplay())return false;
  // Auto = après le recrutement uniquement (jamais draft/roster/prestige).
  if(['prestige','combat','end','draft','roster'].includes(r.phase))return false;
  const {availableNodes,enterNode,chooseReward,rest,resolveEvent,buy,buyCare,leaveNode,startCombat,equip,registry}=h;
  if(r.phase==='map'){
    const ids=availableNodes(r);
    const id=pickRand(ids);
    return id?!!enterNode(r,id):false;
  }
  if(r.phase==='prepare'){
    // Équipe active aléatoire + équipement aléatoire.
    if(r.units.length>1){
      const shuffled=[...r.units];
      for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
      r.units=shuffled;
    }
    autoEquipAll(r,{equip,registry});
    return !!startCombat(r);
  }
  if((r.phase==='reward'||r.phase==='act-boon')&&r.contentVersion==='22.0.0'){
    const choices=r.rewards.map((x,i)=>({x,i})).filter(({x,i})=>!x.disabled&&(r.rewardLockedIndex==null||r.rewardLockedIndex===i));
    // Prefer full heal at act start when wounded, else any legal pick.
    const prefer=r.phase==='act-boon'?choices.find(({x})=>x.type==='heal'&&!x.disabled):null;
    const pick=prefer||(choices.length?choices[liveInt(r,0,choices.length-1)]:null);
    return pick?!!chooseReward(r,pick.i,null,pick.x.claimToken||null):false;
  }
  if(r.phase==='reward'){
    const rewards=r.rewards||[];
    if(!rewards.length)return false;
    const idx=Math.floor(Math.random()*rewards.length);
    return !!chooseReward(r,idx);
  }
  if(r.phase==='rest'){
    return !!rest(r,Math.random()<.5?'heal':'train');
  }
  if(r.phase==='event'){
    const scenes=r.activeEvent?.scenes||[];
    const scene=pickRand(scenes.filter(s=>!h.eventOption||h.eventOption(r,s.id).ok));
    if(!scene)return false;
    return !!resolveEvent(r,scene.id);
  }
  if(r.phase==='shop'&&r.contentVersion==='22.0.0'){
    const c=registry(r.worlds,r.statsMode),weak=Math.min(...r.units.slice(0,5).map(power));
    const upgrade=r.shop.map((o,i)=>({o,i})).filter(({o})=>!o.disabled&&!o.bought&&o.kind==='hero'&&r.coins>=o.price&&(r.units.length<5||power(c.byId.get(o.id))*(o.finish==='gold'?1.1:1)>weak*1.15)).sort((a,b)=>power(c.byId.get(b.o.id))-power(c.byId.get(a.o.id)))[0];
    if(upgrade)return !!buy(r,upgrade.i,null);
    const gear=r.shop.map((o,i)=>({o,i})).find(({o})=>!o.disabled&&!o.bought&&(o.kind==='weapon'||o.kind==='object')&&r.coins>=o.price);
    if(gear)return !!buy(r,gear.i);
    return !!leaveNode(r);
  }
  if(r.phase==='shop'){
    const affordable=(r.shop||[]).map((o,i)=>({o,i})).filter(x=>!x.o.bought&&r.coins>=x.o.price&&!x.o.disabled);
    if(affordable.length&&Math.random()<.45){
      buy(r,pickRand(affordable).i);
      return true;
    }
    return !!leaveNode(r);
  }
  if(r.phase==='result')return !!leaveNode(r);
  return false;
}
