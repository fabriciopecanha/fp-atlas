# Revisão de entradas com apenas man · 2026-10-10

Escopo: base canônica da edição v04, todos os oito volumes. Foram identificadas 66 ferramentas cujo único exemplo era `man ferramenta`. Isso não inclui exemplos legítimos do próprio comando `man`.

Resultado: 65 receitas documentadas, uma referência de catálogo (`msfpc`). Também foram identificadas 178 verificações `command -v` fora da ferramenta `command`; agora são explicitamente catálogos. Total: 2.474 exemplos e 179 referências, preservando as 2.653 entradas e seus IDs.

Os exemplos não foram executados. A conferência foi documental, baseada na sintaxe publicada pelo Kali, manuais distribuídos pelo Debian e documentação dos projetos. Endereços e arquivos de laboratório são exemplos que exigem substituição ou preparação. Disponibilidade no Fedora não foi presumida. Operações ativas e serviços foram reclassificados conforme o exemplo.

| Ferramenta | Uso revisto | Tipo | Fonte |
| --- | --- | --- | --- |
| `batch` | Agendar tarefa conforme a carga | ALTERA | [Documentação](https://manpages.debian.org/trixie/at/batch.1.en.html) |
| `pm-suspend` | Suspender com pm-utils legado | ALTERA | [Documentação](https://manpages.debian.org/trixie/pm-utils/pm-suspend.8.en.html) |
| `aircrack-ng` | Testar dicionário contra captura própria | ALTERA | [Documentação](https://www.kali.org/tools/aircrack-ng/) |
| `autopsy` | Abrir interface forense web | SERVIÇO | [Documentação](https://www.kali.org/tools/autopsy/) |
| `beef-xss` | Abrir console do BeEF no Kali | SERVIÇO | [Documentação](https://www.kali.org/tools/beef-xss/) |
| `bettercap` | Abrir console na interface do laboratório | SERVIÇO | [Documentação](https://www.kali.org/tools/bettercap/) |
| `bulk_extractor` | Extrair artefatos de imagem de disco | ALTERA | [Documentação](https://www.kali.org/tools/bulk-extractor/) |
| `burpsuite` | Abrir interface do Burp Suite | SERVIÇO | [Documentação](https://www.kali.org/tools/burpsuite/) |
| `cewl` | Gerar lista de palavras de site próprio | ATIVO | [Documentação](https://www.kali.org/tools/cewl/) |
| `chirpw` | Abrir editor gráfico CHIRP | ALTERA | [Documentação](https://www.kali.org/tools/chirp/) |
| `chkrootkit` | Procurar indícios conhecidos de rootkits | CONSULTA | [Documentação](https://www.kali.org/tools/chkrootkit/) |
| `crunch` | Gerar lista pequena para laboratório | ALTERA | [Documentação](https://www.kali.org/tools/crunch/) |
| `cutycapt` | Salvar captura de página local | ATIVO | [Documentação](https://www.kali.org/tools/cutycapt/) |
| `dirb` | Enumerar caminhos no servidor do laboratório | ATIVO | [Documentação](https://www.kali.org/tools/dirb/) |
| `dmitry` | Consultar WHOIS de domínio | ATIVO | [Documentação](https://www.kali.org/tools/dmitry/) |
| `driftnet` | Examinar imagens em captura local | CONSULTA | [Documentação](https://www.kali.org/tools/driftnet/) |
| `enum4linux` | Consultar compartilhamentos SMB | ATIVO | [Documentação](https://www.kali.org/tools/enum4linux/) |
| `ettercap` | Ler captura sem MITM ativo | CONSULTA | [Documentação](https://www.kali.org/tools/ettercap/) |
| `evil-winrm` | Abrir sessão WinRM autorizada por TLS | ATIVO | [Documentação](https://www.kali.org/tools/evil-winrm/) |
| `feroxbuster` | Enumerar conteúdo HTTP local | ATIVO | [Documentação](https://www.kali.org/tools/feroxbuster/) |
| `ffuf` | Pesquisar caminhos HTTP com FUZZ | ATIVO | [Documentação](https://www.kali.org/tools/ffuf/) |
| `foremost` | Recuperar arquivos de uma cópia de imagem | ALTERA | [Documentação](https://www.kali.org/tools/foremost/) |
| `galleta` | Extrair registros de cookie legado | CONSULTA | [Documentação](https://www.kali.org/tools/galleta/) |
| `gobuster` | Enumerar diretórios no servidor local | ATIVO | [Documentação](https://github.com/OJ/gobuster) |
| `hashcat` | Mostrar resultados já recuperados | CONSULTA | [Documentação](https://www.kali.org/tools/hashcat/) |
| `hashdeep` | Gerar inventário SHA-256 | CONSULTA | [Documentação](https://www.kali.org/tools/hashdeep/) |
| `httrack` | Criar espelho limitado de site local | ATIVO | [Documentação](https://www.kali.org/tools/httrack/) |
| `hydra` | Testar senha de conta de laboratório | ATIVO | [Documentação](https://www.kali.org/tools/hydra/) |
| `ike-scan` | Consultar resposta IKE de VPN própria | ATIVO | [Documentação](https://www.kali.org/tools/ike-scan/) |
| `john` | Mostrar senhas previamente recuperadas | CONSULTA | [Documentação](https://www.kali.org/tools/john/) |
| `kismet` | Abrir Kismet com fonte Wi-Fi | SERVIÇO | [Documentação](https://www.kismetwireless.net/docs/readme/starting/starting/) |
| `macchanger` | Consultar MAC atual e permanente | CONSULTA | [Documentação](https://www.kali.org/tools/macchanger/) |
| `masscan` | Examinar duas portas de uma VM | ATIVO | [Documentação](https://www.kali.org/tools/masscan/) |
| `mdb-sql` | Consultar banco Microsoft Access local | CONSULTA | [Documentação](https://www.kali.org/tools/mdbtools/) |
| `medusa` | Listar módulos de autenticação instalados | CONSULTA | [Documentação](https://www.kali.org/tools/medusa/) |
| `mfoc` | Ler cartão MIFARE Classic próprio | ATIVO | [Documentação](https://www.kali.org/tools/mfoc/) |
| `mfterm` | Abrir dump de cartão no console | CONSULTA | [Documentação](https://www.kali.org/tools/mfterm/) |
| `mitmproxy` | Inspecionar fluxos já salvos | CONSULTA | [Documentação](https://www.kali.org/tools/mitmproxy/) |
| `msfconsole` | Pesquisar módulos sem executá-los | CONSULTA | [Documentação](https://www.kali.org/tools/metasploit-framework/) |
| `ncrack` | Testar autenticação SSH em VM própria | ATIVO | [Documentação](https://www.kali.org/tools/ncrack/) |
| `netdiscover` | Observar ARP sem emitir varredura | CONSULTA | [Documentação](https://www.kali.org/tools/netdiscover/) |
| `netexec` | Consultar serviço SMB de VM própria | ATIVO | [Documentação](https://www.kali.org/tools/netexec/) |
| `netsniff-ng` | Decodificar PCAP local | CONSULTA | [Documentação](https://www.kali.org/tools/netsniff-ng/) |
| `nikto` | Verificar base local de testes | CONSULTA | [Documentação](https://www.kali.org/tools/nikto/) |
| `nuclei` | Validar template local sem varredura | CONSULTA | [Documentação](https://www.kali.org/tools/nuclei/) |
| `ophcrack` | Abrir hashes no modo gráfico | ALTERA | [Documentação](https://www.kali.org/tools/ophcrack/) |
| `rcrack` | Consultar hash em tabelas locais | CONSULTA | [Documentação](https://www.kali.org/tools/rainbowcrack/) |
| `reaver` | Verificar WPS usando wash da suíte | ATIVO | [Documentação](https://www.kali.org/tools/reaver/) |
| `searchsploit` | Pesquisar referência por CVE | CONSULTA | [Documentação](https://www.kali.org/tools/exploitdb/) |
| `setoolkit` | Abrir menu do SET em laboratório | SERVIÇO | [Documentação](https://www.kali.org/tools/set/) |
| `skipfish` | Auditar aplicação HTTP local | ATIVO | [Documentação](https://www.kali.org/tools/skipfish/) |
| `smbmap` | Listar acessos SMB sem testar escrita | ATIVO | [Documentação](https://www.kali.org/tools/smbmap/) |
| `sqlitebrowser` | Abrir cópia de banco SQLite na GUI | ALTERA | [Documentação](https://www.kali.org/tools/sqlitebrowser/) |
| `sqlmap` | Testar parâmetro de aplicação local | ATIVO | [Documentação](https://www.kali.org/tools/sqlmap/) |
| `termineter` | Abrir console de medidores | ALTERA | [Documentação](https://www.kali.org/tools/termineter/) |
| `wafw00f` | Consultar indícios de WAF em site local | ATIVO | [Documentação](https://www.kali.org/tools/wafw00f/) |
| `wfuzz` | Testar caminhos de servidor local | ATIVO | [Documentação](https://www.kali.org/tools/wfuzz/) |
| `whatweb` | Identificar tecnologias de site local | ATIVO | [Documentação](https://www.kali.org/tools/whatweb/) |
| `wifite` | Verificar handshake em captura própria | CONSULTA | [Documentação](https://www.kali.org/tools/wifite/) |
| `wireshark` | Abrir captura na interface gráfica | CONSULTA | [Documentação](https://www.kali.org/tools/wireshark/) |
| `wpscan` | Examinar WordPress de laboratório | ATIVO | [Documentação](https://www.kali.org/tools/wpscan/) |
| `yersinia` | Abrir interface ncurses | ALTERA | [Documentação](https://www.kali.org/tools/yersinia/) |
| `zenmap` | Abrir interface gráfica do Nmap | ALTERA | [Documentação](https://nmap.org/book/zenmap.html) |
| `expect` | Executar automação Tcl/Expect local | ALTERA | [Documentação](https://manpages.debian.org/trixie/expect/expect.1.en.html) |
| `uvccapture` | Salvar foto de webcam UVC | ALTERA | [Documentação](https://manpages.debian.org/trixie/uvccapture/uvccapture.1.en.html) |

Limites: a maioria recebeu um exemplo inicial de uso; isso não cobre todas as opções da ferramenta. Programas gráficos mostram abertura de interface. Os catálogos, incluindo nomes sem binário ou versão confirmados, continuam sem receita operacional. Não há garantia de validade de todas as demais receitas do Atlas.
