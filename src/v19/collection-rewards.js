import {randomInt,freshId,rollFinish} from '../v22/random.js';
import {dropFinish,storedFinish} from '../v21/finish.js';
import {registry} from './catalog.js';
import {cosmeticHash,editionFor,normalizeEdition} from './card-spec.js';
const KEY='kiarena:personal-collection:v191';
export const PACK_RARITIES=[['common',33],['uncommon',27],['rare',21],['epic',15],['legendary',4]];
export const PACK_SIZE=5;
export function rarityForRoll(roll){let n=0;return PACK_RARITIES.find(([,w])=>(n+=w)>roll)[0];}
export function collectionState(storage=globalThis.localStorage){try{const x=JSON.parse(storage.getItem(KEY));if(x&&[1,2].includes(x.schema)&&Array.isArray(x.cards)&&Array.isArray(x.claims))return {...x,schema:2,claims:x.claims.map(p=>({...p,opened:x.schema===1?true:!!p.opened}))};}catch{}return {schema:2,cards:[],claims:[]};}
/** Unlock one exemplar (normal|special). Packs bump count; combat unlock is once. */
function addToCollection(state,{id,finish='black',rarity,seed='ARENA',universe,bump=false}){
 if(!id)return null;const normalized=storedFinish(finish),key=id+'|'+normalized,owned=state.cards.find(x=>x.key===key||(x.id===id&&storedFinish(x.finish)===normalized));
 if(owned){if(bump)owned.count=(owned.count||1)+1;owned.finish=normalized;owned.key=key;if(seed)owned.seed=seed;return owned;}
 const card={key,id,finish:normalized,rarity,seed,universe,count:1};state.cards.push(card);return card;
}
export function unlockCard(card={},storage=globalThis.localStorage){const state=collectionState(storage),owned=addToCollection(state,card);if(owned)storage.setItem(KEY,JSON.stringify(state));return owned;}
export function ensureStarterPack(world='DB',storage=globalThis.localStorage){
  const state=collectionState(storage);
  if(state.claims.length)return state.claims[0];
  const w=['DB','HXH','NARUTO','ONEPIECE'].includes(world)?world:'DB';
  const c=registry([w]),cards=[],id='starter:v20:'+w;
  for(let i=0;i<PACK_SIZE;i++){
    const seed='WELCOME-V22:'+freshId()+':'+i,rarity=rarityForRoll(randomInt(0,99)),finish=rollFinish({randomMode:'live'});
    cards.push(rollPackCard(c,rarity,finish,seed,w,()=>randomInt(0,99)));
  }
  const pack={id,worlds:[w],cards,opened:false,starter:true};
  state.claims.push(pack);
  try{storage.setItem(KEY,JSON.stringify(state));}catch{}
  return pack;
}
/** One five-card booster after a resolved fight. No floor history, no rerolls. */
function rollPackCard(c,rarity,finish,seed,universeHint,roll){
 const inWorld=g=>!universeHint||(Array.isArray(universeHint)?!universeHint.length||universeHint.includes(g.universe):g.universe===universeHint);
 const wantWeapon=roll()<20,weapons=(c.weapons||[]).filter(g=>g.rarity===rarity&&inWorld(g));
 if(wantWeapon&&weapons.length){const g=weapons[roll()%weapons.length];return {id:g.id,finish:finish??dropFinish(seed,g.id),rarity:g.rarity||rarity,seed,universe:g.universe,kind:'weapon'};}
 const pool=c.heroes.filter(h=>h.rarity===rarity&&inWorld(h));
 const use=pool.length?pool:c.heroes.filter(inWorld);
 if(!use.length)throw Error('Pool de rareté indisponible');
 const hero=use[roll()%use.length];return {id:hero.id,finish:finish??dropFinish(seed,hero.id),rarity:hero.rarity||rarity,seed,universe:hero.universe,kind:'hero'};
}
export function rewardPack(r,storage=globalThis.localStorage){if(!r||r.phase!=='end'||!r.history?.length)return null;const state=collectionState(storage),id=r.runInstanceId||r.runId,existing=state.claims.find(p=>p.id===id);if(existing)return existing;const c=registry(r.worlds),cards=[];for(let i=0;i<PACK_SIZE;i++){const seed=r.seed+':pack:'+id+':'+i,rarity=rarityForRoll(cosmeticHash(seed)%100),roll=n=>cosmeticHash(seed+':r'+n)%100;cards.push(rollPackCard(c,rarity,null,seed,r.worlds,()=>roll(cards.length)));}const pack={id,worlds:[...r.worlds],cards,opened:false};state.claims.push(pack);storage.setItem(KEY,JSON.stringify(state));return pack;}
/** Single atomic write before reveal; closing/crashing cannot duplicate rewards. */
export function openPack(id,storage=globalThis.localStorage){const state=collectionState(storage),p=state.claims.find(x=>x.id===id);if(!p)throw Error('Pack introuvable.');if(p.opened)return p;for(const o of p.cards)addToCollection(state,{...o,bump:true});p.opened=true;storage.setItem(KEY,JSON.stringify(state));return p;}
export function pendingPacks(storage=globalThis.localStorage){return collectionState(storage).claims.filter(p=>!p.opened);}
export function hasUnlockedCards(storage=globalThis.localStorage){return collectionState(storage).cards.length>0;}
/** Creator atelier: mint unopened boosters (unlimited while creator mode is on). */
export function grantCreatorPacks(count=1,worlds=['DB'],storage=globalThis.localStorage){
 const n=Math.max(1,Math.min(20,Number(count)||1)),ws=(Array.isArray(worlds)&&worlds.length?worlds:['DB']).filter(w=>['DB','HXH','NARUTO','ONEPIECE'].includes(w));
 const state=collectionState(storage),minted=[];
 for(let p=0;p<n;p++){
  const w=ws[p%ws.length],c=registry([w]),cards=[],id='creator:'+freshId();
  for(let i=0;i<PACK_SIZE;i++){const seed='CREATOR:'+id+':'+i,rarity=rarityForRoll(randomInt(0,99)),finish=rollFinish({randomMode:'live'});cards.push(rollPackCard(c,rarity,finish,seed,w,()=>randomInt(0,99)));}
  const pack={id,worlds:[w],cards,opened:false,creator:true};state.claims.push(pack);minted.push(pack);
 }
 try{storage.setItem(KEY,JSON.stringify(state));}catch{}
 return minted;
}
