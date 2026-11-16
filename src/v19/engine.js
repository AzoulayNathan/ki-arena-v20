import {cosmeticHash} from './card-spec.js';
import {ensureStartDraft as ensureLegacyStart,chooseStartDraft as chooseLegacyStart} from '../v17/draft.js';
import {START_RULES,ensureStartDraft,chooseStartDraft} from './draft.js';
import {MIXED_RULES,ensureMixedDraft,chooseMixedDraft} from '../v16/draft.js';
import {registry,ARENA_VERSION,NORMALIZATION} from './catalog.js';
import {seedState,int,pick,shuffle} from '../survival/random.js';
import {rankBudget,distributeExact} from '../survival/encounter.js';
import {distinctWithout} from '../survival/boss.js';
import {runArenaBattle} from '../arena/battle.js';
import {ACT_LENGTH,MAP_ROWS,BOSS_ROW,DRAFT_BANDS,DRAFT_OFFERS,virtualToLocalRank,waveFromDepth,isSpecialEdition} from '../arena/rules.js';
import {beginEvent,applyEventChoice} from './events.js';
import {emptyLedger,applyCombatResult} from '../arena/run-metrics.js';
import {buildRunReceipt} from './run-summary.js';
export const NODE_INFO={normal:['Combat','⚔'],elite:['Élite','✦'],boss:['Boss','♛'],rest:['Repos','☀'],shop:['Marchand','▣'],treasure:['Trésor','◆'],event:['Événement','?']};
export function generateMap(seed,act=0){
  const rng={rng:seedState(seed+':map:'+act)},nodes=[];
  for(let row=0;row<ACT_LENGTH;row++){
    for(const lane of row===BOSS_ROW?[1]:[0,1,2]){
      const kind=row===BOSS_ROW?'boss':row===0?'normal':row===BOSS_ROW-1?'rest':row===4&&lane===1?'elite':pick(rng,['normal','normal','normal','elite','rest','shop','treasure','event']);
      nodes.push({id:`${act}-${row}-${lane}`,row,lane,kind,next:[],done:false});
    }
  }
  for(let row=0;row<BOSS_ROW;row++){
    const direction=int(rng,0,1)?1:-1;
    for(const n of nodes.filter(n=>n.row===row)){
      if(row===BOSS_ROW-1){
        n.next=nodes.filter(x=>x.row===BOSS_ROW).map(x=>x.id);
      }else{
        n.next=nodes.filter(x=>x.row===row+1&&(x.lane===n.lane||(x.lane===n.lane+direction&&int(rng,0,3)>0))).map(x=>x.id);
        if(!n.next.length)n.next=nodes.filter(x=>x.row===row+1&&x.lane===n.lane).map(x=>x.id);
      }
    }
  }
  return nodes;
}
export function availableNodes(r){if(r.phase!=='map')return [];return r.current?r.nodes.find(n=>n.id===r.current).next:r.nodes.filter(n=>n.row===0).map(n=>n.id);}
export function createRun(worlds,seed,{rulesVersion='14.0.0'}={}){
  const cat=registry(worlds,arguments[2]?.statsMode),displayed=String(seed??'ARENA').trim().slice(0,120)||'ARENA';
  return {rulesVersion,runInstanceId:globalThis.crypto?.randomUUID?.()||'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),processedActions:[],schema:1,mode:'arena-expedition',version:ARENA_VERSION,runId:displayed,normalization:arguments[2]?.statsMode==='raw'?'raw-v19':NORMALIZATION,...(rulesVersion===START_RULES?{statsMode:arguments[2]?.statsMode==='raw'?'raw':'normalized'}:{}),poolHash:cat.hash,worlds:cat.worlds,N:cat.N,seed:displayed,rng:seedState(displayed),revision:0,phase:'draft',step:0,offers:[],units:[],dead:[],items:[],coins:80,passives:[],act:0,nodes:generateMap(displayed),current:null,trail:[],wave:1,pending:null,rewards:[],shop:[],history:[],combat:null,uid:0,eventLog:[],activeEvent:null,debtReward:false,omenDanger:false,legacyMap:false,metrics:emptyLedger(),rosterSnapshots:[],receipt:null,voluntaryRetreat:false};
}
function unit(r,c){return {uid:'u'+(++r.uid),cardId:c.id,level:1,wins:0,hp:c.maxHp,maxHp:c.maxHp,attack:c.attack,speed:c.speed,weapon:null,armor:null};}
function offerId(o){return typeof o==='string'?o:o?.id;}
function nearestLegal(local,targetRank,usedPersons,usedIds,hero){
  const ranked=[...local].sort((a,b)=>Math.abs(a.poolRank-targetRank)-Math.abs(b.poolRank-targetRank)||a.poolRank-b.poolRank);
  for(const c of ranked){
    if(usedIds.has(c.id)) continue;
    if(hero&&usedPersons.has(c.person)) continue;
    return c;
  }
  return null;
}
function ensureDraftV13(r){
  if(r.phase!=='draft'||r.offers.length)return;
  const cat=registry(r.worlds,r.statsMode),hero=r.step<5;
  const usedPersons=new Set([...r.units,...r.dead].map(u=>cat.byId.get(u.cardId).person));
  const usedIds=new Set(hero?[]:r.items.map(x=>x.cardId));
  const pool=(hero?cat.heroes:cat.weapons.filter(g=>r.units.some(u=>cat.byId.get(u.cardId).universe===g.universe))).filter(c=>hero?!usedPersons.has(c.person):!usedIds.has(c.id));
  if(pool.length<DRAFT_OFFERS)throw Error('Pas assez de choix distincts.');
  const offers=[];
  for(let i=0;i<DRAFT_OFFERS;i++){
    const band=i===0?'midA':i===1?'midB':'mystery';
    const {lo,hi}=DRAFT_BANDS[band];
    const remaining=pool.filter(c=>!offers.some(o=>o.id===c.id)&&(hero?!usedPersons.has(c.person):!usedIds.has(c.id)));
    const worlds=r.worlds.filter(w=>remaining.some(c=>c.universe===w));
    const w=pick(r,worlds);
    const local=remaining.filter(c=>c.universe===w);
    if(hero){
      const virt=int(r,lo,hi);
      const target=virtualToLocalRank(virt,local.length?Math.max(...local.map(c=>c.poolRank)):cat.N);
      // map virtual into local universe subset by percentile-equivalent poolRank among local
      const localSorted=[...local].sort((a,b)=>a.poolRank-b.poolRank);
      const idx=Math.max(0,Math.min(localSorted.length-1,Math.round((virt/60)*(localSorted.length-1))));
      const approx=localSorted[idx]?.poolRank??target;
      const c=nearestLegal(local,approx,usedPersons,new Set(offers.map(o=>o.id)),true);
      if(!c)throw Error('Draft hero impossible.');
      offers.push({id:c.id,band,revealed:band!=='mystery',virt});
    }else{
      const c=pick(r,local);
      offers.push({id:c.id,band,revealed:band!=='mystery'});
    }
  }
  r.offers=offers;
}
export function isCurrentRules(r){return ['14.0.0','17.0.0',MIXED_RULES,START_RULES].includes(r.rulesVersion);}
const rankedCache=new Map();
export function runCatalog(r){const base=registry(r.worlds,r.statsMode);if(!isCurrentRules(r))return base;if(rankedCache.has(base.key))return rankedCache.get(base.key);const heroes=[...base.heroes].sort((a,b)=>(a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed)||(a.id<b.id?-1:1)).map((h,i)=>({...h,poolRank:i+1}));const c={...base,heroes,byId:new Map(heroes.map(h=>[h.id,h]))};rankedCache.set(base.key,c);return c;}
export function depthWave(r,row){return isCurrentRules(r)?waveFromDepth(r.act,row):Math.floor((r.act*(r.legacyMap?15:ACT_LENGTH)+row)/3)+1;}
export function createRunV16(worlds,seed){return createRun(worlds,seed,{rulesVersion:MIXED_RULES});}
export function createRunV17(worlds,seed){return createRun(worlds,seed,{rulesVersion:'17.0.0'});}
export function markRareNodes(r){if(r.rulesVersion!==START_RULES)return;for(const n of r.nodes)if(n.kind==='event')n.eventRare=cosmeticHash(r.seed+':rare:'+n.id)%9===0;}
export function createRunV19(worlds,seed,statsMode='normalized'){const r=createRun(worlds,seed,{rulesVersion:START_RULES,statsMode});markRareNodes(r);return r;}
export function ensureDraft(r){
 if(r.rulesVersion==='17.0.0')return ensureLegacyStart(r);if(r.rulesVersion===START_RULES)return ensureStartDraft(r);
 if(r.rulesVersion===MIXED_RULES)return ensureMixedDraft(r);
 if(!isCurrentRules(r))return ensureDraftV13(r);
 if(r.phase!=='draft'||r.offers.length)return;
 const c=runCatalog(r),hero=r.step<5,usedPersons=new Set([...r.units,...r.dead].map(u=>c.byId.get(u.cardId).person)),usedIds=new Set(r.items.map(e=>e.cardId)),offeredPersons=new Set(),offeredIds=new Set();
 const bands=['midA','midB','mystery'];r.offers=[];
 for(let i=0;i<3;i++){
  const band=bands[i],{lo,hi}=DRAFT_BANDS[band],worldLists=[];
  for(const w of r.worlds){
   const full=(hero?c.heroes:c.weapons).filter(h=>h.universe===w&&(hero||r.units.some(u=>c.byId.get(u.cardId).universe===w))).sort(hero?(a,b)=>a.rank-b.rank||(a.id<b.id?-1:1):(a,b)=>a.tier-b.tier||(a.atk+a.shield+a.heal)-(b.atk+b.shield+b.heal)||(a.id<b.id?-1:1));
   const min=virtualToLocalRank(lo,full.length),max=virtualToLocalRank(hi,full.length),legal=full.map((card,j)=>({card,rank:j+1})).filter(({card,rank})=>rank>=min&&rank<=max&&!usedIds.has(card.id)&&!offeredIds.has(card.id)&&(!hero||!usedPersons.has(card.person)&&!offeredPersons.has(card.person)));
   if(legal.length)worldLists.push({full,legal,w});
  }
  const token='offer-'+r.step+'-'+i+'-'+r.rng.toString(36);
  if(!worldLists.length){r.offers.push({id:null,token,band,revealed:band!=='mystery',disabled:true,reason:'Aucun candidat compatible dans cette proposition.'});continue;}
  const list=pick(r,worldLists),virt=int(r,lo,hi),target=virtualToLocalRank(virt,list.full.length),selected=[...list.legal].sort((a,b)=>Math.abs(a.rank-target)-Math.abs(b.rank-target)||(a.card.id<b.card.id?-1:1))[0];
  r.offers.push({id:selected.card.id,token,band,virt,revealed:band!=='mystery',universe:list.w,sourceSize:list.full.length,localRank:selected.rank,target});offeredIds.add(selected.card.id);if(hero)offeredPersons.add(selected.card.person);
 }
 if(r.offers.every(o=>o.disabled))throw Error('Ce pool ne permet plus de poursuivre le draft.');
}
export function chooseDraft(r,id){
 if(r.rulesVersion==='17.0.0')return chooseLegacyStart(r,id);if(r.rulesVersion===START_RULES)return chooseStartDraft(r,id);
  if(r.rulesVersion===MIXED_RULES)return chooseMixedDraft(r,id);
  if(r.phase!=='draft')return false;
  const offer=r.offers.find(o=>o.token===id||offerId(o)===id);
  if(!offer||offer.disabled)return false;
  id=offerId(offer);
  const cat=registry(r.worlds,r.statsMode);
  if(r.step<5){
    const c=cat.byId.get(id);
    if(r.units.some(u=>cat.byId.get(u.cardId).person===c.person))return false;
    r.units.push(unit(r,c));
  }else r.items.push({uid:'g'+(++r.uid),cardId:id});
  r.step++;r.offers=[];
  if(r.step===8)r.phase='map';else ensureDraft(r);
  return true;
}
const BOSS_NAMES={DB:/freezer|cell|buu|boo|broly|jiren|vegeta|tao pai pai|beerus|zamasu|goku black|hit\b|moro/i,HXH:/hisoka|illumi|chrollo|meruem|neferpitou|netero|feitan|uvogin|shaiapouf|menthuthuyoupi/i,NARUTO:/madara|kaguya|pain|nagato|orochimaru|obito|itachi/i,ONEPIECE:/kaido|kaidō|big mom|linlin|doflamingo|crocodile|akainu|teach|katakuri|\bimu\b|enel|ener/i};
const bossCandidateCache=new Map(),enemyGearCache=new Map();
function arenaRanks(r,cat,B,k,kind){
  const fallback=distributeExact(r,cat.N,B,k);
  if(kind!=='boss'||new Set(fallback).size<k||k<2)return fallback;
  const candidateKey=cat.key+'|'+B+'|'+k;
  let candidates=isCurrentRules(r)?bossCandidateCache.get(candidateKey):null;
  if(!candidates)candidates=cat.heroes.filter(c=>BOSS_NAMES[c.universe].test(c.name)&&c.poolRank>=Math.ceil(B/k)&&B-c.poolRank>=(k-1)*k/2&&B-c.poolRank<=(k-1)*(2*c.poolRank-k)/2);
  if(isCurrentRules(r))bossCandidateCache.set(candidateKey,candidates);
  for(const c of shuffle(r,candidates)){const rest=isCurrentRules(r)?distributeExact(r,c.poolRank-1,B-c.poolRank,k-1):distinctWithout(r,c.poolRank-1,B-c.poolRank,k-1,c.poolRank);if(rest)return shuffle(r,[c.poolRank,...rest]);}
  return fallback;
}
export function makeEncounter(r,node){
  const cat=runCatalog(r);
  let wave=depthWave(r,node.row);
  if(r.omenDanger&&['normal','elite','boss'].includes(node.kind)){wave+=1;r.omenDanger=false;}
  const kind=node.kind,B=rankBudget(cat.N,wave,kind),k=Math.min(B,wave>=10?Math.max(5,Math.ceil(B/cat.N)):Math.max(Math.ceil(B/cat.N),kind==='boss'?5:kind==='elite'?4:3)),ranks=arenaRanks(r,cat,B,k,kind),tier=Math.min(5,1+Math.floor((wave-1)/5)+(kind==='boss'?1:0)),count=Math.min(k,Math.floor((wave-1)/5)+(kind==='normal'?0:1));
  const enemies=ranks.map((rank,i)=>({...unit(r,cat.heroes[rank-1]),uid:'enemy'+i,rank})),items=[];
  for(let i=0;i<count;i++){const c=cat.byId.get(enemies[i].cardId),key=cat.key+'|'+c.universe+'|'+tier;let pool=isCurrentRules(r)?enemyGearCache.get(key):null;if(!pool){pool=cat.gear.filter(g=>g.universe===c.universe&&g.tier<=tier&&g.category!=='consommable');if(isCurrentRules(r))enemyGearCache.set(key,pool);}if(pool.length){const g=pick(r,pool);enemies[i][g.category==='armure'?'armor':'weapon']=g.id;items.push(g.id);}}
  return {nodeId:node.id,wave,kind,budget:B,ranks,tier,enemies,items};
}
export function enterNode(r,id){
  if(!availableNodes(r).includes(id)||r.nodes.find(n=>n.id===id)?.done||r.trail.includes(id))return false;
  const n=r.nodes.find(n=>n.id===id);
  r.current=id;r.trail.push(id);r.wave=depthWave(r,n.row);
  if(['normal','elite','boss'].includes(n.kind)){r.pending=makeEncounter(r,n);if(isCurrentRules(r))r.wave=r.pending.wave;r.phase='prepare';}
  else if(n.kind==='shop'){r.phase='shop';const c=registry(r.worlds,r.statsMode),owned=new Set(r.items.map(x=>x.cardId)),pool=c.gear.filter(g=>!owned.has(g.id)&&r.units.some(u=>c.byId.get(u.cardId).universe===g.universe));r.shop=shuffle(r,pool).slice(0,3).map(g=>({id:g.id,price:25+g.tier*15,bought:false}));r.careBought=false;}
  else if(n.kind==='treasure'){r.rewards=rewardOptions(r,true);r.phase='reward';}
  else if(n.kind==='event'){r.phase='event';r.activeEvent=null;beginEvent(r);}
  else r.phase=n.kind;
  return true;
}
export function leaveNode(r){
  if(!['rest','event','shop','reward','result'].includes(r.phase))return false;
  const node=r.nodes.find(n=>n.id===r.current);
  if(!node||node.done)return false;
  const lastFight=r.history.at(-1);
  if(node.kind==='boss'&&lastFight?.node===r.current&&!lastFight.win&&r.units.length){r.combat=null;r.rewards=[];r.phase='prepare';return true;}
  node.done=true;r.pending=null;r.combat=null;r.rewards=[];r.activeEvent=null;
  const last=r.history.at(-1);
  const bossCleared=node.kind==='boss'&&last?.node===r.current&&last?.win;
  if(bossCleared){
    r.act++;r.legacyMap=false;r.nodes=generateMap(r.seed,r.act);markRareNodes(r);r.current=null;
  }
  r.phase='map';
  return true;
}
export function equip(r,itemUid,unitUid){if(['combat','end'].includes(r.phase))return false;const c=registry(r.worlds,r.statsMode),entry=r.items.find(g=>g.uid===itemUid),g=c.byItem.get(entry?.cardId),u=r.units.find(u=>u.uid===unitUid);if(!g?.ok||!u||c.byId.get(u.cardId).universe!==g.universe)return false;if(g.category==='consommable'){if(g.effect!=='heal'||u.hp>=u.maxHp)return false;u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*g.heal/100));r.items=r.items.filter(x=>x!==entry);return true;}const slot=g.category==='armure'?'armor':'weapon',same=u[slot]===itemUid;for(const other of r.units)if(other[slot]===itemUid)other[slot]=null;u[slot]=same?null:itemUid;return true;}
export function gearFor(r,u,enemy=false){const c=registry(r.worlds,r.statsMode);return ['weapon','armor'].map(k=>enemy?c.byItem.get(u[k]):c.byItem.get(r.items.find(g=>g.uid===u[k])?.cardId)).filter(Boolean);}
export function battleCard(r,u,enemy=false){const c=registry(r.worlds,r.statsMode).byId.get(u.cardId),gs=gearFor(r,u,enemy),effects=c.effects.map(e=>{const x={...e,key:c.id+':'+e.key};for(const p of['amount','multiplier','damage'])if(typeof x[p]==='number')x[p]=p==='damage'?Math.max(1,Math.round(x[p]*1.5)):Number((x[p]*1.5).toFixed(3));if(typeof x.chance==='number')x.chance=Math.min(.95,Number((x.chance*1.5).toFixed(3)));return x;});for(const g of gs){const key='item:'+g.id;if(g.effect==='pierce')effects.push({key,type:'gear_pierce',name:g.name});if(g.heal)effects.push({key:key+':heal',type:'heal_ally',amount:(g.heal/100)*1.5,name:g.name});if(g.shield&&g.effect!=='hp')effects.push({key:key+':barrier',type:'shield',name:g.name,amount:(g.shield/100)*1.5});const type={stun:'stun',evade:'dodge',counter:'counter'}[g.effect];if(type)effects.push({key,type,name:g.name,chance:1,multiplier:.65*1.5});}const specialMul=(!enemy&&isSpecialEdition(r.seed,u.cardId))?1.1:1;const gearAtk=gs.reduce((s,g)=>s+(g.atk||0)/100*1.5,0);const gearHp=gs.filter(g=>g.effect==='hp').reduce((s,g)=>s+(g.shield||0)/100*1.5,0);return {...c,attack:Math.round(u.attack*specialMul*(1+gearAtk+(enemy?0:r.passives.includes('force')?.5:0)+(enemy?0:r.passives.includes('blood')?.5:0))),maxHp:Math.round(u.maxHp*specialMul*(1+gearHp)),speed:Math.round(u.speed*specialMul),effects};}
export function startCombat(r){if(r.phase!=='prepare'||!r.units.length||!r.pending)return false;const active=r.units.slice(0,5),result=runArenaBattle(active.map(u=>battleCard(r,u)),r.pending.enemies.map(u=>battleCard(r,u,true)),{seed:r.seed+':'+r.current,rules:'canon',maxRounds:30,hpRatiosA:active.map(u=>u.hp/u.maxHp)});r.combat={result,played:active.map(u=>u.uid),cursor:0};r.phase='combat';return true;}
export function completeCombat(r){if(r.phase!=='combat'||!r.combat)return false;const {result,played}=r.combat;r.finalTeam=r.units.map(u=>({...u,role:played.includes(u.uid)?'active':'reserve'}));r.lastCombatLedger=emptyLedger();applyCombatResult(r.lastCombatLedger,result,{combatId:r.seed+':last:'+r.history.length,playedMap:Object.fromEntries(played.map((uid,i)=>['A-'+i,uid]))});for(let i=0;i<played.length;i++){const u=r.units.find(x=>x.uid===played[i]),f=result.final.find(f=>f.uid==='A-'+i);if(!u)continue;if(!f.alive){u.hp=0;u.weapon=null;u.armor=null;r.dead.push({...u,weapon:null,armor:null});r.units=r.units.filter(x=>x!==u);}else u.hp=Math.max(1,Math.round(u.maxHp*f.hp/f.maxHp));}const win=result.winner==='A';r.history.push({node:r.current,wave:r.wave,kind:r.pending.kind,win,rounds:result.rounds,alive:r.units.length});
 applyCombatResult(r.metrics||(r.metrics=emptyLedger()),result,{combatId:r.seed+':'+r.current+':'+r.history.length,playedMap:Object.fromEntries(played.map((uid,i)=>['A-'+i,uid]))});
 r.rosterSnapshots=r.rosterSnapshots||[];r.rosterSnapshots.push({node:r.current,wave:r.wave,kind:r.pending.kind,win,units:played.map((uid,i)=>{const u=[...r.units,...r.dead].find(u=>u.uid===uid);return {uid,cardId:u?.cardId,status:r.dead.some(d=>d.uid===uid)?'dead':'alive',battleUid:'A-'+i};})});if(!win||!r.units.length){r.phase='end';r.endReason='combat-loss';r.rewards=[];r.receipt=buildRunReceipt(r);return true;}for(const u of r.units){u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.25));if(!played.includes(u.uid))continue;u.wins++;const level=1+[2,5,9,14].filter(n=>u.wins>=n).length;if(level>u.level){const factor=Math.pow(1.1,level-u.level),ratio=u.hp/u.maxHp;u.level=level;u.attack=Math.round(u.attack*factor);u.maxHp=Math.round(u.maxHp*factor);u.speed=Math.round(u.speed*factor);u.hp=Math.round(u.maxHp*ratio);}}r.rewards=rewardOptions(r,r.pending.kind==='boss');r.phase='reward';return true;}
export function rewardOptions(r,prestige=false){const c=registry(r.worlds,r.statsMode),owned=new Set(r.items.map(g=>g.cardId)),choices=[{type:'coins',amount:prestige?90:40,title:prestige?'Bourse du boss':'Zénis',text:prestige?'+90 zénis':'+40 zénis'}];if(r.debtReward){choices[0].amount=Math.max(0,Math.floor(choices[0].amount/2));choices[0].text=choices[0].text+' (dette)';}
 if(r.units.some(u=>u.hp<u.maxHp))choices.push({type:'heal',amount:.35,title:'Second souffle',text:'Rend 35% des PV max aux vivants'});const gear=c.gear.filter(g=>!owned.has(g.id)&&g.tier<=Math.min(5,2+Math.floor(r.wave/5)+(prestige?1:0))&&r.units.some(u=>c.byId.get(u.cardId).universe===g.universe));if(gear.length){const g=pick(r,gear);choices.push({type:'item',id:g.id,title:g.name,text:g.category+' · équipement conservé'});}if(r.units.length<8&&r.pending?.enemies){const seen=r.pending.enemies.map(u=>c.byId.get(u.cardId)).filter(ca=>![...r.units,...r.dead,...(r.departed||[])].some(u=>c.byId.get(u.cardId).person===ca.person));if(seen.length){const ca=pick(r,seen);choices.push({type:'recruit',id:ca.id,title:ca.name,text:'Recruter cet adversaire · réserve si équipe pleine'});}}if(prestige&&!r.passives.includes('force'))choices.push({type:'passive',id:'force',title:'Esprit d’équipe',text:'+50% ATQ de run · proposition éditoriale'});if(choices.length<3)choices.push({type:'training',title:'Précision collective',text:'+2% ATQ aux vivants · bonus éditorial de run'});if(choices.length<3)choices.push({type:'vigor',title:'Endurance collective',text:'+2% PV max, ratio préservé · bonus éditorial de run'});const options=[choices[0],...shuffle(r,choices.slice(1)).slice(0,2)];if(isCurrentRules(r)&&r.units.length<5){const rescue=choices.find(x=>x.type==='recruit');if(rescue&&!options.some(x=>x.type==='recruit'))options[options.length-1]=rescue;}return options;}
export function chooseReward(r,index){if(r.phase!=='reward'||!Number.isInteger(index)||!r.rewards[index]||r.nodes.find(n=>n.id===r.current)?.done||!r.nodes.some(n=>n.id===r.current))return false;const rw=r.rewards[index],c=registry(r.worlds,r.statsMode);if(rw.type==='coins'){r.coins+=rw.amount;if(r.debtReward)r.debtReward=false;}if(rw.type==='heal')heal(r,rw.amount);if(rw.type==='item')r.items.push({uid:'g'+(++r.uid),cardId:rw.id});if(rw.type==='recruit')r.units.push(unit(r,c.byId.get(rw.id)));if(rw.type==='passive')r.passives.push(rw.id);if(rw.type==='training')for(const u of r.units)u.attack=Math.round(u.attack*1.02);if(rw.type==='vigor')for(const u of r.units){const ratio=u.hp/u.maxHp;u.maxHp=Math.round(u.maxHp*1.02);u.hp=Math.max(1,Math.round(u.maxHp*ratio));}return leaveNode(r);}
export function heal(r,pct){for(const u of r.units)if(u.hp>0)u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*pct));}
export function rest(r,choice){if(r.phase!=='rest')return false;if(choice==='heal')heal(r,.5);else if(choice==='train')for(const u of r.units)u.attack=Math.round(u.attack*1.03);else return false;return leaveNode(r);}
export function resolveEvent(r,choice){
  // Back-compat: map safe/risk OR scene id
  if(r.phase!=='event')return false;
  beginEvent(r);
  let sceneId=choice;
  if(choice==='safe')sceneId=r.activeEvent.scenes.find(s=>s.tone==='safe')?.id||r.activeEvent.scenes[0].id;
  if(choice==='risk')sceneId=r.activeEvent.scenes.find(s=>s.tone==='risk'||s.tone==='force')?.id||r.activeEvent.scenes.at(-1).id;
  const res=applyEventChoice(r,sceneId);
  if(!res.ok)return false;
  if(res.followup==='force-combat'){
    const n=r.nodes.find(n=>n.id===r.current);
    const kind=['shadow_duel','comet_trial'].includes(r.activeEvent.id)?'elite':'normal';
    r.pending=makeEncounter(r,{...n,kind});if(isCurrentRules(r))r.wave=r.pending.wave;
    r.phase='prepare';
    return true;
  }
  return leaveNode(r);
}
export function buy(r,index){if(r.phase!=='shop')return false;const o=r.shop[index];if(!o||o.bought||r.coins<o.price)return false;r.coins-=o.price;o.bought=true;r.items.push({uid:'g'+(++r.uid),cardId:o.id});return true;}
export function buyCare(r){if(r.phase!=='shop'||r.careBought||r.coins<30||!r.units.some(u=>u.hp<u.maxHp))return false;r.coins-=30;r.careBought=true;heal(r,.35);return true;}
export function swapActive(r,uid,index){if(!['map','prepare'].includes(r.phase)||index<0||index>4)return false;const n=r.units.findIndex(u=>u.uid===uid);if(n<5||!r.units[index])return false;[r.units[n],r.units[index]]=[r.units[index],r.units[n]];return true;}

export function finalizeRun(r,{retreat=false}={}){if(retreat)r.voluntaryRetreat=true;r.phase='end';r.receipt=buildRunReceipt(r);return r.receipt;}
export {buildRunReceipt};
