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

/** Best unequipped gear for a unit (weapon/armor slots). */
function autoEquipAll(r,{equip,registry}){
  const c=registry(r.worlds,r.statsMode);
  const used=new Set();
  for(const u of r.units){if(u.weapon)used.add(u.weapon);if(u.armor)used.add(u.armor);}
  for(const u of r.units.slice(0,5)){
    const uni=c.byId.get(u.cardId)?.universe;
    for(const slot of['weapon','armor']){
      if(u[slot])continue;
      const want=slot==='armor'?'armure':null;
      const candidates=r.items.filter(it=>{
        if(used.has(it.uid))return false;
        const g=c.byItem.get(it.cardId);
        if(!g||g.universe!==uni||g.category==='consommable')return false;
        if(slot==='armor')return g.category==='armure';
        return g.category==='arme'||g.category==='outil';
      }).sort((a,b)=>{
        const ga=c.byItem.get(a.cardId),gb=c.byItem.get(b.cardId);
        const sa=(ga.atk||0)+(ga.shield||0)+(ga.heal||0),sb=(gb.atk||0)+(gb.shield||0)+(gb.heal||0);
        return sb-sa;
      });
      const best=candidates[0];
      if(best&&equip(r,best.uid,u.uid))used.add(best.uid);
    }
  }
}

/**
 * One autoplay decision. Returns true if an action was taken.
 * helpers: engine fns + mutate wrapper style callbacks.
 */
export function autoStep(r,h){
  if(!r||!isAutoplay())return false;
  if(r.phase==='prestige'||r.phase==='combat'||r.phase==='end')return false;
  const {availableNodes,enterNode,chooseDraft,chooseReward,rest,resolveEvent,buy,buyCare,leaveNode,startCombat,equip,registry}=h;
  if(r.phase==='draft'){
    const offer=(r.offers||[]).find(o=>!o.disabled)||null;
    if(!offer)return false;
    return !!chooseDraft(r,offer.token||offer.id);
  }
  if(r.phase==='map'){
    const ids=availableNodes(r);
    const id=pickRand(ids);
    return id?!!enterNode(r,id):false;
  }
  if(r.phase==='prepare'){
    autoEquipAll(r,{equip,registry});
    return !!startCombat(r);
  }
  if(r.phase==='reward'){
    const rewards=r.rewards||[];
    if(!rewards.length)return false;
    let idx=rewards.findIndex(rw=>rw.type==='recruit');
    if(idx<0||r.units.length>=8)idx=Math.floor(Math.random()*rewards.length);
    return !!chooseReward(r,idx);
  }
  if(r.phase==='rest'){
    return !!rest(r,Math.random()<.5?'heal':'train');
  }
  if(r.phase==='event'){
    const scenes=r.activeEvent?.scenes||[];
    const scene=pickRand(scenes);
    if(!scene)return false;
    return !!resolveEvent(r,scene.id);
  }
  if(r.phase==='shop'){
    if(!r.careBought&&r.coins>=30&&r.units.some(u=>u.hp<u.maxHp)){
      buyCare(r);
      return true;
    }
    const affordable=(r.shop||[]).map((o,i)=>({o,i})).filter(x=>!x.o.bought&&r.coins>=x.o.price);
    if(affordable.length&&Math.random()<.45){
      buy(r,pickRand(affordable).i);
      return true;
    }
    return !!leaveNode(r);
  }
  if(r.phase==='result')return !!leaveNode(r);
  return false;
}
