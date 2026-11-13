import {polishV17} from './experience.js';
import {asset} from './media.js';
import {theme,crest} from '../v15/theme.js';
import {recruitment,modeArt,mountModes} from '../v17/mode-carousel.js';
import {MIXED_RULES,MIXED_ROUNDS} from '../v16/draft.js';
import {START_DRAFT_PICKS} from '../v20/draft.js';

export function setupMarkup({worlds,c,stored,error,checks,esc,btn}){
  return `<section class="v20-setup-page">
    <header class="v20-setup-top"><h1>Choisis tes mondes.</h1></header>
    <div class="a-worlds v20-manga-stack" aria-label="Mondes">${checks}</div>
    <div class="v20-depart-bar" role="region" aria-label="Départ">
      <div class="v20-depart-copy"><span class="a-eyebrow">LE DÉPART</span><b>Prêt à partir ?</b></div>
      <div class="v20-depart-actions">${btn('Partir →','new','','primary v20-depart-go')}${stored?btn('Reprendre la route','resume','','light'):''}</div>
      <details class="a-details v20-depart-more"><summary>Seed & import</summary>
        <label class="a-label">Seed<input id="a-seed" maxlength="120" value="${esc(stored?.seed||'HORIZON-'+new Date().toISOString().slice(0,10))}"></label>
        <label class="a-file-label">Importer une run<input type="file" id="a-import-run" accept=".json"></label>
        ${error?`<p role="alert">${esc(error)}</p>`:''}
      </details>
    </div>
  </section>`;
}

export function mixedDraftMarkup({run,c,hud,fighter,gearCard,esc,btn,selectedOffer=null}){
  const rounds=run.rulesVersion==='20.0.0'?START_DRAFT_PICKS:MIXED_ROUNDS;
  return `${hud}<section class="a-draft-heading v16-recruit-heading"><span class="a-eyebrow">LE RECRUTEMENT · DESTINS CROISÉS</span><h1>Choisis ton destin.</h1><div class="a-progress" aria-label="Choix ${run.step+1} sur ${rounds}">${Array.from({length:rounds},(_,i)=>`<i class="${i<=run.step?'active':''}"></i>`).join('')}</div></section>
  <section class="v16-draft-stage v20-draft-float"><div class="a-offers v14-draft-offers">${run.offers.map((o,i)=>{
    const attrs=`data-a="draft" data-id="${esc(o.token)}" data-offer-index="${i}"`;
    const kind=o.kind==='hero'?'ALLIÉ':'ARME';
    const selected=selectedOffer===o.token;
    if(o.disabled)return `<div class="v14-draft-offer unavailable v20-float-offer"><span class="v16-offer-kind">${kind}</span><div class="v16-unavailable-mark">◇</div><p>${esc(o.reason)}</p><button disabled class="a-button" ${attrs}>Indisponible</button></div>`;
    if(!o.revealed)return `<button class="v14-draft-offer a-mystery v20-locked-mystery" ${attrs} aria-label="Choisir la proposition mystère"><span class="v16-offer-kind">LE DESTIN GARDE SON SECRET</span><div class="v14-mystery-orbit"><span>?</span></div><small>UN DESTIN INCONNU</small><h2>Et si c’était lui ?</h2><p></p><strong>Tenter le destin ↗</strong></button>`;
    const h=o.kind==='hero'?c.byId.get(o.id):c.byItem.get(o.id);
    if(!h)return `<div class="v14-draft-offer unavailable v20-float-offer"><p>Carte introuvable</p></div>`;
    const label=o.kind==='hero'?'Recruter →':'Emporter →';
    const focusAttrs=`data-id="${esc(o.token)}" data-offer-index="${i}" data-card-id="${esc(h.id)}"`;
    const face=o.kind==='hero'
      ?fighter(h,{action:'draft-focus',attrs:focusAttrs})
      :`<div class="v20-float-gear" data-a="draft-focus" ${focusAttrs} role="button" tabindex="0" aria-label="Voir ${esc(h.name)}">${gearCard(h)}</div>`;
    return `<div class="v14-draft-offer v20-float-offer ${selected?'is-selected':''} ${o.kind==='weapon'?'v16-weapon-offer':''}" data-offer-kind="${o.kind}">
      <div class="v20-float-card">${face}</div>
      ${selected?btn(label,'draft',`data-id="${esc(o.token)}" data-offer-index="${i}"`,'primary v20-draft-pick is-shown'):''}
    </div>`;
  }).join('')}</div></section>`;
}

export function decoratePages(root,{page,run,worlds,mini,worldScroll}){
  document.body.classList.add('v16-app','v17-app');mountModes(root);root.style.setProperty('--v16-header-height',(root.querySelector('.a-header')?.getBoundingClientRect().height||104)+'px');
  polishV17(root,{page,run});const world=run?.worlds?.[0]||document.body.dataset.visualWorld||worlds?.[0]||'DB';root.style.setProperty('--v16-recruit','url("'+asset(recruitment(world))+'")');root.style.setProperty('--v16-hall','url("'+asset('assets/v16/arcade-hall.webp')+'")');root.style.setProperty('--v16-gates','url("'+asset('assets/v16/tournament-gates.webp')+'")');
  for(const el of root.querySelectorAll('.a-world,.p-worlds label')){const input=el.querySelector('input');if(!input)continue;el.style.setProperty('--world-art','url("'+asset(recruitment(input.value))+'")');if(el.matches('.p-worlds label')){el.classList.add('v16-party-world');const mark=document.createElement('i');mark.className='v16-world-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML=crest(input.value);el.append(mark);}}
  root.querySelectorAll('.a-arcade-tile').forEach(el=>el.style.setProperty('--tile-scene','url("'+asset(modeArt(el.classList.contains('tournament')?'gates':el.classList.contains('draft')?'recruit':el.classList.contains('rank')?'event':'arena',world))+'")'));
  root.querySelectorAll('.v15-extra-tiles button').forEach((el,i)=>el.style.setProperty('--extra-art','url("'+asset(modeArt(['recruit','event','hall'][i],world))+'")'));
  root.querySelectorAll('.p-mode').forEach((el,i)=>el.style.setProperty('--tile-art','url("'+asset(modeArt(['hall','gates','event','recruit'][i],world))+'")'));
  if(page==='party')root.querySelector('.p-hero')?.style.setProperty('--party-art','url("'+asset('assets/v16/arcade-hall.webp')+'")');
  if(page==='arcade'){const heading=root.querySelector('.a-page-heading');heading?.classList.add('v16-arcade-heading');const seed=root.querySelector('.v14-arcade-seed');if(seed){const details=document.createElement('details');details.className='v16-arcade-options';details.innerHTML='<summary>Rejouer un tirage précis</summary>';seed.replaceWith(details);details.append(seed);}}
  root.querySelectorAll('.a-worlds,.a-arcade-worlds').forEach((el,i)=>{if(worldScroll?.[i]!=null){el.scrollLeft=worldScroll[i];return;}const chosen=el.querySelector('.a-world:has(input:checked)');if(chosen&&el.scrollWidth>el.clientWidth)el.scrollLeft+=chosen.getBoundingClientRect().left-el.getBoundingClientRect().left-2;});
  if(page==='mini'&&mini?.mode==='auto5')root.querySelector('.a-quick-team')?.setAttribute('aria-label','Ton équipe sélectionnée, toujours accessible');
}
