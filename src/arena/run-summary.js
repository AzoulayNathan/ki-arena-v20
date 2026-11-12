/** End-of-run receipt — factual, no numeric display helpers here. */
import {distinctions} from './run-metrics.js';
import {registry} from './catalog.js';

export function buildRunReceipt(r){
  if(!r)return null;
  const c=registry(r.worlds);
  const hist=r.history||[];
  const bosses=hist.filter(h=>h.kind==='boss'&&h.win).length;
  const wins=hist.filter(h=>h.win).length;
  const losses=hist.filter(h=>!h.win).length;
  const depth=Math.max(0,...hist.map(h=>h.wave||0),r.wave||0);
  const permanentLoss=(r.dead||[]).length;
  const outcome=r.voluntaryRetreat?'retreat':r.phase==='end'?(!r.units.length?'defeat':'clear'):'ongoing';
  const notable=pickNotableTeam(r,c);
  const dist=distinctions(r.metrics||{byUnit:{}});
  const mapDist=list=>list.map(u=>{
    const cardId=resolveCardId(r,u.uid);
    const card=cardId?c.byId.get(cardId):null;
    return {uid:u.uid,cardId,damageDealt:u.damageDealt||0,damageTaken:u.damageTaken||0,healingDone:u.healingDone||0,name:card?.name||'Combattant',universe:card?.universe,alive:!(r.dead||[]).some(d=>d.uid===u.uid||d.cardId===cardId)};
  });
  return {
    schema:1, format:'KI_ARENA_RUN_RECEIPT', version:r.version, runId:(r.rulesVersion==='14.0.0'?r.runInstanceId:null)||r.runId||(r.seed+'#'+r.revision),
    seed:r.seed, worlds:[...r.worlds], outcome, bosses, wins, losses, depth, permanentLoss,
    incomplete:!(r.metrics?.combatIds?.length)||!!r.metrics?.legacyIncomplete,
    notableTeam:notable,
    honors:{
      frappe:mapDist(dist.frappe),
      rempart:mapDist(dist.rempart),
      souffle:mapDist(dist.souffle),
    },
    emblems:emblemsFor(r,bosses,wins,permanentLoss),
    closedAt:Date.now(),
  };
}

function resolveCardId(r,uid){
  const live=(r.units||[]).find(u=>u.uid===uid); if(live)return live.cardId;
  const dead=(r.dead||[]).find(u=>u.uid===uid); if(dead)return dead.cardId;const departed=(r.departed||[]).find(u=>u.uid===uid);if(departed)return departed.cardId;
  // combat played mapping A-i
  if(String(uid).startsWith('A-')&&r.combat?.played){const i=Number(uid.split('-')[1]);return r.units?.[i]?.cardId||r.history?.at(-1)?.playedCards?.[i];}
  // metrics may use A-i from last battles — scan rosterSnapshots
  for(const snap of r.rosterSnapshots||[]){const u=snap.units?.find(x=>x.uid===uid||x.battleUid===uid);if(u)return u.cardId;}
  return null;
}

function pickNotableTeam(r,c){
  const snaps=r.rosterSnapshots||[];
  const bossWin=snaps.filter(s=>s.kind==='boss'&&s.win).at(-1);
  if(bossWin)return {source:'last-boss-win',units:bossWin.units};
  const deepest=snaps.filter(s=>s.win).sort((a,b)=>(b.wave||0)-(a.wave||0))[0];
  if(deepest)return {source:'deepest-win',units:deepest.units};
  const last=snaps.at(-1);
  if(last)return {source:'last-engaged',units:last.units};
  return {source:'current-roster',units:(r.units||[]).slice(0,5).map(u=>({uid:u.uid,cardId:u.cardId,name:c.byId.get(u.cardId)?.name,universe:c.byId.get(u.cardId)?.universe,status:'alive'}))};
}

function emblemsFor(r,bosses,wins,losses){
  const out=[];
  if(bosses>0)out.push({id:'guardian',label:'Gardien vaincu'});
  if((r.history||[]).some(h=>h.alive===1&&h.win))out.push({id:'heroic',label:'Survie héroïque'});
  if((r.history||[]).some(h=>h.win&&h.kind==='boss'&&h.cameBack))out.push({id:'return',label:'Retour inespéré'});
  if(wins>0&&losses===0&&(r.dead||[]).length===0)out.push({id:'flawless',label:'Victoire sans perte'});
  return out;
}

export function honorTitle(kind){return {frappe:'La Frappe',rempart:'Le Rempart',souffle:'Le Souffle'}[kind]||kind;}
export function honorBlurb(kind){return {frappe:'A porté les assauts décisifs',rempart:'A tenu sous les attaques',souffle:'A redonné du souffle aux compagnons'}[kind]||'';}
