const KEY='kiarena:tutorial:v20_start_1';
try{localStorage.removeItem('kiarena:tutorial:v193');localStorage.removeItem('kiarena:tutorial:v192');}catch{}
let skipped=false,config=null;
function disabled(){try{return skipped||localStorage.getItem(KEY)==='done';}catch{return skipped;}}
export function restartTutorial(){skipped=false;try{localStorage.removeItem(KEY);}catch{}}
export function tutorial(root,ctx){
  config=ctx;
  root.querySelectorAll('.v192-guide,.v193-guide').forEach(e=>e.remove());
  root.querySelectorAll('.v193-guide-target').forEach(e=>e.classList.remove('v193-guide-target'));
  if(disabled())return;
  const {page,run}=ctx;
  if(!['home','setup','run','bilan'].includes(page))return;
  const inv=root.querySelector('.v193-roster'),selected=root.querySelector('.v193-equip-target.compatible');
  let title,copy,target,step;
  if(inv){
    title=selected?'Compare, puis confie l’arme.':'1. Choisis une arme · 2. Choisis son porteur.';
    copy=selected?'Les statistiques avant/après s’affichent en direct. Clique sur le personnage encadré en vert (ou sur « Équiper → ») pour lui confier l’arme.':'Clique sur une arme dans « Dans ton sac » ci-dessus : les alliés compatibles de son univers s’allumeront aussitôt.';
    target=selected||root.querySelector('[data-a="pick-item"]');
    step=4;
  }else if(page==='home'){
    title='Bienvenue dans KI ARENA.';
    copy='Explore les 4 univers avec la roue, puis lance ta première expédition en cliquant sur « Solo » ou « Ton expédition ».';
    target=root.querySelector('.v17-solo,[data-a="adventure"]');
    step=1;
  }else if(page==='setup'){
    title='Choisis tes mondes.';
    copy='Coche un ou plusieurs mangas parmi les 4 grands blocs, puis clique sur « Partir → » dans la barre du bas.';
    target=root.querySelector('[data-a="new"]');
    step=1;
  }else if(run?.phase==='draft'){
    title='Compose ton équipe, un choix à la fois.';
    copy='Clique une carte flottante pour voir ses techniques et la recruter, ou tente directement le mystère. Choix '+(run.step+1)+' sur 6.';
    target=root.querySelector('[data-a="draft-focus"],[data-a="draft"]');
    step=2;
  }else if(run?.phase==='map'){
    title='Choisis ta prochaine étape.';
    copy='Clique sur une rencontre éclairée à droite pour avancer vers le boss du chapitre.';
    target=root.querySelector('.a-route-card[data-a="node"]');
    step=3;
  }else if(run?.phase==='prepare'){
    title=run.items.length?'Équipe tes armes avant le combat !':'Ton équipe est prête.';
    copy=run.items.length?'Ouvre « Équipe & équipement » (ou le Sac en bas) pour donner tes armes à tes combattants, puis lance le combat.':'Tes alliés sont à gauche, les adversaires à droite. Clique sur « Lancer le combat → ».';
    target=root.querySelector(run.items.length?'[data-a="inventory"]':'[data-a="fight"]');
    step=4;
  }else if(run?.phase==='combat'){
    title='Le combat est automatique.';
    copy='La vitesse détermine l’initiative. Utilise Pause pour observer ou Vitesse ×2 pour accélérer.';
    target=root.querySelector('[data-a="speed"],[data-a="pause"]');
    step=5;
  }else if(['reward','end'].includes(run?.phase)||page==='bilan'){
    title=run?.phase==='reward'?'Victoire : choisis ta récompense.':'Fin d’expédition & Packs.';
    copy=run?.phase==='reward'?'Tu peux inspecter chaque carte avec 👁 ou choisir directement ta récompense en un clic.':'Clique sur tes cartes pour les visualiser et ouvre tes packs gagnés pour enrichir ta collection !';
    target=root.querySelector('[data-a="reward"],[data-v192="packs"]');
    step=6;
    if(page==='bilan'||run?.phase==='end'){skipped=true;try{localStorage.setItem(KEY,'done');}catch{}}
  }else return;

  const box=document.createElement('aside');
  box.className='v193-guide';
  box.setAttribute('aria-label','Guide de première partie');
  box.innerHTML='<div class="v193-guide-step">'+step+'<small>/ 6</small></div><div><b>'+title+'</b><p>'+copy+'</p></div><button type="button" data-guide="close" aria-label="Masquer le guide">×</button>';
  if(inv)root.querySelector('.a-modal-title')?.after(box);
  else if(page==='home')root.querySelector('.v17-play,.v15-play-zone')?.prepend(box)||root.querySelector('.a-main')?.append(box);
  else root.querySelector('.a-main')?.prepend(box);
  if(target)target.classList.add('v193-guide-target');
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-guide="close"]')){
    skipped=true;try{localStorage.setItem(KEY,'done');}catch{}
    document.querySelectorAll('.v193-guide').forEach(x=>x.remove());
    document.querySelectorAll('.v193-guide-target').forEach(x=>x.classList.remove('v193-guide-target'));
  }
  if(e.target.closest('[data-guide="restart"]')){restartTutorial();config?.render?.();}
},true);
