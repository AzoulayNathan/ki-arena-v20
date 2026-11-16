import {registry} from '../v20/catalog.js';
import {rankBudget} from '../v20/difficulty.js';
import {scaleBudget} from '../v20/prestige.js';
import {pick,rollFinish} from './random.js';
export const INITIAL_BANDS={midA:[50,70],midB:[35,85],mystery:[15,100]};
const poolCache=new Map();
export function sortedPool(r,kind){const c=registry(r.worlds,r.statsMode),represented=new Set(r.units.map(u=>c.byId.get(u.cardId)?.universe)),key=c.key+'|'+kind+'|'+(kind==='weapon'?[...represented].sort().join(','):'');if(poolCache.has(key))return poolCache.get(key);const out= [...(kind==='hero'?c.heroes:c.weapons.filter(g=>!represented.size||represented.has(g.universe)))].sort((a,b)=>score(a,kind)-score(b,kind)||(a.id<b.id?-1:a.id>b.id?1:0)).map((x,i)=>({...x,globalRank:i+1}));poolCache.set(key,out);return out;}
function score(x,k){return k==='hero'?x.attack+x.maxHp+x.speed:(x.atk||0)+(x.shield||0)+(x.heal||0);}
/** Same fractional windows for heroes/weapons; minimum three neighbouring ranks for tiny catalogs. */
export function bounds(N,lo,hi){let a=Math.max(1,Math.round(lo*N)),b=Math.max(a,Math.min(N,Math.round(hi*N)));if(b-a+1<Math.min(3,N)){b=Math.min(N,a+2);a=Math.max(1,b-2);}return {lo:a,hi:b};}
export function contextPower(r){
 const N=registry(r.worlds,r.statsMode).N,node=r.nodes.find(n=>n.id===r.current),v=Math.max(1,r.pending?.wave||r.act*10+(node?.row||0)+1),kind=r.pending?.kind||'normal';
 const B=r.pending?.budget||scaleBudget(rankBudget(N,v,kind),r.prestigeDiff||0),k=r.pending?.enemies?.length||Math.min(B,v>=10?Math.max(5,Math.ceil(B/N)):Math.max(Math.ceil(B/N),kind==='boss'?5:kind==='elite'?4:3));
 return {N,v,kind,budget:B,k,centre:Math.min(1,B/k/N),maxRelicTier:Math.min(4,1+Math.floor((v-1)/5)+(kind==='boss'?1:0))};
}
export function powerBounds(r,kind,band='midA',initial=false){
 const full=sortedPool(r,kind);if(initial){const b=INITIAL_BANDS[band];return {...bounds(full.length,b[0]/600,b[1]/600),N:full.length,centre:60/600};}
 const threat=contextPower(r);let centre=threat.centre;
 // V23: rewards prepare the next two steps. Current average alone made early loot weaker than the starting team.
 // Rank budget and enemy stats stay unchanged; this is a transparent loot policy only.
 if(r.rewardSchema===3){const v=threat.v+2,B=scaleBudget(rankBudget(threat.N,v,'normal'),r.prestigeDiff||0),k=v>=10?Math.max(5,Math.ceil(B/threat.N)):Math.max(3,Math.ceil(B/threat.N)),seenTop=Math.max(0,...(r.pending?.ranks||[]));centre=Math.min(1,Math.max(70/600,B/k/threat.N,seenTop*.9/threat.N));}
 const mult=band==='mystery'?[.5,1.5]:band==='midB'?[.65,1.2]:[.8,1.1];return {...bounds(full.length,centre*mult[0],Math.min(1,centre*mult[1])),N:full.length,centre};
}
export function drawCard(r,kind,band='midA',{initial=false,exclude=new Set(),sameWorld=null,allowOwned=false}={}){
 const c=registry(r.worlds,r.statsMode),full=sortedPool(r,kind),b=powerBounds(r,kind,band,initial),usedPersons=new Set([...r.units,...r.dead,...(r.departed||[])].map(u=>c.byId.get(u.cardId)?.person)),represented=new Set(r.units.map(u=>c.byId.get(u.cardId)?.universe));
 const legal=full.filter(x=>x.globalRank>=b.lo&&x.globalRank<=b.hi&&!exclude.has(x.id)&&!exclude.has('person:'+x.person)&&(!sameWorld||x.universe===sameWorld)&&(kind==='hero'?!usedPersons.has(x.person)&&(initial?x.rarity!=='legendary':true):(!represented.size||represented.has(x.universe)))&&(!initial||!r.useCollection||kind!=='hero'||!r.collectionIds?.length||r.collectionIds.includes(x.id)));
 if(!legal.length)return {kind,band,disabled:true,bounds:b,reason:'Aucun candidat compatible dans cette tranche.'};
 const x=pick(r,legal);return {kind,band,id:x.id,person:x.person,globalRank:x.globalRank,sourceSize:full.length,bounds:b,universe:x.universe,finish:rollFinish(r),disabled:false};
}
export function addHero(r,id,finish='black',{fromDraft=false}={}){const h=registry(r.worlds,r.statsMode).byId.get(id);if(!h)return false;const mul=finish==='gold'?1.1:1,maxHp=Math.round(h.maxHp*mul);const u={uid:'u'+(++r.uid),cardId:id,level:1,wins:0,hp:maxHp,maxHp,attack:Math.round(h.attack*mul),speed:Math.round(h.speed*mul),weapon:null,armor:null,edition:finish==='gold'?'special':'normal',finish,specialApplied:finish==='gold',fromDraft};r.units.push(u);return u;}
export function addItem(r,id,finish='black'){const g=registry(r.worlds,r.statsMode).byItem.get(id);if(!g?.ok)return false;const item={uid:'g'+(++r.uid),cardId:id,finish,edition:finish==='gold'?'special':'normal'};r.items.push(item);return item;}
export function effectiveGear(g,entry){if(entry?.finish!=='gold')return g;return {...g,...Object.fromEntries(['atk','shield','heal'].map(k=>[k,Math.round((g[k]||0)*1.1)])),specialApplied:true};}
