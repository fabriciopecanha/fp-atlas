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
assert(fsckRow?.name?.includes('ext2/ext3/ext4'));
assert(fsckRow?.purpose?.includes('ext2/ext3/ext4'));
assert(fsckRow?.notes?.includes('fsck.ext4/e2fsck'));

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

// Validação do Lote 2A (23 receitas de LVM, swap, zram, criptografia LUKS e RAID)
const batch2AIds=new Set([
  '830d704963','7c97b7175a','00d3f08590',
  'e5112752f4','3ff2827e11','b442485227',
  '1f810c88b2','0ede7d8338','2252b3c4f5',
  '2af1dcbfa0','dae5a29725','a2120adeae',
  'cba04c4b94','803f225dcb','c1936f1dbb',
  '28575e339b',
  '0ddd3d7d65','862a950e54',
  'dd162045a1','91dd5e3e8f','11f3e80db4','e5ef22d0c6','70f519dc76'
]);
const batch2ARows=context.ATLAS_DATA.rows.filter(r=>batch2AIds.has(r.id));
assert.equal(batch2ARows.length,23,'Lote 2A deve conter exatamente 23 receitas');
for(const r of batch2ARows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&r.doc_ref.startsWith('https://manpages.debian.org/'),`Registro ${r.id} (${r.command}) requer doc_ref Debian`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
}

// Asserções técnicas específicas do Lote 2A
const vgcreateRow=context.ATLAS_DATA.rows.find(r=>r.id==='1f810c88b2');
assert.equal(vgcreateRow?.risk,'RISCO','vgcreate com partição genérica deve ser RISCO por poder inicializar PV');
assert(vgcreateRow?.notes?.includes('DESTRUTIVO SE NÃO INICIALIZADO'));

const resizeRow=context.ATLAS_DATA.rows.find(r=>r.id==='c1936f1dbb');
assert(resizeRow?.purpose?.includes('Após ampliar o volume lógico'));
assert(resizeRow?.notes?.includes('desmontagem'));

const lvextendRRow=context.ATLAS_DATA.rows.find(r=>r.id==='803f225dcb');
assert(lvextendRRow?.purpose?.includes('via fsadm'));
assert(lvextendRRow?.notes?.includes('fsadm'));

const lsmodRow=context.ATLAS_DATA.rows.find(r=>r.id==='dd162045a1');
assert.equal(lsmodRow?.command,'lsmod');
assert.equal(lsmodRow?.risk,'CONSULTA');

const modprobe1=context.ATLAS_DATA.rows.find(r=>r.id==='91dd5e3e8f');
assert.equal(modprobe1?.command,'modprobe');
assert(modprobe1?.notes?.includes('não configura nem ativa swap'));

const modprobe2=context.ATLAS_DATA.rows.find(r=>r.id==='11f3e80db4');
assert.equal(modprobe2?.command,'modprobe');
assert(modprobe2?.notes?.includes('não configura nem ativa swap'));
assert(modprobe2?.notes?.includes('O parâmetro num_devices=2 é aplicado ao carregar o módulo'));
assert(modprobe2?.notes?.includes('Não descarregue o módulo enquanto houver dispositivos em uso'));

const zramStatus=context.ATLAS_DATA.rows.find(r=>r.id==='70f519dc76');
assert.equal(zramStatus?.risk,'CONSULTA');
assert(zramStatus?.notes?.includes('COMPR'));
assert(zramStatus?.notes?.includes('TOTAL'));

const luksBackup=context.ATLAS_DATA.rows.find(r=>r.id==='00d3f08590');
assert(luksBackup?.notes?.includes('Uma senha válida naquele momento'));

const swapoffRow=context.ATLAS_DATA.rows.find(r=>r.id==='862a950e54');
assert.equal(swapoffRow?.risk,'RISCO');
assert(swapoffRow?.notes?.includes('Pode causar forte pressão de memória ou falhar por memória insuficiente'));

const swaponRow=context.ATLAS_DATA.rows.find(r=>r.id==='0ddd3d7d65');
assert.equal(swaponRow?.risk,'CONSULTA');

const mdadmRow=context.ATLAS_DATA.rows.find(r=>r.id==='28575e339b');
assert.equal(mdadmRow?.risk,'CONSULTA');

// Validação do Lote 2B (37 receitas de Btrfs)
const batch2BIds=new Set([
  '0de1c037d5','3b6609de7b','b5939207a0','5c710a191f','c8984ae673','043b0b348c','84cf91c797','6ecd667de8','1f88e5cb4d',
  '208ee5bfba','86e91b5264','2ad8fb6100','5d2cd6c34a','705e381044','c0100d2784','092cad1486','4fe7575516',
  'c598320d18','d53d5c6dc9','f5fa6f7e49','51ca157dd5','bf3b0eebe6','2f12e9aabb','a2424f66a8',
  '0ed24856cb','055ae6b863','c6c667d20b','474d4080db','56c66a8e42','0db05a3fb7',
  'f66e8dd11b','186f690634','c1f74837b6','5e064781a7','52cefb86ff',
  '6182925875','6b08d0a859'
]);
const batch2BRows=context.ATLAS_DATA.rows.filter(r=>batch2BIds.has(r.id));
assert.equal(batch2BRows.length,37,'Lote 2B deve conter exatamente 37 receitas');
for(const r of batch2BRows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&r.doc_ref.startsWith('https://manpages.debian.org/'),`Registro ${r.id} (${r.command}) requer doc_ref Debian`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
}

// Asserções técnicas específicas do Lote 2B
const btrfsDelRow=context.ATLAS_DATA.rows.find(r=>r.id==='1f88e5cb4d');
assert.equal(btrfsDelRow?.risk,'RISCO');
assert(!btrfsDelRow?.notes?.includes('--commit-after'));
assert(btrfsDelRow?.notes?.includes('subvolumes filhos precisam ser removidos previamente'));

const btrfsShowRow=context.ATLAS_DATA.rows.find(r=>r.id==='5c710a191f');
assert.equal(btrfsShowRow?.risk,'CONSULTA');
assert(!btrfsShowRow?.purpose?.includes('cotas'));
assert(btrfsShowRow?.notes?.includes('btrfs qgroup show'));

const btrfsDuRow=context.ATLAS_DATA.rows.find(r=>r.id==='705e381044');
assert.equal(btrfsDuRow?.risk,'CONSULTA');
assert(btrfsDuRow?.name?.includes('espaço total, exclusivo e compartilhado'));
assert(btrfsDuRow?.notes?.includes('Não representa diretamente o espaço físico em disco após compressão transparente'));

const btrfsSyncRow=context.ATLAS_DATA.rows.find(r=>r.id==='4fe7575516');
assert(btrfsSyncRow?.notes?.includes('Força a sincronização do filesystem e inicia a limpeza de subvolumes excluídos'));
assert(btrfsSyncRow?.notes?.includes('btrfs subvolume sync'));
assert(!btrfsSyncRow?.notes?.includes('comitê'));

const btrfsRaid6Row=context.ATLAS_DATA.rows.find(r=>r.id==='a2424f66a8');
assert.equal(btrfsRaid6Row?.risk,'RISCO');
assert(btrfsRaid6Row?.notes?.includes('write-hole'));
assert(btrfsRaid6Row?.notes?.includes('experimentais e instáveis'));
assert(!btrfsRaid6Row?.notes?.includes('quatro para tolerar duas falhas'));

const btrfsDevStatsRow=context.ATLAS_DATA.rows.find(r=>r.id==='f66e8dd11b');
assert.equal(btrfsDevStatsRow?.risk,'CONSULTA');
assert(btrfsDevStatsRow?.notes?.includes('indica erros registrados que precisam ser investigados'));
assert(btrfsDevStatsRow?.notes?.includes('contadores são persistentes no disco'));

const btrfsDevAddRow=context.ATLAS_DATA.rows.find(r=>r.id==='5e064781a7');
assert.equal(btrfsDevAddRow?.risk,'RISCO');
assert(btrfsDevAddRow?.notes?.includes('OPERAÇÃO DE RISCO PARA O NOVO DISPOSITIVO'));
assert(btrfsDevAddRow?.notes?.includes('dados contidos no filesystem existente em /mnt/btrfs são preservados'));

const btrfsDevRemRow=context.ATLAS_DATA.rows.find(r=>r.id==='52cefb86ff');
assert.equal(btrfsDevRemRow?.risk,'RISCO');
assert(btrfsDevRemRow?.notes?.includes('migra e realoca todos os chunks'));
assert(btrfsDevRemRow?.notes?.includes('não apaga os arquivos do filesystem'));
assert(btrfsDevRemRow?.notes?.includes('perfil de redundância ativo'));

const btrfsSnapRoRow=context.ATLAS_DATA.rows.find(r=>r.id==='84cf91c797');
assert.equal(btrfsSnapRoRow?.risk,'ALTERA');
assert(btrfsSnapRoRow?.name?.includes('somente leitura'));
assert(!btrfsSnapRoRow?.name?.includes('imutável'));
assert(btrfsSnapRoRow?.notes?.includes('não o torna intrinsecamente imutável'));
assert(btrfsSnapRoRow?.notes?.includes('btrfs property set'));
assert(btrfsSnapRoRow?.notes?.includes('NÃO inclui recursivamente o conteúdo de subvolumes aninhados'));
assert(btrfsSnapRoRow?.notes?.includes('não substituem backups externos'));

const btrfsQgroupShowRow=context.ATLAS_DATA.rows.find(r=>r.id==='6b08d0a859');
assert.equal(btrfsQgroupShowRow?.risk,'CONSULTA');
assert(btrfsQgroupShowRow?.example?.includes('-r -e'));
assert(btrfsQgroupShowRow?.notes?.includes('-r (max_rfer) e -e (max_excl)'));

// Validação do Lote 3A (34 receitas de inspeção e espaço em disco)
const batch3AIds=new Set([
  '0c21d4ac12','e0b84bbd24','1953cf78e4','a0a20e3d5f','a217c3f93b','6a84c0e009','d8d0915fa0','7a47f6f7dc','67b4bc20fc',
  'f126e2a593','93adcd9796','67a7332c45','9691204f76','a613b6555e','fc2ca161dd','d58a3784c9',
  '69a0f5abe4','be7bb5194f','b0bdf0d833','b4b9f5f90a','2a314e662a','beac716247','f86c6b153a',
  '79101256c9','234818bb91','295477f72f','e0cda7ad65','7cdab5e99b',
  'd00bdc642c','622b3a3a47',
  '38013a0e57','28752ee34d',
  '07cd2b1bef','1b661ce39c'
]);
const batch3ARows=context.ATLAS_DATA.rows.filter(r=>batch3AIds.has(r.id));
assert.equal(batch3ARows.length,34,'Lote 3A deve conter exatamente 34 receitas');
for(const r of batch3ARows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&(r.doc_ref.startsWith('https://manpages.debian.org/')||r.doc_ref.startsWith('https://github.com/bootandy/dust')),`Registro ${r.id} (${r.command}) requer doc_ref canônico Debian ou upstream`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
}

// Asserções técnicas específicas do Lote 3A
const duARow=context.ATLAS_DATA.rows.find(r=>r.id==='9691204f76');
assert.equal(duARow?.risk,'CONSULTA');
assert(duARow?.notes?.includes('A opção -a exibe também o tamanho de cada arquivo individual, além dos totais dos diretórios.'));

const duHRow=context.ATLAS_DATA.rows.find(r=>r.id==='93adcd9796');
assert.equal(duHRow?.risk,'CONSULTA');
assert(duHRow?.notes?.includes('Estima o espaço alocado informado pelo sistema de arquivos'));
assert(!duHRow?.notes?.includes('refletindo o consumo real no armazenamento'));

const duThreshRow=context.ATLAS_DATA.rows.find(r=>r.id==='d58a3784c9');
assert.equal(duThreshRow?.risk,'CONSULTA');
assert.equal(duThreshRow?.example,'du -ah -t 1G -- .');
assert(duThreshRow?.notes?.includes('pelo menos 1 GiB'));

const dustNRow=context.ATLAS_DATA.rows.find(r=>r.id==='b0bdf0d833');
assert.equal(dustNRow?.risk,'CONSULTA');
assert(dustNRow?.doc_ref?.startsWith('https://github.com/bootandy/dust'));
assert(dustNRow?.notes?.includes('arquivos ou diretórios'));
assert(dustNRow?.notes?.includes('altura do terminal'));

const dustXRow=context.ATLAS_DATA.rows.find(r=>r.id==='beac716247');
assert.equal(dustXRow?.example,'dust -X node_modules');

const ncduSafeRow=context.ATLAS_DATA.rows.find(r=>r.id==='79101256c9');
assert.equal(ncduSafeRow?.risk,'CONSULTA');
assert.equal(ncduSafeRow?.example,'ncdu -rr');
assert(ncduSafeRow?.notes?.includes('desabilitando a exclusão de arquivos'));
assert(ncduSafeRow?.notes?.includes('desabilita a abertura de subshells'));

const ncduOutRow=context.ATLAS_DATA.rows.find(r=>r.id==='e0cda7ad65');
assert.equal(ncduOutRow?.risk,'ALTERA');
assert.equal(ncduOutRow?.example,'ncdu -o inventario.json');
assert(!ncduOutRow?.example?.includes('.gz'));
assert(ncduOutRow?.notes?.includes('ncdu -f inventario.json'));

const blkidTabRow=context.ATLAS_DATA.rows.find(r=>r.id==='d00bdc642c');
assert.equal(blkidTabRow?.risk,'CONSULTA');
assert(blkidTabRow?.notes?.includes('/run/blkid/blkid.tab'));

const blkidListRow=context.ATLAS_DATA.rows.find(r=>r.id==='622b3a3a47');
assert.equal(blkidListRow?.risk,'CONSULTA');
assert(blkidListRow?.notes?.includes('depreciado'));
assert(blkidListRow?.notes?.includes('lsblk -f'));

const lsblkTreeRow=context.ATLAS_DATA.rows.find(r=>r.id==='e0b84bbd24');
assert.equal(lsblkTreeRow?.risk,'CONSULTA');
assert(lsblkTreeRow?.purpose?.includes('incluindo as desmontadas'));

// Validação do Lote 3B (31 receitas de montagem, cotas, ferramentas de bloco e diagnóstico)
const batch3BIds=new Set([
  '88b712a131','cd6aec8b41','23bb3ff5be','2f63203eb6',
  'b541c59b66','855dc8877d','a67a7525d1','b2eb55ebff','3583e2ca73','8bcf02da41',
  '7ac2c802ac','0bb1986280','7550c01d60','d71e7cbb95','28459446dd','7ab6ff6883','41185c3753','69a1b49705',
  '53d0c69d23','34772c6b09','713b9c45a7','a5a44512b7','5ae2dc7fad','b46217f6e1',
  '17df165811','9d04ee4c95','74c95d18e6','f3ac4281a7','b8a5899343','1bcf786e44','84f3317b3e'
]);
const batch3BRows=context.ATLAS_DATA.rows.filter(r=>batch3BIds.has(r.id));
assert.equal(batch3BRows.length,31,'Lote 3B deve conter exatamente 31 receitas');
for(const r of batch3BRows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&(r.doc_ref.startsWith('https://manpages.debian.org/')||r.doc_ref.startsWith('https://openzfs.github.io/')||r.doc_ref.startsWith('https://github.com/Byron/dua-cli')||r.doc_ref.startsWith('https://github.com/muesli/duf')),`Registro ${r.id} (${r.command}) requer doc_ref canônico Debian ou upstream`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
}

// Asserções técnicas específicas do Lote 3B
const mountRoRow=context.ATLAS_DATA.rows.find(r=>r.id==='88b712a131');
assert.equal(mountRoRow?.risk,'ALTERA');
assert(mountRoRow?.notes?.includes('journal replay'));
assert(mountRoRow?.notes?.includes('noload'));

const quotacheckRow=context.ATLAS_DATA.rows.find(r=>r.id==='a67a7525d1');
assert.equal(quotacheckRow?.risk,'ALTERA');
assert(!quotacheckRow?.example?.includes('-m'));
assert(quotacheckRow?.notes?.includes('quotaoff'));

const e2labelRow=context.ATLAS_DATA.rows.find(r=>r.id==='5ae2dc7fad');
assert.equal(e2labelRow?.risk,'CONSULTA');
assert(!e2labelRow?.notes?.includes('tune2fs -L'));

const xfsGrowfsNRow=context.ATLAS_DATA.rows.find(r=>r.id==='9d04ee4c95');
assert.equal(xfsGrowfsNRow?.risk,'CONSULTA');
assert(xfsGrowfsNRow?.purpose?.includes('Exibir a geometria do XFS e verificar argumentos sem modificar o sistema de arquivos'));

const fstrimRow=context.ATLAS_DATA.rows.find(r=>r.id==='23bb3ff5be');
assert.equal(fstrimRow?.risk,'ALTERA');
assert(fstrimRow?.notes?.includes('descarte potencial'));
assert(!fstrimRow?.notes?.includes('liberados imediatamente'));

const dumpe2fsRow=context.ATLAS_DATA.rows.find(r=>r.id==='713b9c45a7');
assert.equal(dumpe2fsRow?.risk,'CONSULTA');
assert(dumpe2fsRow?.notes?.includes('desatualizadas ou inconsistentes'));
assert(!dumpe2fsRow?.notes?.includes('--header'));

const duaRow=context.ATLAS_DATA.rows.find(r=>r.id==='1bcf786e44');
assert.equal(duaRow?.risk,'ALTERA');
assert(duaRow?.notes?.includes('dua aggregate .'));

const nvmeSmartJsonRow=context.ATLAS_DATA.rows.find(r=>r.id==='7ab6ff6883');
assert.equal(nvmeSmartJsonRow?.risk,'CONSULTA');
assert(nvmeSmartJsonRow?.example?.includes('-o json'));

// Validação do Lote 4A (33 receitas de permissões, atributos, ACL e capabilities)
const batch4AIds=new Set([
  '1ea12faa20','5baabe72e3','d2a5304a0e','572aa34ca7','b5c316d2cf','3e7b26d93a','2e78e26b45','e758dd79a9','d6c88c63fe','110b641b2e',
  '708b21a8f8','287f4c8f11','f522f934d8','d63f78a0a5','70f8440306','a774b14e96',
  '0c380f055c',
  '887ead4cb4','8037aab499','d3ced3fb48',
  '9d747fefdb',
  'fcb2eefc8d','f83dc1d459','d8aacedd51',
  '28c2f95a77','9c1970201d',
  '703a00d041','cd5326a8f8',
  'f34a9857b6','64c3e6ee24',
  '1553244b60','5ade6e4543','c4f2609dd4'
]);
const batch4ARows=context.ATLAS_DATA.rows.filter(r=>batch4AIds.has(r.id));
assert.equal(batch4ARows.length,33,'Lote 4A deve conter exatamente 33 receitas');
for(const r of batch4ARows){
  assert.equal(r.review_status,'documented',`Registro ${r.id} (${r.command}) deve ter review_status: documented`);
  assert.equal(r.reviewed_on,'2026-10-11',`Registro ${r.id} (${r.command}) deve ter reviewed_on: 2026-10-11`);
  assert(r.doc_ref&&r.doc_ref.startsWith('https://manpages.debian.org/'),`Registro ${r.id} (${r.command}) requer doc_ref Debian`);
  assert(!r.notes.includes('Mesma sintaxe em F/K'),`Registro ${r.id} (${r.command}) não deve conter nota genérica F/K`);
}

// Asserções técnicas específicas do Lote 4A
const chmod750Row=context.ATLAS_DATA.rows.find(r=>r.id==='1ea12faa20');
assert.equal(chmod750Row?.risk,'ALTERA');
assert(chmod750Row?.notes?.includes('00750'));
assert(chmod750Row?.notes?.includes('u-s,g-s'));

const umaskRow=context.ATLAS_DATA.rows.find(r=>r.id==='f34a9857b6');
assert.equal(umaskRow?.risk,'ALTERA');
assert(umaskRow?.notes?.includes('modo_solicitado & ~umask'));
assert(umaskRow?.notes?.includes('limitadas pelo modo solicitado'));

const chmodORow=context.ATLAS_DATA.rows.find(r=>r.id==='e758dd79a9');
assert.equal(chmodORow?.risk,'ALTERA');
assert(chmodORow?.notes?.includes('ACL estendida'));

const chmod640Row=context.ATLAS_DATA.rows.find(r=>r.id==='5baabe72e3');
assert.equal(chmod640Row?.risk,'ALTERA');
assert(chmod640Row?.notes?.includes('máscara da ACL'));

const setfaclRow=context.ATLAS_DATA.rows.find(r=>r.id==='f83dc1d459');
assert.equal(setfaclRow?.risk,'ALTERA');
assert(setfaclRow?.notes?.includes('recalcula a máscara'));
assert(setfaclRow?.notes?.includes('--no-mask'));

const setfattrRow=context.ATLAS_DATA.rows.find(r=>r.id==='9c1970201d');
assert.equal(setfattrRow?.risk,'ALTERA');
assert(setfattrRow?.notes?.includes('CAP_SYS_ADMIN'));
assert(setfattrRow?.notes?.includes('LSM'));

const suidRow=context.ATLAS_DATA.rows.find(r=>r.id==='1553244b60');
assert.equal(suidRow?.risk,'RISCO');
assert(suidRow?.notes?.includes('no_new_privs'));
assert(suidRow?.notes?.includes('nosuid'));

const chmodRecRisk=context.ATLAS_DATA.rows.find(r=>r.id==='d6c88c63fe');
assert.equal(chmodRecRisk?.risk,'RISCO');

const setcapRisk=context.ATLAS_DATA.rows.find(r=>r.id==='cd5326a8f8');
assert.equal(setcapRisk?.risk,'RISCO');

vm.runInContext("copy('git status')",context).then(()=>{assert.equal(context.copied,'git status');context.window.isSecureContext=false;context.document.execCommand=()=>true;let restored=false,scrolled=false;context.document.activeElement={isConnected:true,focus(o){restored=o.preventScroll}};context.window.scrollTo=()=>{scrolled=true};return vm.runInContext("copy('fallback')",context).then(()=>{assert(restored);assert(scrolled);console.log('PASS: 2.656 entradas acessíveis, Lote 1 (39), Lote 2A (23), Lote 2B (37), Lote 3A (34), Lote 3B (31) e Lote 4A (33) com revisão documental e doc_ref, metadados de auditoria validados, atalho / com guardas estritas, sincronização de storage, foco de teclado adjacente e testes executados.')})});
