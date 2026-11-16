import {contextToken} from '../arena/transactions.js';
import {hydrateCards21} from './cards.js';
import {asset} from '../v19/media.js';
let current=null;
export function polish21(root,ctx){
 current=ctx;document.body.classList.add('v21-app');document.body.dataset.v21Phase=ctx.page==='run'?ctx.run?.phase||'':ctx.page;
 const brand=root.querySelector('.a-brand small');if(brand)brand.innerHTML='MANGA ARCADE<br>ÉDITION / 21.1';
 const title=root.querySelector('.a-combat-heading h1');if(title&&ctx.run?.phase==='combat')title.textContent='Que le choc commence.';
 root.querySelectorAll('.v20-run-label').forEach(e=>e.remove());
 if(ctx.run?.phase==='prepare'&&['21.0.0','22.0.0'].includes(ctx.run.combatVersion)){
  root.querySelectorAll('.ally .a-side-label span').forEach(e=>e.textContent='Deux gardiens devant. Trois soutiens derrière.');
  root.querySelectorAll('.a-prebattle .ally .a-card').forEach((el,i)=>{if(el.querySelector('[data-v21-front]'))return;const b=document.createElement('button');b.type='button';b.className='v21-position-button';b.dataset.v21Front=el.dataset.unit;b.textContent=i<2?'Garde → Soutien':'Placer devant';b.setAttribute('aria-label',(i<2?'Passer en soutien : ':'Placer en avant-garde : ')+(ctx.run.units[i]?.cardId||''));el.append(b);});
 }
 if(ctx.run?.phase==='prepare'){const p=root.querySelector('.a-combat-heading p');if(p)p.textContent=['21.0.0','22.0.0'].includes(ctx.run.combatVersion)?'Équipe tes alliés et prépare ton avant-garde. Le combat se joue automatiquement.':'Équipe tes alliés. Les règles de cette sauvegarde sont conservées.';}
 const worlds=ctx.run?.worlds||ctx.mini?.worlds||[],world=worlds.length?worlds[(ctx.run?.act||0)%worlds.length]:'DB',key={DB:'db',HXH:'hxh',NARUTO:'naruto',ONEPIECE:'onepiece'}[world]||'db';
 root.style.setProperty('--v21-battle-art','url("'+asset('assets/v21/arenas/'+key+'.webp')+'")');
 root.querySelectorAll('.a-event-scene').forEach((e,i)=>e.style.setProperty('--choice-accent',e.classList.contains('risk')?'#c29aff':i%2?'#58d5e0':'#ffac54'));
 hydrateCards21(root);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v21-front]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!current?.run||current.run.phase!=='prepare'||!['21.0.0','22.0.0'].includes(current.run.combatVersion))return;current.mutate(r=>{const i=r.units.findIndex(u=>u.uid===b.dataset.v21Front);if(i<0||i>4)return false;const [u]=r.units.splice(i,1);r.units.splice(i<2?Math.min(4,r.units.length):0,0,u);return true;},contextToken(current.run));},true);

