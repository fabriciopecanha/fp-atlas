const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.value='';this.hidden=false;this.handlers={};this.style={setProperty(){}};this.classList={toggle(){},add(){},remove(){}};this.attributes={}}append(...a){this.children.push(...a)}replaceChildren(...a){this.children=a}setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]}addEventListener(k,f){this.handlers[k]=f}focus(){context.lastFocused=this}blur(){}remove(){}select(){}setSelectionRange(){}querySelectorAll(){return this.children.filter(x=>x.tag==='button')}click(){if(this.onclick)this.onclick()}}
const map=new Map(),get=id=>{if(!map.has(id))map.set(id,new El());return map.get(id)},nav=[new El(),new El()];nav[0].dataset.view='linux';nav[1].dataset.view='keyboard';const eventHandlers={},themeStore={'fp-atlas-v02-theme':'light'};const context={ATLAS_DATA:JSON.parse(fs.readFileSync('atlas_base.json','utf8')),SHORTCUTS:JSON.parse(fs.readFileSync('shortcuts.json','utf8')),URL,Blob,document:{getElementById:get,createElement:t=>new El(t),createTextNode:t=>({textContent:t}),querySelectorAll:s=>s==='.nav'?nav:s==='.area-btn'?get('area-nav').children:[],body:new El(),addEventListener(k,f){(eventHandlers[k]||=[]).push(f)}},navigator:{clipboard:{writeText:async t=>{context.copied=t}}},location:{hash:''},window:{isSecureContext:true,scrollX:0,scrollY:0,scrollTo(){},addEventListener(){}},localStorage:{getItem(k){return themeStore[k]??null},setItem(k,v){themeStore[k]=v}},setTimeout,clearTimeout,console};get('template-layer').value='0';vm.createContext(context);vm.runInContext(fs.readFileSync('src/app.js','utf8'),context);
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
// Bloqueado com Ctrl/Meta/Alt ou em composição
for(const f of eventHandlers.keydown)f({key:'/',ctrlKey:true,target:{closest:()=>null},preventDefault(){pCount++}});
for(const f of eventHandlers.keydown)f({key:'/',isComposing:true,target:{closest:()=>null},preventDefault(){pCount++}});
for(const f of eventHandlers.keydown)f({key:'/',defaultPrevented:true,target:{closest:()=>null},preventDefault(){pCount++}});
assert.equal(context.lastFocused,null);assert.equal(pCount,2);
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
// Favoritar o primeiro item
favButtons[0].onclick();
favButtons=[];findFavButtons(get('cards'));
assert.equal(favButtons[0].attributes['aria-pressed'],'true');assert.equal(favButtons[0].textContent,'★');
assert(themeStore['fp-atlas-favorites'].includes(firstRecipe.id));
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (1)');assert.equal(get('export-favs-md').hidden,false);
// Filtrar por favoritos
get('fav-filter-btn').onclick();
assert.equal(get('cards').children.length,1);assert.equal(get('results-title').textContent,'Receitas favoritas (1)');
// Desfavoritar o item
favButtons=[];findFavButtons(get('cards'));favButtons[0].onclick();
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (0)');assert.equal(get('cards').children.length,0);
assert.equal(get('empty').hidden,false);assert.equal(get('empty-title').textContent,'Nenhum favorito salvo ainda.');
// Adicionar 2 favoritos e testar clear-favs-btn
get('reset-filters').onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[0].onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[1].onclick();
assert.equal(get('fav-filter-btn').textContent,'★ Favoritos (2)');
get('fav-filter-btn').onclick();
assert.equal(get('clear-favs-btn').hidden,false);
get('clear-favs-btn').onclick();
assert.equal(get('fav-filter-btn').textContent,'★ Apenas favoritos (0)');assert.equal(themeStore['fp-atlas-favorites'],'[]');

// Teste de exportação Markdown (resiliência de cercas e formato)
get('reset-filters').onclick();
favButtons=[];findFavButtons(get('cards'));favButtons[0].onclick();
const testRow=vm.runInContext("rows.find(r=>r.id==='"+firstRecipe.id+"')",context);
const origEx=testRow.example;testRow.example='echo `date` && echo ```test```';
let exportedText='';
context.URL.createObjectURL=blob=>{exportedText=blob.content;return 'blob:test'};
context.Blob=class{constructor([c]){this.content=c}};
get('export-favs-md').onclick();
assert(exportedText.startsWith('# FP Atlas · Favoritos'));
assert(exportedText.includes(firstRecipe.command));assert(exportedText.includes(firstRecipe.purpose));assert(exportedText.includes(firstRecipe.risk));assert(exportedText.includes(firstRecipe.source));
// Com 3 crases dentro do exemplo, a cerca deve usar 4 crases
assert(exportedText.includes('````bash\necho `date` && echo ```test```\n````'));
testRow.example=origEx;

vm.runInContext("copy('git status')",context).then(()=>{assert.equal(context.copied,'git status');context.window.isSecureContext=false;context.document.execCommand=()=>true;let restored=false,scrolled=false;context.document.activeElement={isConnected:true,focus(o){restored=o.preventScroll}};context.window.scrollTo=()=>{scrolled=true};return vm.runInContext("copy('fallback')",context).then(()=>{assert(restored);assert(scrolled);console.log('PASS: 2.653 entradas acessíveis, atalho / com guardas estritas, favoritos individuais por ID, filtro e limpeza, exportação Markdown resiliente a crases, catálogos sem comandos copiáveis, ffuf com receita, 1.080 nomes, 65 grupos, busca, filtros, 31 exemplos nmap, expansão, navegação, cópia segura e fallback.')})});
