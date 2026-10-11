const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.value='';this.hidden=false;this.handlers={};this.style={setProperty(){}};this.classList={toggle(){},add(){},remove(){}};this.attributes={}}append(...a){this.children.push(...a)}replaceChildren(...a){this.children=a}setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]}addEventListener(k,f){this.handlers[k]=f}focus(){context.lastFocused=this}blur(){}remove(){}select(){}setSelectionRange(){}querySelectorAll(s){const out=[];function walk(n){for(const c of n.children||[]){if(!s||s==='button'){if(c.tag==='button')out.push(c)}else if(s==='[data-id]'){if(c.dataset?.id)out.push(c)}else if(s==='.fav-btn'){if(c.className?.includes('fav-btn'))out.push(c)}walk(c)}}walk(this);return out}querySelector(s){function findClass(n,cls){if(n.className?.includes(cls))return n;for(const c of n.children||[]){const r=findClass(c,cls);if(r)return r}return null}function match(n){if(s==='.fav-btn')return findClass(n,'fav-btn');const m=s.match(/data-id="([^"]+)"/);if(m&&n.dataset?.id===m[1])return findClass(n,'fav-btn');for(const c of n.children||[]){const r=match(c);if(r)return r}return null}return match(this)}click(){if(this.onclick)this.onclick()}}
const map=new Map(),get=id=>{if(!map.has(id))map.set(id,new El());return map.get(id)},nav=[new El(),new El()];nav[0].dataset.view='linux';nav[1].dataset.view='keyboard';const eventHandlers={},windowEventHandlers={},themeStore={'fp-atlas-v02-theme':'light'};const context={ATLAS_DATA:JSON.parse(fs.readFileSync('atlas_base.json','utf8')),SHORTCUTS:JSON.parse(fs.readFileSync('shortcuts.json','utf8')),URL,Blob,document:{getElementById:get,createElement:t=>new El(t),createTextNode:t=>({textContent:t}),querySelectorAll:s=>s==='.nav'?nav:s==='.area-btn'?get('area-nav').children:[],body:new El(),addEventListener(k,f){(eventHandlers[k]||=[]).push(f)}},navigator:{clipboard:{writeText:async t=>{context.copied=t}}},location:{hash:''},window:{isSecureContext:true,scrollX:0,scrollY:0,scrollTo(){},addEventListener(k,f){(windowEventHandlers[k]||=[]).push(f)}},localStorage:{getItem(k){return themeStore[k]??null},setItem(k,v){themeStore[k]=v}},setTimeout,clearTimeout,console};get('template-layer').value='0';vm.createContext(context);vm.runInContext(fs.readFileSync('src/app.js','utf8'),context);
assert.equal(get('cards').children.length,18);assert.equal(get('area-nav').children.length,9);assert.equal(get('group').children.length,new Set(context.ATLAS_DATA.rows.map(r=>r.section)).size+1);assert.equal(get('command').children.length,new Set(context.ATLAS_DATA.rows.map(r=>r.command)).size+1);
get('search').value='wireguard';get('search').handlers.input();assert(get('cards').children.length>0);get('search').value='ZZZZinexistente';get('search').handlers.input();assert.equal(get('cards').children.length,0);get('reset-filters').onclick();get('more').onclick();assert.equal(get('cards').children.length,36);
get('mobile-area').value='5';get('mobile-area').handlers.change();assert.equal(get('results-title').textContent,'Segurança e OSINT');get('command').value='nmap';get('command').handlers.change();assert.equal(get('results-title').textContent,'nmap');let nmapIDs=[];function walk(n,ids){if(n?.dataset?.id)ids.push(n.dataset.id);for(const c of n?.children||[])walk(c,ids)}walk(get('cards'),nmapIDs);assert.equal(nmapIDs.length,context.ATLAS_DATA.rows.filter(r=>r.vol===5&&r.command==='nmap').length);
get('reset-filters').onclick();vm.runInContext("rows.forEach(r=>expanded.add(JSON.stringify([r.vol,r.section,r.command])));limit=Infinity;render()",context);const ids=[];walk(get('cards'),ids);assert.equal(ids.length,context.ATLAS_DATA.rows.length);assert.equal(new Set(ids).size,context.ATLAS_DATA.rows.length);
// Catálogo não deve fingir ser receita copiável; ffuf deve ter uso real.
const catalogIDs=new Set(context.ATLAS_DATA.rows.filter(r=>r.kind==='catalog').map(r=>r.id));let catalogSeen=0;
function checkRecipes(n){if(n?.dataset?.id){const codeBoxes=(n.children||[]).filter(c=>c.className==='code-wrap');if(catalogIDs.has(n.dataset.id)){catalogSeen++;assert.equal(codeBoxes.length,0)}else if(context.ATLAS_DATA.rows.find(r=>r.id===n.dataset.id)?.command==='ffuf'){assert.equal(codeBoxes.length,1);assert(codeBoxes[0].children[0].textContent.startsWith('ffuf -w '))}}for(const c of n?.children||[])checkRecipes(c)}
checkRecipes(get('cards'));assert.equal(catalogSeen,catalogIDs.size);

assert.equal(get('mac-shortcut-cards').children.length,context.SHORTCUTS.filter(r=>r.platform==='mac').length);assert.equal(get('linux-shortcut-cards').children.length,context.SHORTCUTS.filter(r=>r.platform==='linux').length);get('mac-shortcut-search').value='spotlight';get('mac-shortcut-search').oninput();assert.equal(get('mac-shortcut-cards').children.length,1);get('mac-shortcut-reset').onclick();assert.equal(get('mac-shortcut-cards').children.length,context.SHORTCUTS.filter(r=>r.platform==='mac').length);assert.equal(themeStore['fp-atlas-theme'],'light');nav[1].onclick();let prevented=false;for(const f of eventHandlers.keydown)f({key:'5',target:{closest(){return null}},preventDefault(){prevented=true}});assert.equal(get('template-layer').value,'5');assert(prevented);assert.equal(get('template-image').src,'assets/corne-l5.webp');for(const f of eventHandlers.keydown)f({key:'2',target:{closest(){return true}},preventDefault(){}});assert.equal(get('template-layer').value,'5');assert.equal(get('keyboard-view').hidden,false);get('back').onclick();assert.equal(get('linux-view').hidden,false);

// Testes do atalho / e Ctrl/Cmd K com guardas estritas
context.lastFocused=null;let pCount=0;
for(const f of eventHandlers.keydown)f({key:'/',target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,get('search'));assert.equal(pCount,1);
// Shift permitido (layouts internacionais com barra via Shift)
context.lastFocused=null;for(const f of eventHandlers.keydown)f({key:'/',shiftKey:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,get('search'));assert.equal(pCount,2);
// Bloqueado em campos em edição
context.lastFocused=null;for(const f of eventHandlers.keydown)f({key:'/',target:{closest:()=>true},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
// Bloqueado com Ctrl, Alt ou Meta/Cmd isolados
for(const f of eventHandlers.keydown)f({key:'/',ctrlKey:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
for(const f of eventHandlers.keydown)f({key:'/',altKey:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
for(const f of eventHandlers.keydown)f({key:'/',metaKey:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
// Bloqueado em composição IME e quando defaultPrevented
for(const f of eventHandlers.keydown)f({key:'/',isComposing:true,target:{closest:()=>null},preventDefault(){pCount++}});
for(const f of eventHandlers.keydown)f({key:'/',defaultPrevented:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
// Em atalhos Linux foca linux-shortcut-search
vm.runInContext("showView('linux-shortcuts')",context);
for(const f of eventHandlers.keydown)f({key:'/',target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,get('linux-shortcut-search'));
// Em atalhos macOS foca mac-shortcut-search
vm.runInContext("showView('mac-shortcuts')",context);
for(const f of eventHandlers.keydown)f({key:'/',target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,get('mac-shortcut-search'));
// Em teclados volta para linux e foca search
vm.runInContext("showView('keyboard')",context);
for(const f of eventHandlers.keydown)f({key:'/',target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(vm.runInContext('view',context),'linux');assert.equal(context.lastFocused,get('search'));

// Testes de Favoritos
get('reset-filters').onclick();
const firstRecipe=context.ATLAS_DATA.rows[0];
let favButtons=[];
function findFavButtons(n){if(n?.className?.includes?.('fav-btn'))favButtons.push(n);for(const c of n?.children||[])findFavButtons(c)}
findFavButtons(get('cards'));
assert(favButtons.length>0);assert.equal(favButtons[0].attributes['aria-pressed'],'false');
// Favoritar o primeiro item e testar restauração de foco no teclado
favButtons[0].onclick();
assert.equal(context.lastFocused?.attributes?.['aria-pressed'],'true');
assert.equal(context.lastFocused?.textContent,'★');
assert(themeStore['fp-atlas-favorites'].includes(firstRecipe.id));
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (1)');assert.equal(get('export-favs-md').hidden,false);
// Filtrar por favoritos (terminologia: Itens favoritos)
get('fav-filter-btn').onclick();
assert.equal(get('cards').children.length,1);assert.equal(get('results-title').textContent,'Itens favoritos (1)');
// Desfavoritar o item e verificar foco redirecionado para o botão de filtro
favButtons=[];findFavButtons(get('cards'));favButtons[0].onclick();
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (0)');assert.equal(get('cards').children.length,0);
assert.equal(get('empty').hidden,false);assert.equal(get('empty-title').textContent,'Nenhum item salvo nos favoritos ainda.');
assert.equal(context.lastFocused,get('fav-filter-btn'));
// Adicionar 3 favoritos e testar redirecionamento de foco para item subsequente, item anterior e botão de filtro
get('reset-filters').onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[0].onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[1].onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[2].onclick();
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (3)');
get('fav-filter-btn').onclick();
assert.equal(get('clear-favs-btn').hidden,false);
let cardBtns=get('cards').querySelectorAll('.fav-btn');
assert.equal(cardBtns.length,3);
// Remover o item do meio (índice 1): foco deve ir para o item subsequente (índice 2)
const idNext=context.ATLAS_DATA.rows[2].id;
cardBtns[1].onclick();
assert.equal(context.lastFocused,get('cards').querySelector(`[data-id="${idNext}"] .fav-btn`));
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (2)');
// Remover o último item restante (índice 1 na nova lista): foco vai para o item anterior (índice 0)
const idFirst=context.ATLAS_DATA.rows[0].id;
cardBtns=get('cards').querySelectorAll('.fav-btn');
assert.equal(cardBtns.length,2);
cardBtns[1].onclick();
assert.equal(context.lastFocused,get('cards').querySelector(`[data-id="${idFirst}"] .fav-btn`));
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (1)');
// Remover o único item restante: foco vai para o botão de filtro de favoritos
cardBtns=get('cards').querySelectorAll('.fav-btn');
assert.equal(cardBtns.length,1);
cardBtns[0].onclick();
assert.equal(context.lastFocused,get('fav-filter-btn'));
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (0)');

// Teste de sanitização de IDs inválidos/antigos ao inicializar
get('reset-filters').onclick();
themeStore['fp-atlas-favorites']=JSON.stringify(['id_obsoleto_antigo_999',firstRecipe.id,'outro_id_inexistente']);
vm.runInContext("loadAndSanitizeFavorites();updateFavoritesUI()",context);
assert.equal(vm.runInContext("favorites.size",context),1);
assert.equal(vm.runInContext("favorites.has('id_obsoleto_antigo_999')",context),false);
assert.equal(vm.runInContext("favorites.has('"+firstRecipe.id+"')",context),true);
assert.equal(themeStore['fp-atlas-favorites'],JSON.stringify([firstRecipe.id]));
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (1)');

// Teste de falha ao salvar (QuotaExceeded / storage bloqueado)
const secondRecipe=context.ATLAS_DATA.rows[1];
const origSetItem=context.localStorage.setItem;
context.localStorage.setItem=()=>{throw new Error('QuotaExceeded')};
const ok=vm.runInContext("toggleFavorite('"+secondRecipe.id+"')",context);
assert.equal(ok,false);
assert.equal(vm.runInContext("favorites.has('"+secondRecipe.id+"')",context),false);
assert.equal(get('toast').textContent,'Não foi possível salvar no armazenamento local do navegador.');
context.localStorage.setItem=origSetItem;

// Teste de sincronização entre abas via evento storage (chave específica e limpeza total com key: null)
themeStore['fp-atlas-favorites']=JSON.stringify([firstRecipe.id,secondRecipe.id]);
for(const f of windowEventHandlers.storage||[])f({key:'fp-atlas-favorites'});
assert.equal(vm.runInContext("favorites.size",context),2);
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (2)');
themeStore['fp-atlas-favorites']='[]';
for(const f of windowEventHandlers.storage||[])f({key:null});
assert.equal(vm.runInContext("favorites.size",context),0);
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (0)');

// Teste de exportação Markdown (resiliência de cercas e formato)
vm.runInContext("favorites.add('"+firstRecipe.id+"');favorites.add('"+secondRecipe.id+"')",context);
const testRow=vm.runInContext("rows.find(r=>r.id==='"+firstRecipe.id+"')",context);
const origEx=testRow.example;testRow.example='echo `date` && echo ```test```';
let exportedText='';
context.URL.createObjectURL=blob=>{exportedText=blob.content;return 'blob:test'};
context.Blob=class{constructor([c]){this.content=c}};
get('export-favs-md').onclick();
assert(exportedText.startsWith('# FP Atlas · Favoritos'));
assert(exportedText.includes(firstRecipe.command));assert(exportedText.includes(firstRecipe.purpose));assert(exportedText.includes(firstRecipe.risk));assert(exportedText.includes(firstRecipe.source));
assert(exportedText.includes('2 itens selecionados'));
// Com 3 crases dentro do exemplo, a cerca deve usar 4 crases
assert(exportedText.includes('````bash\necho `date` && echo ```test```\n````'));
testRow.example=origEx;

// Verificações editoriais e de sintaxe da base (clamdscan, apt-get purge, podman ps)
const clamRow=context.ATLAS_DATA.rows.find(r=>r.id==='be8c254917');
assert.equal(clamRow?.risk,'RISCO');
assert(clamRow?.notes?.includes('--move'));
assert(clamRow?.purpose?.includes('sem lixeira'));

const aptRow=context.ATLAS_DATA.rows.find(r=>r.id==='d612e7533c');
assert.equal(aptRow?.risk,'RISCO');
assert(aptRow?.purpose?.includes('gerenciadas pelo pacote'));
assert(aptRow?.notes?.includes('destrutiva'));
assert(aptRow?.notes?.includes('/etc'));
assert(aptRow?.notes?.includes('pasta pessoal'));
assert(aptRow?.notes?.includes('.rpmsave'));

const aptRemoveRow=context.ATLAS_DATA.rows.find(r=>r.id==='531dfc8dab');
assert(aptRemoveRow?.purpose?.includes('gerenciadas pelo pacote'));

const podmanRow=context.ATLAS_DATA.rows.find(r=>r.id==='dac96ba421');
assert(podmanRow?.example?.includes('{{.ID}}'));
assert(!podmanRow?.example?.includes('\\{\\{'));

// Validação do Lote 1 (39 receitas de discos, sistemas de arquivos e exclusão)
const batch1Cmds=new Set(['rm','shred','wipefs','dd','mkfs','mkfs.ext4','mkfs.btrfs','mkfs.fat','mkfs.ntfs','truncate','losetup','fdisk','cfdisk','sfdisk','parted','fsck','e2fsck','xfs_repair']);
const batch1Rows=context.ATLAS_DATA.rows.filter(r=>batch1Cmds.has(r.command));
assert.equal(batch1Rows.length,39);
for(const r of batch1Rows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&r.doc_ref.startsWith('https://manpages.debian.org/'),`Registro ${r.id} (${r.command}) requer doc_ref canônico Debian`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
  // Testa renderização de sourceDetails
  const detail=vm.runInContext(`sourceDetails(${JSON.stringify(r)})`,context);
  assert(detail.children.some(c=>c.className==='review-status'&&c.textContent.includes('Revisão documental')));
  assert(detail.children.some(c=>c.className==='doc-ref'&&c.textContent.includes('Documentação técnica')));
}

// Verificações específicas de precisão técnica no Lote 1
const wipefsRow=context.ATLAS_DATA.rows.find(r=>r.id==='07b952d517');
assert.equal(wipefsRow?.risk,'CONSULTA','wipefs --no-act deve ser classificado operacionalmente como CONSULTA');
assert(wipefsRow?.example?.includes('--no-act'));

const ntfsRow=context.ATLAS_DATA.rows.find(r=>r.id==='e8196aeba5');
assert.equal(ntfsRow?.command,'mkfs.ntfs');
assert.equal(ntfsRow?.risk,'RISCO');
assert(ntfsRow?.example?.includes('--fast'));
assert(!ntfsRow?.example?.includes('-c /dev/'));
assert(ntfsRow?.notes?.includes('cluster'));

const fsckRow=context.ATLAS_DATA.rows.find(r=>r.id==='0e2445fe60');
assert.equal(fsckRow?.risk,'CONSULTA');
assert(fsckRow?.notes?.includes('e2fsck -fn'));

const e2fsckRow=context.ATLAS_DATA.rows.find(r=>r.id==='e59a343bff');
assert.equal(e2fsckRow?.risk,'CONSULTA');

const xfsRow=context.ATLAS_DATA.rows.find(r=>r.id==='63a2ec0e0b');
assert.equal(xfsRow?.risk,'CONSULTA');

const fdiskListRow=context.ATLAS_DATA.rows.find(r=>r.id==='c74454915e');
assert.equal(fdiskListRow?.risk,'CONSULTA');

const ddIsoRow=context.ATLAS_DATA.rows.find(r=>r.id==='4255d2e070');
assert(ddIsoRow?.notes?.includes('apenas a região correspondente ao tamanho da imagem'));
assert(ddIsoRow?.notes?.includes('wipefs remove assinaturas reconhecidas; não sobrescreve esses dados nem realiza apagamento seguro'));

const ddCloneRow=context.ATLAS_DATA.rows.find(r=>r.id==='879289edae');
assert(ddCloneRow?.notes?.includes('capacidade da origem'));

const ddImgRow=context.ATLAS_DATA.rows.find(r=>r.id==='93f99affea');
assert(ddImgRow?.notes?.includes('ddrescue'));
assert(ddImgRow?.notes?.includes('ibs'));

vm.runInContext("copy('git status')",context).then(()=>{assert.equal(context.copied,'git status');context.window.isSecureContext=false;context.document.execCommand=()=>true;let restored=false,scrolled=false;context.document.activeElement={isConnected:true,focus(o){restored=o.preventScroll}};context.window.scrollTo=()=>{scrolled=true};return vm.runInContext("copy('fallback')",context).then(()=>{assert(restored);assert(scrolled);console.log('PASS: 2.653 entradas acessíveis, Lote 1 de 39 receitas de discos/FS/exclusão com revisão documental e doc_ref, metadados de auditoria validados, atalho / com guardas estritas, sincronização de storage, foco de teclado adjacente e testes executados.')})});
