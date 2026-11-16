import {registry,WORLDS} from './catalog.js';
import {seedState,shuffle} from '../survival/random.js';
import {runArenaBattle} from '../arena/battle.js';
export const PARTY_VERSION=1;
export const PARTY_KEY='kiarena:party:v13';
export const RARITIES={common:'Commune',uncommon:'Peu commune',rare:'Rare',epic:'Épique',legendary:'Légendaire'};
export function price(c){return 4+Math.round(c.percentile*22);}
export function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function filteredPool(config){return registry(config.worlds?.length?config.worlds:WORLDS,config.statsMode).heroes.filter(h=>(!config.rarities?.length||config.rarities.includes(h.rarity))&&(!config.query||normalize(h.name+' '+h.form).includes(normalize(config.query)))&&(!config.effect||h.effects.some(e=>e.type===config.effect)));}
export function createParty(config={}){
 for(const [key,min,max] of [['budget',20,1000],['rounds',10,60],['passes',0,10]])if(config[key]!==undefined&&(!Number.isInteger(Number(config[key]))||Number(config[key])<min||Number(config[key])>max))throw Error('Réglage invalide : '+key+'.');
 const count=Number(config.players||2);if(!Number.isInteger(count)||count<2||count>4)throw Error('Choisis de deux à quatre joueurs.');const pool=filteredPool(config);if(pool.length<count*5||new Set(pool.map(h=>h.person)).size<5)throw Error('Élargis les filtres : il faut assez de personnages pour les équipes.');
 const seed=String(config.seed||'SOIREE').trim().slice(0,100)||'SOIREE',state={statsMode:config.statsMode==='raw'?'raw':'normalized',schema:PARTY_VERSION,seed,initialConfig:structuredClone(config),rng:seedState(seed),mode:config.mode||'auction',format:config.format||'league',worlds:registry(config.worlds||WORLDS,config.statsMode).worlds,filters:{rarities:config.rarities||[],query:config.query||'',effect:config.effect||''},roundLimit:Math.max(count*5,Math.min(60,Number(config.rounds)||count*5+5)),round:0,players:Array.from({length:count},(_,i)=>({name:String(config.names?.[i]||'Joueur '+(i+1)).slice(0,30),coins:Number(config.budget)||120,passes:Math.max(0,Math.min(10,Number(config.passes??3))),team:[],wins:0,losses:0,draws:0})),deck:[],cursor:0,phase:'draft',offer:null,turn:0,high:null,bid:0,withdrawn:[],history:[],matches:[],matchIndex:0,replay:null,replayCursor:0,champion:null,revision:0};
 if(!['auction','keep','duo','tournament'].includes(state.mode))throw Error('Mode inconnu.');
 const min=Math.min(...pool.map(price));if(state.players[0].coins<min*5)throw Error('Budget trop faible avec ces filtres. Minimum : '+min*5+' zénis.');state.deck=shuffle(state,pool).map(h=>h.id);nextOffer(state);return state;
}
function cat(s){return registry(s.worlds,s.statsMode);}
export function canOwn(s,i,id=s.offer){const p=s.players[i],h=cat(s).byId.get(id);return !!h&&p.team.length<5&&!p.team.some(x=>cat(s).byId.get(x).person===h.person);}
function remainingFloor(s,i){const c=cat(s),p=s.players[i],available=s.deck.slice(s.cursor).map(id=>c.byId.get(id)).filter(h=>h.person!==c.byId.get(s.offer)?.person&&!p.team.some(id=>c.byId.get(id).person===h.person));return available.length?Math.min(...available.map(price)):0;}
export function maxBid(s,i){return Math.max(0,s.players[i].coins-remainingFloor(s,i)*Math.max(0,4-s.players[i].team.length));}
export function eligible(s,i){return canOwn(s,i)&&(s.mode==='keep'||s.mode==='duo'||maxBid(s,i)>=(s.high===null?price(cat(s).byId.get(s.offer)):s.bid+1));}
function order(s,start){return Array.from({length:s.players.length},(_,i)=>(start+i)%s.players.length);}
function nextOffer(s){
 if(s.players.every(p=>p.team.length===5)||s.round>=s.roundLimit){finishDraft(s);return;}
 s.high=null;s.bid=0;s.withdrawn=[];s.redraws=0;s.offer=null;
 while(s.cursor<s.deck.length){const id=s.deck[s.cursor++];if(s.players.some((p,i)=>canOwn(s,i,id))){s.offer=id;break;}}
 if(!s.offer){finishDraft(s);return;}s.round++;const starter=(s.round-1)%s.players.length;s.turn=order(s,starter).find(i=>eligible(s,i));
 if(s.turn===undefined){s.history.push({round:s.round,id:s.offer,owner:null,reason:'inaccessible'});nextOffer(s);}
}
function award(s,i){const id=s.offer;if(!canOwn(s,i))throw Error('Cette équipe ne peut pas accueillir cette carte.');if(s.mode==='auction'||s.mode==='tournament')s.players[i].coins-=s.bid;s.players[i].team.push(id);s.history.push({round:s.round,id,owner:i,price:s.bid});nextOffer(s);}
export function act(s,action,amount){
 if(s.phase!=='draft')return false;const i=s.turn,p=s.players[i],c=cat(s).byId.get(s.offer);if(!p||!c)return false;
 if(s.mode==='keep'||s.mode==='duo'){
  if(action==='take'){s.bid=0;award(s,i);}else if(action==='try'){if(s.redraws>=2)throw Error('Dernière proposition : garde cette carte.');let id;while(s.cursor<s.deck.length){const candidate=s.deck[s.cursor++];if(canOwn(s,i,candidate)){id=candidate;break;}}if(!id)throw Error('Aucun autre personnage disponible.');s.offer=id;s.redraws++;}else return false;s.revision++;return true;
 }
 if(action==='bid'){
  const bid=Number(amount??(s.high===null?price(c):s.bid+1));if(!Number.isInteger(bid)||bid<(s.high===null?price(c):s.bid+1)||bid>maxBid(s,i))throw Error('Cette enchère dépasse ton budget disponible, réserve comprise.');
  s.high=i;s.bid=bid;s.withdrawn=s.withdrawn.filter(x=>x!==i);
 }else if(action==='pass'){
  if(s.high===null){if(!p.passes)throw Error('Tu as utilisé tes passes : prends la carte proposée.');p.passes--;}
  s.withdrawn.push(i);
 }else return false;
 const next=order(s,i+1).find(j=>j!==s.high&&!s.withdrawn.includes(j)&&eligible(s,j));
 if(next===undefined){if(s.high!==null)award(s,s.high);else{s.history.push({round:s.round,id:s.offer,owner:null,reason:'passes'});nextOffer(s);}}
 else s.turn=next;s.revision++;return true;
}
function finishDraft(s){s.offer=null;s.phase='teams';s.matches=[];s.matchIndex=0;if(s.players.some(p=>p.team.length===0)){s.notice='Une équipe est vide. Élargis les filtres ou relance une draft.';return;}
 if(s.format==='cup'&&s.players.length>2){s.matches=s.players.length===4?[[0,1],[2,3]]:[[0,1]];s.bracketStage='semis';s.finalists=s.players.length===3?[2]:[];}
 else for(let a=0;a<s.players.length;a++)for(let b=a+1;b<s.players.length;b++)s.matches.push([a,b]);
}
export function beginMatch(s){if(s.phase!=='teams'||!s.matches[s.matchIndex])return false;const [a,b]=s.matches[s.matchIndex],c=cat(s);s.replay=runArenaBattle(s.players[a].team.map(id=>c.byId.get(id)),s.players[b].team.map(id=>c.byId.get(id)),{seed:s.seed+':match:'+s.matchIndex,rules:'canon',maxRounds:30});s.replayCursor=0;s.phase='battle';s.revision++;return true;}
export function finishMatch(s){if(s.phase!=='battle'||!s.replay)return false;const [a,b]=s.matches[s.matchIndex],winner=s.replay.winner==='A'?a:s.replay.winner==='B'?b:null;if(winner===null){s.players[a].draws++;s.players[b].draws++;}else{s.players[winner].wins++;s.players[winner===a?b:a].losses++;}s.matchResults??=[];s.matchResults.push({a,b,winner,rounds:s.replay.rounds});
 if(s.format==='cup'&&s.bracketStage==='semis'){if(winner!==null)s.finalists.push(winner);else{const advance=shuffle(s,[a,b])[0];s.finalists.push(advance);s.matchResults.at(-1).advancedByLot=advance;s.notice='Combat nul : tirage au sort seedé pour la qualification de '+s.players[advance].name+'. Le combat reste compté nul.';}}
 s.matchIndex++;s.replay=null;
 if(s.format==='cup'&&s.bracketStage==='semis'&&s.matchIndex===s.matches.length){s.matches.push([s.finalists[0],s.finalists[1]]);s.bracketStage='final';}
 if(s.matchIndex<s.matches.length)s.phase='teams';else{s.phase='result';const p=s.players.map((p,i)=>({i,score:p.wins*3+p.draws})).sort((a,b)=>b.score-a.score);s.champion=s.format==='cup'?(winner===null?null:winner):(p[0].score>p[1].score?p[0].i:null);}s.revision++;return true;
}
export function validateParty(s){if(!s||s.schema!==1||!Array.isArray(s.players)||s.players.length<2||s.players.length>4||!['draft','teams','battle','result'].includes(s.phase)||!Number.isInteger(s.round)||s.round<0||s.round>s.roundLimit)throw Error('Partie locale incompatible.');s.statsMode??='normalized';if(!['raw','normalized'].includes(s.statsMode))throw Error('Statistiques de soirée invalides.');const c=registry(s.worlds,s.statsMode);for(const p of s.players){if(!Number.isFinite(p.coins)||p.coins<0||!Number.isInteger(p.passes)||p.passes<0||!Array.isArray(p.team)||p.team.length>5||p.team.some(id=>!c.byId.has(id))||new Set(p.team.map(id=>c.byId.get(id).person)).size!==p.team.length)throw Error('Équipe locale invalide.');}if(s.phase==='draft'&&(!c.byId.has(s.offer)||!Number.isInteger(s.turn)||!s.players[s.turn]))throw Error('Offre invalide.');return s;}
export function saveParty(s,storage=globalThis.localStorage){validateParty(s);storage.setItem('kiarena:party:v19:'+s.statsMode,JSON.stringify(s));}
export function loadParty(storage=globalThis.localStorage,statsMode='normalized'){const s=storage.getItem('kiarena:party:v19:'+statsMode)||(statsMode==='normalized'?storage.getItem(PARTY_KEY):null);return s?validateParty(JSON.parse(s)):null;}
