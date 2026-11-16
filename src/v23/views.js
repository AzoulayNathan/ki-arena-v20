import {offerFace,E} from '../v22/views.js';
import {RELIC_BY_ID} from '../v22/relics.js';
import {registry} from '../v20/catalog.js';
export function rewardsMarkup23(r,hud,asset){
 const b=r.rewardBundle,s=b.stage,stage=b.stages[s],c=registry(r.worlds,r.statsMode),boss=!!b.boss;
 const titles=boss
  ?['Trois alliés du gardien.','Trois armes du butin.','Choisis ta relique.']
  :['Un allié pour la suite.','Arme ou objet de route.','Reprendre son souffle.'];
 const copy=boss
  ?['Les trois personnages sont à toi. Ils rejoignent l’équipe d’un coup.','Les trois armes rejoignent le sac. Ensuite, deux reliques.','L’équipe est déjà soignée à 100 %. Choisis une des deux reliques.']
  :['Choisis un personnage. Tu choisiras ensuite une arme ou un objet, puis ton dernier bonus.','Choisis une arme, un outil ou un soin. Il rejoint ton sac.','Soigne tous les vivants ou laisse le destin t’offrir une relique.'];
 const steps=boss?['Personnages','Armes','Relique']:['Personnage','Équipement','Soin ou relique'];
 const disabled=(o,i)=>o.disabled||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==i;
 const gearLabel=o=>o.kind==='object'?(o.category==='consommable'?'UN SOIN':'UN OUTIL'):'UNE ARME';
 const mysteryHint=s===0?'Un personnage':s===1?'Arme ou objet':'Une surprise';
 const packReady=boss&&s<2&&r.rewards.some(o=>o.kind&&!o.disabled);
 const packIndex=r.rewards.findIndex(o=>o.kind&&!o.disabled);
 const packLabel=s===0?'Emporter les 3 alliés →':'Emporter les 3 armes →';
 const claimLabel=o=>{
  if(o.type==='hero'||o.type==='hero_pack')return '♟ '+(o.cards?o.cards.map(x=>E(c.byId.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byId.get(o.cardId)?.name));
  if(o.type==='weapon'||o.type==='object'||o.type==='weapon_pack')return (o.type==='object'?'🎒 ':'⚔ ')+(o.cards?o.cards.map(x=>E(c.byItem.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byItem.get(o.cardId)?.name));
  if(o.type==='relic')return E(RELIC_BY_ID.get(o.id)?.name);
  if(o.type==='heal')return '＋ Soin';
  return '+'+o.amount+' Ƶ';
 };
 return `${hud}<section class="v22-loot v23-victory ${boss?'v23-boss-loot':''}" data-reward-stage="${s}" data-boss="${boss?1:0}" aria-label="Récompenses de victoire"><header class="v22-screen-head"><span class="v22-victory-seal" aria-hidden="true">✦</span><span class="a-eyebrow">${boss?'VICTOIRE DE BOSS · BUTIN COMPLET':'VICTOIRE · TROIS GAINS À EMPORTER'}</span><h1 tabindex="-1">${titles[s]}</h1><p>${copy[s]}</p><ol class="v23-reward-steps">${steps.map((label,i)=>`<li class="${i<s?'done':i===s?'current':''}" ${i===s?'aria-current="step"':''}><span>${i<s?'✓':i+1}</span><b>${label}</b></li>`).join('')}</ol> <div class="v22-victory-gains"><span>+${r.lastCoinGain||0} Ƶ</span><span>${boss?'Équipe soignée à 100 %':'XP attribuée'}</span></div></header>
 ${s<2?`<div class="v22-loot-cards">${r.rewards.filter(o=>o.kind).map((o,i)=>`<article><span class="v22-choice-label">${boss?(s===0?'ALLIÉ':'ARME'):(i===2?'LE MYSTÈRE':s===0?'UN ALLIÉ':gearLabel(o))}</span><button class="v22-card-pick ${!boss&&i===2?'v22-mystery':''}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)||boss?'disabled':''} aria-label="${o.disabled?'Aucun candidat':boss?(s===0?E(c.byId.get(o.id)?.name):E(c.byItem.get(o.id)?.name)):i===2?'Choisir le mystère':s===0?'Recruter '+E(c.byId.get(o.id)?.name):'Emporter '+E(c.byItem.get(o.id)?.name)}">${o.disabled?'<strong>Palier épuisé</strong>':!boss&&i===2?`<span class="v20-locked-mystery v22-mystery-face" aria-hidden="true"><span class="v16-offer-kind">LE DESTIN GARDE SON SECRET</span><div class="v14-mystery-orbit"><span>?</span></div><small>UN DESTIN INCONNU</small><strong>Tenter le destin</strong><em>${mysteryHint} · révélé après ton choix</em></span>`:offerFace(r,o)}</button>${(boss||i<2)&&!o.disabled?`<button class="a-button light v22-eye" data-a="inspect" data-id="${E(o.id)}" data-inspect-finish="${E(o.finish)}">Voir les effets</button>`:''}</article>`).join('')}</div>${packReady?`<div class="v23-boss-claim"><button class="a-button primary" data-a="reward" data-index="${packIndex}" data-reward-token="${E(r.rewards[packIndex].claimToken)}">${packLabel}</button></div>`:''}`:''}
 <div class="v22-loot-alternatives ${s===2?'v23-boons':''}">${r.rewards.map((o,i)=>({o,i})).filter(({o})=>!o.kind).map(({o,i})=>`<button class="v22-loot-alt ${E(o.type)}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)?'disabled':''} style="--alt-art:url('${asset('assets/v22/scenes/'+(o.type==='heal'?'rest':o.type==='relic'?'observatory':'treasure')+'.webp')}')"><i aria-hidden="true">${o.type==='heal'?'＋':o.type==='relic'?'◇':'Ƶ'}</i><span><b>${E(o.title)}</b><small>${o.type==='heal'?o.disabled?'Tous les vivants sont déjà en pleine santé':'+25 % PV aux vivants':o.type==='relic'?o.disabled?'Toutes les reliques de ce palier sont acquises':(boss?E(RELIC_BY_ID.get(o.id)?.text||'Une relique du palier'):'Une relique compatible avec ce palier'):E(o.text||'+'+o.amount+' zénis')}</small></span><em>→</em></button>`).join('')}</div>
 ${b.claims.length?`<aside class="v23-earned" aria-label="Déjà emporté"><span>ACQUIS</span>${b.claims.map(o=>`<span>${claimLabel(o)}</span>`).join('')}</aside>`:''}</section>`;
}
