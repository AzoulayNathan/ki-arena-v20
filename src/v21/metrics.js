import {applyCombatResult as historical} from '../arena/run-metrics.js';
/** Extra V21 facts; old receipts retain their original calculation. */
export function applyCombatResult(ledger,result,options={}){
 const id=options.combatId||result?.seed||'c'+ledger.combatIds.length;if(ledger.combatIds.includes(id))return ledger;
 historical(ledger,result,options);const unit=raw=>ledger.byUnit[options.playedMap?options.playedMap[raw]:raw];
 for(const e of result.events){const target=unit(e.target);if(target&&e.absorbed>0)target.shieldAbsorbed+=e.absorbed;if(target&&e.type==='dot'&&e.damage>0)target.damageTaken+=e.damage;}
 const all=Object.values(ledger.byUnit);for(const key of ['damageDealt','damageTaken','healingDone','shieldAbsorbed'])ledger.system[key]=all.reduce((sum,u)=>sum+(u[key]||0),0);
 return ledger;
}
