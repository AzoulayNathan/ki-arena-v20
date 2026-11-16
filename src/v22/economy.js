import {beginRewards23} from '../v23/rewards.js';
import {registry} from '../v20/catalog.js';
import {drawCard,addHero,addItem,contextPower,effectiveGear,sortedPool} from './power.js';
import {drawRelic,relicValue,RELIC_BY_ID} from './relics.js';
import {pick,shuffle,rollFinish} from './random.js';
export function coinGain(r){const p=contextPower(r),base=24+3*p.v+(p.kind==='boss'?24:p.kind==='elite'?12:0);return Math.round(base*(1+relicValue(r,'victory_coins')));}
export function rewardOptions22(r){
 if(r.rewardSchema===3&&r.pending)return beginRewards23(r);
 const used=new Set(),cards=['hero','weapon',pick(r,['hero','weapon'])].map((kind,i)=>{const o=drawCard(r,kind,i===2?'mystery':'midA',{exclude:used});if(o.id)used.add(o.id);return {...o,type:i===2?'mystery':kind==='hero'?'recruit':'item',revealed:i<2,title:i===2?'Le destin caché':kind==='hero'?'Un nouvel allié':'Une nouvelle arme'};});
 // Trésor : draft cartes seul — pas de choix soin / relique.
 if(!r.pending)return cards;
 return [...cards,{type:'heal',amount:.25,title:'Souffle partagé',disabled:!r.units.some(u=>u.hp<u.maxHp)},...(()=>{const id=drawRelic(r);return [{type:'relic',id,title:'Une relique inconnue',disabled:!id}];})()];
}
export function priceFor(r,kind,id,finish='black'){const c=registry(r.worlds,r.statsMode),full=sortedPool(r,kind),rank=full.find(x=>x.id===id)?.globalRank||1,p=rank/full.length,h=kind==='hero'?c.byId.get(id):c.byItem.get(id);if(!h)return null;return Math.round(((kind==='hero'?42:24)+(kind==='hero'?110:80)*p)*(finish==='gold'?1.2:1)*(1-relicValue(r,'shop_discount')));}
export function stockShop22(r){const stock=[],c=registry(r.worlds,r.statsMode);for(const kind of ['hero','hero','weapon','weapon','weapon','weapon']){let o=drawCard(r,kind,'midB',{exclude:new Set(stock.filter(x=>x.kind===kind).flatMap(x=>[x.id,'person:'+x.person]))});if(o.disabled&&kind==='weapon'){
 // A shelf needs four actual weapons even when a tiny discrete window holds fewer IDs.
 // Nearest compatible neighbours only; never random full-catalog promotion.
 const b=o.bounds,full=sortedPool(r,kind).filter(g=>r.units.some(u=>c.byId.get(u.cardId)?.universe===g.universe)&&!stock.some(x=>x.id===g.id)).sort((a,b2)=>Math.abs(a.globalRank-(b.lo+b.hi)/2)-Math.abs(b2.globalRank-(b.lo+b.hi)/2)||a.id.localeCompare(b2.id));
 const g=full[0];if(g)o={...o,id:g.id,universe:g.universe,globalRank:g.globalRank,sourceSize:o.bounds.N,finish:rollFinish(r),disabled:false,quantizedShelf:true};
 }stock.push({...o,bought:false,price:o.id?priceFor(r,kind,o.id,o.finish):0});}r.shop=stock;r.careBought=false;}
export function removeUnit22(r,uid,reason='transfer'){if(r.units.length<=1)return false;const i=r.units.findIndex(x=>x.uid===uid);if(i<0)return false;const [u]=r.units.splice(i,1);(r.departed??=[]).push({...u,weapon:null,armor:null,reason});return true;}
export function chooseReward22(r,index,replaceUid=null){if(r.phase!=='reward'||!Number.isInteger(index)||r.rewardClaimed||r.nodes.find(n=>n.id===r.current)?.done||!r.nodes.some(n=>n.id===r.current))return false;const rw=r.rewards[index];if(!rw||rw.disabled||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==index)return false;const hero=rw.kind==='hero'||rw.type==='recruit';if(hero&&r.units.length>=8){if(!replaceUid||!removeUnit22(r,replaceUid,'reward-swap'))return false;}
 if(hero){if(!addHero(r,rw.id,rw.finish))return false;}else if(rw.kind==='weapon'||rw.type==='item')addItem(r,rw.id,rw.finish);else if(rw.type==='heal'){for(const u of r.units)if(u.hp>0)u.hp=Math.min(u.maxHp,u.hp+Math.round(u.maxHp*.25));}else if(rw.type==='relic'){if(!RELIC_BY_ID.has(rw.id)||(r.relics||[]).includes(rw.id))return false;(r.relics??=[]).push(rw.id);}
 r.rewardClaimed=true;r.rewardLockedIndex=null;return true;}
export function lockReward22(r,index){const o=r.rewards[index];if(r.phase!=='reward'||!o||o.disabled||r.rewardClaimed||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==index)return false;r.rewardLockedIndex=index;return true;}
export function buy22(r,index,replaceUid=null){if(r.phase!=='shop')return false;const o=r.shop[index];if(!o||o.disabled||o.bought||r.coins<o.price)return false;if(o.kind==='hero'&&r.units.length>=8&&(!replaceUid||!removeUnit22(r,replaceUid,'merchant-swap')))return false;r.coins-=o.price;o.bought=true;if(o.kind==='hero')addHero(r,o.id,o.finish);else addItem(r,o.id,o.finish);return true;}
export function sellHeroPrice(r,uid){const u=r.units.find(x=>x.uid===uid);if(!u)return null;return Math.max(1,Math.floor(priceFor(r,'hero',u.cardId,u.finish)*.35));}
export function sellHero22(r,uid){if(r.phase!=='shop'||r.units.length<=1)return false;const price=sellHeroPrice(r,uid);if(price==null||!removeUnit22(r,uid,'merchant-sale'))return false;r.coins+=price;return true;}
export function sellItemPrice22(r,uid){const x=r.items.find(x=>x.uid===uid);if(!x)return null;return Math.max(1,Math.floor(priceFor(r,'weapon',x.cardId,x.finish)*.35));}
