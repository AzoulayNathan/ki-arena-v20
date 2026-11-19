import {registry} from '../v20/catalog.js';
import {actBudget,threatAct} from '../v20/difficulty.js';
import {scaleBudget} from '../v20/prestige.js';
import {drawCard,addHero,addItem,contextPower,powerBounds} from '../v22/power.js';
import {drawObject,objectPool} from '../v22/economy.js';
import {drawRelic,RELIC_BY_ID} from '../v22/relics.js';
import {freshId,pick} from '../v22/random.js';

export const REWARD_SCHEMA=3;
export const hasRewardBundle=r=>r?.rewardSchema===REWARD_SCHEMA&&r.rewardBundle?.schema===REWARD_SCHEMA;
export const isBossReward=r=>!!r?.rewardBundle?.boss;
export const hasActBoon=r=>!!r?.actBoon&&r.phase==='act-boon'&&!r.actBoon.claimed;

function cardDraft(r,kind,{boss=false}={}){
 const used=new Set(),poolWorlds=[...new Set(r.units.map(u=>registry(r.worlds,r.statsMode).byId.get(u.cardId).universe))].sort();
 if(kind==='gear'){
  const offers=['midA','midB','mystery'].map((band,i)=>{
   const wantObject=i===1||(i===2&&pick(r,[true,false]));
   if(wantObject){const o=drawObject(r,{exclude:used,band});if(o.id)used.add(o.id);return {...o,poolWorlds,type:i===2?'mystery':'item',revealed:i<2,title:i===2?'Le destin caché':o.category==='consommable'?'Un objet de soin':'Un outil de route'};}
   const o=drawCard(r,'weapon',band,{exclude:used});if(o.id)used.add(o.id);return {...o,poolWorlds,type:i===2?'mystery':'item',revealed:i<2,title:i===2?'Le destin caché':'Une nouvelle arme'};
  });
  if(offers.every(o=>o.disabled))offers.push({type:'coins',amount:30+3*contextPower(r).v,title:'Provisions de route',text:'Aucun équipement disponible dans ce palier. Compensation en zénis.',disabled:false});
  return {kind:'gear',offers};
 }
 const bands=['midA','midB','mystery'];
 const offers=bands.map((band,i)=>{const o=drawCard(r,kind,band,{exclude:used});if(o.id){used.add(o.id);if(kind==='hero')used.add('person:'+o.person);}return {...o,poolWorlds,type:i===2?'mystery':kind==='hero'?'recruit':'item',revealed:i<2,title:i===2?'Le destin caché':boss?(kind==='hero'?'Allié du boss':'Arme du boss'):(kind==='hero'?'Un nouvel allié':'Une nouvelle arme')};});
 if(offers.every(o=>o.disabled))offers.push({type:'coins',amount:30+3*contextPower(r).v,title:'Provisions de route',text:'Aucun candidat disponible dans ce palier. Compensation en zénis.',disabled:false});
 return {kind,offers};
}
function boonDraft(r){
 const relic=drawRelic(r),offers=[{type:'heal',amount:.25,title:'Souffle partagé',disabled:!r.units.some(u=>u.hp<u.maxHp)},{type:'relic',id:relic,title:'Une relique inconnue',disabled:!relic}];
 if(offers.every(x=>x.disabled))offers.push({type:'coins',amount:25+3*contextPower(r).v,title:'Provisions de route',text:'Équipe en pleine santé et toutes les reliques du palier déjà acquises.',disabled:false});
 return {kind:'boon',offers};
}
function prepareStage(r){
 const b=r.rewardBundle,s=b.stage;let stage=b.stages[s];
 if(!stage.ready){
  if(b.boss)stage=cardDraft(r,stage.kind,{boss:true});
  else stage=s===2?boonDraft(r):cardDraft(r,stage.kind);
  stage.ready=true;b.stages[s]=stage;
  for(const [i,o]of stage.offers.entries())o.claimToken=b.id+':'+s+':'+i;
 }
 r.rewards=stage.offers;return stage.offers;
}
function fullHealTeam(r){for(const u of r.units)if(u.hp>0)u.hp=u.maxHp;}

/** Boss loot is hero + weapon only. Full heal / relic / elite treasure wait for act start. */
export function beginRewards23(r){
 if(hasRewardBundle(r)&&r.rewardBundle.node===r.current)return r.rewardBundle.stages[r.rewardBundle.stage]?.offers||[];
 const boss=contextPower(r).kind==='boss';
 const kinds=boss?['hero','weapon']:['hero','gear','boon'];
 r.rewardBundle={schema:REWARD_SCHEMA,id:freshId(),node:r.current,context:contextPower(r),stage:0,claims:[],boss,stages:kinds.map(kind=>({kind,ready:false,offers:[]}))};
 r.rewardClaimed=false;r.rewardLockedIndex=null;return prepareStage(r);
}

export function chooseBundleReward23(r,index,replaceUid=null,expectedToken=null){
 const b=r.rewardBundle,need=b?.stages?.length||3;
 if(r.phase!=='reward'||!hasRewardBundle(r)||b.node!==r.current||b.stage>=need||r.rewardClaimed||!Number.isInteger(index)||r.nodes.find(n=>n.id===r.current)?.done)return false;
 const o=r.rewards[index];if(!o||o.disabled||expectedToken&&expectedToken!==o.claimToken||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==index)return false;
 if(JSON.stringify(o)!==JSON.stringify(b.stages[b.stage].offers[index])||b.claims.some(c=>c.stage===b.stage))return false;
 const stage=b.stages[b.stage],c=registry(r.worlds,r.statsMode);let earned;
 if(o.kind==='hero'){
  const hero=c.byId.get(o.id);if(!hero||r.units.some(u=>c.byId.get(u.cardId).person===hero.person))return false;
  const unit=addHero(r,o.id,o.finish);if(!unit)return false;
  earned={type:'hero',cardId:o.id,finish:o.finish,uid:unit.uid};
 }else if(o.kind==='weapon'||o.kind==='object'){
  const g=c.byItem.get(o.id);if(!g?.ok||!r.units.some(u=>c.byId.get(u.cardId).universe===g.universe))return false;
  const item=addItem(r,o.id,o.finish);if(!item)return false;earned={type:o.kind==='object'?'object':'weapon',cardId:o.id,finish:o.finish,uid:item.uid,category:g.category};
 }else if(o.type==='heal'){
  let healed=0;for(const u of r.units){if(u.hp<=0)continue;const hp=u.hp;u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.25));healed+=u.hp-hp;}earned={type:'heal',amount:.25,healed};
 }else if(o.type==='relic'){
  if(!RELIC_BY_ID.has(o.id)||(r.relics||[]).includes(o.id))return false;(r.relics??=[]).push(o.id);earned={type:'relic',id:o.id};
 }else if(o.type==='coins'&&o.amount>0){r.coins+=o.amount;earned={type:'coins',amount:o.amount};}else return false;
 b.claims.push({stage:b.stage,token:o.claimToken,...earned});b.stage++;r.rewardLockedIndex=null;
 if(b.stage===need){r.rewardClaimed=true;r.rewards=[];const fight=r.history.at(-1);if(fight?.node===r.current)fight.lootClaims=structuredClone(b.claims);}
 else prepareStage(r);
 return true;
}

/** Elite-power treasure for the act just started (threatAct of current act, kind elite). */
function eliteTreasureDraft(r){
 const c=registry(r.worlds,r.statsMode),N=c.N,act=threatAct(r,r.act|0);
 const saved=r.pending;
 r.pending={nodeId:null,wave:Math.max(1,(r.act|0)*10+1),kind:'elite',budget:scaleBudget(actBudget(N,act,'elite'),r.prestigeDiff||0),ranks:[],tier:Math.min(5,2+(r.act|0)),enemies:[],items:[],act:r.act|0,threatAct:act};
 const used=new Set();
 let o=drawCard(r,'weapon','midA',{exclude:used});
 if(o.disabled)o=drawObject(r,{exclude:used,band:'midA'});
 if(o.id)used.add(o.id);
 r.pending=saved;
 if(o.disabled||!o.id){
  return {type:'coins',amount:45+5*(r.act|0),title:'Trésor d’élite',text:'Le coffre est vide — compensation en zénis digne d’un élite.',disabled:false};
 }
 const g=c.byItem.get(o.id);
 return {
  ...o,
  type:'treasure',
  title:'Trésor d’élite',
  text:'Butin équivalent à un élite de l’acte '+(r.act+1)+'.',
  revealed:true,
  category:g?.category||'arme',
  disabled:false,
 };
}

export function beginActBoon23(r){
 const id=freshId();
 const relicId=drawRelic(r);
 const treasure=eliteTreasureDraft(r);
 const hurt=r.units.some(u=>u.hp>0&&u.hp<u.maxHp);
 const offers=[
  {type:'heal',amount:1,title:'Repos cicatrisée',text:'Soin complet de tous les vivants.',disabled:!hurt,revealed:true},
  {type:'relic',id:relicId,title:'Relique du nouveau chapitre',text:relicId?(RELIC_BY_ID.get(relicId)?.text||'Une relique du palier'):'Aucune relique restante.',disabled:!relicId,revealed:true},
  treasure,
 ];
 if(offers.every(o=>o.disabled)){
  offers[0]={type:'coins',amount:40+4*(r.act|0),title:'Provisions de chapitre',text:'Équipe intacte et palier saturé — zénis de démarrage.',disabled:false,revealed:true};
 }
 for(const [i,o]of offers.entries())o.claimToken=id+':'+i;
 r.actBoon={schema:REWARD_SCHEMA,id,act:r.act|0,offers,claimed:false};
 r.rewards=offers;
 r.rewardClaimed=false;
 r.rewardLockedIndex=null;
 r.phase='act-boon';
 return offers;
}

export function chooseActBoon23(r,index,expectedToken=null){
 if(r.phase!=='act-boon'||!r.actBoon||r.actBoon.claimed||!Number.isInteger(index))return false;
 const o=r.actBoon.offers[index];
 if(!o||o.disabled||(expectedToken&&expectedToken!==o.claimToken)||(r.rewardLockedIndex!=null&&r.rewardLockedIndex!==index))return false;
 const c=registry(r.worlds,r.statsMode);
 if(o.type==='heal'){
  fullHealTeam(r);
 }else if(o.type==='relic'){
  if(!RELIC_BY_ID.has(o.id)||(r.relics||[]).includes(o.id))return false;
  (r.relics??=[]).push(o.id);
 }else if(o.type==='treasure'||o.kind==='weapon'||o.kind==='object'){
  const g=c.byItem.get(o.id);if(!g?.ok)return false;
  if(!r.units.some(u=>c.byId.get(u.cardId).universe===g.universe))return false;
  if(!addItem(r,o.id,o.finish||'black'))return false;
 }else if(o.type==='coins'&&o.amount>0){
  r.coins+=o.amount;
 }else return false;
 r.actBoon.claimed=true;
 r.actBoon.choice=index;
 r.rewards=[];
 r.rewardClaimed=true;
 r.rewardLockedIndex=null;
 r.phase='map';
 return true;
}

export function validateRewards23(r){
 if(r.rewardSchema!==REWARD_SCHEMA)return;
 if(r.contentVersion!=='22.0.0')throw Error('Contrat de récompenses incompatible.');
 if(r.phase==='act-boon'){
  const b=r.actBoon;if(!b||b.schema!==3||b.claimed||!Array.isArray(b.offers)||b.offers.length!==3)throw Error('Choix de début d’acte invalide.');
  if(JSON.stringify(r.rewards)!==JSON.stringify(b.offers))throw Error('Offres de début d’acte désynchronisées.');
  return;
 }
 const b=r.rewardBundle;if(!b){if(r.phase==='reward'&&r.pending)throw Error('Récompenses de combat absentes.');return;}
 const need=b.stages?.length||3;
 if(b.schema!==3||typeof b.id!=='string'||b.node!==r.current||!Number.isInteger(b.stage)||b.stage<0||b.stage>need||!Array.isArray(b.claims)||b.claims.length!==b.stage||!Array.isArray(b.stages)||b.stages.length!==need)throw Error('Parcours de récompenses invalide.');
 if(b.claims.some((x,i)=>x.stage!==i||!x.token?.startsWith(b.id+':'+i+':'))||new Set(b.claims.map(x=>x.token)).size!==b.claims.length)throw Error('Récompense répétée.');
 const c=registry(r.worlds,r.statsMode),actual=contextPower(r),boss=!!b.boss;
 if(boss!==(actual.kind==='boss'))throw Error('Contexte boss incohérent.');
 if(['N','v','kind','budget','k','maxRelicTier'].some(k=>b.context[k]!==actual[k]))throw Error('Contexte de butin invalide.');
 const expectedKinds=boss?['hero','weapon']:['hero','gear','boon'];
 if(expectedKinds.length!==need)throw Error('Nombre d’étapes invalide.');
 for(const [s,stage]of b.stages.entries()){
  if(stage.kind!==expectedKinds[s]||!Array.isArray(stage.offers))throw Error('Draft de récompense invalide.');if(s>b.stage){if(stage.ready||stage.offers.length)throw Error('Draft futur déjà ouvert.');continue;}if(!stage.ready||!stage.offers.length)throw Error('Draft actif absent.');
  const seen=new Set(),people=new Set();
  for(const [i,o]of stage.offers.entries()){
   if(o.claimToken!==b.id+':'+s+':'+i)throw Error('Jeton de récompense invalide.');if(o.disabled)continue;
   if(o.kind){
    const expectedKind=s===0?'hero':(boss?'weapon':(o.kind==='object'?'object':'weapon'));
    if(o.kind!==expectedKind&&!( !boss&&s===1&&(o.kind==='weapon'||o.kind==='object')))throw Error('Carte de récompense invalide.');
    if(o.revealed!==(i<2)||o.type!==(i===2?'mystery':s===0?'recruit':'item')||!['black','white','gold'].includes(o.finish)||seen.has(o.id))throw Error('Carte de récompense invalide.');
    seen.add(o.id);
    if(s===0){
     const full=c.heroes.slice().sort((a,b)=>((a.attack+a.maxHp+a.speed)-(b.attack+b.maxHp+b.speed))||(a.id<b.id?-1:a.id>b.id?1:0));
     const rank=full.findIndex(x=>x.id===o.id)+1;
     const expected=powerBounds(r,'hero',o.band);
     if(!rank||rank!==o.globalRank||full.length!==o.sourceSize||rank<o.bounds.lo||rank>o.bounds.hi||o.bounds.lo!==expected.lo||o.bounds.hi!==expected.hi||o.poolWorlds.some(w=>!r.worlds.includes(w)))throw Error('Puissance de récompense invalide.');
     const person=c.byId.get(o.id).person;if(people.has(person))throw Error('Identité répétée dans une offre.');people.add(person);
    }else if(o.kind==='weapon'){
     const score=g=>((g.tier||1)*1000)+((g.atk||0)+(g.shield||0)+(g.heal||0));
     const full=c.weapons.filter(g=>o.poolWorlds?.includes(g.universe)).slice().sort((a,b)=>score(a)-score(b)||(a.id<b.id?-1:a.id>b.id?1:0));
     const rank=full.findIndex(x=>x.id===o.id)+1;
     const expected=powerBounds(r,'weapon',o.band);
     if(!rank||rank!==o.globalRank||full.length!==o.sourceSize||rank<o.bounds.lo||rank>o.bounds.hi||o.bounds.lo!==expected.lo||o.bounds.hi!==expected.hi||o.poolWorlds.some(w=>!r.worlds.includes(w)))throw Error('Puissance de récompense invalide.');
    }else if(o.kind==='object'){
     const full=objectPool(r);const rank=full.findIndex(x=>x.id===o.id)+1;if(!rank||!c.byItem.get(o.id)||!['outil','consommable'].includes(c.byItem.get(o.id).category))throw Error('Objet de récompense invalide.');
    }
   }else if(o.type==='relic'&&(!RELIC_BY_ID.has(o.id)||RELIC_BY_ID.get(o.id).tier>b.context.maxRelicTier))throw Error('Relique hors palier.');
   else if(!boss&&!['heal','relic','coins'].includes(o.type))throw Error('Gain inconnu.');
   else if(boss&&!['heal','relic','coins','treasure'].includes(o.type)&&!o.kind)throw Error('Gain boss invalide.');
  }
 }
 if(r.phase==='reward'&&JSON.stringify(r.rewards)!==JSON.stringify(b.stages[b.stage]?.offers||[]))throw Error('Étape de récompense désynchronisée.');
 if(r.phase==='reward'&&r.rewardClaimed!==(b.stage===need))throw Error('État de récompense incohérent.');
}
