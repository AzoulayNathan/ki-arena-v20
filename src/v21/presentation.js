import {hydrateCards21} from './cards.js';
import {asset} from '../v19/media.js';
let current=null;
export function polish21(root,ctx){
 current=ctx;document.body.classList.add('v21-app');document.body.dataset.v21Phase=ctx.page==='run'?ctx.run?.phase||'':ctx.page;
 const brand=root.querySelector('.a-brand small');if(brand)brand.innerHTML='MANGA ARCADE<br>ÉDITION / 21.1';
 const title=root.querySelector('.a-combat-heading h1');if(title&&ctx.run?.phase==='combat')title.textContent='Que le choc commence.';
 root.querySelectorAll('.v20-run-label').forEach(e=>e.remove());
 // Plus de formation avant/arrière : l’emplacement n’affecte pas le combat.
 root.querySelectorAll('.v21-position-button,[data-v21-front]').forEach(e=>e.remove());
 if(ctx.run?.phase==='prepare'){
  root.querySelectorAll('.ally .a-side-label span').forEach(e=>e.textContent='Équipe tes alliés avant le combat.');
  const p=root.querySelector('.a-combat-heading p');
  if(p)p.textContent=['21.0.0','22.0.0'].includes(ctx.run.combatVersion)?'Équipe tes alliés. Le combat se joue automatiquement.':'Équipe tes alliés. Les règles de cette sauvegarde sont conservées.';
 }
 const worlds=ctx.run?.worlds||ctx.mini?.worlds||[],world=worlds.length?worlds[(ctx.run?.act||0)%worlds.length]:'DB',key={DB:'db',HXH:'hxh',NARUTO:'naruto',ONEPIECE:'onepiece'}[world]||'db';
 root.style.setProperty('--v21-battle-art','url("'+asset('assets/v21/arenas/'+key+'.webp')+'")');
 root.querySelectorAll('.a-event-scene').forEach((e,i)=>e.style.setProperty('--choice-accent',e.classList.contains('risk')?'#c29aff':i%2?'#58d5e0':'#ffac54'));
 hydrateCards21(root);
}
