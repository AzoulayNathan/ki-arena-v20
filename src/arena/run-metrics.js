/** Combat facts: stable run unit IDs, HP-capped values from the battle engine. */
export function emptyLedger(){return {schema:2,byUnit:{},system:{damageDealt:0,damageTaken:0,healingDone:0,shieldAbsorbed:0},combatIds:[]};}
export function applyCombatResult(ledger,result,{combatId,playedMap=null}={}){
 if(!ledger||!result)return ledger;const id=combatId||result.seed||'c'+ledger.combatIds.length;if(ledger.combatIds.includes(id))return ledger;
 if(playedMap){if(Object.keys(ledger.byUnit).some(k=>/^[AB]-/.test(k)))ledger.legacyIncomplete=true;ledger.playerOnly=true;}
 const map=uid=>playedMap?playedMap[uid]:uid,local={};
 function bucket(raw,at=0){const uid=map(raw);if(!uid)return null;return local[uid]??={uid,player:!!playedMap,damageDealt:0,damageTaken:0,healingDone:0,lifesteal:0,shieldAbsorbed:0,kos:0,combats:1,firstAt:ledger.combatIds.length*100000+at};}
 for(let i=0;i<(result.events||[]).length;i++){const e=result.events[i];if(['hit','skill_hit','counter_hit'].includes(e.type)&&e.damage>0){const a=bucket(e.actor,i),b=bucket(e.target,i);if(a)a.damageDealt+=e.damage;if(b)b.damageTaken+=e.damage;}if(e.type==='heal'){const a=bucket(e.actor,i),amount=Number(e.amount)||Number((e.message||'').match(/\+(\d+)/)?.[1])||0;if(a)a.healingDone+=Math.max(0,amount);}if(e.type==='ko'&&e.actor!==e.target){const a=bucket(e.actor,i);if(a)a.kos++;}}
 for(const s of result.stats||[]){const b=bucket(s.uid);if(!b)continue;if(s.damage!=null)b.damageDealt=Math.max(0,Number(s.damage)||0);if(s.healing!=null)b.healingDone=Math.max(0,Number(s.healing)||0);}
 if(playedMap)for(const raw of Object.keys(playedMap))bucket(raw);
 for(const value of Object.values(local)){const b=ledger.byUnit[value.uid]??={...value,damageDealt:0,damageTaken:0,healingDone:0,lifesteal:0,shieldAbsorbed:0,kos:0,combats:0};for(const key of ['damageDealt','damageTaken','healingDone','lifesteal','shieldAbsorbed','kos','combats'])b[key]=(b[key]||0)+value[key];b.player=value.player;b.firstAt=Math.min(b.firstAt??value.firstAt,value.firstAt);}
 ledger.combatIds.push(id);ledger.schema=2;return ledger;
}
export function topContributors(ledger,key,limit=3){return Object.values(ledger.byUnit||{}).filter(u=>(!ledger.playerOnly||u.player)&&(u[key]||0)>0).sort((a,b)=>b[key]-a[key]||(a.firstAt??0)-(b.firstAt??0)||String(a.uid).localeCompare(String(b.uid))).slice(0,limit);}
export function distinctions(ledger){return {frappe:topContributors(ledger,'damageDealt'),rempart:topContributors(ledger,'damageTaken'),souffle:topContributors(ledger,'healingDone')};}
