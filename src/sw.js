'use strict';
const BUILD='{{BUILD_ID}}';
const PREFIX='fp-atlas-shell-';
const CACHE=PREFIX+BUILD;
const BASE=self.registration.scope;
const url=path=>new URL(path,BASE).href;
const HTML=url('index.html');
const absoluteManifest=manifest=>Object.fromEntries(Object.entries(manifest).map(([path,hash])=>[url(path),hash]));
// Hex SHA-256 dos bytes de cada arquivo, calculado no build.
const CORE_MANIFEST=absoluteManifest({{CORE_MANIFEST}});
const EXTRAS_MANIFEST=absoluteManifest({{EXTRAS_MANIFEST}});
const CORE=Object.keys(CORE_MANIFEST),EXTRAS=Object.keys(EXTRAS_MANIFEST);
const HASH_HEADER='X-Content-SHA256';

async function checkedFetch(address,timeout=12000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{const response=await fetch(address,{cache:'reload',signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);return response}
  finally{clearTimeout(timer)}
}
async function bodyHash(response){
  const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
async function verifiedResponse(response,expectedHash){
  if(!response.ok||await bodyHash(response)!==expectedHash)throw new Error('Arquivo incompatível com esta versão');
  const headers=new Headers(response.headers);
  headers.set(HASH_HEADER,expectedHash);
  headers.delete('Content-Encoding');headers.delete('Content-Length');
  return new Response(response.clone().body,{status:response.status,statusText:response.statusText,headers});
}
async function cachedVerified(cache,address,expectedHash){
  const response=await cache.match(address);
  if(!response||response.headers.get(HASH_HEADER)!==expectedHash)return null;
  return await bodyHash(response)===expectedHash?response:null;
}
async function fetchVerified(address,expectedHash){return verifiedResponse(await checkedFetch(address),expectedHash)}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{for(const address of CORE)await cache.put(address,await fetchVerified(address,CORE_MANIFEST[address]))}
  catch(error){await caches.delete(CACHE);throw error}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const current=await caches.open(CACHE);
  const oldKeys=(await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE);
  // Header e bytes precisam coincidir. V04/V05 sem header ficam pendentes.
  for(const key of oldKeys){
    const old=await caches.open(key);
    for(const [address,hash] of Object.entries(EXTRAS_MANIFEST)){
      if(await cachedVerified(current,address,hash))continue;
      const candidate=await cachedVerified(old,address,hash);
      if(candidate)await current.put(address,candidate);
    }
  }
  // Falha de armazenamento acima impede descarte dos caches anteriores.
  for(const key of oldKeys)await caches.delete(key);
  await self.clients.claim();
})()));
async function status(){
  const cache=await caches.open(CACHE);let extras=0;
  for(const address of EXTRAS)if(await cachedVerified(cache,address,EXTRAS_MANIFEST[address]))extras++;
  return {core:!!(await cachedVerified(cache,HTML,CORE_MANIFEST[HTML])),extras,total:EXTRAS.length,build:BUILD};
}
let extrasJob=null;
async function saveExtras(client){
  const cache=await caches.open(CACHE);let done=0;
  for(const address of EXTRAS){
    if(!await cachedVerified(cache,address,EXTRAS_MANIFEST[address]))await cache.put(address,await fetchVerified(address,EXTRAS_MANIFEST[address]));
    client?.postMessage({type:'OFFLINE_PROGRESS',done:++done,total:EXTRAS.length});
  }
  return status();
}
self.addEventListener('message',event=>{
  const type=event.data?.type;
  if(type==='SKIP_WAITING'){event.waitUntil(self.skipWaiting());return}
  if(type==='CACHE_STATUS'){event.waitUntil(status().then(result=>event.ports[0]?.postMessage(result)));return}
  if(type==='CACHE_EXTRAS'){
    if(!extrasJob)extrasJob=saveExtras(event.source).finally(()=>{extrasJob=null});
    event.waitUntil(extrasJob.then(result=>event.ports[0]?.postMessage(result)).catch(()=>event.ports[0]?.postMessage({error:'Falha de conexão ou arquivo incompatível com esta versão'})));
  }
});
function unavailable(){return new Response('A cópia desta versão não está disponível. Conecte-se, aguarde a atualização e recarregue. Se necessário, feche todas as abas do Atlas e abra novamente.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})}
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const address=new URL(request.url),base=new URL(BASE);
  if(address.origin!==base.origin||!address.pathname.startsWith(base.pathname))return;
  const page=address.pathname===base.pathname||address.pathname===new URL(HTML).pathname;
  const canonical=page?HTML:address.origin+address.pathname;
  const hash=CORE_MANIFEST[canonical]||EXTRAS_MANIFEST[canonical];if(!hash)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cachedVerified(cache,canonical,hash);
    if(cached)return cached;
    // Rede só pode recuperar bytes da versão ativa, inclusive HTML.
    try{
      const response=await fetchVerified(canonical,hash);
      if(CORE_MANIFEST[canonical])await cache.put(canonical,response.clone());
      return response;
    }catch{return unavailable()}
  })());
});
