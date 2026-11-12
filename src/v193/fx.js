import {timing} from './profiles.js';
import {cosmeticHash} from '../v19/card-spec.js';
import {audioSettings} from '../v19/media.js';
let active=new Set(),animations=new Set(),audio=null,voices=new Set();
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=t=>1-Math.pow(1-clamp(t),3),pulse=t=>Math.sin(clamp(t)*Math.PI);
function motion(el,frames,opts){if(!el)return;const a=el.animate(frames,opts);animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a;}
function sound(p,total,reduced){if(audioSettings.muted||!audioSettings.sfx)return;try{
 audio??=new(globalThis.AudioContext||globalThis.webkitAudioContext)();audio.resume().catch(()=>{});
 const t=audio.currentTime,impact=reduced?0:total*p.impact/1000,soft=p.family==='support'||p.family==='control',bus=audio.createGain();bus.gain.value=Math.min(.065,audioSettings.sfx*.23);bus.connect(audio.destination);
 const osc=audio.createOscillator(),gain=audio.createGain(),start=t+(soft?.02:impact);osc.type=soft?'sine':p.family==='energy'?'sine':'triangle';osc.frequency.setValueAtTime(soft?420:p.variant==='shatter'?80:145,start);osc.frequency.exponentialRampToValueAtTime(soft?740:35,start+.2);gain.gain.setValueAtTime(soft?.18:.5,start);gain.gain.exponentialRampToValueAtTime(.001,start+.24);osc.connect(gain).connect(bus);osc.start(start);osc.stop(start+.25);
 const len=Math.floor(audio.sampleRate*.18),buffer=audio.createBuffer(1,len,audio.sampleRate),data=buffer.getChannelData(0);let n=113;for(let i=0;i<len;i++){n=n*16807%2147483647;data[i]=(n/1073741824-1)*Math.pow(1-i/len,2);}
 const src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();f.type='bandpass';f.frequency.value=p.family==='weapon'?2300:p.family==='energy'?1000:360;f.Q.value=.7;g.gain.value=soft?.1:.7;src.buffer=buffer;src.connect(f).connect(g).connect(bus);src.start(start+.015);const handle={osc,src,bus};voices.add(handle);src.onended=()=>{setTimeout(()=>{bus.disconnect();voices.delete(handle);},100);};
 }catch{}}
export function stopEffects(){for(const fx of active){cancelAnimationFrame(fx.frame);fx.el.remove();fx.resolve();}active.clear();for(const a of animations)a.cancel();animations.clear();for(const v of voices){try{v.osc.stop();v.src.stop();v.bus.disconnect();}catch{}}voices.clear();document.querySelectorAll('.v193-actor,.v193-target').forEach(e=>e.classList.remove('v193-actor','v193-target'));}
export function playEffect(root,event,ctx={},speed=1,reduced=false){if(!root||!event)return Promise.resolve();const {profile:p,total}=timing(event,ctx,speed,reduced);if(p.family==='none')return Promise.resolve();
 const rect=root.getBoundingClientRect(),W=rect.width,H=rect.height,select=id=>root.querySelector('[data-unit="'+CSS.escape(id||'')+'"]'),actor=select(event.actor),rawTarget=select(event.target),support=['heal','revive','shield','guard','buff','ultimate','phase','skill','dodge','status','skip','stunned'].includes(event.type),target=event.type==='dodge'?actor:rawTarget||actor,point=el=>{const b=el?.getBoundingClientRect();return b?{x:b.left-rect.left+b.width/2,y:b.top-rect.top+b.height*.46}:null;},A=point(actor)||{x:W*.3,y:H*.5},B=point(target)||{x:W*.7,y:H*.5};
 const holder=document.createElement('div');holder.className='v193-effect';holder.dataset.family=p.family;holder.dataset.variant=p.variant;holder.style.setProperty('--fx',p.color);holder.setAttribute('aria-hidden','true');root.append(holder);
 const delta=event.type==='dot'?Math.max(0,(ctx.previous?.units?.find(u=>u.uid===event.target||u.uid===event.actor)?.hp||0)-(event.units.find(u=>u.uid===event.target||u.uid===event.actor)?.hp||0)):event.type==='heal'?Math.max(0,event.units.find(u=>u.uid===event.target)?.hp-(ctx.previous?.units?.find(u=>u.uid===event.target)?.hp||0)):event.damage;
 const number=document.createElement('span');number.className='v193-number '+(event.type==='heal'?'healing':'');number.textContent=event.type==='heal'?'+'+delta:delta>0&&event.type!=='heal'?'−'+delta:['shield','guard'].includes(event.type)?'PROTÉGÉ':event.type==='dodge'?'ESQUIVE':['status','skip','stunned','revive'].includes(event.type)?p.label.toUpperCase():'';number.style.left=B.x+'px';number.style.top=B.y+'px';holder.append(number);if(event.absorbed>0){const blocked=document.createElement('small');blocked.textContent='⬡ '+Math.round(event.absorbed)+' absorbés';number.append(blocked);}number.style.animationDuration=total*.6+'ms';number.style.animationDelay=reduced?'0ms':total*p.impact+'ms';
 const actorName=event.units.find(u=>u.uid===event.actor)?.name||'',targetName=event.units.find(u=>u.uid===event.target)?.name||'';root.dataset.fxFamily=p.family;root.dataset.fxVariant=p.variant;const cue=root.querySelector('.v193-action-cue');if(cue){cue.innerHTML='';const who=document.createElement('b'),what=document.createElement('span');who.textContent=event.type==='ko'?targetName:actorName;what.textContent=event.type==='ko'?'K.O.':ctx.displayLabel||ctx.technique||p.label;cue.append(who,what);}
 sound(p,total,reduced);actor?.classList.add('v193-actor');target?.classList.add('v193-target');
 if(!reduced){
 const dir=B.x>A.x?1:-1,close=['melee','weapon'].includes(p.family),travel=close?Math.min(Math.abs(B.x-A.x)*.3,W*.15):0;
 if(actor&&event.type!=='ko')motion(actor,[{transform:'translate(0,0) scale(1)'},{transform:`translate(${-dir*9}px,2px) scale(.97)`,offset:.2},{transform:`translate(${dir*travel}px,-10px) scale(1.10)`,offset:.44},{transform:'translate(0,0) scale(1)',offset:.88}],{duration:total,easing:'cubic-bezier(.2,.7,.3,1)'});
 if(target&&!support)motion(target,[{translate:'0 0',filter:'brightness(1)'},{translate:'0 0',filter:'brightness(1)',offset:.46},{translate:`${dir*12}px 0`,filter:'brightness(1.55)',offset:.52},{translate:`${-dir*3}px 0`,filter:'brightness(1)',offset:.65},{translate:'0 0',filter:'brightness(1)'}],{duration:total});
 if(target&&p.variant==='evade')motion(target,[{translate:'0 0',opacity:1},{translate:`${-dir*30}px -5px`,opacity:.25,offset:.4},{translate:'0 0',opacity:1}],{duration:total});
 if(event.type==='ko')motion(root,[{translate:'0 0'},{translate:'0 0',offset:.35},{translate:'3px -1px',offset:.43},{translate:'-2px 1px',offset:.5},{translate:'0 0',offset:.65}],{duration:total*.7});
 }
 return new Promise(resolve=>{const fx={el:holder,resolve,frame:0};active.add(fx);let born=performance.now();const canvas=document.createElement('canvas');canvas.className='v193-fx-canvas';holder.append(canvas);const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=W*dpr;canvas.height=H*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const seed=cosmeticHash([event.actor,event.type,event.round,event.damage,ctx.technique].join('|')),random=i=>{const x=Math.sin(seed*.00001+i*83.17)*45824.137;return x-Math.floor(x);};
 function path(points,width,color,alpha=1){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
 function circle(x,y,r,color,alpha=1,width=2){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,Math.max(1,r),0,Math.PI*2);c.stroke();}
 function glow(x,y,r,alpha){c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff6e2');g.addColorStop(.2,p.color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 function slash(x,y,angle,k,alpha){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.fillStyle=p.color;c.beginPath();c.moveTo(-90*k,20);c.quadraticCurveTo(0,-38,90*k,-24);c.quadraticCurveTo(8,-8,-90*k,20);c.fill();c.fillStyle='#fff8e1';c.beginPath();c.moveTo(-80*k,20);c.quadraticCurveTo(0,-15,85*k,-25);c.quadraticCurveTo(0,-4,-80*k,20);c.fill();c.restore();}
 function ringHex(x,y,r,a){const ps=Array.from({length:7},(_,i)=>[x+Math.cos(i*Math.PI/3-Math.PI/2)*r,y+Math.sin(i*Math.PI/3-Math.PI/2)*r*1.12]);path(ps,3,p.color,a);}
 function particles(t){const u=clamp((t-.44)/.56),a=(1-u)*Math.min(1,u*10);for(let i=0;i<(p.family==='energy'?62:38);i++){const angle=random(i)*Math.PI*2,l=(18+random(i+40)*140)*ease(u),x=B.x+Math.cos(angle)*l,y=B.y+Math.sin(angle)*l*.7;path([[x,y],[x+Math.cos(angle)*(4+random(i+80)*14)*(1-u),y+Math.sin(angle)*8]],1+random(i+20)*2,i%4?p.secondary:p.color,a);}}
 function frame(now){if(!holder.isConnected){active.delete(fx);resolve();return;}const t=clamp((now-born)/total);c.clearRect(0,0,W,H);if(!reduced){
 const charge=clamp(t/.38),flight=clamp((t-.28)/.21),after=clamp((t-.48)/.52),fade=1-after,energy=p.family==='energy';
 // Short focusing vignette, never a full white screen.
 if(energy||['heavy','awaken','shatter'].includes(p.variant)){c.globalCompositeOperation='source-over';c.globalAlpha=pulse(t)*.28;c.fillStyle='#041524';c.fillRect(0,0,W,H);}
 c.globalCompositeOperation='lighter';c.shadowColor=p.color;c.shadowBlur=10;
 if(energy){glow(A.x,A.y,12+charge*40,(t<.46?1:fade)*.7);for(let j=0;j<3;j++)circle(A.x,A.y,(1-charge)*70+12+j*8,p.color,(t<.42?1-charge*.5:0)*.7);
 const dx=B.x-A.x,dy=B.y-A.y,x=A.x+dx*flight,y=A.y+dy*flight;
 if(p.variant==='beam'){
  if(t>.28){const power=Math.sin(clamp((t-.28)/.65)*Math.PI),nx=-dy/Math.max(1,Math.hypot(dx,dy)),ny=dx/Math.max(1,Math.hypot(dx,dy));c.globalAlpha=power*.8;c.fillStyle=p.color;c.beginPath();c.moveTo(A.x+nx*7,A.y+ny*7);c.lineTo(x+nx*23*power,y+ny*23*power);c.lineTo(x-nx*23*power,y-ny*23*power);c.lineTo(A.x-nx*7,A.y-ny*7);c.closePath();c.fill();path([[A.x,A.y],[x,y]],8*power,'#fff9e9',power);for(let j=0;j<3;j++)path([[A.x,A.y+(j-1)*8],[x,y+(j-1)*17]],1,p.secondary,power*.7);}}
 else if(p.variant==='lightning'){if(t>.27&&t<.85){for(let branch=0;branch<3;branch++){const ps=Array.from({length:17},(_,i)=>{const q=i/16;return[A.x+dx*flight*q,A.y+dy*flight*q+(i&&i<16?(random(i+branch*15+Math.floor(t*12))-.5)*55:0)];});path(ps,branch?2:7,branch?'#fff8ec':p.color,fade);}}}
 else if(p.variant==='orb'){if(t>.24){glow(x,y,35,fade);circle(x,y,20,p.secondary,fade,3);for(let j=0;j<3;j++){c.globalAlpha=fade;c.strokeStyle=p.color;c.lineWidth=2;c.beginPath();c.ellipse(x,y,28,10,t*12+j,0,Math.PI*2);c.stroke();}path([[x-dx*.1,y-dy*.1],[x,y]],9,p.color,fade*.6);}}
 else if(p.variant==='nova'){for(let j=0;j<3;j++){const q=clamp((t-.32-j*.04)/.6);circle(B.x,B.y,12+ease(q)*(120+j*25),p.color,pulse(q)*.7,4-j);}}
 }
 if(p.family==='weapon'){
 if(p.variant==='volley'){for(let j=0;j<4;j++){const q=clamp((t-.18-j*.05)/.32),x=A.x+(B.x-A.x)*q,y=A.y+(B.y-A.y)*q+(j-1.5)*9;path([[x-(B.x-A.x)*.09,y],[x,y]],3,p.secondary,pulse(q));}}
 else{const n=p.variant==='crosscut'?3:2;for(let j=0;j<n;j++){const q=clamp((t-.24-j*.07)/.4);slash(B.x,B.y,(j%2?-.8:.6),ease(q),pulse(q));}}}
 if(p.family==='melee'){
 const n=p.variant==='combo'?5:1;for(let j=0;j<n;j++){const q=clamp((t-.25-j*.065)/.4),x=B.x+(n>1?(random(j)-.5)*70:0),y=B.y+(n>1?(random(j+10)-.5)*80:0);if(q>0&&q<1){circle(x,y,8+ease(q)*45,p.color,pulse(q),p.variant==='heavy'?6:3);for(let k=0;k<7;k++){const a=k*Math.PI*2/7+.2;path([[x+Math.cos(a)*12,y+Math.sin(a)*12],[x+Math.cos(a)*(30+q*25),y+Math.sin(a)*(30+q*25)]],k%2?3:5,p.secondary,pulse(q));}}}
 if(t>.2&&t<.6){for(let j=0;j<8;j++){const y=A.y+(j-3.5)*14;path([[A.x+(B.x-A.x)*.12,y],[A.x+(B.x-A.x)*(.2+flight*.45),y+(B.y-A.y)*flight*.4]],1,p.color,pulse(t)*.3);}}}
 if(p.family==='support'){
 if(['barrier','intercept'].includes(p.variant)){ringHex(B.x,B.y,45+ease(t)*18,pulse(t));for(let j=0;j<6;j++){const a=j*Math.PI/3;ringHex(B.x+Math.cos(a)*24,B.y+Math.sin(a)*24,16,pulse(t)*.25);}}
 else if(['heal','revive','drain'].includes(p.variant)){for(let j=0;j<12;j++){const q=(t+random(j))%1,x=B.x+(random(j+20)-.5)*85,y=B.y+60-q*120,alpha=Math.sin(q*Math.PI)*pulse(t);path([[x-4,y],[x+4,y]],2,'#b7efd0',alpha);path([[x,y-4],[x,y+4]],2,'#b7efd0',alpha);}c.save();c.translate(B.x,B.y+48);c.scale(1,.3);circle(0,0,20+t*65,'#9ce5bf',pulse(t),3);c.restore();}
 else if(p.variant==='evade'){for(let j=0;j<4;j++){const x=B.x-30+j*15-t*40;path([[x,B.y-50],[x-25,B.y+50]],2,p.color,pulse(t)*.6);}}
 else{const x=A.x,y=A.y;for(let j=0;j<3;j++){c.save();c.translate(x,y);c.scale(1,.35);circle(0,0,20+(t*60+j*25)%100,p.color,pulse(t)*.7);c.restore();}for(let j=0;j<10;j++){const a=j*Math.PI/5;path([[x+Math.cos(a)*40,y+Math.sin(a)*40],[x+Math.cos(a)*(40+t*50),y+Math.sin(a)*(40+t*50)]],2,p.secondary,pulse(t)*.6);}}
 }
 if(p.family==='control'){const n=p.variant==='burn'?8:3;for(let j=0;j<n;j++){if(p.variant==='burn'){const x=B.x+(random(j)-.5)*65,y=B.y+30-t*70;glow(x,y,8+random(j+10)*9,pulse(t)*.7);}else{const y=B.y-30+j*30;path([[B.x-55,y-10],[B.x+55,y+10]],3,'#d0b7e5',pulse(t));circle(B.x,B.y,30+t*25,'#c5a6e5',pulse(t)*.35);}}}
 if(p.family==='exit'){c.globalCompositeOperation='source-over';c.globalAlpha=pulse(t)*.3;c.fillStyle='#11202c';c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';for(let j=0;j<30;j++){const a=random(j)*Math.PI*2,r=ease(t)*(20+random(j+30)*100),x=B.x+Math.cos(a)*r,y=B.y+Math.sin(a)*r+Math.pow(t,2)*65;c.globalAlpha=(1-t)*.7;c.fillStyle=j%3?p.secondary:'#d4e9e3';c.save();c.translate(x,y);c.rotate(a+t*3);c.fillRect(-2,-5,4,10);c.restore();}}
 if(!support&&p.family!=='exit'){
 const accent=clamp(1-Math.abs(t-.51)/.14),strong=p.family==='energy'||p.variant==='heavy'||p.variant==='crosscut';
 if(strong&&accent>0){c.globalCompositeOperation='source-over';for(let j=0;j<16;j++){const a=j*Math.PI/8+.14,len=80+random(j+22)*110,inner=36+(1-accent)*90;path([[B.x+Math.cos(a)*inner,B.y+Math.sin(a)*inner*.65],[B.x+Math.cos(a)*len,B.y+Math.sin(a)*len*.65]],j%3?1:3,'#fff4d2',accent*.55);}c.globalCompositeOperation='lighter';c.save();c.translate(B.x,B.y);c.scale(1,.55);circle(0,0,25+(1-accent)*100,p.secondary,accent*.65,4);c.restore();}
 particles(t);
 }
 c.globalAlpha=1;c.shadowBlur=0;}
 if(t<1)fx.frame=requestAnimationFrame(frame);else{holder.remove();actor?.classList.remove('v193-actor');target?.classList.remove('v193-target');active.delete(fx);resolve();}}
 fx.frame=requestAnimationFrame(frame);
 });
}
