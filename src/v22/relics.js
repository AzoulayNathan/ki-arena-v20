import {contextPower} from './power.js';
import {pick,int} from './random.js';
const make=(id,name,tier,icon,text,type,params={},target='leader')=>({id,name,tier,icon,text,type,params,target,origin:'EDITORIAL_PROPOSE',asset:'assets/v22/relics/'+id+'.webp'});
export const RELICS=Object.freeze([
 make('bastion','Sceau du bastion',1,'shield','Avant-garde : bouclier de 12 % au départ.','shield',{amount:.12},'front'),
 make('echo','Cloche des échos',1,'bell','Le soutien soigne le plus blessé de 8 % tous les 3 tours joués.','heal_ally',{amount:.08,cycle:'action',every:3},'support'),
 make('return','Anneau de retour',1,'counter','Avant-garde : une riposte ×0,35 par combat.','counter',{multiplier:.35},'front'),
 make('feather','Plume insaisissable',1,'wind','Le plus rapide tente une esquive à 25 % par round.','dodge',{chance:.25,cycle:'round',every:1},'fast'),
 make('needle','Aiguille du duel',1,'eye','Le plus fort vise le plus blessé tous les 2 tours joués.','focus',{cycle:'action',every:2},'strong'),
 make('glass','Verre perforant',1,'prism','L’équipe traverse la moitié des boucliers.','gear_pierce',{},'all'),
 make('thorn','Couronne d’épines',2,'thorn','Avant-garde : renvoie 12 % des dégâts reçus, une fois par round.','thorns',{amount:.12,cycle:'round',every:1},'front'),
 make('purity','Cristal de pureté',2,'crystal','Le soutien dissipe les malus du plus affecté tous les 3 rounds.','cleanse',{cycle:'round',every:3},'support'),
 make('lantern','Lanterne de veille',2,'sun','Le soutien soigne toute l’équipe de 6 % tous les 4 tours joués.','team_heal',{amount:.06,cycle:'action',every:4},'support'),
 make('eclipse','Lame d’éclipse',2,'blade','Le plus fort : une exécution ×1,25 sous 25 % PV ennemis.','execute',{multiplier:1.25,threshold:.25},'strong'),
 make('lens','Lentille révélatrice',2,'eye','Le plus rapide expose la cible : +15 % dégâts pendant 2 rounds, tous les 3 tours joués.','expose',{amount:.15,duration:2,cycle:'action',every:3},'fast'),
 make('clock','Sablier vif',2,'clock','L’équipe gagne 12 % VIT au début du troisième round, une fois.','haste',{amount:.12,minRound:3},'all'),
 make('phoenix','Braise obstinée',3,'flame','Le plus fragile résiste à un K.O. avec 1 PV, une fois.','last_stand',{},'fragile'),
 make('frost','Nœud de givre',2,'snow','Le plus rapide interrompt une cible tous les 4 tours joués.','stun',{cycle:'action',every:4},'fast'),
 make('tide','Marteau des marées',2,'wave','Le plus fort éclabousse un second ennemi à ×0,25 tous les 3 tours joués.','splash',{multiplier:.25,cycle:'action',every:3},'strong'),
 make('fang','Croc vorace',2,'fang','Le plus fort récupère 18 % des dégâts infligés tous les 3 tours joués.','lifesteal',{amount:.18,cycle:'action',every:3},'strong'),
 make('storm','Diapason d’orage',3,'bolt','Le plus rapide fait rebondir un coup à ×0,3 sur deux ennemis, tous les 3 tours joués.','chain',{multiplier:.3,targets:2,cycle:'action',every:3},'fast'),
 make('reaper','Masque du chasseur',2,'mask','Le plus fort récupère 12 % de ses PV après un K.O., 3 fois maximum.','onkill_heal',{amount:.12,limit:3},'strong'),
 make('chorus','Étendard du chœur',2,'banner','Le meneur accorde +7 % ATQ à l’équipe au départ.','team_buff',{amount:.07},'leader'),
 make('aegis','Miroir de l’aube',3,'shield','Le soutien donne un bouclier de 10 % à tous aux rounds 1, 5, 9…','team_shield',{amount:.1,cycle:'round',every:4},'support'),
 make('ember','Charbon ardent',2,'flame','Le plus fort : brûlure de 8 % ATQ, 2 applications, tous les 3 tours joués.','dot',{damageRatio:.08,chance:1,duration:2,cycle:'action',every:3},'strong'),
 make('guardian','Main du gardien',3,'hand','Le premier gardien intercepte un coup fatal destiné à un allié.','intercept',{},'leader'),
 make('rage','Cœur téméraire',3,'heart','Le plus fort gagne +20 % ATQ et +8 VIT sous 35 % PV, une fois.','transform',{atkBuff:.2,speedBuff:8,threshold:.35},'strong'),
 make('renew','Graine du renouveau',2,'leaf','Toute l’équipe régénère 5 % PV aux rounds 1, 4, 7…','regen',{amount:.05,cycle:'round',every:3},'all'),
 make('fortune','Pièce du voyageur',1,'coin','Chaque victoire rapporte 25 % de zénis en plus.','victory_coins',{amount:.25},'run'),
 make('shelter','Ruban du refuge',2,'ribbon','Après une victoire : +10 % PV supplémentaires aux survivants.','victory_heal',{amount:.1},'run'),
 make('compass','Boussole du troc',2,'compass','Réduction de 15 % sur les prochains étals du marchand.','shop_discount',{amount:.15},'run'),
 make('rebirth','Perle du retour',4,'pearl','Le plus fragile ressuscite une fois par combat à 20 % PV.','revive',{amount:.2},'fragile'),
]);
export const RELIC_BY_ID=new Map(RELICS.map(x=>[x.id,x]));
export function ownedRelics(r){return (r.relics||[]).map(x=>RELIC_BY_ID.get(typeof x==='string'?x:x.id)).filter(Boolean);}
export function relicValue(r,type){return Math.min(type==='shop_discount'?.4:.5,ownedRelics(r).filter(x=>x.type===type).reduce((s,x)=>s+(x.params.amount||0),0));}
export function drawRelic(r,{exclude=new Set()}={}){const tier=contextPower(r).maxRelicTier,owned=new Set([...(r.relics||[]).map(x=>typeof x==='string'?x:x.id),...exclude]);const pool=RELICS.filter(x=>x.tier<=tier&&!owned.has(x.id));if(!pool.length)return null;const tickets=pool.flatMap(x=>Array.from({length:[0,9,5,2,1][x.tier]},()=>x));return pick(r,tickets).id;}
export function relicEffects(r,u){const units=r.units.slice(0,5),sort=k=>[...units].sort((a,b)=>b[k]-a[k]||a.uid.localeCompare(b.uid))[0]?.uid,strong=sort('attack'),fast=sort('speed'),fragile=[...units].sort((a,b)=>a.maxHp-b.maxHp||a.uid.localeCompare(b.uid))[0]?.uid,support=units.at(-1)?.uid;
 return ownedRelics(r).filter(x=>x.target!=='run'&&(x.target==='all'||x.target==='front'&&units.indexOf(u)<2||x.target==='leader'&&u.uid===units[0]?.uid||x.target==='strong'&&u.uid===strong||x.target==='fast'&&u.uid===fast||x.target==='fragile'&&u.uid===fragile||x.target==='support'&&u.uid===support)).map(x=>({key:'relic:'+x.id,type:x.type,name:x.name,...x.params,editorial:true}));}
