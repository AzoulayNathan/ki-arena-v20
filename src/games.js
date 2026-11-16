import {CARDS,RARITIES,CARD_MAP} from './catalog.js';
import {seededRandom,selectRandom,runBattle} from './battle.js';
export const PACKS={
 standard:{name:'Standard',odds:{common:33,uncommon:27,rare:21,epic:15,legendary:4}},
 bronze:{name:'Bronze',odds:{common:30,uncommon:26,rare:22,epic:16,legendary:6}},
 silver:{name:'Argent',odds:{common:27,uncommon:25,rare:23,epic:17,legendary:8}},
 gold:{name:'Or',odds:{common:22,uncommon:24,rare:24,epic:18,legendary:12}},
 divine:{name:'Divin',odds:{common:17,uncommon:22,rare:25,epic:20,legendary:16}}
};
export function packType(wave){return wave>=30?'divine':wave>=20?'gold':wave>=10?'silver':wave>=5?'bronze':'standard';}
export function randomCard(rng,odds=PACKS.standard.odds,exclude=new Set()){
 const keys=Object.keys(RARITIES);
 const permitted=keys.filter(k=>CARDS.some(c=>c.rarity===k&&!exclude.has(c.id)));
 if(!permitted.length)throw Error('Plus aucune carte disponible.');
 const total=permitted.reduce((n,k)=>n+(odds[k]||0),0);
 let r=rng()*total;let rarity=permitted.at(-1);
 for(const k of permitted){r-=odds[k]||0;if(r<0){rarity=k;break;}}
 return selectRandom(CARDS.filter(c=>c.rarity===rarity&&!exclude.has(c.id)),rng);
}
export function openPack(pack='standard',count=1,seed='pack'){
 const rng=seededRandom(seed);
 return Array.from({length:count},()=>randomCard(rng,PACKS[pack].odds));
}
export const STARTER_IDS=[
 'goku-db-enfant-debut-d-aventure','krilin-db-22e-tenkaichi-budokai','yamcha-db-desert',
 'tortue-geniale-db-22e-tenkaichi-budokai','dende-dbz-guerisseur-de-namek',
 'c-8-db-cyborg-pacifique','bulma-db-aventuriere','yajirobe-dbz-guerrier-solitaire',
 'videl-dbz-championne-en-herbe','piccolo-dbz-saga-saiyans','chaozu-db-ecole-de-la-grue',
 'c-18-dbz-saga-androids'
];
for(const id of STARTER_IDS)if(!CARD_MAP.has(id))throw Error('Starter absent: '+id);
export function initialProfile(){return {owned:Object.fromEntries(STARTER_IDS.map(id=>[id,1])),fragments:0,packsOpened:0,bestWave:0,history:[],rogue:null};}
export function addToCollection(profile,cards){
 const out=[];for(const card of cards){const already=profile.owned[card.id]||0;profile.owned[card.id]=already+1;
 if(already>0)profile.fragments+=RARITIES[card.rarity].sort+1;
 out.push({id:card.id,duplicate:already>0});}
 profile.packsOpened+=1;return out;
}
const WAVE_ODDS={
 early:{common:77,uncommon:23,rare:0,epic:0,legendary:0},
 mid:{common:36,uncommon:43,rare:21,epic:0,legendary:0},
 high:{common:9,uncommon:29,rare:42,epic:20,legendary:0},
 elite:{common:0,uncommon:8,rare:43,epic:39,legendary:10},
 ultra:{common:0,uncommon:0,rare:12,epic:61,legendary:27}
};
export function rogueEnemy(wave,seed){
 const rng=seededRandom(`enemy-${seed}-${wave}`);
 const odds=wave>=26?WAVE_ODDS.ultra:wave>=16?WAVE_ODDS.elite:wave>=9?WAVE_ODDS.high:wave>=5?WAVE_ODDS.mid:WAVE_ODDS.early;
 const excludes=new Set(),team=[];
 for(let i=0;i<5;i++){const c=randomCard(rng,odds,excludes);team.push(c);excludes.add(c.id);}
 return team;
}
export function rogueDifficulty(wave){return Math.min(2.9,.76+.065*(wave-1)+(wave%5===0?.13:0));}
export function rogueOffers(wave,seed,activeIds){
 const rng=seededRandom(`offers-${seed}-${wave}`),excluded=new Set(activeIds),offers=[];
 for(let i=0;i<3;i++){const c=randomCard(rng,PACKS[packType(wave)].odds,excluded);offers.push(c);excluded.add(c.id);}
 return offers;
}
export function playRogueWave(team,wave,seed){
 const enemy=rogueEnemy(wave,seed);
 const battle=runBattle(team,enemy,{seed:`rogue-${seed}-${wave}`,rules:'canon',difficultyB:rogueDifficulty(wave)});
 const pack=packType(wave),rewardCount=wave%5===0?3:1;
 const reward=battle.winner==='A'?openPack(pack,rewardCount,`reward-${seed}-${wave}`):[];
 return {battle,enemy,pack,reward,rewardCount,offers:battle.winner==='A'?rogueOffers(wave,seed,team.map(c=>c.id)):[]};
}
export function randomTeam(rng,rarities=null,n=5,excludeIds=[]){
 const exclude=new Set(excludeIds),out=[];
 for(let i=0;i<n;i++){
  const c=randomCard(rng,rarities||PACKS.standard.odds,exclude);out.push(c);exclude.add(c.id);
 }
 return out;
}
export function budgetOffers(seed,round,budget,slots,existingIds=[]){
 const rng=seededRandom(`draft-${seed}-${round}`),minPrice=Math.min(...CARDS.map(c=>c.price));
 const maxSpend=budget-Math.max(0,slots-1)*minPrice;
 let possible=CARDS.filter(c=>c.price<=maxSpend&&!existingIds.includes(c.id));
 if(!possible.length)possible=CARDS.filter(c=>c.price<=budget&&!existingIds.includes(c.id));
 if(!possible.length)return [];
 const out=[];for(let i=0;i<3&&possible.length;i++){
  const pos=Math.floor(rng()*possible.length);out.push(possible[pos]);possible.splice(pos,1);
 }
 return out;
}
export function cpuBudgetTeam(seed,budget=600,count=5){
 const rng=seededRandom(seed),out=[];let remain=budget;
 for(let j=0;j<count;j++){
  let options=CARDS.filter(c=>!out.some(x=>x.id===c.id)&&c.price<=remain-(count-j-1)*Math.min(...CARDS.map(x=>x.price)));
  if(!options.length)options=CARDS.filter(c=>!out.some(x=>x.id===c.id)&&c.price<=remain);
  options.sort((a,b)=>b.power-a.power);const start=Math.floor(rng()*Math.min(options.length,12));const pick=options[Math.min(start,options.length-1)];
  if(!pick)break;out.push(pick);remain-=pick.price;
 }
 return out;
}
export function createTournament(seed,teamCount=8,teamSize=5,{cardPool=CARDS,rules='canon'}={}){
 const rng=seededRandom(seed);
 const customTeam=()=>{const pool=[...cardPool],out=[];for(let j=0;j<teamSize&&pool.length;j++){const index=Math.floor(rng()*pool.length);out.push(pool.splice(index,1)[0]);}return out;};
 const teams=Array.from({length:teamCount},(_,i)=>({id:i+1,name:i===0?'Équipe joueur':`Équipe ${i+1}`,cards:customTeam()}));
 const rounds=[];let running=[...teams],r=1;
 while(running.length>1){const matches=[],winners=[];
  for(let i=0;i<running.length;i+=2){const x=running[i],y=running[i+1],battle=runBattle(x.cards,y.cards,{seed:`${seed}-round-${r}-match-${i}`,rules});
   const winner=battle.winner==='A'?x:battle.winner==='B'?y:(rng()<.5?x:y);
   matches.push({a:x.name,b:y.name,winner:winner.name,rounds:battle.rounds});winners.push(winner);
  }
  rounds.push(matches);running=winners;r++;
 }
 return {teams,rounds,champion:running[0]};
}
export function cardScore(c){return Math.round(c.attack*1.6+c.maxHp*.30+c.speed*.90+c.effects.length*14);}
