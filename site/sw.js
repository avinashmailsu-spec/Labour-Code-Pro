/* Offline-first service worker — LabourCode Pro Web 1.2 */
const CACHE_NAME='labourcodepro-web-1.2.0';
const FILES=[
 "./android-premium.css",
 "./app.js",
 "./assets/acts/README.txt",
 "./assets/acts/industrial.pdf",
 "./assets/acts/osh.pdf",
 "./assets/acts/security.pdf",
 "./assets/acts/wages.pdf",
 "./assets/content.json",
 "./assets/editorial_industrial.webp",
 "./assets/editorial_osh.webp",
 "./assets/editorial_security.webp",
 "./assets/editorial_wages.webp",
 "./assets/hero_v4.webp",
 "./assets/legal/industrial.json",
 "./assets/legal/manifest.json",
 "./assets/legal/osh.json",
 "./assets/legal/security.json",
 "./assets/legal/wages.json",
 "./assets/logo.png",
 "./assets/pro_content.json",
 "./assets/studio_industrial.webp",
 "./assets/studio_osh.webp",
 "./assets/studio_security.webp",
 "./assets/studio_wages.webp",
 "./clarity-v8.css",
 "./clarity-v8.js",
 "./data.js",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./index.html",
 "./legal-offline.css",
 "./legal-offline.js",
 "./manifest.webmanifest",
 "./modern-studio-v12.css",
 "./modern-studio-v12.js",
 "./premium-v3.css",
 "./premium-v4.css",
 "./reader-plus.css",
 "./reader-plus.js",
 "./reader-studio-v7.css",
 "./reader-studio-v7.js",
 "./search-studio-v1.css",
 "./search-studio-v1.js",
 "./statutory-definitions-v8.js",
 "./styles.css",
 "./touch-layout-v1.css",
 "./ultimate-v6.css",
 "./ultimate-v6.js",
 "./visual-learning-v11.css",
 "./visual-learning-v11.js",
 "./web-bridge.js",
 "./web-edition.css",
 "./web-edition.js"
];
const SHELL=new URL('./index.html',self.registration.scope);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);const results=await Promise.allSettled(FILES.map(f=>cache.add(new Request(new URL(f,self.registration.scope),{cache:'reload'}))));const failures=results.filter(r=>r.status==='rejected');if(failures.length)console.warn('Offline install incomplete:',failures.length,'files could not be cached');await self.skipWaiting()})());
});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('labourcodepro-web-')&&k!==CACHE_NAME)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const req=event.request,url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).then(async res=>{if(res.ok)(await caches.open(CACHE_NAME)).put(SHELL,res.clone()).catch(()=>{});return res}).catch(async()=>await (await caches.open(CACHE_NAME)).match(SHELL)||Response.error()));return;
 }
 event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME),hit=await cache.match(req,{ignoreSearch:true});if(hit){
   const range=req.headers.get('range');
   if(range&&url.pathname.endsWith('.pdf')){
      const all=await hit.arrayBuffer(),match=range.match(/^bytes=(\d*)-(\d*)$/),length=all.byteLength;
      if(match){let from=match[1]?Number(match[1]):0,to=match[2]?Number(match[2]):length-1;
        if(!match[1]&&match[2]){from=Math.max(0,length-Number(match[2]));to=length-1}
        from=Math.max(0,Math.min(from,length-1));to=Math.max(from,Math.min(to,length-1));
        return new Response(all.slice(from,to+1),{status:206,headers:{'Content-Type':'application/pdf','Accept-Ranges':'bytes','Content-Range':`bytes ${from}-${to}/${length}`,'Content-Length':String(to-from+1)}});
      }
   }
   return hit;
  }
  try{const res=await fetch(req);if(res.ok)cache.put(req,res.clone()).catch(()=>{});return res}catch(e){return Response.error()}})());
});
