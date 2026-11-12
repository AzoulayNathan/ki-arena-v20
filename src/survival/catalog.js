import {SURVIVAL_DATA} from './data.js';
import {CARD_MAP} from '../catalog.js';
export const DATA_VERSION='v9-csv-20261022-arena-4u';
const cached={};
export function catalog(universe){
 if(!SURVIVAL_DATA[universe])throw Error('Univers invalide');
 if(cached[universe])return cached[universe];
 const d=SURVIVAL_DATA[universe];
 const heroes=d.heroes.map(h=>({...h,effects:universe==='DB'?CARD_MAP.get(h.id)?.effects||[]:h.signature.map((e,i)=>({...e,key:h.id+':'+i,editorial:true}))}));
 return cached[universe]={...d,heroes,byId:new Map(heroes.map(x=>[x.id,x])),byItem:new Map(d.items.map(x=>[x.id,x])),gear:d.items.filter(x=>x.allowed),weapons:d.items.filter(x=>x.draft).sort((a,b)=>a.tier-b.tier||(a.id<b.id?-1:1)),N:heroes.length};
}
export const EFFECT_TEXT={atk:'Bonus ATQ tant que porté',pierce:'Bonus ATQ · ignore 50 % du bouclier',shield:'Barrière temporaire à la pose',hp:'PV max renforcés tant que porté',heal:'Soin immédiat d’un vivant',draw:'Pioche bonus à la pose',scout:'Pioche + aperçu du dessus du deck',stun:'Interrompt la prochaine action ennemie, une fois',evade:'Esquive le prochain coup, une fois',counter:'Riposte au premier coup reçu, une fois'};
export function itemText(g){return [g.atk?`+${g.atk} % ATQ`:'',g.shield?`+${g.shield} % ${g.effect==='hp'?'PV max':'bouclier'}`:'',g.heal?`Soin ${g.heal} %`:'',g.draw?`Pioche ${g.draw}`:'',(['pierce','stun','evade','counter'].includes(g.effect)?EFFECT_TEXT[g.effect]:'')].filter(Boolean).join(' · ');}
export function newUnit(c,uid=c.id){return {uid,cardId:c.id,person:c.person,name:c.name,attack:c.attack,maxHp:c.maxHp,speed:c.speed,hp:c.maxHp,level:1,wins:0};}
