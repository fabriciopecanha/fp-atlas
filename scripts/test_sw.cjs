const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto,createHash}=require('node:crypto');
const BASE='https://example.test/fp-atlas/',HEADER='X-Content-SHA256';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=new Map(['index.html','manifest.webmanifest','assets/icon-180.png','assets/icon-192.png','assets/icon-512.png',...['corne','sofle'].flatMap(m=>Array.from({length:6},(_,i)=>`assets/${m}-l${i}.webp`)),'assets/manual-v21.pdf','assets/adesivos-v21.pdf'].map(p=>[p,fs.readFileSync('dist/'+p)]));
const CORE=[...files.keys()].slice(0,5),EXTRAS=[...files.keys()].slice(5);
let network=new Map(files),offline=false,failAsset='',corruptAsset='',putFailure='',networkCalls=0;
const storage=new Map();
const caches={open:async name=>{if(!storage.has(name))storage.set(name,new Map());const m=storage.get(name);return {put:async(k,v)=>{if(putFailure===name&&String(k).endsWith('.webp'))throw Error('quota');m.set(String(k),v.clone())},match:async k=>m.get(String(k))?.clone(),delete:async k=>m.delete(String(k))}},keys:async()=>[...storage.keys()],delete:async k=>storage.delete(k)};
function worker(build,versionFiles){
 const events={},messages=[];let claimed=false;
 const self={registration:{scope:BASE},addEventListener:(t,f)=>events[t]=f,clients:{claim:async()=>{claimed=true}},skipWaiting:async()=>{self.skipped=true}};
 const manifest=paths=>Object.fromEntries(paths.map(p=>[p,hash(versionFiles.get(p))]));
 const source=fs.readFileSync('src/sw.js','utf8').replace('{{BUILD_ID}}',build).replace('{{CORE_MANIFEST}}',JSON.stringify(manifest(CORE))).replace('{{EXTRAS_MANIFEST}}',JSON.stringify(manifest(EXTRAS)));
 const context={self,caches,URL,Response,Headers,AbortController,crypto:webcrypto,setTimeout,clearTimeout,fetch:async address=>{networkCalls++;const p=String(address).slice(BASE.length);if(offline||p===failAsset)throw Error('network');if(!network.has(p))return new Response('missing',{status:404});return new Response(p===corruptAsset?'corrupt':network.get(p),{headers:{'Content-Type':'application/octet-stream'}})}};
 vm.createContext(context);vm.runInContext(source,context);
 async function event(type,data={}){const waits=[],responses=[];events[type]({...data,waitUntil:p=>waits.push(p),respondWith:p=>responses.push(p)});await Promise.all(waits);return responses.length?responses[0]:null}
 async function message(type){let reply;await event('message',{data:{type},source:{postMessage:x=>messages.push(x)},ports:[{postMessage:x=>reply=x}]});return reply}
 return {event,message,messages,get claimed(){return claimed},self};
}
const page=w=>w.event('fetch',{request:{method:'GET',url:BASE+'?v=test#linux'}});
(async()=>{
 const aFiles=new Map(files);aFiles.set('index.html',Buffer.from('HTML versão A'));
 network=new Map(aFiles);const a=worker('A',aFiles);await a.event('install');await a.event('activate');assert(a.claimed);
 await caches.open('unrelated-app');
 offline=true;assert.equal(await (await page(a)).text(),'HTML versão A');assert.equal(await a.event('fetch',{request:{method:'GET',url:'https://outside.test/file'}}),null);
 assert((await a.message('CACHE_EXTRAS')).error);assert.equal((await a.message('CACHE_STATUS')).extras,0);
 offline=false;failAsset='assets/corne-l2.webp';assert((await a.message('CACHE_EXTRAS')).error);assert.equal((await a.message('CACHE_STATUS')).extras,2);
 failAsset='';assert.equal((await a.message('CACHE_EXTRAS')).extras,14);assert.equal(a.messages.at(-1).done,14);
 const old=await caches.open('fp-atlas-shell-A');
 // Um legado sem header e um corpo adulterado com header aparentemente correto.
 await old.put(BASE+EXTRAS[1],new Response(aFiles.get(EXTRAS[1])));
 await old.put(BASE+EXTRAS[2],new Response('adulterado',{headers:{[HEADER]:hash(aFiles.get(EXTRAS[2]))}}));
 const bFiles=new Map(aFiles);bFiles.set('index.html',Buffer.from('HTML versão B'));bFiles.set(EXTRAS[0],Buffer.from('imagem alterada mesmo caminho'));
 network=new Map(bFiles);const b=worker('B',bFiles);await b.event('install');
 // B instalado/aguardando: A continua responsável e não busca HTML novo.
 const before=networkCalls;assert.equal(await (await page(a)).text(),'HTML versão A');assert.equal(networkCalls,before);assert(!b.claimed);
 await b.message('SKIP_WAITING');assert(b.self.skipped);await b.event('activate');assert(b.claimed);
 assert(!storage.has('fp-atlas-shell-A'));assert(storage.has('unrelated-app'));
 assert.equal((await b.message('CACHE_STATUS')).extras,11);
 const current=await caches.open('fp-atlas-shell-B');
 for(const p of EXTRAS.slice(0,3))assert.equal(await current.match(BASE+p),undefined);
 assert(await current.match(BASE+EXTRAS[3]));
 assert.equal(await (await page(b)).text(),'HTML versão B');
 // Resposta adulterada nunca recebe header de confiança nem entra no cache.
 corruptAsset=EXTRAS[0];assert((await b.message('CACHE_EXTRAS')).error);assert.equal((await b.message('CACHE_STATUS')).extras,11);
 corruptAsset='';assert.equal((await b.message('CACHE_EXTRAS')).extras,14);
 offline=true;const pdf=await b.event('fetch',{request:{method:'GET',url:BASE+'assets/manual-v21.pdf'}});assert.equal(pdf.status,200);assert.equal(pdf.headers.get(HEADER),hash(bFiles.get('assets/manual-v21.pdf')));
 // HTML removido + rede mais nova: 503, jamais troca silenciosa de versão.
 await current.delete(BASE+'index.html');offline=false;network.set('index.html',Buffer.from('HTML versão C'));
 assert.equal((await page(b)).status,503);
 network.set('index.html',bFiles.get('index.html'));assert.equal(await (await page(b)).text(),'HTML versão B');
 // Instalação incompatível falha sem destruir cache ativo.
 const c=worker('C',bFiles);network.set('index.html',Buffer.from('deploy posterior'));await assert.rejects(c.event('install'));assert(!storage.has('fp-atlas-shell-C'));assert(storage.has('fp-atlas-shell-B'));
 // Falha de quota na migração não descarta cache anterior.
 network=new Map(bFiles);const d=worker('D',bFiles);await d.event('install');putFailure='fp-atlas-shell-D';await assert.rejects(d.event('activate'));assert(storage.has('fp-atlas-shell-B'));assert(!d.claimed);
 console.log('PASS: hashes reais, HTML fixo por versão, atualização A→B, migração intacta, rejeição de legado/alteração/adulteração, retomada, recuperação estrita e quota.');
})().catch(e=>{console.error(e);process.exitCode=1});
