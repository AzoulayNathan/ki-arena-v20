import {registry} from './catalog.js';
import {collectionState} from './collection-rewards.js';
import {normalizeEdition} from '../v19/card-spec.js';
import {isSpecialEdition} from '../arena/rules.js';

export const ROSTER_HEROES=6;
export const ROSTER_WEAPONS=3;

function unitEdition(r,cardId,finish){
  if(normalizeEdition(finish)==='special')return 'special';
  return isSpecialEdition(r.seed,cardId)?'special':'normal';
}

/** Owned hero exemplars from collection (id + finish). */
export function ownedHeroExemplars(worlds){
  try{
    const owned=collectionState().cards||[];
    const c=registry(worlds);
    return owned
      .filter(o=>c.byId.has(o.id)&&worlds.includes(c.byId.get(o.id).universe))
      .map(o=>({id:o.id,finish:normalizeEdition(o.finish)==='special'?'special':'normal',seed:o.seed||'ARENA'}));
  }catch{return [];}
}

/** Weapons available once heroes are chosen (same universes). */
export function rosterWeaponPool(r){
  const c=registry(r.worlds,r.statsMode);
  const universes=new Set((r.roster?.heroes||[]).map(id=>c.byId.get(id)?.universe).filter(Boolean));
  if(!universes.size)return c.weapons.filter(g=>r.worlds.includes(g.universe));
  return c.weapons.filter(g=>universes.has(g.universe));
}

export function beginRoster(r){
  r.useCollection=true;
  r.phase='roster';
  r.step=0;
  r.offers=[];
  r.units=[];
  r.items=[];
  r.roster={heroes:[],weapons:[]};
  return true;
}

export function toggleRosterHero(r,cardId){
  if(r.phase!=='roster')return false;
  const list=r.roster.heroes;
  const i=list.indexOf(cardId);
  if(i>=0){
    list.splice(i,1);
    // Drop weapons that no longer match remaining universes.
    const ok=new Set(rosterWeaponPool(r).map(g=>g.id));
    r.roster.weapons=r.roster.weapons.filter(id=>ok.has(id));
    return true;
  }
  if(list.length>=ROSTER_HEROES)return false;
  const owned=ownedHeroExemplars(r.worlds);
  if(!owned.some(o=>o.id===cardId))return false;
  // Unique person identities.
  const c=registry(r.worlds,r.statsMode);
  const person=c.byId.get(cardId)?.person;
  if(person&&list.some(id=>c.byId.get(id)?.person===person))return false;
  list.push(cardId);
  return true;
}

export function toggleRosterWeapon(r,cardId){
  if(r.phase!=='roster')return false;
  const list=r.roster.weapons;
  const i=list.indexOf(cardId);
  if(i>=0){list.splice(i,1);return true;}
  if(list.length>=ROSTER_WEAPONS)return false;
  if(!rosterWeaponPool(r).some(g=>g.id===cardId))return false;
  list.push(cardId);
  return true;
}

export function confirmRoster(r){
  if(r.phase!=='roster')return false;
  if((r.roster?.heroes||[]).length!==ROSTER_HEROES)return false;
  if((r.roster?.weapons||[]).length!==ROSTER_WEAPONS)return false;
  const c=registry(r.worlds,r.statsMode);
  const owned=ownedHeroExemplars(r.worlds);
  r.units=[];
  r.items=[];
  r.uid=0;
  for(const id of r.roster.heroes){
    const h=c.byId.get(id);
    if(!h)return false;
    const fin=owned.find(o=>o.id===id)?.finish;
    r.units.push({
      uid:'u'+(++r.uid),cardId:h.id,level:1,wins:0,
      hp:h.maxHp,maxHp:h.maxHp,attack:h.attack,speed:h.speed,
      weapon:null,armor:null,edition:unitEdition(r,h.id,fin),fromCollection:true,
    });
  }
  for(const id of r.roster.weapons){
    const g=c.byItem.get(id);
    if(!g)return false;
    r.items.push({uid:'g'+(++r.uid),cardId:g.id,fromCollection:true});
  }
  delete r.roster;
  delete r.offers;
  r.phase='map';
  return true;
}
