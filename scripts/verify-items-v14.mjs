import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {registry,WORLDS} from '../src/arena/catalog.js';
import {createRun,equip,battleCard} from '../src/arena/engine.js';
import {runArenaBattle} from '../src/arena/battle.js';
const rows=[],errors=[];
for(const world of WORLDS){const c=registry([world]);for(const g of c.items){
 if(!g.ok){rows.push({id:g.id,univers:world,nom:g.name,statut:'EXCLU',raison:g.reason,preuve:'itemEligibility : hors draft, marchand et récompense',image:'Pictogramme ou dessin éditorial nommé ; miniature héritée non approuvée'});continue;}
 try{
  const r=createRun([world],'ITEM-'+g.id),h=c.heroes[0];r.phase='map';r.passives=[];r.items=[{uid:'object',cardId:g.id}];r.units=[{uid:'hero',cardId:h.id,attack:100,maxHp:2000,hp:1000,speed:100,weapon:null,armor:null,level:1,wins:0}];
  assert(equip(r,'object','hero'));const u=r.units[0];let proof;
  if(g.category==='consommable'){assert(u.hp>1000);assert.equal(r.items.length,0);assert.equal(equip(r,'object','hero'),false);proof='Soin réel en préparation, consommation puis rejet du second usage';}
  else{
   assert.equal(u[g.category==='armure'?'armor':'weapon'],'object');const b=battleCard(r,u);assert.equal(b.attack,Math.round(100*(1+g.atk/100)));assert.equal(b.maxHp,Math.round(2000*(1+(g.effect==='hp'?g.shield/100:0))));
   // Controlled combat: no character abilities obscure the item's own hooks.
   const fighter={...b,effects:b.effects.filter(e=>e.key.startsWith('item:'))},enemy={...h,id:'opponent',name:'Cible de contrôle',attack:100,maxHp:4000,speed:90,effects:[{key:'target-shield',type:'shield',amount:.02,name:'Bouclier de contrôle'}]};
   const replay=runArenaBattle([fighter],[enemy],{seed:'ITEM',rules:'canon',maxRounds:30,hpRatiosA:[.5]});assert(replay.events.some(e=>e.type==='result'));const types=new Set(replay.events.filter(e=>e.effect?.startsWith('item:')).map(e=>e.type));
   if(g.effect==='atk')assert(b.attack>100);
   if(g.effect==='hp')assert(b.maxHp>2000);
   if(g.shield&&g.effect!=='hp')assert(types.has('shield'));
   if(g.heal)assert(types.has('heal'));
   if(g.effect==='evade')assert(types.has('dodge'));
   if(g.effect==='stun')assert(types.has('status')&&replay.events.some(e=>e.type==='skip'));
   if(g.effect==='counter')assert(types.has('counter_hit')||types.has('skill_hit'));
   if(g.effect==='pierce'){
    const plain=runArenaBattle([{...fighter,effects:fighter.effects.filter(e=>e.type!=='gear_pierce')}],[enemy],{seed:'ITEM',rules:'canon',maxRounds:30,hpRatiosA:[.5]});
    const hit=x=>x.events.find(e=>e.type==='hit'&&e.actor==='A-0');assert(hit(replay).units.find(u=>u.uid==='B-0').shield>hit(plain).units.find(u=>u.uid==='B-0').shield);
   }
   proof='Équipement réel + battleCard + combat terminé ; '+g.effect+' ; événements '+([...types].join(', ')||'bonus de statistique vérifié');
  }
  rows.push({id:g.id,univers:world,nom:g.name,statut:'OK',raison:g.reason,preuve:proof,image:'Dessin éditorial nommé si présent, sinon pictogramme honnête ; aucune identité de miniature non validée'});
 }catch(e){errors.push({id:g.id,error:e.message});rows.push({id:g.id,univers:world,nom:g.name,statut:'IMPLEMENTATION_MANQUANTE',raison:e.message,preuve:'ÉCHEC contrôle exécutable',image:'Pictogramme'});}
}}
mkdirSync('qa/v14',{recursive:true});const report={ok:!errors.length,total:rows.length,active:rows.filter(x=>x.statut==='OK').length,excluded:rows.filter(x=>x.statut==='EXCLU').length,errors,scope:'Arène V14 auto5. Les objets Deck Survival restent propres à ce mode.'};
writeFileSync('qa/v14/items-execution.json',JSON.stringify(report,null,2));const keys=Object.keys(rows[0]),csv=x=>'"'+String(x??'').replaceAll('"','""')+'"';writeFileSync('LISTE_ITEMS_IMPLEMENTES.csv','\uFEFF'+[keys.map(csv).join(','),...rows.map(r=>keys.map(k=>csv(r[k])).join(','))].join('\n')+'\n');console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
