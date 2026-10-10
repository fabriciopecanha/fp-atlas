# FP Atlas · Linux e Teclados

Referência em português com tema escuro, cores por área e busca por comando, tarefa ou atalho.

**[Abrir o FP Atlas](https://fabriciopecanha.github.io/fp-atlas/)** · **[Baixar o pacote completo para uso offline](https://fabriciopecanha.github.io/fp-atlas/fp-atlas-offline.zip)**

## Conteúdo · v05

- 2.653 entradas Linux (2.474 exemplos e 179 referências de catálogo), 1.080 nomes de comandos, 65 grupos e 8 volumes.
- 40 atalhos Linux para Xfce/Xfwm4, Bash/Readline e terminal.
- 77 atalhos macOS, separados por contexto; símbolos US/ABC.
- Corne 42 / Sofle 58: seis camadas por modelo, manual e adesivos vetoriais v21.
- Busca sem distinção de acentos, filtros por área/grupo/comando/operação e exemplos agrupados.

O Atlas é uma seleção de consulta, não uma lista de todos os comandos Linux nem uma auditoria técnica integral. Disponibilidade e opções dependem do sistema e da versão instalada. Os atalhos Linux não são universais entre ambientes gráficos. Os mapas dos teclados são documentação lógica, com implementação física/firmware pendente conforme o manual original.

## Usar

Navegue pelo menu ou pressione Ctrl+K / Cmd+K para focar a busca da aba atual. Em Meus teclados, as teclas 0 a 5 alternam camadas, exceto durante edição ou uso de campos/seletores. Os modelos e camadas também podem ser escolhidos com o mouse.

Links diretos: `#linux`, `#atalhos-linux`, `#atalhos-macos`, `#teclados`.

## Offline e instalação

Após o primeiro carregamento bem-sucedido por HTTPS, o cabeçalho informa quando comandos e atalhos estão disponíveis offline. **Salvar teclados offline** baixa as 12 imagens de camadas e os dois PDFs. O estado completo só é indicado depois de conferir os 14 arquivos no cache. Em falha parcial, tente novamente; os arquivos já salvos são reaproveitados.

No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Mac, use a opção do navegador para adicionar ao Dock ou instalar o site, quando disponível. O manifest fornece nome, cores e ícones; a interface exata varia por navegador.

Quando uma nova versão do service worker estiver pronta, aparece **Atualização disponível · aplicar**. Aplicar recarrega o site e troca o cache; salve os teclados novamente se desejar consulta completa offline nessa versão.

O armazenamento do navegador pode ser removido pelo usuário ou pelo sistema. Para uma cópia independente, baixe o ZIP, extraia a pasta e abra `index.html`, mantendo `assets/` junto ao HTML. Referências externas continuam exigindo internet. Service workers não são usados em `file://`.

## Fonte única e atualização

- `atlas_base.json`: dados canônicos dos comandos.
- `shortcuts.json`: dados canônicos dos atalhos.
- `src/`: template HTML, CSS, JavaScript, manifest e service worker.
- `assets/`: PDFs originais, prévias WebP e ícones.
- `scripts/build.py`: valida os dados e gera `dist/`, incluindo o pacote offline.

Edite os JSONs para corrigir ou acrescentar receitas. Edite `src/` para mudar a interface. Não mantenha cópias manuais dos dados dentro do HTML. O diretório `dist/` é gerado e não é versionado.

```bash
# Python 3.12+; geração sem bibliotecas externas.
python3 scripts/build.py
# Abra dist/index.html ou sirva a pasta para testar em localhost.
python3 -m http.server 8000 --directory dist
```

## Validação e publicação

```bash
python3 -m unittest discover -s scripts -p 'test_*.py' -v
python3 scripts/build.py
node scripts/test_app.cjs
node scripts/test_sw.cjs
```

A GitHub Action valida e gera o site em pushes para `main`; só publica após os testes passarem. Pull requests recebem os mesmos testes sem publicação. A origem de GitHub Pages é **GitHub Actions**, não uma pasta da branch.

Verificações automatizadas: campos e IDs, volumes/plataformas, assets obrigatórios, igualdade dos dados gerados, escaping de conteúdo no script, determinismo do pacote, acesso aos 2.653 exemplos, busca/filtros/cópia, atalhos de camadas, migração do tema e comportamento do cache offline com falhas e retomada. Os testes de interface usam um DOM simulado e não substituem testes em Safari/iPhone reais.

## Créditos e licenças

Conteúdo adaptado de tldr-pages: CC BY 4.0. Fontes Inter e Fira Code: SIL Open Font License. As referências disponíveis aparecem em cada cartão. Os PDFs v21 foram fornecidos pelo autor e permanecem originais. A licença do conteúdo de terceiros não é aplicada automaticamente à interface ou aos PDFs. Consulte `LICENCA.md`.

## Revisão de receitas · 2026-10-10

Foram encontradas 66 ferramentas com apenas `man ferramenta`: 65 receberam exemplos de uso, com finalidade, requisitos, fonte e impacto revisados. `msfpc` permanece identificado como catálogo sem receita operacional revisada. As 178 verificações de instalação fora do comando `command` também são referências de catálogo. Não são contabilizadas como exemplos nem exibidas como comandos copiáveis.

A revisão documental não executou scanners, ataques, serviços, scripts externos, suspensão, captura ou operações em cartões/discos. Interfaces gráficas e menus estão identificados nos títulos/notas. Ferramentas específicas do Kali não têm disponibilidade no Fedora presumida. Consulte `docs/revisao-manpages-2026-10-10.md` para a lista e fontes.
