import {catalog,itemText} from './catalog.js';
import {bonusDraw} from './deck.js';
export function record(combat,type,message,extra={}){const event={type,message,round:combat.round,...extra};combat.events.push(event);if(combat.captureRound)combat.roundEvents.push({...event,units:[...combat.enemies,...combat.field].map(u=>({uid:u.uid,cardId:u.cardId,name:u.name,side:u.side,hp:u.hp,maxHp:u.maxHp,attack:u.attack,speed:u.speed,level:u.level,weapon:u.weapon,armor:u.armor,barriers:{...u.barriers},statuses:u.statuses.map(x=>({...x})),stunned:u.stunned,gearUsed:[...u.gearUsed],used:[...u.used]}))});if(combat.events.length>300)combat.events.shift();}
export function healTarget(c,u,pct,name,extra={}){if(!u||u.hp<=0)return 0;const n=Math.max(0,Math.min(u.maxHp-u.hp,Math.round(u.maxHp*pct)));u.hp+=n;record(c,'heal',`${name} → ${u.name} : +${n} PV`,{target:u.uid,amount:n,...extra});return n;}
export function shieldTotal(u){return Object.values(u.barriers).reduce((s,n)=>s+n,0);}
export function makeFighter(u){return {...u,baseAttack:u.attack,baseMax:u.maxHp,weapon:null,armor:null,barriers:{},used:[],gearUsed:[],statuses:[],stunned:0,actions:0,potionAtk:0,consumableFlags:[],charEffects:[]};}
export function equipReason(run,g,u,side='player',replace=false){
 const c=run.combat;if(!c||run.phase!=='combat'||!c.ready)return 'Attends la préparation du round';
 if(!g?.allowed||g.universe!==run.universe)return 'Objet incompatible';
 if(!u||u.hp<=0)return 'Choisis un combattant vivant';
 const used=side==='player'?c.usedGear:c.enemyUsedGear,action=side==='player'?c.action:c.enemyAction;
 if(used.includes(side==='player'?g.id:g.id+':'+u.uid))return 'Déjà activé dans ce combat';
 if(g.cost>action)return 'Action d’équipement utilisée pour ce round';
 const slot=g.category==='armure'?'armor':'weapon';
 if(g.category!=='consommable'&&u[slot]&&!replace)return 'Remplacement à confirmer';
 if(g.effect==='heal'&&u.hp>=u.maxHp)return 'Ce combattant a déjà tous ses PV';
 const deck=side==='player'?c.deck:c.enemyDeck;
 if(['draw','scout'].includes(g.effect)&&(!deck.pile.length||(side==='player'?c.bonus:c.enemyBonus)>=2))return 'Pioche indisponible ou bonus du round atteint';
 return '';
}
export function recalcGear(run,u){
 const cat=catalog(run.universe),gs=[u.weapon,u.armor].map(id=>cat.byItem.get(id)).filter(Boolean),ratio=u.hp/u.maxHp;
 u.attack=Math.max(1,Math.round(u.baseAttack*(1+u.potionAtk+gs.reduce((n,g)=>n+g.atk/100,0))));
 u.maxHp=Math.max(1,Math.round(u.baseMax*(1+gs.filter(g=>g.effect==='hp').reduce((n,g)=>n+g.shield/100,0))));
 u.hp=Math.min(u.maxHp,Math.max(u.hp>0?1:0,Math.round(u.maxHp*ratio)));
}
export function equipItem(run,id,uid,{side='player',replace=false}={}){
 const c=run.combat,cat=catalog(run.universe),g=cat.byItem.get(id),u=(side==='player'?c?.field:c?.enemies)?.find(x=>x.uid===uid),deck=side==='player'?c?.deck:c?.enemyDeck;
 if(!deck?.hand.some(x=>x.type==='gear'&&x.id===id))return false;
 if(equipReason(run,g,u,side,replace))return false;
 const slot=g.category==='armure'?'armor':'weapon',consumable=g.category==='consommable';
 if(!consumable){const old=u[slot];if(old){delete u.barriers[old];record(c,'swap',`${u.name} échange ${cat.byItem.get(old).name} contre ${g.name}`);}u[slot]=id;}
 else {if(g.atk)u.potionAtk+=g.atk/100;if(['evade','counter','stun'].includes(g.effect))u.consumableFlags.push({id:g.id,effect:g.effect});if(side==='player')run.items=run.items.filter(x=>x!==id);}
 (side==='player'?c.usedGear:c.enemyUsedGear).push(side==='player'?id:id+':'+u.uid);
 if(side==='player')c.action-=g.cost;else c.enemyAction-=g.cost;
 deck.hand.splice(deck.hand.findIndex(x=>x.type==='gear'&&x.id===id),1);deck.discard.push({type:'gear',id});
 recalcGear(run,u);
 if(g.shield&&g.effect!=='hp')u.barriers[id]=Math.round(u.maxHp*g.shield/100);
 if(g.heal)healTarget(c,u,g.heal/100,g.name,{effectType:'heal',attackName:g.name,itemId:id});
 if(g.draw)bonusDraw(c,deck,g.draw);
 if(g.effect==='scout')c[side==='player'?'scouted':'enemyScouted']=deck.pile[0]||null;
 record(c,g.effect,`${g.name} → ${u.name} · ${itemText(g)}`,{target:u.uid,itemId:id,effectType:g.effect,attackName:g.name});return true;
}
export function gearTrigger(run,u,effect){
 const cat=catalog(run.universe),g=[u.weapon,u.armor].map(id=>cat.byItem.get(id)).find(g=>g?.effect===effect&&!u.gearUsed.includes(g.id));
 const flag=u.consumableFlags.find(g=>g.effect===effect&&!u.gearUsed.includes(g.id));
 const result=g||flag;if(result){u.gearUsed.push(result.id);record(run.combat,effect,`${u.name} : ${g?.name||cat.byItem.get(flag.id)?.name} · ${effect}`,{actor:u.uid,itemId:result.id,effectType:effect,attackName:g?.name||cat.byItem.get(flag.id)?.name});}return !!result;
}
export function hasPierce(run,u){return [u.weapon,u.armor].some(id=>catalog(run.universe).byItem.get(id)?.effect==='pierce');}
export function previewEquipment(run,g,u){const next=structuredClone(u),slot=g.category==='armure'?'armor':'weapon';if(g.category==='consommable')next.potionAtk+=g.atk/100;else{if(next[slot])delete next.barriers[next[slot]];next[slot]=g.id;}recalcGear(run,next);if(g.shield&&g.effect!=='hp')next.barriers[g.id]=Math.round(next.maxHp*g.shield/100);if(g.heal)next.hp=Math.min(next.maxHp,next.hp+Math.round(next.maxHp*g.heal/100));return next;}
