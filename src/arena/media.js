import {registry} from './catalog.js';
import {LOCAL_ASSETS} from '../v14/asset-index.js';
import {isSpecialEdition,worldAssetKey} from './rules.js';
let dbPromise;
export function mediaDb(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const q=indexedDB.open('kiarena-local-media',1);q.onupgradeneeded=()=>q.result.createObjectStore('files');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});return dbPromise;}
export async function putMedia(key,blob){const db=await mediaDb();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export async function getMedia(key){const db=await mediaDb();return new Promise((resolve,reject)=>{const q=db.transaction('files').objectStore('files').get(key);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
export const mediaCache=new Map();
export async function hydratePortraits(){const db=await mediaDb();return new Promise((resolve,reject)=>{const q=db.transaction('files').objectStore('files').openCursor();q.onsuccess=()=>{const c=q.result;if(!c)return resolve();if(String(c.key).startsWith('portrait:'))mediaCache.set(String(c.key).slice(9),URL.createObjectURL(c.value));else if(String(c.key).startsWith('studio:'))mediaCache.set(String(c.key),URL.createObjectURL(c.value));c.continue();};q.onerror=()=>reject(q.error);});}
export async function importPortraits(files,world,heroes){let count=0;const ids=new Set(heroes.filter(c=>c.universe===world).map(c=>c.sourceId));for(const f of files){if(!/\.(webp|png|jpe?g)$/i.test(f.name))continue;const stem=f.name.replace(/\.(webp|png|jpe?g)$/i,''),match=stem.match(/_(arena|normal|special)$/),variant=match?.[1],id=match?stem.slice(0,-match[0].length):stem;if(!ids.has(id))continue;const key=variant?'studio:'+world+':'+id+':'+variant:world+':'+id;await putMedia(variant?key:'portrait:'+key,f);const old=mediaCache.get(key);if(old)URL.revokeObjectURL(old);mediaCache.set(key,URL.createObjectURL(f));count++;}return count;}

export function asset(path){return globalThis.KI_EMBEDDED_ASSETS?.[path]||new URL(path,document.baseURI).href;}
export const audioSettings={music:.05,sfx:.12,muted:false,track:'ALL',...(()=>{try{return JSON.parse(localStorage.getItem('kiarena:audio:v10'))||{};}catch{return {};}})()};
let music=null,context=null;
export function setAudio(k,v){audioSettings[k]=v;localStorage.setItem('kiarena:audio:v10',JSON.stringify(audioSettings));if(music){music.volume=audioSettings.muted?0:audioSettings.music;if(k==='muted'){if(audioSettings.muted)music.pause();else music.play().catch(()=>{});}}}
export async function playMusic(world='ALL'){const blob=await getMedia('music:'+world)||await getMedia('music:ALL');if(!blob)return false;if(music){music.pause();URL.revokeObjectURL(music.src);}music=new Audio(URL.createObjectURL(blob));music.loop=true;music.volume=audioSettings.muted?0:audioSettings.music;await music.play();return true;}
export function stopMusic(){music?.pause();}
export function tone(type='tap'){if(audioSettings.muted||!audioSettings.sfx)return;try{context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime;osc.type=type==='hit'?'triangle':'sine';osc.frequency.setValueAtTime(type==='hit'?180:type==='win'?600:420,t);osc.frequency.exponentialRampToValueAtTime(type==='hit'?45:240,t+.09);gain.gain.setValueAtTime(audioSettings.sfx*.25,t);gain.gain.exponentialRampToValueAtTime(.001,t+.12);osc.connect(gain).connect(context.destination);osc.start();osc.stop(t+.13);}catch{}}
export function editionFor(seed,cardId){return isSpecialEdition(seed,cardId)?'special':'arena';}
export function cardArtCandidates(card,{seed='',preferSpecial=true}={}){
  const world=worldAssetKey(card.universe);
  const id=card.sourceId||String(card.id||'').split(':').pop();
  const folder='assets/cards-'+world;
  const special=preferSpecial&&isSpecialEdition(seed||'ARENA',card.id);
  const out=[];
  if(special) out.push(folder+'/'+id+'_special.png');
  out.push(folder+'/'+id+'_arena.png');
  out.push(folder+'/'+id+'_normal.png');
  return out.filter(path=>LOCAL_ASSETS.has(path));
}
function fullCard(card){if(card?.id&&!card.portrait){const world=card.universe||String(card.id).split(':')[0];try{return registry([world]).byId.get(card.id)||card;}catch{}}return card;}
export function cardArtUrl(card,opts={}){return cardArtFallbackChain(card,opts)[0]||'';}
export function cardArtFallbackChain(card,opts={}){
 card=fullCard(card);const world=card?.universe,id=card?.sourceId||String(card?.id||'').split(':').pop(),special=opts.preferSpecial!==false&&isSpecialEdition(opts.seed||'ARENA',card?.id),urls=[];
 for(const variant of special?['special','arena','normal']:['arena','normal']){const imported=mediaCache.get('studio:'+world+':'+id+':'+variant);if(imported)urls.push(imported);}
 urls.push(...cardArtCandidates(card,opts).map(asset));const key=card?.id;if(key&&mediaCache.has(key))urls.push(mediaCache.get(key));const srcKey=world&&id?world+':'+id:null;if(srcKey&&mediaCache.has(srcKey))urls.push(mediaCache.get(srcKey));if(card?.portrait&&LOCAL_ASSETS.has(card.portrait))urls.push(asset(card.portrait));const fallback=card?.universe==='DB'&&card?.sourceId?'assets/stylized/'+card.sourceId+'.svg':null;if(fallback&&LOCAL_ASSETS.has(fallback))urls.push(asset(fallback));return [...new Set(urls.filter(Boolean))];
}

export function equipmentArtUrl(item){
  if(!item) return '';
  const universe=(item.universe||String(item.id||'').split(':')[0]||'').toLowerCase();
  const id=item.sourceId||String(item.id||'').split(':').pop();
  const key='equipment:'+universe+':'+id;
  if(mediaCache.has(key)) return mediaCache.get(key);
  // Inherited scraped thumbnails are unreviewed; only explicitly verified files may render.
  const approved=globalThis.KI_VERIFIED_EQUIPMENT_ART?.[universe+':'+id];
  return approved?asset(approved):'';
}
