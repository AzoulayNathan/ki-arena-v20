import {portrait23} from '../v23/portraits.js';
/** Real source images visually reviewed; provenance is in the manifest. */
const file=name=>'assets/v21/portraits/'+name+'.webp';
export const PORTRAITS_BY_ID=Object.freeze({
 'DB:inoshikacho-db-chimere-du-tournoi':file('inoshikacho'),
 'DB:chichi-db-enfant-combattante':file('chichi-child'),'DB:draculaman-db-guerrier-de-baba':file('draculaman'),
 'DB:shu-db-ninja-du-pilaf-gang':file('shu'),'DB:akkuman-db-combattant-du-palais-d-enma':file('akkuman'),
 'DB:mai-db-pilaf-gang':file('mai'),'DB:mai-db-arsenal-de-pilaf':file('mai')});
export const PORTRAITS_BY_PERSON=Object.freeze({
 'HXH:gon-freecss':file('gon'),'HXH:killua-zoldyck':file('hxh-kirua'),'HXH:kurapika':file('hxh-kurapika'),
 'HXH:leorio-paradinight':file('hxh-reorio'),'HXH:hisoka-morow':file('hxh-hisoka'),'HXH:kite':file('hxh-kaito'),
 'NARUTO:naruto-uzumaki':file('naruto-naruto-front'),'NARUTO:sakura-haruno':file('naruto-sakura-front'),
 'NARUTO:kakashi-hatake':file('naruto-kakasi'),'NARUTO:sasuke-uchiha':file('naruto-sasuke'),
 'NARUTO:chiyo':file('naruto-chiyoba'),'NARUTO:ebizo':file('naruto-ebizo'),'NARUTO:deidara':file('naruto-deidara'),'NARUTO:sasori':file('naruto-sasori')});
export function reviewedArt(card){
 const improved=portrait23(card);if(improved)return improved;
 const id=card?.id||card?.universe+':'+card?.sourceId;
 if(PORTRAITS_BY_ID[id])return {path:PORTRAITS_BY_ID[id],shared:false,label:'Portrait vérifié'};
 const person=card?.person||card?.universe+':'+card?.identity;
 if(PORTRAITS_BY_PERSON[person])return {path:PORTRAITS_BY_PERSON[person],shared:true,label:'Visuel de référence du personnage · apparence partagée entre les variantes'};
 if(id?.startsWith('DB:goku-db-')&&(/enfant|entrainement-chez-karin|combat-contre-tao/.test(id))&&!/grand-singe|transformation/.test(id))return {path:file('goku-child'),shared:true,label:'Goku enfant · illustration de référence partagée'};
 return null;
}
