import {listMemories,scoreMemory} from '../v20/pantheon-storage.js';

export function worldRecord(world,storage=globalThis.localStorage){
 const list=listMemories(storage).filter(m=>(m.worlds||[]).includes(world)&&!m.incomplete);
 if(!list.length)return null;
 list.sort((a,b)=>{const A=scoreMemory(a),B=scoreMemory(b);for(let i=0;i<A.length;i++){if(A[i]!==B[i])return B[i]-A[i];}return 0;});
 const best=list[0];
 return {bosses:best.bosses|0,depth:best.depth|0,wins:best.wins|0,outcome:best.outcome||'',runId:best.runId};
}

export function recordChipMarkup(world,{resume=false}={}){
 const rec=worldRecord(world);
 const flames='<span class="v23-flames" aria-hidden="true"><i></i><i></i><i></i></span>';
 if(!rec&&!resume)return `<div class="v23-record-chip is-empty" data-v23-record="${world}" hidden></div>`;
 const body=rec
  ?`<b>RECORD</b><span>${rec.bosses} boss · profondeur ${rec.depth}${rec.wins?` · ${rec.wins} victoires`:''}</span>`
  :`<b>RECORD</b><span>Aucune légende encore</span>`;
 const live=resume?'<em class="v23-record-live">EN COURS</em>':'';
 return `<div class="v23-record-chip ${resume?'is-live':''}" data-v23-record="${world}" role="status">${flames}<div class="v23-record-copy">${body}${live}</div></div>`;
}

export function paintWorldRecord(world,saves={}){
 const host=document.querySelector('[data-v23-record]')||document.querySelector('.v15-selection');
 if(!host)return;
 const markup=recordChipMarkup(world,{resume:!!saves[world]});
 if(host.matches('[data-v23-record]'))host.outerHTML=markup;
 else{
  const existing=host.querySelector('[data-v23-record]');
  if(existing)existing.outerHTML=markup;
  else host.insertAdjacentHTML('beforeend',markup);
 }
}
