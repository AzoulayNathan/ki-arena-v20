import {registry} from './catalog.js';
import {cosmeticHash,editionFor} from './card-spec.js';
const KEY='kiarena:personal-collection:v191';
export const PACK_RARITIES=[['common',33],['uncommon',27],['rare',21],['epic',15],['legendary',4]];
export const PACK_SIZE=5;
export function rarityForRoll(roll){let n=0;return PACK_RARITIES.find(([,w])=>(n+=w)>roll)[0];}
export function collectionState(storage=globalThis.localStorage){try{const x=JSON.parse(storage.getItem(KEY));if(x&&[1,2].includes(x.schema)&&Array.isArray(x.cards)&&Array.isArray(x.claims))return {...x,schema:2,claims:x.claims.map(p=>({...p,opened:x.schema===1?true:!!p.opened}))};}catch{}return {schema:2,cards:[],claims:[]};}
export function ensureStarterPack(world='DB',storage=globalThis.localStorage){
  const state=collectionState(storage);
  if(state.claims.length)return state.claims[0];
  const w=['DB','HXH','NARUTO','ONEPIECE'].includes(world)?world:'DB';
  const c=registry([w]),cards=[],id='starter:v20:'+w;
  for(let i=0;i<PACK_SIZE;i++){
    const seed='WELCOME-V20:'+w+':'+i,rarity=rarityForRoll(cosmeticHash(seed)%100),pool=c.heroes.filter(h=>h.rarity===rarity);
    const use=pool.length?pool:c.heroes;
    const hero=use[cosmeticHash(seed+':hero')%use.length];
    const finish=editionFor(seed,hero.id)==='special'?'gold':'black';
    cards.push({id:hero.id,finish,rarity:hero.rarity||rarity,seed,universe:hero.universe});
  }
  const pack={id,worlds:[w],cards,opened:false,starter:true};
  state.claims.push(pack);
  try{storage.setItem(KEY,JSON.stringify(state));}catch{}
  return pack;
}
/** One five-card booster after a resolved fight. No floor history, no rerolls. */
export function rewardPack(r,storage=globalThis.localStorage){if(!r||r.phase!=='end'||!r.history?.length)return null;const state=collectionState(storage),id=r.runInstanceId||r.runId,existing=state.claims.find(p=>p.id===id);if(existing)return existing;const c=registry(r.worlds),cards=[];for(let i=0;i<PACK_SIZE;i++){const seed=r.seed+':pack:'+id+':'+i,rarity=rarityForRoll(cosmeticHash(seed)%100),pool=c.heroes.filter(h=>h.rarity===rarity);if(!pool.length)throw Error('Pool de rareté indisponible');const hero=pool[cosmeticHash(seed+':hero')%pool.length];const finish=editionFor(seed,hero.id)==='special'?'gold':'black';cards.push({id:hero.id,finish,rarity,seed,universe:hero.universe});}const pack={id,worlds:[...r.worlds],cards,opened:false};state.claims.push(pack);storage.setItem(KEY,JSON.stringify(state));return pack;}
/** Single atomic write before reveal; closing/crashing cannot duplicate rewards. */
export function openPack(id,storage=globalThis.localStorage){const state=collectionState(storage),p=state.claims.find(x=>x.id===id);if(!p)throw Error('Pack introuvable.');if(p.opened)return p;for(const o of p.cards){const key=o.id+'|'+o.finish,owned=state.cards.find(x=>x.key===key);if(owned)owned.count++;else state.cards.push({key,...o,count:1});}p.opened=true;storage.setItem(KEY,JSON.stringify(state));return p;}
export function pendingPacks(storage=globalThis.localStorage){return collectionState(storage).claims.filter(p=>!p.opened);}
