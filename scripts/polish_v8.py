from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src'/'app.js'
s=p.read_text()
needle='function rogueMapView(run,biome){'
assert needle in s
s=s.replace(needle,'function rogueFullMapView(run,biome){',1)
start=s.index('function rogueEncounterPreview(run)')
new=r'''// V8 JOURNEY — a presentation layer over the exact same V6 navigable nodes.
// Three lane cards represent the actual graph row; blocked edges remain unavailable.
function rogueMapView(run,biome){
 const row=run.nodes[run.step], options=row?.options||[];
 const reachable=new Set(availableNodes(run).map(x=>x.id));
 const source=run.lane===null?1:run.lane;
 const isBoss=options.length===1&&options[0].type==='boss';
 const flavors={
  combat:['Duel sur la route','Affronte un groupe de combattants.','Zénis · Recrutement'],
  elite:['Un adversaire redoutable','Un défi plus intense, pour un meilleur butin.','Butin rare · Zénis'],
  boss:['Le maître de la zone','Un affrontement décisif approche.','Zone suivante · Butin'],
  merchant:['Un marchand Capsule','Prépare ton équipe et découvre ses offres.','Objets · Équipement'],
  rest:['Un endroit paisible','Soigne tes survivants ou entraîne ton équipe.','Repos · Entraînement'],
  event:['Une étrange découverte','Une surprise t’attend au bout du chemin.','Choix · Mystère'],
  quest:['Un défi inattendu','Prends le risque d’un combat spécial.','Défi · Récompense'],
  treasure:['Une capsule mystérieuse','Un trésor caché n’attend que toi.','Objet · Relique'],
  empty:['Un passage tranquille','Avance sereinement vers la prochaine étape.','Progression']};
 const choiceArt={combat:'battle-realm.webp',elite:'battle-realm.webp',boss:'battle-realm.webp',merchant:'sky-realm.webp',rest:'sky-realm.webp',event:'sky-realm.webp',quest:'battle-realm.webp',treasure:'sky-realm.webp',empty:'sky-realm.webp'};
 const arcSvg=`<svg class="v8-branch-lines" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="v8-path-light" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fdf3ce"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>${options.map(n=>{const end=n.lane===0?165:n.lane===2?835:500;const valid=reachable.has(n.id);return `<path class="v8-path ${valid?'is-open':'is-closed'}" style="--path-delay:${.32+.1*n.lane}s" d="M${500+(source-1)*90} 235 Q${end} 100 ${end} 9"/>`}).join('')}</svg>`;
 const cards=options.map((node,i)=>{
  const meta=flavors[node.type]||flavors.event;
  const valid=run.status==='map'&&reachable.has(node.id);
  const danger=['combat','elite','boss','quest'].includes(node.type)?dangerRating(run,node.type):'Sans combat';
  const icon=MAP_TYPES[node.type]?.icon||'✦';
  return `<button class="v8-choice v8-kind-${node.type} ${valid?'is-open':'is-locked'}" style="--v8-index:${i}" data-action="rogueNode" data-id="${esc(node.id)}" ${valid?'':'disabled'} aria-label="${valid?'Choisir':'Route bloquée :'} ${esc(MAP_TYPES[node.type]?.name||node.type)}. ${esc(danger)}">
   <span class="v8-choice-art" style="background-image:url('assets/theme/${choiceArt[node.type]||'sky-realm.webp'}')"><span class="v8-choice-emblem" aria-hidden="true">${icon}</span></span>
   <span class="v8-choice-body"><span class="v8-choice-kicker">${valid?'CHEMIN '+(i+1):'CHEMIN BLOQUÉ'}</span><strong>${esc(MAP_TYPES[node.type]?.name||node.type)}</strong><span class="v8-choice-hook">${esc(meta[0])}</span><span class="v8-choice-desc">${esc(meta[1])}</span><span class="v8-choice-footer"><span>${esc(danger)}</span><b>${esc(meta[2])}</b></span></span>
   <span class="v8-choice-action">${valid?'CHOISIR CETTE VOIE →':'NON ACCESSIBLE'}</span>
  </button>`;
 }).join('');
 return `<section class="v8-journey biome-${biome.tone}" aria-label="Choisir le prochain chemin">
   <div class="v8-world-scene">
    <div class="v8-sky-motion" aria-hidden="true"></div>
    <div class="v8-travel-caption"><small>✦ ${esc(biome.name)} · ZONE ${run.zone}</small><h2>${isBoss?'LE BOSS VOUS ATTEND':'LE VOYAGE CONTINUE'}</h2><p>${isBoss?'Une dernière épreuve avant la prochaine zone.':'Trois chemins se dessinent. À toi de choisir la suite.'}</p></div>
    <div class="v8-trail-scene">${arcSvg}<div class="v8-walker"><span class="v8-walker-image" aria-hidden="true"></span><span>VOUS ÊTES ICI</span></div>${options.map((n,i)=>`<span class="v8-waymark ${reachable.has(n.id)?'':'closed'}" style="--lane:${i};--v8-index:${i}">${MAP_TYPES[n.type]?.icon||'✦'}</span>`).join('')}</div>
   </div>
   <div class="v8-select-header"><span><b>${isBoss?'LE DERNIER CHEMIN':'CHOISIS TA DESTINATION'}</b><small>${isBoss?'Le passage vers le boss est ouvert.':'Survole une carte pour éclairer le chemin correspondant.'}</small></span><span class="v8-step-chip">ÉTAPE ${run.step+1} / ${run.nodes.length}</span></div>
   <div class="v8-choice-grid ${isBoss?'v8-single-choice':''}">${cards}</div>
   <details class="v8-fullmap"><summary>⌁ Voir la carte complète de cette zone <span>↗</span></summary>${rogueFullMapView(run,biome)}</details>
  </section>`;
}

'''
s=s[:start]+new+s[start:]
old='return `<div class="rogue-v7">${top}<div class="rogue-main v7-game-layout"><div class="v7-game-screen">${interaction}</div><aside class="v7-sidebar" aria-label="Équipe et équipement">${previewTeam}<details class="v5-team-drawer"><summary>⚔ GÉRER L\'ÉQUIPE <span>OUVRIR ↓</span></summary>${myTeam}</details>${inventory}<div class="v7-retreat">${act(\'↩ Abandonner la run\',\'rogueStop\',\'outline\')}</div></aside></div></div>`;'
assert old in s, 'old markup not found'
newmarkup='''return `<div class="rogue-v7 rogue-v8">${top}<div class="rogue-main v7-game-layout"><div class="v7-game-screen">${interaction}</div><section class="v8-bottom-zone" aria-label="Équipe et inventaire"><details class="v8-base-drawer"><summary><span class="v8-drawer-grip"></span><span class="v8-drawer-copy"><b>ÉQUIPE · SAC · RELIQUES</b><small>Faire défiler ou toucher pour ouvrir</small></span><span class="v8-drawer-faces">${run.teamIds.map((id,i)=>{const c=cId(id);return c?`<span class="v8-drawer-face" title="${esc(c.name)} · ${Math.round(run.hpRatios[i]*100)} % PV">${art(c)}</span>`:''}).join('')}</span><span class="v8-drawer-chevron">⌃</span></summary><div class="v8-drawer-content"><div class="v8-drawer-team">${previewTeam}</div><details class="v5-team-drawer"><summary>⚔ GÉRER LES COMBATTANTS <span>OUVRIR ↓</span></summary>${myTeam}</details>${inventory}<div class="v7-retreat">${act('↩ Abandonner la run','rogueStop','outline')}</div></div></details></section></div></div>`;'''
s=s.replace(old,newmarkup)
p.write_text(s)
print('app.js patched',len(s))
