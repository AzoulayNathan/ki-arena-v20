/* KI ARENA V3 — Endless roguelike: finite zones, endless escalation.
   All rewards/equipment are run-only except packs and earned recruitment unlocks.
   No DOM; deterministic nodes, combat pools and progression. */
import {CARDS,CARD_MAP} from './catalog.js';
import {seededRandom,runBattle} from './battle.js';
import {randomCard,openPack,packType} from './games.js';
export const GEAR=[
 {id:'power_pole',name:'Bâton extensible',icon:'棒',kind:'weapon',price:45,atkPct:.17,desc:'+17 % ATQ'},
 {id:'weighted_gi',name:'Tenue lestée',icon:'衣',kind:'armor',price:42,hpPct:.24,desc:'+24 % PV max'},
 {id:'scouter',name:'Scouter',icon:'⌖',kind:'weapon',price:49,speed:16,desc:'+16 VIT'},
 {id:'ki_gloves',name:'Gants de ki',icon:'✦',kind:'weapon',price:60,atkPct:.25,desc:'+25 % ATQ'},
 {id:'namek_cloak',name:'Cape de Namek',icon:'▰',kind:'armor',price:60,hpPct:.18,shieldPct:.12,desc:'+18 % PV, bouclier +12 %'},
 {id:'capsule_armor',name:'Armure Capsule',icon:'◈',kind:'armor',price:82,hpPct:.32,desc:'+32 % PV max'},
 {id:'speed_boots',name:'Bottes de vitesse',icon:'↗',kind:'weapon',price:67,speed:23,desc:'+23 VIT'},
 {id:'saiyan_gauntlet',name:'Brassards Saiyan',icon:'✺',kind:'weapon',price:105,atkPct:.35,desc:'+35 % ATQ'},
 {id:'zenkai_vest',name:'Plastron Zenkai',icon:'✧',kind:'armor',price:110,hpPct:.20,atkPct:.12,desc:'+20 % PV, +12 % ATQ'},
];
export const RELICS=[
 {id:'dragon_ball',name:'Dragon Ball',icon:'✷',price:125,desc:'Après chaque combat : +15 % PV max soignés',battleHealPct:.15},
 {id:'capsule_tactical',name:'Capsule tactique',icon:'◉',price:120,desc:'Débloque une place de réserve supplémentaire',reserveSlots:1},
 {id:'kaio_symbol',name:'Sceau de Kaio',icon:'✳',price:100,desc:'Toute l’équipe : +12 % ATQ',atkPct:.12},
 {id:'senzu_planter',name:'Jardin de senzu',icon:'❋',price:110,desc:'Après chaque combat : +10 % PV max',battleHealPct:.10},
 {id:'guardian_emblem',name:'Emblème du gardien',icon:'⬡',price:92,desc:'Toute l’équipe : +15 % PV max',hpPct:.15},
 {id:'chrono_capsule',name:'Capsule temporelle',icon:'◷',price:100,desc:'Toute l’équipe : +10 VIT',speed:10},
 {id:'shenron_wish',name:'Vœu du dragon',icon:'★',price:210,desc:'Débloque une place de réserve + soigne 15 % après combat',reserveSlots:1,battleHealPct:.15},
 {id:'universe_medal',name:'Médaille des univers',icon:'◎',price:130,desc:'Ennemis vaincus : +35 % zénis gagnés',goldPct:.35},
 {id:'gravity_chamber',name:'Chambre gravitationnelle',icon:'▣',price:118,desc:'Toute l’équipe : +10 % ATQ et +8 % PV',atkPct:.10,hpPct:.08}
];
export const CONSUMABLES=[
 {id:'senzu',name:'Haricot Senzu',icon:'◕',price:36,desc:'Restaure 45 % des PV max à une carte'},
 {id:'capsule_heal',name:'Capsule médicale',icon:'✚',price:26,desc:'Restaure 20 % des PV max à toute l’équipe'},
 {id:'training_disk',name:'Disque d’entraînement',icon:'◍',price:55,desc:'Soigne 20 % des survivants et accorde 20 zénis'},
 {id:'revival_senzu',name:'Senzu de résurrection',icon:'✺',price:240,desc:'Ressuscite explicitement UN personnage KO (50 % PV)'},
 {id:'battle_shield',name:'Capsule défensive',icon:'⬡',price:68,desc:'Bouclier +15 % PV au prochain combat'},
 {id:'scout_capsule',name:'Radar tactique',icon:'⌖',price:38,desc:'Révèle le danger du prochain combat et rapporte 20 zénis'},
 {id:'capsule_recall',name:'Capsule de retraite',icon:'⇤',price:95,desc:'Quitte une rencontre non boss avant le combat et rejoint le prochain nœud'}
];
export const EXTRA_GEAR=[
 {id:'finisher_gloves',name:'Gants du finisseur',icon:'✸',kind:'weapon',price:115,atkPct:.29,speed:6,desc:'+29 % ATQ, +6 VIT'},
 {id:'guardian_armor',name:'Armure de gardien',icon:'⬡',kind:'armor',price:118,hpPct:.38,shieldPct:.12,desc:'+38 % PV, bouclier +12 %'},
 {id:'lightning_boots',name:'Bottes éclairs',icon:'ϟ',kind:'weapon',price:96,speed:34,desc:'+34 VIT'},
 {id:'balanced_gi',name:'Gi du survivant',icon:'✦',kind:'armor',price:94,hpPct:.21,atkPct:.10,desc:'+21 % PV, +10 % ATQ'}
];
GEAR.push(...EXTRA_GEAR,
 {id:'exile_gloves',name:'Gants des renforts',icon:'✦',kind:'weapon',price:118,atkPct:.08,desc:'+8 % ATQ, +7 % par combattant en réserve (max +29 %)'},
 {id:'last_pulse_armor',name:'Armure du dernier souffle',icon:'⬡',kind:'armor',price:129,hpPct:.13,desc:'+13 % PV et un bouclier à moins de 40 % PV'},
 {id:'prey_scouter',name:'Scouter de chasseur',icon:'⌖',kind:'weapon',price:123,speed:8,desc:'+8 VIT et +22 % ATQ contre élites ou boss'},
 {id:'supply_vest',name:'Veste de ravitaillement',icon:'▣',kind:'armor',price:111,hpPct:.16,desc:'+16 % PV ; +18 zénis après victoire si le porteur survit'}
);
export const EXTRA_RELICS=[
 {id:'dragon_compass',name:'Boussole du dragon',icon:'⌖',price:132,desc:'Les récompenses en zénis augmentent de 20 %',goldPct:.20},
 {id:'speed_aura',name:'Aura synchronisée',icon:'↯',price:146,desc:'Toute l’équipe gagne 18 VIT',speed:18},
 {id:'kaioken_mark',name:'Marque Kaioken',icon:'✹',price:156,desc:'Toute l’équipe inflige +18 % ATQ',atkPct:.18},
 {id:'namek_growth',name:'Énergie de Namek',icon:'❀',price:155,desc:'Tous les survivants récupèrent 12 % PV après combat',battleHealPct:.12},
 {id:'capsule_vault',name:'Extension Capsule',icon:'◫',price:140,desc:'+2 places dans la réserve',reserveSlots:2}
];
RELICS.push(...EXTRA_RELICS,
 {id:'cartographer',name:'Boussole dimensionnelle',icon:'⌖',price:190,desc:'Explore n’importe quel couloir au prochain embranchement (toutes zones)'},
 {id:'zenkai_legacy',name:'Héritage Zenkai',icon:'✹',price:160,desc:'+8 % ATQ par compagnon KO (max +32 %)'},
 {id:'courage_last',name:'Dernier espoir',icon:'★',price:178,desc:'Quand il reste 2 combattants ou moins : +30 % ATQ'},
 {id:'guardian_barrier',name:'Barrière vitale',icon:'⬡',price:149,desc:'Bouclier de combat si les PV moyens sont sous 60 %'},
 {id:'lucky_scouter',name:'Scouter chanceux',icon:'◉',price:154,desc:'Choix supplémentaire de butin après les combats'},
 {id:'bounty_contract',name:'Contrat de prime',icon:'◎',price:144,desc:'+40 % zénis gagnés contre les élites'}
);
export const ALL_ITEMS=[...GEAR,...RELICS,...CONSUMABLES];
export const BACKGROUNDS=[
 {name:'Terres sauvages',tone:'wilderness'},
 {name:'Désert rocheux',tone:'desert'},
 {name:'Plaines de Namek',tone:'namek'},
 {name:'Ruines urbaines',tone:'ruins'},
 {name:'Arène céleste',tone:'sky'},
 {name:'Chambre du temps',tone:'void'}
];
export const MAP_TYPES={combat:{name:'Combat',icon:'⚔'},elite:{name:'Élite',icon:'☠'},merchant:{name:'Marchand',icon:'◈'},rest:{name:'Repos',icon:'✚'},event:{name:'Événement',icon:'?'},quest:{name:'Défi',icon:'⚑'},treasure:{name:'Trésor',icon:'✷'},empty:{name:'Passage',icon:'·'},boss:{name:'BOSS',icon:'♛'}};
const pick=(arr,rng)=>arr[Math.floor(rng()*arr.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const luck=(seed)=>seededRandom(seed);
export function zoneLength(zone){return Math.min(10,3+zone);} // zone 1: four steps + boss; each zone grows by one to a cap
// The same seed produces exactly the same navigable graph. Each lane connects to
// its own lane and its immediate neighbors; every route joins the boss.
export function generateZone(zone,seed){
 const rng=luck(`${seed}:graph:${zone}`),length=zoneLength(zone),rows=[];
 const pool=['combat','combat','combat','elite','merchant','event','quest','treasure','rest','empty'];
 for(let step=0;step<length;step++){
  const available=step===0?['combat','combat','event','treasure','rest']:step===length-1?['elite','combat','rest','treasure','merchant']:pool;
  const types=[];
  while(types.length<3){const t=pick(available,rng);if(!types.includes(t))types.push(t);}
  rows.push({step,options:types.map((type,lane)=>({type,id:`${zone}:${step}:${lane}`,lane,links:step===length-1?[1]:[lane,lane===1?(rng()<.5?0:2):1].sort()}))});
 }
 rows.push({step:length,options:[{type:'boss',id:`${zone}:${length}:1`,lane:1,links:[]}]});
 return rows;
}
export function availableNodes(run){
 const row=run.nodes?.[run.step];if(!row)return [];
 return row.options.filter(n=>run.lane===null||run.lane===undefined||run.relics?.includes('cartographer')||run.nodes[run.step-1]?.options.some(previous=>previous.lane===run.lane&&previous.links.includes(n.lane)));
}
export function routePick(run,nodeId){
 if(run.status!=='map')return null;
 const node=availableNodes(run).find(n=>n.id===nodeId);
 if(!node)return null;
 run.lane=node.lane;run.currentNode=node.id;
 run.trail=run.trail||[];run.trail.push({zone:run.zone,step:run.step,lane:node.lane,type:node.type,id:node.id});
 return node;
}
// Power is a mean of the actual card statistics: ratios to the median catalog
// card, not a rarity multiplier. Normalized geometric power limits outliers.
const STAT_BASE={attack:77,maxHp:320,speed:85};
export function cardPower(c){if(!c)return 0;return Math.exp(.48*Math.log(Math.max(1,c.attack)/STAT_BASE.attack)+.39*Math.log(Math.max(1,c.maxHp)/STAT_BASE.maxHp)+.13*Math.log(Math.max(1,c.speed)/STAT_BASE.speed));}
export function squadPower(cards,{ratios=[],gear=[],bonus={}}={}){
 if(!cards.length)return 0;
 const a=cards.reduce((total,c,i)=>{
  const g=gear[i]||{};const mod={attack:c.attack*(1+(g.atkPct||0)+(bonus.atkPct||0)),maxHp:c.maxHp*(1+(g.hpPct||0)+(bonus.hpPct||0)),speed:c.speed+(g.speed||0)+(bonus.speed||0)};
  // Current HP influences threat but must not drive selection into an easier tier.
  const value=cardPower(mod);
  return total+value;
 },0);
 return a/cards.length * (.52+.48*Math.min(1,cards.length/5));
}
export function runPower(run){return squadPower(run.teamIds.map(id=>CARD_MAP.get(id)).filter(Boolean),{gear:modifiers(run),bonus:globalBonuses(run)});}
const FORCE_CURVE={start:.54,perZone:.045,perStep:.010,elite:.08,boss:.115,quest:.09};
export function linearTarget(run,type='combat'){
 const initial=run.startPower||squadPower(run.teamIds.map(id=>CARD_MAP.get(id)).filter(Boolean));
 // +15.5% of starting power per zone, +3.7% per encounter: linear, NEVER exponential.
 const progression=FORCE_CURVE.start+FORCE_CURVE.perZone*(run.zone-1)+FORCE_CURVE.perStep*run.step;
 const multiplier=type==='boss'?FORCE_CURVE.boss:type==='elite'?FORCE_CURVE.elite:type==='quest'?FORCE_CURVE.quest:0;
 // Build strength is rewarded; only 18% of extra power is reflected in generation.
 const improvement=clamp(runPower(run)/(initial||.1)-1,0,5);
 return Math.max(.05,initial*(progression+multiplier)*(1+.18*improvement));
}
export function encounterAssessment(run,type='combat'){
 const player=Math.max(.01,runPower(run)),target=linearTarget(run,type);
 const health=run.hpRatios.length?run.hpRatios.reduce((a,b)=>a+b,0)/run.hpRatios.length:0;
 const relative=(target/player)*(1+.28*(1-health))*(5/Math.max(1,run.teamIds.length))**.28;
 return {player:Math.round(player*100)/100,target:Math.round(target*100)/100,relative:Math.round(relative*100)/100,level:relative<.73?0:relative<.94?1:relative<1.19?2:relative<1.48?3:4};
}

export function dangerRating(run,type){
 if(!['boss','elite','combat','quest'].includes(type))return 'Sans combat';
 const a=encounterAssessment(run,type);return ['Favorable','Accessible','Équilibré','Dangereux','Extrême'][a.level];
}
export const BOSS_ARCHETYPES=[
 {id:'bulwark',name:'LE REMPART',clue:'Boucliers collectifs',desc:'L’équipe ennemie commence protégée.',effect:{type:'team_shield',amount:.19}},
 {id:'vengeance',name:'LA RIPOSTE',clue:'Contre-attaques',desc:'Le chef peut riposter après une attaque.',effect:{type:'counter',multiplier:1.0}},
 {id:'storm',name:'LA TEMPÊTE',clue:'Attaque de zone',desc:'Le chef prépare un assaut sur tous les survivants.',effect:{type:'aoe',multiplier:.68}},
 {id:'predator',name:'LE PRÉDATEUR',clue:'Cibles vulnérables',desc:'Le chef concentre son attention sur les blessés.',effect:{type:'focus'}},
 {id:'regent',name:'LE RÉGÉNÉRATEUR',clue:'Soins prolongés',desc:'Le chef récupère régulièrement de l’énergie.',effect:{type:'regen',amount:.10}},
 {id:'flash',name:'LE FLASH',clue:'Initiative',desc:'Le chef agit plus vite et peut esquiver.',effect:{type:'dodge',chance:.33},speed:25},
 {id:'drainer',name:'L’ABSORBEUR',clue:'Vol de vie',desc:'Le chef regagne des PV en blessant ses adversaires.',effect:{type:'lifesteal',amount:.28}},
 {id:'tyrant',name:'LE TYRAN',clue:'Renfort collectif',desc:'Le chef inspire et renforce tous ses alliés.',effect:{type:'team_buff',amount:.12}},
 {id:'breaker',name:'LE BRISEUR',clue:'Frappe doublée',desc:'Une seconde frappe se prépare en combat prolongé.',effect:{type:'extra_strike',multiplier:.9}},
 {id:'ascension',name:'L’ASCENSION',clue:'Transformation',desc:'Le chef change de forme sous pression.',effect:{type:'transform',threshold:.52,atkBuff:.30,speedBuff:18}}
];
export function bossArchetype(run){return BOSS_ARCHETYPES[Math.floor(luck(`${run.seed}:boss:${run.zone}`)()*BOSS_ARCHETYPES.length)];}

export function offerRewards(run,context='battle'){
 const rng=luck(`${run.seed}:offer:${run.zone}:${run.step}:${context}`),pool=[];
 const equipped=Object.values(run.gear||{}).flatMap(x=>Object.values(x));
 for(const g of GEAR)pool.push({id:g.id,weight:equipped.includes(g.id)?1:3});
 for(const c of CONSUMABLES)pool.push({id:c.id,weight:c.id==='revival_senzu'?0.5:3});
 for(const r of RELICS.filter(r=>!run.relics.includes(r.id)))pool.push({id:r.id,weight:context==='boss'?5:context==='elite'?3:1.8});
 const options=[];
 for(let i=0;i<(run.relics.includes('lucky_scouter')?4:3)&&pool.length;i++){
  const sum=pool.reduce((x,a)=>x+a.weight,0);let draw=rng()*sum,index=pool.length-1;
  for(let j=0;j<pool.length;j++){draw-=pool[j].weight;if(draw<=0){index=j;break;}}
  options.push(pool.splice(index,1)[0].id);
 }
 run.rewardOptions=options;return options;
}

export function chooseReward(run,id){
 if(run.status!=='reward'||!run.rewardOptions?.includes(id))return false;
 if(RELICS.some(x=>x.id===id))addRelic(run,id);else addItem(run,id);
 run.rewardOptions=[];
 const next=run.rewardNext||'map';run.rewardNext=null;
 if(next==='recruit')run.status='recruit';else advanceMap(run);
 return true;
}
export function skipReward(run){if(run.status!=='reward')return false;run.gold+=28+run.zone*5;const next=run.rewardNext;run.rewardOptions=[];run.rewardNext=null;if(next==='recruit')run.status='recruit';else advanceMap(run);return true;}
export function chooseRest(run,action,fallenId=null){if(run.status!=='rest')return false;
 if(action==='heal')healRun(run,.35);
 else if(action==='train'){run.gold+=35+run.zone*4;}
 else if(action==='revive'){if(!run.fallen?.length||run.gold<150)return false;const id=fallenId||run.fallen[0];if(!run.fallen.includes(id)||run.teamIds.length>=5&&run.reserves.length>=reserveCapacity(run))return false;run.gold-=150;run.fallen.splice(run.fallen.indexOf(id),1);if(run.teamIds.length<5){run.teamIds.push(id);run.hpRatios.push(.35);}else{run.reserves.push(id);run.reserveHp[id]=.35;}}
 else return false;advanceMap(run);return true;
}
export function switchReserve(run,id,index){const slot=run.reserves.indexOf(id);if(slot<0||index<0||index>=5||!['map','preview','rest','merchant','event','quest','treasure','empty'].includes(run.status))return false;
 const hp=run.reserveHp[id]??1;if(hp<=0)return false;
 if(index>=run.teamIds.length){run.teamIds.push(id);run.hpRatios.push(hp);run.reserves.splice(slot,1);delete run.reserveHp[id];return true;}
 const old=run.teamIds[index],oldHp=run.hpRatios[index];run.teamIds[index]=id;run.hpRatios[index]=hp;run.reserves[slot]=old;run.reserveHp[old]=oldHp;delete run.reserveHp[id];return true;
}
export function createRun(teamIds,seed=Date.now().toString()){
 if(teamIds.length!==5 || new Set(teamIds).size!==5 || teamIds.some(id=>!CARD_MAP.has(id)))throw Error('Cinq cartes distinctes requises');
 return {seed,zone:1,step:0,lane:null,startPower:squadPower(teamIds.map(id=>CARD_MAP.get(id))),nodes:generateZone(1,seed),teamIds:[...teamIds],hpRatios:[1,1,1,1,1],fallen:[],rewardOptions:[],rewardNext:null,reserves:[],reserveHp:{},gold:80,inventory:[{id:'senzu',quantity:1}],gear:{},relics:[],status:'map',pending:null,dragonBalls:0,wishes:0,extraReserve:0,trail:[],recruited:[],earnedPacks:[],wonBattles:0,bosses:0,totalNodes:0,bestDepth:0,log:['RUN COMMENCÉE']};
}
export function reserveCapacity(run){return 1+(run.extraReserve||0)+run.relics.reduce((n,id)=>n+(RELICS.find(r=>r.id===id)?.reserveSlots||0),0);}
export function globalBonuses(run){const m=run.relics.reduce((sum,id)=>{const r=RELICS.find(x=>x.id===id);if(r)for(const k of ['atkPct','hpPct','speed','battleHealPct','goldPct'])sum[k]=(sum[k]||0)+(r[k]||0);return sum;},{});
 if(run.relics.includes('zenkai_legacy'))m.atkPct=(m.atkPct||0)+Math.min(.32,(run.fallen?.length||0)*.08);
 if(run.relics.includes('courage_last')&&run.teamIds.length<=2)m.atkPct=(m.atkPct||0)+.30;
 if(run.relics.includes('guardian_barrier')&&run.hpRatios.length&&run.hpRatios.reduce((a,b)=>a+b,0)/run.hpRatios.length<.60)m.shieldPct=.12;
 return m;
}
export function modifiers(run,type='combat'){
 return run.teamIds.map((id,i)=>Object.values(run.gear[id]||{}).reduce((b,gearId)=>{
  const g=GEAR.find(x=>x.id===gearId);
  if(g)for(const k of ['atkPct','hpPct','speed','shieldPct'])b[k]=(b[k]||0)+(g[k]||0);
  if(gearId==='exile_gloves')b.atkPct=(b.atkPct||0)+Math.min(.21,run.reserves.length*.07);
  if(gearId==='last_pulse_armor'&&(run.hpRatios[i]||0)<=.40)b.shieldPct=(b.shieldPct||0)+.18;
  if(gearId==='prey_scouter'&&['boss','elite'].includes(type))b.atkPct=(b.atkPct||0)+.22;
  return b;
 },{}));
}
export function encounterEnemies(run,type='combat'){
 const rng=luck(`${run.seed}:foe:${run.zone}:${run.step}:${run.lane??1}:${type}`);
 const size=type==='boss'||type==='elite'?5:clamp(3+Math.floor((run.zone-1)/3),3,4);
 const target=linearTarget(run,type)/( .52+.48*size/5);
 const used=new Set(run.teamIds),pool=CARDS.filter(c=>!used.has(c.id));
 const selected=[];
 // Weighted near-target sample: deterministic power band, with diversity.
 for(let i=0;i<size;i++){
  const band=.70+(rng()*.57);
  const desired=target*band;
  const ranked=pool.filter(c=>!used.has(c.id)).map(c=>({c,d:Math.abs(Math.log(Math.max(.01,cardPower(c))/Math.max(.01,desired)))})).sort((a,b)=>a.d-b.d);
  const shortlist=ranked.slice(0,Math.max(6,Math.min(25,Math.ceil(ranked.length*.045))));
  if(!shortlist.length)break;
  const choice=shortlist[Math.floor((rng()**1.9)*shortlist.length)].c;
  used.add(choice.id);selected.push(choice);
 }
 if(type==='boss'){
  const boss=bossArchetype(run);
  return selected.map((c,i)=>i===0?{...c,effects:[...(c.effects||[]),{...boss.effect,key:`ki-v6-boss-${boss.id}`,name:boss.name}]}:c);
 }
 return selected;
}
export function encounterDifficulty(run,type){
 // Stat-selected enemies create the linear curve; multipliers only correct
 // gaps where the 600-card roster has sparse intervals or extremes.
 const foe=encounterEnemies(run,type),actual=squadPower(foe);
 const wanted=linearTarget(run,type);
 return clamp(wanted/Math.max(.02,actual),.83,1.19);
}
export function fight(run,type){
 const foe=encounterEnemies(run,type),bonus=globalBonuses(run),boss=type==='boss'?bossArchetype(run):null;
 const enemyBonus=boss?.speed?{speed:boss.speed}:null;
 const result=runBattle(run.teamIds,foe,{seed:`fight:${run.seed}:${run.zone}:${run.step}:${run.lane??1}:${type}`,rules:'canon',difficultyB:encounterDifficulty(run,type),hpRatiosA:run.hpRatios,modifiersA:modifiers(run,type).map(x=>({...x,shieldPct:(x.shieldPct||0)+(bonus.shieldPct||0)+(run.nextShield||0)})),teamBonusA:bonus,teamBonusB:enemyBonus,bossPhases:type==='boss'});
 return {foe,result,type,boss};
}

export function advanceMap(run){run.step++;run.totalNodes++;run.bestDepth=Math.max(run.bestDepth,run.totalNodes);if(run.step>=run.nodes.length){run.zone++;run.step=0;run.nodes=generateZone(run.zone,run.seed);run.lane=null;}run.status=(run.dragonBalls||0)>=7?'wish':'map';run.pending=null;run.currentNode=null;run.battleCheckpoint=null;}
export function healRun(run,pct){run.hpRatios=run.hpRatios.map(x=>clamp(x+pct,0,1));}
export function markFight(run,encounter){const {result,type,foe}=encounter;if(result.winner!=='A')return {defeat:true};
 const initial=run.teamIds.map((id,i)=>result.final.find(x=>x.uid===`A-${i}`));
 // KO is permanent unless a resurrection is explicitly consumed. Preserve the order of survivors.
 const survivors=[];const hp=[];
 initial.forEach((x,i)=>{if(x&&x.hp>0){survivors.push(run.teamIds[i]);hp.push(clamp(x.hp/x.maxHp+.25,0,1));}else if(!run.fallen.includes(run.teamIds[i]))run.fallen.push(run.teamIds[i]);});
 run.teamIds=survivors;run.hpRatios=hp;
 healRun(run,globalBonuses(run).battleHealPct||0);
 run.nextShield=0;run.wonBattles++;if(type==='boss'){run.bosses++;grantBall(run);}
 const bonusGold=(globalBonuses(run).goldPct||0)+(type==='elite'&&run.relics.includes('bounty_contract')?.40:0);
 const gained=Math.round((16+run.zone*6+(type==='elite'?25:type==='boss'?60:0))*(1+bonusGold));run.gold+=gained;
 for(const id of run.teamIds)if(Object.values(run.gear[id]||{}).includes('supply_vest'))run.gold+=18;
 const pack=type==='boss'?(run.zone>=5?'divine':run.zone>=3?'gold':'silver'):type==='elite'?'silver':packType(run.totalNodes+1);
 const packs=type==='boss'?2:type==='elite'?1:(luck(`${run.seed}:pack:${run.zone}:${run.step}`)()<.24?1:0);
 const reward=[];for(let i=0;i<packs;i++) reward.push(...openPack(pack,1,`${run.seed}-${run.zone}-${run.step}-pack-${i}`));
 run.earnedPacks.push(...reward.map(c=>c.id));
 // One opponent can be recruited after EVERY fight. Keep as a run-only recruit until run end.
 const offers=foe.filter(c=>!run.teamIds.includes(c.id)&&!run.reserves.includes(c.id));
 run.pending={type:'recruit',candidates:offers.map(c=>c.id),gold:gained,pack,obtained:reward.map(c=>c.id),fightType:type};
 run.status='reward';run.rewardNext='recruit';offerRewards(run,type);return {defeat:false,gained,pack,offers,reward};
}
export function recruit(run,id,replaceIndex=null){if(run.status!=='recruit'||!run.pending||run.pending.type!=='recruit')throw Error('Recrutement non disponible');
 if(id&&run.pending.candidates.includes(id)){
  if(run.teamIds.length<5){run.teamIds.push(id);run.hpRatios.push(1);run.recruited.push(id);}else if(run.reserves.length<reserveCapacity(run)){run.reserves.push(id);run.reserveHp[id]=1;run.recruited.push(id);}
  else if(Number.isInteger(replaceIndex)&&replaceIndex>=0&&replaceIndex<run.teamIds.length){
   const oldId=run.teamIds[replaceIndex],oldHp=run.hpRatios[replaceIndex];run.teamIds[replaceIndex]=id;run.hpRatios[replaceIndex]=1;
   // old team card may become a reserve, if space exists; otherwise discard from the run.
   if(!run.reserves.includes(oldId)&&run.reserves.length<reserveCapacity(run)){run.reserves.push(oldId);run.reserveHp[oldId]=oldHp??1;}
   run.recruited.push(id);
  }else throw Error('Réserve pleine : choisir une carte à remplacer');
 }
 advanceMap(run);
}
export function equip(run,itemId,characterId){const item=GEAR.find(i=>i.id===itemId),pos=run.teamIds.indexOf(characterId);
 if(!item||pos<0||!['map','preview','rest','merchant','event','quest','treasure','empty'].includes(run.status))return false;
 const entry=run.inventory.find(i=>i.id===itemId&&i.quantity>0);if(!entry)return false;
 const old=run.gear[characterId]?.[item.kind];if(old)addItem(run,old);
 run.gear[characterId]={...(run.gear[characterId]||{}),[item.kind]:itemId};entry.quantity--;run.inventory=run.inventory.filter(i=>i.quantity>0);return true;
}
export function addItem(run,itemId){const item=run.inventory.find(i=>i.id===itemId);if(item)item.quantity++;else run.inventory.push({id:itemId,quantity:1});}
export function addRelic(run,id){if(!RELICS.some(r=>r.id===id)||run.relics.includes(id))return false;run.relics.push(id);if(id==='dragon_ball')grantBall(run);return true;}
export function grantBall(run,count=1){run.dragonBalls=(run.dragonBalls||0)+count;return run.dragonBalls;}
export function makeWish(run,wish){if(run.status!=='wish'||(run.dragonBalls||0)<7)return false;run.dragonBalls-=7;run.wishes=(run.wishes||0)+1;if(wish==='heal')run.hpRatios=run.hpRatios.map(x=>x>0?1:0);else if(wish==='reserve')run.extraReserve=(run.extraReserve||0)+1;else if(wish==='packs')run.earnedPacks.push(...openPack('gold',2,`${run.seed}:wish:${run.wishes}`).map(c=>c.id));else return false;run.status='map';return true;}
export function consume(run,itemId,index=0,fallenId=null){const item=run.inventory.find(i=>i.id===itemId&&i.quantity>0);if(!item||!CONSUMABLES.some(i=>i.id===itemId)||!['map','preview','rest','merchant','event','quest','treasure','empty'].includes(run.status))return false;
 if(itemId==='senzu'){if(run.hpRatios[index]===undefined||run.hpRatios[index]<=0||run.hpRatios[index]>=1)return false;run.hpRatios[index]=clamp(run.hpRatios[index]+.45,0,1);}
 if(itemId==='revival_senzu'){if(!run.fallen?.length)return false;const id=fallenId||run.fallen[0];if(!run.fallen.includes(id)||run.teamIds.length>=5&&run.reserves.length>=reserveCapacity(run))return false;run.fallen.splice(run.fallen.indexOf(id),1);if(run.teamIds.length<5){run.teamIds.push(id);run.hpRatios.push(.5);}else {run.reserves.push(id);run.reserveHp[id]=.5;}}
 if(itemId==='battle_shield')run.nextShield=(run.nextShield||0)+.15;
 if(itemId==='scout_capsule')run.gold+=20;
 if(itemId==='capsule_recall'){if(run.status!=='map'||availableNodes(run).every(x=>x.type==='boss'))return false;advanceMap(run);}
 if(itemId==='capsule_heal'){if(!run.hpRatios.some(v=>v<1))return false;healRun(run,.2);}
 if(itemId==='training_disk'){healRun(run,.2);run.gold+=20;}
 item.quantity--;run.inventory=run.inventory.filter(i=>i.quantity>0);return true;
}
// Scenario-driven encounters: 12 families × 3 variants = 36 replayable short
// scenes. All choices are explicit and their predictable costs are displayed.
const SCENARIOS=[
 ['Jardin de Karin','Un jardin paisible cache des remèdes.', '✚'],
 ['Épave Capsule','Une capsule est tombée du ciel.','◈'],
 ['Source de Namek','La source dégage une énergie réparatrice.','❀'],
 ['Marché interdit','Un commerçant propose un marché douteux.','◎'],
 ['Salle gravitationnelle','La salle met les corps à rude épreuve.','ϟ'],
 ['Dragon Ball perdue','Une vibration inhabituelle traverse le scouter.','✷'],
 ['Temples engloutis','Un passage ancien dissimule un trésor.','⌖'],
 ['Légende du tournoi','Un arbitre clandestin observe ton équipe.','⚑'],
 ['Caravane brisée','Des réserves abandonnées sont encore intactes.','▣'],
 ['Météore de ki','Une onde énergétique transforme le terrain.','☄'],
 ['Réfugiés de l’univers','Des voyageurs ont besoin de protection.','♡'],
 ['Anomalie temporelle','Une faille permet de modifier une décision passée.','◷']
];
export function rollEvent(run){
 const rng=luck(`${run.seed}:event:${run.zone}:${run.step}:${run.lane}`);
 const family=Math.floor(rng()*SCENARIOS.length),variant=Math.floor(rng()*3);
 const [title,desc,icon]=SCENARIOS[family];
 const i=family*3+variant;
 const gold=30+run.zone*8+variant*8;
 const reward=GEAR[(family*3+variant)%GEAR.length];
 const relic=RELICS[(family*2+variant)%RELICS.length];
 const options=[
  {id:'safe',title:family===5?'Chercher davantage':'Récupérer des zénis',detail:`+${Math.round(gold*.65)} zénis, sans risque`,op:'gold',amount:Math.round(gold*.65)},
  {id:'bold',title:family===5?'Suivre l’énergie':'Prendre le risque',detail:`−12 % PV vivants, +${gold*2} zénis`,op:'risk',amount:gold*2},
  {id:'rare',title:'Faire une découverte',detail:variant===2?'Dragon Ball (choix rare)':'Objet temporaire garanti',op:variant===2?'ball':'item',item:family%3===0?relic.id:reward.id}
 ];
 if(variant===1){options[1]={id:'deal',title:'Échanger des zénis',detail:`Coût 45 zénis → ${relic.name}`,op:'buy',cost:45,item:relic.id};}
 if(variant===0&&family%3===2){options[0]={id:'heal',title:'Se reposer un instant',detail:'+22 % PV des survivants',op:'heal',amount:.22};}
 if(variant===2&&family%2===1){options[2]={id:'trade',title:'Payer pour une relique',detail:`Coût 70 zénis → ${relic.name}`,op:'buy',cost:70,item:relic.id};}
 return {id:`scenario-${i}`,icon,title:variant===0?title:`${title} · ${['','Rencontre','Dernier appel'][variant]}`,desc,options};
}
export function eventResolve(run,event,optionId=null){
 if(run.status!=='event'||run.pending?.event?.id!==event?.id)return false;
 const choice=event.options?.find(x=>x.id===optionId)||(!optionId?event.options?.[0]:null);
 if(!choice)return false;
 if(choice.op==='buy'&&run.gold<choice.cost)return false;
 if(choice.op==='gold'||choice.op==='risk')run.gold+=choice.amount;
 if(choice.op==='heal')healRun(run,choice.amount);
 if(choice.op==='risk')run.hpRatios=run.hpRatios.map(x=>clamp(x-.12,.1,1));
 if(choice.op==='item'||choice.op==='buy'){
  if(choice.op==='buy')run.gold-=choice.cost;
  if(RELICS.some(x=>x.id===choice.item)){
   if(!addRelic(run,choice.item))run.gold+=35;
  }else addItem(run,choice.item);
 }
 if(choice.op==='ball')grantBall(run);
 advanceMap(run);return true;
}

export function shopOffers(run){const rng=luck(`${run.seed}:shop:${run.zone}:${run.step}`),available=[...ALL_ITEMS].filter(x=>!run.relics.includes(x.id));
 return Array.from({length:4},()=>available.splice(Math.floor(rng()*available.length),1)[0]).filter(Boolean);}
export function purchase(run,id){const item=ALL_ITEMS.find(x=>x.id===id);if(!item||run.gold<item.price||run.status!=='merchant'||(run.pending?.shopIds&&!run.pending.shopIds.includes(id)))return false;run.gold-=item.price;
 if(RELICS.some(x=>x.id===id))addRelic(run,id);else addItem(run,id);if(run.pending?.shopIds)run.pending.shopIds=run.pending.shopIds.filter(x=>x!==id);return true;}
export function randomTreasure(run){const rng=luck(`${run.seed}:treasure:${run.totalNodes}`),avail=RELICS.filter(x=>!run.relics.includes(x.id));
 if(rng()<.14){grantBall(run);return {id:'dragon_ball_found',name:'Dragon Ball',icon:'✷',desc:'+1 Dragon Ball (7 pour un vœu)'};}
 if(avail.length && rng()<.65){const item=pick(avail,rng);addRelic(run,item.id);return item;}
 const item=pick([...GEAR,...CONSUMABLES],rng);addItem(run,item.id);return item;
}
export function endRun(run,profile,{forfeit=false}={}){ // claim all earned packs and recruited enemies only at run completion
 for(const id of (forfeit?[]:run.earnedPacks)){profile.owned[id]=(profile.owned[id]||0)+1;}
 // When at least one boss was completed, recruited enemies become permanently collectable.
 const newRecruit=!forfeit&&run.bosses? [...new Set(run.recruited)].filter(id=>CARD_MAP.has(id)):[];
 for(const id of newRecruit)profile.owned[id]=(profile.owned[id]||0)+1;
 profile.bestZone=Math.max(profile.bestZone||0,run.zone);profile.bestWave=Math.max(profile.bestWave||0,run.wonBattles);
 profile.history=[{date:new Date().toISOString(),zone:run.zone,combats:run.wonBattles,bosses:run.bosses,packs:run.earnedPacks.length,recruited:newRecruit.length},...(profile.history||[])].slice(0,20);
 profile.rogue=null;
 return {packs:forfeit?0:run.earnedPacks.length,recruits:newRecruit.length};
}
