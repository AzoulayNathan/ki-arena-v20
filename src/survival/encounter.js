import {bossRanks,describeBoss} from './boss.js';
import {catalog,newUnit} from './catalog.js';
import {int,pick,shuffle} from './random.js';
export function rankBudget(N,v,kind){if(!Number.isInteger(v)||v<1||!['normal','elite','boss'].includes(kind))throw Error('Rencontre invalide');return Math.max(1,Math.round(N/4*(v+({normal:0,elite:1,boss:2}[kind]))*0.5625));}
export function distributeExact(run,N,B,k){
 if(!(k>=1&&k<=B&&B<=k*N))throw Error('Budget impossible');
 const unique=k<=N&&k*(k+1)/2<=B&&B<=k*(2*N-k+1)/2;
 let ranks=[];
 if(unique){let remaining=B,prev=0;for(let pos=0;pos<k;pos++){const rem=k-pos-1,lo=Math.max(prev+1,remaining-rem*(2*N-rem+1)/2),hi=Math.min(N-rem,Math.floor((remaining-rem*(rem+1)/2)/(rem+1))),r=int(run,lo,hi);ranks.push(r);prev=r;remaining-=r;}}
 else{const q=Math.floor(B/k),r=B%k;ranks=Array.from({length:k},(_,i)=>q+(i<r?1:0));if(k>1)for(let i=0;i<3*k;i++){const a=int(run,0,k-1),b=int(run,0,k-1),d=int(run,1,Math.min(30,N));if(a!==b&&ranks[a]+d<=N&&ranks[b]-d>=1){ranks[a]+=d;ranks[b]-=d;}}}
 return shuffle(run,ranks);
}
export function encounter(run,kind){
 const cat=catalog(run.universe),B=rankBudget(cat.N,run.wave,kind),minimum=Math.ceil(B/cat.N),k=run.wave>=10?Math.max(5,minimum):pick(run,[1,2,3,4,5].filter(x=>x>=minimum&&x<=B));
 let ranks=distributeExact(run,cat.N,B,k);if(kind==='boss'&&['9.2.0','9.3.0'].includes(run.rulesVersion))ranks=bossRanks(run,cat,B,k,ranks);const count=Math.min(k,Math.floor((run.wave-1)/5)+(kind==='normal'?0:1)),tier=Math.min(5,1+Math.floor((run.wave-1)/5)+(kind==='boss'?1:0));
 const pool=cat.gear.filter(x=>x.tier<=tier);
 const result={kind,wave:run.wave,budget:B,ranks,tier,units:ranks.map((r,i)=>({...newUnit(cat.heroes[r-1],'enemy-'+i),rank:r})),items:Array.from({length:count},()=>pick(run,pool).id),forcedDuplicates:new Set(ranks).size<k};if(kind==='boss')result.boss=describeBoss(result,cat);return result;
}
