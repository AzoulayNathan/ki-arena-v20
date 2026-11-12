import {renderAuto5,installAuto5} from './auto5.js';
import {refreshGameViewport,installGameViewport} from './game-viewport.js';
import {playCombatFX} from './combat-fx.js';
import {scheduleAdventureRoutes,installAdventureUI} from './adventure.js';
import {renderSurvival,installSurvivalUI,pauseSurvivalUI,survivalMapContent,survivalInspectContent} from './survival/ui.js';
import {CARDS,CARD_MAP,RARITIES} from './catalog.js';
import {runBattle,seededRandom} from './battle.js';
import {createAuction,placeBid,passBid,canBid,canPass} from './auction.js';
import {APPROVED_IMAGES} from './approved-images.js';
import {createRun,MAP_TYPES,BACKGROUNDS,GEAR,RELICS,CONSUMABLES,ALL_ITEMS,zoneLength,encounterEnemies,fight,markFight,recruit,advanceMap,addItem,addRelic,globalBonuses,modifiers,shopOffers,purchase,rollEvent,eventResolve,healRun,consume,equip,randomTreasure, reserveCapacity,makeWish,endRun,offerRewards,chooseReward,skipReward,chooseRest,switchReserve,dangerRating,availableNodes,routePick,encounterAssessment,linearTarget,runPower,bossArchetype,generateZone} from './roguelike.js';
import {PACKS,packType,randomTeam,openPack,initialProfile,addToCollection,STARTER_IDS,rogueEnemy,rogueDifficulty,playRogueWave,budgetOffers,cpuBudgetTeam,createTournament,cardScore} from './games.js';
import {FRANCHISES,FRANCHISE_IDS,franchiseOf,franchiseCssVars} from './franchises.js';
import {catalog as survivalCatalog} from './survival/catalog.js';

const $=s=>document.querySelector(s),app=$('#app'),KEY='kiarena_arcade_v3';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeGet=(which,key,defaultValue=null)=>{try{return window[which].getItem(key)??defaultValue;}catch{return defaultValue;}};
const storeSet=(which,key,value)=>{try{window[which].setItem(key,value);}catch{}};
const uid=()=>`${Date.now()}-${Math.floor(Math.random()*1e9)}`;
const RGB={common:'#f0f4fc',uncommon:'#36ec9a',rare:'#54c3ff',epic:'#b88aff',legendary:'#ffcf65'};
const label={common:'COMMUNE',uncommon:'PEU COMMUNE',rare:'RARE',epic:'ÉPIQUE',legendary:'LÉGENDAIRE'};
const modeInfo={free:['TIRAGE ×5','DUEL ÉCLAIR','Tire ton équipe. Que le meilleur gagne.','bolt'],draft:['DRAFT','BUDGET KI','Cinq choix. Une seule équipe.','coins'],blind:['DRAFT','ENCHÈRES À DEUX','Mise · surenchère · passe.','coins'],tournament:['MODE','TOURNOI','Du chaos au dernier survivant.','trophy'],ranking:['MINI-JEU','BLIND RANKING','Classe avant de connaître la suite.','list'],rogue:['SOLO','SURVIE INFINIE','Cinq cartes. Encore une zone.','mountain'],versus:['MINI-JEU','PLUS OU MOINS','Un réflexe. Une statistique.','sparkles']};
let profile;try{profile={...initialProfile(),...JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('kiarena_arcade_v2')||'{}')};}catch{profile=initialProfile();}
const initSettings={rules:'canon',size:5,saga:'all',max:'legendary',speed:1,opponent:'cpu',auctionRounds:15,auctionSkips:'3',auctionCap:'unlimited',auctionBudget:1800};
const S={page:'home',carouselIndex:0,accountName:storeGet('localStorage','ki_account_name',''),accountPane:false,authUser:null,authForm:null,authError:'',franchise:'DB',settings:{...initSettings},menu:false,filter:'',rarity:'all',onlyMine:false,catalogCount:84,saga:'all',preview:null,rotX:0,rotY:0,login:false,founder:storeGet('sessionStorage','ki_founder')==='yes',sound:storeGet('localStorage','ki_sound')!=='false',music:false,
 free:null,draft:null,blind:null,tournament:null,ranking:null,rogueChoice:[],rogueOffer:null,rogueItem:null,rogueTab:'team',freePicker:false,freeSide:'a',freeSlot:0,freeSearch:'',rogueShop:[],rogueEvent:null,rogueLoot:null,battleLog:false,pack:null,battle:null,versus:null,notice:'',battleTimer:null};
if(profile.rogue&&!profile.rogue.nodes)profile.rogue=null;
if(profile.rogue&&profile.rogue.lane===undefined){ // preserve V5.2 run items and recruits; regenerate only old unlinked paths
 const r=profile.rogue; r.lane=null;r.startPower=runPower(r);r.nodes=generateZone(r.zone,r.seed);r.step=Math.max(0,Math.min(r.step,r.nodes.length-1));r.currentNode=null;
 if(r.status==='battle')r.status='map';
}
const persist=()=>storeSet('localStorage',KEY,JSON.stringify(profile));

const cId=id=>CARD_MAP.get(id);
const randomPool=()=>CARDS.filter(c=>(S.settings.saga==='all'||c.series===S.settings.saga)&&RARITIES[c.rarity].sort<=RARITIES[S.settings.max].sort);
function draw(seed,num=5,used=[]){const rng=seededRandom(seed),pool=randomPool();let available=pool.filter(c=>!used.includes(c.id));const out=[];for(let i=0;i<num&&available.length;i++){const rTotal=available.reduce((v,c)=>v+PACKS.standard.odds[c.rarity]/available.filter(k=>k.rarity===c.rarity).length,0);let pick=rng()*rTotal;let card=available[available.length-1];for(const c of available){pick-=PACKS.standard.odds[c.rarity]/available.filter(k=>k.rarity===c.rarity).length;if(pick<=0){card=c;break;}}out.push(card);available=available.filter(c=>c.id!==card.id);}return out;}
const seriesName={DB:'DRAGON BALL',DBZ:'DRAGON BALL Z',DBS:'DRAGON BALL SUPER'};
const portraitSvg=c=>{
 const hash=[...c.id].reduce((n,v)=>(Math.imul(n,33)+v.charCodeAt(0))>>>0,17);
 const palettes={common:['#c1cee2','#415771'],uncommon:['#78e9ba','#155e5b'],rare:['#7acfff','#214e9a'],epic:['#bfa9ff','#4c318c'],legendary:['#ffe4a0','#bd571f']},[p,q]=palettes[c.rarity];
 const skin=c.kit==='regen'?'#99c493':c.kit==='god'?'#c3a4d5':c.kit==='demon'?'#a9b3b4':['#e8bd9d','#ba907e','#efcbad','#d9a082'][hash%4];
 const hair=c.kit==='god'?'#d3d7ff':c.kit==='regen'?'#587b71':c.rarity==='legendary'?'#f9d983':hash%3===0?'#f4d480':'#161e31';
 const gi=hash%3===0?'#eb813d':hash%3===1?'#3a5fad':'#4d6f5a';
 const initials=String(c.name).split(/\s+/)[0].slice(0,6).toUpperCase();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${p}"/><stop offset="1" stop-color="${q}"/></linearGradient><radialGradient id="sun"><stop stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="300" height="420" fill="url(#bg)"/><circle cx="170" cy="158" r="180" fill="url(#sun)" opacity=".62"/><g stroke="white" stroke-opacity=".3" fill="none"><path d="M-40 340L340 70M-40 380L340 110M-40 420L340 150" stroke-width="6"/><circle cx="150" cy="190" r="130" stroke-width="2"/><circle cx="150" cy="190" r="165" stroke-width="1"/></g><path d="M28 420Q38 279 118 269L191 270Q270 300 286 420Z" fill="${gi}" stroke="#1a214b" stroke-opacity=".5" stroke-width="5"/><path d="M127 253V296L150 322L179 289V247" fill="${skin}"/><ellipse cx="152" cy="186" rx="70" ry="98" fill="${skin}"/><path d="M82 185L67 110L105 135L95 50L131 99L150 18L173 100L218 51L206 139L250 93L223 190L202 115Q152 85 101 134Z" fill="${hair}" stroke="#1d2643" stroke-width="3"/><path d="M111 189L135 183M170 183L195 189" stroke="#1b2737" stroke-width="7" stroke-linecap="round"/><path d="M122 207L140 206M167 206L184 207" stroke="#fff" stroke-width="4"/><path d="M155 217L148 239L157 239" stroke="#99665d" stroke-width="3" fill="none"/><path d="M136 257Q153 262 172 254" stroke="#99665d" stroke-width="4" fill="none"/><path d="M54 362L255 300" stroke="#fff" stroke-opacity=".09" stroke-width="32"/><text x="150" y="387" fill="white" opacity=".13" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="54">${esc(initials)}</text></svg>`;
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
};
const assetSrc=path=>globalThis.KI_EMBEDDED_ASSETS?.[path]||new URL(path,document.baseURI).href;
const CONCEPT_ART={goku:'goku',vegeta:'vegeta',gohan:'gohan',piccolo:'piccolo',freezer:'frieza',frieza:'frieza',broly:'broly',buu:'buu',boo:'buu',trunks:'trunks'};

function cardsForFranchise(){
 const id=S.franchise||'DB';
 if(id==='DB')return CARDS.map(c=>({...c,portrait:c.portrait||`assets/portraits-db/${c.id}.webp`}));
 const heroes=survivalCatalog(id).heroes;
 return heroes.map(h=>({id:h.id,name:h.name,form:h.form,version:h.form,series:h.series||id,rarity:h.rarity,attack:h.attack,maxHp:h.maxHp,speed:h.speed,effects:(h.effects||h.signature||[]).map((e,i)=>({...e,key:h.id+':'+i,description:e.description||e.name||''})),portrait:h.portrait,price:Math.round((h.attack+h.maxHp+h.speed)/3),power:h.attack+h.maxHp+h.speed,kit:'fighter'}));
}
function art(c){const who=c.name.toLowerCase();const key=Object.keys(CONCEPT_ART).find(x=>who.includes(x));const portrait=c.portrait||`assets/portraits-db/${c.id}.webp`;const local=portrait||(key?`assets/theme/${CONCEPT_ART[key]}.webp`:APPROVED_IMAGES[c.id])||`assets/stylized/${c.id}.svg`;return `<img class="art-img" loading="lazy" src="${esc(assetSrc(local))}" onerror="this.onerror=null;this.src='${portraitSvg(c)}'" alt="Portrait de ${esc(c.name)}">`;}

function led(c,i,used=[]){const e=c.effects[i],detail=`${e.name} · ${e.description}`;const icon=({shield:'⬡',team_shield:'⬡',intercept:'⬡',dodge:'↶',counter:'↶',heal_ally:'✚',regen:'✚',revive:'✚',transform:'✦',finisher:'✹',aoe:'✹',sacrifice:'✹',extra_strike:'⚔',critical:'⚔',stun:'ϟ',weaken:'ϟ',team_buff:'✦'}[e.type]||'◆');const kind=({shield:'def',team_shield:'def',intercept:'def',dodge:'speed',counter:'speed',heal_ally:'heal',regen:'heal',revive:'heal',finisher:'ult',aoe:'ult',sacrifice:'ult',transform:'ult'}[e.type]||'attack');return `<button class="ability-led led-${kind} ${used.includes(e.key)?'is-used':''}" style="--d:${i*50}ms" data-tip="${esc(detail)}" aria-label="${esc(detail)}" title="${esc(detail)}">${icon}</button>`;}
function card(c,{small=false,action='',locked=false,hide=false,tag='',showPrice=false,uidTag='',usedEffects=[],hideStat=null}={}){
 if(!c)return `<div class="ki-card empty-slot"><span>＋</span></div>`;
 const attr=action?`data-action="${action}" data-id="${esc(c.id)}"`:'';
 return `<div class="ki-card rarity-${c.rarity} ${small?'small':''} ${locked?'unowned':''} ${hide?'face-down':''}" ${attr} ${uidTag?`data-unit="${esc(uidTag)}"`:''} tabindex="${action?'0':'-1'}" style="--rare:${RGB[c.rarity]}">
  <div class="ki-card-shell"><div class="card-pattern"></div><div class="card-rarity-foil"></div>${art(c)}<div class="art-vignette"></div>
  <span class="stat-bubble stat-atk"><i aria-hidden="true">✦</i><b aria-label="Attaque">${hideStat==='attack'?'?':c.attack}</b></span>
  <span class="stat-bubble stat-vit"><i aria-hidden="true">➤</i><b aria-label="Vitesse">${hideStat==='speed'?'?':c.speed}</b></span>
  <span class="stat-bubble stat-hp"><i aria-hidden="true">♥</i><b aria-label="Points de vie">${hideStat==='maxHp'?'?':c.maxHp}</b></span>
  ${showPrice?`<div class="ki-price">${c.price} KI</div>`:''}
  <div class="card-name"><b>${esc(c.name)}</b><span><strong>${esc(c.series)}</strong> · ${esc(c.form)}</span></div>
  </div><div class="led-rail">${c.effects.map((_,i)=>led(c,i,usedEffects)).join('')}</div>
  ${tag?`<span class="card-sticker">${esc(tag)}</span>`:''}
  ${hide?'<div class="mystery">?</div>':''}
 </div>`;
}
const modes=[['rogue','∞','ROGUE ONE V8','Survie infinie historique','gold'],['free','⚡','TEAM ×5','Tirage instantané','aqua'],['draft','◈','DRAFT BUDGET','Recrute malin','orange'],['blind','◉','ENCHÈRES','15 lots · +5 KI','violet'],['tournament','♛','TOURNOI','Brackets auto','lime'],['ranking','☷','BLIND RANKING','Classe à l’aveugle','pink'],['versus','↗','PLUS OU MOINS','Mini-jeu express','blue']];
const act=(title,name,cl='primary',attrs='')=>`<button class="btn ${cl}" data-action="${name}" ${attrs}>${title}</button>`;
const nav=(page,content,extra='')=>`<button class="nav-tile ${S.page===page?'selected':''}" data-action="nav" data-page="${page}">${content}${extra}</button>`;
function shell(content){
 return `<div class="app-shell ${S.page==='rogue'?'is-rogue-page':''} ad-page-${S.page}"><header class="masthead"><button class="wordmark" data-action="nav" data-page="home"><span class="ki-burst">★</span><b>KI<span>ARENA</span></b></button>
 <nav class="desk-nav">${nav('home','JOUER')}${nav('collection','CARTES')}${nav('profile','PROFIL')}</nav>
 ${(['survival','rogue'].includes(S.page)||S.page==='battle'&&S.battle?.back==='rogue')?`<div class="game-shortcuts"><button data-gui="map" title="Carte du monde · M">⌁ <span>Carte</span></button>${S.page!=='battle'?'<button data-gui="inventory">▣ <span>Sac</span></button>':''}</div>`:''}<div class="head-right"><span class="ad-local-indicator"><i></i> LOCAL</span><button class="icon-btn" data-action="nav" data-page="profile" aria-label="Profil">☻</button></div></header>
 <main>${content}</main><footer><span>KI ARENA V9 · LOCAL</span><span>Dragon Ball · Z · Super</span><span>Jeu de fans · non officiel</span></footer>
 <nav class="mobile-nav">${nav('home','✦','<small>JOUER</small>')}${nav('collection','▣','<small>CARTES</small>')}${nav('profile','◉','<small>PROFIL</small>')}</nav></div>${modal()}<div class="toast" id="toast" aria-live="polite"></div>`;
}

function hero(){
 const a=cId('goku-dbs-ultra-instinct-maitrise')||CARDS.find(x=>x.name.toLowerCase().includes('goku'));
 return `<section class="v5-hero"><div class="hero-orbs"><i>★</i><i>★★</i><i>★</i></div><div class="v5-hero-copy"><div class="v5-kicker">LA GRANDE ARCADE DRAGON BALL</div><div class="v5-mega-logo">KI<span>ARENA</span><b>✦</b></div><p>COLLECTE. COMPOSE. COMBATS.</p><div class="hero-actions">${act('▶ JOUER','nav','primary','data-page="free"')}${act('◎ SOLO ROGUELIKE','nav','outline','data-page="rogue"')}${act('↓ INSTALLER','installApp','outline')}</div><div class="hero-mini-stats"><span>✦ ${CARDS.length} CARTES</span><span>⚔ 7 MODES</span><span>◆ 5 RARETÉS</span></div></div><div class="v5-hero-figure"><div class="hero-energy"></div><div class="hero-portrait"><img class="hero-keyart" src="assets/theme/hero-goku.webp" alt="Guerrier Saiyan — illustration conceptuelle"></div></div></section>`;
}
function home(){
 const visuals={rogue:'rogue',free:'fight',draft:'draft',blind:'collection',tournament:'tournament',ranking:'collection',versus:'fight'};
 const desc={rogue:'Cinq combattants actifs, des chemins connectés et des KO définitifs. Prépare ton sac et pars à l’aventure.',free:'Deux équipes tirées en un instant. Ajuste les combattants puis regarde le duel.',draft:'Construis ton équipe en respectant ton budget de KI.',blind:'Deux joueurs, des mises et une seule carte à remporter à chaque enchère.',tournament:'Huit équipes. Un tableau à élimination. Un champion.',ranking:'Place chaque carte avant de découvrir la suivante.',versus:'Compare les statistiques et enchaîne les bonnes réponses.'};
 const m=modes[S.carouselIndex];
 return `<section class="ad-home" style="--home-scene:url('${assetSrc('assets/v9/wilderness.webp')}');--home-hero:url('${assetSrc('assets/theme/hero-goku.webp')}')"><div class="ad-home-copy"><span class="ad-kicker"><i></i> L’AVENTURE COMMENCE ICI</span><h1>UNE ÉQUIPE.<br>UN <em>GRAND VOYAGE.</em></h1><p>Compose ton deck, équipe tes combattants<br>et écris ta prochaine aventure.</p><div class="ad-home-actions">${act('SURVIE INFINITY <span>→</span>','nav','primary','data-page="survival"')}<span>DB · HxH · Naruto · One Piece · édition Arène</span></div><div class="fr-hangar" style="${franchiseCssVars(S.franchise||'DB')}"><small>HANGAR DES MONDES · ÉDITION ARÈNE</small><div class="fr-hangar-grid">${FRANCHISE_IDS.map(id=>{const f=FRANCHISES[id];const on=(S.franchise||'DB')===id;return `<button type="button" class="fr-tile ${on?'on':''}" data-action="setFranchise" data-id="${id}" style="--fr:${f.color};--fa:${f.accent}"><b>${f.icon} ${f.name}</b><span>${f.tagline}</span></button>`;}).join('')}</div><p class="fr-hangar-hint">Choisis un monde : Survie Infinity et la collection suivent ses couleurs.</p></div><div class="ad-home-facts"><span><b>5 + 3</b> personnages & armes</span><span><b>3</b> places au départ</span><span><b>∞</b> vagues à affronter</span></div></div><div class="ad-home-art" aria-hidden="true"></div><div class="ad-home-stamp"><span>V9 • LOCAL</span><b>JOUE À TON RYTHME</b><small>Sans compte · Sans connexion</small></div></section>
 <button class="ad-auto5-entry" data-action="nav" data-page="auto5"><span>5 <i>VS</i> 5</span><div><b>COMBAT AUTO · ÉQUIPE LIBRE</b><small>Choisis tes cinq combattants. Retrouve le moteur classique.</small></div><strong>COMPOSER →</strong></button><div class="ad-section-title"><div><span class="ad-kicker">L’ARCADE DRAGON BALL</span><h2>À chaque envie, son défi.</h2></div><span>7 modes classiques préservés</span></div>
 <section class="ad-arcade"><div class="v51-mini-modes" role="group" aria-label="Tous les modes">${modes.map(([key,symbol,name],i)=>`<button data-action="carouselSelect" data-index="${i}" class="${i===S.carouselIndex?'active':''}" aria-pressed="${i===S.carouselIndex}"><span>${symbol}</span><b>${esc(name)}</b><i>↗</i></button>`).join('')}</div><section class="v51-slide" style="--slide:url('${assetSrc('assets/theme/tile-'+visuals[m[0]]+'.webp')}')"><div class="v51-slide-copy"><small>${m[0]==='rogue'?'LE ROGUELIKE HISTORIQUE':'MODE ARCADE '+String(S.carouselIndex+1).padStart(2,'0')}</small><h1>${esc(m[2])}</h1><p>${esc(desc[m[0]])}</p>${act(profile.rogue&&m[0]==='rogue'?'REPRENDRE L’AVENTURE →':'JOUER →','nav','primary',`data-page="${m[0]}"`)}</div><div class="v51-switch"><button data-action="carouselPrev" aria-label="Jeu précédent">‹</button><span>${modes.map((_,i)=>`<i class="${i===S.carouselIndex?'on':''}"></i>`).join('')}</span><button data-action="carouselNext" aria-label="Jeu suivant">›</button></div></section></section>
 <button class="ad-collection" data-action="nav" data-page="collection"><span>▣</span><div><small>LA COLLECTION ORIGINALE</small><b>600 cartes. Tes finitions préférées.</b></div><strong>EXPLORER LES CARTES →</strong></button>`;
}

function settingsBar(kind){return `<div class="settings-wrap"><button class="settings-toggle" data-action="toggleSettings">⚙ RÈGLES <span>${kind==='blind'?`${S.settings.auctionRounds} LOTS · 2 JOUEURS`:`${S.settings.size} VS ${S.settings.size} · CANON`}</span><b>${S.menu?'−':'+'}</b></button>${S.menu?`<div class="settings-panel">${kind==='blind'?`
 <label>MANCHES<select data-setting="auctionRounds">${[5,10,15,20,30,40].map(n=>`<option value="${n}" ${S.settings.auctionRounds===n?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>PASSES / JOUEUR<select data-setting="auctionSkips">${[['0','0'],['3','3 (défaut)'],['5','5'],['10','10'],['unlimited','ILLIMITÉES']].map(([k,v])=>`<option value="${k}" ${S.settings.auctionSkips===k?'selected':''}>${v}</option>`).join('')}</select></label>
 <label>TAILLE D'ÉQUIPE<select data-setting="auctionCap">${[['unlimited','SANS LIMITE'],['3','3'],['5','5'],['9','9']].map(([k,v])=>`<option value="${k}" ${S.settings.auctionCap===k?'selected':''}>${v}</option>`).join('')}</select></label>
 <label>BUDGET / JOUEUR<select data-setting="auctionBudget">${[600,1200,1800,3000,6000].map(n=>`<option value="${n}" ${S.settings.auctionBudget===n?'selected':''}>${n} KI</option>`).join('')}</select></label>`:`${['rogue','ranking','versus'].includes(kind)?'':`<label>CARTES / ÉQUIPE<select data-setting="size">${[1,3,5,9].map(n=>`<option value="${n}" ${S.settings.size===n?'selected':''}>${n}</option>`).join('')}</select></label>`}
 <label>SÉRIE<select data-setting="saga">${[['all','Toutes'],['DB','DB'],['DBZ','DBZ'],['DBS','DBS']].map(([v,n])=>`<option value="${v}" ${S.settings.saga===v?'selected':''}>${n}</option>`).join('')}</select></label><label>RARETÉ MAX<select data-setting="max">${Object.entries(RARITIES).map(([v,r])=>`<option value="${v}" ${S.settings.max===v?'selected':''}>${r.label}</option>`).join('')}</select></label>
 ${kind==='draft'?`<label>ADVERSAIRE<select data-setting="opponent"><option value="cpu" ${S.settings.opponent==='cpu'?'selected':''}>CPU</option><option value="local" ${S.settings.opponent==='local'?'selected':''}>2 JOUEURS</option></select></label>`:''}`}
 <label>ANIMATION<select data-setting="speed">${[1,2,4,8].map(n=>`<option value="${n}" ${S.settings.speed===n?'selected':''}>×${n}</option>`).join('')}</select></label></div>`:''}</div>`;}

function heading(id){const [tag,title]=modeInfo[id];return `<div class="mode-heading v5-heading"><div><span class="eyebrow dark">${tag}</span><h1>${title}</h1></div>${act('← JOUER','nav','outline','data-page="home"')}</div>${settingsBar(id)}`;}

function team(cards,sz=5,{hide=false,click='',price=false}={}){return `<div class="team-cards">${Array.from({length:sz},(_,i)=>cards?.[i]?card(cards[i],{small:true,hide,action:click,showPrice:price}):`<div class="ki-card empty-slot"><span>＋</span></div>`).join('')}</div>`;}
function free(){const edit=S.freePicker;const list=edit?randomPool().filter(c=>(`${c.name} ${c.series} ${c.form}`).toLowerCase().includes(S.freeSearch.toLowerCase())).slice(0,32):[];
 return `${heading('free')}<div class="arena-panel two-teams"><div class="team-header"><b>TEAM ORANGE</b><span>LIBRE</span></div><div class="team-header opponent"><b>TEAM BLEUE</b><span>LIBRE</span></div><div class="team-area">${team(S.free?.a,S.settings.size)}</div><div class="vs-circle">VS</div><div class="team-area">${team(S.free?.b,S.settings.size)}</div></div><div class="controls-row">${act('↻ TIRER 2 TEAMS','freeRoll','outline')}${act('✎ MODIFIER ORANGE','freeEdit','outline','data-side="a"')}${act('✎ MODIFIER BLEUE','freeEdit','outline','data-side="b"')}${act('⚔ LANCER LE COMBAT','freeFight','primary',S.free?'':'disabled')}</div>${edit?`<section class="free-editor"><div class="section-inline"><h2>COMPOSE TA <em>TEAM ${S.freeSide==='a'?'ORANGE':'BLEUE'}</em></h2>${act('× FERMER','freeClose','outline')}</div><div class="controls-row"><label>EMPLACEMENT <select id="freeSlotSelect">${Array.from({length:S.settings.size},(_,i)=>`<option value="${i}" ${S.freeSlot===i?'selected':''}>${i+1} · ${esc(S.free[S.freeSide][i]?.name||'VIDE')}</option>`).join('')}</select></label><input id="freeCardSearch" placeholder="⌕ CHERCHER PAR NOM OU VERSION" value="${esc(S.freeSearch)}"></div><div class="collection-grid free-select-grid">${list.map(c=>card(c,{small:true,action:'freeChoose'})).join('')}</div></section>`:''}`;}

function newFree(){S.free={a:draw(uid()+'A',S.settings.size),b:draw(uid()+'B',S.settings.size)};}
function startDraft(){S.draft={teams:[[],[]],budgets:[Math.round(120*S.settings.size),Math.round(120*S.settings.size)],player:0,index:0,offers:[],seed:uid(),rerolls:[1,1],local:S.settings.opponent==='local'};draftOffers();}
function draftOffers(){const d=S.draft;if(!d)return;const player=d.player,team=d.teams[player],budget=d.budgets[player],left=S.settings.size-team.length,pool=randomPool();if(!left)return;
 const minPrice=Math.min(...pool.map(c=>c.price));let all=pool.filter(c=>c.price<=budget-minPrice*(left-1)&&!team.some(x=>x.id===c.id));
 if(all.length<3)all=pool.filter(c=>c.price<=budget&&!team.some(x=>x.id===c.id));
 const rng=seededRandom(d.seed+':'+d.index+':'+d.rerolls[player]);d.offers=[];
 for(let i=0;i<3&&all.length;i++)d.offers.push(all.splice(Math.floor(rng()*all.length),1)[0]);
}
function draft(){const d=S.draft,p=d.player,local=d.local,done=d.teams[0].length===S.settings.size&&(!local||d.teams[1].length===S.settings.size);
 return `${heading('draft')}<div class="draft-bar"><div><small>${local?'JOUEUR '+(p+1)+' · ':''}BUDGET DISPONIBLE</small><b>◈ ${d.budgets[p]} <i>KI</i></b></div><div class="progress-dots">${Array.from({length:S.settings.size},(_,i)=>`<span class="${i<d.teams[p].length?'filled':''}"></span>`).join('')}</div><div><small>${local?'2 JOUEURS LOCAUX':'CONTRE LE CPU'}</small><b>${done?'PRÊT':`${d.teams[p].length+1} / ${S.settings.size}`}</b></div></div>
 <div class="sub-head">${done?'LES ÉQUIPES SONT PRÊTES':`JOUEUR ${p+1} · CHOISIS UNE CARTE`}</div>
 <div class="offer-row">${done?team(d.teams[0],S.settings.size):d.offers.map(c=>`<div class="offer-item">${card(c,{small:true,showPrice:true})}${act('RECRUTER','draftPick','mini','data-id="'+esc(c.id)+'"')}</div>`).join('')}</div>
 ${done&&local?`<div class="sub-head">ÉQUIPE JOUEUR 2</div>${team(d.teams[1],S.settings.size)}`:''}
 <div class="controls-row">${act('↻ RECOMMENCER','draftReset','outline')}${!done?act('⟳ RELANCE '+d.rerolls[p],'draftReroll','outline',d.rerolls[p]?'':'disabled'):act('⚔ DÉMARRER LE COMBAT','draftFight','primary')}</div>`;
}
function startBlind(){S.blind=createAuction(randomPool(),{seed:uid(),rounds:S.settings.auctionRounds,budget:S.settings.auctionBudget,skips:S.settings.auctionSkips,teamLimit:S.settings.auctionCap});}
function blind(){const a=S.blind||createAuction(randomPool()),c=a.current,turn=c?.turn??0,done=a.complete;
 const snap=(p)=>`<div class="v51-auction-player ${!done&&turn===p?'now':''}"><div class="v51-player-title"><span>JOUEUR ${p+1}</span><b>${a.budgets[p]} KI</b></div><small>${a.teams[p].length} CARTES · ${a.skipsLimit===Infinity?'∞':Math.max(0,a.skipsLimit-a.skipsUsed[p])} PASSES</small><div class="auction-roster">${a.teams[p].slice(-12).map(x=>`<span class="auction-mini rarity-${x.rarity}" title="${esc(x.name)} · ${esc(x.form)}">${art(x)}</span>`).join('')||'<span class="auction-empty">Équipe vide</span>'}</div></div>`;
 return `${heading('blind')}<div class="v51-auction-top"><b>ENCHÈRE ${Math.min(a.index+1,a.rounds)} <span>/ ${a.rounds}</span></b><span>MISE +5 KI · 2 JOUEURS</span></div>
 <div class="v51-auction-board"><div class="v51-auction-users">${snap(0)}${snap(1)}</div>
 ${done?`<div class="v51-auction-finish"><span>★ ENCHÈRES TERMINÉES</span><h2>${a.teams[0].length} <em>VS</em> ${a.teams[1].length}</h2><p>Tailles asymétriques autorisées.</p>${a.teams[0].length&&a.teams[1].length?act('⚔ COMBAT AUTOMATIQUE','blindFight','primary'):''}${act('↻ RECOMMENCER','blindReset','outline')}</div>`:
 `<div class="v51-bid-stage"><div class="v51-lot">${card(c.card,{showPrice:false})}</div><div class="v51-bid-controls"><small>CARTE ${a.index+1} · ${esc(c.card.series)} · ${esc(c.card.form)}</small><strong>${c.bid??c.base}<span> KI</span></strong><p>${c.leader===null?'MISE DE DÉPART':`JOUEUR ${c.leader+1} EN TÊTE`}</p><div class="v51-turn-cue">AU TOUR DU <b>JOUEUR ${turn+1}</b></div>
 ${act(c.leader===null?'✓ PRENDRE À '+c.base+' KI':'▲ SURENCHÉRIR +5 KI','auctionBid','primary',canBid(a,turn)?'':'disabled')}
 ${act(c.leader===null?'✕ PASSER':'✕ LAISSER LA CARTE','auctionPass','outline',canPass(a,turn)?'':'disabled')}<small>${c.leader===null?'Chaque passe initiale utilise 1 skip':'Céder une enchère engagée ne consomme pas de skip'}</small></div></div>`}
 </div><div class="v51-auction-history">${a.history.slice(-5).reverse().map(h=>`<span>${h.round}. ${esc(h.name)} <b>${h.winner===null?'INVENDU':`J${h.winner+1} · ${h.price} KI`}</b></span>`).join('')}</div>`;}

function tournament(){const t=S.tournament;return `${heading('tournament')}<div class="controls-row start">${act('8 ÉQUIPES','tournMake','outline','data-count="8"')}${act('16 ÉQUIPES','tournMake','outline','data-count="16"')}</div>${!t?`<div class="empty-state"><div class="giant-symbol">♛</div><b>PRÊT POUR LE TOURNOI ?</b><span>Choisis le nombre de participants.</span></div>`:`<div class="champion-banner">★ CHAMPION — ${esc(t.champion.name)}</div><div class="bracket">${t.rounds.map((matches,i)=>`<div class="bracket-column"><h3>${i===t.rounds.length-1?'FINALE':`ROUND ${i+1}`}</h3>${matches.map(m=>`<div class="bracket-match"><span>${esc(m.a)}</span><b class="${m.winner===m.a?'winner':''}">×</b><span>${esc(m.b)}</span><small>✓ ${esc(m.winner)}</small></div>`).join('')}</div>`).join('')}</div>`}`;}
function startRanking(){S.ranking={slots:Array(5).fill(null),cards:draw(uid(),5),index:0};}
function ranking(){const r=S.ranking,done=r.index>=r.cards.length,next=r.cards[r.index];const trueOrder=done?[...r.cards].sort((a,b)=>cardScore(b)-cardScore(a)):[];return `${heading('ranking')}<div class="ranking-stage"><div class="ranking-reveal"><div class="eyebrow">${done?'RÉSULTATS':'PERSONNAGE SUIVANT'}</div>${done?`<div class="giant-symbol">✳</div><strong>CLASSEMENT TERMINÉ</strong>`:card(next,{small:true})}</div><div class="ranking-spots"><div class="sub-head">TON TOP 5</div>${r.slots.map((c,i)=>`<button class="rank-slot ${c?'taken':''}" data-action="rankChoose" data-position="${i}" ${c||done?'disabled':''}><span>#${i+1}</span><b>${c?esc(c.name)+' · '+esc(c.form):'PLACER ICI'}</b><span>${c?'✓':'＋'}</span></button>`).join('')}</div></div>${done?`<div class="result-board"><b>CLASSEMENT RÉEL</b>${trueOrder.map((c,i)=>`<span>${i+1}. ${esc(c.name)} · ${esc(c.form)} <strong>${cardScore(c)}</strong></span>`).join('')}</div>`:''}<div class="controls-row">${act('↻ NOUVELLE PARTIE','rankingReset','outline')}</div>`;}
// Connected full-zone map. Nodes stay fixed for the whole biome; only linked
// destinations can be chosen. This surface deliberately never modifies card art.
function rogueFullMapView(run,biome){
 const length=run.nodes.length, allowed=new Set(availableNodes(run).map(n=>n.id));
 const points=run.nodes.flatMap((row,i)=>row.options.map(n=>({node:n,x:16.7+33.3*n.lane,y:78+i*112})));
 const lines=[];
 for(let i=0;i<run.nodes.length-1;i++)for(const node of run.nodes[i].options){
  for(const lane of node.links){
   if(!run.nodes[i+1].options.some(n=>n.lane===lane))continue;
   const x=16.7+33.3*node.lane,tx=16.7+33.3*lane,y=78+i*112,ty=y+112;
   const past=i<run.step-1,active=i===run.step-1&&node.lane===run.lane;
   lines.push(`<path class="ki-line ${past?'past':active?'available':''}" d="M${x*10},${y+30} C${x*10},${y+67} ${tx*10},${ty-67} ${tx*10},${ty-30}"/>`);
  }
 }
 const sceneSize=length*112+92;
 const context=encounterAssessment(run,'combat');
 const completed=run.trail||[];
 return `<section class="ki-world biome-${biome.tone}">
  <div class="ki-world-head"><div><span class="ki-overline">✦ ${esc(biome.name)} · ZONE ${run.zone}</span><h2>Choisis ton chemin</h2><p>Chaque choix écrit la suite de ton aventure.</p></div><div class="ki-world-stats"><b>ÉTAPE ${run.step+1}/${length}</b><small>INDICE KI ${Math.round(context.player*100)}</small></div></div>
  <div class="ki-world-landscape" role="img" aria-label="Paysage du biome ${esc(biome.name)}"><span class="v7-sunflare" aria-hidden="true"></span><span class="v7-fog" aria-hidden="true"></span><span class="v7-landscape-caption">✦ LE VOYAGE CONTINUE</span></div>
  <div class="ki-mapboard" aria-label="Carte et itinéraires" style="--map-height:${sceneSize}px;min-height:${sceneSize}px">
    <svg class="ki-map-lines" viewBox="0 0 1000 ${sceneSize}" preserveAspectRatio="none" aria-hidden="true">${lines.join('')}</svg>
    ${points.map(({node,x,y})=>{
      const currentStep=run.step===run.nodes.findIndex(r=>r.options.includes(node));
      const past=completed.some(x=>(typeof x==='string'?x:x?.id)===node.id);
      const enabled=allowed.has(node.id)&&run.status==='map';
      const closed= !enabled&&node.id!==run.currentNode;
      const boss=node.type==='boss';
      const rel=['combat','elite','quest','boss'].includes(node.type)?encounterAssessment(run,node.type):null;
      const title=MAP_TYPES[node.type]?.name||node.type;
      return `<button type="button" aria-label="Étape ${node.id.split(':')[1]} ${esc(title)}, ${esc(dangerRating(run,node.type))}" class="ki-mapnode ${enabled?'reachable':''} ${closed?'muted':''} ${past?'cleared':''} ${boss?'is-boss':''} ki-type-${node.type}" style="left:${x}%;top:${y}px" data-action="rogueNode" data-id="${esc(node.id)}" ${enabled?'':'disabled'}><span class="ki-mapnode-icon" aria-hidden="true">${MAP_TYPES[node.type]?.icon||'✦'}</span><strong>${esc(title)}</strong><small>${enabled?esc(dangerRating(run,node.type)):boss?'BOSS FINAL':rel?'Risque '+(rel.level+1)+'/5':'DESTINATION'}</small></button>`;
    }).join('')}
    <div class="ki-map-start" style="top:${run.step===0?18:78+(run.step-1)*112}px;left:${run.lane===null?50:16.7+33.3*run.lane}%">${run.step===0?'DÉPART':'★ VOUS ÊTES ICI'}</div>
  </div>
  <div class="ki-map-legend"><span><i class="legend-dot is-open"></i> Accessibles</span><span><i class="legend-dot is-later"></i> À venir</span><span><i class="legend-dot is-boss"></i> Boss</span></div>
 </section>`;
}
// V8 JOURNEY — a presentation layer over the exact same V6 navigable nodes.
// Three lane cards represent the actual graph row; blocked edges remain unavailable.
function rogueMapView(run,biome){
 const row=run.nodes[run.step];
 const reachable=new Set(availableNodes(run).map(x=>x.id)),options=(row?.options||[]).filter(x=>reachable.has(x.id));
 const source=run.lane===null?1:run.lane;
 const isBoss=options.length===1&&options[0].type==='boss';
 const flavors={
  combat:['Duel sur la route','Affronte un groupe de combattants.','Zénis · Recrutement'],
  elite:['Un adversaire redoutable','Un défi plus intense, pour un meilleur butin.','Butin rare · Zénis'],
  boss:['Le maître de la zone','Un affrontement décisif approche.','Zone suivante · Butin'],
  merchant:['Un marchand Capsule','Prépare ton équipe et découvre ses offres.','Objets · Équipement'],
  rest:['Un endroit paisible','Soigne tes survivants ou entraîne ton équipe.','Repos · Entraînement'],
  event:['Une étrange découverte','Une surprise t’attend au bout du chemin.','Choix · Mystère'],
  quest:['Un défi inattendu','Prends le risque d’un combat spécial.','Défi · Récompense'],
  treasure:['Une capsule mystérieuse','Un trésor caché n’attend que toi.','Objet · Relique'],
  empty:['Un passage tranquille','Avance sereinement vers la prochaine étape.','Progression']};
 const choiceArt={combat:'battle-realm.webp',elite:'battle-realm.webp',boss:'battle-realm.webp',merchant:'sky-realm.webp',rest:'sky-realm.webp',event:'sky-realm.webp',quest:'battle-realm.webp',treasure:'sky-realm.webp',empty:'sky-realm.webp'};
 const arcSvg=`<svg class="v8-branch-lines" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="v8-path-light" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fdf3ce"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>${options.map(n=>{const end=n.lane===0?165:n.lane===2?835:500;const valid=reachable.has(n.id);return `<path class="v8-path ${valid?'is-open':'is-closed'}" style="--path-delay:${.32+.1*n.lane}s" d="M${500+(source-1)*90} 235 Q${end} 100 ${end} 9"/>`}).join('')}</svg>`;
 const cards=options.map((node,i)=>{
  const meta=flavors[node.type]||flavors.event;
  const valid=run.status==='map'&&reachable.has(node.id);
  const danger=['combat','elite','boss','quest'].includes(node.type)?dangerRating(run,node.type):'Sans combat';
  const icon=MAP_TYPES[node.type]?.icon||'✦';
  return `<button class="v8-choice v8-kind-${node.type} ${valid?'is-open':'is-locked'}" style="--v8-index:${i}" data-action="rogueNode" data-id="${esc(node.id)}" ${valid?'':'disabled'} aria-label="${valid?'Choisir':'Route bloquée :'} ${esc(MAP_TYPES[node.type]?.name||node.type)}. ${esc(danger)}">
   <span class="v8-choice-art" style="background-image:url('${assetSrc('assets/v9/'+({combat:biome.tone,elite:'desert',boss:'sky',merchant:'merchant',rest:'rest',event:'event',quest:'desert',treasure:'treasure',empty:biome.tone}[node.type]||biome.tone)+'.webp')}')"><span class="v8-choice-emblem" aria-hidden="true">${icon}</span></span>
   <span class="v8-choice-body"><span class="v8-choice-kicker">${valid?'CHEMIN '+(i+1):'CHEMIN BLOQUÉ'}</span><strong>${esc(MAP_TYPES[node.type]?.name||node.type)}</strong><span class="v8-choice-hook">${esc(meta[0])}</span><span class="v8-choice-desc">${esc(meta[1])}</span><span class="v8-choice-footer"><span>${esc(danger)}</span><b>${esc(meta[2])}</b></span></span>
   <span class="v8-choice-action">${valid?'CHOISIR CETTE VOIE →':'NON ACCESSIBLE'}</span>
  </button>`;
 }).join('');
 return `<section class="v8-journey biome-${biome.tone}" aria-label="Choisir le prochain chemin">
   <div class="v8-scene-layer"><div class="v8-world-scene">
    <div class="v8-sky-motion" aria-hidden="true"></div>
    <div class="v8-travel-caption"><small>✦ ${esc(biome.name)} · ZONE ${run.zone}</small><h2>${isBoss?'LE BOSS VOUS ATTEND':'LE VOYAGE CONTINUE'}</h2><p>${isBoss?'Une dernière épreuve avant la prochaine zone.':`${options.length} chemin${options.length>1?'s':''} accessible${options.length>1?'s':''}. À toi de choisir la suite.`}</p></div>
    <div class="v8-trail-scene">${arcSvg}<div class="v8-walker"><span class="v8-walker-image" aria-hidden="true"></span><span>VOUS ÊTES ICI</span></div>${options.map((n,i)=>`<span class="v8-waymark ${reachable.has(n.id)?'':'closed'}" style="--lane:${i};--v8-index:${i}">${MAP_TYPES[n.type]?.icon||'✦'}</span>`).join('')}</div>
   </div>
   <div class="v8-select-header"><span><b>${isBoss?'LE DERNIER CHEMIN':'CHOISIS TA DESTINATION'}</b><small>${isBoss?'Le passage vers le boss est ouvert.':'Survole une carte pour éclairer le chemin correspondant.'}</small></span><span class="v8-step-chip">ÉTAPE ${run.step+1} / ${run.nodes.length}</span></div>
   <div class="v8-choice-grid v8-choice-count-${options.length} ${isBoss?'v8-single-choice':''}">${cards}</div></div>
   <details class="v8-fullmap"><summary>⌁ Voir la carte complète de cette zone <span>↗</span></summary>${rogueFullMapView(run,biome)}</details>
  </section>`;
}

function rogueEncounterPreview(run){const p=run.pending||{},enemy=encounterEnemies(run,p.fightType||'combat');const boss=p.fightType==='boss'?bossArchetype(run):null;const danger=encounterAssessment(run,p.fightType||'combat');
 return `<section class="ki-encounter v7-scene-combat ${boss?'v7-scene-boss':''}"><div class="ki-overline">⚔ AVANT LE COMBAT · ${esc(dangerRating(run,p.fightType))}</div><h2>${boss?esc(boss.name):p.fightType==='elite'?'ÉLITE EN APPROCHE':'UN COMBAT SE PRÉPARE'}</h2><p>${boss?esc(boss.desc):'Observe les adversaires et prépare ton équipe avant de te lancer.'}</p><div class="ki-preview-bar"><span>MENACE <b>${Math.round(danger.relative*100)} %</b> de la puissance active estimée</span><span>EN FACE <b>${enemy.length} COMBATTANTS</b></span></div><div class="ki-roster-preview">${enemy.map(c=>`<div class="v7-enemy-unit"><div class="v7-enemy-portrait">${art(c)}</div><b>${esc(c.name)}</b><small>${esc(c.form||'')} · ${esc(c.rarity)}</small></div>`).join('')}</div>${boss?`<div class="ki-boss-intel">◈ INDICE DU BOSS : <strong>${esc(boss.clue)}</strong> · Phase 2 sous pression</div>`:''}<div class="ki-preview-actions">${act('⚔ ENTRER DANS L’ARÈNE','rogueFight','primary')}${p.fightType!=='boss'?act('↩ RETRAITE : 45 ZÉNIS','rogueEscape','outline',run.gold>=45?'':'disabled'):''}</div><p class="ki-fineprint">L’équipe combat automatiquement. Les KO restent définitifs durant cette run, sauf résurrection explicite.</p></section>`;}

function rogueLastRun(){
 const h=Array.isArray(profile.history)?profile.history[0]:null;
 if(!h)return '';
 return `<section class="v7-last-run" aria-label="Bilan de la dernière aventure"><div><span>✦ DERNIÈRE AVENTURE</span><h2>Chaque run écrit son histoire.</h2><p>Tu peux repartir avec une nouvelle équipe et tenter de dépasser ton record.</p></div><div class="v7-last-run-metrics"><div><b>${Math.max(1,Number(h.zone)||1)}</b><small>Zone atteinte</small></div><div><b>${Math.max(0,Number(h.combats)||0)}</b><small>Victoires</small></div><div><b>${Math.max(0,Number(h.bosses)||0)}</b><small>Boss vaincus</small></div><div><b>${Math.max(0,Number(h.packs)||0)}</b><small>Packs collectés</small></div></div></section>`;
}
function rogue(){
 const run=profile.rogue,owned=Object.keys(profile.owned).map(cId).filter(Boolean),st=run?.status;
 if(!run) return `${heading('rogue')}<section class="rogue-intro"><div class="rogue-intro-copy"><span class="orbit">✷ SURVIE INFINIE</span><h2>ENCORE<br><em>UNE ZONE.</em></h2><p>5 cartes · 1 vie · des récompenses croissantes</p><div class="rogue-mini-metrics"><span>RECORD <b>${profile.bestZone||0}</b> ZONES</span><span>ÉQUIPE <b>${S.rogueChoice.length}/5</b></span></div>${act('COMMENCER LA RUN ↗','rogueStart','primary',S.rogueChoice.length===5?'':'disabled')}</div><div class="seven-orbs">${Array.from({length:7},(_,i)=>`<i style="--n:${i}">★</i>`).join('')}</div></section><div class="section-inline"><h2>TON ÉQUIPE <em>DE DÉPART</em></h2><small>UNIQUEMENT LES CARTES POSSÉDÉES</small></div><div class="collection-grid rogue-select">${owned.map(c=>card(c,{small:true,action:'roguePick',tag:S.rogueChoice.includes(c.id)?'✓ CHOISI':''})).join('')}</div>${rogueLastRun()}`;
 const choice=run.nodes[run.step],biome=BACKGROUNDS[(run.zone-1)%BACKGROUNDS.length],bonuses=globalBonuses(run);
 const collected=run.earnedPacks.length;
 const activeAlive=run.teamIds.filter((id,i)=>(run.hpRatios[i]??0)>0).length;
 const top=`<div class="v7-hud" role="region" aria-label="État de votre aventure">
   <div class="v7-hud-brand"><span class="v7-hud-crest">✦</span><div><small>ROGUE ONE · SURVIE INFINIE</small><strong>${esc(biome.name)}</strong><span>Zone ${run.zone} · Étape ${Math.min(run.step+1,run.nodes.length)}/${run.nodes.length}</span></div></div>
   <div class="v7-hud-right">
     <div class="v7-hud-stat zeni" aria-label="${run.gold} zénis"><i>◉</i><strong>${run.gold}</strong><small>Zénis</small></div>
     <div class="v7-hud-stat" aria-label="${collected} packs"><i>▣</i><strong>${collected}</strong><small>Packs</small></div>
     <div class="v7-hud-stat ball" aria-label="${run.dragonBalls||0} Dragon Balls sur 7"><i>✷</i><strong>${run.dragonBalls||0}<small>/7</small></strong><small>Dragon Balls</small></div>
     <div class="v7-hud-stat alive" aria-label="${activeAlive} personnages vivants"><i>✚</i><strong>${activeAlive}<small>/5</small></strong><small>Survivants</small></div>
   </div>
   <div class="v7-hud-path" aria-label="Progression de la zone">${run.nodes.map((row,i)=>`<div class="v7-hud-step ${i<run.step?'done':i===run.step?'now':''}" title="${i===run.nodes.length-1?'Boss':`Étape ${i+1}`}" aria-label="${i===run.nodes.length-1?'Boss':`Étape ${i+1}`}"><span>${i<run.step?'✓':i===run.nodes.length-1?'♛':i===run.step?'◆':''}</span></div>`).join('')}</div>
 </div>`;
 const myTeam=`<div class="section-inline"><h2>LA TEAM <em>×5</em></h2><span class="tiny-tag">${run.reserves.length}/${reserveCapacity(run)} EN RÉSERVE</span></div><div class="rogue-party">${run.teamIds.map((id,i)=>`<div class="party-slot">${card(cId(id),{small:true})}<div class="persistent-hp"><span style="width:${Math.round(run.hpRatios[i]*100)}%"></span></div><small>${Math.round(run.hpRatios[i]*100)}% PV</small></div>`).join('')}${run.teamIds.length<5?`<div class="party-slot ki-vacant">☠ <small>${5-run.teamIds.length} emplacement(s) libre(s)</small></div>`:''}</div>${run.fallen?.length?`<div class="ki-fallen">☠ ${run.fallen.length} KO DÉFINITIF : ${run.fallen.map(id=>esc(cId(id)?.name||id)).join(', ')} · Résurrection uniquement avec un objet ou un repos spécial.</div>`:''}${run.reserves.length?`<div class="sub-head">RENFORTS · TOUCHER POUR REMPLACER</div><div class="offer-row">${run.reserves.map(id=>`<div class="offer-item">${card(cId(id),{small:true})}<div class="swap-buttons">${Array.from({length:5},(_,i)=>act(`↔ ${i+1}`,'rogueSwap','mini',`data-id="${id}" data-index="${i}"`)).join('')}</div></div>`).join('')}</div>`:''}`;
 const previewTeam=`<div class="v7-team-preview"><div class="v7-panel-title"><span>⚔ TON ESCOUADE</span><small>${activeAlive} SURVIVANTS</small></div><div class="v7-mini-team">${run.teamIds.map((id,i)=>{const c=cId(id);return c?`<div class="v7-mini-fighter ${run.hpRatios[i]<=0?'is-ko':''}" title="${esc(c.name)} · ${Math.round(run.hpRatios[i]*100)}% PV"><div class="v7-mini-art">${art(c)}</div><div class="v7-mini-data"><b>${esc(c.name)}</b><div class="v7-hpbar"><span style="width:${Math.round(run.hpRatios[i]*100)}%"></span></div><small>${Math.round(run.hpRatios[i]*100)}% PV</small></div></div>`:''}).join('')}</div><div class="v7-item-preview"><span>✦ ${run.relics.length} RELIQUES</span><span>▣ ${run.inventory.reduce((n,i)=>n+i.quantity,0)} OBJETS</span></div></div>`;
 const inventory=`<details open class="inventory-panel" ${['reward','recruit','battle_pending','wish'].includes(st)?'inert':''}><summary>🎒 SAC & RELIQUES <b>${run.inventory.reduce((n,i)=>n+i.quantity,0)+run.relics.length+Object.values(run.gear).reduce((n,g)=>n+Object.keys(g).length,0)}</b></summary><div class="inv-grid">${run.relics.map(id=>{const it=RELICS.find(x=>x.id===id);return it?`<div class="item-token relic"><b>${it.icon} ${esc(it.name)}</b><small>${esc(it.desc)}</small></div>`:''}).join('')}${run.inventory.map(slot=>{const it=ALL_ITEMS.find(x=>x.id===slot.id);return it?`<div class="item-token ${GEAR.some(g=>g.id===it.id)?'gear':'consumable'}"><b>${it.icon} ${esc(it.name)} ×${slot.quantity}</b><small>${esc(it.desc)}</small>${GEAR.some(x=>x.id===it.id)?act('ÉQUIPER','rogueGear','mini',`data-id="${it.id}"`):it.id==='revival_senzu'&&run.fallen.length?run.fallen.map(fid=>act(`RÉANIMER ${esc(cId(fid)?.name||fid)}`,'rogueConsume','mini',`data-id="${it.id}" data-fallen="${fid}"`)).join(''):act('UTILISER','rogueConsume','mini',`data-id="${it.id}"`)}</div>`:''}).join('')}${Object.entries(run.gear).flatMap(([id,slots])=>Object.values(slots).map(x=>{const it=GEAR.find(z=>z.id===x);return it?`<div class="item-token equipped"><b>${it.icon} ${esc(it.name)}</b><small>Équipé : ${esc(cId(id)?.name||id)}</small></div>`:''})).join('')}</div>${S.rogueItem?`<div class="inv-equip-picker"><b>ÉQUIPER ${esc(ALL_ITEMS.find(x=>x.id===S.rogueItem)?.name||'')}</b><div class="controls-row">${run.teamIds.map((id,i)=>act(`${i+1}. ${esc(cId(id).name)}`,'rogueGearTo','mini',`data-id="${id}"`)).join('')}</div></div>`:''}</details>`;
 let interaction='';
 if(st==='map')interaction=rogueMapView(run,biome);
 if(st==='preview'||st==='battle_pending')interaction=rogueEncounterPreview(run);
 if(st==='recruit')interaction=`<div class="reward-compact"><span class="orbit">✷ VICTOIRE</span><h2>UNE NOUVELLE <em>RECRUE ?</em></h2><p>+${run.pending.gold} zénis · ${run.pending.obtained.length} pack(s) de fin de run</p><div class="offer-row">${run.pending.candidates.slice(0,5).map(id=>`<div class="offer-item">${card(cId(id),{small:true})}${act('RECRUTER','rogueRecruit','mini',`data-id="${id}"`)}</div>`).join('')}</div>${S.rogueOffer?`<div class="replace-row">REMPLACER UNE CARTE : ${run.teamIds.map((id,i)=>act(`${i+1}. ${esc(cId(id).name)}`,'rogueRecruitReplace','mini',`data-index="${i}"`)).join('')}</div>`:''}<div class="controls-row">${act('IGNORER ET CONTINUER →','rogueSkipRecruit','outline')}</div></div>`;
 if(st==='wish')interaction=`<section class="v51-wish"><span>✦ ✦ ✦ ✦ ✦ ✦ ✦</span><h2>SHENRON</h2><p>Choisis ton vœu.</p><div class="controls-row">${act('✚ SOIGNER TOUTE LA TEAM','rogueWish','primary','data-wish="heal"')}${act('✦ +1 PLACE DE RÉSERVE','rogueWish','outline','data-wish="reserve"')}${act('✷ 2 PACKS OR','rogueWish','outline','data-wish="packs"')}</div></section>`;
 if(st==='reward')interaction=`<section class="ki-reward v7-scene-reward"><div class="ki-reward-header"><span>✦ RÉCOMPENSE DE RENCONTRE</span><h2>CHOISIS TON BUTIN</h2><p>Une récompense parmi trois, ou des zénis immédiats. Les objets sont temporaires, les packs sont conservés pour le bilan.</p></div><div class="ki-reward-grid">${(run.rewardOptions||[]).map(id=>{const it=ALL_ITEMS.find(x=>x.id===id);return it?`<button class="ki-reward-card" data-action="rogueReward" data-id="${id}"><span>${it.icon}</span><strong>${esc(it.name)}</strong><small>${esc(it.desc)}</small><em>RÉCUPÉRER ↗</em></button>`:''}).join('')}</div>${act(`PRENDRE ${28+run.zone*5} ZÉNIS À LA PLACE`,'rogueRewardGold','outline')}</section>`;
 if(st==='merchant'){if(!run.pending?.shopIds)run.pending={shopIds:shopOffers(run).map(x=>x.id)};S.rogueShop=run.pending.shopIds;}
 if(st==='merchant')interaction=`<div class="section-inline"><h2>MARCHAND <em>CAPSULE</em></h2><small>◉ ${run.gold} ZÉNIS</small></div><div class="inv-grid shop-grid">${S.rogueShop.map(id=>{const it=ALL_ITEMS.find(x=>x.id===id);return `<div class="item-token"><span class="item-bigicon">${it.icon}</span><b>${esc(it.name)}</b><small>${esc(it.desc)}</small>${act(`◉ ${it.price} · ACHETER`,'rogueBuy','mini',`data-id="${id}" ${run.gold<it.price?'disabled':''}`)}</div>`;}).join('')}</div>${act('REPRENDRE LA ROUTE →','rogueDoneNode','primary')}`;
 if(st==='event'){const e=run.pending?.event||S.rogueEvent;
 interaction=`<section class="ki-event-choice v7-scene-event"><span class="ki-overline">✦ UNE RENCONTRE INATTENDUE</span><div class="ki-event-cover"><div class="ki-event-symbol">${e?.icon||'?'}</div><div><h2>${esc(e?.title||'Événement')}</h2><p>${esc(e?.desc||'')}</p></div></div><div class="ki-event-options">${(e?.options||[]).map(o=>`<button class="ki-event-button" data-action="rogueResolveEvent" data-choice="${o.id}" ${o.cost&&run.gold<o.cost?'disabled':''}><strong>${esc(o.title)} →</strong><small>${esc(o.detail)}</small></button>`).join('')}</div></section>`;}
 if(st==='quest')interaction=`<div class="event-feature v7-scene-quest"><span>⚑</span><div><h2>DÉFI OPTIONNEL</h2><p>Affronte une équipe d’élite pour un meilleur butin, ou poursuis ta route.</p>${act('ACCEPTER LE DUEL','rogueQuestFight','primary')} ${act('IGNORER','rogueDoneNode','outline')}</div></div>`;
 if(st==='rest')interaction=`<div class="event-feature v7-scene-rest"><span>✚</span><div><h2>HALTE RÉGÉNÉRANTE</h2><p>Choisis un seul avantage pour cette halte : soin, zénis ou résurrection.</p>${act('SOIGNER LES SURVIVANTS +35 %','rogueRest','primary','data-choice="heal"')} ${act('S’ENTRAÎNER : ZÉNIS','rogueRest','outline','data-choice="train"')} ${run.fallen?.length&&run.gold>=150?run.fallen.map(fid=>act(`RÉANIMER ${esc(cId(fid)?.name||fid)} · 150 ZÉNIS`,'rogueRest','outline',`data-choice="revive" data-fallen="${fid}"`)).join(''):''}</div></div>`;
 if(st==='treasure')interaction=`<div class="event-feature v7-scene-treasure"><span>✷</span><div><h2>CAPSULE MYSTÈRE</h2><p>Un objet ou une relique pour la suite.</p>${act('OUVRIR','rogueTreasure','primary')}</div></div>`;
 if(st==='empty')interaction=`<div class="event-feature"><span>☁</span><div><h2>ROUTE TRANQUILLE</h2><p>Profite du calme avant le prochain adversaire.</p>${act('CONTINUER','rogueDoneNode','primary')}</div></div>`;
 return `<div class="rogue-v7 rogue-v8">${top}<div class="rogue-main v7-game-layout"><div class="v7-game-screen">${interaction}</div><section class="v8-bottom-zone" aria-label="Équipe et inventaire"><details class="v8-base-drawer"><summary><span class="v8-drawer-grip"></span><span class="v8-drawer-copy"><b>ÉQUIPE · SAC · RELIQUES</b><small>Faire défiler ou toucher pour ouvrir</small></span><span class="v8-drawer-faces">${run.teamIds.map((id,i)=>{const c=cId(id);return c?`<span class="v8-drawer-face" title="${esc(c.name)} · ${Math.round(run.hpRatios[i]*100)} % PV">${art(c)}<i class="v8-mini-health" style="width:${Math.max(0,run.hpRatios[i]*100)}%"></i></span>`:''}).join('')}</span><span class="v8-drawer-chevron">⌃</span></summary><div class="v8-drawer-content v8-tab-${S.rogueTab}"><div class="v8-bag-tabs" role="group" aria-label="Équipe et sac">${[['team','Équipe'],['bag','Inventaire'],['relic','Reliques'],['objects','Objets'],['effects','Effets']].map(([id,name])=>act(name,'rogueTab',S.rogueTab===id?'primary':'outline',`data-id="${id}" aria-pressed="${S.rogueTab===id}"`)).join('')}</div>${S.rogueTab==='team'?`<div class="v8-drawer-team">${previewTeam}</div><details class="v5-team-drawer"><summary>GÉRER LES COMBATTANTS <span>OUVRIR ↓</span></summary>${myTeam}</details>`:S.rogueTab==='effects'?`<div class="v8-rules"><h3>Rogue One · tes règles d’aventure</h3><p>Cinq combattants actifs. Tes recrues attendent en réserve. Les KO sont définitifs, sauf résurrection explicitement autorisée.</p><p>Les équipements et reliques de ce sac appliquent les règles historiques V8. Leur effet est détaillé sur chaque fiche ; ils ne sont pas les cartes à piocher de Survie Infinity.</p><p>Bonus actuels : ${esc(Object.entries(globalBonuses(run)).map(([k,v])=>k+' : '+v).join(' · '))}</p></div>`:inventory}<div class="v7-retreat">${act('↩ Abandonner la run','rogueStop','outline')}</div></div></details></section></div></div>`;
}
function versusStart(){const cards=draw(uid(),2);S.versus={a:cards[0],b:cards[1],stat:['attack','maxHp','speed'][Math.floor(Math.random()*3)],answer:null,score:S.versus?.score||0,round:(S.versus?.round||0)+1};}
function versus(){const v=S.versus;if(!v)versusStart();const x=S.versus;const attr={attack:'ATQ',maxHp:'PV',speed:'VIT'}[x.stat];return `${heading('versus')}<div class="stat-quiz"><div class="quiz-top">QUI A LE PLUS DE <strong>${attr}</strong> ? <span>SCORE : ${x.score}</span></div><div class="quiz-duel"><div class="quiz-choice">${card(x.a,{small:true,hideStat:x.answer?null:x.stat})}${act('JE CHOISIS '+esc(x.a.name),'versusPick','outline','data-side="a" '+(x.answer?'disabled':''))}</div><div class="giant-symbol">VS</div><div class="quiz-choice">${card(x.b,{small:true,hideStat:x.answer?null:x.stat})}${act('JE CHOISIS '+esc(x.b.name),'versusPick','outline','data-side="b" '+(x.answer?'disabled':''))}</div></div>${x.answer?`<div class="quiz-answer">${x.answer.correct?'✓ BIEN JOUÉ !':'✕ RATÉ !'} · ${x.a[x.stat]} vs ${x.b[x.stat]} ${act('SUIVANT →','versusNext','primary')}</div>`:''}</div>`;}
function profilePage(){return `<section class="v51-profile"><div class="v51-profile-head"><span class="v51-avatar">✦</span><div><small>JEU LOCAL</small><h1>${esc(S.accountName||'INVITÉ')}</h1><p>Progression enregistrée sur cet appareil.</p></div></div><div class="v51-profile-stats"><div><b>${Object.keys(profile.owned).length}</b><small>CARTES</small></div><div><b>${profile.bestZone||0}</b><small>ZONE RECORD</small></div><div><b>${profile.packsOpened||0}</b><small>PACKS</small></div></div><div class="v51-profile-actions">${act('✎ PSEUDO','profileEdit','outline')}${act(S.sound?'♫ AUDIO ACTIVÉ':'♪ AUDIO COUPÉ','audio','outline')}${act('↓ SAUVEGARDE JSON','exportSave','primary')}${act('↑ RESTAURER UNE PARTIE','importSave','outline')}${act('↓ INSTALLER LA WEB APP','installApp','outline')}</div><input type="file" id="localSaveImport" accept="application/json,.json" hidden>${S.accountPane?`<form id="localProfileForm" class="v51-local-profile"><label>PSEUDO<input name="nickname" maxlength="24" minlength="2" value="${esc(S.accountName)}" placeholder="Nom du joueur" required></label><button class="btn primary" type="submit">ENREGISTRER</button></form>`:''}<p class="v51-profile-note">Aucun compte et aucun serveur : les parties restent locales. Exporte un fichier pour conserver ta progression.</p></section>`;}

function collection(){const pool=cardsForFranchise();const sagas=[...new Set(pool.map(c=>c.series))].sort();const list=pool.filter(c=>(!S.filter||`${c.name} ${c.series} ${c.form||c.version||''}`.toLowerCase().includes(S.filter.toLowerCase()))&&(S.rarity==='all'||c.rarity===S.rarity)&&(S.saga==='all'||c.series===S.saga)&&(!S.onlyMine||profile.owned[c.id]||(S.franchise&&S.franchise!=='DB')));
 return `<div class="mode-heading collect-head"><div><h1>COLLECTION</h1><p>Appuie pour voir la carte en 3D.</p></div><div class="collect-score"><b>${Object.keys(profile.owned).length}</b><span>/ ${pool.length} AU CATALOGUE</span></div></div><div class="collection-toolbar"><input type="search" id="cardSearch" placeholder="⌕  RECHERCHER UN PERSONNAGE..." value="${esc(S.filter)}" aria-label="Rechercher"><select id="rarityFilter"><option value="all">TOUTES RARETÉS</option>${Object.entries(RARITIES).map(([k,v])=>`<option value="${k}" ${S.rarity===k?'selected':''}>${v.label}</option>`).join('')}</select><select id="seriesFilter"><option value="all">TOUTES SÉRIES</option>${sagas.map(x=>`<option value="${x}" ${S.saga===x?'selected':''}>${x}</option>`).join('')}</select><button class="tiny-toggle ${S.onlyMine?'active':''}" data-action="mine">${S.onlyMine?'✓ MES CARTES':'◯ TOUT VOIR'}</button></div><div class="collect-bar"><span>${list.length} CARTES</span><span>◉ ${(FRANCHISES[S.franchise||'DB']||FRANCHISES.DB).name}</span></div><div class="collection-grid">${list.slice(0,S.catalogCount).map(c=>card(c,{small:true,action:'viewCard',locked:(S.franchise&&S.franchise!=='DB')?false:!profile.owned[c.id],tag:profile.owned[c.id]>1?`×${profile.owned[c.id]}`:''})).join('')}</div>${list.length>S.catalogCount?`<div class="collection-more">${act(`VOIR PLUS · ${Math.min(list.length-S.catalogCount,84)} CARTES ↓`,'collectionMore','outline')}</div>`:''}${!list.length?'<div class="empty-state">AUCUNE CARTE TROUVÉE</div>':''}`;}
function battle(){const b=S.battle;const ev=b.result.events,idx=b.index,last=ev[Math.max(0,idx-1)],units=last?.units||ev[0]?.units||b.result.final,
 actor=last?.actor,target=last?.target,stage=(code)=>units.filter(u=>u.team===code).map(u=>{
  const cc=cId(u.cardId);return `<div class="fight-unit ${!u.alive?'ko':''} ${actor===u.uid&&['attack','hit','skill_hit','counter_hit','ultimate','skill'].includes(last?.type)?'unit-strike':''} ${target===u.uid&&['hit','skill_hit','counter_hit'].includes(last?.type)?'unit-impact':''} ${actor===u.uid&&['buff','shield'].includes(last?.type)?'unit-aura':''} ${actor===u.uid&&['ultimate'].includes(last?.type)?'unit-ultimate':''} ${actor===u.uid&&['heal','revive'].includes(last?.type)?'unit-heal':''} ${actor===u.uid&&['dodge','guard'].includes(last?.type)?'unit-defend':''}" data-unit="${u.uid}">${card(cc,{small:true,usedEffects:u.used||[]})}<div class="hp-line"><span style="width:${Math.max(0,u.hp/u.maxHp*100)}%"></span></div><div class="hp-number">${u.hp} / ${u.maxHp} PV</div></div>`;}).join('');
 const koFighter=last?.type==='ko'?units.find(u=>u.uid===last.target):null;
 const koCard=koFighter?cId(koFighter.cardId):null;
 const liveActor=units.find(u=>u.uid===actor), liveTarget=units.find(u=>u.uid===target);
 const finished=idx>=ev.length;return `<div class="battle-wrap ${b.rogueResult?'rogue-battle biome-'+BACKGROUNDS[(profile.rogue?.zone-1||0)%BACKGROUNDS.length].tone:''}"><div class="battle-header"><button class="back-mini" data-action="battleBack">← RETOUR</button><span>● COMBAT AUTOMATIQUE</span><strong>ROUND ${last?.round||1}</strong></div><div class="fight-field"><div class="fight-team"><b>TEAM ORANGE</b><div class="fighter-grid">${stage('A')}</div></div><div class="battle-center"><span class="battle-glare"></span><b>VS</b></div><div class="fight-team enemy"><b>TEAM BLEUE</b><div class="fighter-grid">${stage('B')}</div></div></div>${koCard?`<div class="v52-ko-cinematic" role="status"><div class="v52-ko-art">${art(koCard)}</div><div class="v52-ko-copy"><strong>${esc(koCard.name)}</strong><span>${esc(koCard.form)}</span><b>K.O.</b></div></div>`:''}<div class="v51-live-event type-${last?.type||'start'}"><span>${({attack:"⚔",hit:"✹",skill_hit:"✦",counter_hit:"↶",ultimate:"★",buff:"✦",shield:"⬡",heal:"✚",dodge:"➤",ko:"☠",round:"◎",revive:"✚"}[last?.type]||"◆")}</span>${liveActor&&cId(liveActor.cardId)?`<div class="v52-live-portrait">${art(cId(liveActor.cardId))}</div>`:''}<div><small>${({attack:"ATTAQUE",hit:"IMPACT",skill_hit:"TECHNIQUE",counter_hit:"RIPOSTE",ultimate:"ULTIME",phase:"PHASE 2 · BOSS",buff:"PUISSANCE",shield:"PROTECTION",heal:"SOIN",dodge:"ESQUIVE",ko:"ÉLIMINATION",round:"NOUVEAU ROUND",revive:"SECONDE CHANCE"}[last?.type]||"COMBAT")}</small><b>${esc(last?.message||"PRÊTS ?")}</b></div></div><div class="fight-action-text fx-${last?.type||'start'} ${['ultimate','phase','revive'].includes(last?.type)?'big-effect':''}"><span>⚡</span>${esc(last?.message||'EN PLACE !')}</div>${finished?`<div class="fight-result">${b.result.winner==='A'?'✦ VICTOIRE !':b.result.winner==='B'?'✕ DÉFAITE':'ÉGALITÉ'}<small>${b.result.rounds} ROUNDS</small></div>`:''}<div class="battle-bottom"><div class="battle-controls">${act(b.playing?'Ⅱ PAUSE':'▶ PLAY','battleToggle','outline')}${act('×'+S.settings.speed,'battleCycleSpeed','outline')}${act('×1','battleSpeed',S.settings.speed===1?'primary':'outline','data-speed="1"')}${act('×2','battleSpeed',S.settings.speed===2?'primary':'outline','data-speed="2"')}${act('×4','battleSpeed',S.settings.speed===4?'primary':'outline','data-speed="4"')}${act('×8','battleSpeed',S.settings.speed===8?'primary':'outline','data-speed="8"')}${act('⏭ RÉSULTAT','battleSkip','outline')}${act(finished?'RETOUR AU JEU →':'QUITTER →','battleBack','primary')}</div><button class="log-toggle" data-action="battleLog">☰ ${S.battleLog?'MASQUER':'HISTORIQUE LIVE'}</button><div class="battle-timeline">${Math.min(idx,ev.length)} / ${ev.length} ÉVÉNEMENTS<div class="timeline-track"><span style="width:${Math.round(idx/ev.length*100)}%"></span></div></div></div><div class="v51-live-compact">${ev.slice(0,idx).slice(-3).reverse().map((x,i)=>`<div class="type-${x.type}"><span>${esc(x.type.toUpperCase())}</span> ${esc(x.message)}</div>`).join('')}</div>${S.battleLog?`<div class="battle-log">${ev.slice(0,idx).slice(-24).reverse().map(x=>`<div class="log-${x.type}"><b>${x.round||0}</b> ${esc(x.message)}</div>`).join('')}</div>`:''}</div>`;}
function modal(){let content='';if(S.preview){const c=S.preview;content=`<div class="modal-back" data-action="closeModal"><div class="modal-box preview-box ${c.rarity==='legendary'?'v51-gold-open':''}" role="dialog" aria-modal="true"><button class="close-modal" data-action="closeModal">×</button><div class="preview-scene"><div class="preview-tilt" id="tiltCard" style="transform:rotateX(${S.rotX}deg) rotateY(${S.rotY}deg)">${card(c)}</div></div><div class="preview-detail"><span class="eyebrow dark">${label[c.rarity]} · ${c.series}</span><h2>${esc(c.name)}</h2><h3>${esc(c.form)}</h3><p>✧ GLISSE POUR FAIRE PIVOTER</p><details class="v52-effects"><summary>✦ DÉTAIL DES ${c.effects.length} POUVOIRS</summary><div class="effect-list">${c.effects.map((e,i)=>`<div><span style="color:${RGB[c.rarity]}">${['✦','◆','◈','ϟ','★'][i]}</span><strong>${esc(e.name)}</strong><small>${esc(e.description)}</small></div>`).join('')}</div></details></div></div></div>`;}
 if(S.pack){content=`<div class="modal-back" data-action="closeModal"><div class="modal-box pack-box" role="dialog" aria-modal="true"><button class="close-modal" data-action="closeModal">×</button><span class="eyebrow dark">PACK OUVERT !</span><h2>ÇA BRILLE !</h2><div class="pack-reveal">${S.pack.map(c=>card(c,{small:true})).join('')}</div>${act('CONTINUER →','closeModal','primary')}</div></div>`;}
 if(S.login){content=`<div class="modal-back" data-action="closeModal"><form class="modal-box login-box" id="founderForm" role="dialog" aria-modal="true"><button class="close-modal" type="button" data-action="closeModal">×</button><span class="giant-symbol">★</span><h2>ACCÈS PRIORITAIRE</h2><p>Mode fondateur du prototype local.</p><input type="password" name="code" placeholder="MOT DE PASSE" autocomplete="off" required autofocus><button class="btn primary" type="submit">DÉBLOQUER ✦</button><small>Accès de démonstration — pas une authentification serveur.</small></form></div>`;}
 return content;}
function founderTools(){return `<div class="founder-ribbon">★ ACCÈS FONDATEUR ACTIVÉ · TOUS LES MODES LIBRES · ${act('PACK TEST ×5','founderPack','mini')}${act('RÉINITIALISER LE PROFIL','founderReset','mini')}</div>`;}
function render(){const content=S.page==='battle'?battle():({home,collection,profile:profilePage,survival:renderSurvival,auto5:renderAuto5,free,draft,blind,tournament,ranking,rogue,versus}[S.page]||home)();app.innerHTML=shell((S.founder?founderTools():'')+content);scheduleAdventureRoutes();refreshGameViewport();}
function notice(t){S.notice=t;const el=$('#toast');if(el){el.textContent=t;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),2100);}}
function changePage(page){pause();if(page!=='survival')pauseSurvivalUI();S.page=page;S.menu=false;if(page==='free'&&!S.free)newFree();if(page==='draft'&&!S.draft)startDraft();if(page==='blind'&&!S.blind)startBlind();if(page==='ranking'&&!S.ranking)startRanking();if(page==='versus'&&!S.versus)versusStart();S.rogueChoice=[];
try{const fr=localStorage.getItem('ki-arena-franchise');if(fr&&FRANCHISES[fr])S.franchise=fr;}catch{}
render();window.scrollTo(0,0);}
function pause(){if(S.battleTimer){clearInterval(S.battleTimer);S.battleTimer=null;}if(S.battle)S.battle.playing=false;}
function beginFight(a,b,back,{rogueResult=null,battleResult=null}={}){const battle=battleResult||rogueResult?.battle||runBattle(a,b,{seed:uid(),rules:'canon'});S.battle={result:battle,index:0,back,rogueResult,playing:false};S.battleLog=false;S.page='battle';musicStart();render();play();}
// Mise à jour localisée: on ne remplace jamais les boutons pendant la lecture rapide.
function updateBattleFrame(){
 const main=document.querySelector('main');if(S.page!=='battle'||!main)return;
 const dom=document.createElement('div');dom.innerHTML=battle();
 const targets=['.fight-field','.v52-ko-cinematic','.v51-live-event','.v51-live-compact','.fight-result','.battle-timeline','.battle-log','.battle-header strong'];
 for(const sel of targets){const old=main.querySelector(sel),newNode=dom.querySelector(sel);if(old&&newNode)old.replaceWith(newNode);else if(old&&!newNode)old.remove();else if(!old&&newNode){if(sel==='.fight-result'||sel==='.v52-ko-cinematic')main.querySelector('.fight-field')?.after(newNode);else if(sel==='.battle-log')main.querySelector('.battle-wrap')?.append(newNode);}}
 const toggle=main.querySelector('[data-action="battleToggle"]');if(toggle)toggle.textContent=S.battle?.playing?'Ⅱ PAUSE':'▶ PLAY';
 const leave=main.querySelector('[data-action="battleBack"].btn');if(leave)leave.textContent=S.battle?.index>=S.battle?.result.events.length?'RETOUR AU JEU →':'QUITTER →';
 const cycle=main.querySelector('[data-action=battleCycleSpeed]');if(cycle)cycle.textContent='×'+S.settings.speed;playCombatFX(S.battle.result.events[Math.max(0,S.battle.index-1)],{root:main.querySelector('.fight-field'),speed:S.settings.speed});
}
function play(){
 pause();if(!S.battle)return;
 S.battle.playing=true;
 function frame(){const b=S.battle;if(!b||!b.playing)return;
  b.index=Math.min(b.result.events.length,b.index+1);
  const ev=b.result.events[b.index-1];
  if(ev?.type&&['phase','hit','skill_hit','counter_hit','ultimate','dodge','ko','buff','shield','heal','guard','revive','round','attack','result'].includes(ev.type))soundFx(ev.type);
  if(b.index>=b.result.events.length){pause();updateBattleFrame();return;}
  updateBattleFrame();
  const next=b.result.events[b.index];
  const durations={ko:600,phase:700,ultimate:600,revive:500,attack:260,hit:300,skill_hit:420,counter_hit:340,heal:320,shield:320,dodge:280};
  const dur=durations[next?.type]||310;
  b.playing=true;b.battleTimer=null;
  S.battleTimer=setTimeout(frame,Math.max(85,Math.round(dur/Math.max(1,S.settings.speed))));
 }
 S.battleTimer=setTimeout(frame,120);
}
function battleReturn(){const b=S.battle;if(!b)return;pause();
 if(b.rogueResult){const run=profile.rogue;if(run?.status==='battle_pending'&&run.battleCheckpoint){if(b.result.winner==='A'){
   markFight(run,b.rogueResult.encounter);S.rogueOffer=null;
  }else{const award=endRun(run,profile);notice(`RUN TERMINÉE · ${award.packs} PACKS · ${award.recruits} RECRUES`);}
  persist();}}
 S.battle=null;S.page=b.back;render();window.scrollTo({top:0,behavior:'instant'});}
// Audio: synthèse originale très légère. Aucun asset externe ni abonnement.
let ctx=null,oscMusic=null,musicTimer=null;
function audio(){if(!S.sound)return null;try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}catch{return null;}}
function tone(hz,dur=.09,shape='triangle',vol=.045,delay=0){const c=audio();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=shape;o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02);}
const SFX_FILES={click:'tap',attack:'whoosh',hit:'impact',skill_hit:'energy',counter_hit:'impact',ultimate:'ultimate',phase:'ultimate',buff:'charge',shield:'shield',heal:'heal',guard:'shield',revive:'heal',round:'tap',dodge:'whoosh',ko:'ko',status:'charge',result:'ultimate'};
const sfxPool=new Map();
function soundFx(kind='click'){
 if(!S.sound)return;
 if(!musicTimer)musicStart();
 try{
  const name=SFX_FILES[kind]||'tap';
  const snd=new Audio(assetSrc(`assets/sfx/${name}.wav`));snd.volume=(kind==='ko'||kind==='ultimate'?.37:.24);snd.play().catch(()=>tone(300,.09));
 }catch{tone(380,.09);}
}

function musicStart(){if(musicTimer||!S.sound)return;const src=assetSrc('assets/sfx/arcade-loop.wav');try{const a=new Audio(src);a.volume=.12;a.loop=true;musicTimer=a;a.play().catch(()=>{musicTimer=null;});}catch{musicTimer=null;}}
function musicStop(){if(musicTimer){musicTimer.pause?.();musicTimer.currentTime=0;musicTimer=null;}}

const set=(v)=>{S.settings={...S.settings,...v};S.free=null;S.draft=null;S.blind=null;S.ranking=null;S.tournament=null;};
app.addEventListener('change',e=>{const t=e.target;if(t.dataset.setting){const value=['size','speed','auctionRounds','auctionBudget'].includes(t.dataset.setting)?Number(t.value):t.value;set({[t.dataset.setting]:value});if(S.page==='free')newFree();if(S.page==='draft')startDraft();if(S.page==='blind')startBlind();if(S.page==='ranking')startRanking();S.menu=true;render();}if(t.id==='rarityFilter'){S.rarity=t.value;S.catalogCount=84;render();}if(t.id==='seriesFilter'){S.saga=t.value;S.catalogCount=84;render();}if(t.id==='freeSlotSelect'){S.freeSlot=Number(t.value);render();}});
app.addEventListener('change',async e=>{if(e.target.id!=='localSaveImport')return;const f=e.target.files?.[0];if(!f)return;try{if(f.size>2000000)throw Error('Fichier trop volumineux');const save=JSON.parse(await f.text());if(!save.profile||typeof save.profile.owned!=='object'||!Array.isArray(save.profile.history||[]))throw Error('Fichier invalide');profile={...initialProfile(),...save.profile};S.accountName=String(save.nickname||'').slice(0,24);storeSet('localStorage','ki_account_name',S.accountName);persist();render();notice('SAUVEGARDE RESTAURÉE');}catch(err){notice(err.message||'IMPORT IMPOSSIBLE');}});
app.addEventListener('input',e=>{if(e.target.id==='freeCardSearch'){const pos=e.target.selectionStart;S.freeSearch=e.target.value;render();const n=$('#freeCardSearch');n?.focus();try{n?.setSelectionRange(pos,pos);}catch{}return;}if(e.target.id==='cardSearch'){const pos=e.target.selectionStart;S.filter=e.target.value;S.catalogCount=84;render();const n=$('#cardSearch');n?.focus();try{n?.setSelectionRange(pos,pos);}catch{}}});
app.addEventListener('submit',async e=>{if(e.target.id==='localProfileForm'){e.preventDefault();const val=e.target.elements.nickname.value.trim();if(val.length>=2&&val.length<=24){S.accountName=val;storeSet('localStorage','ki_account_name',val);S.accountPane=false;render();notice('PROFIL LOCAL ENREGISTRÉ');}return;}if(e.target.id==='founderForm'){e.preventDefault();if(e.target.elements.code.value==='N'){S.founder=true;storeSet('sessionStorage','ki_founder','yes');S.login=false;render();notice('★ MODE FONDATEUR ACTIVÉ');}else{notice('CODE INCORRECT');}}});
app.addEventListener('click',e=>{
 if(e.target.closest('.ability-led')){e.stopPropagation();const el=e.target.closest('.ability-led');notice(el.dataset.tip);return;}
 const el=e.target.closest('[data-action]');if(!el)return;
 if(el.hasAttribute('disabled'))return;
 const key=el.dataset.action,id=el.dataset.id;
 if(key==='nav'){soundFx();changePage(el.dataset.page);return;}
 if(key==='carouselNext'||key==='carouselPrev'||key==='carouselSelect'){S.carouselIndex=key==='carouselSelect'?Number(el.dataset.index):(S.carouselIndex+(key==='carouselNext'?1:-1)+modes.length)%modes.length;render();soundFx('click');return;}
 if(key==='profileEdit'){S.accountPane=!S.accountPane;render();return;}
 if(key==='exportSave'){const blob=new Blob([JSON.stringify({version:'5.2',profile,nickname:S.accountName,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KI_ARENA_sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('SAUVEGARDE EXPORTÉE');return;}
 if(key==='importSave'){document.querySelector('#localSaveImport')?.click();return;}



 if(key==='auctionBid'){try{placeBid(S.blind,S.blind.current.turn);soundFx('buff');render();}catch(err){notice(err.message);}return;}
 if(key==='auctionPass'){try{passBid(S.blind,S.blind.current.turn);soundFx('click');render();}catch(err){notice(err.message);}return;}
 if(key==='installApp'){installApp();return;}
 if(key==='toggleSettings'){S.menu=!S.menu;render();return;}
 if(key==='audio'){S.sound=!S.sound;storeSet('localStorage','ki_sound',S.sound?'true':'false');if(S.sound){audio();musicStart();}else musicStop();render();return;}
 if(key==='founder'){S.login=true;render();return;}
 if(key==='closeModal'){if(e.target===el||el.classList.contains('close-modal')||el.tagName==='BUTTON'){S.preview=null;S.pack=null;S.login=false;render();}return;}
 if(key==='mine'){S.onlyMine=!S.onlyMine;S.catalogCount=84;render();return;}
 if(key==='collectionMore'){S.catalogCount+=84;render();return;}
 if(key==='viewCard'){S.preview=cId(id);S.rotX=0;S.rotY=0;render();return;}
 if(key==='freeRoll'){newFree();render();soundFx();return;}
 if(key==='freeEdit'){S.freePicker=true;S.freeSide=el.dataset.side==='b'?'b':'a';S.freeSlot=0;S.freeSearch='';render();return;}
 if(key==='freeClose'){S.freePicker=false;render();return;}
 if(key==='freeChoose'){const c=cId(id);if(!c||!S.free)return;const cards=S.free[S.freeSide];if(cards.some((x,i)=>x.id===id&&i!==S.freeSlot)){notice('CARTE DÉJÀ DANS CETTE ÉQUIPE');return;}cards[S.freeSlot]=c;S.freeSlot=(S.freeSlot+1)%S.settings.size;render();soundFx();return;}

 if(key==='freeFight'){if(S.free)beginFight(S.free.a,S.free.b,'free');return;}
 if(key==='draftReset'){startDraft();render();return;}
 if(key==='draftReroll'){const d=S.draft;if(d.rerolls[d.player]){d.rerolls[d.player]--;d.index++;draftOffers();render();}return;}
 if(key==='draftPick'){
  const c=cId(id),d=S.draft,p=d.player;
  if(c&&d.offers.some(x=>x.id===id)&&c.price<=d.budgets[p]&&d.teams[p].length<S.settings.size){
   d.teams[p].push(c);d.budgets[p]-=c.price;d.index++;
   if(d.local){const other=1-p;d.player=d.teams[other].length<S.settings.size?other:p;}
   draftOffers();render();soundFx();
  }return;
 }
 if(key==='draftFight'){const d=S.draft;beginFight(d.teams[0],d.local?d.teams[1]:draw(uid()+'CPU',S.settings.size),'draft');return;}
 if(key==='blindReset'){startBlind();render();return;}
 if(key==='blindFight'){const d=S.blind;if(d?.teams[0].length&&d?.teams[1].length)beginFight(d.teams[0],d.teams[1],'blind');return;}
 if(key==='tournMake'){const t=createTournament(uid(),Number(el.dataset.count),S.settings.size,{cardPool:randomPool(),rules:S.settings.rules});S.tournament=t;render();return;}
 if(key==='rankingReset'){startRanking();render();return;}
 if(key==='rankChoose'){const r=S.ranking,pos=Number(el.dataset.position);if(!r.slots[pos]&&r.index<r.cards.length){r.slots[pos]=r.cards[r.index++];render();soundFx();}return;}
 if(key==='roguePick'){const i=S.rogueChoice.indexOf(id);if(i>=0)S.rogueChoice.splice(i,1);else if(S.rogueChoice.length<5)S.rogueChoice.push(id);render();return;}
 if(key==='rogueStart'){if(S.rogueChoice.length===5&&S.rogueChoice.every(id=>profile.owned[id])){profile.rogue=createRun(S.rogueChoice,uid());persist();render();window.scrollTo({top:0,behavior:'instant'});}return;}
 if(key==='rogueWish'){const run=profile.rogue;if(run&&makeWish(run,el.dataset.wish)){persist();render();soundFx('ultimate');}return;}
 if(key==='rogueNode'){
  const run=profile.rogue;if(!run||run.status!=='map'||!run.teamIds.length)return;
  const node=routePick(run,id);if(!node)return;
  const type=node.type;
  run.status=['combat','elite','boss'].includes(type)?'preview':type;
  if(run.status==='preview')run.pending={fightType:type,nodeId:node.id};
  if(type==='merchant'){run.pending={shopIds:shopOffers(run).map(x=>x.id)};S.rogueShop=run.pending.shopIds;}
  if(type==='event'){S.rogueEvent=rollEvent(run);run.pending={event:S.rogueEvent};}
  persist();render();window.scrollTo({top:0,behavior:'instant'});return;
 }
 if(key==='rogueFight'){
  const run=profile.rogue;if(!run||!['preview','battle_pending'].includes(run.status)||!run.pending?.fightType)return;
  const type=run.pending.fightType;
  if(run.status==='preview'){run.status='battle_pending';run.battleCheckpoint={type,nodeId:run.currentNode};persist();}
  const encounter=fight(run,type);
  beginFight(run.teamIds.map(cId),encounter.foe,'rogue',{rogueResult:{battle:encounter.result,encounter}});return;
 }
 if(key==='rogueEscape'){
  const run=profile.rogue;if(!run||run.status!=='preview'||run.pending?.fightType==='boss'||run.gold<45)return;
  run.gold-=45;advanceMap(run);persist();render();return;
 }
 if(key==='rogueReward'){const run=profile.rogue;if(run&&chooseReward(run,id)){persist();render();soundFx('buff');}return;}
 if(key==='rogueRewardGold'){const run=profile.rogue;if(run&&skipReward(run)){persist();render();}return;}
 if(key==='rogueRecruit'){const run=profile.rogue;if(!run)return;
  if(run.teamIds.length<5||run.reserves.length<reserveCapacity(run)){recruit(run,id);S.rogueOffer=null;persist();render();}
  else {S.rogueOffer=id;render();}return;}
 if(key==='rogueRecruitReplace'){const run=profile.rogue;if(S.rogueOffer){recruit(run,S.rogueOffer,Number(el.dataset.index));S.rogueOffer=null;persist();render();}return;}
 if(key==='rogueSkipRecruit'){if(profile.rogue){recruit(profile.rogue,null);persist();render();}return;}
 if(key==='rogueDoneNode'){if(profile.rogue){advanceMap(profile.rogue);persist();render();}return;}
 if(key==='rogueRest'){if(profile.rogue){if(chooseRest(profile.rogue,el.dataset.choice||'heal',el.dataset.fallen||null)){persist();render();}}return;}
 if(key==='rogueTreasure'){if(profile.rogue){const it=randomTreasure(profile.rogue);advanceMap(profile.rogue);persist();render();notice(`✷ ${it.name} OBTENU`);}return;}
 if(key==='rogueResolveEvent'){const run=profile.rogue;if(run?.status==='event'&&eventResolve(run,run.pending?.event,el.dataset.choice)){S.rogueEvent=null;persist();render();}return;}
 if(key==='rogueQuestFight'){const run=profile.rogue;if(run?.status==='quest'){run.status='preview';run.pending={fightType:'elite',nodeId:run.currentNode};persist();render();}return;}
 if(key==='rogueBuy'){const run=profile.rogue;if(run&&S.rogueShop.includes(id)&&purchase(run,id)){S.rogueShop=S.rogueShop.filter(x=>x!==id);run.pending.shopIds=S.rogueShop;persist();render();soundFx('buff');}return;}
 if(key==='rogueTab'){S.rogueTab=id;render();document.querySelector('.v8-base-drawer').open=true;return;}
 if(key==='rogueGear'){const run=profile.rogue;if(run&&['map','preview','rest','merchant','event','quest','treasure','empty'].includes(run.status)){S.rogueItem=id;render();document.querySelector('.v8-base-drawer').open=true;document.querySelector('.inv-equip-picker')?.scrollIntoView({block:'nearest'});}return;}
 if(key==='rogueGearTo'){const run=profile.rogue;if(run&&S.rogueItem&&equip(run,S.rogueItem,id)){S.rogueItem=null;persist();render();document.querySelector('.v8-base-drawer').open=true;notice('Équipement appliqué');}return;}
 if(key==='rogueConsume'){const run=profile.rogue;if(run&&consume(run,id,run.hpRatios.length?run.hpRatios.indexOf(Math.min(...run.hpRatios)):0,el.dataset.fallen||null)){persist();render();soundFx('heal');}return;}
 if(key==='rogueSwap'){const run=profile.rogue,idx=Number(el.dataset.index),res=run?.reserves.indexOf(id);if(res>=0&&idx>=0&&idx<5){if(switchReserve(run,id,idx)){persist();render();}}return;}
 if(key==='rogueStop'){if(profile.rogue){const awards=endRun(profile.rogue,profile,{forfeit:true});persist();render();notice('RUN ABANDONNÉE · BUTIN PERDU');}return;}
 if(key==='battleLog'){S.battleLog=!S.battleLog;render();return;}
 if(key==='versusPick'){const v=S.versus;if(v.answer)return;const actual=v.a[v.stat]>=v.b[v.stat]?'a':'b';const correct=el.dataset.side===actual;v.answer={correct};if(correct)v.score++;render();soundFx(correct?'ultimate':'ko');return;}
 if(key==='versusNext'){versusStart();render();return;}
 if(key==='battleToggle'){if(S.battle?.playing){pause();render();}else play();return;}
 if(key==='battleCycleSpeed'){S.settings.speed=[1,2,4,8][([1,2,4,8].indexOf(S.settings.speed)+1)%4];if(S.battle?.playing)play();updateBattleFrame();return;}
 if(key==='battleSpeed'){S.settings.speed=Number(el.dataset.speed);if(S.battle?.playing)play();else render();return;}
 if(key==='battleSkip'){if(S.battle){pause();S.battle.index=S.battle.result.events.length;render();}return;}
 if(key==='battleBack'){battleReturn();return;}
 if(key==='founderPack'){const c=openPack('divine',5,uid());addToCollection(profile,c);persist();S.pack=c;render();return;}
 if(key==='founderReset'){profile=initialProfile();persist();S.rogueChoice=[];render();return;}
});
let drag=null;app.addEventListener('pointerdown',e=>{const n=e.target.closest('#tiltCard');if(n){drag={x:e.clientX,y:e.clientY};n.setPointerCapture?.(e.pointerId);}});
app.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x),dy=(e.clientY-drag.y);const el=$('#tiltCard');if(el){el.style.transform=`rotateX(${Math.max(-23,Math.min(23,-dy*.28))}deg) rotateY(${Math.max(-28,Math.min(28,dx*.28))}deg)`;}});
app.addEventListener('pointerup',()=>drag=null);
installAdventureUI();
installSurvivalUI({render,exit:()=>changePage('home'),card,art,assetSrc,soundFx,getFranchise:()=>S.franchise||'DB',setFranchise:id=>{S.franchise=id;try{localStorage.setItem('ki-arena-franchise',id)}catch{}}});
installAuto5({render,art,start:prepared=>beginFight(prepared.a,prepared.b,'auto5',{battleResult:prepared.result})});
installGameViewport({inspectContent:survivalInspectContent,mapContent:()=>{if(S.page==='survival')return survivalMapContent();const r=profile.rogue;return r?rogueFullMapView(r,BACKGROUNDS[(r.zone-1)%BACKGROUNDS.length]):'<p>Commence une aventure pour voir sa carte.</p>';}});
render();// V5.2 local-only: no account network request.

// V9 distribution uses a self-contained HTML and no service-worker cache.

// Installation web progressive : aucun store natif fictif.
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
async function installApp(){
 if(deferredInstall){const prompt=deferredInstall;deferredInstall=null;await prompt.prompt();return;}
 const isiOS=/iPad|iPhone|iPod/i.test(navigator.userAgent);
 notice(isiOS?'SUR IPHONE : PARTAGER → SUR L’ÉCRAN D’ACCUEIL':'APP WEB : INSTALLE-LA DEPUIS LE MENU DU NAVIGATEUR (HTTPS)');
}
