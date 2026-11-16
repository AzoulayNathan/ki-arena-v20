/** Lossless snapshot interning; never mutates the live battle. */
export function encodeReplay(run){
 if(!['21.0.0','22.0.0'].includes(run?.combatVersion)||!run.combat?.result?.events?.length)return run;
 const pool=[],ids=new Map();
 const events=run.combat.result.events.map(e=>({...e,units:e.units.map(u=>{const key=JSON.stringify(u);let id=ids.get(key);if(id===undefined){id=pool.length;pool.push(u);ids.set(key,id);}return id;})}));
 return {...run,combat:{...run.combat,result:{...run.combat.result,events,replayEncoding:'units-v1',snapshotPool:pool}}};
}
export function decodeReplay(run){
 const result=run?.combat?.result;if(!result?.replayEncoding)return run;
 if(!['21.0.0','22.0.0'].includes(run.combatVersion)||result.replayEncoding!=='units-v1'||!Array.isArray(result.snapshotPool)||!Array.isArray(result.events))throw Error('Replay compressé incompatible.');
 const pool=result.snapshotPool;
 if(pool.length>500000||result.events.length>100000)throw Error('Replay trop volumineux.');
 const events=result.events.map(e=>{if(!Array.isArray(e.units)||e.units.length>10000)throw Error('Instantané de combat invalide.');return {...e,units:e.units.map(id=>{if(!Number.isInteger(id)||id<0||id>=pool.length||!pool[id]||typeof pool[id]!=='object'||typeof pool[id].uid!=='string')throw Error('Référence de combat invalide.');return pool[id];})};});
 const {replayEncoding,snapshotPool,...rest}=result;return {...run,combat:{...run.combat,result:{...rest,events}}};
}
