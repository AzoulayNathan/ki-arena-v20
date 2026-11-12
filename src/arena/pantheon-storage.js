/** Local Pantheon of expedition memories — no remote, no currency grants on import. */
export const PANTHEON_KEY='kiarena:pantheon:v12';
export const LIMITS={best:24,recent:12,favorites:24};

function loadRaw(storage=globalThis.localStorage){
  try{return JSON.parse(storage.getItem(PANTHEON_KEY)||'{"schema":1,"memories":[]}');}catch{return {schema:1,memories:[]};}
}
function saveRaw(data,storage=globalThis.localStorage){storage.setItem(PANTHEON_KEY,JSON.stringify(data));}

export function scoreMemory(m){
  return [m.bosses|0, m.depth|0, m.wins|0, -((m.permanentLoss)|0), String(m.runId||'')];
}
function cmpScore(a,b){const A=scoreMemory(a),B=scoreMemory(b);for(let i=0;i<A.length;i++){if(A[i]>B[i])return -1;if(A[i]<B[i])return 1;}return 0;}

export function listMemories(storage=globalThis.localStorage){return loadRaw(storage).memories||[];}

export function upsertMemory(receipt,extra={},storage=globalThis.localStorage){
  if(!receipt||receipt.outcome==='ongoing')return null;
  const data=loadRaw(storage);
  const mem={
    runId:receipt.runId, seed:receipt.seed, worlds:receipt.worlds, version:receipt.version,
    name:extra.name||defaultName(receipt), favorite:!!extra.favorite,
    outcome:receipt.outcome, bosses:receipt.bosses, wins:receipt.wins, losses:receipt.losses,
    depth:receipt.depth, permanentLoss:receipt.permanentLoss, emblems:receipt.emblems||[],
    notableTeam:receipt.notableTeam, honors:receipt.honors, incomplete:!!receipt.incomplete,
    closedAt:receipt.closedAt||Date.now(), rulesLabel:receipt.version,
  };
  const idx=data.memories.findIndex(m=>m.runId===mem.runId);
  if(idx>=0){mem.favorite=data.memories[idx].favorite||mem.favorite;mem.name=data.memories[idx].name||mem.name;data.memories[idx]=mem;}
  else data.memories.push(mem);
  prune(data);
  saveRaw(data,storage);
  return mem;
}

function defaultName(r){return (r.worlds||[]).join('+')+' · souvenir';}

function prune(data){
  const fav=data.memories.filter(m=>m.favorite);
  const rest=data.memories.filter(m=>!m.favorite);
  rest.sort(cmpScore);
  const best=rest.slice(0,LIMITS.best);
  const recent=[...rest].sort((a,b)=>(b.closedAt||0)-(a.closedAt||0)).slice(0,LIMITS.recent);
  const keep=new Map();
  for(const m of [...fav.slice(0,LIMITS.favorites),...best,...recent])keep.set(m.runId,m);
  data.memories=[...keep.values()];
}

export function renameMemory(runId,name,storage=globalThis.localStorage){
  const data=loadRaw(storage);const m=data.memories.find(x=>x.runId===runId);if(!m)return false;m.name=String(name||'').slice(0,80)||m.name;saveRaw(data,storage);return true;
}
export function toggleFavorite(runId,storage=globalThis.localStorage){
  const data=loadRaw(storage);const m=data.memories.find(x=>x.runId===runId);if(!m)return {ok:false};
  if(!m.favorite&&data.memories.filter(x=>x.favorite).length>=LIMITS.favorites)return {ok:false,full:true};
  m.favorite=!m.favorite;saveRaw(data,storage);return {ok:true,favorite:m.favorite};
}
export function exportPantheon(storage=globalThis.localStorage){return JSON.stringify({format:'KI_ARENA_PANTHEON',version:1,exportedAt:Date.now(),...loadRaw(storage)},null,2);}
export function importPantheon(text,storage=globalThis.localStorage){
  if(text.length>5_000_000)throw Error('Fichier trop volumineux.');
  const x=JSON.parse(text);if(x.format!=='KI_ARENA_PANTHEON'||x.version!==1)throw Error('Format incorrect.');
  const data=loadRaw(storage);const map=new Map(data.memories.map(m=>[m.runId,m]));
  for(const m of x.memories||[]){if(!m?.runId)continue;if(!map.has(m.runId))map.set(m.runId,{...m,favorite:!!m.favorite});}
  data.memories=[...map.values()];prune(data);saveRaw(data,storage);return data.memories.length;
}
export function galleryOrder(memories,filter={}){
  let list=[...memories];
  if(filter.worlds?.length)list=list.filter(m=>filter.worlds.every(w=>m.worlds?.includes(w)));
  if(filter.favorite)list=list.filter(m=>m.favorite);
  if(filter.emblem)list=list.filter(m=>(m.emblems||[]).some(e=>e.id===filter.emblem));
  if(filter.recentOnly)return list.sort((a,b)=>(b.closedAt||0)-(a.closedAt||0));
  return list.sort(cmpScore);
}
