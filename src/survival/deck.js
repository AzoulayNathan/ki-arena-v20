import {shuffle} from './random.js';
export function drawCards(deck,n=1){const count=Math.min(n,deck.pile.length);deck.hand.push(...deck.pile.splice(0,count));return count;}
export function makeDeck(run,heroes,items,initial=3){const d={pile:shuffle(run,[...heroes.map(id=>({type:'hero',id})),...items.map(id=>({type:'gear',id}))]),hand:[],discard:[]};drawCards(d,initial);if(heroes.length&&!d.hand.some(x=>x.type==='hero')){const i=d.pile.findIndex(x=>x.type==='hero');if(i>=0){const c=d.pile.splice(i,1)[0];d.pile.push(d.hand.pop());d.hand.push(c);}}return d;}
export function bonusDraw(combat,deck,n){const state=deck===combat.deck?'bonus':'enemyBonus',take=Math.min(n,2-combat[state]);combat[state]+=drawCards(deck,Math.max(0,take));return take;}
export function removeHero(deck,id){for(const key of ['pile','hand','discard'])deck[key]=deck[key].filter(x=>!(x.type==='hero'&&x.id===id));}
