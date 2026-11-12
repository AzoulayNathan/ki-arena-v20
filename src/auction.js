/* Enchères ascendantes locales à deux joueurs.
   Une carte est offerte, joueur actif accepte la mise ou passe ; adversaire renchérit de 5
   ou cède. Aucun achat avant qu'un adversaire abandonne l'enchère. */
import {seededRandom} from './battle.js';
export const BID_STEP=5;
export function createAuction(cards,{seed='auction',rounds=15,budget=1800,skips=3,teamLimit=null}={}){
 if(!Array.isArray(cards)||!cards.length)throw Error('Pool de cartes vide');
 rounds=Math.min(60,Math.max(1,Number(rounds)||15));budget=Math.max(20,Number(budget)||1800);
 const a={seed,rounds,budgetStart:budget,skipsLimit:skips==='unlimited'?Infinity:Math.max(0,Number(skips)),teamLimit:teamLimit==='unlimited'||!teamLimit?null:Math.max(1,Number(teamLimit)),pool:[...cards],teams:[[],[]],budgets:[budget,budget],skipsUsed:[0,0],index:0,current:null,history:[],complete:false};
 return offer(a);
}
export function offer(a){
 if(a.index>=a.rounds||a.pool.length===0){a.current=null;a.complete=true;return a;}
 const rng=seededRandom(`${a.seed}:offer:${a.index}`),byRarity={};
 for(const c of a.pool)(byRarity[c.rarity]??=[]).push(c);
 const odd={common:33,uncommon:27,rare:21,epic:15,legendary:4};
 const list=Object.keys(byRarity);let r=rng()*list.reduce((n,k)=>n+odd[k],0),rarity=list.at(-1);
 for(const k of list){r-=odd[k];if(r<0){rarity=k;break;}}
 const group=byRarity[rarity],chosen=group[Math.floor(rng()*group.length)];
 a.pool=a.pool.filter(c=>c.id!==chosen.id);
 a.current={card:chosen,base:Math.max(10,Math.round(chosen.price*.58/5)*5),bid:null,leader:null,turn:a.index%2,passed:[false,false]};
 return a;
}
export function canBid(a,player){const c=a.current;if(!c||c.turn!==player||a.complete||c.passed[player])return false;
 if(a.teamLimit&&a.teams[player].length>=a.teamLimit)return false;
 const price=c.leader===null?c.base:c.bid+BID_STEP;
 return a.budgets[player]>=price;
}
export function canPass(a,player){const c=a.current;if(!c||c.turn!==player||a.complete)return false;
 if(c.leader!==null)return true; // abandon d'une surenchère ne dépense pas un skip
 return a.skipsUsed[player]<a.skipsLimit||!canBid(a,player); // passe forcée si impossible de miser
}
function finish(a){const c=a.current;if(c.leader!==null){const p=c.leader;a.teams[p].push(c.card);a.budgets[p]-=c.bid;}
 a.history.push({round:a.index+1,id:c.card.id,name:c.card.name,form:c.card.form,winner:c.leader,price:c.bid||0});a.index++;return offer(a);
}
export function placeBid(a,player){if(!canBid(a,player))throw Error('Mise impossible');const c=a.current;
 c.bid=c.leader===null?c.base:c.bid+BID_STEP;c.leader=player;c.turn=1-player;
 return a;
}
export function passBid(a,player){if(!canPass(a,player))throw Error('Plus de skip disponible');const c=a.current;
 if(c.leader!==null)return finish(a);
 if(canBid(a,player))a.skipsUsed[player]++; // passe gratuite si mise impossible
 c.passed[player]=true;
 if(c.passed[0]&&c.passed[1])return finish(a);
 c.turn=1-player;
 return a;
}
export function auctionSnapshot(a){return {round:a.index+1,total:a.rounds,turn:a.current?.turn??null,leader:a.current?.leader??null,bid:a.current?.bid??null,teams:a.teams.map(x=>x.length),budgets:[...a.budgets],skipsLeft:a.skipsUsed.map(n=>a.skipsLimit===Infinity?Infinity:Math.max(0,a.skipsLimit-n)),complete:a.complete};}
