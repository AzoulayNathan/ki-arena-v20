import {collectionState,pendingPacks,openPack,ensureStarterPack} from '../v19/collection-rewards.js';
import {registry,worldName} from '../v19/catalog.js';
import {asset,tone,audioSettings} from '../v19/media.js';
import {horizon,crest} from '../v15/theme.js';
import {cardMarkup as fallbackCardMarkup,hydrateCardFaces} from '../v19/polish.js';

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const worlds=['DB','HXH','NARUTO','ONEPIECE'],names=['Éclat solaire','Expédition émeraude','Souffle écarlate','Grand large'];
let config={},overlay=null,focus=null,current=null,revealed=new Set(),stage='shelf',busy=false,selectedWorld='DB',delay=null;
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const renderCardMarkup=(h,opts)=>(config.cardMarkup||fallbackCardMarkup)(h,opts);

export function configurePacks(options){config=options;}
export function packShelfButton(){
  ensureStarterPack('DB');
  const n=pendingPacks().length;
  return `<button class="a-button primary v20-pack-btn" data-v192="packs">✦ Ouvrir mes packs${n?' · '+n:''}</button>`;
}

function packMatchesWorld(p,w){return p?.worlds?.includes(w)||p?.cards?.some(c=>c.universe===w);}
function unopened(w=selectedWorld){return pendingPacks().filter(p=>packMatchesWorld(p,w));}
function art(world){
  const idx=Math.max(0,worlds.indexOf(world));
  return `background-image:url('${asset('assets/v192/boosters.webp')}');--pack-x:${idx/3*100}%;`;
}
function roomBg(world){
  const w=worlds.includes(world)?world:'DB';
  return `--pack-horizon:url('${asset(horizon(w))}');`;
}
function paint(){
  if(!overlay)return;
  if(config.hydrate)config.hydrate(overlay);
  else hydrateCardFaces(overlay);
}

function shelf(){
  stage='shelf';current=null;revealed.clear();
  ensureStarterPack(selectedWorld);
  const allPending=pendingPacks();
  let available=unopened(selectedWorld);
  const last=collectionState().claims.filter(p=>p.opened&&packMatchesWorld(p,selectedWorld)).at(-1)||collectionState().claims.filter(p=>p.opened).at(-1);
  overlay.innerHTML=`<section class="v192-pack-room v20-pack-room" style="${roomBg(selectedWorld)}" role="document">
    <button class="v192-pack-close" data-pack="close" aria-label="Fermer les packs">×</button>
    <header>
      <span class="a-eyebrow">LA COLLECTION PREND VIE</span>
      <h1>Un nouvel horizon.</h1>
      <p>Une gamme illustrée par univers · Touche le booster pour briser le sceau.</p>
    </header>
    <div class="v192-pack-tabs">${worlds.map(w=>{
      const cnt=unopened(w).length;
      return `<button data-pack="world" data-world="${w}" aria-pressed="${w===selectedWorld}"><i class="v20-pack-tab-crest" aria-hidden="true">${crest(w)}</i><span>${worldName(w)}</span>${cnt?`<em>${cnt}</em>`:''}</button>`;
    }).join('')}</div>
    <div class="v20-booster-stage">
      <button class="v192-booster" style="${art(selectedWorld)}" data-pack="${available.length?'open':allPending.length?'open-any':last?'replay':''}" ${available.length||allPending.length||last?'':'disabled'} aria-label="Ouvrir un pack ${worldName(selectedWorld)}">
        <i class="v20-booster-seal" aria-hidden="true">${crest(selectedWorld)}</i>
        <b>KI ARENA</b>
        <span>${names[worlds.indexOf(selectedWorld)]}</span>
        <small>${available.length?(available[0]?.cards.length||5)+' CARTES · '+available.length+' DISPONIBLE'+(available.length>1?'S':''):allPending.length?'PACK PRÊT DANS UN AUTRE MONDE':last?'REVOIR DERNIER TIRAGE':'AUCUN PACK EN ATTENTE'}</small>
      </button>
    </div>
    <div class="v192-pack-actions">
      ${available.length?'<button class="v20-pack-cta" data-pack="open">Déchirer le pack →</button>':allPending.length?'<button class="v20-pack-cta" data-pack="open-any">Aller au pack disponible ('+allPending.length+') →</button>':'<p>Termine un combat d’expédition pour gagner de nouveaux boosters.</p>'}
      ${last?'<button data-pack="replay">Revoir mon dernier pack</button>':''}
      <details><summary>Chances d’obtention</summary><p>Par carte : commune 33 % · peu commune 27 % · rare 21 % · épique 15 % · légendaire 4 %.<br>Édition spéciale : 10 % (+10 % stats en jeu). Tirages indépendants dans les univers de la run.</p></details>
    </div>
  </section>`;
}

function resolveCard(o){
  const c=registry([o.universe||'DB']);
  return c.byId.get(o.id)||c.byItem?.get(o.id)||{id:o.id,name:o.id,universe:o.universe||'DB',rarity:o.rarity||'common',attack:20,maxHp:160,speed:40,effects:[]};
}

function showCards(){
  if(!overlay||!current)return;
  stage='cards';busy=false;
  const world=current.cards[0]?.universe||selectedWorld;
  overlay.innerHTML=`<section class="v192-pack-room v20-pack-room result" style="${roomBg(world)}" role="document">
    <button class="v192-pack-close" data-pack="close" aria-label="Fermer les packs">×</button>
    <header>
      <span class="a-eyebrow">TON PACK · CARTES CONSERVÉES</span>
      <h1>À toi de les découvrir.</h1>
      <p>Clique sur chaque carte pour la retourner, puis une seconde fois pour l’examiner en grand.</p>
    </header>
    <div class="v192-reveal-row">${current.cards.map((o,i)=>{
      const h=resolveCard(o);
      const w=h.universe||o.universe||selectedWorld;
      const special=o.finish==='gold'||o.finish==='special';
      return `<button class="v192-reveal-card" data-pack="reveal" data-index="${i}" data-rarity="${E(o.rarity||'common')}" data-special="${special?'1':'0'}" style="--delay:${i*70}ms;--card-back-art:url('${asset(horizon(w))}')" aria-label="Révéler la carte ${i+1}" aria-pressed="false">
        <span class="v192-card-back"><i class="v20-back-crest">${crest(w)}</i><b>KI</b><small>ARENA</small></span>
        <span class="v192-card-front" aria-hidden="true">${renderCardMarkup(h,{seed:o.seed,skin:special?'special':'normal',equipment:!!h.category})}<small>${E(h.name)}</small></span>
      </button>`;
    }).join('')}</div>
    <div class="v192-pack-actions">
      <button class="v20-pack-cta" data-pack="all">Tout révéler</button>
      <button data-pack="shelf">Autre pack${pendingPacks().length?' ('+pendingPacks().length+')':''}</button>
      <button data-pack="close">Terminer</button>
      <p role="status" id="v192-reveal-status">0 / ${current.cards.length} cartes révélées · Sauvegardées dans ta collection.</p>
    </div>
  </section>`;
  paint();
}

function reveal(i){
  if(!current?.cards?.[i])return;
  if(revealed.has(i)){zoom(i);return;}
  revealed.add(i);
  const b=overlay.querySelector('[data-index="'+i+'"]'),o=current.cards[i],h=resolveCard(o);
  if(!b)return;
  b.classList.add('revealed');
  b.querySelector('.v192-card-front')?.setAttribute('aria-hidden','false');
  b.querySelector('.v192-card-back')?.setAttribute('aria-hidden','true');
  b.setAttribute('aria-pressed','true');
  b.setAttribute('aria-label','Agrandir '+(h.name||o.id));
  paint();
  if(!audioSettings.muted)tone(['epic','legendary'].includes(o.rarity)||o.finish==='gold'?'win':'tap');
  const st=overlay.querySelector('#v192-reveal-status');
  if(st)st.textContent=revealed.size+' / '+current.cards.length+' cartes révélées · Clique une carte révélée pour la voir en grand.';
}

function zoom(i){
  const o=current?.cards?.[i];if(!o)return;
  const h=resolveCard(o),special=o.finish==='gold'||o.finish==='special';
  const techs=(h.effects||[]).map((e,idx)=>`<li class="v20-tech" style="--i:${idx}"><b>${E(e.name)}</b><span>${E(e.description||e.type||'')}</span></li>`).join('')||'<li class="v20-tech">Aucune technique listée.</li>';
  overlay.querySelector('.v192-pack-zoom')?.remove();
  const el=document.createElement('div');
  el.className='v192-pack-zoom';
  el.dataset.pack='unzoom';
  el.innerHTML=`<div class="v20-pack-zoom-inner">
    <button class="v20-inspect-x" data-pack="unzoom" aria-label="Revenir au pack">×</button>
    <div class="v20-pack-zoom-card">${renderCardMarkup(h,{seed:o.seed,skin:special?'special':'normal',equipment:!!h.category})}</div>
    <div class="v20-inspect-copy"><h3>Techniques</h3><ul class="a-inspect-techs">${techs}</ul></div>
  </div>`;
  overlay.append(el);
  paint();
  el.querySelector('button')?.focus();
}

function open(replay=false,anyWorld=false){
  if(busy)return;
  if(anyWorld){
    const first=pendingPacks()[0];
    if(first){selectedWorld=first.worlds?.[0]||first.cards[0]?.universe||'DB';}
  }
  const candidates=unopened(selectedWorld);
  let target=replay
    ?(collectionState().claims.filter(p=>p.opened&&packMatchesWorld(p,selectedWorld)).at(-1)||collectionState().claims.filter(p=>p.opened).at(-1))
    :(candidates[0]||pendingPacks()[0]);
  if(!target)return;
  try{current=replay?target:openPack(target.id);}catch(e){
    const act=overlay?.querySelector('.v192-pack-actions');
    if(act)act.textContent='Ouverture non enregistrée : '+e.message;
    return;
  }
  revealed.clear();
  if(replay||reduced()){showCards();return;}
  busy=true;stage='opening';
  const booster=overlay.querySelector('.v192-booster');
  booster?.classList.add('opening');
  const stageEl=overlay.querySelector('.v20-booster-stage');
  if(stageEl){const burst=document.createElement('i');burst.className='v20-pack-burst';stageEl.append(burst);}
  tone('win');
  delay=setTimeout(showCards,720);
}

export function closePacks(){
  clearTimeout(delay);overlay?.remove();overlay=null;busy=false;
  config.onClose?.();
  focus?.isConnected&&focus.focus();
}

export function showPacks(){
  if(overlay)return;
  focus=document.activeElement;
  ensureStarterPack(selectedWorld);
  const first=pendingPacks()[0];
  if(first)selectedWorld=first.worlds?.[0]||first.cards[0]?.universe||selectedWorld;
  overlay=document.createElement('div');
  overlay.className='v192-pack-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Atelier des packs');
  overlay.tabIndex=-1;
  document.body.append(overlay);
  shelf();
  overlay.focus();
}

document.addEventListener('click',e=>{
  if(e.target.closest('[data-v192="packs"]')){e.preventDefault();e.stopImmediatePropagation();showPacks();return;}
  if(!overlay)return;
  if(e.target===overlay){closePacks();return;}
  const zoomBg=e.target.classList?.contains('v192-pack-zoom')?e.target:null;
  if(zoomBg){zoomBg.remove();return;}
  const b=e.target.closest('[data-pack]');
  if(!b||b.disabled)return;
  e.preventDefault();e.stopImmediatePropagation();
  switch(b.dataset.pack){
    case'close':closePacks();break;
    case'world':if(!busy){selectedWorld=b.dataset.world;shelf();}break;
    case'open':open(false,false);break;
    case'open-any':open(false,true);break;
    case'replay':open(true,false);break;
    case'shelf':shelf();break;
    case'reveal':reveal(Number(b.dataset.index));break;
    case'all':current?.cards?.forEach((_,i)=>{if(!revealed.has(i))reveal(i);});break;
    case'unzoom':overlay.querySelector('.v192-pack-zoom')?.remove();break;
  }
},true);

document.addEventListener('keydown',e=>{
  if(!overlay)return;
  if(e.key==='Escape'){
    e.preventDefault();e.stopImmediatePropagation();
    if(overlay.querySelector('.v192-pack-zoom'))overlay.querySelector('.v192-pack-zoom').remove();
    else closePacks();
  }
  if(e.key==='Tab'){
    const nodes=[...overlay.querySelectorAll('button,summary,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length),first=nodes[0],last=nodes.at(-1);
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===overlay)){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===overlay)){e.preventDefault();first?.focus();}
  }
},true);
