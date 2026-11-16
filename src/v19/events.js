/** Immersive event catalog — editorial gameplay, non-canon. */
import {int,pick,shuffle} from "../survival/random.js";
import {registry} from "./catalog.js";

export const EVENT_FAMILIES = Object.freeze([
  "ECHANGE_COMBATTANT","SACRIFICE_EQUIPEMENT","TROC_ARME","RANCON_OR","VENTE_PERSONNAGE",
  "SAN_PV_POUR_BUFF","FUSION_OBJETS","RECRUE_ADVERSE","DETTE_RECOMPENSE","DANGER_ANNONCE",
  "EMBUSCADE","MARCHE_3_BRANCHES"
]);

const CATALOG = [
  {id:'aurora_sanctuary',rare:true,family:'DANGER_ANNONCE',title:'Le sanctuaire des aurores',hook:'Un éclat traverse la pierre. Il peut refermer vos blessures, mais son prix ne se négocie pas.',scenes:[{id:'mend',label:'Offrir 35 zénis · soin 40 %',tone:'safe'},{id:'endure',label:'Céder 15 % de PV · gagner 50 zénis',tone:'risk'}]},
  {id:'waterfall_cache',rare:true,family:'SACRIFICE_EQUIPEMENT',title:'Derrière la cascade',hook:'Une cache oubliée contient une arme. Son gardien exige un tribut.',scenes:[{id:'offer',label:'Offrir 45 zénis · arme compatible',tone:'risk'},{id:'leave',label:'Garder son or · quitter la cache',tone:'safe'}]},
  {id:'comet_trial',rare:true,family:'EMBUSCADE',title:'L’épreuve de la comète',hook:'Un gardien descend sous un ciel étoilé. La route se ferme derrière vous.',scenes:[{id:'fight',label:'Affronter le gardien élite',tone:'force'}],forcedCombat:true,noEscape:true},

  {id:"crossroads_trade",family:"ECHANGE_COMBATTANT",title:"Échange forcé",hook:"Un messager propose d'échanger ton combattant le plus faible contre un vagabond du même monde.",
   scenes:[{id:"accept",label:"Accepter l'échange",tone:"risk"},{id:"refuse",label:"Refuser et partir",tone:"safe"}],
   noEscape:true},
  {id:"gear_offering",family:"SACRIFICE_EQUIPEMENT",title:"Autel de puissance",hook:"L'autel exige une pièce d'équipement pour bénir l'équipe.",
   scenes:[{id:"sacrifice",label:"Sacrifier un objet",tone:"risk"},{id:"leave",label:"Partir les mains vides",tone:"safe"}]},
  {id:"weapon_barter",family:"TROC_ARME",title:"Forgeron itinérant",hook:"Il troque ton arme contre une lame du même univers, plus tranchante… ou pas.",
   scenes:[{id:"trade",label:"Trocquer l'arme",tone:"risk"},{id:"keep",label:"Garder ton arme",tone:"safe"}]},
  {id:"gold_ransom",family:"RANCON_OR",title:"Rançon de passage",hook:"Des bandits bloquent la route. Payer, menacer, ou contourner.",
   scenes:[{id:"pay",label:"Payer 40 zénis",tone:"safe"},{id:"threaten",label:"Menacer (risque)",tone:"risk"},{id:"detour",label:"Faire un détour",tone:"safe"}],
   options:3},
  {id:"sell_roster",family:"VENTE_PERSONNAGE",title:"Marchand d'âmes",hook:"Il offre 90 zénis pour un combattant de réserve. Irréversible.",
   scenes:[{id:"sell",label:"Vendre un réserviste",tone:"risk"},{id:"refuse",label:"Refuser",tone:"safe"}],
   noEscape:false},
  {id:"blood_pact",family:"SAN_PV_POUR_BUFF",title:"Pacte de sang",hook:"Tous sacrifient 20% PV max pour +8% ATQ de run.",
   scenes:[{id:"pact",label:"Signer le pacte",tone:"risk"},{id:"decline",label:"Décliner",tone:"safe"}],
   noEscape:true},
  {id:"fuse_relics",family:"FUSION_OBJETS",title:"Fusion alchimique",hook:"Deux objets du même monde peuvent fusionner en une version renforcée… ou se briser.",
   scenes:[{id:"fuse",label:"Tenter la fusion",tone:"risk"},{id:"abort",label:"Ne rien tenter",tone:"safe"}]},
  {id:"rival_join",family:"RECRUE_ADVERSE",title:"Rival blessé",hook:"Un adversaire à terre propose de rejoindre — s'il reste de la place.",
   scenes:[{id:"recruit",label:"Le recruter",tone:"risk"},{id:"leave",label:"Le laisser",tone:"safe"}]},
  {id:"debt_mark",family:"DETTE_RECOMPENSE",title:"Marque de dette",hook:"Tu gagnes 70 zénis maintenant. La prochaine récompense sera amputée.",
   scenes:[{id:"borrow",label:"Emprunter",tone:"risk"},{id:"refuse",label:"Refuser",tone:"safe"}],
   noEscape:true},
  {id:"omen_path",family:"DANGER_ANNONCE",title:"Présage",hook:"Les runes annoncent un combat plus dur au prochain nœud hostile.",
   scenes:[{id:"brace",label:"Se préparer (+soin léger)",tone:"safe"},{id:"ignore",label:"Ignorer le présage",tone:"risk"}]},
  {id:"ambush_forced",family:"EMBUSCADE",title:"Embuscade",hook:"Pas d'échappatoire : le combat est engagé.",
   scenes:[{id:"fight",label:"Entrer en combat",tone:"force"}],
   forcedCombat:true,noEscape:true},
  {id:"three_booths",family:"MARCHE_3_BRANCHES",title:"Marché aux trois stands",hook:"Trois marchands. Un seul choix.",
   scenes:[{id:"heal",label:"Stand de soins",tone:"safe"},{id:"weapon",label:"Stand d'armes",tone:"risk"},{id:"gamble",label:"Stand du hasard",tone:"risk"}],
   options:3},
  {id:"shadow_duel",family:"EMBUSCADE",title:"Défi de l'ombre",hook:"Un champion te force la main — combat élite immédiat.",
   scenes:[{id:"accept",label:"Relever le défi",tone:"force"}],
   forcedCombat:true,noEscape:true},
  {id:"charity_tax",family:"RANCON_OR",title:"Taxe du temple",hook:"Le temple réclame 25 zénis ou une blessure collective.",
   scenes:[{id:"pay",label:"Payer 25",tone:"safe"},{id:"endure",label:"Endurer la blessure",tone:"risk"}],
   noEscape:true},
];

export function listEvents(){return CATALOG.map(e=>({id:e.id,family:e.family,title:e.title}));}

function recentFamilies(r){return (r.eventLog||[]).slice(-3).map(x=>x.family);}

export function pickEvent(r){
  const recent=new Set(recentFamilies(r));
  const rare=r.rulesVersion==='19.0.0'&&r.nodes.find(n=>n.id===r.current)?.eventRare;let pool=CATALOG.filter(e=>!!e.rare===!!rare&&!recent.has(e.family));
  if(!pool.length)pool=CATALOG.filter(e=>!!e.rare===!!rare);
  // prefer forced / noEscape sometimes
  const forced=pool.filter(e=>e.forcedCombat);
  const pickPool=int(r,0,4)===0&&forced.length?forced:pool;
  const ev=pick(r,pickPool);
  const rolls={
    tradeOk:int(r,0,1)===1,
    fuseOk:int(r,0,1)===1,
    threatenOk:int(r,0,1)===1,
    gamble:int(r,0,2),
    recruitRank:int(r,1,Math.max(1,Math.floor(r.N*0.55))),
  };
  return {id:ev.id,family:ev.family,title:ev.title,hook:ev.hook,scenes:ev.scenes,rare:!!ev.rare,forcedCombat:!!ev.forcedCombat,noEscape:!!ev.noEscape,rolls,resolved:false};
}

export function beginEvent(r){
  if(r.phase!=="event") return false;
  if(!r.activeEvent)r.activeEvent=pickEvent(r);
  if(['14.0.0','19.0.0'].includes(r.rulesVersion)&&!r.activeEvent.preview){const c=registry(r.worlds,r.statsMode),used=new Set([...r.units,...r.dead,...(r.departed||[])].map(u=>c.byId.get(u.cardId).person)),weakest=[...r.units].sort((a,b)=>a.maxHp-b.maxHp)[0],pair=r.items.map(a=>[a,r.items.find(b=>b.uid!==a.uid&&c.byItem.get(a.cardId).universe===c.byItem.get(b.cardId).universe)]).find(x=>x[1]),recruits=c.heroes.filter(h=>!used.has(h.person)&&h.percentile<=.6);r.activeEvent.preview={outgoing:weakest?.cardId,sacrifice:r.items.at(-1)?.cardId,fuseUids:pair?.map(x=>x.uid)||[],recruitId:recruits.length?pick(r,recruits).id:null};}
  return true;
}

function unit(r,c){return {uid:"u"+(++r.uid),cardId:c.id,level:1,wins:0,hp:c.maxHp,maxHp:c.maxHp,attack:c.attack,speed:c.speed,weapon:null,armor:null};}

export function applyEventChoice(r,sceneId){
  if(r.phase!=="event"||!r.activeEvent||r.activeEvent.resolved) return {ok:false};
  const ev=r.activeEvent;
  if(!ev.scenes.some(s=>s.id===sceneId)||!eventOption(r,sceneId).ok) return {ok:false};
  const c=registry(r.worlds,r.statsMode);
  const rolls=ev.rolls||{};
  let followup=null;
  const mark=()=>{ev.resolved=true;ev.choice=sceneId;(r.eventLog||(r.eventLog=[])).push({id:ev.id,family:ev.family,choice:sceneId});};

  if(ev.id==='aurora_sanctuary'){
    if(sceneId==='mend'){r.coins-=35;for(const u of r.units)u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.4));}
    if(sceneId==='endure'){for(const u of r.units)u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.15));r.coins+=50;}
  }else if(ev.id==='waterfall_cache'&&sceneId==='offer'){
    const pool=c.weapons.filter(g=>!r.items.some(x=>x.cardId===g.id)&&r.units.some(u=>c.byId.get(u.cardId).universe===g.universe)&&g.tier<=Math.min(5,2+Math.floor(r.wave/5)));
    if(!pool.length)return {ok:false};r.coins-=45;r.items.push({uid:'g'+(++r.uid),cardId:pick(r,pool).id});
  }else if(ev.id==='comet_trial'){mark();return {ok:true,followup:'force-combat'};
  }else if(ev.id==="crossroads_trade"&&sceneId==="accept"){
    if(r.units.length){
      const weakest=[...r.units].sort((a,b)=>a.maxHp-b.maxHp)[0];
      const person=c.byId.get(weakest.cardId).person;
      const pool=c.heroes.filter(h=>h.universe===c.byId.get(weakest.cardId).universe&&h.person!==person&&![...r.units,...r.dead].some(u=>c.byId.get(u.cardId).person===h.person));
      if(pool.length){const neu=pick(r,pool);const idx=r.units.indexOf(weakest);r.units[idx]=unit(r,neu);}
    }
  }else if(ev.id==="gear_offering"&&sceneId==="sacrifice"){
    if(r.items.length){const g=r.items.pop();for(const u of r.units){if(u.weapon===g.uid)u.weapon=null;if(u.armor===g.uid)u.armor=null;}
      for(const u of r.units){u.attack=Math.round(u.attack*1.04);const ratio=u.hp/u.maxHp;u.maxHp=Math.round(u.maxHp*1.03);u.hp=Math.max(1,Math.round(u.maxHp*ratio));}}
  }else if(ev.id==="weapon_barter"&&sceneId==="trade"){
    const armed=r.units.find(u=>u.weapon);const entry=armed&&r.items.find(g=>g.uid===armed.weapon);
    if(entry){const old=c.byItem.get(entry.cardId);const pool=c.weapons.filter(g=>g.universe===old.universe&&g.id!==old.id);if(pool.length){const neu=rolls.tradeOk?pool.sort((a,b)=>b.tier-a.tier)[0]:pick(r,pool);entry.cardId=neu.id;}}
  }else if(ev.id==="gold_ransom"){
    if(sceneId==="pay"){if(r.coins>=40)r.coins-=40;else for(const u of r.units)u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.1));}
    else if(sceneId==="threaten"){if(rolls.threatenOk)r.coins+=30;else for(const u of r.units)u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.18));}
  }else if(ev.id==="sell_roster"&&sceneId==="sell"){
    if(r.units.length>(['14.0.0','19.0.0'].includes(r.rulesVersion)?5:1)){const u=r.units.pop();if(['14.0.0','19.0.0'].includes(r.rulesVersion))(r.departed??=[]).push({...u,reason:'transfer'});else r.dead.push({...u,hp:0});r.coins+=90;}
  }else if(ev.id==="blood_pact"&&sceneId==="pact"){
    for(const u of r.units){u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.2));if(!['14.0.0','19.0.0'].includes(r.rulesVersion))u.attack=Math.round(u.attack*1.08);}
    if(!r.passives.includes("blood"))r.passives.push("blood");
  }else if(ev.id==="fuse_relics"&&sceneId==="fuse"){
    if(r.items.length>=2){const pair=['14.0.0','19.0.0'].includes(r.rulesVersion)?ev.preview.fuseUids.map(id=>r.items.find(x=>x.uid===id)):null;const a=pair?pair[0]:r.items.pop(),b=pair?pair[1]:r.items.pop();if(pair)r.items=r.items.filter(x=>x.uid!==a.uid&&x.uid!==b.uid);for(const u of r.units){for(const g of [a,b]){if(u.weapon===g.uid)u.weapon=null;if(u.armor===g.uid)u.armor=null;}}
      if(rolls.fuseOk){const base=c.byItem.get(a.cardId);const better=c.gear.filter(g=>g.universe===base.universe&&g.tier>=base.tier).sort((x,y)=>y.tier-x.tier)[0]||base;r.items.push({uid:"g"+(++r.uid),cardId:better.id});}
    }
  }else if(ev.id==="rival_join"&&sceneId==="recruit"){
    if(r.units.length<8){const h=['14.0.0','19.0.0'].includes(r.rulesVersion)?c.byId.get(ev.preview.recruitId):c.heroes[Math.min(c.N,rolls.recruitRank)-1];if(h&&![...r.units,...r.dead].some(u=>c.byId.get(u.cardId).person===h.person))r.units.push(unit(r,h));}
  }else if(ev.id==="debt_mark"&&sceneId==="borrow"){
    r.coins+=70;r.debtReward=true;
  }else if(ev.id==="omen_path"){
    if(sceneId==="brace"){for(const u of r.units)u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.12));}
    r.omenDanger=true;
  }else if(ev.id==="ambush_forced"||ev.id==="shadow_duel"){
    mark();followup="force-combat";return {ok:true,followup};
  }else if(ev.id==="three_booths"){
    if(sceneId==="heal"){for(const u of r.units)u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.4));}
    else if(sceneId==="weapon"){const pool=c.weapons.filter(g=>r.units.some(u=>c.byId.get(u.cardId).universe===g.universe)&&!r.items.some(x=>x.cardId===g.id));if(pool.length)r.items.push({uid:"g"+(++r.uid),cardId:pick(r,pool).id});}
    else if(sceneId==="gamble"){if(rolls.gamble===0)r.coins+=50;else if(rolls.gamble===1)for(const u of r.units)u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.15));else r.coins=Math.max(0,r.coins-20);}
  }else if(ev.id==="charity_tax"){
    if(sceneId==="pay"){if(r.coins>=25)r.coins-=25;else sceneId="endure";}
    if(sceneId==="endure"){for(const u of r.units)u.hp=Math.max(1,u.hp-Math.round(u.maxHp*.12));}
  }
  mark();
  return {ok:true,followup};
}

export function catalogSize(){return CATALOG.length;}
export function familyCount(){return new Set(CATALOG.map(e=>e.family)).size;}

export function eventOption(r,id){
 const ev=r.activeEvent;if(!ev)return {ok:false,reason:'Événement absent.'};if(!['14.0.0','19.0.0'].includes(r.rulesVersion))return {ok:true,detail:''};
 const c=registry(r.worlds,r.statsMode),name=cardId=>c.byId.get(cardId)?.name||'ce combattant',object=id=>c.byItem.get(id)?.name||'un objet';let ok=true,reason='',detail='';
 if(ev.id==='aurora_sanctuary'&&id==='mend'){ok=r.coins>=35&&r.units.some(u=>u.hp<u.maxHp);reason='35 zénis et au moins un allié blessé nécessaires.';detail='35 zénis contre 40 % de PV max aux vivants.';}
 if(ev.id==='waterfall_cache'&&id==='offer'){ok=r.coins>=45&&c.weapons.some(g=>!r.items.some(x=>x.cardId===g.id)&&r.units.some(u=>c.byId.get(u.cardId).universe===g.universe)&&g.tier<=Math.min(5,2+Math.floor(r.wave/5)));reason='45 zénis et une arme compatible disponible nécessaires.';detail='Une arme transférable du monde de l’équipe.';}
 if(ev.id==='gold_ransom'&&id==='pay'){ok=r.coins>=40;reason='Il faut 40 zénis.';detail='Payer 40 zénis pour passer.';}
 if(ev.id==='charity_tax'&&id==='pay'){ok=r.coins>=25;reason='Il faut 25 zénis.';detail='Payer 25 zénis ; éviter la blessure.';}
 if(ev.id==='sell_roster'&&id==='sell'){ok=r.units.length>5;reason='Aucun réserviste à transférer.';detail='Départ de '+name(r.units.at(-1)?.cardId)+' contre 90 zénis. Ses objets restent dans le sac.';}
 if(ev.id==='gear_offering'&&id==='sacrifice'){ok=r.items.length>0;reason='Le sac est vide.';detail='Perdre '+object(ev.preview?.sacrifice)+' ; renforcer l’équipe.';}
 if(ev.id==='weapon_barter'&&id==='trade'){const u=r.units.find(u=>u.weapon);ok=!!u;reason='Équipe d’abord une arme.';detail='Abandonner l’arme de '+name(u?.cardId)+' pour une autre du même univers.';}
 if(ev.id==='blood_pact'&&id==='pact'){ok=!r.passives.includes('blood');reason='Le pacte est déjà actif.';detail='Sacrifier 20% des PV max actuels ; recevoir une seule bénédiction de force.';}
 if(ev.id==='fuse_relics'&&id==='fuse'){ok=ev.preview?.fuseUids?.length===2;reason='Deux objets du même univers sont nécessaires.';detail=ok?'Détruire '+ev.preview.fuseUids.map(uid=>object(r.items.find(x=>x.uid===uid)?.cardId)).join(' et ')+'. Une réussite donne un objet ; un échec les perd tous deux.':reason;}
 if(ev.id==='rival_join'&&id==='recruit'){ok=r.units.length<8&&!!ev.preview?.recruitId;reason='Pas de place ou de recrue éligible.';detail=ok?name(ev.preview.recruitId)+' rejoint la réserve si l’équipe est pleine.':reason;}
 if(ev.id==='debt_mark'&&id==='borrow'){ok=!r.debtReward;reason='Une dette attend déjà sa récompense.';detail='Recevoir 70 zénis ; réduire la prochaine bourse de récompense.';}
 if(ev.id==='crossroads_trade'&&id==='accept')detail='Départ de '+name(ev.preview?.outgoing)+'. Le remplaçant du même univers reste inconnu.';
 if(ev.id==='three_booths'&&id==='weapon'){ok=c.weapons.some(g=>r.units.some(u=>c.byId.get(u.cardId).universe===g.universe)&&!r.items.some(x=>x.cardId===g.id));reason='Aucune nouvelle arme compatible.';detail='Emporter une arme compatible, choisie avant la révélation.';}
 if(ev.id==='omen_path')detail='La prochaine opposition sera renforcée. '+(id==='brace'?'Récupérer un peu de PV avant de partir.':'Continuer sans récupérer.');
 return {ok,reason:ok?'':reason,detail};
}
