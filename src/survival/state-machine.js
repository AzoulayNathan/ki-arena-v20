import {isRefinedRun,recycleItem,buyCare} from './economy.js';
import {catalog,DATA_VERSION} from './catalog.js';
import {seedState,pick} from './random.js';
import {draftOffers,chooseDraft} from './draft.js';
import {encounter} from './encounter.js';
import {startCombat,deploy,resolveRound,syncLiving} from './battle-adapter.js';
import {equipItem} from './equipment.js';
import {rewards,applyReward,makeShop,buy} from './rewards.js';
import {healLiving} from './progression.js';
export const RULES_VERSION='9.3.0';
export function createSurvival(universe,seed,{rulesVersion=RULES_VERSION}={}){catalog(universe);if(!['9.0.0-rc1','9.1.0','9.2.0','9.3.0'].includes(rulesVersion))throw Error('Règles de run inconnues');const seedText=String(seed).slice(0,120)||'42';const run={schema:1,mode:'survival-infinity-v2',rulesVersion,dataVersion:DATA_VERSION,universe,seed:seedText,rng:seedState(seedText),phase:'draft',draftStep:0,offers:[],units:[],dead:[],items:[],relics:[],slots:3,wave:1,coins:0,victories:0,revision:0,history:[],routes:null,supportUsed:false,pending:null,combat:null,rewardOptions:[],shop:[],levelChanges:[],lastReward:null};draftOffers(run);return run;}
export function ensureRoutes(run){if(run.phase!=='map'||run.routes)return;
 const route=(id,kind)=>({id,type:kind,encounter:encounter(run,kind)});
 if(run.wave%5===0)run.routes=[route('boss','boss'),...(run.supportUsed||!['9.1.0','9.2.0','9.3.0'].includes(run.rulesVersion)?[]:[{id:'support',type:pick(run,['rest','shop'])}])];
 else run.routes=[route('normal','normal'),route('elite','elite'),...(run.supportUsed?[]:[{id:'support',type:pick(run,['rest','shop','treasure','event'])}])];
}
export function command(run,action,args={},revision=run.revision){
 if(revision!==run.revision)return false;
 let ok=false;
 if(action==='draft')ok=chooseDraft(run,args.index);
 else if(action==='route'&&run.phase==='map'){
  const r=run.routes?.find(x=>x.id===args.id);if(!r)return false;
  run.routes=run.routes.filter(x=>x.id!==r.id);
  if(r.encounter){run.pending=r.encounter;run.phase='preview';}
  else{run.supportUsed=true;run.phase=r.type;if(r.type==='shop'){run.shop=makeShop(run);if(isRefinedRun(run))run.shopCareUsed=false;};if(r.type==='treasure')run.rewardOptions=rewards(run,'normal');}
  ok=true;
 }
 else if(action==='fight')ok=startCombat(run);
 else if(action==='deploy')ok=deploy(run,args.id);
 else if(action==='deployAll'&&run.phase==='combat'){for(const ref of [...run.combat.deck.hand])if(ref.type==='hero')ok=deploy(run,ref.id)||ok;}
 else if(action==='equip')ok=equipItem(run,args.id,args.target,{replace:!!args.replace});
 else if(action==='round'){ok=resolveRound(run);if(ok&&run.phase==='reward')run.rewardOptions=rewards(run,run.pending.kind);}
 else if(action==='reward'&&['reward','treasure'].includes(run.phase)){
  const r=run.rewardOptions.find(x=>x.key===args.key);if(!r)return false;
  const wasWin=run.phase==='reward';ok=applyReward(run,r);
  if(ok){run.lastReward=r;run.rewardOptions=[];run.combat=null;run.pending=null;if(wasWin){run.wave++;run.supportUsed=false;run.routes=null;}run.phase='map';}
 }
 else if(action==='recycle')ok=recycleItem(run,args.id);
 else if(action==='care')ok=buyCare(run);
 else if(action==='buy')ok=buy(run,args.id);
 else if(action==='rest'&&run.phase==='rest'){
  if(args.choice==='heal')healLiving(run,.35);else if(args.choice==='coins')run.coins+=12+run.wave;else return false;
  run.phase='map';ok=true;
 }
 else if(action==='event'&&run.phase==='event'){
  if(args.choice==='safe')run.coins+=10+run.wave;
  else if(args.choice==='trade'&&run.coins>=15){run.coins-=15;healLiving(run,.5);}else return false;
  run.phase='map';ok=true;
 }
 else if(action==='leave'&&run.phase==='shop'){run.phase='map';ok=true;}
 else if(action==='retreat'&&run.phase==='preview'&&run.pending.kind!=='boss'&&run.coins>=45&&run.routes.length){run.coins-=45;run.pending=null;run.phase='map';ok=true;}
 else if(action==='end'&&!['end','draft'].includes(run.phase)){if(run.phase==='combat')syncLiving(run);run.phase='end';run.endReason='Repli volontaire · progression conservée dans le bilan';ok=true;}
 if(ok){run.revision++;ensureRoutes(run);}
 return ok;
}
