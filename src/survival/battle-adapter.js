/* Separate round engine. The historical V8 battle.js remains byte-identical.
 * DB effect definitions are read from CARD_MAP through catalog. HXH vague effects
 * use the explicit editorial rules documented in DECISIONS_V9.md. */
import {isRefinedRun} from './economy.js';
import {catalog} from './catalog.js';
import {random,pick} from './random.js';
import {makeDeck,drawCards,removeHero} from './deck.js';
import {makeFighter,equipItem,healTarget,record,gearTrigger,hasPierce,recalcGear,shieldTotal} from './equipment.js';
import {killUnit,afterVictory} from './progression.js';
export function live(list){return list.filter(x=>x.hp>0);}
function effects(run,u,type){return u.charEffects.filter(e=>e.type===type&&!u.used.includes(e.key));}
function use(u,e){u.used.push(e.key);}
const effectInfo=e=>({effectKey:e.key,effectType:e.type,attackName:e.name});
function trigger(run,u,type,fn,extra={}){for(const e of effects(run,u,type)){use(u,e);record(run.combat,'skill',`${u.name} · ${e.name}`,{actor:u.uid,effect:e.type,...effectInfo(e),...extra});fn(e);}}
function own(run,u){return u.side==='player'?run.combat.field:run.combat.enemies;}
function foes(run,u){return live(u.side==='player'?run.combat.enemies:run.combat.field);}
function arm(run,u){u.charEffects=catalog(run.universe).byId.get(u.cardId).effects.map(x=>({...x}));
 trigger(run,u,'atk_buff',e=>{u.baseAttack=Math.round(u.baseAttack*(1+(e.amount||.12)));recalcGear(run,u);});
 trigger(run,u,'shield',e=>u.barriers[e.key]=Math.round(u.maxHp*(e.amount||.18)));
 trigger(run,u,'team_buff',e=>{for(const a of live(own(run,u))){a.baseAttack=Math.round(a.baseAttack*(1+(e.amount||.08)));recalcGear(run,a);}});
 trigger(run,u,'team_shield',e=>{for(const a of live(own(run,u)))a.barriers[e.key]=Math.round(a.maxHp*(e.amount||.1));});
}
export function startCombat(run){
 if(run.phase!=='preview'||!run.pending)return false;
 const field=[],enemies=run.pending.units.map(u=>({...makeFighter(u),side:'enemy'}));
 run.combat={round:1,ready:true,field,enemies,deck:makeDeck(run,run.units.map(x=>x.uid),run.items,3+(run.relics.includes('manual')?1:0)),enemyDeck:makeDeck(run,[],run.pending.items,3),action:1,enemyAction:1,bonus:0,enemyBonus:0,usedGear:[],enemyUsedGear:[],played:[],events:[],normalActions:[],roundEvents:[],scouted:null};
 run.phase='combat';for(const u of enemies)arm(run,u);
 record(run.combat,'start','Pose les personnages de ta main, puis lance le round.');return true;
}
export function deploy(run,id){const c=run.combat;if(run.phase!=='combat'||!c.ready||live(c.field).length>=run.slots)return false;
 const i=c.deck.hand.findIndex(x=>x.type==='hero'&&x.id===id),u=run.units.find(x=>x.uid===id);if(i<0||!u||c.field.some(x=>x.uid===id))return false;
 c.deck.hand.splice(i,1);const f={...makeFighter(u),side:'player'};c.field.push(f);c.played.push(id);arm(run,f);record(c,'deploy',`${u.name} rejoint le terrain`,{actor:id});return true;}
export function syncLiving(run){for(const u of run.combat.field){const p=run.units.find(x=>x.uid===u.uid);if(p&&u.hp>0)p.hp=Math.max(1,Math.min(p.maxHp,Math.round(p.maxHp*u.hp/u.maxHp)));}}
export function knockout(run,u){if(u.hp>0)return;
 // last_stand prevents a KO once; revive is intentionally disabled in this mode.
 const last=effects(run,u,'last_stand')[0];if(last){use(u,last);u.hp=1;record(run.combat,'skill',`${u.name} tient à 1 PV`,{actor:u.uid,...effectInfo(last)});return;}
 u.hp=0;record(run.combat,'ko',`${u.name} : KO définitif`,{target:u.uid});
 if(u.side==='player'){killUnit(run,u.uid);removeHero(run.combat.deck,u.uid);}
}
function dodgeCounter(run,defender,attacker){if(!isRefinedRun(run))return;for(const e of effects(run,defender,'counter').filter(e=>e.trigger==='AFTER_HIT_OR_DODGE')){if(defender.hp<=0||attacker.hp<=0)break;use(defender,e);record(run.combat,'skill',`${defender.name} · ${e.name} après esquive`,{actor:defender.uid,target:attacker.uid,...effectInfo(e)});damage(run,defender,attacker,e.multiplier||.7,{reaction:true,technique:e});}}
function damage(run,a,b,scale=1,{reaction=false,pierce=false,technique=null}={}){
 if(a.hp<=0||b.hp<=0)return;
 const c=run.combat;let dmg=Math.max(1,Math.round(a.attack*.72*scale*a.statuses.filter(x=>x.type==='weaken').reduce((n,s)=>n*(1-s.amount),1)));
 if(!reaction){
  trigger(run,a,'critical',e=>{if(random(run)<(e.chance??.25))dmg=Math.round(dmg*(e.multiplier||1.5));});
  if(gearTrigger(run,b,'evade')){record(c,'evade',`${b.name} esquive le coup`,{actor:b.uid,target:b.uid,effectType:'evade',attackName:c.events.at(-1)?.attackName||'Esquive d’équipement'});dodgeCounter(run,b,a);return;}
  for(const e of effects(run,b,'dodge')){use(b,e);if(random(run)<(e.chance??.2)){record(c,'dodge',`${b.name} · ${e.name} : esquive`,{actor:b.uid,target:b.uid,...effectInfo(e)});dodgeCounter(run,b,a);return;}}
  const guard=live(own(run,b)).find(u=>u!==b&&effects(run,u,'intercept').some(e=>!e.protectName||e.protectName===b.name)&&dmg>=b.hp+shieldTotal(b));
  if(guard){const e=effects(run,guard,'intercept').find(e=>!e.protectName||e.protectName===b.name);use(guard,e);record(c,'guard',`${guard.name} protège ${b.name}`,{actor:guard.uid,target:b.uid,...effectInfo(e)});b=guard;}
 }
 const bypass=pierce||hasPierce(run,a)?Math.ceil(dmg*.5):0;let remaining=dmg-bypass;
 for(const id of Object.keys(b.barriers)){const take=Math.min(b.barriers[id],remaining);b.barriers[id]-=take;remaining-=take;}
 const n=Math.min(b.hp,remaining+bypass);b.hp-=n;
 record(c,reaction?'reaction':'hit',`${a.name} → ${b.name} : −${n} PV${bypass?' · perforation':''}`,{actor:a.uid,target:b.uid,amount:n,...(technique?{effectKey:technique.key,effectType:technique.type,attackName:technique.name}:{})});
 if(b.hp<=0)knockout(run,b);
 if(!reaction&&b.hp>0&&a.hp>0){
  if(gearTrigger(run,b,'counter'))damage(run,b,a,.7,{reaction:true});
  trigger(run,b,'counter',e=>damage(run,b,a,e.multiplier||.7,{reaction:true,technique:e}));
 }
 if(b.hp>0)threshold(run,b);
 if(!reaction&&a.hp>0){
  trigger(run,a,'lifesteal',e=>healTarget(c,a,(n*(e.amount||.2))/a.maxHp,e.name,{actor:a.uid,...effectInfo(e)}));
  trigger(run,a,'dot',e=>{if(b.hp>0&&random(run)<(e.chance??.33))b.statuses.push({type:'dot',ticks:e.duration||2,damage:e.damage||8,actor:a.uid,...effectInfo(e)});});
  trigger(run,a,'weaken',e=>{if(b.hp>0)b.statuses.push({type:'weaken',ticks:e.duration||2,amount:e.amount||.12,actor:a.uid,...effectInfo(e)});});
  trigger(run,a,'stun',()=>{if(b.hp>0)b.stunned=1;});
  if(b.hp>0&&gearTrigger(run,a,'stun'))b.stunned=1;
  for(const e of effects(run,a,'execute'))if(b.hp>0&&b.hp/b.maxHp<=(e.threshold||.32)){use(a,e);damage(run,a,b,e.multiplier||1.4,{reaction:true,technique:e});}
 }
}
function threshold(run,u){for(const e of u.charEffects){if(u.used.includes(e.key)||!['transform','finisher','ultimate','support'].includes(e.type)||u.hp/u.maxHp>(e.threshold||.32))continue;use(u,e);record(run.combat,'skill',`${u.name} · ${e.name} (seuil PV)`,{actor:u.uid,...effectInfo(e)});
 if(e.type==='transform'){u.baseAttack=Math.round(u.baseAttack*(1+(e.atkBuff||.25)));u.speed+=e.speedBuff||8;recalcGear(run,u);}
 else if(e.type==='support'){for(const ally of live(own(run,u)))ally.barriers[e.key]=Math.round(ally.maxHp*.12);}
 else{const target=foes(run,u).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(target)damage(run,u,target,e.multiplier||1.9,{reaction:true,technique:e});}
 }}
export function enemyEquip(run){const c=run.combat;for(const ref of [...c.enemyDeck.hand]){const g=catalog(run.universe).byItem.get(ref.id);if(!g)continue;const candidates=live(c.enemies).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);for(const u of candidates){if(equipItem(run,g.id,u.uid,{side:'enemy'}))break;}}}
export function resolveRound(run){
 const c=run.combat;if(run.phase!=='combat'||!c.ready)return false;
 // Empty fields can wait for the next draw only if a living reserve remains.
 c.roundEvents=[];c.captureRound=run.captureFrames!==false;enemyEquip(run);c.ready=false;
 for(const u of [...live(c.field),...live(c.enemies)]){
  for(const st of u.statuses)if(st.type==='dot'&&u.hp>0){const actual=Math.min(u.hp,st.damage);u.hp=Math.max(0,u.hp-st.damage);record(c,'dot',`${u.name} : −${actual} PV persistants`,{actor:st.actor||null,target:u.uid,amount:actual,effectType:'dot',effectKey:st.effectKey,attackName:st.attackName||'Dégâts persistants'});if(!u.hp)knockout(run,u);}
  if(u.hp>0&&u.hp<u.maxHp)trigger(run,u,'regen',e=>healTarget(c,u,e.amount||.08,e.name,{actor:u.uid,...effectInfo(e)}));
 }
 const order=[...live(c.field),...live(c.enemies)].sort((a,b)=>b.speed-a.speed||(a.uid<b.uid?-1:1));c.normalActions=[];
 record(c,'order',`Initiative : ${order.map(x=>x.name).join(' → ')}`);
 for(const a of order){if(a.hp<=0||!foes(run,a).length)continue;
  if(a.stunned){a.stunned=0;record(c,'stun',`${a.name} perd cette action`,{actor:a.uid});continue;}
  for(const type of ['heal_ally','heal'])for(const e of effects(run,a,type)){const t=live(own(run,a)).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(t&&t.hp<t.maxHp){use(a,e);healTarget(c,t,e.amount||.16,e.name,{actor:a.uid,...effectInfo(e)});}}
  const focus=effects(run,a,'focus')[0],targets=foes(run,a),target=focus?targets.sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0]:pick(run,targets);if(focus)use(a,focus);
  a.actions++;c.normalActions.push({uid:a.uid,speed:a.speed});record(c,'attack',`${a.name} attaque ${target.name}`,{actor:a.uid,target:target.uid});damage(run,a,target);
  if(a.hp<=0)continue;
  if(c.round>=2)trigger(run,a,'extra_strike',e=>{const t=foes(run,a)[0];if(t)damage(run,a,t,e.multiplier||.7,{reaction:true,technique:e});});
  trigger(run,a,'blast',e=>{const t=foes(run,a)[0];if(t)damage(run,a,t,.65,{reaction:true,technique:e});});
  if(c.round>=3)trigger(run,a,'aoe',e=>{for(const t of [...foes(run,a)])damage(run,a,t,e.multiplier||.6,{reaction:true,technique:e});});
 }
 for(const u of [...c.field,...c.enemies])u.statuses=u.statuses.map(s=>({...s,ticks:s.ticks-1})).filter(s=>s.ticks>0);
 c.captureRound=false;syncLiving(run);
 if(!run.units.length){run.phase='end';run.endReason='Tous les combattants sont KO';}
 else if(!live(c.enemies).length){run.phase='reward';run.victories++;run.lastCombatIncome=6+2*run.wave;run.coins+=run.lastCombatIncome;run.levelChanges=afterVictory(run,c.played);run.history.push({type:'win',wave:run.wave,rounds:c.round,kind:run.pending.kind,alive:run.units.length});}
 else{c.round++;c.action=1;c.enemyAction=1;c.bonus=0;c.enemyBonus=0;c.ready=true;c.field=live(c.field);drawCards(c.deck,1+(run.relics.includes('reader')?1:0));drawCards(c.enemyDeck,1);record(c,'draw',`Round ${c.round} : pioche ${run.relics.includes('reader')?2:1}`);}
 return true;
}
