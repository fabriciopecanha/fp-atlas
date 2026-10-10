const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function page(build){
 const elements=new Map(),events={},workerEvents={},get=id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:false,textContent:''});return elements.get(id)};
 class Channel{constructor(){this.port1={onmessage:null,close(){}};this.port2={postMessage:data=>this.port1.onmessage?.({data})}}}
 const state={build,extras:14,total:14,core:true};
 const controller={postMessage(data,ports){ports?.[0].postMessage({...state})}};
 const waiting={postMessage(data){if(data.type==='SKIP_WAITING')waiting.skipped=true}};
 const registration={active:controller,waiting:null,addEventListener(){},update:async()=>{}};
 let reloads=0;
 const context={$:get,location:{protocol:'https:',reload(){reloads++}},navigator:{onLine:true,serviceWorker:{controller,register:async()=>registration,ready:Promise.resolve(registration),addEventListener:(k,f)=>workerEvents[k]=f}},document:{addEventListener:(k,f)=>events[k]=f},window:{isSecureContext:true,addEventListener(){}},MessageChannel:Channel,setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(fs.readFileSync('src/pwa.js','utf8').replace('{{BUILD_ID}}',build).replace(/setupPwa\(\);\s*$/,''),context);
 return {context,state,registration,waiting,elements,workerEvents,get reloads(){return reloads},setup:()=>vm.runInContext('setupPwa()',context)};
}
(async()=>{
 const a=page('A'),other=page('A');await a.setup();await other.setup();
 assert.equal(a.reloads,0);
 // Uma aba aplica; ambas recebem controllerchange e abandonam HTML antigo.
 a.registration.waiting=a.waiting;a.elements.get('pwa-update').onclick();assert(a.waiting.skipped);assert.equal(a.reloads,0);
 a.state.build='B';other.state.build='B';await a.workerEvents.controllerchange();await other.workerEvents.controllerchange();assert.equal(a.reloads,1);assert.equal(other.reloads,1);
 await a.workerEvents.controllerchange();assert.equal(a.reloads,1);
 // Primeira instalação da mesma versão não entra em loop de reload.
 const fresh=page('B');await fresh.setup();await fresh.workerEvents.controllerchange();assert.equal(fresh.reloads,0);
 console.log('PASS: aplicação só após ativação, duas abas recarregam na troca, primeiro controle sem loop.');
})().catch(e=>{console.error(e);process.exitCode=1});
