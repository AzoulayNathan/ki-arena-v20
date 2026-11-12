import {runCatalog,battleCard,equip} from '../v20/router.js';
import {effectDescription} from '../v19/catalog.js';
import {contextToken} from '../arena/transactions.js';
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function equipmentPreview(run,itemUid,unitUid){const u=run.units.find(u=>u.uid===unitUid);if(!u)return {ok:false,reason:'Combattant absent'};const copy=structuredClone(run),before=battleCard(run,u),success=equip(copy,itemUid,unitUid);if(!success)return {ok:false,reason:['combat','end'].includes(run.phase)?'Équipement verrouillé pendant le combat':'Univers incompatible ou soin inutile'};const next=copy.units.find(x=>x.uid===unitUid),after=battleCard(copy,next);return {ok:true,before,after,hpBefore:u.hp,hpAfter:next.hp,removed:!copy.items.some(x=>x.uid===itemUid),unequipped:u.weapon===itemUid||u.armor===itemUid};}
export function inventoryMarkup({run,selectedItem,filter='',selectedReserve,cardMarkup}){
  const c=runCatalog(run),locked=['combat','end'].includes(run.phase),entry=run.items.find(x=>x.uid===selectedItem),chosen=c.byItem.get(entry?.cardId),owner=chosen&&run.units.find(u=>u.weapon===selectedItem||u.armor===selectedItem),filtered=run.items.filter(x=>!filter||c.byItem.get(x.cardId)?.category===filter);
  return `<div class="a-modal-title v193-inventory-title"><div><span class="a-eyebrow">L’ATELIER DE TON ÉQUIPE</span><h2>Prépare le prochain choc.</h2></div><button class="a-button light" data-a="close">Fermer ×</button></div>
  <p class="v193-inv-instruction">${locked?'Pendant le combat, observe ton équipe. Tu pourras l’équiper dès la fin de l’affrontement.':chosen?E(chosen.name)+' sélectionné : clique maintenant sur un personnage compatible en dessous (encadré vert) pour lui confier !':'Clique sur une arme ou un soin dans ton sac ci-dessous, puis clique sur le personnage qui doit le porter.'}${owner?' Objet actuellement confié à '+E(c.byId.get(owner.cardId).name)+'.':''}</p>
  ${chosen?'<div class="v193-item-effect"><b>'+E(chosen.name)+'</b><span>'+E(effectDescription(chosen))+' · Univers '+E(chosen.universe)+'</span><button type="button" class="a-button text" data-a="cancel-item">Désélectionner ×</button></div>':''}
  <div class="v193-bag-head"><h3>Dans ton sac (${run.items.length})</h3><div class="v193-bag-filters">${[['','Tout'],['arme','Armes'],['armure','Armures'],['outil','Outils'],['consommable','Soins']].map(([v,n])=>`<button type="button" class="a-button ${filter===v?'selected':'light'}" data-a="item-filter" data-id="${v}">${n}</button>`).join('')}</div></div>
  <section class="v193-bag" aria-label="Équipements disponibles">${filtered.map(x=>{
    const g=c.byItem.get(x.cardId),itemOwner=run.units.find(u=>u.weapon===x.uid||u.armor===x.uid),isSel=selectedItem===x.uid;
    return `<article class="v193-gear ${isSel?'selected':''}">
      <button type="button" class="v193-gear-select" data-a="${isSel?'cancel-item':'pick-item'}" data-id="${x.uid}" ${locked?'disabled':''} aria-pressed="${isSel}" aria-label="Choisir ${E(g.name)}">
        <div class="a-item v19-item">
          <div class="v19-gear-face">${cardMarkup({...g,effects:[{name:effectDescription(g),type:g.effect}]},{seed:run.seed,equipment:true})}</div>
          <div class="v19-gear-copy"><h3>${E(g.name)}</h3><p>${E(effectDescription(g))}</p></div>
        </div>
        <span>${isSel?'✓ Sélectionné — choisis un porteur':(itemOwner?'Lié à '+E(c.byId.get(itemOwner.cardId).name):'Cliquer pour équiper · '+E(g.universe))}</span>
      </button>
      <div class="v20-gear-side-tools">
        <button type="button" class="v20-gear-eye" data-a="inventory-preview" data-id="${E(g.id)}" title="Voir la carte" aria-label="Voir ${E(g.name)}">👁</button>
        <button type="button" class="v193-drag" data-drag-item="${x.uid}" data-label="${E(g.name)}" data-context="${E(contextToken(run))}" data-a="pick-item" data-id="${x.uid}" ${locked?'disabled':''} aria-label="Glisser ${E(g.name)} sur un personnage">⠿</button>
      </div>
    </article>`;
  }).join('')||'<p class="v193-empty-bag">Aucun objet ici. Les armes et soins trouvés sur la route apparaîtront dans ce sac.</p>'}</section>
  <section class="v193-roster" aria-label="Personnages et aperçu des équipements">${run.units.map((u,i)=>{
    const h=c.byId.get(u.cardId),stats=battleCard(run,u),preview=chosen?equipmentPreview(run,selectedItem,u.uid):null,w=c.byItem.get(run.items.find(x=>x.uid===u.weapon)?.cardId),a=c.byItem.get(run.items.find(x=>x.uid===u.armor)?.cardId);
    const canAssign=!locked&&chosen&&preview?.ok;
    return `<article class="v193-member ${i>4?'reserve':''}" data-member="${u.uid}">
      <button type="button" class="v193-equip-target ${preview?.ok?'compatible':''}" data-a="${chosen?(preview?.ok?'assign-item':'assign-blocked'):'inventory-preview'}" data-id="${chosen?u.uid:h.id}" data-drop-unit="${u.uid}" aria-label="${chosen?(preview?.unequipped?'Retirer '+E(chosen.name)+' de ':'Confier '+E(chosen.name)+' à '):'Aperçu de '}${E(h.name)}" aria-disabled="${locked||(!!chosen&&!preview?.ok)}" ${locked?'disabled':''}>
        ${cardMarkup({...h,attack:stats.attack,maxHp:stats.maxHp,speed:stats.speed},{seed:run.seed})}
        <span class="v193-member-name">${E(h.name)}</span>
        <small>${i<5?'ACTIF':'RÉSERVE'} · ${E(h.universe)} · ${Math.round(u.hp/u.maxHp*100)} % PV</small>
        <span class="v193-inv-hp"><i style="width:${u.hp/u.maxHp*100}%"></i></span>
        ${preview?.ok?`<span class="v193-comparison">${[['ATQ','attack'],['VIT','speed'],['PV','maxHp']].map(([l,k])=>`<span>${l} <b>${preview.before[k]}</b>${preview.after[k]!==preview.before[k]?` → <strong class="${preview.after[k]>preview.before[k]?'gain':'loss'}">${preview.after[k]}</strong>`:' <em>=</em>'}</span>`).join('')}${chosen&&chosen.category!=='consommable'&&((chosen.category==='armure'?a:w))&&!preview.unequipped?`<span class="v193-replace">Remplace ${E((chosen.category==='armure'?a:w).name)}</span>`:''}${preview.hpAfter!==preview.hpBefore?`<span>Soin <strong class="gain">+${preview.hpAfter-preview.hpBefore} PV</strong></span>`:''}</span><span class="v193-equip-cta">${preview.unequipped?'Retirer l’objet':'✓ Confier cet objet'} →</span>`:chosen?'<span class="v193-incompatible">'+(h.universe!==chosen.universe?'Univers '+E(h.universe)+' (arme '+E(chosen.universe)+')':'Soin inutile (PV max)')+'</span>':''}
      </button>
      ${canAssign?`<button type="button" class="a-button primary v20-equip-direct" data-a="assign-item" data-id="${u.uid}">${preview.unequipped?'Retirer':'Équiper'} →</button>`:''}
      <div class="v193-slots"><button type="button" data-a="${w?'inventory-preview':'item-filter'}" data-id="${w?E(w.id):'arme'}" title="${w?'Voir '+E(w.name):'Voir les armes'}"><b>⚔</b><span>${E(w?.name||'Arme libre')}</span></button><button type="button" data-a="${a?'inventory-preview':'item-filter'}" data-id="${a?E(a.id):'armure'}" title="${a?'Voir '+E(a.name):'Voir les armures'}"><b>⬡</b><span>${E(a?.name||'Armure libre')}</span></button></div>
      ${i>=5?`<button type="button" class="a-button light" data-a="pick-reserve" data-id="${u.uid}" ${locked?'disabled':''}>${selectedReserve===u.uid?'Choisis un actif':'Faire entrer'}</button>`:selectedReserve?`<button type="button" class="a-button primary" data-a="swap-target" data-index="${i}" ${!['map','prepare'].includes(run.phase)?'disabled':''}>Remplacer cet actif</button>`:''}
    </article>`;
  }).join('')}</section>
  <details class="v193-inv-help"><summary>Comprendre les emplacements et les réserves</summary><p>Un personnage porte une arme et une armure de son univers. Les outils utilisent la place de l’arme. Confier un objet déjà porté le déplace ; choisir son porteur actuel le retire. Un soin est consommé. Les cinq premiers personnages combattent, les suivants restent en réserve.</p><p>${run.dead.length?'K.O. : '+run.dead.map(u=>E(c.byId.get(u.cardId).name)).join(' · '):'Aucun compagnon perdu.'}</p></details>`;
}
