import {SURVIVAL_DATA} from './data.js';
import {CARD_MAP,RARITIES} from '../catalog.js';
export const DATA_VERSION='v9-csv-20261022-arena-4u';
/** Same rarity shares for every manga (DB reference): 33 / 27 / 21 / 15 / 4. */
export const RARITY_RATES=Object.freeze(
  ['common','uncommon','rare','epic','legendary'].map(k=>[k,RARITIES[k].rate])
);
/** Rank 1 = weakest. Assign rarity from within-universe power percentile. */
export function rarityFromRank(rank,N){
  if(!(N>=1)||!(rank>=1))return 'common';
  const pct=100*(rank-.5)/N;
  let acc=0;
  for(const [name,rate] of RARITY_RATES){
    acc+=rate;
    if(pct<=acc||name==='legendary')return name;
  }
  return 'legendary';
}
/** Pad/trim combat effects to the official count for that rarity (1/2/3/4/5). */
const EFFECT_PAD=[
 {type:'shield',name:'Garde préparée',trigger:'BATTLE_START',description:'Début du combat (unique) : bouclier de 14 % des PV max.',amount:.14},
 {type:'critical',name:'Frappe nette',trigger:'BEFORE_ATTACK',description:'Sur sa première attaque : 22 % de chance de dégâts ×1.4.',chance:.22,multiplier:1.4},
 {type:'counter',name:'Riposte courte',trigger:'AFTER_HIT_OR_DODGE',description:'Une fois après le premier coup reçu : riposte à 60 % ATQ.',multiplier:.6},
 {type:'heal_ally',name:'Soutien rapide',trigger:'ACTION_START',description:'Une fois si un allié est blessé : soigne 12 % de ses PV max.',amount:.12},
 {type:'stun',name:'Ouverture',trigger:'AFTER_HIT',description:'Au premier impact survivant : interrompt la prochaine action.',chance:1},
 {type:'extra_strike',name:'Relance',trigger:'ACTION_ATTACK',description:'Une fois après une attaque (round 2+) : frappe à 55 % ATQ.',multiplier:.55},
 {type:'dodge',name:'Pas de côté',trigger:'BEFORE_HIT',description:'Sur la première attaque subie : 18 % de chances d’esquiver.',chance:.18},
 {type:'dot',name:'Blessure ouverte',trigger:'AFTER_HIT',description:'Une fois au premier impact : 28 % de chance d’infliger 6 dégâts pendant 2 rounds.',chance:.28,damage:6,duration:2},
 {type:'atk_buff',name:'Montée en puissance',trigger:'BATTLE_START',description:'Début du combat (unique) : ATQ +10 %.',amount:.1},
 {type:'focus',name:'Cible prioritaire',trigger:'BEFORE_ATTACK',description:'La première attaque vise l’ennemi au plus faible ratio de PV.'}
];
export function normalizeEffects(cardId,list,rarity){
 const want=RARITIES[rarity]?.effects||1;
 const base=(list||[]).map((e,i)=>({...e,key:e.key||cardId+':effect:'+i}));
 if(base.length>want)return base.slice(0,want);
 const out=[...base];
 let pad=0;
 while(out.length<want){
  const tmpl=EFFECT_PAD[pad%EFFECT_PAD.length];
  out.push({...tmpl,key:cardId+':pad:'+pad,name:tmpl.name+' · complément',editorial:true});
  pad++;
 }
 return out;
}
const cached={};
export function catalog(universe){
 if(!SURVIVAL_DATA[universe])throw Error('Univers invalide');
 if(cached[universe])return cached[universe];
 const d=SURVIVAL_DATA[universe];
 const ordered=[...d.heroes].sort((a,b)=>(a.rank||0)-(b.rank||0)||(a.id<b.id?-1:1));
 const N=ordered.length;
 const heroes=ordered.map((h,i)=>{
  const rank=h.rank||i+1;
  const rarity=rarityFromRank(rank,N);
  const raw=universe==='DB'?(CARD_MAP.get(h.id)?.effects||[]):(h.signature||[]).map((e,i)=>({...e,key:h.id+':'+i,editorial:true}));
  return {...h,rank,rarity,effects:normalizeEffects(h.id,raw,rarity)};
 });
 return cached[universe]={...d,heroes,byId:new Map(heroes.map(x=>[x.id,x])),byItem:new Map(d.items.map(x=>[x.id,x])),gear:d.items.filter(x=>x.allowed),weapons:d.items.filter(x=>x.draft).sort((a,b)=>a.tier-b.tier||(a.id<b.id?-1:1)),N};
}
export const EFFECT_TEXT={atk:'Bonus ATQ tant que porté',pierce:'Bonus ATQ · ignore 50 % du bouclier',shield:'Barrière temporaire à la pose',hp:'PV max renforcés tant que porté',heal:'Soin immédiat d’un vivant',draw:'Pioche bonus à la pose',scout:'Pioche + aperçu du dessus du deck',stun:'Interrompt la prochaine action ennemie, une fois',evade:'Esquive le prochain coup, une fois',counter:'Riposte au premier coup reçu, une fois'};
export function itemText(g){return [g.atk?`+${g.atk} % ATQ`:'',g.shield?`+${g.shield} % ${g.effect==='hp'?'PV max':'bouclier'}`:'',g.heal?`Soin ${g.heal} %`:'',g.draw?`Pioche ${g.draw}`:'',(['pierce','stun','evade','counter'].includes(g.effect)?EFFECT_TEXT[g.effect]:'')].filter(Boolean).join(' · ');}
export function newUnit(c,uid=c.id){return {uid,cardId:c.id,person:c.person,name:c.name,attack:c.attack,maxHp:c.maxHp,speed:c.speed,hp:c.maxHp,level:1,wins:0};}
