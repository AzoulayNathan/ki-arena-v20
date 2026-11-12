/* Échelle narrative de game design (non officielle) — DB / DBZ / DBS.
   La rareté est cosmétique / donne des capacités, elle ne détermine jamais la puissance brute.
   Les grands protagonistes ont des règles de continuité par forme, et les secondaires
   utilisent une estimation contextualisée. Ces rangs sont éditoriaux, pas des chiffres du manga. */
const norm=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const has=(s,...v)=>v.some(x=>s.includes(x));
export function canonTier({name,series,form,power}){
 const n=norm(name),f=norm(form),p=Number(power)||20;
 let tier=1+Math.max(0,p-20)/8; // filet de sécurité pour les 600 fiches
 if(series==='DB')tier=Math.min(6,Math.max(1,1+(p-20)/8));
 if(series==='DBZ')tier=Math.min(12,Math.max(1.5,2+(p-25)/6));
 if(series==='DBS')tier=Math.min(15,Math.max(2,3+(p-26)/5.8));
 // Les formes divines ne sont pas diluées par les anciennes valeurs de catalogue.
 if(has(n,'zen-o','zeno','zen ô',"zen'o","zen’ô",'zeno du futur',"zen'o du futur"))return 22;
 if(has(n,'grand pretre','grand priest'))return 20;
 if(has(n,'whis','vados','marcarita','kus','ange de'))return 19;
 if(has(n,'beerus','champa','belmod','quitela','rumsshi','heles','sidra','arack','iwan','mosco','liquir'))return 17;
 if(n==='goku'||n==='son goku'){
  if(series==='DB')return Math.min(5.6,Math.max(2.3,tier));
  if(series==='DBZ'){
   if(has(f,'super saiyan 3','ssj3'))return 11.4;
   if(has(f,'super saiyan 2','ssj2'))return 10;
   if(has(f,'super saiyan','ssj'))return has(f,'namek','freezer')?8.6:9.3;
   if(has(f,'kaioken'))return 6.5;
   return has(f,'saiyan')?5.5:has(f,'namek')?7.1:9.1;
  }
  if(has(f,'ultra instinct','instinct superieur','instinct parfait'))return has(f,'maitris','maitrise','parfait')?16.4:15.8;
  if(has(f,'blue','ssb'))return has(f,'kaioken')?15.15:14.3;
  if(has(f,'super saiyan god','saiyan divin'))return 13.6;
  if(has(f,'super saiyan 3'))return 12;
  if(has(f,'super saiyan 2'))return 11.8;
  if(has(f,'super saiyan'))return 11.5;
  return 11.0;
 }
 if(n==='vegeta'){
  if(series==='DBZ'){
   if(has(f,'majin'))return 10.6;
   if(has(f,'super saiyan 2'))return 10.15;
   if(has(f,'super saiyan'))return 9.1;
   if(has(f,'namek'))return 7;
   return 5.7;
  }
  if(series==='DBS'){
   if(has(f,'blue evolution','blue evolution','evolution','blue evolue'))return 15.4;
   if(has(f,'blue'))return 14.35;
   if(has(f,'god','divin'))return 13.4;
   if(has(f,'super saiyan'))return 11.7;
   return 11.1;
  }
 }
 if(has(n,'gohan')&&!has(n,'grand-pere','grand pere')){
  if(series==='DBZ'){
   if(has(f,'potentiel libere','ultime','ultimate','mystic'))return 11.7;
   if(has(f,'super saiyan 2','ssj2'))return 10.3;
   if(has(f,'super saiyan'))return 8.8;
   if(has(f,'namek'))return 6.6;
   return 4.5;
  }
  if(series==='DBS')return has(f,'potentiel','ultime')?13.7:11.4;
 }
 if(has(n,'freezer','frieza','frieza')){
  if(series==='DBS')return has(f,'golden')?14.45:11.2;
  if(has(f,'premiere','1ere'))return 6.9;
  if(has(f,'deuxieme','2e'))return 7.35;
  if(has(f,'troisieme','3e'))return 7.75;
  if(has(f,'cyborg'))return 8.25;
  return has(f,'100 %')?8.75:8.4;
 }
 if(n==='cell'){
  if(has(f,'super perfect','resurrection'))return 9.95;
  if(has(f,'parfaite','parfait'))return 9.5;
  if(has(f,'semi'))return 8.3;
  return 7.6;
 }
 if(has(n,'boo','buu')){
  if(has(f,'gohan','buuhan'))return 12.1;
  if(has(f,'gotenks'))return 11.8;
  if(has(f,'originelle','kid'))return 10.8;
  if(has(f,'malefique','super'))return 11.2;
  return 10.5;
 }
 if(has(n,'jiren'))return has(f,'pleine','liberee','ultra')?16.1:15.4;
 if(has(n,'hit')&&series==='DBS')return has(f,'ameliore','evolution')?14.7:14.0;
 if(has(n,'toppo'))return has(f,'destruction','hakai')?15.4:13.8;
 if(has(n,'dyspo'))return 13.6;
 if(has(n,'kefla'))return has(f,'super saiyan 2')?15.4:14.4;
 if(has(n,'vegito','vegeto'))return series==='DBS'?16.0:12.4;
 if(has(n,'gogeta'))return series==='DBS'?16.0:12.4;
 if(has(n,'zamasu'))return has(f,'fusion')?15.4:14.1;
 if(has(n,'goku black','black goku'))return has(f,'rose')?14.7:13.1;
 if(n==='piccolo')return series==='DBS'?11.2:series==='DBZ'?(has(f,'kami')?9.1:has(f,'nail')?7.3:5.8):5.8;
 if(has(n,'krilin','kuririn'))return series==='DBS'?7.3:series==='DBZ'?6:4;
 if(has(n,'raditz'))return 4.8;
 if(has(n,'nappa'))return 5.1;
 if(has(n,'roshi','tortue geniale'))return series==='DBS'?7.2:4.3;
 if(has(n,'monaka','bulma','suno','oolong','plume','pilaf','marron','bee','panchy','dr brief','bubbles','gregory'))return Math.min(tier,2.4);
 return Math.round(tier*10)/10;
}
export function canonStats(c){
 const tier=canonTier(c),p=Math.pow(1.275,tier);
 const baseAttack=Math.max(14,Math.round(12*p));
 const attack=Math.round(baseAttack*1.20);
 const maxHp=Math.max(100,Math.round(125+baseAttack*2.95+(c.kit==='guardian'?baseAttack*.35:0)));
 const speed=Math.max(14,Math.round(18+tier*14+(c.kit==='speed'||c.kit==='ultra'?14:0)-(c.kit==='guardian'?7:0)));
 return {canonTier:tier,attack,maxHp,speed,price:Math.max(25,Math.round((20+tier*11)/5)*5)};
}
