import {contextPower,powerBounds} from './power.js';
import {registry} from '../v20/catalog.js';
import {asset} from '../v19/media.js';
import {replayIds} from './replays.js';
import {effectText} from './text.js';
let prior='';
export function polish22(root,ctx){document.body.classList.add('v22-app');const brand=root.querySelector('.a-brand small');if(brand)brand.innerHTML='MANGA ROGUE<br>ÉDITION / 23';
 for(const el of root.querySelectorAll('.a-details.v20-depart-more')){const input=el.querySelector('#a-seed');if(input){input.closest('label').remove();el.querySelector('summary').textContent='Importer une aventure';}}
 if(ctx.page==='setup'){const p=root.querySelector('.v20-setup-top');if(p&&!p.querySelector('p'))p.insertAdjacentHTML('beforeend','<p>Choisis tes mondes. Les rencontres et le butin seront tirés au hasard et sauvegardés au fil du voyage.</p>');}
 if(ctx.run?.contentVersion==='22.0.0'){
 if(['reward','shop','event'].includes(ctx.run.phase))root.querySelector('.v15-tension')?.remove();
 if(['reward','shop','event'].includes(ctx.run.phase)){const tools=root.querySelector('.a-header-tools');if(tools&&!tools.querySelector('[data-a="inventory"]'))tools.insertAdjacentHTML('afterbegin','<button class="a-button icon" data-a="inventory" aria-label="Sac" title="Équipe et inventaire"><img src="'+asset('assets/v14/icons/inventory.svg')+'" alt="" width="22" height="22"><span>Sac</span></button>');}
 const key=ctx.page+'|'+ctx.run.phase+'|'+ctx.run.current;if(key!==prior){prior=key;root.querySelector('.v22-loot,.v22-market,.v22-event')?.animate([{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:240,easing:'ease-out'});}
 const diag=root.querySelector('.v19-diagnostics');if(diag){const r=ctx.run,c=registry(r.worlds,r.statsMode),p=r.pending;diag.innerHTML='<header><b>Calculs V22 · F8</b><button data-v19="debug" aria-label="Fermer les calculs">×</button></header><p>N personnages = '+r.N+' · stats brutes · aléatoire crypto</p>'+r.offers.map(o=>'<p>'+o.kind+' / '+o.band+' : '+(o.disabled?'indisponible':(c.byId.get(o.id)||c.byItem.get(o.id)).name+' · rang '+o.globalRank+'/'+o.sourceSize+' · ['+o.bounds.lo+'–'+o.bounds.hi+'] · '+o.finish)+'</p>').join('')+(p?'<p>B = round(N/4 × (v+t) × 0,5625), puis prestige : '+p.budget+'</p><p>'+p.ranks.join(' + ')+' = '+p.ranks.reduce((a,b)=>a+b,0)+' · '+(p.ranks.reduce((a,b)=>a+b,0)===p.budget?'PASS':'FAIL')+'</p><p>v='+p.wave+' · '+p.kind+' · armes '+p.items.length+' / palier '+p.tier+'</p>':'')+'<p>Les éditions spéciales ajoutent 10 % aux stats de base du joueur. Les adversaires gardent les stats de leur rang.</p>';}
 const scene=root.querySelector('.a-encounter-scene');if(scene&&ctx.run.phase==='rest')scene.style.setProperty('--scene','url("'+asset('assets/v22/scenes/rest.webp')+'")');
 root.querySelectorAll('.a-route-card').forEach(el=>{const n=ctx.run.nodes.find(n=>n.id===el.dataset.id),key={shop:'market',treasure:'treasure',event:n?.eventRare?'observatory':'bargain',rest:'rest'}[el.dataset.kind];if(key)el.style.setProperty('--route-art','url("'+asset('assets/v22/scenes/'+key+'.webp')+'")');});
 }
 const ids=replayIds();if(ctx.page==='bilan'&&ctx.run?.endReason==='combat-loss'){const host=root.querySelector('.a-bilan-cta');if(host&&!host.querySelector('[data-a="death-replay"]'))host.insertAdjacentHTML('afterbegin','<button class="a-button primary" data-a="death-replay" data-id="'+ctx.run.runInstanceId+'">▶ Revoir le combat décisif</button>');}
 if(ctx.page==='pantheon'){root.querySelectorAll('[data-a="pantheon-fav"]').forEach(b=>{const id=b.dataset.id,host=b.parentElement;if(ids.includes(id)&&!host.querySelector('[data-a="death-replay"]')){const r=document.createElement('button');r.className='a-button light';r.dataset.a='death-replay';r.dataset.id=id;r.textContent='▶ Dernier combat';host.append(r);}});}
 // Update descriptions only in currently inspected V22 units; full engine hooks remain the authority.
 if(ctx.run?.contentVersion==='22.0.0'&&ctx.page==='run')root.querySelectorAll('.a-inspect-techs li').forEach(li=>{const type=li.dataset.effectType;if(type){const p=li.querySelector('span');if(p)p.textContent=effectText({type});}});
 root.querySelectorAll('.v22-drag').forEach(el=>el.setAttribute('data-context',[ctx.run?.runInstanceId,ctx.run?.revision,ctx.run?.phase,ctx.run?.step,ctx.run?.current||'',ctx.run?.activeEvent?.id||''].join('|')));
}
