import {timing} from './profiles.js';
const omit=new Set(['order','attack','round']);
/** Every impact gets its own beat before its KO. Original battle events are untouched. */
export function buildQueue(events=[]){return events.map((e,i)=>({kind:e.type==='ko'?'spotlight-ko':['skill','ultimate','phase'].includes(e.type)?'spotlight-skill':e.type==='result'?'result':'beat',start:i,end:i+1,events:[e],actor:e.actor,target:e.target})).filter(b=>!omit.has(b.events[0].type));}
export function displayEvent(beat){return beat?.events?.[0]||null;}
export function advanceCursor(events,cursor,queue=null){const q=queue||buildQueue(events),beat=q.find(b=>cursor<b.end);return beat?{cursor:beat.end,beat,done:beat.kind==='result'||beat.end>=events.length,queue:q}:{cursor:events.length,beat:null,done:true,queue:q};}
export function beatDuration(beat,speed=1,reduced=false,ctx={}){return timing(displayEvent(beat),ctx,speed,reduced).total+Math.round((reduced?25:65)/Math.max(1,speed));}
