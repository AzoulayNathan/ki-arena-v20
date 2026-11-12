import {catalog,DATA_VERSION} from './catalog.js';
export const SAVE_PREFIX='kiarena:v9:survival:';
const PHASES=['draft','map','preview','combat','reward','shop','rest','treasure','event','end'];
// Inspect without repairing or deleting bytes. The lobby can offer a raw backup
// even when the save cannot be decoded; other universes are never touched.
export function storedRunStatus(universe,storage){
 if(!['DB','HXH','NARUTO','ONEPIECE'].includes(universe))throw Error('Univers invalide');
 let raw;try{raw=(storage??globalThis.localStorage).getItem(SAVE_PREFIX+universe);}catch{return {run:null,raw:null,error:'Le navigateur bloque la sauvegarde locale. Autorise le stockage pour jouer.',available:false};}
 if(raw===null||raw===undefined)return {run:null,raw:null,error:'',available:true};
 try{const run=migrateRun(JSON.parse(raw));if(run.universe!==universe)throw Error('Univers de sauvegarde incorrect');return {run,raw,error:'',available:true};}catch(err){return {run:null,raw,error:'Sauvegarde '+universe+' illisible : '+(err instanceof SyntaxError?'Le fichier de partie est incomplet ou endommagé.':err.message),available:true};}
}
export function validateRun(r){
 if(!r||r.schema!==1||r.mode!=='survival-infinity-v2'||r.dataVersion!==DATA_VERSION||!['DB','HXH','NARUTO','ONEPIECE'].includes(r.universe)||!PHASES.includes(r.phase))throw Error('Version ou mode de sauvegarde incompatible');
 if(r.rulesVersion&&!['9.0.0-rc1','9.1.0','9.2.0','9.3.0'].includes(r.rulesVersion))throw Error('Règles de cette sauvegarde non prises en charge');
 const cat=catalog(r.universe);if(r.shopCareUsed!==undefined&&typeof r.shopCareUsed!=='boolean')throw Error('Service marchand corrompu');
 if(typeof r.seed!=='string'||!r.seed.length||r.seed.length>120||!Array.isArray(r.history)||!Array.isArray(r.rewardOptions)||!Array.isArray(r.shop))throw Error('Métadonnées de sauvegarde corrompues');
 if(!Number.isInteger(r.wave)||r.wave<1||!Number.isInteger(r.revision)||r.revision<0||!Number.isInteger(r.rng)||!Number.isFinite(r.coins)||r.coins<0||!Number.isInteger(r.slots)||r.slots<3||r.slots>5||!Array.isArray(r.units)||!Array.isArray(r.dead)||!Array.isArray(r.items)||!Array.isArray(r.relics))throw Error('État de sauvegarde invalide');
 if(r.units.length>30||r.items.length>40||new Set(r.units.map(x=>x.uid)).size!==r.units.length||new Set(r.items).size!==r.items.length)throw Error('Doublons ou capacité invalide');
 if(new Set([...r.units,...r.dead].map(x=>x.uid)).size!==r.units.length+r.dead.length||[...r.units,...r.dead].some(x=>typeof x.uid!=='string'||!x.uid)||r.relics.some(x=>!['manual','reader','garden'].includes(x))||new Set(r.relics).size!==r.relics.length)throw Error('Identités ou reliques corrompues');
 for(const u of [...r.units,...r.dead])if(!cat.byId.has(u.cardId)||![u.hp,u.maxHp,u.attack,u.speed,u.level,u.wins].every(Number.isFinite)||u.hp<0||u.hp>u.maxHp||u.maxHp<=0||u.level<1||u.level>5)throw Error('Personnage invalide ou mauvais univers');
 if(r.units.some(x=>x.hp<=0)||r.dead.some(x=>x.hp!==0))throw Error('État vivant/KO incohérent');
 if(r.items.some(id=>!cat.byItem.get(id)?.allowed))throw Error('Objet interdit ou mauvais univers');
 if(r.phase==='draft'&&(!Array.isArray(r.offers)||r.offers.length!==4||r.draftStep<0||r.draftStep>7||r.offers.some(id=>r.draftStep<5?!cat.byId.has(id):!cat.byItem.get(id)?.draft)))throw Error('Draft corrompu');
 const checkEncounter=e=>{if(!e||!Array.isArray(e.units)||!Array.isArray(e.ranks)||e.units.length!==e.ranks.length||e.ranks.reduce((a,b)=>a+b,0)!==e.budget||e.ranks.some(x=>!Number.isInteger(x)||x<1||x>cat.N)||e.units.some(u=>!cat.byId.has(u.cardId))||e.items.some(id=>!cat.byItem.get(id)?.allowed))throw Error('Rencontre corrompue');};
 if(r.pending)checkEncounter(r.pending);
 for(const route of r.routes||[])if(route.encounter)checkEncounter(route.encounter);
 if(r.combat||r.phase==='combat'||r.phase==='reward'){
  const c=r.combat;if(!c||!Number.isInteger(c.round)||c.round<1||!Array.isArray(c.field)||!Array.isArray(c.enemies)||!c.ready&&r.phase==='combat')throw Error('Combat corrompu');
  if(typeof c.ready!=='boolean'||!['played','events','usedGear','enemyUsedGear','normalActions','roundEvents'].every(k=>Array.isArray(c[k]))||['action','enemyAction'].some(k=>!Number.isInteger(c[k])||c[k]<0||c[k]>1)||['bonus','enemyBonus'].some(k=>!Number.isInteger(c[k])||c[k]<0||c[k]>2))throw Error('Actions de combat corrompues');
  for(const [side,units] of [['player',c.field],['enemy',c.enemies]]){
   if(new Set(units.map(u=>u.uid)).size!==units.length)throw Error('Combattant déployé en double');
   for(const u of units){
    if(!cat.byId.has(u.cardId)||u.side!==side||typeof u.uid!=='string'||![u.hp,u.maxHp,u.attack,u.speed].every(Number.isFinite)||u.hp<0||u.hp>u.maxHp||u.maxHp<=0||u.attack<=0||u.speed<0||!Array.isArray(u.used)||!Array.isArray(u.gearUsed)||!Array.isArray(u.statuses)||!Array.isArray(u.charEffects)||!u.barriers||Array.isArray(u.barriers)||Object.values(u.barriers).some(n=>!Number.isFinite(n)||n<0))throw Error('Combattant corrompu ou mauvais univers');
    if(side==='player'&&![...r.units,...r.dead].some(x=>x.uid===u.uid))throw Error('Combattant absent de la run');
    for(const [slot,armor] of [['weapon',false],['armor',true]])if(u[slot]){const g=cat.byItem.get(u[slot]);if(!g?.allowed||g.category==='consommable'||(g.category==='armure')!==armor)throw Error('Équipement porté incompatible');}
   }
  }
  for(const d of [c.deck,c.enemyDeck])for(const key of ['pile','hand','discard'])if(!Array.isArray(d?.[key])||d[key].some(x=>!x||!['hero','gear'].includes(x.type)||(x.type==='hero'?(d===c.enemyDeck||!r.units.some(u=>u.uid===x.id)):!cat.byItem.get(x.id)?.allowed)))throw Error('Deck corrompu');
 }
 return r;
}
export function migrateRun(raw){const r=structuredClone(raw);if(r.mode==='survival-infinity-v2'&&['DB','HXH'].includes(r.universe)&&r.dataVersion==='v9-csv-20261021-1')r.dataVersion=DATA_VERSION;if(r.schema===0&&r.mode==='survival-infinity-v2'){r.schema=1;r.revision=r.revision||0;r.dataVersion=r.dataVersion||DATA_VERSION;}return validateRun(r);}
export function encodeSave(run){validateRun(run);return JSON.stringify({format:'KI_ARENA_SURVIVAL',version:1,run},null,2);}
export function decodeSave(text){if(text.length>5000000)throw Error('Sauvegarde trop volumineuse');const v=JSON.parse(text);if(v.format!=='KI_ARENA_SURVIVAL'||v.version!==1)throw Error('Format de sauvegarde invalide');return migrateRun(v.run);}
export function saveRun(run,storage){validateRun(run);try{(storage??globalThis.localStorage).setItem(SAVE_PREFIX+run.universe,JSON.stringify(run));}catch{throw Error('Enregistrement impossible. Libère de l’espace ou autorise le stockage du navigateur, puis réessaie.');}}
export function loadRun(universe,storage=globalThis.localStorage){const s=storage.getItem(SAVE_PREFIX+universe);if(!s)return null;const r=migrateRun(JSON.parse(s));if(r.universe!==universe)throw Error('Univers de sauvegarde incorrect');return r;}
