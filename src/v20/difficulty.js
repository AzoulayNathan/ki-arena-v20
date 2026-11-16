/** Current solo policy; separate from the historical N/4*(v+t) reference. */
export const SOLO_BUDGET_FACTOR=.5;
export function rankBudget(N,v,kind){
 if(!Number.isInteger(N)||N<1||!Number.isInteger(v)||v<1||!['normal','elite','boss'].includes(kind))throw Error('Rencontre invalide');
 return Math.max(1,Math.round(N/4*(v+({normal:0,elite:1,boss:2}[kind]))*SOLO_BUDGET_FACTOR));
}
