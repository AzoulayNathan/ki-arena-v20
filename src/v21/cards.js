import {equipmentIcon} from '../v22/equipment-art.js';
import {reviewedArt} from './reviewed-art.js';
import {plainFinish,dropFinish} from './finish.js';
import {rawPortraitUrl,equipmentArtUrl,asset,cardArtFallbackChain,hasLocalAsset} from '../v19/media.js';
import {normalizeEdition,RARITY_NAMES} from '../v19/card-spec.js';
import {combatEffects} from './effects.js';
import {registry,WORLDS} from '../v19/catalog.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const glyph=t=>/heal|regen|life/.test(t)?'＋':/shield|guard|intercept/.test(t)?'⬡':/stun|weaken/.test(t)?'ϟ':/counter/.test(t)?'↶':/focus|critical/.test(t)?'◎':'✦';
function heroArtUrl(h,seed='ARENA'){
 const reviewed=reviewedArt(h);if(reviewed?.path&&hasLocalAsset(reviewed.path))return asset(reviewed.path);
 const candidate=rawPortraitUrl(h,{seed});
 if(candidate&&!/assets\/(?:cards(?:[-/])|stylized\/)/.test(candidate))return candidate;
 const chain=cardArtFallbackChain(h,{seed,raw:true});
 const preferred=chain.find(u=>u&&!/assets\/(?:cards(?:[-/])|stylized\/)/.test(u));
 return preferred||candidate||chain[0]||'';
}
export function cardMarkup21(h,{seed='ARENA',skin,edition,equipment=false,legacyEffects=true,statsResolved=false}={}){
 const explicit=skin||h._collectionSkin||edition,finish=normalizeEdition(explicit)==='special'?'gold':['black','white'].includes(explicit)?explicit:explicit==='normal'?plainFinish(seed,h.id):dropFinish(seed,h.id),special=finish==='gold',rarity=h.rarity||'common',level=1+['common','uncommon','rare','epic','legendary'].indexOf(rarity);
 const art=equipment?(equipmentArtUrl(h)||asset(equipmentIcon(h))):heroArtUrl(h,seed);
 const effects=equipment||legacyEffects?(h.effects||[]):combatEffects(h),signature=effects[0];
 const specialMul=special&&!equipment&&!statsResolved&&!h.specialApplied&&(skin==='gold'||h._collectionSkin==='gold')?1.1:1;
 const atk=equipment?(h.atk?'+'+h.atk+'%':'—'):Math.round((h.attack||0)*specialMul),hp=equipment?(h.shield?'+'+h.shield+'%':'—'):Math.round((h.currentHp??h.maxHp??0)*specialMul),vit=equipment?h.category:Math.round((h.speed||0)*specialMul);
 return '<span class="v19-face v21-face finish-'+finish+' rarity-'+E(rarity)+(equipment?' v21-equipment':'')+'" data-card-id="'+E(h.id)+'" data-v19-seed="'+E(seed)+'" data-finish="'+finish+'" data-edition="'+(special?'special':'normal')+'" data-rarity="'+E(rarity)+'" data-fx="'+(level+(special?1:0))+'" data-equipment="'+(equipment?1:0)+'" role="img" aria-label="'+E(h.name)+' · '+(RARITY_NAMES[rarity]||'Objet')+' · '+(finish==='white'?'blanche':special?'dorée':'noire')+'"><span class="v21-card-art">'+(art?'<img src="'+E(art)+'" loading="lazy" decoding="async" alt="'+E(h.name)+'" onerror="this.hidden=true;this.parentElement.classList.add(\'missing\')">':'')+'<span class="v21-art-placeholder">'+E(h.name.split(/\s+/).map(x=>x[0]).slice(0,2).join(''))+'</span>'+'</span><span class="v21-card-top"><b>KI ARENA</b><span>'+(RARITY_NAMES[rarity]||'OBJET')+'</span></span><span class="v21-rarity-fx" aria-hidden="true"></span>'+'<span class="v21-card-copy"><strong>'+E(h.name)+'</strong><span class="v21-card-form">'+E(equipment?h.category:h.form||h.universe)+'</span>'+(signature?'<span class="v21-signature" title="'+E(signature.description||signature.name)+'">'+glyph(signature.type)+' '+E(signature.name)+'</span>':'')+'<span class="v21-card-stats"><b class="v21-atk" title="Attaque"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m19 2 3 1-1 5-10 10-3-3L19 2ZM6 13l5 5-2 2-2-2-4 4-2-2 4-4-2-2 3-1Z"/></svg></i>'+atk+'</b><small class="v21-speed" title="Vitesse">'+(equipment?E(vit):'ϟ '+vit)+'</small><b class="v21-hp" title="Points de vie"><i>♥</i>'+hp+'</b></span></span><span class="v21-reflection" aria-hidden="true"></span></span>';
}
let installed=false;
export function hydrateCards21(root=document){
 root.querySelectorAll('.v21-face').forEach(el=>{
  el.dataset.ready='true';
  if(el.dataset.equipment==='1')return;
  const art=el.querySelector('.v21-card-art');if(!art)return;
  const img=art.querySelector('img');if(img&&!img.hidden&&!art.classList.contains('missing'))return;
  let h;try{h=registry(WORLDS).byId.get(el.dataset.cardId);}catch{}
  if(!h)return;
  const url=heroArtUrl(h,el.dataset.v19Seed||'ARENA');if(!url){art.classList.add('missing');return;}
  const next=img||Object.assign(document.createElement('img'),{alt:h.name,loading:'lazy',decoding:'async'});
  next.hidden=false;next.src=url;
  next.onerror=()=>{next.hidden=true;art.classList.add('missing');};
  if(!img)art.prepend(next);
  art.classList.remove('missing');
 });
 if(installed)return;installed=true;let frame=0,pending=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced())return;const card=e.target.closest('.v21-face');if(!card||card.closest('.a-battlefield,.v14-thumb'))return;const b=card.getBoundingClientRect();pending={card,x:(e.clientX-b.left)/b.width*2-1,y:(e.clientY-b.top)/b.height*2-1};if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(!pending)return;const {card,x,y}=pending;card.style.setProperty('--rx',-y*5+'deg');card.style.setProperty('--ry',x*8+'deg');card.style.setProperty('--shine-x',(x+1)*50+'%');card.style.setProperty('--shine-y',(y+1)*50+'%');});},{passive:true});
 document.addEventListener('pointerout',e=>{const card=e.target.closest?.('.v21-face');if(card&&!card.contains(e.relatedTarget)){card.style.removeProperty('--rx');card.style.removeProperty('--ry');if(pending?.card===card)pending=null;}},{passive:true});
}


let touchCard=null;
if(typeof document!=='undefined'){
 document.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const card=e.target.closest('.v21-face');if(!card||card.closest('.a-card,.a-battlefield'))return;touchCard={card,x:e.clientX,y:e.clientY,dx:0,dy:0};},{passive:true});
 document.addEventListener('pointermove',e=>{if(!touchCard||e.pointerType!=='touch')return;const s=touchCard;s.dx=e.clientX-s.x;s.dy=e.clientY-s.y;s.card.style.setProperty('--ry',Math.max(-8,Math.min(8,s.dx/7))+'deg');s.card.style.setProperty('--rx',Math.max(-5,Math.min(5,-s.dy/9))+'deg');},{passive:true});
 const release=()=>{if(!touchCard)return;const s=touchCard;touchCard=null;s.card.style.removeProperty('--rx');s.card.style.removeProperty('--ry');if(Math.abs(s.dx)>20||Math.abs(s.dy)>20){const b=s.card.closest('button');if(b){b.dataset.v19Dragged='1';setTimeout(()=>delete b.dataset.v19Dragged,80);}}};
 document.addEventListener('pointerup',release,{passive:true});document.addEventListener('pointercancel',release,{passive:true});
}
