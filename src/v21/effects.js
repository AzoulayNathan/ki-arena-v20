/** Gameplay adaptations; source catalog, identities and raw stats stay intact. */
export const COMBAT_VERSION='21.0.0';
export const EFFECT_TYPES=new Set(['shield','heal_ally','dodge','critical','dot','extra_strike','execute','stun','atk_buff','weaken','counter','intercept','regen','lifesteal','team_buff','transform','aoe','revive','finisher','last_stand','team_shield','focus','sacrifice','gear_pierce','haste','cleanse']);
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const profiles=[
 [/chopper|sakura|tsunade/,'heal_ally','Appui médical',{amount:.18,every:2,cycle:'action'}],
 [/marco/,'regen','Flamme réparatrice',{amount:.12,every:3,cycle:'round'}],
 [/gaara|bartolomeo|jinbe/,'shield','Rempart',{amount:.22,every:3,cycle:'round'}],
 [/shikamaru|doflamingo|killua/,'stun','Ouverture tactique',{every:3,cycle:'action'}],
 [/usopp|tenten|nami/,'focus','Tir précis',{every:1,cycle:'action'}],
 [/kakashi|zoro|sanji|hisoka/,'counter','Riposte',{multiplier:.7,every:1,cycle:'round'}],
 [/luffy|naruto|netero/,'extra_strike','Enchaînement',{multiplier:.7,every:2,cycle:'action'}],
 [/sasuke|hinata/,'critical','Frappe précise',{chance:.3,multiplier:1.65,every:1,cycle:'action'}]
];
export function combatEffects(card){
 return (card.effects||[]).map((original,i)=>{
  let e={...original,key:original.key||card.id+':effect:'+i};
  if(e.type==='blast')e={...e,type:'extra_strike',name:'Enchaînement',multiplier:.75,every:3,cycle:'action',editorial:true};
  if(e.type==='support')e={...e,type:'team_shield',name:'Couverture',amount:.07,every:3,cycle:'action',editorial:true};
  if(e.type==='heal')e={...e,type:'heal_ally',name:'Soutien',amount:.16,every:3,cycle:'action',editorial:true};
  if(e.type==='ultimate')e={...e,type:'aoe',name:'Technique de zone',multiplier:.5,every:4,minRound:3,cycle:'action',editorial:true};
  if(i===0&&card.universe!=='DB'){const p=profiles.find(([pattern])=>pattern.test(clean(card.name)));if(p)e={...e,type:p[1],name:p[2]+' · adaptation de jeu',...p[3],editorial:true};}
  if(!EFFECT_TYPES.has(e.type))throw Error('Effet V21 inconnu : '+e.type+' ('+card.id+')');
  if(!e.cycle){
   if(['critical','focus'].includes(e.type))Object.assign(e,{cycle:'action',every:1});
   else if(['counter','dodge'].includes(e.type))Object.assign(e,{cycle:'round',every:1});
   else if(['heal_ally','lifesteal','extra_strike'].includes(e.type))Object.assign(e,{cycle:'action',every:Math.max(2,e.every||3)});
   else if(e.type==='regen')Object.assign(e,{cycle:'round',every:3});
  }
  e.description=describeEffect(e);return e;
 });
}
export function describeEffect(e){
 const pct=n=>Math.round((n||0)*100),n=e.every||1,period=e.cycle==='round'?'rounds':'actions';
 const suffix=e.cycle?(n===1?(e.cycle==='round'?' · une fois par round':' · à chaque action'):' · toutes les '+n+' '+period):' · une fois par combat';
 return ({shield:'Bouclier : '+pct(e.amount??.18)+' % des PV max',team_shield:'Protège chaque allié : '+pct(e.amount??.1)+' % de ses PV',heal_ally:'Soigne l’allié le plus blessé : '+pct(e.amount??.16)+' % de ses PV max',regen:'Récupère '+pct(e.amount??.08)+' % de ses PV max',critical:pct(e.chance??.25)+' % de chance de dégâts ×'+(e.multiplier||1.5),extra_strike:'Une frappe supplémentaire ×'+(e.multiplier||.7),counter:'Riposte au premier coup du round ×'+(e.multiplier||.7),dodge:'Tentative d’esquive : '+pct(e.chance??.2)+' %',focus:'Vise la cible au plus faible ratio de PV',stun:'Interrompt une action · protection contre les interruptions en chaîne',aoe:'Frappe les adversaires ×'+(e.multiplier||.6),dot:'Dégâts persistants : '+(e.damage||8)+' pendant '+(e.duration||2)+' applications',weaken:'ATQ de la cible −'+pct(e.amount??.12)+' %',atk_buff:'ATQ +'+pct(e.amount??.12)+' %',team_buff:'ATQ des alliés +'+pct(e.amount??.08)+' %',lifesteal:'Récupère '+pct(e.amount??.2)+' % des dégâts infligés',intercept:'Intercepte un coup fatal destiné à un allié',gear_pierce:'Ignore une partie du bouclier',revive:'Revient avec '+pct(e.amount??.2)+' % de PV',last_stand:'Résiste à un KO avec 1 PV',transform:'Éveil sous le seuil de PV',finisher:'Technique de dernier souffle',execute:'Frappe renforcée contre une cible blessée',sacrifice:'Frappe de zone et sacrifice',haste:'VIT +'+pct(e.amount??.12)+' %',cleanse:'Dissipe les malus d’un allié'})[e.type]+suffix;
}
export function canTrigger(f,e,round){
 const last=f.effectUses?.get(e.key),n=e.every||1;
 if(!e.cycle)return !f.used.has(e.key);
 if(round<(e.minRound||1))return false;
 if(e.cycle==='round')return (round-1)%n===0&&last?.round!==round;
 return f.actions>0&&f.actions%n===0&&last?.action!==f.actions;
}

