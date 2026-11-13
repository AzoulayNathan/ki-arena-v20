import {registry} from './catalog.js';
import {pick} from '../survival/random.js';
import {collectionState} from './collection-rewards.js';

/** Reference bands for a pool of N=600; always scaled with *N/600. */
export const DRAFT_BANDS=Object.freeze({
  midA:{lo:50,hi:70},
  midB:{lo:35,hi:85},
  mystery:{lo:15,hi:100},
});
export const START_RULES='20.0.0';
export const START_HERO_PICKS=5;
export const START_WEAPON_PICKS=3;
export const START_DRAFT_PICKS=START_HERO_PICKS+START_WEAPON_PICKS;

const heroCache=new Map();
const weaponCache=new Map();

export function initialPool(worlds,statsMode){
  const c=registry(worlds,statsMode);
  if(!heroCache.has(c.key))heroCache.set(c.key,[...c.heroes].sort((a,b)=>(a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed)||(a.id<b.id?-1:1)).map((h,i)=>({...h,globalRank:i+1})));
  return heroCache.get(c.key);
}

export function weaponPool(worlds,statsMode){
  const c=registry(worlds,statsMode);
  if(!weaponCache.has(c.key))weaponCache.set(c.key,[...c.weapons].sort((a,b)=>((a.atk||0)+(a.shield||0)+(a.heal||0))-((b.atk||0)+(b.shield||0)+(b.heal||0))||(a.tier||0)-(b.tier||0)||(a.id<b.id?-1:1)).map((g,i)=>({...g,globalRank:i+1})));
  return weaponCache.get(c.key);
}

/** Bounds always proportional to N (example values are for N=600). */
export function initialBounds(band,N){
  const b=DRAFT_BANDS[band];
  return {lo:Math.max(1,Math.round(b.lo*N/600)),hi:Math.max(1,Math.round(b.hi*N/600))};
}

function ownedHeroIds(r){
  if(!r.useCollection)return null;
  try{
    const ids=new Set(collectionState().cards.map(o=>o.id));
    return ids.size?ids:null;
  }catch{return null;}
}

function generateHeroes(r){
  const c=registry(r.worlds,r.statsMode),full=initialPool(r.worlds,r.statsMode);
  const persons=new Set([...r.units,...r.dead].map(u=>c.byId.get(u.cardId).person));
  const offeredPeople=new Set(),represented=new Set(r.units.map(u=>c.byId.get(u.cardId).universe));
  const owned=ownedHeroIds(r);
  const weakMax=initialBounds('mystery',c.N).hi;
  const possibleWorlds=new Set(full.filter(h=>h.globalRank<=weakMax&&!persons.has(h.person)&&(owned?owned.has(h.id):true)).map(h=>h.universe));
  return ['midA','midB','mystery'].map((band,i)=>{
    const bounds=initialBounds(band,c.N);
    const heroes=full.filter(h=>h.globalRank>=bounds.lo&&h.globalRank<=bounds.hi&&h.rarity!=='legendary'&&!persons.has(h.person)&&!offeredPeople.has(h.person)&&(owned?owned.has(h.id):true)&&(represented.size?represented.has(h.universe)||possibleWorlds.has(h.universe):true));
    const base={token:'start-'+r.step+'-'+i+'-'+r.rng.toString(36),kind:'hero',band,revealed:i<2,typeRoll:0,safety:false,sourceSize:c.N,bounds};
    if(!heroes.length)return {...base,id:null,disabled:true,reason:owned?'Aucun allié débloqué dans cette bande.':'Aucun allié disponible ici.'};
    const h=pick(r,heroes);offeredPeople.add(h.person);
    return {...base,id:h.id,universe:h.universe,globalRank:h.globalRank};
  });
}

function weaponBounds(band,N){
  // Same 50–70 / 35–85 / 15–100 ratios, mapped onto the actual weapon pool size.
  const b=DRAFT_BANDS[band],n=Math.max(1,N);
  const lo=Math.max(1,Math.round(b.lo/100*n)),hi=Math.max(lo,Math.round(b.hi/100*n));
  return {lo,hi:Math.min(n,hi)};
}
function generateWeapons(r){
  const c=registry(r.worlds,r.statsMode),full=weaponPool(r.worlds,r.statsMode);
  const ownedIds=new Set(r.items.map(g=>g.cardId));
  const offered=new Set();
  const represented=new Set(r.units.map(u=>c.byId.get(u.cardId).universe));
  return ['midA','midB','mystery'].map((band,i)=>{
    const bounds=weaponBounds(band,full.length);
    const gear=full.filter(g=>g.globalRank>=bounds.lo&&g.globalRank<=bounds.hi&&g.tier<=4&&!ownedIds.has(g.id)&&!offered.has(g.id)&&(represented.size?represented.has(g.universe):true));
    const base={token:'start-'+r.step+'-'+i+'-'+r.rng.toString(36),kind:'weapon',band,revealed:i<2,typeRoll:1,safety:false,sourceSize:full.length,bounds};
    if(!gear.length)return {...base,id:null,disabled:true,reason:'Aucune arme disponible ici.'};
    const g=pick(r,gear);offered.add(g.id);
    return {...base,id:g.id,universe:g.universe,globalRank:g.globalRank};
  });
}

function generate(r){
  return r.step<START_HERO_PICKS?generateHeroes(r):generateWeapons(r);
}

export function ensureStartDraft(r){
  if(r.phase!=='draft'||r.offers.length)return;
  r.draftRng=r.rng;
  r.offers=generate(r);
  if(r.offers.every(o=>o.disabled))throw Error('Aucune proposition de départ compatible.');
}

export function validateStartDraft(r){
  if(r.phase!=='draft')return true;
  if(!Number.isInteger(r.step)||r.step<0||r.step>=START_DRAFT_PICKS||r.units.length!==Math.min(r.step,START_HERO_PICKS)||r.items.length!==Math.max(0,r.step-START_HERO_PICKS)||r.dead.length||!Number.isInteger(r.draftRng))throw Error('Recrutement de départ invalide.');
  const copy={...r,rng:r.draftRng};
  const expected=generate(copy);
  if(copy.rng!==r.rng||JSON.stringify(expected)!==JSON.stringify(r.offers))throw Error('Propositions de départ altérées.');
  return true;
}

export function chooseStartDraft(r,token){
  if(r.phase!=='draft')return false;
  validateStartDraft(r);
  const o=r.offers.find(o=>o.token===token);
  if(!o||o.disabled)return false;
  const c=registry(r.worlds,r.statsMode);
  if(r.step<START_HERO_PICKS){
    if(o.kind!=='hero')return false;
    const h=c.byId.get(o.id);
    r.units.push({uid:'u'+(++r.uid),cardId:h.id,level:1,wins:0,hp:h.maxHp,maxHp:h.maxHp,attack:h.attack,speed:h.speed,weapon:null,armor:null,fromDraft:true});
  }else{
    if(o.kind!=='weapon')return false;
    const g=c.byItem.get(o.id);
    r.items.push({uid:'g'+(++r.uid),cardId:g.id,fromDraft:true});
  }
  r.step++;
  r.offers=[];
  if(r.step===START_DRAFT_PICKS){
    if(r.units.length<3)throw Error('Trois alliés sont nécessaires.');
    r.phase='map';
    delete r.draftRng;
  }else ensureStartDraft(r);
  return true;
}
