import {eventOption} from './event-router.js';
/** Immersive single-click event choices + optional card preview button. */
export function eventMarkup(activeEvent,{mobile=false,run=null}={}){
  if(!activeEvent)return '';
  const scenes=activeEvent.scenes||[];
  const dual=scenes.length===2;
  const pv=activeEvent.preview||{};
  const cards=scenes.map(s=>{
    const rule=run?eventOption(run,s.id):{ok:true},forced=activeEvent.forcedCombat;
    const previewCardId=s.id==='recruit'?pv.recruitId:(activeEvent.id==='crossroads_trade'&&s.id==='accept')?pv.outgoing:(activeEvent.id==='gear_offering'&&s.id==='sacrifice')?pv.sacrifice:null;
    return `<div class="v20-event-card-wrap">
      <button type="button" class="a-event-scene ${s.tone||''}" data-a="event-choose" data-scene="${escapeHtml(s.id)}" ${!rule.ok?'disabled':''}>
        <span class="a-event-scene-kicker">${s.tone==='force'?'AFFRONTEMENT':s.tone==='risk'?'UN PARI À ASSUMER':'UNE AUTRE ROUTE'}</span>
        <strong>${escapeHtml(s.label)}</strong>
        <p>${escapeHtml(rule.detail||'')}</p>
        ${!rule.ok?`<small>${escapeHtml(rule.reason)}</small>`:''}
        <i>${forced?'Entrer en combat →':'Choisir cette voie →'}</i>
      </button>
      ${previewCardId?`<button type="button" class="a-button light v20-event-inspect" data-a="inspect" data-id="${escapeHtml(previewCardId)}">👁 Voir la carte concernée</button>`:''}
    </div>`;
  }).join('');
  return `<section class="a-event-immersive ${mobile?'is-mobile':''} ${dual?'dual':'multi'}">
    <header class="a-event-copy"><span class="a-eyebrow">${escapeHtml(activeEvent.family.replaceAll('_',' '))}</span>
    <h1>${escapeHtml(activeEvent.title)}</h1><p>${escapeHtml(activeEvent.hook)}</p></header>
    <div class="a-event-scenes" data-compare="${mobile?'swipe':'side'}">${cards}</div>
  </section>`;
}

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
