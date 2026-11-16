import {objectArt} from '../arena/presentation.js';
import {asset,audioSettings,cardArtUrl,equipmentArtUrl} from '../arena/media.js';
import {registry} from '../arena/catalog.js';
import {runCatalog} from '../arena/engine.js';
import {scene,crest} from '../v15/theme.js';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function categorySprite(i,label){return `<div class="v17-category-object" role="img" aria-label="${safe(label)}" style="background-image:url('${asset('assets/v17/reward-objects.webp')}');background-position:${i%2*100}% ${Math.floor(i/2)*100}%"></div>`;}
let debug=false,latest=null,seen=new Set();
function sound(name){if(audioSettings.muted||!audioSettings.sfx)return;const a=new Audio(asset('assets/v17/'+name+'.wav'));a.volume=Math.min(1,audioSettings.sfx*.65);a.play().catch(()=>{});}
export function polishV17(root,{page,run}){
 latest=run;document.body.dataset.v17Draft=String(page==='run'&&run?.phase==='draft');
 if(page==='arcade'){
  const heading=root.querySelector('.a-page-heading h1');if(heading)heading.textContent='Trouve ton défi.';
  const intro=root.querySelector('.a-page-heading>p');intro?.remove();
  const banner=root.querySelector('.p-arcade-banner');if(banner){banner.querySelector('p')?.remove();banner.querySelector('h2').textContent='Vos rivalités.';banner.querySelector('.p-eyebrow').textContent='ENTRE AMIS';banner.querySelector('button')?.remove();banner.classList.add('v17-friends-banner');banner.dataset.a='party';banner.tabIndex=0;banner.setAttribute('role','button');root.querySelector('.a-main').append(banner);}
  const grid=root.querySelector('.a-arcade-grid');if(grid){for(const [name,ids] of [['Instinct & intuition',['duel','rank']],['Équipe & affrontements',['draft','auto5','tournament']]]){const section=document.createElement('section');section.className='v17-arcade-section';section.innerHTML='<h2>'+name+'</h2><div class="v17-arcade-row"></div>';const row=section.lastElementChild;for(const id of ids){const e=grid.querySelector('[data-id="'+id+'"]');if(e)row.append(e);}grid.before(section);}grid.remove();}
 }
 if(['run','bilan'].includes(page)&&run){
  const c=registry(run.worlds),world=run.worlds[0];
  if(run.phase==='reward'){
   const heading=root.querySelector('.a-encounter-copy>h1');if(heading)heading.textContent=run.pending?'Victoire.':'Une trouvaille.';
   root.querySelector('.a-encounter-copy>p')?.remove();
   root.querySelectorAll('[data-a="reward"]').forEach((el,i)=>{const rw=run.rewards[i];if(!rw)return;const item=rw.type==='item'?c.byItem.get(rw.id):null,hero=rw.type==='recruit'?c.byId.get(rw.id):null,pic=hero?cardArtUrl(hero,{seed:run.seed}):item?equipmentArtUrl(item):null,bg=scene(rw.type==='coins'?'treasure':rw.type==='heal'?'rest':rw.type==='recruit'?'combat':'shop',world);el.classList.add('v17-reward');el.style.setProperty('--reward-scene','url("'+asset(bg)+'")');const atlas=item?objectArt(item):null,gun=item&&/mitraill|fusil|pistolet|revolver|carabine/i.test(item.name);const visual=pic?`<img src="${safe(pic)}" alt="${safe(rw.title)}" onerror="this.hidden=true">`:rw.type==='coins'?categorySprite(1,'Illustration de catégorie : bourse de zénis'):rw.type==='heal'?categorySprite(3,'Illustration de catégorie : soin'):gun?categorySprite(0,'Illustration de catégorie : arme à feu'):item&&atlas!==null?`<div class="v17-loot-object" role="img" aria-label="Illustration adaptée de ${safe(item.name)}" style="background-image:url('${asset('assets/v11/objects-atlas.webp')}');background-position:${atlas%4/3*100}% ${Math.floor(atlas/4)*100}%"></div>`:item?.category==='armure'?categorySprite(2,'Illustration de catégorie : armure'):item?`<img src="${asset('assets/v9/item-'+item.effect+'.svg')}" alt="Pictogramme ${safe(item.name)}">`:`<i><img src="${asset('assets/v14/icons/'+({recruit:'recruit-mystery',training:'weapon',vigor:'armor',passive:'elite'}[rw.type]||'treasure')+'.svg')}" alt=""></i>`;el.innerHTML=`<div class="v17-reward-visual">${visual}</div><div class="v17-reward-caption"><h2>${safe(rw.title)}</h2><p>${safe(rw.type==='coins'?'+'+rw.amount+' zénis':rw.type==='heal'?'+35% de PV':rw.type==='recruit'?(run.units.length>=5?'Recruter en réserve':'Rejoindre l’équipe'):rw.type==='item'?item.category:rw.text)}</p></div>`;});
  }
  const last=run.history.at(-1),outcome=!run.voluntaryRetreat&&['reward','end','result'].includes(run.phase)&&last?.node===run.current?(last.win?'victory':'defeat'):null;
  root.dataset.v17Outcome=outcome||'';
  if(outcome){root.classList.add('v17-outcome',outcome);const key=run.runInstanceId+'|'+run.history.length+'|'+outcome;if(!seen.has(key)){seen.add(key);sound(outcome);const fx=document.createElement('div');fx.className='v17-outcome-flash '+outcome;fx.setAttribute('aria-hidden','true');root.append(fx);setTimeout(()=>fx.remove(),1600);}}
 }
 renderDebug();
}
function renderDebug(){document.querySelector('.v17-debug')?.remove();if(!debug)return;const r=latest;if(!r)return;const c=runCatalog(r),el=document.createElement('aside');el.className='v17-debug';el.setAttribute('aria-label','Diagnostic de run');const p=r.pending;el.innerHTML=`<b>Diagnostic · F8 pour fermer</b><p>N=${r.N} · ${safe(r.rulesVersion)} · seed ${safe(r.seed)}</p><p>${r.rulesVersion==='17.0.0'?'Draft : N/600 · armes 30% / alliés 70%':'Anciennes règles conservées · nouvelle aventure pour appliquer la correction'}</p>${r.offers.map(o=>`<div>${safe(o.band)} : ${o.revealed?(c.byId.has(o.id)?'rang '+c.byId.get(o.id).poolRank+'/'+r.N+' · '+c.byId.get(o.id).rarity:'arme · palier '+registry(r.worlds).byItem.get(o.id)?.tier):'Mystère caché'} ${o.revealed&&o.kind==='hero'&&o.bounds?'['+o.bounds.lo+'–'+o.bounds.hi+']':''}</div>`).join('')}<hr>${r.units.map(u=>{const h=c.byId.get(u.cardId);return '<div>'+safe(h.name)+' : rang '+h.poolRank+'/'+r.N+' · '+h.rarity+'</div>';}).join('')}${p?'<hr><p>B = round('+r.N+'/4 × ('+p.wave+' + '+({normal:0,elite:1,boss:2}[p.kind])+')) = '+p.budget+'</p><p>'+p.ranks.join(' + ')+' = '+p.ranks.reduce((a,b)=>a+b,0)+'</p>':''}`;document.body.append(el);}
document.addEventListener('keydown',e=>{
 if(e.key==='F8'){e.preventDefault();debug=!debug;renderDebug();return;}
 if(e.key==='Enter'&&e.target.matches('.v17-friends-banner')){e.preventDefault();e.stopImmediatePropagation();e.target.click();return;}
 if(document.body.dataset.screen!=='home'||e.target.closest('input,select,textarea'))return;
 const tile=e.target.closest('[data-mode-key]'),wheel=e.target.closest('[data-v15-swipe]');
 if((e.key==='Enter'||e.key===' ')&&tile&&e.target===tile){e.preventDefault();e.stopImmediatePropagation();tile.click();return;}
 if(e.key==='ArrowDown'&&wheel){e.preventDefault();e.stopImmediatePropagation();document.querySelector('.v17-solo')?.focus();return;}
 if(e.key==='Enter'&&wheel){e.preventDefault();e.stopImmediatePropagation();document.querySelector('.v17-solo')?.click();return;}
 if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)&&!wheel&&!e.target.closest('[data-v15-world],[data-v15-step]')){const list=[...document.querySelectorAll('[data-mode-key]')];if(!list.length)return;e.preventDefault();e.stopImmediatePropagation();const i=list.indexOf(tile),next=e.key==='ArrowUp'?null:list[(i+(e.key==='ArrowLeft'?-1:1)+list.length)%list.length];if(!next){document.querySelector('[data-v15-swipe]')?.focus();return;}next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-a="reward"]'))sound('reward');});
