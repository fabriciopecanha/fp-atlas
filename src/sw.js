'use strict';
const BUILD='{{BUILD_ID}}';
const PREFIX='fp-atlas-shell-';
const CACHE=PREFIX+BUILD;
const BASE=self.registration.scope;
const url=path=>new URL(path,BASE).href;
const HTML=url('index.html');
const CORE=[HTML,url('manifest.webmanifest'),url('assets/icon-180.png'),url('assets/icon-192.png'),url('assets/icon-512.png')];
const EXTRAS=['corne','sofle'].flatMap(model=>Array.from({length:6},(_,layer)=>url('assets/'+model+'-l'+layer+'.webp'))).concat([url('assets/manual-v21.pdf'),url('assets/adesivos-v21.pdf')]);
async function checkedFetch(address,timeout=12000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(address,{cache:'reload',signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);return response}finally{clearTimeout(timer)}}
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const address of CORE)await cache.put(address,await checkedFetch(address));})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim()})())});
async function status(){const cache=await caches.open(CACHE);let extras=0;for(const address of EXTRAS)if(await cache.match(address))extras++;return {core:!!(await cache.match(HTML)),extras,total:EXTRAS.length,build:BUILD}}
let extrasJob=null;
async function saveExtras(client){const cache=await caches.open(CACHE);let done=0;for(const address of EXTRAS){if(!await cache.match(address))await cache.put(address,await checkedFetch(address));done++;client?.postMessage({type:'OFFLINE_PROGRESS',done,total:EXTRAS.length})}return status()}
self.addEventListener('message',event=>{const type=event.data?.type;if(type==='SKIP_WAITING'){event.waitUntil(self.skipWaiting());return}if(type==='CACHE_STATUS'){event.waitUntil(status().then(result=>event.ports[0]?.postMessage(result)));return}if(type==='CACHE_EXTRAS'){if(!extrasJob)extrasJob=saveExtras(event.source).finally(()=>{extrasJob=null});event.waitUntil(extrasJob.then(result=>event.ports[0]?.postMessage(result)).catch(()=>event.ports[0]?.postMessage({error:'Falha ao salvar arquivos offline'})))}});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const address=new URL(request.url),base=new URL(BASE);if(address.origin!==base.origin||!address.pathname.startsWith(base.pathname))return;const page=address.pathname===base.pathname||address.pathname===new URL(HTML).pathname;if(page){event.respondWith((async()=>{try{return await checkedFetch(HTML,5000)}catch{const cached=await (await caches.open(CACHE)).match(HTML);return cached||new Response('Atlas ainda não salvo offline. Conecte-se e abra o site uma vez.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})}})());return}const canonical=address.origin+address.pathname;if(![...CORE,...EXTRAS].includes(canonical))return;event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(canonical);if(cached)return cached;return checkedFetch(canonical)})())});
