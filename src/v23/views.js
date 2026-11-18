import {offerFace,E} from '../v22/views.js';
import {RELIC_BY_ID} from '../v22/relics.js';
import {registry} from '../v20/catalog.js';
export function rewardsMarkup23(r,hud,asset){
 const b=r.rewardBundle,s=b.stage,stage=b.stages[s],c=registry(r.worlds,r.statsMode),boss=!!b.boss;
 const titles=boss
  ?['Un allié du gardien.','Une arme du butin.','Choisis ta relique.']
  :['Un allié pour la suite.','Arme ou objet de route.','Reprendre son souffle.'];
 const copy=boss
  ?['Choisis 1 allié parmi 3 (dont un mystère).','Choisis 1 arme parmi 3 (dont un mystère).','L’équipe est soignée à 100 %. Une relique révélée, une mystère.']
  :['Choisis un personnage. Tu choisiras ensuite une arme ou un objet, puis ton dernier bonus.','Choisis une arme, un outil ou un soin. Il rejoint ton sac.','Soigne tous les vivants ou laisse le destin t’offrir une relique.'];
 const steps=boss?['Personnage','Arme','Relique']:['Personnage','Équipement','Soin ou relique'];
 const disabled=(o,i)=>o.disabled||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==i;
 const gearLabel=o=>o.kind==='object'?(o.category==='consommable'?'UN SOIN':'UN OUTIL'):'UNE ARME';
 const mysteryHint=s===0?'Un personnage':s===1?(boss?'Une arme':'Arme ou objet'):'Une surprise';
 const claimLabel=o=>{
  if(o.type==='hero'||o.type==='hero_pack')return '♟ '+(o.cards?o.cards.map(x=>E(c.byId.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byId.get(o.cardId)?.name));
  if(o.type==='weapon'||o.type==='object'||o.type==='weapon_pack')return (o.type==='object'?'🎒 ':'⚔ ')+(o.cards?o.cards.map(x=>E(c.byItem.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byItem.get(o.cardId)?.name));
  if(o.type==='relic')return E(RELIC_BY_ID.get(o.id)?.name);
  if(o.type==='heal')return '＋ Soin';
  return '+'+o.amount+' Ƶ';
 };
 const cardOffers=r.rewards.filter(o=>o.kind);
 return `${hud}<section class="v22-loot v23-victory ${boss?'v23-boss-loot':''}" data-reward-stage="${s}" data-boss="${boss?1:0}" aria-label="Récompenses de victoire"><header class="v22-screen-head"><span class="v22-victory-seal" aria-hidden="true">✦</span><span class="a-eyebrow">${boss?'VICTOIRE DE BOSS · 1 CHOIX PAR ÉTAPE':'VICTOIRE · TROIS GAINS À EMPORTER'}</span><h1 tabindex="-1">${titles[s]}</h1><p>${copy[s]}</p><ol class="v23-reward-steps">${steps.map((label,i)=>`<li class="${i<s?'done':i===s?'current':''}" ${i===s?'aria-current="step"':''}><span>${i<s?'✓':i+1}</span><b>${label}</b></li>`).join('')}</ol> <div class="v22-victory-gains"><span>+${r.lastCoinGain||0} Ƶ</span><span>${boss?'Équipe soignée à 100 %':'XP attribuée'}</span></div></header>
 ${s<2?`<div class="v22-loot-cards">${cardOffers.map((o)=>{const i=r.rewards.indexOf(o);return `<article><span class="v22-choice-label">${i===2?'LE MYSTÈRE':s===0?'UN ALLIÉ':boss?'UNE ARME':gearLabel(o)}</span><button class="v22-card-pick ${i===2?'v22-mystery':''}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)?'disabled':''} aria-label="${o.disabled?'Aucun candidat':i===2?'Choisir le mystère':s===0?'Recruter '+E(c.byId.get(o.id)?.name):'Emporter '+E(c.byItem.get(o.id)?.name)}">${o.disabled?'<strong>Palier épuisé</strong>':i===2?`<span class="v20-locked-mystery v22-mystery-face" aria-hidden="true"><span class="v16-offer-kind">LE DESTIN GARDE SON SECRET</span><div class="v14-mystery-orbit"><span>?</span></div><small>UN DESTIN INCONNU</small><strong>Tenter le destin</strong><em>${mysteryHint} · révélé après ton choix</em></span>`:offerFace(r,o)}</button>${i<2&&!o.disabled?`<button class="a-button light v22-eye" data-a="inspect" data-id="${E(o.id)}" data-inspect-finish="${E(o.finish)}">Voir les effets</button>`:''}</article>`;}).join('')}</div>`:''}
 <div class="v22-loot-alternatives ${s===2?'v23-boons':''}">${r.rewards.map((o,i)=>({o,i})).filter(({o})=>!o.kind).map(({o,i})=>{
  const mysteryRelic=o.type==='relic'&&o.revealed===false;
  return `<button class="v22-loot-alt ${E(o.type)} ${mysteryRelic?'v22-mystery':''}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)?'disabled':''} style="--alt-art:url('${asset('assets/v22/scenes/'+(o.type==='heal'?'rest':o.type==='relic'?'observatory':'treasure')+'.webp')}')"><i aria-hidden="true">${o.type==='heal'?'＋':o.type==='relic'?'◇':'Ƶ'}</i><span><b>${mysteryRelic?'Relique mystère':E(o.title)}</b><small>${o.type==='heal'?o.disabled?'Tous les vivants sont déjà en pleine santé':'+25 % PV aux vivants':o.type==='relic'?o.disabled?'Toutes les reliques de ce palier sont acquises':(mysteryRelic?'Le destin choisit une relique du palier':E(RELIC_BY_ID.get(o.id)?.text||'Une relique du palier')):E(o.text||'+'+o.amount+' zénis')}</small></span><em>→</em></button>`;
 }).join('')}</div>
 ${b.claims.length?`<aside class="v23-earned" aria-label="Déjà emporté"><span>ACQUIS</span>${b.claims.map(o=>`<span>${claimLabel(o)}</span>`).join('')}</aside>`:''}</section>`;
}
