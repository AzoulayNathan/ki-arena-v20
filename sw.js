const CACHE='ki-arena-v20-20261113-dead-loot-novine';
const BASIC=['./','./index.html','./src/styles.css','./src/v3.css','./src/v5.css','./src/v51.css','./src/v52.css','./src/rogue-v6.css','./src/rogue-v7.css','./src/roguelike.js','./assets/rogue/wilderness.svg','./assets/rogue/desert.svg','./assets/rogue/namek.svg','./assets/rogue/ruins.svg','./assets/rogue/sky.svg','./assets/rogue/void.svg','./assets/theme/sky-realm.webp','./assets/theme/rogue-islands.webp','./assets/theme/battle-realm.webp','./assets/theme/hero-goku.webp','./assets/sfx/impact.wav','./assets/sfx/ko.wav','./assets/sfx/ultimate.wav','./assets/sfx/arcade-loop.wav','./src/canon.js','./src/auction.js','./src/catalog.js','./src/battle.js','./src/games.js','./src/approved-images.js','./src/app.js','./manifest.webmanifest','./assets/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASIC)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).pathname.includes('/api/'))return;
  const path=new URL(e.request.url).pathname;
  // JS/modules : réseau d'abord (évite d'afficher d'anciens FX/lianes).
  if(/\.(js|mjs|css)$/i.test(path)||path.includes('/src/')){
    e.respondWith(fetch(e.request).then(net=>{
      if(net.ok&&new URL(e.request.url).origin===location.origin){
        const copy=net.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return net;
    }).catch(()=>caches.match(e.request).then(old=>old||new Response('Offline',{status:503}))));
    return;
  }
  e.respondWith(caches.match(e.request).then(old=>old||fetch(e.request).then(net=>{if(net.ok&&new URL(e.request.url).origin===location.origin){const copy=net.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return net}).catch(()=>new Response('Offline',{status:503}))));
});
