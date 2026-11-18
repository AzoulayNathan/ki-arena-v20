import {registry} from '../v20/catalog.js';
import {effects22} from './effects.js';
export function battleCard22(r,u,enemy,gearFor){
 const c=registry(r.worlds,r.statsMode).byId.get(u.cardId),gs=gearFor(r,u,enemy);
 const atk=gs.reduce((s,g)=>s+(g.atk||0)/100,0);
 const hp=gs.filter(g=>g.effect==='hp').reduce((s,g)=>s+(g.shield||0)/100,0);
 const base={...c,effects:c.effects.map(e=>({...e,key:c.id+':'+e.key}))};
 // Stats from gear + full effect stack (name mastery + every CSV field) via effects22/weaponEffects.
 return {...c,attack:Math.round(u.attack*(1+atk)),maxHp:Math.round(u.maxHp*(1+hp)),speed:u.speed,effects:effects22(r,u,base,gs,enemy)};
}
