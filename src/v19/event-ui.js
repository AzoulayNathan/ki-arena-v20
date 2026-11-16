import {eventOption} from './events.js';
/** Dual-scene immersive event UI helpers (markup only). */
export function eventMarkup(activeEvent, {mobile=false,run=null,selected=null}={}){
  if(!activeEvent) return "";
  const scenes=activeEvent.scenes||[];
  const dual=scenes.length===2;
  const cards=scenes.map((s,i)=>{const rule=run?eventOption(run,s.id):{ok:true},forced=activeEvent.forcedCombat;return `<button type="button" class="a-event-scene ${s.tone||''} ${selected===s.id?'selected':''}" data-a="${forced?'event-choose':'event-preview'}" data-scene="${s.id}" ${!rule.ok?'disabled':''}><span class="a-event-scene-kicker">${s.tone==='force'?'AFFRONTEMENT':s.tone==='risk'?'UN PARI À ASSUMER':'UNE AUTRE ROUTE'}</span><strong>${escapeHtml(s.label)}</strong><p>${escapeHtml(rule.detail||'')}</p>${!rule.ok?`<small>${escapeHtml(rule.reason)}</small>`:''}<i>${forced?'Entrer en combat →':selected===s.id?'Sélectionné':'Examiner ce choix →'}</i></button>`;}).join('');
  return `<section class="a-event-immersive ${mobile?"is-mobile":""} ${dual?"dual":"multi"}">
    <header class="a-event-copy"><span class="a-eyebrow">${escapeHtml(activeEvent.family.replaceAll("_"," "))}</span>
    <h1>${escapeHtml(activeEvent.title)}</h1><p>${escapeHtml(activeEvent.hook)}</p></header>
    <div class="a-event-scenes" data-compare="${mobile?"swipe":"side"}">${cards}</div>
    <div class="v14-event-confirm">${selected?`<button class="a-button primary" data-a="event-choose" data-scene="${selected}">Confirmer ce choix →</button>`:'<p class="a-help">Compare les chemins. Un seul choix pourra être emporté.</p>'}</div>
  </section>`;
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
