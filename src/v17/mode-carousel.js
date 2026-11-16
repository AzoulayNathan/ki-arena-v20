import {asset} from '../arena/media.js';
import {horizon,arena,scene} from '../v15/theme.js';
export const MODES=Object.freeze([
 ['solo','SOLO · EXPÉDITION','Une route. Ta légende.','Six choix pour partir. Dix étapes avant le gardien.','setup','','recruit'],
 ['auction','ENTRE AMIS · ENCHÈRES','Draft Challenge','La bonne offre. Le bon rival. À vous de jouer.','party','auction','hall'],
 ['arcade','ARCADE · PARTIES COURTES','Encore une partie.','Instinct, mémoire et décisions en une seconde.','arcade','','hall'],
 ['cup','ENTRE AMIS · TOURNOI','Un seul titre.','Deux à quatre joueurs. Que la meilleure équipe gagne.','party','cup','gates'],
 ['duel','SOLO · INSTINCT','Power Duel','Qui domine son monde ? Écoute ton instinct.','mini','duel','arena'],
 ['rank','SOLO · PARI','Blind Rank','Classe sans connaître la prochaine révélation.','mini','rank','event'],
 ['draft','SOLO · STRATÉGIE','Draft Budget','Cinq places. Un budget. À toi de trancher.','mini','draft','recruit'],
 ['tournament','SOLO · COMPÉTITION','Arena Cup','Une équipe pour traverser trois affrontements.','mini','tournament','gates'],
 ['auto5','SOLO · COMBAT LIBRE','Auto 5','Tes cinq favoris. Un rival à leur mesure.','mini','auto5','arena'],
 ['pairs','ARCADE · MÉMOIRE','Les paires du destin','Retrouve les visages avant qu’ils ne t’échappent.','extra','pairs','recruit'],
 ['intruder','ARCADE · OBSERVATION','Un visage de trop','Une équipe connue. Un intrus à démasquer.','extra','intruder','event'],
 ['relay','ARCADE · MÉMOIRE','Le relais des signes','Observe, retiens, puis retrouve la séquence.','extra','relay','hall'],
 ['keep','ENTRE AMIS · AUDACE','Garder ou tenter','Ton allié idéal est-il le prochain ?','party','keep','event'],
 ['preferences','ENTRE AMIS · DILEMMES','Le duel des goûts','Vos favoris. Vos désaccords. Vos révélations.','party','preferences','recruit'],
 ['collection','COLLECTION · QUATRE MONDES','Tous les destins.','Explore les combattants. Retrouve tes favoris.','collection','','horizon'],
 ['pantheon','PANTHÉON · SOUVENIRS','Vos légendes restent.','Les équipes qui ont marqué ton aventure.','pantheon','','gates'],
]);
export function recruitment(world){return 'assets/v16/'+({DB:'db',HXH:'hxh',NARUTO:'naruto',ONEPIECE:'onepiece'}[world]||'db')+'-recruit.webp';}
export function modeArt(role,world){return role==='recruit'?recruitment(world):role==='hall'?'assets/v16/arcade-hall.webp':role==='gates'?'assets/v16/tournament-gates.webp':role==='arena'?arena(world):role==='horizon'?horizon(world):scene(role,world);}
function tile(mode,world,saves,fixed=false){const[key,sub,title,line,action,id,art]=mode,resume=fixed&&saves[world],attrs=resume?`data-a="resume" data-worlds="${saves[world].join(',')}"`:action==='extra'?`data-v15-game="open" data-id="${id}"`:`data-a="${action}" ${action==='party'?`data-party-mode="${id}"`:`data-id="${id}"`}`;return `<article role="button" tabindex="0" class="v16-mode ${key} ${fixed?'v17-solo':''}" data-mode-key="${key}" data-mode-art="${art}" ${attrs} data-world="${world}" style="--mode-art:url('${asset(modeArt(art,world))}')"><span>${sub}</span><h3>${fixed?'Ton expédition.':title}</h3><p>${fixed?(resume?'Reprendre la route':'Composer ton équipe'):line}</p>${resume?`<button class="v17-new-run" data-a="setup" data-world="${world}">Nouvelle aventure ↗</button>`:''}</article>`;}
let saveLookup={};
export function modesMarkup(world,saves){saveLookup=saves;return `<section class="v16-play v17-play" aria-label="Choisir un jeu"><header><h2>À toi de jouer.</h2><div class="v16-carousel-controls"><button data-v16-move="-1" aria-label="Jeux précédents">←</button><button data-v16-pause aria-pressed="false" aria-label="Mettre le défilement en pause">Ⅱ</button><button data-v16-move="1" aria-label="Jeux suivants">→</button></div></header><div class="v17-game-shelf">${tile(MODES[0],world,saves,true)}<div class="v16-mode-track" role="region" aria-label="Autres jeux, glisser pour explorer">${MODES.slice(1).map(m=>tile(m,world,saves)).join('')}</div></div></section>`;}
export function paintModes(world){const solo=document.querySelector('.v17-solo');if(solo){const saved=saveLookup[world];solo.dataset.a=saved?'resume':'setup';if(saved)solo.dataset.worlds=saved.join(',');else delete solo.dataset.worlds;solo.querySelector('p').textContent=saved?'Reprendre la route':'Composer ton équipe';solo.querySelector('.v17-new-run')?.remove();if(saved){const b=document.createElement('button');b.className='v17-new-run';b.dataset.a='setup';b.dataset.world=world;b.textContent='Nouvelle aventure ↗';solo.append(b);}}document.querySelectorAll('.v16-mode').forEach(e=>{e.style.setProperty('--mode-art','url("'+asset(modeArt(e.dataset.modeArt,world))+'")');e.dataset.world=world;e.querySelectorAll('[data-world]').forEach(b=>b.dataset.world=world);});}
let cleanup=()=>{};
export function mountModes(root){
 cleanup();const track=root.querySelector('.v16-mode-track'),zone=root.querySelector('.v16-play');if(!track)return;
 const media=matchMedia('(prefers-reduced-motion: reduce)'),pause=zone.querySelector('[data-v16-pause]');let manual=false,hover=false,drag=false,last=0,pos=track.scrollLeft,raf=0,until=0;
 const step=()=>track.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||0);
 const update=()=>{pause.setAttribute('aria-pressed',String(manual));pause.setAttribute('aria-label',manual?'Reprendre le défilement':'Mettre le défilement en pause');pause.textContent=manual?'▶':'Ⅱ';};
 const tick=t=>{const dt=Math.min(40,t-(last||t));last=t;const stopped=manual||hover||drag||media.matches||document.hidden||track.contains(document.activeElement)||t<until;track.dataset.running=String(!stopped);if(!stopped){pos+=dt*.018;const n=step();if(pos>=n){track.append(track.firstElementChild);pos-=n;}track.scrollLeft=pos;}else pos=track.scrollLeft;raf=requestAnimationFrame(tick);};
 const enter=()=>hover=true,leave=()=>hover=false,down=()=>{drag=true;},up=()=>{drag=false;until=performance.now()+900;},click=e=>{const control=e.target.closest('[data-v16-move],[data-v16-pause]');if(!control)return;if(control.hasAttribute('data-v16-pause')){manual=!manual;update();return;}const n=step(),dir=Number(control.dataset.v16Move);until=performance.now()+2500;if(dir<0){track.prepend(track.lastElementChild);pos=track.scrollLeft+n;track.scrollLeft=pos;}track.scrollTo({left:dir<0?Math.max(0,pos-n):track.scrollLeft+n,behavior:media.matches?'instant':'smooth'});};
 zone.addEventListener('pointerenter',enter);zone.addEventListener('pointerleave',leave);track.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);zone.addEventListener('click',click);update();raf=requestAnimationFrame(tick);
 cleanup=()=>{cancelAnimationFrame(raf);zone.removeEventListener('pointerenter',enter);zone.removeEventListener('pointerleave',leave);track.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);zone.removeEventListener('click',click);};
}
