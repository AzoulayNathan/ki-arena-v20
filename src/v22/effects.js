import {effectText} from './text.js';
import {combatEffects} from '../v21/effects.js';
import {relicEffects} from './relics.js';
const clean=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
/** Distinct profiles, restricted to named transferable equipment; original CSV unchanged. */
export function weaponEffects(g){const name=clean(g.name),key='weapon22:'+g.id,base={key,name:g.name+' · maîtrise',editorial:true};
 if(g.category==='armure')return [{...base,type:'thorns',amount:.08,cycle:'round',every:2}];
 if(g.category==='consommable')return [];
 if(/scouter|radar|boussole|lunette|jumelle/.test(name))return [{...base,type:'focus',cycle:'action',every:2}];
 if(/bouclier|parapluie|eventail/.test(name))return [{...base,type:'intercept'}];
 if(/yo.yo|elect|foudre|chakra/.test(name))return [{...base,type:'stun',cycle:'action',every:4}];
 if(/filet|chaine|corde|canne/.test(name))return [{...base,type:'weaken',amount:.15,duration:2,cycle:'action',every:3}];
 if(/explos|bombe|grenade/.test(name))return [{...base,type:'splash',multiplier:.3,cycle:'action',every:3}];
 if(/baton|nunchaku|tonfa/.test(name))return [{...base,type:'extra_strike',multiplier:.35,cycle:'action',every:3}];
 if(/epee|sabre|lame|katana|yoru|kunai|couteau/.test(name))return [{...base,type:'critical',chance:.3,multiplier:1.45,cycle:'action',every:2}];
 if(/fusil.*assaut|mitraill/.test(name))return [{...base,type:'extra_strike',name:g.name+' · rafale',multiplier:.3,cycle:'action',every:3}];
 if(/fusil|carabine|arc/.test(name))return [{...base,type:'focus',name:g.name+' · visée',cycle:'action',every:2}];
 if(/etoile|shuriken/.test(name))return [{...base,type:'extra_strike',name:g.name+' · volée',multiplier:.4,cycle:'action',every:3}];
 if(/laser|ray/.test(name))return [{...base,type:'dot',name:g.name+' · brûlure',damageRatio:.06,duration:2,chance:1,cycle:'action',every:3}];
 if(/pistolet|cartes/.test(name))return [{...base,type:'expose',amount:.12,duration:2,cycle:'action',every:3}];
 const type={pierce:'gear_pierce',shield:'shield',hp:'regen',atk:'counter',stun:'stun',evade:'dodge',counter:'counter',scout:'focus',draw:'haste',heal:'heal_ally'}[g.effect]||'shield';
 return [{...base,type,amount:.08,multiplier:.3,chance:.2,cycle:'action',every:3}];
}
export function effects22(r,u,card,gear,enemy=false){const original=combatEffects(card).map((e,i)=>({...e,name:card.effects?.[i]?.name||e.name})),added=gear.flatMap(weaponEffects);return [...original,...added,...(enemy?[]:relicEffects(r,u))].map(e=>({...e,description:effectText(e)}));}
