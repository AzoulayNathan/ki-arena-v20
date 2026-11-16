"""KI ARENA Survie Infinity V2 – reference rules engine, stdlib only.

This is a standalone rules engine / simulation, NOT an integration into the existing
KI ARENA front end. Uses real V5.2 / HxH catalogue stats and rows.
"""
from __future__ import annotations
from dataclasses import dataclass,field
from pathlib import Path
from typing import Literal
import csv,math,random,json,collections

ROOT=Path(__file__).resolve().parents[1]
EVOLUTIONS=ROOT/'catalogues'/'EVOLUTIONS_VALIDEES.csv'
SOURCES={
 'DB':ROOT/'catalogues'/'DB_CARTES_SOURCE.csv',
 'HXH':ROOT/'catalogues'/'HXH_CARTES_SOURCE.csv',
}
WEAPON_SOURCES={
 'DB':ROOT/'catalogues'/'EQUIPEMENTS_DB.csv',
 'HXH':ROOT/'catalogues'/'EQUIPEMENTS_HXH.csv',
}

@dataclass
class Hero:
 id:str; name:str; version:str; person_id:str; atk:int; hp:int; vit:int; rarity:str; rank:int=0
 level:int=1; xp:int=0; alive:bool=True; current_hp:int=0
 def __post_init__(self):
  if self.current_hp==0 and self.alive:self.current_hp=self.hp
 @property
 def power(self):return self.atk+self.hp+self.vit
 @property
 def max_hp(self):return self.hp

@dataclass
class Gear:
 id:str; name:str; category:str; rarity:str; tier:int; effect:str; atk_pct:int; shield_pct:int; heal_pct:int; draw:int; tempo:int

@dataclass
class DraftOffer:
 visible:list
 mystery:object
 def choose(self,index):
  if index==3:return self.mystery
  if index not in range(3):raise ValueError('Choisir 0, 1, 2 ou 3 (mystère).')
  return self.visible[index]

@dataclass
class EnemyEncounter:
 wave:int; kind:str; budget:int; ranks:list[int]; heroes:list[Hero]; gears:list[Gear]
 @property
 def enemy_slots(self):return len(self.heroes)
 @property
 def spent(self):return sum(self.ranks)

@dataclass
class CombatDeck:
 hero_ids:list[str]; gear_ids:list[str]; draw_pile:list[tuple[str,str]]=field(default_factory=list)
 hand:list[tuple[str,str]]=field(default_factory=list)
 discarded:list[tuple[str,str]]=field(default_factory=list)
 def init(self,rng):
  self.draw_pile=[('hero',x) for x in self.hero_ids]+[('gear',x) for x in self.gear_ids]
  rng.shuffle(self.draw_pile)
  self.hand=[];self.discarded=[]
  # Three cards initially, guarantee a recruit to avoid dead draw without mana
  self.draw(3)
  if self.hero_ids and not any(t=='hero' for t,_ in self.hand):
   starter=next((x for x in self.draw_pile if x[0]=='hero'),None)
   if starter:
    self.draw_pile.remove(starter)
    self.draw_pile.insert(0,self.hand.pop())
    self.hand.append(starter)
 def draw(self,n=1):
  actual=min(n,len(self.draw_pile));self.hand += self.draw_pile[:actual];self.draw_pile=self.draw_pile[actual:];return actual

class Catalog:
 def __init__(self,universe):
  self.universe=universe
  with SOURCES[universe].open(encoding='utf-8-sig',newline='') as f:
   rows=list(csv.DictReader(f,delimiter=';'))
  self.heroes=[]
  for row in rows:
   self.heroes.append(Hero(id=row['id'],name=row['nom'],version=row['version'],person_id=row.get('id_personnage','') or row['id'],atk=int(row['attaque']),hp=int(row['pv']),vit=int(row['vitesse']),rarity=row['rarete']))
  self.heroes.sort(key=lambda x:(x.power,x.id))
  for r,h in enumerate(self.heroes,1):h.rank=r
  self.by_id={h.id:h for h in self.heroes}
  with WEAPON_SOURCES[universe].open(encoding='utf-8-sig',newline='') as f:
   raw=[r for r in csv.DictReader(f,delimiter=';') if r['compatible_draft']=='oui']
  self.gear=[Gear(id=r['id'],name=r['nom'],category=r['classe'],rarity=r['rarete'],tier=int(r['rang_rarete']),effect=r['effet_principal'],atk_pct=int(r['attaque_bonus_pct']),shield_pct=int(r['armure_bouclier_pct']),heal_pct=int(r['soin_pct']),draw=int(r['pioche_supplementaire']),tempo=int(r['cout_action_equipement'])) for r in raw]
  self.gear.sort(key=lambda x:(x.tier,x.id))
  self.gear_by_id={w.id:w for w in self.gear}
  self.draft_weapons=[w for w in self.gear if w.category=='arme']
  self.evolutions={}
  if EVOLUTIONS.exists():
   with EVOLUTIONS.open(encoding='utf-8-sig',newline='') as f:
    for r in csv.DictReader(f,delimiter=';'):
     if r['univers']==universe and r['etat']=='VALIDE':
      if r['carte_source'] in self.by_id and r['carte_suivante'] in self.by_id:
       self.evolutions[r['carte_source']]=r['carte_suivante']
  self.N=len(self.heroes)
  assert self.N and len(self.by_id)==self.N


def rank_roll(rng:random.Random,lo:int,hi:int,scale:int):
 """Rank 0 is not a card. Convert 60-based draft windows to any pool size."""
 a=max(1,round(lo*scale/60));b=max(1,round(hi*scale/60));return rng.randint(min(a,b),max(a,b))

def offer_draft(pool,rng,excluded=None,excluded_person=None):
 """Three visible choices + a hidden mystery; no repeated identities."""
 excluded=set(excluded or ())
 excluded_person=set(excluded_person or ())
 seen=set();seen_people=set();result=[]
 def eligible(x):
  pid=getattr(x,'person_id',None)
  return x.id not in excluded and x.id not in seen and (not pid or (pid not in excluded_person and pid not in seen_people))
 def draw(lo,hi):
  lo_r=max(1,round(lo*len(pool)/60));hi_r=max(1,round(hi*len(pool)/60))
  choices=[x for idx,x in enumerate(pool,1) if lo_r<=idx<=hi_r and eligible(x)]
  if not choices:choices=[x for x in pool if eligible(x)]
  if not choices:raise ValueError('Plus de cartes disponibles pour ce draft.')
  return rng.choice(choices)
 for lo,hi in ((25,35),(25,35),(15,45),(0,60)):
  card=draw(lo,hi);seen.add(card.id)
  pid=getattr(card,'person_id',None)
  if pid:seen_people.add(pid)
  result.append(card)
 return DraftOffer(result[:3],result[3])


def rank_budget(N,wave,kind):
 offset={'normal':0,'elite':1,'boss':2}[kind]
 return max(1,round((N/20)*5*(wave+offset)))

def enemy_count(rng,N,budget,wave):
 # fixed to 5 once wave>=10, then +1 each time character-rank capacity is exceeded
 min_count=math.ceil(budget/N)
 if wave>=10:return max(5,min_count)
 feasible=[x for x in range(1,6) if x>=min_count and x<=budget]
 return rng.choice(feasible) if feasible else min_count

def distribute_exact(rng,N,budget,k):
 """100% exact distribution, unique ranks whenever mathematically possible.

 A unique solution exists iff k<=N and
 k(k+1)/2 <= budget <= k(2N-k+1)/2.
 At cap k*N, the only valid composition is k copies of rank N.
 """
 assert k<=budget<=k*N,(k,budget,N)
 lower_sum=k*(k+1)//2
 upper_sum=k*(2*N-k+1)//2
 if k<=N and lower_sum<=budget<=upper_sum:
  ranks=[];remaining=budget;previous=0
  for pos in range(k):
   rem=k-pos-1
   max_tail=rem*(2*N-rem+1)//2
   # strictly increasing positive unique ranks, with future feasibility
   lo=max(previous+1,remaining-max_tail)
   hi=min(N-rem,(remaining-(rem*(rem+1)//2))//(rem+1))
   if not lo<=hi:raise AssertionError((N,k,budget,pos,lo,hi))
   current=rng.randint(lo,hi)
   ranks.append(current);remaining-=current;previous=current
  assert remaining==0 and len(set(ranks))==k
 else:
  q,remainder=divmod(budget,k)
  ranks=[q+1]*remainder+[q]*(k-remainder)
  # Try small random pairwise transfers, retaining exact total and bounds.
  for _ in range(min(20,3*k)):
   a,b=rng.sample(range(k),2)
   d=rng.randint(1,min(30,N))
   if ranks[a]+d<=N and ranks[b]-d>=1:
    ranks[a]+=d;ranks[b]-=d
 rng.shuffle(ranks)
 assert len(ranks)==k and sum(ranks)==budget and 1<=min(ranks)<=max(ranks)<=N
 return ranks


def generate_enemy(catalog,wave,kind,rng):
 N=catalog.N;budget=rank_budget(N,wave,kind)
 k=enemy_count(rng,N,budget,wave)
 # Re-roll compositions for variety and minimal repetitions of the same identity.
 # Exact rank-budget is invariant in every attempt; forced duplicates at capacity stay.
 best_ranks=None;best_duplicate_identities=k+1
 for _ in range(16):
  candidate=distribute_exact(rng,N,budget,k)
  people=[catalog.heroes[x-1].person_id for x in candidate]
  repeat=len(people)-len(set(people))
  if repeat<best_duplicate_identities:
   best_ranks=candidate;best_duplicate_identities=repeat
  if repeat==0:break
 ranks=best_ranks
 heroes=[clone_hero(catalog.heroes[x-1]) for x in ranks]
 # Enemy equipment power and count increase slowly; no permanent stacking.
 # Rank budget remains exact and capped, weapon selection is an additional, visible axis.
 count=min(k,max(0,(wave-1)//5 + (kind=='elite') + (kind=='boss')))
 tier_max=min(5,max(1,1+(wave-1)//5 + (kind=='boss')))
 gear_pool=[g for g in catalog.gear if g.tier<=tier_max]
 gears=[]
 for _ in range(count):
  if gear_pool:gears.append(rng.choice(gear_pool))
 return EnemyEncounter(wave,kind,budget,ranks,heroes,gears)

def clone_hero(hero):
 return Hero(id=hero.id,name=hero.name,version=hero.version,person_id=hero.person_id,atk=hero.atk,hp=hero.hp,vit=hero.vit,rarity=hero.rarity,rank=hero.rank)

class Run:
 def __init__(self,catalog,seed=42):
  self.cat=catalog;self.rng=random.Random(seed);self.seed=seed
  self.heroes={};self.gears={};self.wave=1;self.gold=0;self.relics=[];self.consumables=[];self.combat_slots=3;self.dead={};self.history=[]
 def draft(self,character_choices=None,gear_choices=None):
  choices=character_choices or [self.rng.choice([0,1,2,3]) for _ in range(5)]
  weapon_choices=gear_choices or [self.rng.choice([0,1,2,3]) for _ in range(3)]
  report=[]
  for i in range(5):
   o=offer_draft(self.cat.heroes,self.rng,self.heroes,excluded_person={h.person_id for h in self.heroes.values()})
   picked=clone_hero(o.choose(choices[i]));self.heroes[picked.id]=picked
   report.append({'phase':'hero','index':i+1,'visible':[x.id for x in o.visible],'mystery':'???','picked':picked.id,'choice':choices[i]})
  for i in range(3):
   o=offer_draft(self.cat.draft_weapons,self.rng,self.gears)
   picked=o.choose(weapon_choices[i]);self.gears[picked.id]=picked
   report.append({'phase':'weapon','index':i+1,'visible':[x.id for x in o.visible],'mystery':'???','picked':picked.id,'choice':weapon_choices[i]})
  self.history.append({'draft':report})
  return report
 def apply_reward(self,reward,enemy=None,choice_id=None):
  """Apply selected reward. Return a structured change; no silent invented recruit."""
  if reward=='or':
   gain=12+5*self.wave;self.gold+=gain;return {'status':'ok','gain_or':gain}
  if reward=='arme':
   available=[g for g in self.cat.gear if g.id not in self.gears]
   if not available:return {'status':'empty'}
   g=self.rng.choice(available);self.gears[g.id]=g;return {'status':'ok','item':g.id}
  if reward=='recrue':
   choices=[h.id for h in (enemy.heroes if enemy else []) if h.id not in self.heroes and h.id not in self.dead]
   if choice_id is not None and choice_id in choices:
    self.recruit(choice_id);return {'status':'ok','recruit':choice_id}
   if not choices:return {'status':'empty','reason':'aucun candidat disponible'}
   return {'status':'needs_choice','options':list(dict.fromkeys(choices))}
  if reward=='soin':
   for h in self.heroes.values():h.current_hp=min(h.hp,h.current_hp+round(h.hp*.15))
   return {'status':'ok','heal_pct':15}
  if reward=='consommable':
   self.consumables.append('soin_urgence');return {'status':'ok','item':'soin_urgence'}
  if reward=='relique':
   pool=[x for x in ('main_depart_plus_1','pioche_tour_plus_1','soin_victoire_plus_5') if x not in self.relics]
   if not pool:return {'status':'empty'}
   r=self.rng.choice(pool);self.relics.append(r);return {'status':'ok','relique':r}
  if reward=='objet_rare':
   return {'status':'ok','extra_slot':self.rare_extra_slot()}
  if reward=='reanimation':
   if choice_id and self.revive(choice_id):return {'status':'ok','revive':choice_id}
   if self.dead:return {'status':'needs_choice','options':list(self.dead)}
   return {'status':'empty','reason':'aucune carte morte'}
  return {'status':'error','reason':'récompense inconnue'}
 def deck(self):
  return CombatDeck(hero_ids=[x.id for x in self.heroes.values() if x.alive],gear_ids=list(self.gears))
 def recruit(self,id):
  if id in self.heroes or id not in self.cat.by_id:return False
  self.heroes[id]=clone_hero(self.cat.by_id[id]);return True
 def rare_extra_slot(self):
  if self.combat_slots<5:self.combat_slots+=1;return True
  return False
 def revive(self,id):
  h=self.dead.pop(id,None)
  if h is None:return False
  h.alive=True;h.current_hp=max(1,round(.25*h.hp));self.heroes[id]=h;return True
 def after_victory(self,played_ids):
  leveled=[]
  transformations=[]
  for h in list(self.heroes.values()):
   if not h.alive:continue
   h.current_hp=min(h.hp,h.current_hp+round(h.hp*(.25+(.05 if 'soin_victoire_plus_5' in self.relics else 0))))
   if h.id not in played_ids or h.level>=5:continue
   h.xp+=1
   required=h.level+1 # level 1->2 needs 2 wins, 2->3 3 wins etc.
   if h.xp>=required:
    h.xp-=required;h.level+=1;leveled.append((h.id,h.level))
    # Only explicit approved transitions; no automatic higher-rank random counterpart.
    nxt=self.cat.evolutions.get(h.id)
    if nxt and nxt not in self.heroes and nxt not in self.dead:
     upgraded=self.cat.by_id[nxt]
     if upgraded.power>h.power:
      old_id=h.id;frac=h.current_hp/max(1,h.hp)
      h.id=upgraded.id;h.name=upgraded.name;h.version=upgraded.version;h.atk=upgraded.atk;h.hp=upgraded.hp;h.vit=upgraded.vit;h.rarity=upgraded.rarity;h.rank=upgraded.rank;h.current_hp=min(h.hp,max(1,round(h.hp*frac)))
      del self.heroes[old_id];self.heroes[h.id]=h;transformations.append((old_id,h.id));continue
    ratio=h.current_hp/max(1,h.hp);h.atk=round(h.atk*1.1);h.hp=round(h.hp*1.1);h.vit=round(h.vit*1.1);h.current_hp=max(1,round(h.hp*ratio))
  return {'levels':leveled,'transformations':transformations}
 def kill(self,id):
  h=self.heroes.pop(id,None)
  if not h:return False
  h.alive=False;h.current_hp=0;self.dead[id]=h;return True


def battle_reference(run:Run,enemy:EnemyEncounter,max_rounds=80):
 """Reference auto-battle test, not V5.2 production combat engine.
 One basic action/round in VIT order; limited equipment plays, all deployed cards attack.
 Persist damage and KO. Initial hand 3, plus draw 1/round; no mana.
 """
 rng=run.rng;deck=run.deck();deck.init(rng)
 if 'main_depart_plus_1' in run.relics:deck.draw(1)
 active=[];played_ids=set();stats={};seen_gears=set();rounds=0;details=[]
 enemy_rows=[]
 for ix,h in enumerate(enemy.heroes):
  enemy_rows.append({'id':f'e{ix}-{h.id}','atk':h.atk,'vit':h.vit,'hp':h.hp,'maxhp':h.hp,'shield':0})
 # Enemy character cards start on field; enemy equipment is a separate draw deck.
 enemy_gear_draw=enemy.gears[:];rng.shuffle(enemy_gear_draw)
 enemy_gear_hand=enemy_gear_draw[:min(3,len(enemy_gear_draw))]
 enemy_gear_draw=enemy_gear_draw[len(enemy_gear_hand):]
 enemy_equipped=0
 def hero_play(x):
  h=run.heroes[x];return {'id':x,'atk':h.atk,'vit':h.vit,'hp':h.current_hp,'maxhp':h.hp,'shield':0,'weapon':False,'armor':False}
 def strike(a,b):
  damage=max(1,round(a['atk']*.42))
  s=min(damage,b['shield']);b['shield']-=s;b['hp']-=damage-s
 for turn in range(1,max_rounds+1):
  rounds=turn
  if turn>1:deck.draw(2 if 'pioche_tour_plus_1' in run.relics else 1)
  # Deploy characters freely from hand until active limit.
  for typ,cid in deck.hand[:]:
   if typ=='hero' and len(active)<run.combat_slots and cid in run.heroes:
    active.append(hero_play(cid));played_ids.add(cid);deck.hand.remove((typ,cid))
  # Equipment: 0 tempo free; 1 tempo one equip action per round.
  action_left=1;added_draw=0
  for typ,gid in deck.hand[:]:
   if typ!='gear':continue
   gear=run.gears[gid]
   if gear.tempo>action_left:continue
   eligible=[h for h in active if not h['armor' if gear.category=='armure' else 'weapon']]
   if gear.category=='consommable' and active:eligible=active
   if not eligible:continue
   target=eligible[0];action_left-=gear.tempo
   if gear.category!='consommable':target['armor' if gear.category=='armure' else 'weapon']=True
   target['atk']=round(target['atk']*(1+gear.atk_pct/100));target['shield']+=round(target['maxhp']*gear.shield_pct/100)
   if gear.heal_pct:target['hp']=min(target['maxhp'],target['hp']+round(target['maxhp']*gear.heal_pct/100))
   added_draw+=gear.draw;seen_gears.add(gid);deck.hand.remove((typ,gid));deck.discarded.append((typ,gid))
  if added_draw:deck.draw(min(2,added_draw)) # hard cap to avoid draw-loop abuse
  # Enemy equipment follows the same rule: starting hand + one drawn each round,
  # free equipment immediately, at most one 1-action equipment per round.
  if turn>1 and enemy_gear_draw:enemy_gear_hand.append(enemy_gear_draw.pop(0))
  enemy_action=1
  for g in enemy_gear_hand[:]:
   if enemy_action<g.tempo:continue
   avail=[x for x in enemy_rows if x['hp']>0]
   if not avail:continue
   recipient=avail[enemy_equipped%len(avail)]
   enemy_action-=g.tempo
   recipient['atk']=round(recipient['atk']*(1+g.atk_pct/100))
   recipient['shield']+=round(recipient['maxhp']*g.shield_pct/100)
   if g.heal_pct:recipient['hp']=min(recipient['maxhp'],recipient['hp']+round(recipient['maxhp']*g.heal_pct/100))
   enemy_gear_hand.remove(g);enemy_equipped+=1
   if g.draw and enemy_gear_draw:enemy_gear_hand.append(enemy_gear_draw.pop(0))
  acts=[(h['vit']+rng.random()*.001,'hero',h) for h in active if h['hp']>0]
  acts += [(h['vit']+rng.random()*.001,'enemy',h) for h in enemy_rows if h['hp']>0]
  for _,team,a in sorted(acts,reverse=True):
   if a['hp']<=0:continue
   candidates=enemy_rows if team=='hero' else active
   candidates=[b for b in candidates if b['hp']>0]
   if not candidates:break
   strike(a,rng.choice(candidates))
  for h in active:
   if h['hp']<=0 and h['id'] in run.heroes:run.kill(h['id'])
  active=[h for h in active if h['hp']>0]
  if not any(e['hp']>0 for e in enemy_rows):
   for h in active:
    if h['id'] in run.heroes:run.heroes[h['id']].current_hp=max(1,h['hp'])
   levels=run.after_victory(played_ids)
   return dict(win=True,rounds=rounds,alive=len(run.heroes),ko=len(run.dead),played=len(played_ids),equipped=len(seen_gears),enemy_equipped=enemy_equipped,level_ups=levels['levels'],transformations=levels['transformations'],draw_remaining=len(deck.draw_pile))
  if not run.heroes:
   return dict(win=False,rounds=rounds,alive=0,ko=len(run.dead),played=len(played_ids),equipped=len(seen_gears),enemy_equipped=enemy_equipped,level_ups=[])
 return dict(win=False,reason='round_limit',rounds=rounds,alive=len(run.heroes),ko=len(run.dead),played=len(played_ids),equipped=len(seen_gears),enemy_equipped=enemy_equipped,level_ups=[])

def rewards_for(rng,kind,wave):
 weighted=['recrue','arme','or','soin','consommable']
 if kind in ('elite','boss'):weighted+=['relique','relique']
 if kind=='boss':weighted+=['objet_rare','reanimation']
 options=[]
 while len(options)<3:
  choice=rng.choice([x for x in weighted if x not in options])
  options.append(choice)
 return options


def main():
 import argparse
 p=argparse.ArgumentParser();p.add_argument('--univers',choices=['DB','HXH'],default='DB');p.add_argument('--seed',type=int,default=42);p.add_argument('--vagues',type=int,default=24);p.add_argument('--output',type=str,default='')
 args=p.parse_args();cat=Catalog(args.univers);run=Run(cat,args.seed);draft=run.draft()
 encounters=[]
 for w in range(1,args.vagues+1):
  row={}
  for kind in ['normal','elite','boss']:
   enc=generate_enemy(cat,w,kind,run.rng)
   row[kind]={'budget':enc.budget,'places_ennemies':enc.enemy_slots,'rangs':enc.ranks,'armes_ennemies':[g.id for g in enc.gears]}
  encounters.append({'vague':w,**row})
 # Only play one reference battle, don't mutate run across all forecast waves.
 example=generate_enemy(cat,1,'normal',run.rng)
 battle=battle_reference(run,example)
 report={'univers':args.univers,'catalogue':{'personnages':cat.N,'equipements_disponibles':len(cat.gear)},'draft':draft,'deck_initial':{'personnages':5,'equipements':3,'total':8},'premier_combat':battle,'recompenses_exemple':rewards_for(run.rng,'normal',1),'rencontres_prevision':encounters}
 text=json.dumps(report,ensure_ascii=False,indent=2)
 if args.output:Path(args.output).write_text(text,encoding='utf-8')
 else:print(text)

if __name__=='__main__':main()
