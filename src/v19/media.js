import {skinFor} from './card-spec.js';
import {registry} from './catalog.js';
import {LOCAL_ASSETS} from './asset-index.js';
import {isSpecialEdition,worldAssetKey} from '../arena/rules.js';
let dbPromise;
export function mediaDb(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const q=indexedDB.open('kiarena-local-media',1);q.onupgradeneeded=()=>q.result.createObjectStore('files');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});return dbPromise;}
export async function putMedia(key,blob){const db=await mediaDb();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export async function getMedia(key){const db=await mediaDb();return new Promise((resolve,reject)=>{const q=db.transaction('files').objectStore('files').get(key);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
export const mediaCache=new Map();
export async function hydratePortraits(){const db=await mediaDb();return new Promise((resolve,reject)=>{const q=db.transaction('files').objectStore('files').openCursor();q.onsuccess=()=>{const c=q.result;if(!c)return resolve();if(String(c.key).startsWith('portrait:'))mediaCache.set(String(c.key).slice(9),URL.createObjectURL(c.value));else if(String(c.key).startsWith('studio:'))mediaCache.set(String(c.key),URL.createObjectURL(c.value));c.continue();};q.onerror=()=>reject(q.error);});}
export async function importPortraits(files,world,heroes){let count=0;const ids=new Set(heroes.filter(c=>c.universe===world).map(c=>c.sourceId));for(const f of files){if(!/\.(webp|png|jpe?g)$/i.test(f.name))continue;const stem=f.name.replace(/\.(webp|png|jpe?g)$/i,''),match=stem.match(/_(arena|normal|special)$/),variant=match?.[1],id=match?stem.slice(0,-match[0].length):stem;if(!ids.has(id))continue;const key=variant?'studio:'+world+':'+id+':'+variant:world+':'+id;await putMedia(variant?key:'portrait:'+key,f);const old=mediaCache.get(key);if(old)URL.revokeObjectURL(old);mediaCache.set(key,URL.createObjectURL(f));count++;}return count;}

export function asset(path){return globalThis.KI_EMBEDDED_ASSETS?.[path]||new URL(path,document.baseURI).href;}
export function hasLocalAsset(path){return !!path&&LOCAL_ASSETS.has(path);}
export const audioSettings={music:.05,sfx:.12,muted:false,track:'ALL',...(()=>{try{return JSON.parse(localStorage.getItem('kiarena:audio:v10'))||{};}catch{return {};}})()};
let music=null,context=null;
export function setAudio(k,v){audioSettings[k]=v;localStorage.setItem('kiarena:audio:v10',JSON.stringify(audioSettings));if(music){music.volume=audioSettings.muted?0:audioSettings.music;if(k==='muted'){if(audioSettings.muted)music.pause();else music.play().catch(()=>{});}}}
export async function playMusic(world='ALL'){const blob=await getMedia('music:'+world)||await getMedia('music:ALL');if(!blob)return false;if(music){music.pause();URL.revokeObjectURL(music.src);}music=new Audio(URL.createObjectURL(blob));music.loop=true;music.volume=audioSettings.muted?0:audioSettings.music;await music.play();return true;}
export function stopMusic(){music?.pause();}
export function tone(type='tap'){if(audioSettings.muted||!audioSettings.sfx)return;try{context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime;osc.type=type==='hit'?'triangle':'sine';osc.frequency.setValueAtTime(type==='hit'?180:type==='win'?600:420,t);osc.frequency.exponentialRampToValueAtTime(type==='hit'?45:240,t+.09);gain.gain.setValueAtTime(audioSettings.sfx*.25,t);gain.gain.exponentialRampToValueAtTime(.001,t+.12);osc.connect(gain).connect(context.destination);osc.start();osc.stop(t+.13);}catch{}}
export function editionFor(seed,cardId){return skinFor(seed,cardId);}
export function portraitArtCandidates(card){
  const world=worldAssetKey(card?.universe);
  const id=card?.sourceId||String(card?.id||'').split(':').pop();
  if(!id)return [];
  const base=id.replace(/-base$/,'');
  const folders=['assets/portraits-fixed','assets/portraits-'+world,'assets/portraits/'+world,'assets/portraits'];
  const names=[id+'.webp',id+'.png',id+'.jpg',base+'.webp',base+'.png',base+'.jpg'];
  const out=[];
  for(const folder of folders)for(const name of names){const path=folder+'/'+name;if(hasLocalAsset(path))out.push(path);}
  if(card?.portrait&&hasLocalAsset(card.portrait))out.push(card.portrait);
  return [...new Set(out)];
}
export function cardArtCandidates(card,{seed='',preferSpecial=true}={}){
  const world=worldAssetKey(card.universe);
  const id=card.sourceId||String(card.id||'').split(':').pop();
  const special=preferSpecial&&isSpecialEdition(seed||'ARENA',card.id);
  const folders=['assets/cards-'+world,'assets/cards','assets/cards-v2-'+world,'assets/cards-v2','assets/cards-ultimate-'+world,'assets/cards-ultimate'];
  const variants=special
    ?[id+'_special.png',id+'_special.webp',id+'_arena.png',id+'_arena.webp',id+'_normal.png',id+'_normal.webp',id+'.png',id+'.webp']
    :[id+'_arena.png',id+'_arena.webp',id+'_normal.png',id+'_normal.webp',id+'_special.png',id+'_special.webp',id+'.png',id+'.webp'];
  const out=[];
  for(const folder of folders)for(const name of variants)out.push(folder+'/'+name);
  return out.filter(path=>hasLocalAsset(path));
}
function fullCard(card){if(card?.id&&!card.portrait){const world=card.universe||String(card.id).split(':')[0];try{return registry([world]).byId.get(card.id)||card;}catch{}}return card;}
export function cardArtUrl(card,opts={}){return cardArtFallbackChain(card,opts)[0]||'';}
export function cardArtFallbackChain(card,opts={}){
 card=fullCard(card);if(!opts.raw){const face=globalThis.KI_V19_CARD_FACE?.(card,opts);if(face)return [face];}const world=card?.universe,id=card?.sourceId||String(card?.id||'').split(':').pop(),special=opts.preferSpecial!==false&&isSpecialEdition(opts.seed||'ARENA',card?.id),urls=[];
 for(const variant of special?['special','arena','normal']:['arena','normal']){const imported=mediaCache.get('studio:'+world+':'+id+':'+variant);if(imported)urls.push(imported);}
 // Portraits scrapés d'abord, puis faces carte, puis cache / stylized.
 urls.push(...portraitArtCandidates(card).map(asset));
 urls.push(...cardArtCandidates(card,opts).map(asset));
 const key=card?.id;if(key&&mediaCache.has(key))urls.push(mediaCache.get(key));const srcKey=world&&id?world+':'+id:null;if(srcKey&&mediaCache.has(srcKey))urls.push(mediaCache.get(srcKey));
 const fallback=card?.universe==='DB'&&card?.sourceId?'assets/stylized/'+card.sourceId+'.svg':null;if(fallback&&hasLocalAsset(fallback))urls.push(asset(fallback));return [...new Set(urls.filter(Boolean))];
}

export function equipmentArtUrl(item){
  if(!item) return '';
  const universe=(item.universe||String(item.id||'').split(':')[0]||'').toLowerCase();
  const world=worldAssetKey(item.universe||universe);
  const id=item.sourceId||String(item.id||'').split(':').pop();
  const key='equipment:'+universe+':'+id;
  if(mediaCache.has(key)) return mediaCache.get(key);
  const approved=globalThis.KI_VERIFIED_EQUIPMENT_ART?.[universe+':'+id];
  if(approved&&hasLocalAsset(approved))return asset(approved);
  const candidates=[
    'assets/equipment/'+world+'/'+id+'.webp',
    'assets/equipment/'+world+'/'+id+'.png',
    'assets/equipment/'+universe+'/'+id+'.webp',
    'assets/equipment/'+universe+'/'+id+'.png',
    'assets/equipment/'+id+'.webp',
    'assets/equipment/'+id+'.png',
  ];
  for(const path of candidates)if(hasLocalAsset(path))return asset(path);
  return '';
}

export function rawPortraitUrl(card,opts={}){
  const id=card.sourceId||String(card.id||'').split(':').pop();
  const imported=mediaCache.get((card.universe||'')+':'+id);
  if(imported)return imported;
  if(card.id==='DB:goku-db-enfant-21e-tenkaichi')return asset('assets/v19/goku-enfant-etude.webp');
  const portrait=portraitArtCandidates(card);
  if(portrait[0])return asset(portrait[0]);
  const local=cardArtCandidates(card,{...opts,preferSpecial:opts.preferSpecial!==false});
  if(local[0])return asset(local[0]);
  const fallback='assets/stylized/'+id+'.svg';
  return card.universe==='DB'&&hasLocalAsset(fallback)?asset(fallback):'';
}
