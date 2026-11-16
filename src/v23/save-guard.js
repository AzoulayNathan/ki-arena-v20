/** Protect a completed choice from an older tab overwriting local progress. */
export function assertFresh23(next,previous){
 if(next?.releaseVersion!=='23.0.0'||previous?.runInstanceId!==next.runInstanceId)return;
 if((previous.revision||0)>(next.revision||0))throw Error('Une autre fenêtre a avancé cette aventure. Recharge avant de continuer.');
 const old=previous.rewardBundle||previous.lastLoot;if(!old?.claims?.length)return;
 const counterpart=next.rewardBundle?.node===old.node?next.rewardBundle:next.lastLoot?.node===old.node?next.lastLoot:null;
 const claims=counterpart?.claims||next.history.find(h=>h.node===old.node)?.lootClaims||[];
 if(old.claims.length>claims.length||old.claims.some((x,i)=>x.token!==claims[i]?.token))throw Error('Ces gains ont déjà été enregistrés dans une autre fenêtre. Recharge cette aventure.');
}
export function runIsStale23(run,latest){return run?.releaseVersion==='23.0.0'&&!!latest&&(latest.runInstanceId!==run.runInstanceId||latest.revision!==run.revision);}
