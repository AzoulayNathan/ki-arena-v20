import {registry as legacyRegistry,ARENA_VERSION,NORMALIZATION,WORLDS,worldName,effectDescription,selectedWorlds,percentileProfile,itemEligibility} from '../arena/catalog.js';
export {ARENA_VERSION,NORMALIZATION,WORLDS,worldName,effectDescription,selectedWorlds,percentileProfile,itemEligibility};
const rawCache=new Map();
export function preferredStats(storage=globalThis.localStorage){try{const v=storage?.getItem('kiarena:v19:stats');if(v==='normalized')return 'normalized';return 'raw';}catch{return 'raw';}}
export function registry(worlds,mode='normalized'){
 const c=legacyRegistry(worlds);if(mode!=='raw')return c;
 if(rawCache.has(c.key))return rawCache.get(c.key);
 const heroes=c.heroes.map(h=>({...h,...h.source,total:h.source.attack+h.source.maxHp+h.source.speed})).sort((a,b)=>a.total-b.total||(a.id<b.id?-1:1)).map((h,i)=>({...h,poolRank:i+1}));
 let hash=2166136261;for(const ch of JSON.stringify(['raw-v19',c.hash,heroes.map(h=>[h.id,h.attack,h.maxHp,h.speed])]))hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
 const out={...c,key:c.key+':raw-v19',hash:hash.toString(16),heroes,byId:new Map(heroes.map(h=>[h.id,h]))};rawCache.set(c.key,out);return out;
}
