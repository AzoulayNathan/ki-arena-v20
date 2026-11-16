import {registry as legacy,ARENA_VERSION,NORMALIZATION,WORLDS,worldName,effectDescription,selectedWorlds,percentileProfile,itemEligibility} from '../v19/catalog.js';
export {ARENA_VERSION,NORMALIZATION,WORLDS,worldName,effectDescription,selectedWorlds,percentileProfile,itemEligibility};
import {cosmeticHash} from '../v19/card-spec.js';
const cache=new Map();
const roles={critical:'Assaut',counter:'Riposte',shield:'Rempart',intercept:'Garde',heal_ally:'Soutien',stun:'Contrôle',focus:'Précision',dot:'Pression'};
const specialists=[
 [/sakura|tsunade|chopper|marco/i,'heal_ally','Appui médical',.12],
 [/gaara|jinbe|jinbē|bartolomeo/i,'shield','Garde préparée',.16],
 [/shikamaru|law|trafalgar|doflamingo/i,'stun','Ouverture tactique',1],
 [/kakashi|zoro|sanji|brook/i,'counter','Riposte préparée',.65],
 [/usopp|nami|tenten/i,'focus','Cible exposée',1]
];
export function registry(worlds,mode='normalized'){
 const base=legacy(worlds,mode),key=base.key+':profiles-v20';if(cache.has(key))return cache.get(key);
 const heroes=base.heroes.map(h=>{
  const source=h.source||h,P=h.attack+h.maxHp+h.speed,total=source.attack+source.maxHp+source.speed;
  const attack=mode==='raw'?h.attack:Math.max(1,Math.round(P*source.attack/total)),speed=mode==='raw'?h.speed:Math.max(1,Math.round(P*source.speed/total)),maxHp=mode==='raw'?h.maxHp:P-attack-speed;
  let effects=h.effects.map(e=>({...e})),role=roles[effects[0]?.type]||'Polyvalent';
  if(['NARUTO','ONEPIECE'].includes(h.universe)){
   const match=specialists.find(([re])=>re.test(h.name));
   if(match){const [,type,name,value]=match;effects[0]={key:'v20-specialty',type,name:name+' · adaptation de jeu',description:'Rôle éditorial de préparation ; effet limité à une activation par combat.',...(type==='heal_ally'||type==='shield'?{amount:value}:type==='counter'?{multiplier:value}:{} )};role=roles[type];}
   else {const factor=[.85,.95,1,1.05,1.15][cosmeticHash(h.person)%5];effects=effects.map(e=>{const x={...e};for(const p of ['amount','multiplier','damage'])if(typeof x[p]==='number')x[p]=p==='damage'?Math.max(1,Math.round(x[p]*factor)):Number((x[p]*factor).toFixed(3));if(typeof x.chance==='number')x.chance=Math.min(.6,Number((x.chance*factor).toFixed(3)));return x;});}
  }
  if(['NARUTO','ONEPIECE'].includes(h.universe))effects=effects.map(e=>({...e,description:describe(e)}));
  return {...h,attack,maxHp,speed,effects,strategyRole:role,gameplayOrigin:'EDITORIAL_GAMEPLAY_V20'};
 }).sort((a,b)=>(a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed)||(a.id<b.id?-1:a.id>b.id?1:0)).map((h,i)=>({...h,poolRank:i+1}));
 const hash=cosmeticHash(JSON.stringify([base.hash,heroes.map(h=>[h.id,h.attack,h.maxHp,h.speed,h.effects])])).toString(16);
 const result={...base,key,hash,heroes,byId:new Map(heroes.map(h=>[h.id,h]))};cache.set(key,result);return result;
}

function describe(e){const p=x=>Math.round(x*100),v=e.amount;return ({shield:'Une fois avant le premier round : bouclier de '+p(v||.18)+' % des PV max.',atk_buff:'Une fois avant le premier round : ATQ +'+p(v||.12)+' %.',critical:'Au premier impact : '+p(e.chance??.25)+' % de chance de dégâts ×'+(e.multiplier||1.5)+'.',heal_ally:'Une fois avant une attaque, si un allié est blessé : soigne '+p(v||.16)+' % de ses PV max, en ciblant le plus blessé.',counter:'Une riposte au premier coup reçu, dégâts de base ×'+(e.multiplier||.7)+'.',focus:'La première attaque vise l’ennemi au plus faible ratio de PV, même en soutien.',stun:'Au premier impact contre une cible survivante : interrompt sa prochaine action.',dot:'Au premier impact : '+p(e.chance??.33)+' % de chance d’infliger '+(e.damage||8)+' dégâts pendant '+(e.duration||2)+' rounds.',lifesteal:'Une fois au premier impact : récupère '+p(v||.2)+' % des dégâts réellement infligés.',team_buff:'Une fois avant le combat : ATQ des alliés +'+p(v||.08)+' %.',team_shield:'Une fois avant le combat : bouclier de '+p(v||.1)+' % des PV max pour les alliés.'})[e.type]||e.description||'Effet de préparation limité à une activation par combat.';}
