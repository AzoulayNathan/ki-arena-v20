/* Presentation only. Never changes the battle result, catalog or run. */
export const VISUAL_VERSION='11.0.0';
export const BIOMES=[
 {id:'valley',name:'Terres sauvages',art:'arena-valley',color:'#51b6e8'},
 {id:'desert',name:'Canyon solaire',art:'arena-desert',color:'#ffb44d'},
 {id:'alien',name:'Horizons de Namek',art:'arena-alien',color:'#62e0a6'},
 {id:'ruins',name:'Vestiges du tournoi',art:'arena-ruins',color:'#d299ff'},
 {id:'sky',name:'Sanctuaire céleste',art:'arena-sky',color:'#70d7ff'},
 {id:'chamber',name:'Chambre du temps',art:'arena-chamber',color:'#ffe0a0'}
];
export function biomeFor(act=0,kind='normal'){return BIOMES[kind==='boss'?4:((act%6)+6)%6];}
export function animationProfile(event,{technique='',weapon='',universe='DB'}={}){
 const type=event.type,text=(technique+' '+weapon+' '+(event.message||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const base={kind:'impact',color:({DB:0x53cfff,HXH:0x78e59c,NARUTO:0xffb13b,ONEPIECE:0xff7455})[universe]||0x53cfff,duration:520,label:technique||weapon||'Frappe',damage:event.damage||0};
 if(['heal','revive'].includes(type))return {...base,kind:'heal',color:0x70edb3,duration:650,label:type==='revive'?'Second souffle':'Soin'};
 if(['shield','guard'].includes(type))return {...base,kind:'shield',color:0x80dfff,duration:600,label:'Protection'};
 if(type==='dodge')return {...base,kind:'evade',duration:430,label:'Esquive'};
 if(type==='ko')return {...base,kind:'ko',color:0xff9551,duration:620,label:'K.O.'};
 if(type==='buff'||type==='phase')return {...base,kind:'aura',duration:700,label:technique||'Puissance'};
 if(type==='status'||type==='stunned')return {...base,kind:'status',color:0xbf95ff,duration:450,label:/interruption|stun/.test(text)?'Interruption':'Altération'};
 if(!['hit','skill_hit','counter_hit'].includes(type))return {...base,kind:'none',duration:100};
 if(type==='counter_hit')return {...base,kind:'counter',color:0xffd26e,duration:560,label:'Riposte'};
 if(/epee|sabre|slash|lame|sword|shuriken|katana|kusanagi|samehada|yoru|shusui|kunai|tranch|zoro/.test(text))return {...base,kind:'slash',duration:570};
 if(/kame|beam|rayon|galick|makank|vague|canon|masenko|final flash/.test(text))return {...base,kind:'beam',duration:850};
 if(/rasengan|sphere|bombe|genki|blast|projectile|pistolet|boule/.test(text))return {...base,kind:'projectile',duration:720};
 if(/eclair|foudre|chidori|electric|lightning/.test(text))return {...base,kind:'lightning',color:0x9cbfff,duration:650};
 if(/combo|rafale|gatling|mitraille|enchain/.test(text))return {...base,kind:'combo',duration:700};
 return base;
}
export function eventDuration(event,context={},speed=1,reduced=false){return reduced?45:Math.round((animationProfile(event,context).duration+100)/Math.max(1,speed));}
export function objectArt(item){
 const name=(item.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(item.universe==='DB'){
  if(/baton magique|nyoi/.test(name))return 0;
  if(/epee de trunks/.test(name))return 1;
  if(/armure.*saiyan|armure.*combat/.test(name))return 2;
  if(/scouter|detecteur.*puissance/.test(name))return 3;
  if(/senzu/.test(name))return 4;
  if(/dragon radar|radar.*dragon/.test(name))return 5;
 }
 if(item.universe==='NARUTO'&&/^kunai(?: |$)/.test(name))return 6;
 if(item.universe==='ONEPIECE'&&/chapeau de paille/.test(name))return 7;
 return null;
}
