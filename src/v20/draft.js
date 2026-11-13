import {registry} from './catalog.js';
import {pick} from '../survival/random.js';
/** Reference bands for a pool of N=600; always scaled with *N/600. */
export const DRAFT_BANDS=Object.freeze({
  midA:{lo:50,hi:70},
  midB:{lo:35,hi:85},
  mystery:{lo:15,hi:100},
});
export const START_RULES='20.0.0';
export const START_DRAFT_PICKS=5;
const cache=new Map();
export function initialPool(worlds,statsMode){const c=registry(worlds,statsMode);if(!cache.has(c.key))cache.set(c.key,[...c.heroes].sort((a,b)=>(a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed)||(a.id<b.id?-1:1)).map((h,i)=>({...h,globalRank:i+1})));return cache.get(c.key);}
/** Bounds always proportional to N (example values are for N=600). */
export function initialBounds(band,N){const b=DRAFT_BANDS[band];return {lo:Math.max(1,Math.round(b.lo*N/600)),hi:Math.max(1,Math.round(b.hi*N/600))};}
function generate(r){
 const c=registry(r.worlds,r.statsMode),full=initialPool(r.worlds,r.statsMode),persons=new Set([...r.units,...r.dead].map(u=>c.byId.get(u.cardId).person)),offeredPeople=new Set(),represented=new Set(r.units.map(u=>c.byId.get(u.cardId).universe));
 const weakMax=initialBounds('mystery',c.N).hi,possibleWorlds=new Set(full.filter(h=>h.globalRank<=weakMax&&!persons.has(h.person)).map(h=>h.universe));
 // 3 offres · personnages uniquement · bandes proportionnelles à N
 const offers=['midA','midB','mystery'].map((band,i)=>{
  const bounds=initialBounds(band,c.N);
  const heroes=full.filter(h=>h.globalRank>=bounds.lo&&h.globalRank<=bounds.hi&&h.rarity!=='legendary'&&!persons.has(h.person)&&!offeredPeople.has(h.person)&&(represented.size?represented.has(h.universe)||possibleWorlds.has(h.universe):true));
  const base={token:'start-'+r.step+'-'+i+'-'+r.rng.toString(36),kind:'hero',band,revealed:i<2,typeRoll:0,safety:false,sourceSize:c.N,bounds};
  if(!heroes.length)return {...base,id:null,disabled:true,reason:'Aucun allié disponible ici.'};
  const h=pick(r,heroes);offeredPeople.add(h.person);
  return {...base,id:h.id,universe:h.universe,globalRank:h.globalRank};
 });
 return offers;
}
export function ensureStartDraft(r){if(r.phase!=='draft'||r.offers.length)return;r.draftRng=r.rng;r.offers=generate(r);if(r.offers.every(o=>o.disabled))throw Error('Aucune proposition de départ compatible.');}
export function validateStartDraft(r){if(r.phase!=='draft')return true;if(!Number.isInteger(r.step)||r.step<0||r.step>=START_DRAFT_PICKS||r.units.length!==r.step||r.items.length||r.dead.length||!Number.isInteger(r.draftRng))throw Error('Recrutement de départ invalide.');const copy={...r,rng:r.draftRng};const expected=generate(copy);if(copy.rng!==r.rng||JSON.stringify(expected)!==JSON.stringify(r.offers))throw Error('Propositions de départ altérées.');return true;}
export function chooseStartDraft(r,token){if(r.phase!=='draft')return false;validateStartDraft(r);const o=r.offers.find(o=>o.token===token);if(!o||o.disabled||o.kind!=='hero')return false;const c=registry(r.worlds,r.statsMode);const h=c.byId.get(o.id);r.units.push({uid:'u'+(++r.uid),cardId:h.id,level:1,wins:0,hp:h.maxHp,maxHp:h.maxHp,attack:h.attack,speed:h.speed,weapon:null,armor:null});r.step++;r.offers=[];if(r.step===START_DRAFT_PICKS){if(r.units.length<3)throw Error('Trois alliés sont nécessaires.');r.phase='map';delete r.draftRng;}else ensureStartDraft(r);return true;}
