import {CARD_LAYOUTS,RARITY_NAMES,RARITY_COLORS,editionFor,cropRect,effectGlyph,visualFxList,normalizeEdition} from './card-spec.js';
export const CARD_WIDTH=900,CARD_HEIGHT=1350;

/** Pill fill matching scraped bubble cards (one chrome, all rarities). */
export const RARITY_PILL={
  common:'#5a6570',
  uncommon:'#1f7a4a',
  rare:'#1a5f9e',
  epic:'#6b3d9e',
  legendary:'#8a5a28',
};

export function fitText(ctx,text,maxWidth,size,min=22){let s=size;while(s>min){ctx.font=`800 ${s}px "Arena Display", "Barlow Condensed", sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;s--;}ctx.font=`800 ${s}px "Arena Display", "Barlow Condensed", sans-serif`;return s;}
function rounded(ctx,x,y,w,h,r=16){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function text(ctx,str,x,y,w,size,color,align='left',weight=800){ctx.fillStyle=color;ctx.textAlign=align;const s=fitText(ctx,String(str),w,size);ctx.font=`${weight} ${s}px "Arena Display", "Barlow Condensed", sans-serif`;ctx.fillText(String(str),x,y);return s;}
function drawCover(c,image,x,y,w,h,crop={}){const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;if(!iw||!ih)return;const q=cropRect(iw,ih,w,h,crop);c.drawImage(image,q.sx,q.sy,q.sw,q.sh,x,y,w,h);}
function drawContain(c,image,x,y,w,h,pad=0){
  const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;if(!iw||!ih)return;
  const boxW=Math.max(1,w-pad*2),boxH=Math.max(1,h-pad*2);
  const scale=Math.min(boxW/iw,boxH/ih);const dw=iw*scale,dh=ih*scale;
  c.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function trimDarkMargins(image,threshold=28){
  try{
    const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
    if(!iw||!ih||iw*ih>1600*1600)return null;
    const cv=document.createElement('canvas');cv.width=iw;cv.height=ih;
    const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const d=ctx.getImageData(0,0,iw,ih).data;
    let minX=iw,minY=ih,maxX=0,maxY=0;
    for(let y=0;y<ih;y+=2)for(let x=0;x<iw;x+=2){
      const i=(y*iw+x)*4;if(d[i]+d[i+1]+d[i+2]>threshold*3){if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y;}
    }
    if(maxX<=minX||maxY<=minY)return null;
    const pad=4;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(iw-1,maxX+pad);maxY=Math.min(ih-1,maxY+pad);
    const tw=maxX-minX+1,th=maxY-minY+1;
    if(tw*th>iw*ih*0.92)return null;
    const out=document.createElement('canvas');out.width=tw;out.height=th;out.getContext('2d').drawImage(image,minX,minY,tw,th,0,0,tw,th);
    return out;
  }catch{return null;}
}
function hexAlpha(hex,a){const h=String(hex||'#9aa8ad').replace('#','');const full=h.length===3?h.split('').map(ch=>ch+ch).join(''):h;const n=parseInt(full.slice(0,6),16);if(Number.isNaN(n))return `rgba(154,168,173,${a})`;return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}

/** Path helpers for shaped stat badges (number sits inside). */
function pathSword(c,x,y,s){
  c.beginPath();
  c.moveTo(x,y-s*1.05);
  c.lineTo(x+s*.22,y-s*.35);
  c.lineTo(x+s*.16,y+s*.05);
  c.lineTo(x+s*.42,y+s*.12);
  c.lineTo(x+s*.42,y+s*.28);
  c.lineTo(x+s*.16,y+s*.22);
  c.lineTo(x+s*.12,y+s*.55);
  c.lineTo(x-s*.12,y+s*.55);
  c.lineTo(x-s*.16,y+s*.22);
  c.lineTo(x-s*.42,y+s*.28);
  c.lineTo(x-s*.42,y+s*.12);
  c.lineTo(x-s*.16,y+s*.05);
  c.lineTo(x-s*.22,y-s*.35);
  c.closePath();
}
function pathHeart(c,x,y,s){
  c.beginPath();
  c.moveTo(x,y+s*.72);
  c.bezierCurveTo(x-s*1.05,y+s*.12,x-s*.95,y-s*.72,x,y-s*.28);
  c.bezierCurveTo(x+s*.95,y-s*.72,x+s*1.05,y+s*.12,x,y+s*.72);
  c.closePath();
}
function pathBolt(c,x,y,s){
  c.beginPath();
  c.moveTo(x+s*.18,y-s*1.0);
  c.lineTo(x-s*.42,y+s*.08);
  c.lineTo(x-s*.02,y+s*.08);
  c.lineTo(x-s*.22,y+s*1.0);
  c.lineTo(x+s*.48,y-s*.05);
  c.lineTo(x+s*.08,y-s*.05);
  c.closePath();
}
function paintStatNumber(c,x,y,value,{special=false,textScale=1}={}){
  const label=String(value??'—');
  let size=(label.length>4?32:label.length>3?42:label.length>2?52:60)*Math.max(1,textScale);
  c.textAlign='center';c.textBaseline='middle';
  c.font=`900 ${Math.round(size)}px "Arena Display", sans-serif`;
  if(special){
    c.shadowColor='#ffe29aee';c.shadowBlur=14;
    const g=c.createLinearGradient(x,y-size*.5,x,y+size*.5);
    g.addColorStop(0,'#fff6c8');g.addColorStop(.45,'#f0c14a');g.addColorStop(1,'#b8860b');
    c.fillStyle=g;c.fillText(label,x,y+1);
    c.shadowColor='#a6f4ff88';c.shadowBlur=8;c.fillStyle='#fff4c4';c.fillText(label,x,y);
  }else{
    c.shadowColor='#0006';c.shadowBlur=6;
    c.lineWidth=3.2;c.strokeStyle='#ffffffcc';c.strokeText(label,x,y);
    c.fillStyle='#0e1214';c.fillText(label,x,y);
  }
  c.shadowBlur=0;c.textBaseline='alphabetic';
}
/** Shaped bubbles: sword / heart / bolt with value centered inside. */
function bubbleIcon(c,x,y,r,value,fill,kind,{textScale=1,special=false}={}){
  const s=r*0.92;
  c.save();
  c.shadowColor='#0008';c.shadowBlur=12;c.shadowOffsetY=4;
  const g=c.createRadialGradient(x-r*.3,y-r*.35,2,x,y,r*1.15);
  g.addColorStop(0,fill[0]);g.addColorStop(.55,fill[1]);g.addColorStop(1,fill[2]);
  c.fillStyle=g;
  if(kind==='atk')pathSword(c,x,y,s);
  else if(kind==='hp')pathHeart(c,x,y,s);
  else pathBolt(c,x,y,s);
  c.fill();
  c.shadowBlur=0;c.shadowOffsetY=0;
  c.lineWidth=Math.max(3.5,r*0.07);c.strokeStyle='#ffffffee';c.stroke();
  c.lineWidth=Math.max(1.5,r*0.03);c.strokeStyle=hexAlpha(fill[2],.85);c.stroke();
  // soft highlight
  c.globalAlpha=.28;c.fillStyle='#fff';
  if(kind==='atk'){c.beginPath();c.ellipse(x-s*.08,y-s*.45,s*.14,s*.28,-.35,0,Math.PI*2);c.fill();}
  else if(kind==='hp'){c.beginPath();c.ellipse(x-s*.22,y-s*.15,s*.22,s*.16,-.4,0,Math.PI*2);c.fill();}
  else{c.beginPath();c.ellipse(x+s*.05,y-s*.35,s*.12,s*.22,-.2,0,Math.PI*2);c.fill();}
  c.globalAlpha=1;c.restore();
  paintStatNumber(c,x,y+(kind==='atk'?s*.08:kind==='hp'?s*.12:s*.05),value,{special,textScale});
}

function rarityPill(c,rarity,x=36,y=36,{scale=1}={}){
  const label=RARITY_NAMES[rarity]||'OBJET';
  const fill=RARITY_PILL[rarity]||RARITY_PILL.common;
  const s=scale*1.38;
  const fs=Math.round(24*s);
  c.font=`800 ${fs}px "Arena Display", sans-serif`;
  const tw=c.measureText(label).width;
  const w=Math.max(168*s,tw+72*s),h=48*s;
  c.fillStyle=fill;rounded(c,x,y,w,h,22*s);c.fill();
  c.strokeStyle='#ffffff66';c.lineWidth=2;rounded(c,x,y,w,h,22*s);c.stroke();
  const dx=x+26*s,dy=y+h/2,ds=10*s;
  c.fillStyle='#fff';c.beginPath();c.moveTo(dx,dy-ds);c.lineTo(dx+ds,dy);c.lineTo(dx,dy+ds);c.lineTo(dx-ds,dy);c.closePath();c.fill();
  c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';
  c.font=`800 ${Math.round(22*s)}px "Arena Display", sans-serif`;
  c.fillText(label,x+46*s,y+h/2+1);c.textBaseline='alphabetic';
  return {w,h};
}

/** Wrap text into lines that fit maxWidth; returns {lines, size}. */
function wrapFit(c,str,maxWidth,size,min=18,maxLines=4){
  let s=size;const words=String(str||'').trim().split(/\s+/).filter(Boolean);
  if(!words.length)return {lines:['—'],size:s};
  for(;s>=min;s--){
    c.font=`800 ${s}px "Arena Display", "Barlow Condensed", sans-serif`;
    const lines=[];let cur='';
    for(const w of words){
      const t=cur?cur+' '+w:w;
      if(c.measureText(t).width<=maxWidth)cur=t;
      else{if(cur)lines.push(cur);cur=w;if(lines.length>=maxLines)break;}
    }
    if(cur&&lines.length<maxLines)lines.push(cur);
    if(lines.length<=maxLines&&lines.every(l=>c.measureText(l).width<=maxWidth))return {lines,size:s};
  }
  c.font=`800 ${min}px "Arena Display", "Barlow Condensed", sans-serif`;
  return {lines:[String(str||'').slice(0,42)],size:min};
}

/** True if portrait window is empty / yellow void / photoreal estate scrap / letter placeholder. */
export function artWindowLooksEmpty(image){
  try{
    const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
    if(!iw||!ih)return true;
    const cv=document.createElement('canvas');
    const sw=96,sh=96;cv.width=sw;cv.height=sh;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    const sx=iw*0.18,sy=ih*0.14,sw0=iw*0.64,sh0=ih*0.42;
    ctx.drawImage(image,sx,sy,sw0,sh0,0,0,sw,sh);
    const d=ctx.getImageData(0,0,sw,sh).data;
    let sum=0,n=0,dark=0,varish=0,yel=0,green=0,sky=0;const L=[];const buckets=new Set();
    for(let i=0;i<d.length;i+=4){
      const r=d[i],g=d[i+1],b=d[i+2],v=(r+g+b)/3;L.push(v);sum+=v;n++;
      if(v<40)dark++;
      if(r>150&&g>130&&b<130&&(r+g)>b*2.1)yel++;
      if(g>r+20&&g>b+15&&g>90)green++;
      if(b>r+10&&b>g&&v>140)sky++;
      buckets.add(`${r>>4},${g>>4},${b>>4}`);
    }
    const mean=sum/Math.max(1,n);for(const v of L)varish+=(v-mean)*(v-mean);
    const std=Math.sqrt(varish/Math.max(1,n));
    const darkEmpty=(dark/n>0.72&&mean<65)||(mean<70&&std<40)||(mean<48&&std<55);
    const yellowRing=dark/n>0.55&&mean<85&&yel/n>0.04&&std<55;
    // Photo / letter stubs only on full bubble-card scrapes — not on real portraits (can have green skies).
    const fullCard=iw>=700&&ih>=1000;
    const photoScrap=fullCard&&((buckets.size>90&&green/n>0.15&&sky/n>0.1)||(green/n>0.22&&buckets.size>70&&mean>120));
    const letterStub=fullCard&&dark/n>0.55&&buckets.size<40&&mean<80;
    return darkEmpty||yellowRing||photoScrap||letterStub;
  }catch{return false;}
}

export function isPreRenderedCard(image,{equipment=false}={}){
  if(!image||equipment)return false;
  const iw=image.naturalWidth||image.width||0,ih=image.naturalHeight||image.height||0;
  // Full scraped bubble cards ~724×1104. Portraits (~640×900) use drawn chrome.
  if(iw<700||ih<1000)return false;
  const ratio=iw/ih;
  if(!(ratio>0.58&&ratio<0.78))return false;
  if(artWindowLooksEmpty(image))return false;
  return true;
}

/** Special foil — bande irisée pleine carte (alpha unique, pas de double atténuation). */
function paintSpecialFoil(c,accent){
  c.save();
  c.globalAlpha=1;
  c.globalCompositeOperation='screen';
  const g=c.createLinearGradient(0,0,900,1350);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(.2,hexAlpha('#a6f4ff',.55));
  g.addColorStop(.45,'rgba(255,255,255,.78)');
  g.addColorStop(.52,hexAlpha(accent,.7));
  g.addColorStop(.72,'rgba(255,213,154,.55)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,900,1350);
  const glow=c.createRadialGradient(450,480,16,450,520,720);
  glow.addColorStop(0,'rgba(255,250,220,.5)');
  glow.addColorStop(.5,hexAlpha(accent,.28));
  glow.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=glow;c.fillRect(0,0,900,1350);
  c.globalCompositeOperation='source-over';
  c.restore();
}

/**
 * Lianes légères continues juste à l'intérieur du cadre couleur (bord dur).
 * Ondulation marquée pour ne pas se confondre avec le stroke chrome. Pas d'ovales.
 */
function paintBorderVines(c,accent,{level=1,scale=1}={}){
  const lv=Math.max(1,Math.min(5,level|0));
  const strands=lv>=4?2:1;
  // Rectangle du cadre dur (aligné chrome accent ~20).
  const x0=20,y0=20,x1=880,y1=1330;
  const edges=[[x0,y0,x1,y0],[x1,y0,x1,y1],[x1,y1,x0,y1],[x0,y1,x0,y0]];
  c.save();
  c.globalAlpha=1;
  c.lineCap='round';
  c.lineJoin='round';
  for(let s=0;s<strands;s++){
    // Inset intérieur : clairement DANS le cadre, pas dessus.
    const inset=(11+s*6)*scale;
    // Amplitude haute : l'ondulation doit rester lisible en miniature (~180px).
    const amp=(12+lv*1.2)*scale;
    const layers=[
      {lw:(6.2+lv*.5-s*.55)*scale,color:hexAlpha(accent,.98),blur:8},
      {lw:(2.6+lv*.2)*scale,color:hexAlpha('#ffffff',.9),blur:0},
    ];
    for(const layer of layers){
      c.shadowBlur=layer.blur;c.shadowColor=hexAlpha(accent,.7);
      c.strokeStyle=layer.color;c.lineWidth=layer.lw;
      edges.forEach(([ax,ay,bx,by],ei)=>{
        const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1;
        const nx=-dy/len*inset,ny=dx/len*inset;
        c.beginPath();
        c.moveTo(ax+nx,ay+ny);
        const steps=Math.max(24,Math.round(len/18));
        for(let i=1;i<=steps;i++){
          const t=i/steps;
          // 4 bosses + harmonique = silhouette de liane sur les 4 côtés.
          const wobble=(Math.sin(t*Math.PI*4.2+ei*1.2+s)+.35*Math.sin(t*Math.PI*8.4+s))*amp;
          c.lineTo(ax+dx*t+nx+(-dy/len)*wobble,ay+dy*t+ny+(dx/len)*wobble);
        }
        c.stroke();
      });
    }
  }
  c.shadowBlur=0;
  c.restore();
}

/** FX cumulés très marqués (1→5 + prism). Une seule couche d'alpha. */
function paintCumulativeFx(c,fxList,accent,{scale=1,intensity=1}={}){
  if(!fxList?.length)return;
  const sc=Math.max(1,scale);
  const boost=Math.max(1,Math.min(1.4,intensity));
  c.save();
  c.globalAlpha=1;
  for(const fx of fxList){
    const id=fx?.id||fx;
    if(id==='seal'){
      // Tampons d'encre coins + pointillés internes.
      c.fillStyle=hexAlpha(accent,.88);
      c.strokeStyle=hexAlpha('#ffffff',.7);
      c.lineWidth=2.8*sc;
      [[54,54],[846,54],[54,1296],[846,1296],[54,675],[846,675]].forEach(([x,y],i)=>{
        c.beginPath();c.arc(x,y,(12+(i%3)*3.5)*sc,0,Math.PI*2);c.fill();
        c.beginPath();c.arc(x,y,(18+(i%2)*4)*sc,0,Math.PI*2);c.stroke();
      });
      c.strokeStyle=hexAlpha(accent,.85);c.lineWidth=3.4*sc;c.setLineDash([12*sc,12*sc]);
      rounded(c,46,46,808,1258,20);c.stroke();c.setLineDash([]);
    }else if(id==='veins'){
      c.lineCap='round';
      c.strokeStyle=hexAlpha(accent,.98);c.lineWidth=6*sc;
      c.shadowColor=hexAlpha(accent,.8);c.shadowBlur=16*sc;
      [[24,180,190,450],[876,180,710,450],[28,780,195,1140],[872,780,705,1140],[48,470,210,660],[852,470,690,660]].forEach(([x1,y1,x2,y2])=>{
        c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo((x1+x2)/2+((x1<450)?70:-70)*sc,(y1+y2)/2,x2,y2);c.stroke();
      });
      c.shadowBlur=0;c.strokeStyle=hexAlpha('#ffffff',.65);c.lineWidth=2.6*sc;
      [[60,260,175,400],[840,260,725,400],[70,900,185,1060],[830,900,715,1060]].forEach(([x1,y1,x2,y2])=>{
        c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
      });
    }else if(id==='split'){
      c.fillStyle=hexAlpha('#ffffff',.72);
      c.strokeStyle='#fffffff0';
      c.lineWidth=4*sc;
      c.shadowColor='#ffffffcc';c.shadowBlur=18*sc;
      [[40,170,270,90,235,140],[860,170,630,90,665,140],[40,1160,270,1070,235,1120],[860,1160,630,1070,665,1120],[95,600,250,520,220,565],[805,600,650,520,680,565]].forEach(([a,b,d,e,f,g])=>{
        c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.lineTo(f,g);c.closePath();c.fill();c.stroke();
      });
      c.shadowBlur=0;
    }else if(id==='aurora'){
      c.globalCompositeOperation='screen';
      [[220,240,560,'#66f0ff'],[700,500,580,'#ff8ad8'],[450,1120,620,accent],[450,150,380,'#ffe9a8'],[160,780,420,'#66f0ff']].forEach(([x,y,r,col])=>{
        const g=c.createRadialGradient(x,y,10,x,y,r);
        g.addColorStop(0,hexAlpha(col,.95*boost));
        g.addColorStop(.4,hexAlpha(col,.55*boost));
        g.addColorStop(1,hexAlpha(col,0));
        c.fillStyle=g;c.fillRect(0,0,900,1350);
      });
      c.globalCompositeOperation='source-over';
    }else if(id==='embers'){
      c.fillStyle='#ffb347';
      c.shadowColor='#ff9a2acc';c.shadowBlur=18*sc;
      [[60,240],[110,300],[840,250],[790,340],[80,560],[820,580],[170,840],[730,860],[80,1090],[820,1110],[450,130],[530,175],[230,430],[670,450],[340,280],[570,260],[180,680],[720,700],[290,190],[610,210],[400,520],[500,540]].forEach(([x,y],i)=>{
        c.beginPath();c.arc(x,y,(5.5+(i%4)*2.2)*sc,0,Math.PI*2);c.fill();
      });
      c.shadowBlur=0;
      c.fillStyle=hexAlpha(accent,.98);
      [[180,220],[720,230],[230,990],[670,1000],[150,670],[750,690],[450,360],[450,860]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,5*sc,0,Math.PI*2);c.fill();});
      c.globalCompositeOperation='screen';
      const glow=c.createRadialGradient(450,700,16,450,700,600);
      glow.addColorStop(0,hexAlpha('#ffb347',.65*boost));glow.addColorStop(1,hexAlpha('#ffb347',0));
      c.fillStyle=glow;c.fillRect(0,0,900,1350);
      c.globalCompositeOperation='source-over';
    }else if(id==='prism'){
      paintSpecialFoil(c,accent);
    }
  }
  c.restore();
}

/** Titre / effet : glow rareté cumulatif (level empilé) — lisible. */
function paintRarityTitle(c,str,x,y,maxW,baseSize,{accent,level=1,special=false,align='center',weight=900,italic=false,fill='#ffffff',soft=false}={}){
  const label=String(str||'');
  const size=fitText(c,label,maxW,baseSize,Math.max(16,Math.round(baseSize*0.42)));
  const style=italic?'italic ':'';
  c.textAlign=align;c.textBaseline='alphabetic';
  c.font=`${style}${weight} ${size}px "Arena Display", "Barlow Condensed", sans-serif`;
  const blur=soft?5+level*1.4:7+level*2.6;
  c.shadowColor=hexAlpha(accent,soft?.4:.55+level*.1);
  c.shadowBlur=blur;
  if(level>=2&&!soft){
    c.lineWidth=1.6+level*0.35;c.strokeStyle=hexAlpha(accent,.35+level*.08);c.strokeText(label,x,y);
  }
  if(level>=4&&!soft){
    c.shadowColor=hexAlpha(accent,.55);c.shadowBlur=blur+6;c.fillStyle=fill;c.fillText(label,x,y);
  }
  if(special&&!soft){c.shadowColor='#ffe29acc';c.shadowBlur=blur+10;c.fillStyle='#ffd15a';c.fillText(label,x,y);}
  c.shadowBlur=soft?4:Math.min(14,blur*0.65);c.shadowColor='#000a';
  c.fillStyle=special&&!soft?'#ffd15a':fill;c.fillText(label,x,y);
  c.shadowBlur=0;
  return size;
}

function paintSubtitle(c,str,x,y,maxW,size,{accent,level=1,align='center'}={}){
  return paintRarityTitle(c,str,x,y,maxW,size,{accent,level,align,weight:600,italic:true,fill:'#e8f2ff',soft:true});
}

function equipmentEffectText(hero){
  const fx=hero.effects?.[0];
  // Prefer explicit effect description — never reuse the item name as "effet".
  if(fx?.description)return String(fx.description);
  if(fx?.name&&fx.name!==hero.name)return String(fx.name);
  const bits=[];
  if(Number(hero.atk))bits.push('ATQ +'+hero.atk+'%');
  if(hero.effect==='hp'&&Number(hero.shield))bits.push('PV max +'+hero.shield+'%');
  else if(Number(hero.shield))bits.push('Bouclier '+hero.shield+'%');
  if(Number(hero.heal))bits.push('Soin '+hero.heal+'%');
  if(hero.effect==='pierce')bits.push('Ignore la moitié du bouclier');
  if(hero.effect==='stun')bits.push('Interrompt une action ennemie');
  if(hero.effect==='evade')bits.push('Esquive garantie une fois');
  if(hero.effect==='counter')bits.push('Une riposte au premier coup');
  return bits.join(' · ')||hero.artLabel||hero.category||'Effet de jeu';
}

function paintFullBleedArt(c,image,crop,{equipment=false,pictogram=false,accent='#9aa8ad'}={}){
  if(image){
    const iw=image.naturalWidth||image.width||1,ih=image.naturalHeight||image.height||1;
    if(equipment){
      if(pictogram){
        const halo=c.createRadialGradient(450,500,40,450,500,440);
        halo.addColorStop(0,hexAlpha(accent,.35));halo.addColorStop(1,'rgba(18,28,40,0)');
        c.fillStyle=halo;c.fillRect(0,0,900,1350);
        drawContain(c,image,140,180,620,620,20);
        return;
      }
      const src=trimDarkMargins(image)||image;
      const auto={x:.5,y:.4,zoom:1.35};
      drawCover(c,src,0,0,900,1350,crop?.zoom||crop?.x!=null?crop:auto);
      return;
    }
    const portraitLike=iw<700||ih<1000;
    const isCardFace=iw>=700&&ih>=1000&&iw/ih>0.58&&iw/ih<0.78;
    if(isCardFace){
      // Scrapes bulles : cadrer le portrait, couper toute boîte rectangulaire bas/haut du scan.
      drawCover(c,image,0,0,900,1350,crop?.zoom||crop?.x!=null?crop:{x:.5,y:.20,zoom:1.80});
    }else{
      const auto=portraitLike?{x:.5,y:.28,zoom:1.22}:{x:.5,y:.32,zoom:1.12};
      drawCover(c,image,0,0,900,1350,crop?.zoom||crop?.x!=null?crop:auto);
    }
  }else{
    const g=c.createLinearGradient(0,0,900,1350);g.addColorStop(0,'#254247');g.addColorStop(1,'#121c28');c.fillStyle=g;c.fillRect(0,0,900,1350);
  }
}

/**
 * Cadre rareté + chrome. Les FX carte sont peints à part (avant le texte).
 */
function paintCardChrome(c,hero,{equipment,accent,l,special,textScale,level}){
  // Cadre couleur de rareté (épaisseur croît légèrement avec le niveau) + liseré clair.
  const lw=4.5+level*0.45;
  c.strokeStyle='#ffffff66';c.lineWidth=2.5;rounded(c,14,14,872,1322,28);c.stroke();
  c.strokeStyle=hexAlpha(accent,.82);c.lineWidth=lw;rounded(c,20,20,860,1310,24);c.stroke();
  c.strokeStyle=hexAlpha(accent,.42);c.lineWidth=2.2;rounded(c,28,28,844,1294,20);c.stroke();
  if(special){
    c.strokeStyle='#fff6d8aa';c.lineWidth=1.6;rounded(c,34,34,832,1282,18);c.stroke();
  }

  const pill=rarityPill(c,hero.rarity||'common',36,36,{scale:1.08*textScale});
  if(special){
    const sy=36+Math.round((pill?.h||48)+10*textScale);
    const bw=Math.round(210*textScale),bh=Math.round(42*textScale);
    c.fillStyle=accent;rounded(c,36,sy,bw,bh,16);c.fill();
    c.strokeStyle='#ffffff88';c.lineWidth=2;rounded(c,36,sy,bw,bh,16);c.stroke();
    text(c,'SPÉCIALE',36+bw/2,sy+Math.round(bh*0.68),bw-24,Math.round(20*textScale),'#102018','center',800);
  }
}

function paintCardCopy(c,hero,{equipment,accent,l,special,textScale,level}){
  const cx=450;
  if(equipment){
    // Effet ambre → nom ivoire/or → sous-titre teal (couleurs distinctes)
    const effect=equipmentEffectText(hero);
    const {lines:effLines,size:effSize}=wrapFit(c,effect,800,Math.round(62*textScale),28,3);
    let y=1035;
    for(const line of effLines){
      paintRarityTitle(c,line,cx,y,800,effSize,{accent,level,special,align:'center',weight:900,fill:'#ffd56a'});
      y+=effSize+10;
    }
    const nameY=y+12;
    const nameSize=paintRarityTitle(c,String(hero.name||''),cx,nameY,820,Math.round(54*textScale),{accent,level,special,align:'center',weight:800,italic:true,fill:'#fff8e8',soft:false});
    const world=String(hero.universe||'OBJET').replace('ONEPIECE','OP');
    const sub=[world,hero.category||hero.artLabel||''].filter(Boolean).join(' · ');
    paintRarityTitle(c,String(sub).slice(0,48),cx,nameY+Math.round(nameSize*0.92)+8,820,Math.round(34*textScale),{accent,level,align:'center',weight:600,italic:true,fill:'#7fe8d4',soft:true});
    return {by:1260,effects:hero.effects||[],nameY,textScale,level};
  }

  // Nom + sous-titre encore agrandis
  const nameY=940;
  const nameSize=paintRarityTitle(c,String(hero.name||'').toUpperCase(),cx,nameY,840,Math.round(96*textScale),{accent,level,special,align:'center',weight:900});
  const world=String(hero.universe||'OBJET').replace('ONEPIECE','OP');
  const sub=hero.form?`${world} · ${hero.form}`:world;
  paintSubtitle(c,String(sub).slice(0,48),cx,nameY+Math.round(nameSize*0.82)+10,840,Math.round(48*textScale),{accent,level});

  const sm=special?1.1:1;
  const stats=[
    {v:Math.round(Number(hero.attack||0)*sm),fill:['#7dffb0','#1f9e72','#0d6a4a'],kind:'atk'},
    {v:Math.round(Number(hero.maxHp||0)*sm),fill:['#ff9aa8','#e31c33','#9e1833'],kind:'hp'},
    {v:Math.round(Number(hero.speed||0)*sm),fill:['#86e3ff','#167ce1','#0647ae'],kind:'spd'},
  ];
  const by=1185;
  const numScale=Math.min(1.36,textScale*1.24);
  // Vert (ATK) et bleu (VIT) encore plus larges ; cœur un cran au-dessus
  bubbleIcon(c,145,by,Math.round(100*textScale),stats[0].v,stats[0].fill,stats[0].kind,{textScale:numScale,special});
  bubbleIcon(c,450,by,Math.round(88*textScale),stats[1].v,stats[1].fill,stats[1].kind,{textScale:numScale,special});
  bubbleIcon(c,755,by,Math.round(100*textScale),stats[2].v,stats[2].fill,stats[2].kind,{textScale:numScale,special});

  const effects=hero.effects||[];
  if(effects.length){
    const n=Math.min(5,l.level||effects.length);
    const rad=Math.round(25*textScale);
    effects.slice(0,n).forEach((e,i)=>{
      const cx2=828,cy2=215+i*Math.round(64*textScale);
      const colors=['#ff9a3c','#3ec6ff','#5dffd0','#c084fc','#f5d76e'];
      c.save();
      c.shadowColor='#0008';c.shadowBlur=8;
      c.fillStyle='#10222cd8';c.beginPath();c.arc(cx2,cy2,rad,0,Math.PI*2);c.fill();
      c.shadowBlur=0;
      c.strokeStyle=colors[i%colors.length];c.lineWidth=3;c.beginPath();c.arc(cx2,cy2,rad,0,Math.PI*2);c.stroke();
      c.restore();
      text(c,effectGlyph(e),cx2,cy2+Math.round(9*textScale),rad*1.4,Math.round(24*textScale),'#fff','center',800);
    });
  }
  return {by,effects,nameY,textScale,level};
}

/**
 * Ordre : art → FX carte (pleine, sans rectangle) → bordure → texte/bulles.
 */
export function renderCard(canvas,hero,{skin,edition,image=null,seed='ARENA',crop={},equipment=false}={}){
  canvas.width=900;canvas.height=1350;
  const rarity=hero.rarity||'common';
  const l=CARD_LAYOUTS[rarity]||CARD_LAYOUTS.common;
  const accent=RARITY_COLORS[rarity]||'#9aa8ad';
  const ed=normalizeEdition(edition||skin||editionFor(seed,hero.id));
  const special=ed==='special';
  const fx=visualFxList(rarity,ed);
  const level=Math.max(1,Math.min(5,l.level||1));
  const textScale=1+0.05*(level-1)+(special?0.06:0);
  const c=canvas.getContext('2d');
  c.clearRect(0,0,900,1350);c.save();rounded(c,8,8,884,1334,26);c.clip();
  let art=image;
  if(art&&!equipment&&artWindowLooksEmpty(art))art=null;

  const under=c.createLinearGradient(0,0,0,1350);
  under.addColorStop(0,'#2a4a52');under.addColorStop(1,'#1a3038');
  c.fillStyle=under;c.fillRect(0,0,900,1350);
  paintFullBleedArt(c,art,crop,{equipment,pictogram:hero.artLabel==='PICTOGRAMME',accent});

  // FX pleine carte sous le texte (plus de lianes).
  paintCumulativeFx(c,fx.filter(f=>(f.id||f)!=='prism'),accent,{scale:textScale,intensity:1.2+0.2*(level-1)+(special?0.25:0),level});
  if(special)paintSpecialFoil(c,accent);
  paintCardChrome(c,hero,{equipment,accent,l,special,textScale,level});
  const {by,effects,nameY}=paintCardCopy(c,hero,{equipment,accent,l,special,textScale,level});

  c.restore();
  return {rarity,edition:ed,fx:fx.map(f=>f.id),fxCount:fx.length,imageHeight:1350,imageFraction:art?1:0,abilityCount:effects.length,statsY:by,template:equipment?'drawn-gear':'drawn-bubbles',nameY};
}
