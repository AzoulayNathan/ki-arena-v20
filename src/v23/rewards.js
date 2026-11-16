import {registry} from '../v20/catalog.js';
import {drawCard,addHero,addItem,contextPower,powerBounds,bounds} from '../v22/power.js';
import {drawRelic,RELIC_BY_ID} from '../v22/relics.js';
import {freshId} from '../v22/random.js';

export const REWARD_SCHEMA=3;
export const hasRewardBundle=r=>r?.rewardSchema===REWARD_SCHEMA&&r.rewardBundle?.schema===REWARD_SCHEMA;
function cardDraft(r,kind){
 const used=new Set(),poolWorlds=[...new Set(r.units.map(u=>registry(r.worlds,r.statsMode).byId.get(u.cardId).universe))].sort();
 const offers=['midA','midB','mystery'].map((band,i)=>{const o=drawCard(r,kind,band,{exclude:used});if(o.id){used.add(o.id);if(kind==='hero')used.add('person:'+o.person);}return {...o,poolWorlds,type:i===2?'mystery':kind==='hero'?'recruit':'item',revealed:i<2,title:i===2?'Le destin caché':kind==='hero'?'Un nouvel allié':'Une nouvelle arme'};});
 // Preserve the rank windows: an exhausted pool gives an explicit fallback, never an out-of-band card.
 if(offers.every(o=>o.disabled))offers.push({type:'coins',amount:30+3*contextPower(r).v,title:'Provisions de route',text:'Aucun candidat disponible dans ce palier. Compensation en zénis.',disabled:false});
 return {kind,offers};
}
function boonDraft(r){
 const relic=drawRelic(r),offers=[{type:'heal',amount:.25,title:'Souffle partagé',disabled:!r.units.some(u=>u.hp<u.maxHp)},{type:'relic',id:relic,title:'Une relique inconnue',disabled:!relic}];
 if(offers.every(x=>x.disabled))offers.push({type:'coins',amount:25+3*contextPower(r).v,title:'Provisions de route',text:'Équipe en pleine santé et toutes les reliques du palier déjà acquises.',disabled:false});
 return {kind:'boon',offers};
}
function prepareStage(r){const b=r.rewardBundle,s=b.stage;let stage=b.stages[s];if(!stage.ready){stage=s===2?boonDraft(r):cardDraft(r,stage.kind);stage.ready=true;b.stages[s]=stage;for(const [i,o]of stage.offers.entries())o.claimToken=b.id+':'+s+':'+i;}r.rewards=stage.offers;return stage.offers;}
export function beginRewards23(r){
 if(hasRewardBundle(r)&&r.rewardBundle.node===r.current)return r.rewardBundle.stages[r.rewardBundle.stage]?.offers||[];
 // Future drafts are rolled only when reached, using the roster AFTER recruitment/replacement.
 // Once displayed, all three candidates including mystery remain frozen across reloads.
 r.rewardBundle={schema:REWARD_SCHEMA,id:freshId(),node:r.current,context:contextPower(r),stage:0,claims:[],stages:['hero','weapon','boon'].map(kind=>({kind,ready:false,offers:[]}))};
 r.rewardClaimed=false;r.rewardLockedIndex=null;return prepareStage(r);
}
export function chooseBundleReward23(r,index,replaceUid=null,expectedToken=null){
 const b=r.rewardBundle;
 if(r.phase!=='reward'||!hasRewardBundle(r)||b.node!==r.current||b.stage>=3||r.rewardClaimed||!Number.isInteger(index)||r.nodes.find(n=>n.id===r.current)?.done)return false;
 const o=r.rewards[index];if(!o||o.disabled||expectedToken&&expectedToken!==o.claimToken||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==index)return false;
 if(JSON.stringify(o)!==JSON.stringify(b.stages[b.stage].offers[index])||b.claims.some(c=>c.stage===b.stage))return false;
 const c=registry(r.worlds,r.statsMode);let earned;
 if(o.kind==='hero'){
  const hero=c.byId.get(o.id);if(!hero||r.units.some(u=>c.byId.get(u.cardId).person===hero.person))return false;
  const unit=addHero(r,o.id,o.finish);if(!unit)return false;
  earned={type:'hero',cardId:o.id,finish:o.finish,uid:unit.uid};
 }else if(o.kind==='weapon'){
  if(!c.byItem.get(o.id)?.ok||!r.units.some(u=>c.byId.get(u.cardId).universe===c.byItem.get(o.id).universe))return false;
  const item=addItem(r,o.id,o.finish);if(!item)return false;earned={type:'weapon',cardId:o.id,finish:o.finish,uid:item.uid};
 }else if(o.type==='heal'){
  let healed=0;for(const u of r.units){if(u.hp<=0)continue;const hp=u.hp;u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.25));healed+=u.hp-hp;}earned={type:'heal',amount:.25,healed};
 }else if(o.type==='relic'){
  if(!RELIC_BY_ID.has(o.id)||(r.relics||[]).includes(o.id))return false;(r.relics??=[]).push(o.id);earned={type:'relic',id:o.id};
 }else if(o.type==='coins'&&o.amount>0){r.coins+=o.amount;earned={type:'coins',amount:o.amount};}else return false;
 b.claims.push({stage:b.stage,token:o.claimToken,...earned});b.stage++;r.rewardLockedIndex=null;
 if(b.stage===3){r.rewardClaimed=true;r.rewards=[];const fight=r.history.at(-1);if(fight?.node===r.current)fight.lootClaims=structuredClone(b.claims);}
 else prepareStage(r);
 return true;
}
export function validateRewards23(r){
 if(r.rewardSchema!==REWARD_SCHEMA)return;
 if(r.contentVersion!=='22.0.0')throw Error('Contrat de récompenses incompatible.');
 const b=r.rewardBundle;if(!b){if(r.phase==='reward'&&r.pending)throw Error('Récompenses de combat absentes.');return;}
 if(b.schema!==3||typeof b.id!=='string'||b.node!==r.current||!Number.isInteger(b.stage)||b.stage<0||b.stage>3||!Array.isArray(b.claims)||b.claims.length!==b.stage||!Array.isArray(b.stages)||b.stages.length!==3)throw Error('Parcours de récompenses invalide.');
 if(b.claims.some((x,i)=>x.stage!==i||!x.token?.startsWith(b.id+':'+i+':'))||new Set(b.claims.map(x=>x.token)).size!==b.claims.length)throw Error('Récompense répétée.');
 const c=registry(r.worlds,r.statsMode),actual=contextPower(r);
 if(['N','v','kind','budget','k','maxRelicTier'].some(k=>b.context[k]!==actual[k]))throw Error('Contexte de butin invalide.');
 for(const [s,stage]of b.stages.entries()){
  if(stage.kind!==['hero','weapon','boon'][s]||!Array.isArray(stage.offers))throw Error('Draft de récompense invalide.');if(s>b.stage){if(stage.ready||stage.offers.length)throw Error('Draft futur déjà ouvert.');continue;}if(!stage.ready||!stage.offers.length)throw Error('Draft actif absent.');
  const seen=new Set(),people=new Set();
  for(const [i,o]of stage.offers.entries()){
   if(o.claimToken!==b.id+':'+s+':'+i)throw Error('Jeton de récompense invalide.');if(o.disabled)continue;
   if(o.kind){
    if(o.kind!==stage.kind||o.revealed!==(i<2)||o.type!==(i===2?'mystery':s===0?'recruit':'item')||!['black','white','gold'].includes(o.finish)||seen.has(o.id))throw Error('Carte de récompense invalide.');seen.add(o.id);
    const full=(s===0?c.heroes:c.weapons.filter(g=>o.poolWorlds?.includes(g.universe))).slice().sort((a,b)=>((s===0?a.attack+a.maxHp+a.speed:(a.atk||0)+(a.shield||0)+(a.heal||0))-(s===0?b.attack+b.maxHp+b.speed:(b.atk||0)+(b.shield||0)+(b.heal||0)))||(a.id<b.id?-1:a.id>b.id?1:0));
    const rank=full.findIndex(x=>x.id===o.id)+1;
    const centre=powerBounds(r,'hero',o.band).centre,mult=o.band==='mystery'?[.5,1.5]:o.band==='midB'?[.65,1.2]:[.8,1.1],expected=bounds(full.length,centre*mult[0],Math.min(1,centre*mult[1]));if(!rank||rank!==o.globalRank||full.length!==o.sourceSize||rank<o.bounds.lo||rank>o.bounds.hi||o.bounds.lo!==expected.lo||o.bounds.hi!==expected.hi||o.poolWorlds.some(w=>!r.worlds.includes(w)))throw Error('Puissance de récompense invalide.');
    if(s===0){const person=c.byId.get(o.id).person;if(people.has(person))throw Error('Identité répétée dans une offre.');people.add(person);}
   }else if(o.type==='relic'&&(!RELIC_BY_ID.has(o.id)||RELIC_BY_ID.get(o.id).tier>b.context.maxRelicTier))throw Error('Relique hors palier.');
   else if(!['heal','relic','coins'].includes(o.type))throw Error('Gain inconnu.');
  }
 }
 if(r.phase==='reward'&&JSON.stringify(r.rewards)!==JSON.stringify(b.stages[b.stage]?.offers||[]))throw Error('Étape de récompense désynchronisée.');
 if(r.phase==='reward'&&r.rewardClaimed!==(b.stage===3))throw Error('État de récompense incohérent.');
}
