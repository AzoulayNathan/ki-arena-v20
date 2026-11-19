import {offerFace,E} from '../v22/views.js';
import {RELIC_BY_ID} from '../v22/relics.js';
import {registry} from '../v20/catalog.js';

export function actBoonMarkup23(r,hud,asset){
 const offers=r.actBoon?.offers||r.rewards||[];
 return `${hud}<section class="v22-loot v23-victory v23-act-boon" data-reward-stage="act" aria-label="Choix de début d’acte"><header class="v22-screen-head"><span class="v22-victory-seal" aria-hidden="true">◈</span><span class="a-eyebrow">ACTE ${r.act+1} · LE CHAPITRE S’OUVRE</span><h1 tabindex="-1">Trois chemins. Un seul.</h1><p>Le gardien est tombé. Avant la nouvelle carte : soigne l’équipe, prends une relique, ou ouvre un trésor digne d’un élite de cet acte.</p></header>
 <div class="v22-loot-alternatives v23-boons v23-act-choices">${offers.map((o,i)=>{
  const art=o.type==='heal'?'rest':o.type==='relic'?'observatory':'treasure';
  const icon=o.type==='heal'?'＋':o.type==='relic'?'◇':'◆';
  const detail=o.type==='heal'
   ?(o.disabled?'Tous les vivants sont déjà en pleine santé':'Soin complet · 100 % PV')
   :o.type==='relic'
    ?(o.disabled?'Aucune relique restante dans ce palier':E(RELIC_BY_ID.get(o.id)?.text||'Une relique du palier'))
    :o.type==='coins'
     ?E(o.text||('+'+(o.amount||0)+' zénis'))
     :E(o.text||'Butin d’élite de l’acte');
  const label=o.type==='treasure'||o.kind
   ?E(registry(r.worlds,r.statsMode).byItem.get(o.id)?.name||o.title)
   :E(o.title);
  return `<button class="v22-loot-alt ${E(o.type||'treasure')}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken||'')}" ${o.disabled?'disabled':''} style="--alt-art:url('${asset('assets/v22/scenes/'+art+'.webp')}')"><i aria-hidden="true">${icon}</i><span><b>${label}</b><small>${detail}</small></span><em>→</em></button>`;
 }).join('')}</div></section>`;
}

export function rewardsMarkup23(r,hud,asset){
 const b=r.rewardBundle,s=b.stage,stage=b.stages[s],c=registry(r.worlds,r.statsMode),boss=!!b.boss;
 const titles=boss
  ?['Un allié du gardien.','Une arme du butin.']
  :['Un allié pour la suite.','Arme ou objet de route.','Reprendre son souffle.'];
 const copy=boss
  ?['Choisis 1 allié parmi 3 (dont un mystère).','Choisis 1 arme parmi 3 (dont un mystère). Soin, relique et trésor d’élite attendront le début du prochain acte.']
  :['Choisis un personnage. Tu choisiras ensuite une arme ou un objet, puis ton dernier bonus.','Choisis une arme, un outil ou un soin. Il rejoint ton sac.','Soigne tous les vivants ou laisse le destin t’offrir une relique.'];
 const steps=boss?['Personnage','Arme']:['Personnage','Équipement','Soin ou relique'];
 const disabled=(o,i)=>o.disabled||r.rewardLockedIndex!=null&&r.rewardLockedIndex!==i;
 const gearLabel=o=>o.kind==='object'?(o.category==='consommable'?'UN SOIN':'UN OUTIL'):'UNE ARME';
 const mysteryHint=s===0?'Un personnage':s===1?(boss?'Une arme':'Arme ou objet'):'Une surprise';
 const claimLabel=o=>{
  if(o.type==='hero'||o.type==='hero_pack')return '♟ '+(o.cards?o.cards.map(x=>E(c.byId.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byId.get(o.cardId)?.name));
  if(o.type==='weapon'||o.type==='object'||o.type==='weapon_pack'||o.type==='treasure')return (o.type==='object'?'🎒 ':'⚔ ')+(o.cards?o.cards.map(x=>E(c.byItem.get(x.cardId)?.name)).filter(Boolean).join(' · '):E(c.byItem.get(o.cardId||o.id)?.name));
  if(o.type==='relic')return E(RELIC_BY_ID.get(o.id)?.name);
  if(o.type==='heal')return '＋ Soin';
  return '+'+o.amount+' Ƶ';
 };
 const cardOffers=r.rewards.filter(o=>o.kind);
 const lastCardStage=boss?1:1;
 return `${hud}<section class="v22-loot v23-victory ${boss?'v23-boss-loot':''}" data-reward-stage="${s}" data-boss="${boss?1:0}" aria-label="Récompenses de victoire"><header class="v22-screen-head"><span class="v22-victory-seal" aria-hidden="true">✦</span><span class="a-eyebrow">${boss?'VICTOIRE DE BOSS · BUTIN DU GARDIEN':'VICTOIRE · TROIS GAINS À EMPORTER'}</span><h1 tabindex="-1">${titles[s]}</h1><p>${copy[s]}</p><ol class="v23-reward-steps">${steps.map((label,i)=>`<li class="${i<s?'done':i===s?'current':''}" ${i===s?'aria-current="step"':''}><span>${i<s?'✓':i+1}</span><b>${label}</b></li>`).join('')}</ol> <div class="v22-victory-gains"><span>+${r.lastCoinGain||0} Ƶ</span><span>${boss?'Soin & relique → prochain acte':'XP attribuée'}</span></div></header>
 ${s<=lastCardStage&&cardOffers.length?`<div class="v22-loot-cards">${cardOffers.map((o)=>{const i=r.rewards.indexOf(o);return `<article><span class="v22-choice-label">${i===2?'LE MYSTÈRE':s===0?'UN ALLIÉ':boss?'UNE ARME':gearLabel(o)}</span><button class="v22-card-pick ${i===2?'v22-mystery':''}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)?'disabled':''} aria-label="${o.disabled?'Aucun candidat':i===2?'Choisir le mystère':s===0?'Recruter '+E(c.byId.get(o.id)?.name):'Emporter '+E(c.byItem.get(o.id)?.name)}">${o.disabled?'<strong>Palier épuisé</strong>':i===2?`<span class="v20-locked-mystery v22-mystery-face" aria-hidden="true"><span class="v16-offer-kind">LE DESTIN GARDE SON SECRET</span><div class="v14-mystery-orbit"><span>?</span></div><small>UN DESTIN INCONNU</small><strong>Tenter le destin</strong><em>${mysteryHint} · révélé après ton choix</em></span>`:offerFace(r,o)}</button>${i<2&&!o.disabled?`<button class="a-button light v22-eye" data-a="inspect" data-id="${E(o.id)}" data-inspect-finish="${E(o.finish)}">Voir les effets</button>`:''}</article>`;}).join('')}</div>`:''}
 <div class="v22-loot-alternatives ${!boss&&s===2?'v23-boons':''}">${r.rewards.map((o,i)=>({o,i})).filter(({o})=>!o.kind).map(({o,i})=>{
  const mysteryRelic=o.type==='relic'&&o.revealed===false;
  return `<button class="v22-loot-alt ${E(o.type)} ${mysteryRelic?'v22-mystery':''}" data-a="reward" data-index="${i}" data-reward-token="${E(o.claimToken)}" ${disabled(o,i)?'disabled':''} style="--alt-art:url('${asset('assets/v22/scenes/'+(o.type==='heal'?'rest':o.type==='relic'?'observatory':'treasure')+'.webp')}')"><i aria-hidden="true">${o.type==='heal'?'＋':o.type==='relic'?'◇':'Ƶ'}</i><span><b>${mysteryRelic?'Relique mystère':E(o.title)}</b><small>${o.type==='heal'?o.disabled?'Tous les vivants sont déjà en pleine santé':'+25 % PV aux vivants':o.type==='relic'?o.disabled?'Toutes les reliques de ce palier sont acquises':(mysteryRelic?'Le destin choisit une relique du palier':E(RELIC_BY_ID.get(o.id)?.text||'Une relique du palier')):E(o.text||'+'+o.amount+' zénis')}</small></span><em>→</em></button>`;
 }).join('')}</div>
 ${b.claims.length?`<aside class="v23-earned" aria-label="Déjà emporté"><span>ACQUIS</span>${b.claims.map(o=>`<span>${claimLabel(o)}</span>`).join('')}</aside>`:''}</section>`;
}
