/** Presentation taxonomy. Does not assign abilities or mutate gameplay stats. */
export const FAMILIES={melee:'Corps à corps',weapon:'Armes',energy:'Énergie',support:'Soutien',control:'Contrôle',exit:'K.O.'};
const simplify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function attackProfile(event={},ctx={}){
 const type=event.type,text=simplify([ctx.technique,ctx.weapon,ctx.effectType,event.message].join(' '));
 const colors={DB:['#69d9ff','#ffcd78'],HXH:['#86dfb4','#e5c6ff'],NARUTO:['#ffb67a','#b8caff'],ONEPIECE:['#91dbeb','#ffe0b0']},[color,secondary]=colors[ctx.universe]||colors.DB;
 let family='melee',variant='strike',label='Impact',duration=620;
 if(type==='ko'){family='exit';variant='shatter';label='K.O.';duration=1000;}
 else if(type==='dodge'){family='support';variant='evade';label='Esquive';duration=520;}
 else if(['heal','revive'].includes(type)){family='support';variant=type==='revive'?'revive':/life|drain|absorp/.test(text)?'drain':'heal';label=type==='revive'?'Second souffle':'Soin';duration=700;}
 else if(['shield','guard'].includes(type)){family='support';variant=type==='guard'?'intercept':'barrier';label=type==='guard'?'Protection':'Bouclier';duration=640;}
 else if(['status','stunned','skip','dot'].includes(type)){family='control';variant=type==='dot'||/dot|brul|persist|poison/.test(text)?'burn':/weaken|faibl/.test(text)?'weaken':'bind';label=variant==='burn'?'Dégâts persistants':variant==='weaken'?'Affaibli':'Interrompu';duration=600;}
 else if(['buff','ultimate','phase','skill'].includes(type)){family='support';variant=/transform|eveil|puissance|phase/.test(text)?'awaken':'charge';label=ctx.technique||'Technique';duration=type==='ultimate'?820:500;}
 else if(type==='counter_hit'){family='melee';variant='counter';label='Riposte';duration=660;}
 else if(['hit','skill_hit'].includes(type)){
  if(/lame|epee|sabre|sword|katana|slash|tranch|kunai|shuriken|kusanagi|samehada|yoru/.test(text)){family='weapon';variant=/rafale|multi|shuriken/.test(text)?'crosscut':'slash';label='Tranchant';duration=720;}
  else if(/fusil|pistolet|mitraill|carabine|revolver|laser/.test(text)&&ctx.weapon){family='weapon';variant='volley';label='Tir';duration=730;}
  else if(/kame|rayon|beam|galick|makank|masenko|final flash|canon|vague/.test(text)){family='energy';variant='beam';label='Faisceau';duration=1050;}
  else if(/foudre|eclair|chidori|electric|lightning/.test(text)){family='energy';variant='lightning';label='Foudre';duration=850;}
  else if(/rasengan|sphere|bombe|genki|boule|blast|projectile|ki_blast/.test(text)){family='energy';variant='orb';label='Projection';duration=920;}
  else if(/explos|sacrifice|onde|seisme|quake/.test(text)){family='energy';variant='nova';label='Onde de choc';duration=940;}
  else if(/combo|rafale|gatling|enchain|multi/.test(text)){variant='combo';label='Enchaînement';duration=780;}
  else if(event.type==='skill_hit'||/critical|critique|frappe lourde|finisher|execute/.test(text)){variant='heavy';label='Frappe lourde';duration=760;}
 }else{family='none';variant='none';duration=120;label='';}
 return {family,variant,label,color,secondary,universe:ctx.universe||'DB',duration,impact:.48};
}
export function timing(event,ctx={},speed=1,reduced=false){const profile=attackProfile(event,ctx),s=Math.max(1,Number(speed)||1);return {profile,total:Math.round((reduced?(event?.type==='ko'?260:160):profile.duration)/s),impact:Math.round((reduced?0:profile.duration*profile.impact)/s)};}
