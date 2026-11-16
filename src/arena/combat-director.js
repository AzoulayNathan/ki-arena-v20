/** Presentation queue over battle events — never mutates the result. */
const SKIP = new Set(["order", "attack", "round"]);
const SKILL_TYPES = new Set(["skill", "ultimate", "buff", "phase"]);
const HIT_TYPES = new Set(["hit", "skill_hit", "counter_hit"]);
const KO_TYPES = new Set(["ko"]);

export function isSkillCue(e){return SKILL_TYPES.has(e?.type);}
export function isKoCue(e){return KO_TYPES.has(e?.type);}

export function buildQueue(events=[]){
  const queue=[]; let i=0;
  while(i<events.length){
    const e=events[i];
    if(SKIP.has(e.type)){i++;continue;}
    if(e.type==="result"){queue.push({kind:"result",start:i,end:i+1,events:[e],actor:null,target:null});break;}
    if(isKoCue(e)){queue.push({kind:"spotlight-ko",start:i,end:i+1,events:[e],actor:e.actor,target:e.target});i++;continue;}
    if(isSkillCue(e)){
      const bundle=[e]; let j=i+1;
      while(j<events.length && (HIT_TYPES.has(events[j].type)||["status","heal","shield","dodge","guard"].includes(events[j].type))){
        if(events[j].actor===e.actor||events[j].target===e.target||HIT_TYPES.has(events[j].type)){bundle.push(events[j]);j++; if(HIT_TYPES.has(bundle.at(-1).type)) break;}
        else break;
      }
      while(j<events.length && isKoCue(events[j])){bundle.push(events[j]);j++;}
      const hasKo=bundle.some(isKoCue);
      if(hasKo){const koStart=events.findIndex((x,index)=>index>=i&&index<j&&isKoCue(x));queue.push({kind:"spotlight-skill",start:i,end:koStart,events:bundle.filter(x=>!isKoCue(x)),actor:e.actor,target:e.target});i=koStart;continue;}
      queue.push({kind:"spotlight-skill",start:i,end:j,events:bundle,actor:e.actor,target:bundle.find(x=>HIT_TYPES.has(x.type))?.target||e.target});
      i=j; continue;
    }
    const beat=[e]; let j=i+1;
    while(j<events.length && isKoCue(events[j]) && events[j].target===e.target){beat.push(events[j]);j++;}
    queue.push({kind:beat.some(isKoCue)?"spotlight-ko":"beat",start:i,end:j,events:beat,actor:e.actor,target:e.target});
    i=j;
  }
  return queue;
}

export function beatDuration(beat,speed=1,reduced=false){
  if(reduced) return beat.kind==="result"?40:80;
  const s=Math.max(.5,Number(speed)||1);
  if(beat.kind==="result") return Math.round(200/s);
  if(beat.kind==="spotlight-skill"||beat.kind==="spotlight-skill-ko") return Math.round(1050/s);
  if(beat.kind==="spotlight-ko") return Math.round(1000/s);
  return Math.round(380/s);
}

export function advanceCursor(events,cursor,queue=null){
  const q=queue||buildQueue(events);
  const idx=q.findIndex(b=>cursor<b.end);
  if(idx<0) return {cursor:events.length,beat:null,done:true,queue:q};
  const beat=q[idx];
  return {cursor:beat.end,beat,done:beat.end>=events.length||beat.kind==="result",queue:q};
}

export function displayEvent(beat){
  if(!beat?.events?.length) return null;
  return beat.events.find(isKoCue)||beat.events.find(e=>HIT_TYPES.has(e.type))||beat.events.at(-1);
}
