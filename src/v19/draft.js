import {registry} from './catalog.js';
import {random,pick} from '../survival/random.js';
import {DRAFT_BANDS} from '../arena/rules.js';
export const START_RULES='19.0.0';
const cache=new Map();
export function initialPool(worlds,statsMode){const c=registry(worlds,statsMode);if(!cache.has(c.key))cache.set(c.key,[...c.heroes].sort((a,b)=>(a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed)||(a.id<b.id?-1:1)).map((h,i)=>({...h,globalRank:i+1})));return cache.get(c.key);}
export function initialBounds(band,N){const b=DRAFT_BANDS[band];return {lo:Math.max(1,Math.round(b.lo*N/600)),hi:Math.max(1,Math.round(b.hi*N/600))};}
function generate(r){
 const c=registry(r.worlds,r.statsMode),full=initialPool(r.worlds,r.statsMode),persons=new Set([...r.units,...r.dead].map(u=>c.byId.get(u.cardId).person)),ids=new Set(r.items.map(g=>g.cardId)),offered=new Set(),offeredPeople=new Set(),represented=new Set(r.units.map(u=>c.byId.get(u.cardId).universe)),pending=new Set(r.items.map(g=>c.byItem.get(g.cardId).universe).filter(w=>!represented.has(w)));
 const weakMax=initialBounds('mystery',c.N).hi,possibleWorlds=new Set(full.filter(h=>h.globalRank<=weakMax&&!persons.has(h.person)).map(h=>h.universe));
 const offers=['midA','midB','mystery'].map((band,i)=>{
  const roll=random(r),bounds=initialBounds(band,c.N),heroes=full.filter(h=>h.globalRank>=bounds.lo&&h.globalRank<=bounds.hi&&!persons.has(h.person)&&!offeredPeople.has(h.person)&&(!pending.size||pending.has(h.universe))),gear=c.weapons.filter(g=>g.tier<=2&&!ids.has(g.id)&&!offered.has(g.id)&&(represented.size?represented.has(g.universe):possibleWorlds.has(g.universe)&&(!pending.size||pending.has(g.universe))));
  let kind=roll<.3?'weapon':'hero';const safety=r.step===5&&!r.units.length;if(safety)kind='hero';
  if(kind==='weapon'&&!gear.length)kind='hero';if(kind==='hero'&&!heroes.length&&gear.length&&!safety)kind='weapon';
  const pool=kind==='hero'?heroes:gear,base={token:'start-'+r.step+'-'+i+'-'+r.rng.toString(36),kind,band,revealed:i<2,typeRoll:roll,safety,sourceSize:c.N,bounds};
  if(!pool.length)return {...base,id:null,disabled:true,reason:kind==='hero'?'Aucun allié disponible ici.':'Aucune arme compatible.'};
  const h=pick(r,pool);offered.add(h.id);if(kind==='hero')offeredPeople.add(h.person);
  return {...base,id:h.id,universe:h.universe,...(kind==='hero'?{globalRank:h.globalRank}:{} )};
 });
 return offers;
}
export function ensureStartDraft(r){if(r.phase!=='draft'||r.offers.length)return;r.draftRng=r.rng;r.offers=generate(r);if(r.offers.every(o=>o.disabled))throw Error('Aucune proposition de départ compatible.');}
export function validateStartDraft(r){if(r.phase!=='draft')return true;if(!Number.isInteger(r.step)||r.step<0||r.step>5||r.units.length+r.items.length!==r.step||r.dead.length||!Number.isInteger(r.draftRng))throw Error('Recrutement de départ invalide.');const copy={...r,rng:r.draftRng};const expected=generate(copy);if(copy.rng!==r.rng||JSON.stringify(expected)!==JSON.stringify(r.offers))throw Error('Propositions de départ altérées.');return true;}
export function chooseStartDraft(r,token){if(r.phase!=='draft')return false;validateStartDraft(r);const o=r.offers.find(o=>o.token===token);if(!o||o.disabled)return false;const c=registry(r.worlds,r.statsMode);if(o.kind==='hero'){const h=c.byId.get(o.id);r.units.push({uid:'u'+(++r.uid),cardId:h.id,level:1,wins:0,hp:h.maxHp,maxHp:h.maxHp,attack:h.attack,speed:h.speed,weapon:null,armor:null});}else r.items.push({uid:'g'+(++r.uid),cardId:o.id});r.step++;r.offers=[];if(r.step===6){if(!r.units.length)throw Error('Un allié est nécessaire.');r.phase='map';delete r.draftRng;}else ensureStartDraft(r);return true;}
