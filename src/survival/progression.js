import {catalog} from './catalog.js';
export function healLiving(run,pct){let total=0;for(const u of run.units){const n=Math.min(u.maxHp-u.hp,Math.round(u.maxHp*pct));if(u.hp>0){u.hp+=n;total+=n;}}return total;}
export function killUnit(run,id){const i=run.units.findIndex(x=>x.uid===id);if(i<0)return false;const [u]=run.units.splice(i,1);u.hp=0;run.dead.push(u);return true;}
export function afterVictory(run,played){
 const cat=catalog(run.universe),changes=[];
 healLiving(run,.25+(run.relics.includes('garden')?.05:0));
 for(const u of run.units){if(!played.includes(u.uid)||u.level>=5)continue;u.wins++;
 const level=1+[2,5,9,14].filter(t=>u.wins>=t).length;if(level<=u.level)continue;
 const ratio=u.hp/u.maxHp;u.level=level;
 const evo=cat.evolutions.find(e=>e.etat==='VALIDE'&&e.carte_source===u.cardId),target=evo&&cat.byId.get(evo.carte_suivante);
 if(target&&target.person===u.person&&!run.units.some(x=>x.cardId===target.id)&&!run.dead.some(x=>x.cardId===target.id)&&target.attack+target.maxHp+target.speed>u.attack+u.maxHp+u.speed){u.cardId=target.id;u.name=target.name;u.attack=target.attack;u.maxHp=target.maxHp;u.speed=target.speed;changes.push(`${u.name} : évolution validée · niveau ${u.level}`);}
 else{u.attack=Math.round(u.attack*1.1);u.maxHp=Math.round(u.maxHp*1.1);u.speed=Math.round(u.speed*1.1);changes.push(`${u.name} : niveau ${u.level} · +10 %`);}
 u.hp=Math.max(1,Math.min(u.maxHp,Math.round(u.maxHp*ratio)));
 }
 return changes;
}
export function expandField(run){if(run.slots>=5)return false;run.slots++;return true;}
