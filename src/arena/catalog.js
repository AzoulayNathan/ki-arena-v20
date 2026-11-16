import {catalog as sourceCatalog} from '../survival/catalog.js';
import {FRANCHISES,FRANCHISE_IDS} from '../franchises.js';
export const ARENA_VERSION='12.0.0';
export const NORMALIZATION='percentile-v1';
export const WORLDS=FRANCHISE_IDS;
export const worldName=u=>FRANCHISES[u]?.name||u;
const cache=new Map();
export function selectedWorlds(ids){const out=WORLDS.filter(x=>ids?.includes(x));if(!out.length)throw Error('Choisis au moins un manga.');return out;}
export function percentileProfile(c,N){const percentile=(c.rank-.5)/N,total=Math.round(400+1600*Math.pow(percentile,1.8)),attack=Math.round(total*.18),speed=Math.round(total*.10);return {attack,speed,maxHp:total-attack-speed,percentile,total};}
const personal=/rasengan|bij[uûū]|sharingan|rinnegan|haki|mode\s+ermite|susano|amaterasu|chidori|nen.personnel|crazy.slots|blinky|cha[iî]nes? de kurapika|gomu|gum.gum|fruit du|d[oō]jutsu/i;
export function itemEligibility(g){
 if(!g.allowed)return {ok:false,reason:g.reason||'Exclusion du catalogue source'};
 if(personal.test(g.name+' '+(g.class||'')))return {ok:false,reason:'Capacité personnelle : non transférable'};
 if(['draw','scout'].includes(g.effect))return {ok:false,reason:'Pioche réservée au mode Deck Survival historique'};
 if(['NARUTO','ONEPIECE'].includes(g.universe)&&/black voice|melody|paladin|souffle de l.ange|greed island|accompany|sort return|sort trace|blue planet|marque maudite|fils de chakra|griffes de mink/i.test(g.name))return {ok:false,reason:'Contamination du catalogue éditorial ou capacité personnelle'};
 if(g.category==='consommable'&&g.effect!=='heal')return {ok:false,reason:'Consommable sans cible utilisable dans Arène'};
 if(!['atk','pierce','shield','hp','heal','stun','evade','counter'].includes(g.effect))return {ok:false,reason:'Déclencheur non implémenté dans Arène'};
 return {ok:true,reason:'Effet branché sur la préparation ou le combat'};
}
export function registry(ids){const worlds=selectedWorlds(ids),key=worlds.join('+');if(cache.has(key))return cache.get(key);let heroes=[],items=[];
 for(const universe of worlds){const c=sourceCatalog(universe);heroes.push(...c.heroes.map(h=>({...h,sourceId:h.id,id:universe+':'+h.id,person:universe+':'+h.person,source:{attack:h.attack,maxHp:h.maxHp,speed:h.speed},...percentileProfile(h,c.N)})));items.push(...c.items.map(g=>({...g,sourceId:g.id,id:universe+':'+g.id,...itemEligibility(g)})));}
 heroes.sort((a,b)=>a.percentile-b.percentile||(a.id<b.id?-1:a.id>b.id?1:0));heroes=heroes.map((h,i)=>({...h,poolRank:i+1}));const gear=items.filter(g=>g.ok),weapons=gear.filter(g=>g.draft&&g.category==='arme');let fingerprint=2166136261;for(const ch of JSON.stringify([NORMALIZATION,heroes.map(h=>[h.id,h.source,h.effects]),gear.map(g=>[g.id,g.effect,g.atk,g.shield,g.heal])]))fingerprint=Math.imul(fingerprint^ch.charCodeAt(0),16777619)>>>0;
 const result={hash:fingerprint.toString(16),worlds,key,heroes,items,gear,weapons,N:heroes.length,byId:new Map(heroes.map(h=>[h.id,h])),byItem:new Map(items.map(g=>[g.id,g]))};cache.set(key,result);return result;}
export function effectDescription(g){return [g.atk?`ATQ +${g.atk}%`:'',g.effect==='hp'?`PV max +${g.shield}%`:g.shield?`Bouclier ${g.shield}%`:'',g.heal?`Soin ${g.heal}%`:'',({pierce:'Ignore la moitié du bouclier',stun:'Interrompt une action ennemie',evade:'Esquive garantie une fois',counter:'Une riposte au premier coup'})[g.effect]||''].filter(Boolean).join(' · ');}
