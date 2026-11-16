import {registry} from '../arena/catalog.js';
import {int,pick} from '../survival/random.js';
import {DRAFT_BANDS,virtualToLocalRank} from '../arena/rules.js';

export const MIXED_RULES='16.0.0';
export const MIXED_ROUNDS=6;
const cache=new Map();
export function draftSource(worlds,world,kind){
 const c=registry(worlds),key=c.key+'|'+world+'|'+kind;
 if(!cache.has(key))cache.set(key,(kind==='hero'?c.heroes:c.weapons).filter(h=>h.universe===world).sort(kind==='hero'?(a,b)=>a.rank-b.rank||(a.id<b.id?-1:1):(a,b)=>a.tier-b.tier||(a.atk+a.shield+a.heal)-(b.atk+b.shield+b.heal)||(a.id<b.id?-1:1)));
 return cache.get(key);
}
export function canDraftKind(r,kind){
 const remaining=MIXED_ROUNDS-r.step-1;
 return kind==='hero'?r.units.length<5&&remaining>=Math.max(0,1-r.items.length):remaining>=Math.max(0,3-r.units.length);
}
function generate(r){
 const c=registry(r.worlds),weaponSlot=int(r,0,2),ownedIds=new Set(r.items.map(g=>g.cardId)),persons=new Set([...r.units,...r.dead].map(u=>c.byId.get(u.cardId).person)),offeredIds=new Set(),offeredPersons=new Set();
 const represented=new Set(r.units.map(u=>c.byId.get(u.cardId).universe));
 const pending=[...new Set(r.items.map(g=>c.byItem.get(g.cardId).universe))].filter(w=>!represented.has(w));
 return ['midA','midB','mystery'].map((band,i)=>{
  const kind=i===weaponSlot?'weapon':'hero',base={kind,band,revealed:i<2,token:'mixed-'+r.step+'-'+i+'-'+r.rng.toString(36)},legalWorlds=kind==='hero'?(pending.length?pending:r.worlds):(represented.size?[...represented]:pending.length?pending:r.worlds);
  if(!canDraftKind(r,kind))return {...base,id:null,disabled:true,reason:kind==='hero'?'Garde une place pour une arme.':'Ton équipe a encore besoin d’alliés.'};
  const {lo,hi}=DRAFT_BANDS[band],lists=[];
  for(const w of legalWorlds){
   const full=draftSource(r.worlds,w,kind),min=virtualToLocalRank(lo,full.length),max=virtualToLocalRank(hi,full.length),legal=full.map((card,j)=>({card,rank:j+1})).filter(({card,rank})=>rank>=min&&rank<=max&&!ownedIds.has(card.id)&&!offeredIds.has(card.id)&&(kind!=='hero'||!persons.has(card.person)&&!offeredPersons.has(card.person)));
   if(legal.length)lists.push({full,legal,w});
  }
  if(!lists.length)return {...base,id:null,disabled:true,reason:'Aucun choix compatible dans cette proposition.'};
  const list=pick(r,lists),virt=int(r,lo,hi),target=virtualToLocalRank(virt,list.full.length),selected=[...list.legal].sort((a,b)=>Math.abs(a.rank-target)-Math.abs(b.rank-target)||(a.card.id<b.card.id?-1:1))[0];
  offeredIds.add(selected.card.id);if(kind==='hero')offeredPersons.add(selected.card.person);
  return {...base,id:selected.card.id,virt,universe:list.w,sourceSize:list.full.length,localRank:selected.rank,target};
 });
}
export function ensureMixedDraft(r){
 if(r.phase!=='draft'||r.offers.length)return;
 r.draftRng=r.rng;r.offers=generate(r);
 if(r.offers.every(o=>o.disabled))throw Error('Aucune proposition valide pour ce recrutement.');
}
export function validateMixedDraft(r){
 if(r.phase!=='draft')return true;
 if(!Number.isInteger(r.step)||r.step<0||r.step>=MIXED_ROUNDS||r.units.length+r.items.length!==r.step||r.dead.length||!Number.isInteger(r.draftRng))throw Error('Recrutement mixte invalide.');
 const copy={...r,rng:r.draftRng,offers:[]},expected=generate(copy);
 if(copy.rng!==r.rng||JSON.stringify(expected)!==JSON.stringify(r.offers)||expected.every(o=>o.disabled))throw Error('Les propositions ne correspondent pas au tirage enregistré.');
 return true;
}
export function chooseMixedDraft(r,token){
 if(r.phase!=='draft')return false;
 validateMixedDraft(r);
 const o=r.offers.find(o=>o.token===token);if(!o||o.disabled)return false;
 const c=registry(r.worlds);
 if(o.kind==='hero'){const h=c.byId.get(o.id);r.units.push({uid:'u'+(++r.uid),cardId:h.id,level:1,wins:0,hp:h.maxHp,maxHp:h.maxHp,attack:h.attack,speed:h.speed,weapon:null,armor:null});}
 else r.items.push({uid:'g'+(++r.uid),cardId:o.id});
 r.step++;r.offers=[];
 if(r.step===MIXED_ROUNDS){r.phase='map';delete r.draftRng;}else ensureMixedDraft(r);
 return true;
}
