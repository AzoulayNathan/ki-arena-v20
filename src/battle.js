/* KI ARENA — moteur de combat V2. Un seul déclenchement par effet et par combat.
 * Tous les combattants vivants jouent au maximum une action normale par round ;
 * leurs techniques ponctuelles peuvent provoquer un impact supplémentaire.
 * 100% déterministe à paramètres / seed égaux. Ne dépend pas du DOM.
 */
import {CARD_MAP} from './catalog.js';
export function seededRandom(seed){
 let h=2166136261; for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
 return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function selectRandom(items,rng){return items[Math.floor(rng()*items.length)];}
export function resolveCards(cards){return cards.map(c=>typeof c==='string'?CARD_MAP.get(c):c).filter(Boolean);}
export function runBattle(teamA,teamB,{seed='ki-v2',rules='canon',maxRounds=16,difficultyA=1,difficultyB=1,hpRatiosA=null,modifiersA=null,teamBonusA=null,teamBonusB=null,bossPhases=false}={}){
 const rng=seededRandom(seed),A=resolveCards(teamA),B=resolveCards(teamB),events=[];
 if(!A.length||!B.length||A.length>64||B.length>64)throw Error('Équipe invalide : de 1 à 64 cartes (limite de sécurité technique)');
 let round=0,bossRaged=false;
 const compression=(val,base,mul)=>rules==='canon'?val:Math.round(base+(val-base)*mul);
 const make=(team,code,diff)=>team.map((c,i)=>({uid:`${code}-${i}`,team:code,index:i,cardId:c.id,name:c.name,form:c.form,rarity:c.rarity,
  maxHp:Math.round(compression(c.maxHp,280,.78)*diff),hp:Math.round(compression(c.maxHp,280,.78)*diff),
  atk:Math.round(compression(c.attack,64,.75)*diff),speed:compression(c.speed,66,.78),shield:0,
  effects:c.effects||[],used:new Set(),alive:true,actions:0,statuses:[],stunned:0,damageDone:0,healingDone:0}));
 const fighters=[...make(A,'A',difficultyA),...make(B,'B',difficultyB)];
 // Roguelike: persistence HP and equip effects are injected into battle, never into the global card catalog.
 fighters.forEach(f=>{
  const i=f.index; const gear=f.team==='A'?(modifiersA?.[i]||{}):{}, relic=(f.team==='A'?teamBonusA:teamBonusB)||{};
  f.maxHp=Math.max(1,Math.round(f.maxHp*(1+(gear.hpPct||0)+(relic.hpPct||0))));
  f.atk=Math.max(1,Math.round(f.atk*(1+(gear.atkPct||0)+(relic.atkPct||0))));
  f.speed+=Math.round((gear.speed||0)+(relic.speed||0));
  f.shield+=Math.round(f.maxHp*(gear.shieldPct||0));
  if(f.team==='A')f.hp=Math.max(1,Math.round(f.maxHp*Math.min(1,Math.max(.01,hpRatiosA?.[i]??1))));
 });
 const active=team=>fighters.filter(f=>f.team===team&&f.alive);
 const allies=f=>active(f.team), foes=f=>active(f.team==='A'?'B':'A');
 const unused=(f,type)=>f.effects.filter(e=>e.type===type&&!f.used.has(e.key));
 const consume=(f,e)=>{f.used.add(e.key);};
 const snap=()=>fighters.map(f=>({uid:f.uid,team:f.team,cardId:f.cardId,name:f.name,form:f.form,hp:f.hp,maxHp:f.maxHp,shield:f.shield,alive:f.alive,atk:f.atk,speed:f.speed,used:[...f.used]}));
 function emit(type,message,actor=null,target=null,extra={}){if(events.length<1100)events.push({type,round,message,actor:actor?.uid??null,target:target?.uid??null,units:snap(),...extra});}
 function heal(f,n,e,source=f){if(!f?.alive)return;const amt=Math.max(0,Math.min(f.maxHp-f.hp,Math.round(n)));if(amt){f.hp+=amt;source.healingDone+=amt;emit('heal',`${source.name} · ${e.name} : +${amt} PV`,source,f,{effect:e.key});}}
 function ko(t,attacker){
  for(const e of unused(t,'last_stand')){consume(t,e);t.hp=1;emit('revive',`${t.name} · ${e.name} : tient à 1 PV !`,t,t,{effect:e.key});return;}
  for(const e of unused(t,'revive')){consume(t,e);t.hp=Math.max(1,Math.round(t.maxHp*(e.amount||.2)));emit('revive',`${t.name} · ${e.name} : revient au combat !`,t,t,{effect:e.key});return;}
  t.hp=0;t.alive=false;emit('ko',`${t.name} est K.O.`,attacker||t,t);
 }
 function impact(actor,target,scale=1,{reaction=false,ability=null}={}){
  if(!actor.alive||!target?.alive)return 0;
  let defender=target;
  const weaken=actor.statuses.filter(s=>s.type==='weaken').reduce((v,s)=>v*(1-s.amount),1);
  let dmg=Math.max(8,Math.round(actor.atk*weaken*.72*(rules==='canon'?1:.84)*scale));
  if(!reaction){
   for(const e of unused(actor,'critical')){consume(actor,e);if(rng()<(e.chance??.25)){dmg=Math.round(dmg*(e.multiplier||1.5));emit('skill',`${actor.name} · ${e.name}`,actor,defender,{effect:e.key});}}
   for(const guardian of allies(defender).filter(x=>x!==defender)){
    const e=unused(guardian,'intercept').find(x=>!x.protectName||defender.name===x.protectName);
    if(e&&dmg>=defender.hp+defender.shield){consume(guardian,e);emit('guard',`${guardian.name} protège ${defender.name} !`,guardian,defender,{effect:e.key});defender=guardian;break;}
   }
   for(const e of unused(defender,'dodge')){
    consume(defender,e);
    if(rng()<(e.chance??.2)){
     emit('dodge',`${defender.name} · ${e.name} : esquive !`,defender,actor,{effect:e.key});
     const c=unused(defender,'counter')[0];if(c&&actor.alive){consume(defender,c);emit('skill',`${defender.name} · ${c.name} !`,defender,actor,{effect:c.key});impact(defender,actor,c.multiplier||.7,{reaction:true,ability:c});}
     return 0;
    }
   }
  }
  const absorbed=Math.min(defender.shield,dmg);defender.shield-=absorbed;
  const taken=Math.min(defender.hp,Math.max(0,dmg-absorbed));defender.hp-=taken;actor.damageDone+=taken;
  emit(ability?'skill_hit':reaction?'counter_hit':'hit',`${actor.name} → ${defender.name} −${taken} PV`,actor,defender,{damage:taken,effect:ability?.key||null});
  if(defender.hp<=0)ko(defender,actor);
  // Boss en deux phases : l'éveil n'est déclenché qu'une fois, au seuil 50 %.
  if(bossPhases&&!bossRaged&&defender.team==='B'&&((defender.hp/defender.maxHp)<=.5||active('B').length<=Math.ceil(B.length/2))&&active('B').length){
   bossRaged=true;for(const unit of active('B')){unit.atk=Math.round(unit.atk*1.28);unit.speed+=15;unit.shield+=Math.round(unit.maxHp*.12);}
   emit('phase','BOSS · PHASE 2 : ÉVEIL ET PUISSANCE DÉCHAÎNÉE',defender,defender,{phase:2});
  }
  // Riposte défensive : peut se déclencher à la première frappe reçue, même sans esquive.
  // Jamais de chaîne infinie : les coups en réaction ne déclenchent pas d'autres ripostes.
  if(!reaction&&defender.alive&&actor.alive){
   const e=unused(defender,'counter')[0];
   if(e){consume(defender,e);emit('skill',`${defender.name} · ${e.name} : riposte !`,defender,actor,{effect:e.key});impact(defender,actor,e.multiplier||.7,{reaction:true,ability:e});}
  }
  if(defender.alive)threshold(defender);
  if(!reaction&&actor.alive){
   for(const e of unused(actor,'lifesteal')){consume(actor,e);heal(actor,taken*(e.amount||.2),e);}
   for(const e of unused(actor,'dot')){consume(actor,e);if(defender.alive&&rng()<(e.chance??.33)){defender.statuses.push({type:'dot',ticks:e.duration||2,damage:e.damage||8});emit('status',`${actor.name} · ${e.name} : dégâts persistants`,actor,defender,{effect:e.key});}}
   for(const e of unused(actor,'weaken')){consume(actor,e);if(defender.alive){defender.statuses.push({type:'weaken',ticks:e.duration||2,amount:e.amount||.12});emit('status',`${actor.name} · ${e.name} : affaiblissement`,actor,defender,{effect:e.key});}}
   for(const e of unused(actor,'stun')){consume(actor,e);if(defender.alive){defender.stunned=Math.min(1,defender.stunned+1);emit('status',`${actor.name} · ${e.name} : interruption`,actor,defender,{effect:e.key});}}
   for(const e of unused(actor,'execute'))if(defender.alive&&defender.hp/defender.maxHp<=(e.threshold||.32)){consume(actor,e);emit('skill',`${actor.name} · ${e.name} !`,actor,defender,{effect:e.key});impact(actor,defender,e.multiplier||1.4,{reaction:true,ability:e});}
  }
  return taken;
 }
 function threshold(f){
  // Déclenchement uniquement en dessous du seuil. Les réactions de seuil sont à usage unique.
  for(const e of f.effects){if(f.used.has(e.key)||!['transform','finisher','sacrifice'].includes(e.type))continue;
   if(f.hp/f.maxHp>(e.threshold||.32))continue;
   consume(f,e);
   if(e.type==='transform'){f.atk=Math.round(f.atk*(1+(e.atkBuff||.25)));f.speed+=(e.speedBuff||8);emit('ultimate',`${f.name} · ${e.name} : transformation !`,f,f,{effect:e.key});}
   else if(e.type==='finisher'){
    const t=[...foes(f)].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(t){emit('ultimate',`${f.name} · ${e.name} !`,f,t,{effect:e.key});impact(f,t,e.multiplier||1.9,{reaction:true,ability:e});}
   }else if(e.type==='sacrifice'){
    emit('ultimate',`${f.name} · ${e.name} : explosion finale !`,f,null,{effect:e.key});
    for(const t of [...foes(f)])impact(f,t,e.multiplier||1.1,{reaction:true,ability:e});
    if(f.alive){f.hp=0;f.alive=false;emit('ko',`${f.name} se sacrifie`,f,f);}
   }
  }
 }
 // Passifs déclenchés avant le tout premier round, exactement une fois.
 for(const f of fighters){for(const e of f.effects){if(f.used.has(e.key))continue;
  if(e.type==='atk_buff'){consume(f,e);f.atk=Math.round(f.atk*(1+(e.amount||.12)));emit('buff',`${f.name} · ${e.name}`,f,f,{effect:e.key});}
  if(e.type==='shield'){consume(f,e);f.shield+=Math.round(f.maxHp*(e.amount||.18));emit('shield',`${f.name} · ${e.name}`,f,f,{effect:e.key});}
  if(e.type==='team_buff'){consume(f,e);for(const t of allies(f))t.atk=Math.round(t.atk*(1+(e.amount||.08)));emit('buff',`${f.name} · ${e.name} : équipe renforcée`,f,null,{effect:e.key});}
  if(e.type==='team_shield'){consume(f,e);for(const t of allies(f))t.shield+=Math.round(t.maxHp*(e.amount||.1));emit('shield',`${f.name} · ${e.name} : équipe protégée`,f,null,{effect:e.key});}
 }}
 const roundsLimit=Math.max(1,Math.min(30,maxRounds));
 for(round=1;round<=roundsLimit;round++){
  emit('round',`ROUND ${round}`);
  for(const f of fighters){if(!f.alive)continue;
   for(const st of [...f.statuses])if(st.type==='dot'){
    f.hp=Math.max(0,f.hp-st.damage);emit('dot',`${f.name} : −${st.damage} PV`,f,f);if(f.hp===0){ko(f,null);break;}
   }
   if(f.alive&&f.hp<f.maxHp)for(const e of unused(f,'regen')){consume(f,e);heal(f,f.maxHp*(e.amount||.08),e);}
  }
  if(!active('A').length||!active('B').length)break;
  // Vitesse calculée au départ de chaque round. Une seule attaque normale par unité survivante.
  const order=fighters.filter(f=>f.alive).sort((x,y)=>y.speed-x.speed||x.uid.localeCompare(y.uid));
  emit('order',`Ordre de vitesse : ${order.map(f=>f.name).join(' · ')}`,null,null,{order:order.map(x=>x.uid)});
  for(const f of order){if(!f.alive||!foes(f).length)continue;
   if(f.stunned){f.stunned=0;emit('skip',`${f.name} perd son tour !`,f);continue;}
   f.actions++;
   {for(const e of unused(f,'heal_ally')){const t=[...allies(f)].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(t&&t.hp<t.maxHp){consume(f,e);heal(t,t.maxHp*(e.amount||.16),e,f);}}}
   const targets=foes(f),weak=[...targets].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];
   const pinned=targets.find(x=>x.statuses.some(st=>st.type==='taunt'));
   const focus=f.effects.find(e=>e.type==='focus'&&!f.used.has(e.key));
   const target=pinned||(focus?(f.used.add(focus.key),weak):selectRandom(targets,rng));
   emit('attack',`${f.name} attaque ${target.name}`,f,target);
   // Effets standards après l'attaque : entièrement automatiques, usage unique.
   impact(f,target,1);
   if(!f.alive||!foes(f).length)continue;
   for(const e of unused(f,'extra_strike')){
    if(round<2)continue;consume(f,e);const t=target.alive?target:[...foes(f)][0];
    if(t){emit('skill',`${f.name} · ${e.name} !`,f,t,{effect:e.key});impact(f,t,e.multiplier||.7,{reaction:true,ability:e});}
   }
   for(const e of unused(f,'aoe')){
    if(round<3)continue;consume(f,e);emit('ultimate',`${f.name} · ${e.name} : attaque de zone !`,f,null,{effect:e.key});
    for(const t of [...foes(f)])impact(f,t,e.multiplier||.6,{reaction:true,ability:e});
   }
   if(!active('A').length||!active('B').length)break;
  }
  for(const f of fighters)f.statuses=f.statuses.map(s=>({...s,ticks:s.ticks-1})).filter(s=>s.ticks>0);
  if(!active('A').length||!active('B').length)break;
 }
 const hpRate=side=>fighters.filter(f=>f.team===side).reduce((sum,f)=>sum+f.hp/f.maxHp,0);
 let winner=active('A').length&&!active('B').length?'A':active('B').length&&!active('A').length?'B':null;
 if(!winner){const diff=hpRate('A')-hpRate('B');winner=Math.abs(diff)>.00001?(diff>0?'A':'B'):'draw';}
 emit('result',winner==='draw'?'Égalité':winner==='A'?'Victoire de l’équipe A !':'Victoire de l’équipe B !',null,null,{winner});
 return {seed:String(seed),rules,rounds:Math.min(round,roundsLimit),winner,events,final:snap(),stats:fighters.map(f=>({uid:f.uid,cardId:f.cardId,damage:f.damageDone,healing:f.healingDone,ko:!f.alive,usedEffects:[...f.used]}))};
}
