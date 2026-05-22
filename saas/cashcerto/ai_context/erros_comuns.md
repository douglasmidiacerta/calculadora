# Aprendizado Contínuo - Erros Comuns e Boas Práticas

Este documento registra de forma genérica os erros técnicos ocorridos durante o ciclo de desenvolvimento, suas causas e os padrões de solução, para que a IA aprenda a evitar e resolver problemas semelhantes de forma autônoma em sessões futuras.

---

## 1. Bloqueio no Git Push por Arquivos Volumosos (> 100MB)
* **Erro**: Rejeição de push do GitHub com erro informando que o tamanho máximo do arquivo foi excedido.
* **Causa**: 
  - Expressões corrompidas ou mal formatadas no `.gitignore` (ex: `a n t i g r a v i t y - * . z i p` com espaços invisíveis), permitindo que arquivos `.zip` gerados para distribuição fossem rastreados pelo Git.
  - Tentativa de commitar arquivos zip volumosos contendo pastas pesadas de dependência de desenvolvimento (`node_modules`).
* **Padrão de Solução**:
  1. Corrigir e higienizar a expressão do `.gitignore` (ex: `*.zip` simples e sem espaços).
  2. Desfazer os commits locais volumosos que estavam prontos para push via `git reset --mixed origin/main` (ou branch atual).
  3. Expurgar o cache de indexação do Git executando `git rm -r --cached .` e reindexar os arquivos corretos com `git add .`.
  4. Certificar que nenhum binário ou pacote ZIP esteja indexado no versionamento.

---

## 2. Ineficiência e Lentidão Crítica na Compactação (ZIP) no Windows
* **Erro**: Processos de compactação manual ou scripts de build demorando vários minutos ou travando a esteira no console.
* **Causa**: O cmdlet `Compress-Archive` nativo do PowerShell do Windows é extremamente lento para ler e agrupar hierarquias de pastas muito profundas (como `node_modules` ou projetos aninhados em `saas/*`).
* **Padrão de Solução**:
  - Utilizar o comando nativo `tar` (presente por padrão no Windows 10/11 e sistemas Unix) em vez do `Compress-Archive`.
  - Sintaxe recomendada de compressão de alta performance: `tar -a -c -f arquivo.zip *`
  - Este comando utiliza threads compiladas nativas e comprime o mesmo conjunto de arquivos em menos de 3 segundos.

---

## 3. Arquivos ZIP de Distribuição Volumosos devido a Dependências de Terceiros
* **Erro**: Pacotes `.zip` contendo os fontes para deploy ou backup gerando mais de 250MB.
* **Causa**: A inclusão recursiva do diretório `node_modules` dentro do ZIP de backup/fontes. O `node_modules` nunca deve ser distribuído ou armazenado em backups, apenas reconstruído no destino com `npm install`.
* **Padrão de Solução**:
  - Utilizar o parâmetro de exclusão do `tar` para blindar o arquivo gerado contra pastas desnecessárias.
  - Sintaxe recomendada: `tar --exclude="node_modules" --exclude=".git" --exclude=".gemini" -a -c -f nome-arquivo.zip *`
  - Isso reduz o tamanho do pacote final de fontes em mais de 93% (ex: de 258MB para 17MB), mantendo-o ágil de transferir.

---

## 4. Substituição de Strings Estáticas em Projetos Multi-Tenant SaaS
* **Erro**: Risco de quebra de componentes ou inconsistências ao usar scripts automatizados do PowerShell para injetar strings de marca específicas nos fontes dos parceiros do ecossistema SaaS.
* **Causa**: Dependência de substituição de strings brutas (ex: `"Empresta BH"`) em variáveis de mensagens dinâmicas, o que obriga a constante atualização dos scripts de lote e gera acoplamento.
* **Padrão de Solução**:
  - Utilizar inferência de marca dinâmica baseada no ambiente de execução.
  - Em aplicações web multi-tenant baseadas em subpastas físicas, o título do navegador (`document.title`) é previamente alterado pelo componente. Podemos ler a marca de forma reativa a partir dele:
    ```typescript
    const partnerName = document.title.split(' - ')[0] || "Marca Padrão";
    ```
  - Isso blinda o código contra quebras e elimina a necessidade de fazer _replace_ de strings profundas de layout em scripts de terminal.
