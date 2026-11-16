/** V22 originals remain byte-for-byte in their old key. A displayed reward is never rerolled. */
export function upgradeRun23(r){
 if(r?.contentVersion!=='22.0.0'||r.releaseVersion==='23.0.0')return r;
 const next=structuredClone(r);next.releaseVersion='23.0.0';next.rewardBundle=null;
 if(next.phase==='reward'&&next.pending){next.upgradeAfterReward23=true;}
 else next.rewardSchema=3;
 return next;
}
