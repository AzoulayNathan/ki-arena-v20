/** Solo expedition difficulty by act (pool-rank budgets). */
export const SOLO_BUDGET_FACTOR=.5; // kept for legacy save validation / historical tests

/** Act index is 0-based (act 0 = first chapter). */
export function actIndexFromWave(wave){
 if(!Number.isInteger(wave)||wave<1)throw Error('Vague invalide');
 return Math.floor((wave-1)/10);
}

export function actBase(N,act,kind){
 if(!Number.isInteger(N)||N<1||!Number.isInteger(act)||act<0||!['normal','elite','boss'].includes(kind))throw Error('Rencontre invalide');
 const step=N/10;
 const origin={normal:N/20,elite:N/10,boss:3*N/20}[kind];
 return Math.max(1,Math.round(origin+act*step));
}

export function actBudget(N,act,kind){
 return Math.max(1,actBase(N,act,kind)*5);
}

/** Early-act caps (used when wave < 6). */
export function actEnemyCap(act){
 if(!Number.isInteger(act)||act<0)throw Error('Acte invalide');
 if(act<=0)return 3;
 if(act===1)return 4;
 return 5;
}

/**
 * Wave enemy caps:
 * - vague < 6  → act caps (3/4/5)
 * - vague 6–9  → 6
 * - vague 10–13 → 7
 * - vague ≥ 14 → unlimited (null)
 */
export function waveEnemyCap(wave,act=0){
 if(!Number.isInteger(wave)||wave<1)throw Error('Vague invalide');
 if(wave>=14)return null;
 if(wave>=10)return 7;
 if(wave>=6)return 6;
 return actEnemyCap(act);
}

/** Historical wave formula (kept for older saves / tests). */
export function rankBudget(N,v,kind){
 if(!Number.isInteger(N)||N<1||!Number.isInteger(v)||v<1||!['normal','elite','boss'].includes(kind))throw Error('Rencontre invalide');
 return Math.max(1,Math.round(N/4*(v+({normal:0,elite:1,boss:2}[kind]))*SOLO_BUDGET_FACTOR));
}

/**
 * Spend budget B into enemy ranks 1..N.
 * Every seat (not only the last) has a floor so leftover points fit in the
 * remaining seats (each ≤ N) — avoids dumping everything on the final draw.
 * When maxK is null/∞, keeps adding units until the budget is spent.
 */
export function rollEncounterRanks(run,N,B,maxK,intFn){
 if(!(N>=1&&B>=1))throw Error('Budget impossible');
 const unlimited=maxK==null||!Number.isFinite(maxK)||maxK<=0;
 // Fewest seats that can hold B at ≤N each. Unlimited = no max, still prefer that floor
 // and only spill extra units if a last seat overflows N.
 const need=Math.max(1,Math.ceil(B/N));
 const hardCap=unlimited?Math.max(need,B):Math.max(1,Math.floor(maxK));
 const roll=(lo,hi)=>{
  const a=Math.max(1,Math.min(N,lo)),b=Math.max(a,Math.min(N,hi));
  return Math.max(a,Math.min(b,intFn(run,a,b)));
 };
 // Capped: use up to hardCap seats (at least `need`).
 // Unlimited (vague ≥14): at least 7 foes, grow further if budget needs more seats / spill.
 const K=unlimited?Math.max(7,need):Math.min(hardCap,Math.max(need,Math.min(hardCap,B)));
 const ranks=[];
 let remaining=B;
 for(let i=0;i<K;i++){
  const after=K-i-1; // seats after this one
  if(after===0){
   while(remaining>0){
    const take=Math.min(N,remaining);
    ranks.push(take);
    remaining-=take;
    if(!unlimited)break;
   }
   break;
  }
  // Floor: leave at most N per later seat. Ceiling: leave at least 1 each.
  const minTake=Math.max(1,remaining-after*N);
  const maxTake=Math.min(N,remaining-after);
  const take=roll(Math.min(minTake,maxTake),Math.max(minTake,maxTake));
  ranks.push(take);
  remaining-=take;
 }
 while(remaining>0){
  if(!unlimited&&ranks.length>=hardCap){
   ranks[ranks.length-1]=Math.min(N,ranks[ranks.length-1]+remaining);
   break;
  }
  const take=Math.min(N,remaining);
  ranks.push(take);
  remaining-=take;
 }
 return ranks;
}
