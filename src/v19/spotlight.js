import {cardMarkup,hydrateCardFaces} from './polish.js';
import {effectDescription} from './catalog.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function clearSpotlight(root){(root||document).querySelectorAll?.('.a-spotlight')?.forEach?.(e=>e.remove());document.querySelectorAll('.a-spotlight.v20-pick-full').forEach(e=>e.remove());}
export function showSpotlight(root,{card,kind='skill',label='',ally=true,reduced=false,seed='ARENA',fullscreen=false}={}){
  if(!card)return;
  const isGear=!!(card.category&&!card.form);
  const model=isGear?{...card,effects:card.effects?.length?card.effects:[{name:effectDescription(card),type:card.effect}]}:card;
  const host=fullscreen?document.body:(root||document.body);
  clearSpotlight(root);if(fullscreen)document.querySelectorAll('.a-spotlight.v20-pick-full').forEach(e=>e.remove());
  const el=document.createElement('div');
  el.className='a-spotlight v193-spotlight '+kind+(reduced?' reduced':'')+(fullscreen?' v20-pick-full':'');
  el.setAttribute('aria-hidden','true');
  const kicker=kind==='ko'?'FIN DU COMBAT POUR':(fullscreen?(isGear?'ÉQUIPEMENT OBTENU':'ALLIÉ RECRUTÉ'):'TECHNIQUE');
  el.innerHTML='<div class="v193-cutin '+(ally?'ally':'rival')+(fullscreen?' v20-pick-cutin':'')+'"><div class="v193-cutin-card'+(fullscreen?' v20-pick-card':'')+'">'+cardMarkup(model,{seed,equipment:isGear})+'</div><div class="v193-cutin-copy"><small>'+kicker+'</small><b>'+E(card.name)+'</b><span>'+E(label)+'</span></div>'+(kind==='ko'?'<strong class="v193-ko-stamp">K.O.</strong>':'')+'</div>';
  host.append(el);hydrateCardFaces(el);return el;
}
