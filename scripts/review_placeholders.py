"""Patch editorial revisado em 2026-10-10; não executa os exemplos."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Ferramenta | título | exemplo | impacto | contexto/requisitos.
RECIPES = r'''batch|Agendar tarefa conforme a carga|printf '%s\n' 'date >> "$HOME/batch-lab.log"' \| batch|ALTERA|Requer atd ativo e permissão de agendamento. Cria ou acrescenta o log quando a política de carga permitir; consulte a fila com atq.
pm-suspend|Suspender com pm-utils legado|sudo pm-suspend|ALTERA|Salve o trabalho. Suspende o computador e interrompe conexões. Somente sistemas com pm-utils; em systemd prefira systemctl suspend.
aircrack-ng|Testar dicionário contra captura própria|aircrack-ng -w palavras-lab.txt captura-lab.cap|ALTERA|Análise offline de captura WPA com handshake válido. Use captura e lista próprias; consome CPU e pode gravar resultados locais.
autopsy|Abrir interface forense web|autopsy -p 9999|SERVIÇO|Frontend web legado do Sleuth Kit no Kali, diferente do Autopsy moderno em Java. Acesse a URL mostrada no terminal; analise cópias das evidências.
beef-xss|Abrir console do BeEF no Kali|sudo beef-xss|SERVIÇO|Launcher do pacote Kali. Inicia serviços e pode solicitar configuração inicial. Use VM de laboratório; este exemplo não injeta hooks nem testa navegadores.
bettercap|Abrir console na interface do laboratório|sudo bettercap -iface eth0|SERVIÇO|Substitua eth0 pela interface correta. Configuração e caplets podem iniciar módulos; confira a configuração antes. No console, help lista módulos; quit encerra.
bulk_extractor|Extrair artefatos de imagem de disco|bulk_extractor -o artefatos-lab imagem-lab.dd|ALTERA|Lê uma cópia da imagem e grava relatórios na pasta de saída. Use pasta nova; os resultados podem conter dados pessoais.
burpsuite|Abrir interface do Burp Suite|burpsuite|SERVIÇO|Launcher gráfico do Kali. Configure o proxy somente no navegador de testes; revisar listeners e projeto antes de interceptar tráfego.
cewl|Gerar lista de palavras de site próprio|cewl -d 1 -m 5 -w palavras-lab.txt http://127.0.0.1:8000|ATIVO|Percorre links até profundidade 1, seleciona palavras com no mínimo 5 caracteres e grava a lista. Exige servidor local e sobrescreve a saída.
chirpw|Abrir editor gráfico CHIRP|chirpw|ALTERA|Abra uma cópia da programação do rádio na interface. Ler ou gravar o equipamento exige modelo/cabo compatíveis; faça backup antes de gravar.
chkrootkit|Procurar indícios conhecidos de rootkits|sudo chkrootkit -q|CONSULTA|Modo de saída reduzida. Resultado limpo não prova ausência de comprometimento; alertas podem ser falsos positivos.
crunch|Gerar lista pequena para laboratório|crunch 2 3 abc -o palavras-lab.txt|ALTERA|Gera combinações de 2 a 3 caracteres usando a, b e c. São 36 linhas; listas com alfabetos grandes crescem exponencialmente. Grava a saída.
cutycapt|Salvar captura de página local|cutycapt --url=http://127.0.0.1:8000 --out=pagina-lab.png|ATIVO|Exige servidor local e ambiente gráfico ou X virtual. Renderiza a página e grava PNG; é ferramenta antiga baseada em Qt/WebKit.
dirb|Enumerar caminhos no servidor do laboratório|dirb http://127.0.0.1:8000/ palavras-lab.txt -r|ATIVO|Envia requisições HTTP com a lista própria. -r desativa recursão. Mesmo sem recursão pode produzir carga; não aponte para terceiros.
dmitry|Consultar WHOIS de domínio|dmitry -w example.com|ATIVO|Faz consulta de registro do domínio. Não ativa o scanner de portas (-p). WHOIS pode sofrer bloqueios ou ter informações ocultadas.
driftnet|Examinar imagens em captura local|driftnet -f captura-lab.pcap|CONSULTA|Lê PCAP em vez de capturar uma interface. Precisa de ambiente gráfico; conteúdo HTTPS cifrado não vira imagem decodificada automaticamente.
enum4linux|Consultar compartilhamentos SMB|enum4linux -S 192.168.56.10|ATIVO|IP ilustrativo de VM própria, substitua pelo alvo autorizado. Consulta SMB; servidor pode impedir sessão anônima. Não usa -A, que inclui testes de escrita.
ettercap|Ler captura sem MITM ativo|ettercap -T -r captura-lab.pcap|CONSULTA|Abre interface textual para PCAP local. Não inclui -M nem captura de interface; use cópia de captura própria.
evil-winrm|Abrir sessão WinRM autorizada por TLS|evil-winrm -S -i servidor-lab.example -u usuario-lab|ATIVO|Servidor ilustrativo, exige WinRM HTTPS configurado. Solicita senha quando omitida, evitando literal no histórico. Uma sessão permite alterar o host; quit encerra.
feroxbuster|Enumerar conteúdo HTTP local|feroxbuster -u http://127.0.0.1:8000 -w palavras-lab.txt --no-recursion -t 2|ATIVO|Exige servidor e lista locais. Limita a duas threads e desativa recursão, mas ainda envia requisições de descoberta.
ffuf|Pesquisar caminhos HTTP com FUZZ|ffuf -w palavras-lab.txt -u http://127.0.0.1:8000/FUZZ -rate 5 -t 1|ATIVO|Substitui FUZZ pelas palavras da lista. Limita a cinco requisições por segundo e uma thread; use servidor próprio de laboratório.
foremost|Recuperar arquivos de uma cópia de imagem|foremost -t jpg,pdf -i imagem-lab.dd -o recuperados-lab|ALTERA|Carving de JPEG/PDF em imagem local. Pasta de saída deve estar vazia; nunca grave recuperados no dispositivo que está sendo recuperado.
galleta|Extrair registros de cookie legado|galleta -d ';' cookies-legados.dat|CONSULTA|Analisa arquivo de cookies de versões antigas do Internet Explorer e imprime campos separados por ponto e vírgula. Não é leitor de cookies moderno do Chrome/Safari.
gobuster|Enumerar diretórios no servidor local|gobuster dir -u http://127.0.0.1:8000 -w palavras-lab.txt -t 2|ATIVO|Modo dir, lista própria e duas threads. Requer servidor local; códigos HTTP e respostas wildcard podem exigir ajustes conforme a aplicação.
hashcat|Mostrar resultados já recuperados|hashcat -m 0 --show hashes-md5-lab.txt|CONSULTA|Modo 0 é MD5 simples, não md5crypt. Compara hashes com o potfile existente; não inicia ataque de dicionário. Resultados contêm senhas em claro.
hashdeep|Gerar inventário SHA-256|hashdeep -c sha256 -r arquivos-lab/|CONSULTA|Calcula hashes recursivamente e imprime o inventário. Para preservar evidências, use cópias; hashing lê dados e pode atualizar atime.
httrack|Criar espelho limitado de site local|httrack http://127.0.0.1:8000/ -O espelho-lab -r1|ATIVO|Grava espelho em pasta própria e limita profundidade. Não reproduz automaticamente backends ou aplicações dinâmicas; pode seguir recursos conforme configuração.
hydra|Testar senha de conta de laboratório|hydra -l usuario-lab -P senhas-lab.txt -t 1 ssh://192.168.56.10|ATIVO|Somente VM e conta autorizadas, lista pequena. Pode bloquear a conta ou gerar alertas; não use contas de produção. Não imprime senha literal na linha de comando.
ike-scan|Consultar resposta IKE de VPN própria|sudo ike-scan 192.168.56.10|ATIVO|Envia negociação IKE ao IP ilustrativo, sem varrer sub-rede. Depende de VPN compatível e firewall; pode precisar de privilégios para a porta local UDP 500.
john|Mostrar senhas previamente recuperadas|john --show hashes-lab.txt|CONSULTA|Consulta o potfile local para os hashes informados; não inicia recuperação. Pode precisar de --format para resolver ambiguidade; proteja resultados em claro.
kismet|Abrir Kismet com fonte Wi-Fi|kismet -c wlan0|SERVIÇO|Requer adaptador/driver de captura compatível e permissões configuradas. Inicia captura e pode gerar logs; configure o acesso web e use apenas ambiente autorizado.
macchanger|Consultar MAC atual e permanente|macchanger -s eth0|CONSULTA|Substitua eth0 pelo nome real. -s apenas mostra os endereços; não altera MAC nem derruba a interface.
masscan|Examinar duas portas de uma VM|sudo masscan 192.168.56.10 -p22,80 --rate 10|ATIVO|IP ilustrativo de laboratório; taxa de dez pacotes por segundo. Usa pacotes raw e exige privilégio/capabilities; não confirma a aplicação por trás da porta.
mdb-sql|Consultar banco Microsoft Access local|printf '%s\n' 'SELECT * FROM Clientes;' \| mdb-sql dados-lab.mdb|CONSULTA|Substitua tabela e arquivo pelos existentes. Dialeto SQL do mdbtools é limitado; não é SQLite ou servidor SQL. Use uma cópia do banco.
medusa|Listar módulos de autenticação instalados|medusa -d|CONSULTA|Enumera módulos locais sem testar credenciais ou contatar alvos. Para testes reais, consulte opções específicas do módulo e possíveis bloqueios de conta.
mfoc|Ler cartão MIFARE Classic próprio|mfoc -O cartao-lab.mfd|ATIVO|Requer leitor NFC compatível e cartão próprio. Recupera chaves e grava dump, podendo levar tempo; não é leitura universal de NFC nem de DESFire.
mfterm|Abrir dump de cartão no console|mfterm -t cartao-lab.mfd|CONSULTA|Carrega arquivo de tag em sessão interativa. Comandos posteriores podem acessar/gravar hardware; confira a ajuda antes de usá-los.
mitmproxy|Inspecionar fluxos já salvos|mitmproxy -r fluxos-lab.mitm --set server=false|CONSULTA|Abre arquivo no formato do mitmproxy, não PCAP. server=false desativa o servidor proxy; pode conter tokens e dados pessoais.
msfconsole|Pesquisar módulos sem executá-los|msfconsole -q -x 'search type:auxiliary name:scanner; exit'|CONSULTA|Pesquisa o catálogo local e encerra. Não seleciona nem executa módulos; inicialização pode criar arquivos locais e conectar ao banco configurado.
ncrack|Testar autenticação SSH em VM própria|ncrack --user usuario-lab -P senhas-lab.txt --connection-limit 1 ssh://192.168.56.10|ATIVO|Use lista pequena e conta autorizada. Limita conexões simultâneas, mas pode bloquear a conta. Não é uma verificação passiva.
netdiscover|Observar ARP sem emitir varredura|sudo netdiscover -i eth0 -p|CONSULTA|Modo passivo; substitua interface. Mostra somente hosts cujo tráfego ARP seja observado, não inventário completo da rede.
netexec|Consultar serviço SMB de VM própria|netexec smb 192.168.56.10|ATIVO|Consulta um host ilustrativo usando o protocolo SMB, sem listas de senhas nem módulos. Pode gerar eventos de rede; nxc é outro executável do pacote.
netsniff-ng|Decodificar PCAP local|netsniff-ng --in captura-lab.pcap|CONSULTA|--in aponta para arquivo, não interface. Imprime pacotes locais; não use --out com interface, que mudaria a operação para transmissão/replay.
nikto|Verificar base local de testes|nikto -dbcheck|CONSULTA|Verifica sintaxe/integridade da base local do Nikto sem indicar host. Não executa varredura web nem garante atualidade da base.
nuclei|Validar template local sem varredura|nuclei -validate -t template-lab.yaml|CONSULTA|Valida o template informado. Não fornece alvo nem executa os testes do template; use arquivo confiável, pois templates podem conter recursos ativos.
ophcrack|Abrir hashes no modo gráfico|ophcrack -f hashes-lab.pwdump|ALTERA|Abre GUI com hashes locais, requer tabelas compatíveis para recuperação. Não usa -r para iniciar ao abrir; o modo GUI pode salvar sessão local.
rcrack|Consultar hash em tabelas locais|rcrack tabelas-lab/ -h 5d41402abc4b2a76b9719d911017c592|CONSULTA|Hash MD5 de exemplo. Requer tabelas rainbow compatíveis com algoritmo, charset e intervalo; não gera tabelas nem consulta serviço remoto.
reaver|Verificar WPS usando wash da suíte|sudo wash -i wlan0mon -c 6|ATIVO|wash acompanha reaver; requer interface já em monitor e canal correto. Descobre WPS e pode emitir probes; não inicia tentativa de PIN. Não faça deauth para este exemplo.
searchsploit|Pesquisar referência por CVE|searchsploit --cve 2021-44228|CONSULTA|Pesquisa o catálogo local do Exploit-DB; não executa exploits. Um resultado não comprova que seu sistema é vulnerável.
setoolkit|Abrir menu do SET em laboratório|sudo setoolkit|SERVIÇO|Abre menu interativo. Opções posteriores podem criar serviços/campanhas; não selecione módulos contra terceiros. Use VM isolada e confira dependências.
skipfish|Auditar aplicação HTTP local|skipfish -o relatorio-lab http://127.0.0.1:8000/|ATIVO|Scanner legado com requisições ativas e potencial carga alta. Requer servidor descartável e pasta nova; não use produção. Confira wordlists/configuração da versão.
smbmap|Listar acessos SMB sem testar escrita|smbmap -H 192.168.56.10 -u usuario-lab --prompt --no-write-check|ATIVO|Solicita senha sem literal no histórico e desativa testes de escrita. Exige conta autorizada; não inclui download, upload, exclusão nem execução remota.
sqlitebrowser|Abrir cópia de banco SQLite na GUI|sqlitebrowser banco-lab.sqlite|ALTERA|Interface permite editar e salvar dados. Use cópia do banco, sobretudo durante perícia; depende de sessão gráfica.
sqlmap|Testar parâmetro de aplicação local|sqlmap -u 'http://127.0.0.1:8000/item?id=1' --level=1 --risk=1|ATIVO|Exige aplicação vulnerável de laboratório. Envia payloads e grava sessão local; nível/risco 1 não tornam o teste inofensivo. Não inclui dump ou shell.
termineter|Abrir console de medidores|termineter|ALTERA|Console interativo; exige hardware/protocolo compatível para operação. Módulos posteriores podem alterar medidores; use apenas bancada própria e consulte help.
wafw00f|Consultar indícios de WAF em site local|wafw00f http://127.0.0.1:8000/|ATIVO|Envia requisições de identificação ao servidor local. Ausência de identificação não prova ausência de proteção.
wfuzz|Testar caminhos de servidor local|wfuzz -z file,palavras-lab.txt --hc 404 http://127.0.0.1:8000/FUZZ|ATIVO|Lista própria e marcador FUZZ. --hc 404 oculta respostas 404; páginas wildcard podem precisar de outros filtros. Gera requisições ativas.
whatweb|Identificar tecnologias de site local|whatweb -a 1 http://127.0.0.1:8000/|ATIVO|Nível de agressividade 1. Ainda faz requisições HTTP; resultado é identificação por sinais, não prova de versão ou vulnerabilidade.
wifite|Verificar handshake em captura própria|wifite --check captura-lab.cap|CONSULTA|Examina handshakes em arquivo local usando ferramentas auxiliares. Não é captura ao vivo nem ataque; confira dependências e formato da captura.
wireshark|Abrir captura na interface gráfica|wireshark -r captura-lab.pcap|CONSULTA|Abre PCAP local, sem iniciar captura. Não execute a GUI como root; dados cifrados precisam de chaves apropriadas para decriptação.
wpscan|Examinar WordPress de laboratório|wpscan --url http://127.0.0.1:8000 --detection-mode passive|ATIVO|Passive descreve a estratégia de detecção, mas ainda envia HTTP. Requer WordPress próprio; dados de vulnerabilidades podem exigir token da API. Não testa senhas.
yersinia|Abrir interface ncurses|sudo yersinia -I|ALTERA|Abre modo interativo com acesso raw. Pode capturar protocolos L2 e oferece ataques que alteram a rede; não acione ataques fora de bancada isolada.
zenmap|Abrir interface gráfica do Nmap|zenmap|ALTERA|Launcher gráfico; abrir a interface não inicia scan. Perfis escolhidos depois podem fazer varreduras ativas. Disponibilidade varia por instalação.
expect|Executar automação Tcl/Expect local|expect automacao-lab.exp|ALTERA|O arquivo é um programa executável e pode fazer alterações ou acessar rede. Revise o script antes; não inclua senhas em texto claro.
uvccapture|Salvar foto de webcam UVC|uvccapture -d/dev/video0 -o/foto-lab.jpg -x640 -y480 -t0|ALTERA|Use -ofoto-lab.jpg para gravar no diretório atual. Opções e argumentos são concatenados. -t0 captura uma vez; exige webcam/permissões e resolução compatíveis.''' 

def edits():
    result = {}
    for line in RECIPES.splitlines():
        parts = line.replace(r'\|', '\x00').split('|')
        cmd, name, example, risk, notes = [p.replace('\x00', '|') for p in parts]
        if cmd == 'uvccapture':
            example = example.replace('-o/foto-lab.jpg', '-ofoto-lab.jpg')
        result[cmd] = dict(name=name, purpose=name + '.', example=example, risk=risk, notes=notes, adapted=False, kind='recipe', reviewed_on='2026-10-10')
    special = {'chirpw':'chirp','bulk_extractor':'bulk-extractor','mdb-sql':'mdbtools','msfconsole':'metasploit-framework','rcrack':'rainbowcrack','searchsploit':'exploitdb','setoolkit':'set'}
    for cmd, patch in result.items():
        patch['source'] = 'https://www.kali.org/tools/' + special.get(cmd,cmd) + '/'
    for cmd, pkg, sec in [('batch','at',1),('pm-suspend','pm-utils',8),('expect','expect',1),('uvccapture','uvccapture',1)]:
        result[cmd]['source'] = f'https://manpages.debian.org/trixie/{pkg}/{cmd}.{sec}.en.html'
    result['gobuster']['source'] = 'https://github.com/OJ/gobuster'
    result['kismet']['source'] = 'https://www.kismetwireless.net/docs/readme/starting/starting/'
    result['zenmap']['source'] = 'https://nmap.org/book/zenmap.html'
    return result

def apply():
    path = ROOT / 'atlas_base.json'
    data = json.loads(path.read_text())
    patches = edits()
    changed = 0
    for row in data['rows']:
        if row['command'] in patches and row['example'].startswith('man '):
            row.update(patches[row['command']]); changed += 1
        elif row['example'].startswith('command -v ') and row['command'] != 'command':
            row['kind'] = 'catalog'
        elif row['command'] == 'msfpc' and row['example'].startswith('man '):
            row.update(kind='catalog', purpose='Gerador de payloads do ecossistema Metasploit; referência de catálogo, sem receita operacional revisada.', notes='CATÁLOGO. Não há exemplo prático revisado nesta edição. A documentação inclui payloads ativos; uma chamada genérica não representa uso seguro nem universal.', source='https://www.kali.org/tools/msfpc/')
    assert changed == 65, changed
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print('Receitas corrigidas:', changed, 'Catálogo:', sum(x.get('kind')=='catalog' for x in data['rows']))

if __name__ == '__main__':
    apply()
