import {effectText} from './text.js';
import {combatEffects} from '../v21/effects.js';
import {relicEffects} from './relics.js';
const clean=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
/** Weapon/outil rarity → effect count: common/uncommon 1, rare/epic 2, legendary 3. */
export function weaponEffectCount(rarity){
 return ({common:1,uncommon:1,rare:2,epic:2,legendary:3})[rarity]||1;
}
const WEAPON_PAD=[
 {type:'critical',chance:.22,multiplier:1.35,cycle:'action',every:2,name:'Affûtage'},
 {type:'extra_strike',multiplier:.3,cycle:'action',every:3,name:'Enchaînement'},
 {type:'focus',cycle:'action',every:2,name:'Visée nette'},
 {type:'expose',amount:.1,duration:2,cycle:'action',every:3,name:'Faille ouverte'},
 {type:'dot',damageRatio:.05,duration:2,chance:1,cycle:'action',every:3,name:'Entaille'},
 {type:'splash',multiplier:.25,cycle:'action',every:3,name:'Onde de choc'},
];
/** All combat effects for one gear piece: name mastery + CSV fields, capped by rarity. */
export function weaponEffects(g){
 const name=clean(g.name),key='weapon22:'+g.id,base={key,name:g.name+' · maîtrise',editorial:true},out=[];
 if(g.category==='consommable')return [];
 if(g.category==='armure')out.push({...base,type:'thorns',amount:.08,cycle:'round',every:2});
 else{
  if(/scouter|radar|boussole|lunette|jumelle/.test(name))out.push({...base,type:'focus',cycle:'action',every:2});
  else if(/bouclier|parapluie|eventail/.test(name))out.push({...base,type:'intercept'});
  else if(/yo.yo|elect|foudre|chakra/.test(name))out.push({...base,type:'stun',cycle:'action',every:4});
  else if(/filet|chaine|corde|canne/.test(name))out.push({...base,type:'weaken',amount:.15,duration:2,cycle:'action',every:3});
  else if(/explos|bombe|grenade/.test(name))out.push({...base,type:'splash',multiplier:.3,cycle:'action',every:3});
  else if(/baton|nunchaku|tonfa/.test(name))out.push({...base,type:'extra_strike',multiplier:.35,cycle:'action',every:3});
  else if(/epee|sabre|lame|katana|yoru|kunai|couteau/.test(name))out.push({...base,type:'critical',chance:.3,multiplier:1.45,cycle:'action',every:2});
  else if(/fusil.*assaut|mitraill/.test(name))out.push({...base,key:key+':rafale',type:'extra_strike',name:g.name+' · rafale',multiplier:.3,cycle:'action',every:3});
  else if(/fusil|carabine|arc|arbalete/.test(name))out.push({...base,key:key+':visee',type:'focus',name:g.name+' · visée',cycle:'action',every:2});
  else if(/etoile|shuriken/.test(name))out.push({...base,key:key+':volee',type:'extra_strike',name:g.name+' · volée',multiplier:.4,cycle:'action',every:3});
  else if(/laser|ray/.test(name))out.push({...base,key:key+':brulure',type:'dot',name:g.name+' · brûlure',damageRatio:.06,duration:2,chance:1,cycle:'action',every:3});
  else if(/pistolet|cartes/.test(name))out.push({...base,type:'expose',amount:.12,duration:2,cycle:'action',every:3});
 }
 const core={stun:'stun',evade:'dodge',counter:'counter'}[g.effect];
 if(core)out.push({key:key+':core',type:core,name:g.name,chance:core==='dodge'?.25:1,multiplier:.65});
 if(g.effect==='pierce')out.push({key:key+':pierce',type:'gear_pierce',name:g.name});
 if(g.heal)out.push({key:key+':heal',type:'heal_ally',amount:g.heal/100,name:g.name});
 if(g.shield&&g.effect!=='hp')out.push({key:key+':shield',type:'shield',amount:g.shield/100,name:g.name});
 if(!out.length){
  const type={pierce:'gear_pierce',shield:'shield',hp:'regen',atk:'counter',stun:'stun',evade:'dodge',counter:'counter',scout:'focus',draw:'haste',heal:'heal_ally'}[g.effect]||'shield';
  out.push({...base,type,amount:.08,multiplier:.3,chance:.2,cycle:'action',every:3});
 }
 const want=g.category==='arme'?weaponEffectCount(g.rarity):Math.min(2,out.length||1);
 const capped=out.slice(0,want);
 let pad=0;
 while(capped.length<want){
  const tmpl=WEAPON_PAD[pad%WEAPON_PAD.length];
  capped.push({...tmpl,key:key+':pad:'+pad,name:(g.name||'Arme')+' · '+tmpl.name,editorial:true});
  pad++;
 }
 return capped;
}
export function effects22(r,u,card,gear,enemy=false){const original=combatEffects(card).map((e,i)=>({...e,name:card.effects?.[i]?.name||e.name})),added=gear.flatMap(weaponEffects);return [...original,...added,...(enemy?[]:relicEffects(r,u))].map(e=>({...e,description:effectText(e)}));}
