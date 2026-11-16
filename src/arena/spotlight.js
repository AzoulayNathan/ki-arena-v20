/** Center-stage card spotlight for skills / KO. Presentation only. */
import {cardArtFallbackChain} from "./media.js";

export function clearSpotlight(root){
  root?.querySelectorAll(".a-spotlight").forEach(el=>el.remove());
}

export function showSpotlight(root,{card,kind="skill",label="",ally=true,reduced=false,seed=""}={}){
  if(!root||!card) return null;
  clearSpotlight(root);
  const el=document.createElement("div");
  el.className=`a-spotlight ${kind} ${ally?"ally":"enemy"}${reduced?" reduced":""}`;
  el.setAttribute("role","status");
  el.setAttribute("aria-live","polite");
  const chain=cardArtFallbackChain(card,{seed,preferSpecial:true}),art=chain[0]||'',rest=chain.slice(1).join('|');
  const ko=kind.includes("ko");
  el.innerHTML=`<div class="a-spotlight-card" style="--world:${card.universe==="DB"?"#53cfff":card.universe==="HXH"?"#78e59c":card.universe==="NARUTO"?"#ffb13b":"#ff7455"}">
    <img src="${art}" alt="" aria-hidden="true" data-cands="${rest}" onerror="const a=(this.dataset.cands||'').split('|').filter(Boolean);if(a.length){this.src=a.shift();this.dataset.cands=a.join('|')}else this.hidden=true">
    <div class="a-spotlight-meta"><b>${escapeHtml(card.name)}</b><span>${escapeHtml(label||(ko?"K.O.":"Capacité"))}</span></div>
    ${ko?'<div class="a-spotlight-ko">K.O.</div>':""}
  </div>`;
  root.append(el);
  return el;
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
