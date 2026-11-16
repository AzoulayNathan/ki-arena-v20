import {int as oldInt,pick as oldPick,shuffle as oldShuffle,seedState} from '../survival/random.js';
export {seedState};
/** Browser/Node cryptographic entropy; no date/Math.random fallback or player seed. */
export function randomInt(lo,hi){
 if(!Number.isInteger(lo)||!Number.isInteger(hi)||hi<lo)throw Error('Intervalle aléatoire invalide');
 const n=hi-lo+1;if(n>0x100000000)throw Error('Intervalle trop grand');
 const limit=Math.floor(0x100000000/n)*n,a=new Uint32Array(1);let v;
 do{globalThis.crypto.getRandomValues(a);v=a[0];}while(v>=limit);
 return lo+v%n;
}
export function freshId(){const a=new Uint32Array(4);globalThis.crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(8,'0')).join('');}
export function int(r,lo,hi){if(r?.randomMode!=='live')return oldInt(r,lo,hi);r.randomDraws=(r.randomDraws||0)+1;return randomInt(lo,hi);}
export function pick(r,pool){if(!pool.length)throw Error('Pool aléatoire vide');return r?.randomMode==='live'?pool[int(r,0,pool.length-1)]:oldPick(r,pool);}
export function shuffle(r,pool){if(r?.randomMode!=='live')return oldShuffle(r,pool);const a=[...pool];for(let i=a.length-1;i>0;i--){const j=int(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function rollFinish(r){const n=int(r,0,99);return n<10?'gold':n<55?'black':'white';}
