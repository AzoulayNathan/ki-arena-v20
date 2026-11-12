import {asset,audioSettings} from './media.js';
import {animationProfile} from './presentation.js';
/* One renderer, no simulation, no async outcome mutation. Canvas2D fallback. */
let scene=null,generation=0,atlas=null,audioContext=null;
export function effectSound(profile){
 if(audioSettings.muted||!audioSettings.sfx)return;
 try{audioContext??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();
  const ctx=audioContext,t=ctx.currentTime,out=ctx.createGain();out.gain.value=audioSettings.sfx*.2;out.connect(ctx.destination);
  const duration=profile.kind==='beam'?.30:.12,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),d=buffer.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
  const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter();noise.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(profile.kind==='slash'?5000:1400,t);filter.frequency.exponentialRampToValueAtTime(150,t+duration);noise.connect(filter).connect(out);noise.start(t);
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=profile.kind==='heal'?'sine':'triangle';osc.frequency.setValueAtTime(profile.kind==='heal'?620:profile.kind==='beam'?340:150,t);osc.frequency.exponentialRampToValueAtTime(profile.kind==='heal'?950:45,t+duration);gain.gain.setValueAtTime(.35,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(out);osc.start(t);osc.stop(t+duration);noise.onended=()=>{out.disconnect();filter.disconnect();gain.disconnect();};
 }catch{}
}
export function stopEffects(dispose=false){generation++;if(scene){if(dispose||!scene.root.isConnected){scene.app?.destroy(true,{children:true});scene.canvas?.remove();scene=null;}else{scene.draw.clear();scene.draw.render();}}document.querySelectorAll('.a-vfx-label').forEach(e=>e.remove());}
function getPoint(el,root){const r=el.getBoundingClientRect(),b=root.getBoundingClientRect();return {x:r.left-b.left+r.width*.5,y:r.top-b.top+r.height*.43};}
function prepareAtlas(){if(!atlas){atlas=new Image();atlas.src=asset('assets/v11/impact-atlas.webp');}return atlas;}
function drawFrame(profile,t,A,B,draw){
 const {kind,color}=profile,impactAt=.58,p=Math.min(1,t/impactAt),ease=1-Math.pow(1-p,3),x=A.x+(B.x-A.x)*ease,y=A.y+(B.y-A.y)*ease,fade=1-Math.max(0,(t-impactAt)/(1-impactAt)),hit=t>=impactAt;
 const line=(a,b,w,c=color,alpha=1)=>draw.line(a,b,w,c,alpha),circle=(pt,r,c=color,alpha=1)=>draw.circle(pt,r,c,alpha);
 if(kind==='none')return;
 if(['heal','shield','aura','status','ko','evade'].includes(kind)){
  const dest=kind==='evade'?A:B;
  for(let i=0;i<3;i++)draw.ring(dest,18+t*75+i*9,3,color,(1-t)*.7);
  for(let i=0;i<12;i++){const a=i*Math.PI/6+t*2,r=20+t*65;circle({x:dest.x+Math.cos(a)*r,y:dest.y+Math.sin(a)*r},kind==='status'?2:3,color,(1-t)*.8);}
  if(kind==='shield'){line({x:dest.x-40,y:dest.y-45},{x:dest.x+40,y:dest.y-45},3);line({x:dest.x-40,y:dest.y-45},{x:dest.x-28,y:dest.y+35},3);line({x:dest.x+40,y:dest.y-45},{x:dest.x+28,y:dest.y+35},3);line({x:dest.x-28,y:dest.y+35},{x:dest.x,y:dest.y+55},3);line({x:dest.x+28,y:dest.y+35},{x:dest.x,y:dest.y+55},3);}
  return;
 }
 if(kind==='beam'){
  if(t<.18){for(let i=0;i<3;i++)draw.ring(A,6+t*90+i*4,2,color,.7);circle(A,8+t*55,0xffffff,.9);}
  else{const q=Math.min(1,(t-.18)/.32),end={x:A.x+(B.x-A.x)*q,y:A.y+(B.y-A.y)*q},alpha=t<.58?1:fade;line(A,end,28,color,.16*alpha);line(A,end,14,color,.7*alpha);line(A,end,5,0xffffff,alpha);circle(end,16,color,alpha);circle(end,7,0xffffff,alpha);}
 }else if(kind==='lightning'){
  const points=[A];for(let i=1;i<9;i++){const f=i/9;points.push({x:A.x+(B.x-A.x)*f+Math.sin(i*12+t*40)*16,y:A.y+(B.y-A.y)*f});}points.push(B);for(let i=1;i<points.length;i++){line(points[i-1],points[i],12,color,.18*fade);line(points[i-1],points[i],3,0xffffff,fade);}
 }else if(kind==='slash'){
  if(t<.48){line(A,{x,y},3,color,.7);circle({x,y},5,0xffffff,.9);}else for(let i=0;i<3;i++){const a={x:B.x-40+i*13,y:B.y+48},b={x:B.x+35+i*13,y:B.y-48};line(a,b,9,color,.22*fade);line(a,b,3,0xffffff,fade);}
 }else{
  if(t<impactAt){line({x:x-(B.x-A.x)*.1,y:y-(B.y-A.y)*.1},{x,y},kind==='projectile'?13:3,color,.5);circle({x,y},kind==='projectile'?16:6,color,.8);circle({x,y},kind==='projectile'?7:3,0xffffff,1);}
 }
 if(hit){const f=(t-impactAt)/(1-impactAt);draw.sprite(B,Math.floor(f*8),kind==='beam'?160:115,fade);for(let i=0;i<12;i++){const angle=i*2.399,dist=20+f*70,end={x:B.x+Math.cos(angle)*dist,y:B.y+Math.sin(angle)*dist};line(B,end,1.5,color,fade*.6);}if(kind==='combo')for(let i=0;i<3;i++)draw.ring({x:B.x+Math.sin(i*4)*25,y:B.y+Math.cos(i*4)*25},8+f*35,3,color,fade);}
}
async function backend(root,token){
 if(scene?.root===root)return scene.draw;
 if(scene){scene.app?.destroy(true,{children:true});scene.canvas?.remove();scene=null;}
 const P=globalThis.PIXI,w=root.clientWidth,h=root.clientHeight;
 if(P){try{const app=new P.Application();await app.init({width:w,height:h,backgroundAlpha:0,antialias:true,resolution:Math.min(devicePixelRatio||1,1.5),autoDensity:true,preference:'webgl',autoStart:false,manageImports:false});if(token!==generation){app.destroy(true,{children:true});return null;}app.canvas.className='a-vfx-canvas';root.append(app.canvas);const g=new P.Graphics();app.stage.addChild(g);const im=prepareAtlas();let sprite=null,frames=[];
  if(im.complete&&im.naturalWidth){const texture=P.Texture.from(im);for(let f=0;f<8;f++)frames.push(new P.Texture({source:texture.source,frame:new P.Rectangle(f%4*im.naturalWidth/4,Math.floor(f/4)*im.naturalHeight/2,im.naturalWidth/4,im.naturalHeight/2)}));sprite=new P.Sprite(frames[0]);sprite.anchor.set(.5);sprite.visible=false;app.stage.addChild(sprite);}
  root.dataset.renderer='pixi';const draw={clear(){g.clear();if(sprite)sprite.visible=false;},line(a,b,width,color,alpha){g.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width,color,alpha,cap:'round'});},circle(p,r,color,alpha){g.circle(p.x,p.y,Math.max(0,r)).fill({color,alpha});},ring(p,r,width,color,alpha){g.circle(p.x,p.y,Math.max(0,r)).stroke({width,color,alpha});},sprite(p,f,size,alpha){if(sprite){sprite.texture=frames[Math.min(7,f)];sprite.position.set(p.x,p.y);sprite.width=sprite.height=size;sprite.alpha=alpha;sprite.visible=true;}},render(){app.render();},dispose(){if(g.destroyed||!app.renderer)return;g.clear();if(sprite)sprite.visible=false;app.render();}};scene={root,app,draw};return draw;
 }catch{if(scene){try{scene.app?.destroy(true,{children:true});}catch{}scene=null;}}}
 if(token!==generation)return null;const canvas=document.createElement('canvas');canvas.className='a-vfx-canvas';canvas.width=w;canvas.height=h;root.append(canvas);const ctx=canvas.getContext('2d'),im=prepareAtlas(),css=c=>'#'+c.toString(16).padStart(6,'0');root.dataset.renderer='canvas2d';const draw={clear(){ctx.clearRect(0,0,w,h);},line(a,b,width,color,alpha){ctx.globalAlpha=alpha;ctx.strokeStyle=css(color);ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();},circle(p,r,color,alpha){ctx.globalAlpha=alpha;ctx.fillStyle=css(color);ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0,r),0,Math.PI*2);ctx.fill();},ring(p,r,width,color,alpha){ctx.globalAlpha=alpha;ctx.strokeStyle=css(color);ctx.lineWidth=width;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0,r),0,Math.PI*2);ctx.stroke();},sprite(p,f,size,alpha){if(im.complete&&im.naturalWidth){ctx.globalAlpha=alpha;const sw=im.naturalWidth/4,sh=im.naturalHeight/2;ctx.drawImage(im,Math.min(3,f%4)*sw,Math.floor(Math.min(7,f)/4)*sh,sw,sh,p.x-size/2,p.y-size/2,size,size);}},render(){},dispose(){ctx.clearRect(0,0,w,h);}};scene={root,canvas,draw};return draw;
}
export async function playEffect(root,event,context={},speed=1,reduced=false){
 stopEffects();if(!root)return;const token=generation,profile=animationProfile(event,context),actor=root.querySelector(`[data-unit="${event.actor}"]`),target=root.querySelector(`[data-unit="${event.target}"]`);if(profile.kind==='none')return;
 const recipient=profile.kind==='evade'?actor:target||actor;if(!recipient)return;
 for(const el of [actor,target])if(el){const row=el.parentElement;if(row.scrollWidth>row.clientWidth){row.scrollLeft=Math.max(0,el.offsetLeft-row.offsetLeft-(row.clientWidth-el.offsetWidth)/2);}}
 const label=document.createElement('span');label.className='a-vfx-label '+profile.kind;label.textContent=profile.damage?'−'+profile.damage:profile.label;const B=getPoint(recipient,root),A=actor?getPoint(actor,root):B;label.style.left=B.x+'px';label.style.top=B.y+'px';root.append(label);setTimeout(()=>label.remove(),reduced?400:900/speed);
 effectSound(profile);if(reduced)return;
 actor?.animate([{transform:'translateY(0)'},{transform:`translateY(${event.actor?.startsWith('A')?'-7':'7'}px) scale(1.035)`},{transform:'translateY(0)'}],{duration:Math.min(500,profile.duration)/speed,easing:'ease-out'});
 if(target&&['impact','slash','projectile','beam','combo','counter','lightning'].includes(profile.kind))target.animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{delay:profile.duration*.5/speed,duration:180/speed});
 const draw=await backend(root,token);if(!draw)return;if(token!==generation){draw.dispose();return;}const began=performance.now(),duration=profile.duration/speed;root.dataset.effect=profile.kind;root.dataset.effectActor=event.actor||'';root.dataset.effectTarget=event.target||'';
 function frame(now){if(token!==generation||!root.isConnected){draw.dispose();return;}const t=Math.min(1,(now-began)/duration);draw.clear();drawFrame(profile,t,A,B,draw);draw.render();if(t<1)requestAnimationFrame(frame);else draw.dispose();}requestAnimationFrame(frame);
}
prepareAtlas();
