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

export function actEnemyCap(act){
 if(!Number.isInteger(act)||act<0)throw Error('Acte invalide');
 if(act<=0)return 3;
 if(act===1)return 4;
 return 5;
}

/** Historical wave formula (kept for older saves / tests). */
export function rankBudget(N,v,kind){
 if(!Number.isInteger(N)||N<1||!Number.isInteger(v)||v<1||!['normal','elite','boss'].includes(kind))throw Error('Rencontre invalide');
 return Math.max(1,Math.round(N/4*(v+({normal:0,elite:1,boss:2}[kind]))*SOLO_BUDGET_FACTOR));
}

/**
 * Spend budget B into enemy ranks 1..N.
 * Free draws: random 1..min(N, remaining) until the last reserved slot,
 * then the last card consumes the remainder (cap N + spill extra units if reste > N).
 */
export function rollEncounterRanks(run,N,B,maxK,intFn){
 if(!(N>=1&&B>=1&&maxK>=1))throw Error('Budget impossible');
 const roll=(lo,hi)=>Math.max(lo,Math.min(hi,intFn(run,lo,hi)));
 const ranks=[];
 let remaining=B;
 while(remaining>0){
  if(ranks.length>=maxK-1){
   const take=Math.min(N,remaining);
   ranks.push(take);
   remaining-=take;
   continue;
  }
  const pick=roll(1,Math.min(N,remaining));
  ranks.push(pick);
  remaining-=pick;
 }
 return ranks;
}
