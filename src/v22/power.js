import {registry} from '../v20/catalog.js';
import {actBase,actBudget,actEnemyCap,actIndexFromWave} from '../v20/difficulty.js';
import {scaleBudget} from '../v20/prestige.js';
import {pick,rollFinish} from './random.js';
/** Absolute start-draft windows on the N=600 reference scale. */
export const INITIAL_BANDS={midA:[20,40],midB:[10,50],mystery:[0,60]};
const REWARD_SPAN={midA:10,midB:20,mystery:30};
const poolCache=new Map();
export function sortedPool(r,kind){const c=registry(r.worlds,r.statsMode),represented=new Set(r.units.map(u=>c.byId.get(u.cardId)?.universe)),key=c.key+'|'+kind+'|'+(kind==='weapon'?[...represented].sort().join(','):'');if(poolCache.has(key))return poolCache.get(key);const out= [...(kind==='hero'?c.heroes:c.weapons.filter(g=>!represented.size||represented.has(g.universe)))].sort((a,b)=>score(a,kind)-score(b,kind)||(a.id<b.id?-1:a.id>b.id?1:0)).map((x,i)=>({...x,globalRank:i+1}));poolCache.set(key,out);return out;}
function score(x,k){
  if(k==='hero')return x.attack+x.maxHp+x.speed;
  // Tier-major score: zero-stat rare/epic must not outrank starter commons.
  return (x.tier||1)*1000+((x.atk||0)+(x.shield||0)+(x.heal||0));
}
/** Same fractional windows for heroes/weapons; minimum three neighbouring ranks for tiny catalogs. */
export function bounds(N,lo,hi){let a=Math.max(1,Math.round(lo*N)),b=Math.max(a,Math.min(N,Math.round(hi*N)));if(b-a+1<Math.min(3,N)){b=Math.min(N,a+2);a=Math.max(1,b-2);}return {lo:a,hi:b};}
export function absoluteBounds(poolN,lo,hi){
 let a=Math.max(1,Math.round(lo)),b=Math.max(a,Math.min(poolN,Math.round(hi)));
 if(b-a+1<Math.min(3,poolN)){b=Math.min(poolN,a+2);a=Math.max(1,b-2);}
 return {lo:a,hi:b,N:poolN};
}
function scaleRef(v,poolN){return Math.max(0,Math.round(v*poolN/600));}
export function contextPower(r){
 const c=registry(r.worlds,r.statsMode),N=c.N,node=r.nodes.find(n=>n.id===r.current);
 const wave=Math.max(1,r.pending?.wave||r.act*10+(node?.row||0)+1),kind=r.pending?.kind||'normal';
 const act=Number.isInteger(r.pending?.act)?r.pending.act:actIndexFromWave(wave);
 const base=actBase(N,act,kind);
 const B=r.pending?.budget||scaleBudget(actBudget(N,act,kind),r.prestigeDiff||0);
 const k=r.pending?.enemies?.length||Math.min(B,actEnemyCap(act));
 return {N,v:wave,act,kind,base,budget:B,k,centre:base,maxRelicTier:Math.min(4,1+act+(kind==='boss'?1:0))};
}
export function powerBounds(r,kind,band='midA',initial=false){
 const full=sortedPool(r,kind),poolN=full.length;
 if(initial){
  const b=INITIAL_BANDS[band];
  // Absolute ranks on the N=600 reference, scaled with poolN/600 (never treat 20..60 as percents).
  const lo=Math.max(band==='mystery'?1:0,scaleRef(b[0],poolN));
  const hi=Math.max(1,scaleRef(b[1],poolN)||1);
  return {...absoluteBounds(poolN,lo||1,hi),centre:Math.max(1,scaleRef(30,poolN)||1)};
 }
 // Map hero-pool actBase (N≈600) onto the target pool so tiny weapon catalogs
 // do not clamp a centre of ~30 into their legendary tip (e.g. DB weapons N=21).
 const threat=contextPower(r);
 const heroCentre=Math.max(1,threat.base||threat.centre||1);
 const centre=Math.max(1,Math.round(heroCentre*poolN/Math.max(1,threat.N||600)));
 const span=REWARD_SPAN[band]||10;
 const scaledSpan=Math.max(1,scaleRef(span,poolN)||1);
 return {...absoluteBounds(poolN,centre-scaledSpan,centre+scaledSpan),centre};
}
export function drawCard(r,kind,band='midA',{initial=false,exclude=new Set(),sameWorld=null,allowOwned=false}={}){
 const c=registry(r.worlds,r.statsMode),full=sortedPool(r,kind),b=powerBounds(r,kind,band,initial),usedPersons=new Set([...r.units,...r.dead,...(r.departed||[])].map(u=>c.byId.get(u.cardId)?.person)),represented=new Set(r.units.map(u=>c.byId.get(u.cardId)?.universe));
 const legal=full.filter(x=>x.globalRank>=b.lo&&x.globalRank<=b.hi&&!exclude.has(x.id)&&!exclude.has('person:'+x.person)&&(!sameWorld||x.universe===sameWorld)&&(kind==='hero'?!usedPersons.has(x.person)&&(initial?x.rarity!=='legendary':true):(!represented.size||represented.has(x.universe))&&(!initial||(x.tier||1)<=2))&&(!initial||!r.useCollection||kind!=='hero'||!r.collectionIds?.length||r.collectionIds.includes(x.id)));
 if(!legal.length)return {kind,band,disabled:true,bounds:b,reason:'Aucun candidat compatible dans cette tranche.'};
 const x=pick(r,legal);return {kind,band,id:x.id,person:x.person,globalRank:x.globalRank,sourceSize:full.length,bounds:b,universe:x.universe,finish:rollFinish(r),disabled:false};
}
export function addHero(r,id,finish='black',{fromDraft=false}={}){const h=registry(r.worlds,r.statsMode).byId.get(id);if(!h)return false;const mul=finish==='gold'?1.1:1,maxHp=Math.round(h.maxHp*mul);const u={uid:'u'+(++r.uid),cardId:id,level:1,wins:0,hp:maxHp,maxHp,attack:Math.round(h.attack*mul),speed:Math.round(h.speed*mul),weapon:null,armor:null,edition:finish==='gold'?'special':'normal',finish,specialApplied:finish==='gold',fromDraft};r.units.push(u);return u;}
export function addItem(r,id,finish='black'){const g=registry(r.worlds,r.statsMode).byItem.get(id);if(!g?.ok)return false;const item={uid:'g'+(++r.uid),cardId:id,finish,edition:finish==='gold'?'special':'normal'};r.items.push(item);return item;}
export function effectiveGear(g,entry){if(entry?.finish!=='gold')return g;return {...g,...Object.fromEntries(['atk','shield','heal'].map(k=>[k,Math.round((g[k]||0)*1.1)])),specialApplied:true};}
