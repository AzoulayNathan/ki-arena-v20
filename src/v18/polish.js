/** Presentation only. Never reads/writes RNG, saves or combat state. */
import {asset} from '../arena/media.js';
import {icon as uiIcon} from '../party/icons.js';
import {crest,scene} from '../v15/theme.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rootRef=null,observer=null,lastFilterFocus=null,pantheonChoice='all';
const icons={audio:'audio',settings:'settings',inventory:'inventory',map:'map',retreat:'rest'};
function markControls(root){
 root.querySelectorAll('.a-tabs button,.v14-bag-filter button').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));
 root.querySelectorAll('input[type="range"]').forEach(i=>{i.setAttribute('aria-label',i.dataset.volume==='music'?'Volume de la musique':'Volume des effets');i.setAttribute('aria-valuetext',Math.round(Number(i.value)*100)+' %');});
 root.querySelectorAll('select:not([aria-label])').forEach(s=>{if(!s.closest('label'))s.setAttribute('aria-label',s.id==='a-portrait-world'?'Univers des portraits':'Sélection');});
 root.querySelectorAll('.c-favorite').forEach(b=>b.title=b.getAttribute('aria-label'));
 root.querySelectorAll('.c-expand').forEach(b=>b.setAttribute('aria-expanded',String(!!b.nextElementSibling?.classList.contains('c-forms'))));
 root.querySelectorAll('.a-rank-slots button').forEach(b=>b.setAttribute('aria-label',b.disabled?'Place '+b.querySelector('b').textContent+' occupée par '+b.querySelector('span').textContent:'Placer à la position '+b.querySelector('b').textContent));
}
function collection(root){
 const panel=root.querySelector('.c-filters');if(!panel)return;
 panel.querySelector(':scope > p')?.remove();
 panel.querySelectorAll('fieldset label').forEach(l=>{l.classList.add('v18-check');const i=l.querySelector('input');if(i?.dataset.cWorld&&!l.querySelector('.v18-world-seal')){const seal=document.createElement('span');seal.className='v18-world-seal';seal.setAttribute('aria-hidden','true');seal.innerHTML=crest(i.dataset.cWorld);l.append(seal);}});
 const toggle=root.querySelector('[data-c="toggle"]');if(toggle){toggle.setAttribute('aria-controls','c-filters');toggle.setAttribute('aria-expanded',String(panel.classList.contains('open')));}
 if(!panel.querySelector('[data-v18="filters-close"]')){const b=document.createElement('button');b.type='button';b.className='v18-filter-close';b.dataset.v18='filters-close';b.textContent='Voir les cartes';panel.append(b);}
 const results=root.querySelector('#c-results');if(results){results.setAttribute('role','region');results.setAttribute('aria-label','Cartes de la collection');}
}
function modal(root){
 const m=root.querySelector('.a-modal');if(!m)return;
 const kind=m.getAttribute('aria-label');m.dataset.v18Kind=kind;
 const title=m.querySelector('.a-modal-title');if(title&&!title.querySelector('.v18-modal-mark')){const icon=kind==='Audio'?'audio':kind==='Inventaire'?'inventory':kind==='Carte complète'?'map':kind==='Paramètres'?'settings':null;if(icon){const mark=document.createElement('span');mark.className='v18-modal-mark';mark.innerHTML=['audio','settings','map'].includes(icon)?uiIcon(icon):'<img src="'+asset('assets/v14/icons/inventory.svg')+'" alt="">';title.prepend(mark);}}
 if(kind==='Paramètres'){
  m.querySelectorAll(':scope > .a-panel').forEach((p,i)=>{if(p.dataset.v18Ready)return;p.dataset.v18Ready='true';const para=p.querySelector('p');if(para){const help=document.createElement('details');help.className='v18-help';help.innerHTML='<summary>'+(i?'Comment déplacer ma run ?':'Formats et noms des fichiers')+'</summary>';para.replaceWith(help);help.append(para);}p.classList.add('v18-settings-section');});
 }
 if(kind==='Audio'){
  const para=m.querySelector(':scope > p');if(para)para.textContent='Ton ambiance, ton volume.';
  const help=m.querySelector('.a-help');if(help&&!help.closest('details')){const details=document.createElement('details');details.className='v18-help';details.innerHTML='<summary>À propos des musiques</summary>';help.replaceWith(details);details.append(help);}
 }
 if(kind==='Inventaire'){
  const h=m.querySelector('.a-modal-title h2');if(h)h.textContent='Ton équipe. Ton équipement.';
  m.querySelectorAll('.v14-bag-item .a-item-icon').forEach(icon=>{if(icon.querySelector('.a-object-art')||icon.querySelector('img')?.src.includes('/equipment/'))return;const article=icon.closest('.a-item'),txt=article?.textContent||'';let i=/armure/i.test(txt)?2:/consommable|soin|senzu/i.test(txt)?3:/mitraill|fusil|pistolet|revolver|carabine/i.test(txt)?0:null;if(i===null)return;icon.classList.add('v18-category-art');icon.innerHTML='<span role="img" aria-label="Illustration de catégorie, pas un portrait exact de l’objet" style="background-image:url(\''+asset('assets/v17/reward-objects.webp')+'\');background-position:'+i%2*100+'% '+Math.floor(i/2)*100+'%"></span>';});
  const tabs=m.querySelector('.a-tabs');if(tabs)tabs.setAttribute('aria-label','Sections de l’inventaire');
  const chosen=m.querySelector('.v14-bag-item.chosen');m.dataset.v18Choosing=String(!!chosen);
  const targets=m.querySelector('.v14-targets');if(targets)targets.setAttribute('aria-label','Choisir le porteur de l’objet');
  m.querySelectorAll('.v14-target[aria-disabled="true"]').forEach(b=>b.title=b.querySelector('small')?.textContent||'Sélectionne d’abord un objet');
 }
 if(kind==='Carte complète'){
  const p=m.querySelector(':scope > p');if(p){p.className='v18-map-legend';p.innerHTML='<span><i class="visited"></i>Parcouru</span><span><i class="available"></i>Accessible</span><span><i class="future"></i>À venir</span>';}
 }
}
function scenes(root,page){
 const world=document.body.dataset.visualWorld||'DB';
 root.style.setProperty('--v18-scene','url("'+asset(scene('event',world))+'")');
 root.style.setProperty('--v18-rest','url("'+asset(scene('rest',world))+'")');
 root.querySelectorAll('.a-mini-result,.p-result,.a-bilan-head').forEach(el=>el.classList.add('v18-finale'));
 root.querySelectorAll('.a-mini-heading,.p-heading').forEach(el=>el.classList.add('v18-game-heading'));
 root.querySelectorAll('.a-pantheon-filters button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.filter===pantheonChoice));});
 if(page==='party'){
  root.querySelectorAll('.p-setup-panel > div > p,.p-rule-note').forEach(p=>{if(p.closest('details'))return;const d=document.createElement('details');d.className='v18-help';d.innerHTML='<summary>Les règles en bref</summary>';p.replaceWith(d);d.append(p);});
  const selected=root.querySelector('.p-mode.selected');root.querySelectorAll('.p-mode').forEach(b=>b.setAttribute('aria-pressed',String(b===selected)));
 }
 root.querySelectorAll('button[data-a="rest"]').forEach((b,i)=>{b.classList.add('v18-rest-choice');b.style.setProperty('--rest-art','url("'+asset(scene(i?'combat':'rest',world))+'")');const span=b.querySelector(':scope > span');if(span){span.innerHTML='<img src="'+asset('assets/v14/icons/'+(i?'weapon':'rest')+'.svg')+'" alt="">';}});
 root.querySelectorAll('.a-reward:has([data-a="buy"])').forEach(el=>el.classList.add('v18-shop-choice'));
 root.querySelectorAll('.a-event-scene').forEach((el,i)=>{if(el.querySelector('.v18-event-mark'))return;const mark=document.createElement('span');mark.className='v18-event-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML='<img src="'+asset('assets/v14/icons/'+(el.classList.contains('risk')?'event-mystery':el.classList.contains('force')?'combat':i?'map':'treasure')+'.svg')+'" alt="">';el.prepend(mark);});
}
export function polishV18(root,context){
 observer?.disconnect();rootRef=root;document.body.classList.add('v18-app');
 const edition=root.querySelector('.a-brand small');if(edition)edition.innerHTML='HORIZONS<br>ÉDITION / 18';
 markControls(root);collection(root);modal(root);scenes(root,context.page);
 observer=new MutationObserver(records=>{if(records.some(r=>r.target.id==='c-results')){markControls(root);collection(root);} });
 observer.observe(root,{childList:true,subtree:true});
}
// The filter is a real mobile sheet. Closing it restores the invoking control.
function closeFilters(){const panel=rootRef?.querySelector('.c-filters');panel?.classList.remove('open');panel?.removeAttribute('role');panel?.removeAttribute('aria-modal');rootRef?.querySelector('[data-c="toggle"]')?.setAttribute('aria-expanded','false');document.body.classList.remove('v18-filters-open');lastFilterFocus?.focus({preventScroll:true});}
window.addEventListener('click',e=>{
 const filter=e.target.closest('[data-a="pantheon-filter"]');if(filter)pantheonChoice=filter.dataset.filter;
 if(e.target.closest('[data-v18="filters-close"]')){closeFilters();return;}
 const toggle=e.target.closest('[data-c="toggle"]');if(toggle){e.preventDefault();e.stopImmediatePropagation();lastFilterFocus=toggle;const panel=document.querySelector('.c-filters'),open=panel?.classList.toggle('open');toggle.setAttribute('aria-expanded',String(!!open));document.body.classList.toggle('v18-filters-open',!!open);if(open){panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Filtrer la collection');panel.querySelector('button,input')?.focus();}else closeFilters();}
},true);
window.addEventListener('keydown',e=>{
 const panel=document.querySelector('.c-filters.open');if(!panel||!matchMedia('(max-width: 700px)').matches)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeFilters();}
 if(e.key==='Tab'){const els=[...panel.querySelectorAll('button,input,select')].filter(x=>!x.disabled),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
},true);
document.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))e.target.setAttribute('aria-valuetext',Math.round(Number(e.target.value)*100)+' %');},true);
