/* FORGE offline shell. Dynamic fitness values stay in localStorage, never in this cache. */
const CACHE='forge-shell-v6-0-2';
const SHELL=['./','./index.html','./forge-extras.css','./forge-extras.js','./forge-polish.css','./forge-polish.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('forge-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 // Prioritize the newest site version when online; use the cached app shell when offline.
 event.respondWith(fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});}
  return response;
 }).catch(async()=>{
  const cached=await caches.match(req,{ignoreSearch:true});
  if(cached)return cached;
  if(req.mode==='navigate')return caches.match('./index.html');
  return Response.error();
 }));
});