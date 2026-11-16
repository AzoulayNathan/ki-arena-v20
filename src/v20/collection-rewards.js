import {randomInt,freshId,rollFinish} from '../v22/random.js';
import {dropFinish} from '../v21/finish.js';
import {rewardPack as legacyReward,collectionState,PACK_RARITIES,PACK_SIZE,rarityForRoll,openPack,pendingPacks,ensureStarterPack,unlockCard,hasUnlockedCards} from '../v19/collection-rewards.js';
export {collectionState,PACK_RARITIES,PACK_SIZE,rarityForRoll,openPack,pendingPacks,ensureStarterPack,unlockCard,hasUnlockedCards};
import {registry} from '../v19/catalog.js';
import {cosmeticHash,editionFor} from '../v19/card-spec.js';
const KEY='kiarena:personal-collection:v191';
export function packEntitlement(r){if(!r||!r.history?.length)return {count:0,size:0,depth:0};const combatDepth=r.highestResolvedEncounterDepth||Math.max(...r.history.map(h=>Math.max(1,Number(h.wave)||1)));return combatDepth===1?{count:1,size:3,depth:1}:{count:combatDepth-1,size:5,depth:combatDepth};}
export function rewardPack(r,storage=globalThis.localStorage){
 if(r?.rulesVersion!=='20.0.0')return legacyReward(r,storage);
 if(r.phase!=='end')return null;const earned=packEntitlement(r);if(!earned.count)return null;
 const state=collectionState(storage),group=r.runInstanceId,existing=state.claims.find(p=>p.groupId===group);if(existing)return existing;
 const c=registry(r.worlds),claims=[];
 for(let p=0;p<earned.count;p++){const cards=[];for(let i=0;i<earned.size;i++){const seed=r.seed+':v20-pack:'+group+':'+p+':'+i,rarity=rarityForRoll(r.contentVersion==='22.0.0'?randomInt(0,99):cosmeticHash(seed)%100),wantWeapon=(r.contentVersion==='22.0.0'?randomInt(0,99):cosmeticHash(seed+':kind')%100)<20,weapons=(c.weapons||[]).filter(g=>g.rarity===rarity);let pick;if(wantWeapon&&weapons.length){pick=weapons[r.contentVersion==='22.0.0'?randomInt(0,weapons.length-1):cosmeticHash(seed+':w')%weapons.length];cards.push({id:pick.id,finish:r.contentVersion==='22.0.0'?rollFinish({randomMode:'live'}):dropFinish(seed,pick.id),rarity,seed,universe:pick.universe,kind:'weapon'});}else{const pool=c.heroes.filter(h=>h.rarity===rarity);if(!pool.length)throw Error('Aucune carte pour cette rareté');const h=pool[r.contentVersion==='22.0.0'?randomInt(0,pool.length-1):cosmeticHash(seed+':hero')%pool.length];cards.push({id:h.id,finish:r.contentVersion==='22.0.0'?rollFinish({randomMode:'live'}):dropFinish(seed,h.id),rarity,seed,universe:h.universe,kind:'hero'});}}claims.push({id:group+':v20:'+p,groupId:group,worlds:[...r.worlds],cards,opened:false,earnedDepth:earned.depth});}
 state.claims.push(...claims);storage.setItem(KEY,JSON.stringify(state));return claims[0];
}
