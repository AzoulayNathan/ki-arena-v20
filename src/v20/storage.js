import {beginEvent} from './events.js';
import {validate as legacyValidate,save as legacySave,load as legacyLoad} from '../v19/storage.js';
import {validateStartDraft as validateLegacyStart} from '../v17/draft.js';
import {START_RULES,validateStartDraft} from './draft.js';
import {MIXED_RULES,validateMixedDraft} from '../v16/draft.js';
import {registry,ARENA_VERSION,NORMALIZATION} from './catalog.js';
import {ACT_LENGTH,MAP_NODES,BOSS_ROW} from '../arena/rules.js';
import {generateMap,runCatalog} from './engine.js';
import {rankBudget} from '../survival/encounter.js';
import {scaleBudget,PRESTIGE_MAX} from './prestige.js';
function budgetOk(N,wave,kind,budget,prestigeDiff=0){
  const base=N/4*(wave+({normal:0,elite:1,boss:2}[kind]));
  const scaled=rankBudget(N,wave,kind);
  const legacy=Math.round(base);
  const prev=Math.max(1,Math.round(base*0.75));
  if(budget===scaled||budget===legacy||budget===prev)return true;
  const pd=Math.max(0,Math.min(PRESTIGE_MAX,prestigeDiff|0));
  for(let d=0;d<=pd;d++)if(budget===scaleBudget(scaled,d))return true;
  return false;
}
export const SAVE_KEY='kiarena:arena:v14:';
export const MIXED_SAVE_KEY='kiarena:arena:v16:';
export const ACTIVE_SAVE_KEY='kiarena:arena:active:';
export function runKey(worlds,rulesVersion='14.0.0',statsMode='normalized'){if(rulesVersion===START_RULES)return 'kiarena:arena:v20:'+statsMode+':'+registry(worlds).key;return (rulesVersion==='17.0.0'?'kiarena:arena:v17:':rulesVersion===MIXED_RULES?MIXED_SAVE_KEY:SAVE_KEY)+registry(worlds).key;}
function offerOk(r,c,o){
  const id=typeof o==='string'?o:o?.id;
  if(o?.disabled)return true;
  if(!id)return false;
  if(r.step<5)return c.byId.has(id);
  return c.weapons.some(g=>g.id===id);
}
export function migrate(r){
  if(!r||typeof r!=='object')return r;
  r.rulesVersion??='12.0.0';r.runInstanceId??=globalThis.crypto?.randomUUID?.()||'legacy-'+Date.now();r.processedActions??=[];
  const v=String(r.version||'');
  if(v===ARENA_VERSION){
    r.rulesVersion??='12.0.0';r.runInstanceId??=globalThis.crypto?.randomUUID?.()||'legacy-'+Date.now();r.processedActions??=[];
    if(!Array.isArray(r.eventLog))r.eventLog=[];
    if(r.legacyMap==null)r.legacyMap=r.nodes?.length===43;
    return r;
  }
  if(v==='10.0.0'||v==='11.0.0'||v.startsWith('10.')||v.startsWith('11.')){
    r.version=ARENA_VERSION;
    if(!Array.isArray(r.eventLog))r.eventLog=[];
    if(r.nodes?.length===43){
      r.legacyMap=true;
      // safe frontier: if still in draft or no progress, rebuild 10-step map
      if(r.phase==='draft'||(r.act===0&&!r.current&&!(r.trail||[]).length)){
        r.nodes=generateMap(r.seed,r.act);r.legacyMap=false;r.current=null;r.trail=[];
      }
    }else if(!r.nodes||r.nodes.length!==MAP_NODES){
      r.nodes=generateMap(r.seed,r.act||0);r.legacyMap=false;
    }
    // normalize offers to objects
    if(Array.isArray(r.offers)&&r.offers.length&&typeof r.offers[0]==='string'){
      r.offers=r.offers.map((id,i)=>({id,band:i===0?'midA':i===1?'midB':'mystery',revealed:i<2}));
    }
  }
  return r;
}
export function validate(r){
 if(r?.rulesVersion!==START_RULES)return legacyValidate(r);
  r=migrate(r);
  if(r.phase==='event'&&!r.activeEvent?.preview)beginEvent(r);
  if(!r||r.schema!==1||r.mode!=='arena-expedition'||r.version!==ARENA_VERSION||r.normalization!==(r.rulesVersion===START_RULES&&r.statsMode==='raw'?'raw-v19':NORMALIZATION))throw Error('Version de run incompatible.');
  if(!['12.0.0','14.0.0','17.0.0',MIXED_RULES,START_RULES].includes(r.rulesVersion)||typeof r.runInstanceId!=='string'||!Array.isArray(r.processedActions)||r.processedActions.length>128||r.processedActions.some(id=>typeof id!=='string'))throw Error('Règles ou journal de décisions incompatibles.');
  if(r.rulesVersion===START_RULES&&!['normalized','raw'].includes(r.statsMode))throw Error('Mode de statistiques invalide.');const c=registry(r.worlds,r.statsMode);
  if(r.poolHash!==c.hash||r.N!==c.N||!['draft','roster','map','prepare','combat','reward','shop','rest','event','result','end','prestige'].includes(r.phase))throw Error('Pool ou phase invalide.');
  if(!Number.isInteger(r.rng)||typeof r.seed!=='string'||!r.seed.length||r.seed.length>120||!Number.isInteger(r.revision)||r.revision<0||!Number.isFinite(r.coins)||r.coins<0)throw Error('Métadonnées invalides.');
  for(const key of ['units','dead','items','nodes','trail','offers','history','rewards','shop','passives'])if(!Array.isArray(r[key]))throw Error('Run incomplète.');
  if(r.units.length>8||new Set([...r.units,...r.dead].map(u=>u.uid)).size!==r.units.length+r.dead.length)throw Error('Effectif invalide.');
  for(const u of [...r.units,...r.dead])if(!c.byId.has(u.cardId)||![u.hp,u.maxHp,u.attack,u.speed,u.level,u.wins].every(Number.isFinite)||u.hp<0||u.hp>u.maxHp||u.maxHp<1||u.attack<1||u.speed<0||u.level<1||u.level>5)throw Error('Combattant invalide.');
  if(r.units.some(u=>u.hp<=0)||r.dead.some(u=>u.hp!==0)||new Set(r.items.map(g=>g.uid)).size!==r.items.length||r.items.some(g=>!c.byItem.get(g.cardId)?.ok))throw Error('Inventaire ou KO invalide.');
  const assigned=new Set();
  for(const u of r.units)for(const slot of ['weapon','armor']){if(!u[slot])continue;const entry=r.items.find(g=>g.uid===u[slot]),g=c.byItem.get(entry?.cardId);if(!g||g.universe!==c.byId.get(u.cardId).universe||(slot==='armor')!==(g.category==='armure')||g.category==='consommable'||assigned.has(entry.uid))throw Error('Équipement incompatible.');assigned.add(entry.uid);}
  if(r.rulesVersion==='17.0.0')validateLegacyStart(r);if(r.rulesVersion===MIXED_RULES)validateMixedDraft(r);if(r.rulesVersion===START_RULES)validateStartDraft(r);
  if(![MIXED_RULES,'17.0.0',START_RULES].includes(r.rulesVersion)&&r.phase==='draft'&&(r.step<0||r.step>7||r.offers.length!==3||new Set(r.offers.map(o=>typeof o==='string'?o:o.token||o.id)).size!==3||r.offers.some(o=>!offerOk(r,c,o))))throw Error('Draft invalide.');
  if(r.pending&&(r.pending.ranks.reduce((a,b)=>a+b,0)!==r.pending.budget||r.pending.ranks.some(x=>x<1||x>c.N)||r.pending.enemies.length!==r.pending.ranks.length||r.pending.enemies.some(u=>!c.byId.has(u.cardId))))throw Error('Budget invalide.');
  if(['14.0.0','17.0.0',MIXED_RULES,START_RULES].includes(r.rulesVersion)){if(new Set(r.units.map(u=>c.byId.get(u.cardId).person)).size!==r.units.length)throw Error('Identité en double.');if(r.pending){const p=r.pending,ranked=runCatalog(r);if(!Number.isInteger(p.wave)||p.wave<1||!['normal','elite','boss'].includes(p.kind)||!budgetOk(c.N,p.wave,p.kind,p.budget,r.prestigeDiff||0))throw Error('Difficulté de rencontre invalide.');if(p.enemies.some((u,i)=>{const h=ranked.byId.get(u.cardId);return h.poolRank!==p.ranks[i]||h.attack!==u.attack||h.maxHp!==u.maxHp||h.speed!==u.speed;}))throw Error('Les adversaires ne correspondent pas aux rangs annoncés.');}}
  if(r.phase==='combat'&&(!r.combat?.result?.events?.length||!Number.isInteger(r.combat.cursor)||r.combat.cursor<0||r.combat.cursor>r.combat.result.events.length))throw Error('Combat invalide.');
  const expected=r.legacyMap?43:MAP_NODES;
  const maxRow=r.legacyMap?14:BOSS_ROW;
  if(r.nodes.length!==expected||new Set(r.nodes.map(n=>n.id)).size!==expected||r.nodes.some(n=>!['normal','elite','boss','rest','shop','treasure','event'].includes(n.kind)||!Number.isInteger(n.row)||n.row<0||n.row>maxRow||!Array.isArray(n.next)||!n.next.every(id=>r.nodes.some(x=>x.id===id&&x.row===n.row+1))))throw Error('Chemins invalides.');
  return r;
}
export function save(r,storage=globalThis.localStorage){if(r?.rulesVersion!==START_RULES)return legacySave(r,storage);validate(r);storage.setItem(runKey(r.worlds,r.rulesVersion,r.statsMode),JSON.stringify(r));storage.setItem(ACTIVE_SAVE_KEY+(r.rulesVersion===START_RULES?'v20:'+r.statsMode+':':'')+registry(r.worlds).key,r.rulesVersion);}
export function load(worlds,storage=globalThis.localStorage,statsMode='normalized'){const modern=storage.getItem(runKey(worlds,START_RULES,statsMode));if(modern)return validate(JSON.parse(modern));return legacyLoad(worlds,storage,statsMode);}

export function exportRun(r){validate(r);return JSON.stringify({format:'KI_ARENA_EXPEDITION',version:1,run:r},null,2);}
export function importRun(text){if(text.length>5000000)throw Error('Fichier trop volumineux.');const x=JSON.parse(text);if(x.format!=='KI_ARENA_EXPEDITION'||x.version!==1)throw Error('Format incorrect.');return validate(x.run);}
