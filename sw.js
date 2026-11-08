// Stable offline cache: ice-cream art is downloaded once per published release.
const CORE='asobi-v40',ICE='asobi-ice-v40';
const CORE_ASSETS=['./','./index.html','./style.css?v=38','./app.js?v=38','./extras.js?v=38','./manifest.webmanifest','./icon-192.png','./icon-512.png','./home-park.webp','./home-park-header.webp'];
const ICE_ASSETS=['./softcream.html',
 ...Array.from({length:5},(_,i)=>'./cone-raster-'+i+'-back.webp'),
 ...Array.from({length:5},(_,i)=>'./cone-raster-'+i+'-front.webp'),
 './cone-waffle-cup-raster-back.webp','./cone-waffle-cup-raster-front.webp',
 ...['round','classic','fine'].map(x=>'./soft-'+x+'.webp'),
 './sauce-shell-neutral.svg','./sauce-strawberry.png','./sprinkles-rainbow.webp',
 './topping-birch-high.svg','./topping-biscuit.png','./topping-strawberry-cut.png','./topping-strawberry-whole.png','./topping-mint.webp','./topping-blueberry.png','./topping-raspberry.png',
 ...Array.from({length:6},(_,i)=>'./topping-macaron-'+i+'.png')
];
self.addEventListener('install',event=>event.waitUntil(
 Promise.all([caches.open(CORE).then(c=>c.addAll(CORE_ASSETS)),caches.open(ICE).then(c=>c.addAll(ICE_ASSETS))]).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('asobi-v')&&k!==CORE)||(k.startsWith('asobi-ice-v')&&k!==ICE)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 const path=url.pathname;const isSoft=path.endsWith('/softcream.html');
 const isIceAsset=ICE_ASSETS.some(p=>path.endsWith(p.slice(1)));
 if(isSoft||isIceAsset){
  event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(ICE).then(c=>c.put(req,copy)).catch(()=>{});}
   return response;
  })));
  return;
 }
 if(req.mode==='navigate'||path.endsWith('/sw.js')){
  event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CORE).then(c=>c.put(req,copy)).catch(()=>{});}return response;
  }).catch(()=>caches.match(req,{ignoreSearch:true})));
  return;
 }
 event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CORE).then(c=>c.put(req,copy)).catch(()=>{});}return response;
 })));
});
