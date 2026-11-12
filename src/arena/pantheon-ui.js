import {actTheme} from '../v14/acts.js';
import {registry} from './catalog.js';
/** Pantheon + end-of-run bilan markup — immersion: no ranks/numbers. */
import {honorTitle,honorBlurb} from './run-summary.js';
import {galleryOrder} from './pantheon-storage.js';
import {cardArtUrl,asset} from './media.js';
import {FRANCHISES} from '../franchises.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

export function bilanMarkup(receipt,{seed=''}={}){
  if(!receipt)return '<p>Souvenir incomplet.</p>';
  const honors=receipt.honors||{};
  const top=[['frappe',honors.frappe?.[0]],['rempart',honors.rempart?.[0]],['souffle',honors.souffle?.[0]]].filter(([,u])=>u);
  const team=(receipt.notableTeam?.units||[]).map(u=>cardMini(u,seed)).join('');
  const incomplete=receipt.incomplete?'<p class="a-help">Souvenir incomplet — seules les distinctions prouvables apparaissent.</p>':'';
  return `<section class="a-bilan">
    <header class="a-bilan-head"><span class="a-eyebrow">BILAN D'EXPÉDITION</span>
    <h1>${esc(outcomeTitle(receipt.outcome))}</h1>
    <p>Les combattants qui ont marqué la route.</p>${incomplete}</header>
    <div class="a-bilan-team">${team||'<p class="a-help">Aucune équipe remarquable enregistrée.</p>'}</div>
    <h2 class="v14-honors-heading">Les contributions de l’équipe.</h2>
    <div class="a-bilan-tabs" role="tablist">
      ${['frappe','rempart','souffle'].map(k=>`<button type="button" class="a-tab ${k==='frappe'?'active':''}" aria-selected="${k==='frappe'}" data-a="bilan-tab" data-tab="${k}" role="tab">${esc(honorTitle(k))}</button>`).join('')}
    </div>
    <div class="a-bilan-panel" data-panel="frappe">${honorList(honors.frappe,'frappe',seed)}</div>
    <div class="a-bilan-panel" data-panel="rempart" hidden>${honorList(honors.rempart,'rempart',seed)}</div>
    <div class="a-bilan-panel" data-panel="souffle" hidden>${honorList(honors.souffle,'souffle',seed)}</div>
    <div class="a-bilan-cta">
      <button data-a="pantheon-save" class="a-btn">Voir ce souvenir</button>
      <button data-a="pantheon" class="a-btn light">Panthéon</button>
      <button data-a="new-run" class="a-btn primary">Nouvelle expédition</button>
    </div>
  </section>`;
}

function outcomeTitle(o){return {defeat:'L\'expédition s\'achève',clear:'La route est ouverte',retreat:'Repli volontaire'}[o]||'Fin de parcours';}
function honorCard(kind,u,seed){
  if(!u)return '';
  return `<article class="a-honor-card ${kind}"><span class="a-eyebrow">${esc(honorTitle(kind))}</span>
    <div class="a-honor-art"><img src="${esc(cardArtUrl({id:u.cardId,universe:u.universe,sourceId:(u.cardId||'').split(':').pop()},{seed})||'')}" alt="" onerror="this.hidden=true"><b>${esc(u.name)}</b></div>
    <p>${esc(honorBlurb(kind))}</p>${u.damageDealt!==undefined?`<details class="a-details"><summary>Contribution réelle</summary><p>${u.damageDealt} dégâts infligés · ${u.damageTaken} subis · ${u.healingDone} PV rendus</p></details>`:''}<small>${u.alive?'Présent':'Parti / tombé'}</small></article>`;
}
function honorList(list,kind,seed){
  if(!list?.length)return `<p class="a-help">${kind==='souffle'?'Aucun soin pendant cette expédition.':'Aucune contribution dans cette catégorie.'}</p>`;
  return `<div class="a-honor-row">${list.map(u=>honorCard(kind,u,seed)).join('')}</div>`;
}
function cardMini(u,seed){
  let hero;try{hero=registry([u.universe||String(u.cardId).split(':')[0]]).byId.get(u.cardId);}catch{}
  const art=cardArtUrl({id:u.cardId,universe:u.universe,sourceId:(u.cardId||'').split(':').pop()},{seed})||'';
  return `<figure class="a-memory-card ${u.status==='dead'?'is-gone':''}"><img src="${esc(art)}" alt="" onerror="this.hidden=true"><figcaption>${esc(u.name||hero?.name||'Compagnon')}</figcaption></figure>`;
}

export function pantheonMarkup(memories,filter={},seed=''){
  const list=galleryOrder(memories,filter);
  const focus=list[filter.index|0]||list[0];
  const thumbs=list.map((m,i)=>`<button type="button" class="a-pantheon-thumb ${m===focus?'active':''}" data-a="pantheon-focus" data-index="${i}" aria-label="${esc(m.name)}">${(m.notableTeam?.units||[]).slice(0,3).map(u=>`<img src="${esc(cardArtUrl({id:u.cardId,universe:u.universe,sourceId:(u.cardId||'').split(':').pop()},{seed:m.seed})||'')}" alt="">`).join('')}</button>`).join('');
  const emblems=(focus?.emblems||[]).map(e=>`<span class="a-emblem">${esc(e.label)}</span>`).join('');
  const worlds=(focus?.worlds||[]).map(w=>FRANCHISES[w]?.short||w).join(' · ');
  return `<section class="a-pantheon">
    <header><span class="a-eyebrow">PANTHÉON</span><h1>Galerie des souvenirs</h1>
    <p>Tes véritables expéditions, sans classement.</p></header>
    <div class="a-pantheon-filters">
      <button data-a="pantheon-filter" data-filter="all" class="a-chip">Tous</button>
      <button data-a="pantheon-filter" data-filter="favorite" class="a-chip">Favoris</button>
      <button data-a="pantheon-filter" data-filter="recent" class="a-chip">Dernières expéditions</button>
    </div>
    <div class="a-pantheon-stage" style="--memory-scene:url('${asset(actTheme(Math.floor(((focus?.depth||1)-1)/10)).background)}')">${focus?`
      <button data-a="pantheon-prev" class="a-nav" aria-label="Précédent">‹</button>
      <div class="a-pantheon-hero">
        <h2 contenteditable="true" role="textbox" aria-label="Nom du souvenir" title="Cliquer pour renommer ce souvenir" data-a="pantheon-rename" data-id="${esc(focus.runId)}">${esc(focus.name)}</h2>
        <p>${esc(worlds)} · ${focus.outcome==='defeat'?'Tombée au combat':focus.outcome==='retreat'?'Repli':'Parcours'}${focus.incomplete?' · souvenir incomplet':''}</p>
        <div class="a-emblems">${emblems||'<span class="a-emblem">Expédition</span>'}</div>
        <div class="a-bilan-team">${(focus.notableTeam?.units||[]).map(u=>cardMini(u,focus.seed)).join('')}</div>
        <div class="a-pantheon-actions">
          <button data-a="pantheon-fav" data-id="${esc(focus.runId)}" class="a-btn">${focus.favorite?'★ Favori':'☆ Favori'}</button>
          <button data-a="pantheon-export" class="a-btn light">Exporter</button>
        </div>
      </div>
      <button data-a="pantheon-next" class="a-nav" aria-label="Suivant">›</button>`:'<p class="a-help">Aucun souvenir pour l\'instant. Termine une expédition pour en conserver un.</p>'}
    </div>
    <div class="a-pantheon-thumbs">${thumbs}</div>
    <div class="a-bilan-cta"><button data-a="home" class="a-btn">Accueil</button><label class="a-btn light">Importer<input type="file" id="a-pantheon-import" accept="application/json" hidden></label></div>
  </section>`;
}
