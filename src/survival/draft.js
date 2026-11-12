import {catalog,newUnit} from './catalog.js';
import {pick} from './random.js';
export function draftOffers(run){
 const cat=catalog(run.universe),character=run.draftStep<5,pool=character?cat.heroes:cat.weapons,ids=new Set(character?run.units.map(x=>x.cardId):run.items),people=new Set(character?run.units.map(x=>x.person):[]),seen=new Set(),seenPeople=new Set();
 const offers=[];
 for(const [lo,hi] of [[25,35],[25,35],[15,45],[0,60]]){
  const a=Math.max(1,Math.round(lo*pool.length/60)),b=Math.max(1,Math.round(hi*pool.length/60));
  const valid=x=>!ids.has(x.id)&&!seen.has(x.id)&&(!character||!people.has(x.person)&&!seenPeople.has(x.person));
  let choices=pool.filter((x,i)=>i+1>=a&&i+1<=b&&valid(x));
  if(!choices.length)choices=pool.filter(valid);
  if(!choices.length)throw Error('Aucune offre valide');
  const c=pick(run,choices);seen.add(c.id);seenPeople.add(c.person);offers.push(c.id);
 }
 run.offers=offers;return offers;
}
export function chooseDraft(run,index){
 if(run.phase!=='draft'||!Number.isInteger(index)||index<0||index>3)return false;
 const id=run.offers[index],cat=catalog(run.universe);if(!id)return false;
 if(run.draftStep<5)run.units.push(newUnit(cat.byId.get(id)));else run.items.push(id);
 run.history.push({type:'draft',step:run.draftStep,picked:id,choice:index});
 run.draftStep++;run.offers=[];
 if(run.draftStep===8)run.phase='map';else draftOffers(run);
 return true;
}
