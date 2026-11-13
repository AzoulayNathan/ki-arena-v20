import {asset} from '../v19/media.js';
import {contextToken} from '../arena/transactions.js';
let current=null;
const scenes={aurora_sanctuary:[1,7],waterfall_cache:[1,2],comet_trial:[6],crossroads_trade:[4,5],gear_offering:[0,2],weapon_barter:[0,5],gold_ransom:[2,3],sell_roster:[5,4],blood_pact:[4,7],fuse_relics:[0,2],rival_join:[6,4],debt_mark:[5,4],omen_path:[3,4],ambush_forced:[3],three_booths:[0,5,2],shadow_duel:[6,3],charity_tax:[5,4]};
function cell(el,n){el.style.setProperty('--v20-cell-x',n%4/3*100+'%');el.style.setProperty('--v20-cell-y',Math.floor(n/4)*100+'%');}
export function paintStates(root,event){if(!event?.units)return;for(const f of event.units){const card=root.querySelector('[data-unit="'+CSS.escape(f.uid)+'"]');if(!card)continue;let states=card.querySelector('.v20-unit-states');if(!states){states=document.createElement('span');states.className='v20-unit-states';card.append(states);}states.replaceChildren();for(const s of [...(f.statuses||[]),...(f.stunned?[{type:'stun',ticks:f.stunned}]:[])]){const names={dot:'Brûlure',weaken:'Affaibli',taunt:'Provocation',stun:'Interrompu'},b=document.createElement('span');b.className='v20-state '+s.type;b.textContent=({dot:'◈',weaken:'↘',taunt:'◎',stun:'ϟ'})[s.type]||'◇';if(s.ticks)b.textContent+=' '+s.ticks;b.title=(names[s.type]||s.type)+(s.ticks?' · '+s.ticks+' tour(s)':'');b.setAttribute('aria-label',b.title);states.append(b);}}}
export function polishV20(root,ctx){
 current=ctx;document.body.classList.add('v20-app');root.style.setProperty('--v20-atlas','url("'+asset('assets/v20/encounters.webp')+'")');root.style.setProperty('--v20-arena','url("'+asset('assets/v20/arena.webp')+'")');root.style.setProperty('--v20-archive','url("'+asset('assets/v20/archive.webp')+'")');root.style.setProperty('--v20-arcade','url("'+asset('assets/v20/arcade.webp')+'")');
 const title=root.querySelector('.a-modal-title:has(h2)');if(title?.textContent.includes('Médias & sauvegardes')){const settings=title.parentElement,tools=document.createElement('div');tools.className='v20-settings-tools';for(const el of [...settings.children]){if(el===title)break;tools.append(el);}if(tools.children.length)title.after(tools);}
 const badge=root.querySelector('.a-brand small');if(badge)badge.innerHTML='HORIZONS<br>ÉDITION / 20';
 document.body.dataset.v20World=ctx.run?.worlds?.[0]||ctx.worlds?.[0]||'DB';
 root.querySelectorAll('.a-event-scene').forEach((e,i)=>cell(e,(scenes[ctx.run?.activeEvent?.id]||[4,7,5])[i]??4));
 root.querySelectorAll('.a-reward').forEach((e,i)=>cell(e,ctx.run?.phase==='shop'?0:ctx.run?.phase==='rest'?1:i===0?2:7));
 const old=root.querySelector('.v20-run-label');old?.remove();
 if(ctx.page==='run'&&ctx.run?.rulesVersion==='20.0.0'&&ctx.run.phase==='prepare'){const label=document.createElement('p');label.className='v20-run-label';label.textContent='Deux à l’avant, trois en soutien. Prépare leur ordre dans le sac ; le combat reste automatique.';root.querySelector('.a-prebattle')?.before(label);}
 if(ctx.run?.rulesVersion==='20.0.0')root.querySelectorAll('.v193-member').forEach((el,i)=>{if(i>=5||!['map','prepare'].includes(ctx.run.phase))return;const name=el.querySelector('.v193-member-name');if(name){const tag=document.createElement('span');tag.className='v20-position';tag.textContent=i<2?'AVANT-GARDE':'SOUTIEN';name.before(tag);}const actions=document.createElement('div');actions.className='v20-order';for(const dir of [-1,1]){const b=document.createElement('button');b.textContent=dir<0?'←':'→';b.dataset.v20Move=i+':'+dir;b.dataset.token=contextToken(ctx.run);b.disabled=i+dir<0||i+dir>=Math.min(5,ctx.run.units.length);b.setAttribute('aria-label','Déplacer '+(dir<0?'à gauche':'à droite'));actions.append(b);}el.append(actions);});
 if(ctx.run?.phase==='combat')paintStates(root,ctx.run.combat.result.events[Math.max(0,ctx.run.combat.cursor-1)]);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v20-move]');if(!b||b.disabled||e.detail>1||!current?.run)return;const [i,d]=b.dataset.v20Move.split(':').map(Number);current.mutate(r=>{if(!['map','prepare'].includes(r.phase)||r.rulesVersion!=='20.0.0'||!r.units[i+d])return false;[r.units[i],r.units[i+d]]=[r.units[i+d],r.units[i]];return true;},b.dataset.token);});
/** Optional in-place inventory refresh hook for callers that already keep modal open. */
export function refreshInventoryModal(root,html,{scrollTop=0,scrollLefts=[]}={}){
  const modal=root?.querySelector?.('.a-modal.drawer')||document.querySelector('.a-modal.drawer');
  if(!modal||html==null)return false;
  modal.innerHTML=html;
  modal.scrollTop=scrollTop;
  scrollLefts.forEach(({selector,left,top})=>{const el=modal.querySelector(selector);if(el){if(left!=null)el.scrollLeft=left;if(top!=null)el.scrollTop=top;}});
  return true;
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-a="navmore"]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();const header=button.closest('.a-header'),open=!header.classList.contains('nav-open');header.classList.toggle('nav-open',open);button.setAttribute('aria-expanded',String(open));},true);
