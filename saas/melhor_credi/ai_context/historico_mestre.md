# Histórico Mestre - Simulador de Vendas e Taxas (Calculadora)

Este arquivo serve como o log cumulativo de todas as conversas, decisões arquiteturais, bugs resolvidos e evoluções do projeto.

---

## [2026-05-19] - Inicialização do Contexto
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.0`
- **Autor**: Antigravity AI
- **Alterações**:
  - Criação da pasta de contexto `ai_context/` exigida pelas diretrizes de desenvolvimento do projeto.
  - Mapeamento inicial do código-fonte (projeto importado do AI Studio contendo React, Vite 6, Tailwind CSS 4, Express e suporte a TypeScript).
  - Reconhecimento dos módulos principais:
    - `src/App.tsx`: Simulador de vendas com tabela normal e promo, cálculo de parcelas até 21x, taxa de máquina Elo/Master/Visa, cálculo de lucro e exportação de imagem.
    - `server.ts`: Backend minimalista em Express com endpoint `/api/login` simulado e integração com o middleware do Vite para desenvolvimento local.
- **Status Final**: Versão 1.0.1 implantada, com suporte a banco de dados MySQL de produção do cPanel e empacotamento completo.

---

## [2026-05-19] - Suporte ao Banco de Dados MySQL e cPanel (v1.0.1)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.1`
- **Autor**: Antigravity AI
- **Alterações**:
  - Instalação e integração da dependência `mysql2` para conexão assíncrona com o MySQL do cPanel.
  - Implementação de pool de conexões robusto em `server.ts` com suporte às credenciais configuradas via `.env`.
  - Mecanismo de inicialização dinâmica de banco de dados (`initializeDatabase`) criando a tabela `usuarios` e inserindo o usuário `admin` padrão (`123456`) automaticamente se não existirem.
  - Adaptação do endpoint `/api/login` para validar as credenciais no MySQL, mantendo um fallback seguro estático em ambiente local.
  - Atualização do arquivo de configuração `.env` e `.env.example` com os parâmetros fornecidos pelo usuário.
  - Reconfiguração da porta do servidor para `process.env.PORT || 3000` garantindo o correto proxy no Phusion Passenger do cPanel.
  - Atualização do `CHANGELOG.md` com a versão 1.0.1.
  - Recompilação completa (`npm run build`).
- **Status Final**: Versão 1.0.2 implantada, com suporte a deploy híbrido (PHP/Apache) para cPanel sem Node.js e empacotamento otimizado.

---

## [2026-05-19] - Arquitetura Híbrida PHP/Apache para cPanel sem Node.js (v1.0.2)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.2`
- **Autor**: Antigravity AI
- **Alterações**:
  - Implementação de um backend híbrido em PHP para rodar em servidores compartilhados comuns sem suporte a Node.js.
  - Criação da estrutura `public/api/login/index.php` contendo a lógica de login em PHP nativo utilizando PDO, incluindo a conexão automática ao MySQL e a geração dinâmica de tabelas e usuários administrativos padrão.
  - Configuração do arquivo `public/.htaccess` para gerenciar o roteamento amigável e permitir que requisições ao `/api/login` sejam tratadas diretamente pelo script PHP.
  - Recompilação do projeto com Vite para copiar de forma automatizada o `.htaccess` e a API PHP para a pasta final `/dist`.
  - Atualização do `CHANGELOG.md` documentando a versão 1.0.2.
  - Geração de dois arquivos ZIP na raiz:
    - `antigravity-v1.0.2.zip`: Projeto completo com fontes e compilados.
    - `simulador-dist-v1.0.2.zip`: Pacote otimizado contendo estritamente a pasta `dist` compilada, ideal para extração direta na `public_html` do cPanel sem Node.js.
- **Status Final**: Versão 1.0.3 entregue, com suporte total a subpastas de qualquer nível no cPanel (caminhos de assets e API relativos), resolvendo a tela branca e falhas de conexão.

---

## [2026-05-19] - Suporte a Subpastas e Correção de Tela Branca (v1.0.3)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.3`
- **Autor**: Antigravity AI
- **Alterações**:
  - Configuração da propriedade `base: './'` no `vite.config.ts`, permitindo que o Vite gere caminhos relativos para os arquivos CSS/JS no `index.html`, solucionando de vez a tela branca em subpastas.
  - Correção sutil no fetch do frontend em `src/App.tsx` para mudar a rota de `/api/login` (absoluta) para `api/login` (relativa), possibilitando o correto envio de requisições de login a partir de subpastas do servidor Apache.
  - Simplificação e otimização do arquivo `public/.htaccess` para desativar a listagem de arquivos (`Options -Indexes`) de forma limpa.
  - Atualização do `CHANGELOG.md` documentando a versão 1.0.3.
  - Recompilação geral com `npm run build`.
  - Remoção dos pacotes antigos e geração de novos pacotes de deploy na raiz:
    - `antigravity-v1.0.3.zip` (fontes e compilados).
    - `simulador-dist-v1.0.3.zip` (somente os arquivos finais da pasta `dist/` para extração rápida).
  - Commits e push das alterações da versão 1.0.3 no GitHub (`origin/main`).
- **Status Final**: Versão 1.0.4 entregue com proteção contra tela branca em subpastas sem a barra final ("/"), redirecionando no client-side via Javascript inline e no server-side via .htaccess.

---

## [2026-05-19] - Correção Definitiva de Tela Branca em Subpastas sem Barra Final (v1.0.4)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.4`
- **Autor**: Antigravity AI
- **Alterações**:
  - Implementação de um script JavaScript inline autônomo no `<head>` do `index.html` para redirecionar acessos em subpastas que não tenham a barra "/" final (ex: `dominio.com/calculadora` -> `dominio.com/calculadora/`). Isso impede que o browser tente resolver arquivos de assets relativos a partir da raiz do domínio e resulte em erro 404/tela branca.
  - Inserção de regra no `public/.htaccess` para forçar o redirecionamento com barra final (Rewrite HTTP 301) para diretórios físicos em servidores Apache.
  - Atualização do `CHANGELOG.md` com a versão v1.0.4.
  - Recompilação dos ativos via `npm run build`.
  - Remoção dos pacotes antigos da versão 1.0.3 e geração de novos pacotes:
    - `antigravity-v1.0.4.zip` (fontes e compilados).
    - `simulador-dist-v1.0.4.zip` (somente arquivos compilados de `dist/` para deploy).
  - Commits e push de atualização de versão para o repositório remoto.
- **Status Final**: Versão 1.0.5 entregue com a rota do fetch corrigida para "api/login/" (com barra final), solucionando a conversão de POST em GET decorrente do redirecionamento 301 do Apache e eliminando o erro "Método não permitido" (HTTP 405).

---

## [2026-05-19] - Resolução de Erro de Método Não Permitido (HTTP 405) no Login (v1.0.5)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.5`
- **Autor**: Antigravity AI
- **Alterações**:
  - Correção na chamada de API no frontend em `src/App.tsx` para direcionar a requisição POST para `api/login/` (com barra final). Isso contorna a regra do Apache que redireciona diretórios físicos sem barra final emitindo um HTTP 301, o qual converte o método para GET no navegador e descarta os dados JSON.
  - Correção na rota correspondente no backend Express local em `server.ts` para suportar ambas as variantes `["/api/login", "/api/login/"]`, garantindo plena compatibilidade em desenvolvimento local.
  - Atualização do `CHANGELOG.md` documentando a versão v1.0.5.
  - Recompilação completa dos assets via `npm run build`.
  - Remoção dos pacotes antigos da v1.0.4 e empacotamento de novos zips na raiz:
    - `antigravity-v1.0.5.zip` (fontes).
    - `simulador-dist-v1.0.5.zip` (estritamente a pasta `dist/` compilada com a API PHP).
  - Versionamento Git e push na branch `main`.
- **Status Final**: Versão 1.0.6 entregue contendo botões modernos de controle visual no cabeçalho para alternar a exibição da taxa (Cliente vs Custo da Máquina) e ocultar/mostrar a coluna de Lucro Líquido na tela.

---

## [2026-05-19] - Customização Visual de Lucro Líquido e Exibição de Taxas (v1.0.6)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.6`
- **Autor**: Antigravity AI
- **Alterações**:
  - Implementação do estado `showLucro` (booleano) e botão moderno "Ocultar/Mostrar Lucro" no `<header>` da aplicação. Quando ativo, oculta dinamicamente a coluna "Lucro Líquido" na tela de resultados, permitindo ao administrador simular na frente de clientes sem revelar as margens.
  - Implementação do estado `tipoTaxaExibida` (`"cliente"` ou `"custo"`) e botão "Ver Taxa Custo/Cliente" no `<header>`. Permite alternar dinamicamente o cálculo e a exibição na tabela na tela entre a **Taxa do Cliente** (com acréscimo) e a **Taxa de Custo da Máquina** (custo real da adquirente), mudando a paleta de cores para facilitar o entendimento (verde para cliente, laranja/âmbar para máquina).
  - Atualização do `CHANGELOG.md` documentando a versão v1.0.6.
  - Recompilação completa dos assets via `npm run build`.
  - Remoção dos pacotes antigos da v1.0.5 e empacotamento de novos zips na raiz:
    - `antigravity-v1.0.6.zip` (fontes).
    - `simulador-dist-v1.0.6.zip` (estritamente os compilados em `dist/`).
  - Versionamento Git e push na branch `main`.

---

## [2026-05-19] - Área Administrativa e Configuração Dinâmica de Taxas (v1.0.7)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.7`
- **Autor**: Antigravity AI
- **Alterações**:
  - Criação de uma área administrativa protegida por senha (**`3x51ELCO`**) acessível por um botão discreto de configurações no simulador.
  - Implementação de um painel administrativo elegante estruturado em 3 abas responsivas:
    - *Geral & Acréscimos*: Opção para ocultar os botões do header ("Ocultar Lucro" e "Ver Taxa Custo") para usuários/vendedores comuns, edição de acréscimos por nível (Tabelas 1 a 5) e suporte a um acréscimo geral (+1% ou +0.15% Geral) somado dinamicamente no simulador.
    - *Fatores Base*: Edição em tempo real de fatores decimais de 1x a 21x para as tabelas Normal e Promo.
    - *Custo da Máquina*: Edição de custos de máquina de 1x a 21x para Elo e Master/Visa.
  - Persistência robusta via `localStorage` para retenção permanente das taxas editadas após recarregamento de página.
  - Recurso de "Restaurar Padrões" para limpeza de chaves locais e reversão instantânea aos valores de fábrica do código.
  - Atualização dos dropdowns e motores de simulação React para consumir as taxas dinamicamente do estado do formulário persistido.
  - Recompilação bem-sucedida via Vite + esbuild (`npm run build`).
  - Atualização do `CHANGELOG.md` e dos arquivos do diretório `/ai_context`.
- **Status Final**: Versão 1.0.7 concluída e compilada com sucesso.

---

## [2026-05-19] - Remoção Definitiva de Botões Visuais e Centralização no Painel Admin (v1.0.8)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.8`
- **Autor**: Antigravity AI
- **Alterações**:
  - Remoção completa dos botões do cabeçalho ("Ver Taxa Custo/Cliente" e "Ocultar/Mostrar Lucro") da interface do vendedor comum para manter a tela 100% limpa e evitar exposição de dados sensíveis na presença de clientes.
  - Consolidação dos controles visuais de exibição de Lucro Líquido e Taxa de Custo exclusivamente dentro do Painel Administrativo restrito (protegido por senha).
  - Atualização do `CHANGELOG.md` documentando a versão v1.0.8.
  - Recompilação geral via `npm run build` gerando os artefatos otimizados de produção.
  - Atualização do histórico mestre e sessão atual no `/ai_context`.
- **Status Final**: Versão 1.0.8 concluída e compilada com sucesso.

---

## [2026-05-19] - Zebra Striping nas Tabelas do Simulador e Exportação de Imagem (v1.0.9)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.0.9`
- **Autor**: Antigravity AI
- **Alterações**:
  - Implementação de zebra striping (linhas intercaladas) na tabela principal de exibição na tela (alternando entre `bg-white` e `bg-emerald-50/30`).
  - Implementação de zebra striping na tabela compactada vertical de exportação da simulação para imagem, intercalando células brancas (`#ffffff`) e verde-claro suave (`#eaf7ed`).
  - Melhoria visual significativa para a leitura das parcelas e valores totais pelo vendedor e pelo cliente final.
  - Recompilação geral via `npm run build` gerando os artefatos finais em `dist/`.
  - Atualização do `CHANGELOG.md` e arquivos de contexto localizados em `/ai_context`.
- **Status Final**: Versão 1.0.9 concluída com sucesso, com compilação gerada e empacotamento completo em formato ZIP (`simulador-dist-v1.0.9.zip` e `antigravity-v1.0.9.zip`) para deploy final no cPanel.

---

## [2026-05-19] - Integração de Deploy Automatizado com cPanel (v1.1.0)
- **ID da Conversa**: `a43a6e45-cf0f-4176-8482-cb8a25a09748`
- **Versão**: `v1.1.0`
- **Autor**: Antigravity AI
- **Alterações**:
  - Criação do arquivo de configuração `.cpanel.yml` na raiz do projeto, configurado especificamente para rodar deploys automáticos em servidores cPanel.
  - Mapeamento de tarefa de deploy que utiliza o utilitário `rsync` para sincronizar os ativos de produção gerados na pasta `/dist` diretamente no diretório final do servidor (`/home1/ljonline/public_html/calculadora`), mantendo o ambiente de deploy limpo e livre de arquivos-fonte ou metadados de Git.
  - Atualização do `CHANGELOG.md` documentando a versão v1.1.0.
  - Recompilação completa dos assets via `npm run build`.
  - Remoção dos pacotes antigos da v1.0.9 e empacotamento de novos zips na raiz:
    - `antigravity-v1.1.0.zip` (fontes).
    - `simulador-dist-v1.1.0.zip` (estritamente a pasta `dist/` compilada com a API PHP).
  - Versionamento Git e push para as branches remotas.
- **Status Final**: Versão 1.1.1 entregue, com suporte a deploy contínuo via GitHub Actions (CI/CD) e empacotamento otimizado.

---

## [2026-05-19] - Pipeline de Deploy Contínuo via GitHub Actions (v1.1.1)
- **ID da Conversa**: `a43a6e45-cf0f-4176-8482-cb8a25a09748`
- **Versão**: `v1.1.1`
- **Autor**: Antigravity AI
- **Alterações**:
  - Criação do arquivo workflow do GitHub Actions em `.github/workflows/deploy.yml` para compilação automática (`npm run build`) e deploy FTP (`SamKirkland/FTP-Deploy-Action`) a partir do repositório público do GitHub diretamente para a pasta `/public_html/calculadora` no cPanel.
  - Atualização do arquivo `package.json` para refletir a versão `1.1.1` do projeto.
  - Atualização do `CHANGELOG.md` documentando detalhadamente a versão `v1.1.1`.
  - Recompilação dos ativos finais de produção.
  - Geração automática dos pacotes zip da nova versão: `antigravity-v1.1.1.zip` e `simulador-dist-v1.1.1.zip`.
  - Configuração das orientações de configuração dos segredos do repositório GitHub (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD) para o usuário.
- **Status Final**: Versão 1.1.2 entregue com o ajuste fino para conta FTP restrita da calculadora.

---

## [2026-05-19] - Ajuste Fino de Deploy FTP para Conta Dedicada (v1.1.2)
- **ID da Conversa**: `a43a6e45-cf0f-4176-8482-cb8a25a09748`
- **Versão**: `v1.1.2`
- **Autor**: Antigravity AI
- **Alterações**:
  - Ajustada a propriedade `server-dir` no workflow do GitHub Actions `.github/workflows/deploy.yml` de `/public_html/calculadora/` para `./`.
  - Esta mudança garante compatibilidade nativa com contas FTP restritas de segurança configuradas no cPanel (as quais iniciam a sessão de FTP já dentro do diretório `/public_html/calculadora/`).
  - Atualização do arquivo `package.json` definindo a nova versão `1.1.2`.
  - Atualização do `CHANGELOG.md` documentando as alterações.
  - Recompilação completa dos ativos de produção e geração dos pacotes zip da nova versão `v1.1.2` (`antigravity-v1.1.2.zip` e `simulador-dist-v1.1.2.zip`).
  - Commits e envio das atualizações (push) para o repositório remoto nas branches `git-cpanel-integration-setup` e `main` para acionar imediatamente a esteira de build automatizado do GitHub Actions.
- **Status Final**: Versão 1.1.2 implantada com sucesso e esteira de CI/CD em execução com a conta dedicada do usuário.

---

## [2026-05-20] - Plataforma Multi-Tenant SaaS, Controle de Roles e Sincronização em Nuvem (v1.2.0)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.0`
- **Autor**: Antigravity AI
- **Alterações**:
  - **SaaS Baseado em Subpastas**: Criação de múltiplos subdiretórios individuais em `saas/` (`saas/d_cred/`, `saas/credpara/`, `saas/melhor_credi/`), isolando os projetos e permitindo personalização de marca específica para cada parceiro.
  - **Script de Replicação Robusto**: Implementado o script PowerShell `scratch/copy_to_partners.ps1` que remove diretórios antigos e copia de forma limpa todas as novas atualizações da raiz para as pastas do SaaS de modo a evitar aninhamentos recursivos indesejados.
  - **Níveis de Acesso por Role (Login)**: Diferenciação entre o perfil `dono` (autenticação automática e acesso completo ao painel de configurações) e `vendedor` (ocultação do botão "Admin" e controle estrito das comissões na interface).
  - **Sincronização de Taxas Remotas**: Endpoint de API PHP em `public/api/config/index.php` e suporte correspondente no Express local (`server.ts`) para ler e salvar dinamicamente as configurações do servidor em `api/config/config.json`, permitindo sincronização instantânea das taxas editadas pelo Dono para todos os vendedores.
  - **Controle Administrativo de comissão**: Alteração do switch administrativo legado no frontend `src/App.tsx` para `formShowLucroVendedor`, permitindo ao Dono "Liberar Tabela de Comissão para os Vendedores" com os status interativos de "Liberado/Bloqueado".
  - **Personalização de Marcas**: Customização e aplicação das marcas ("D Cred", "CredPara" e "Melhor Credi") no copyright do rodapé e nos PNGs de exportação gerados por cada parceiro.
  - **Sincronização da Esteira de CI/CD (GitHub Actions)**: Integração de todas as calculadoras SaaS em tarefas sequenciais do arquivo `.github/workflows/deploy.yml`. Cada parceiro possui seu cache de deploy FTP (`state-name`) isolado, evitando que sobrescrevam uns aos outros no servidor cPanel.
- **Status Final**: Versão 1.2.0 compilada localmente e empacotada em novos pacotes ZIP (`antigravity-v1.2.0.zip` e `simulador-dist-v1.2.0.zip`). O arquivo de workflow do GitHub Actions foi commitado e enviado ao repositório remoto (`git push origin main`), ativando com sucesso o deploy contínuo das quatro calculadoras físicas para o cPanel em produção.

---

## [2026-05-20] - Restrições Administrativas e Controle de Exibição de Lucro do Dono (v1.2.1)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.1`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Acesso Somente-Leitura de Fatores e Custos**:
    - Alteração da Aba 2 (Fatores Base) e da Aba 3 (Custo de Máquina) no Painel Administrativo.
    - Bloqueio completo da edição dos inputs decimais (1x a 21x) de Fatores Base (Normal/Promo) e Custos de Máquina (Master/Visa e Elo) para o Dono, apresentando as taxas ativas estritamente em modo de visualização.
    - Aplicação nativa de `disabled={true}` nos inputs correspondentes e estilização em cinza suave (`bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed`) para manter a clareza e harmonia com o layout.
    - Ajuste dos cabeçalhos explicativos e caixas de aviso no topo de ambas as abas indicando que são taxas de referência fixadas pelo sistema.
  - **Switch de Lucro Líquido do Dono**:
    - Inclusão de switch reativo nas Opções de Exibição do Simulador (Aba 1) sob a flag `show_lucro_dono` / `showLucroDono` para ativar/desativar a coluna de Lucro Líquido no simulador do Dono, permitindo ocultar a comissão ao simular de seu próprio usuário.
  - **Replicação SaaS Multi-Tenant**:
    - Sincronização automática do core atualizado para todos os parceiros (`saas/d_cred/`, `saas/credpara/`, `saas/melhor_credi/`) via script PowerShell (`scratch/copy_to_partners.ps1`).
    - Personalização das marcas e copyrights específicos para cada parceiro nos arquivos compilados.
    - Execução do build de produção em todas as instâncias SaaS, validando bundles limpos e otimizados para deploy.
  - **Empacotamento de Distribuição**:
    - Geração de novos pacotes ZIP na raiz (`antigravity-v1.2.1.zip` e `simulador-dist-v1.2.1.zip`) contendo CHANGELOG.md e arquivos finais prontos para deploy no cPanel.
- **Status Final**: Versão 1.2.1 concluída e compilada com sucesso, sincronizada nas quatro calculadoras e commitada no repositório remoto.

---

## [2026-05-20] - Favicons Customizados e Títulos de Abas Dinâmicos por Parceiro (v1.2.2)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.2`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Favicons Customizados por Pasta**:
    - Inserida a tag de link `<link rel="icon" type="image/png" href="favicon.png" />` no `<head>` do arquivo `index.html` da raiz.
    - Isso permite que o usuário adicione um arquivo de imagem `favicon.png` específico de cada marca dentro da sua pasta no cPanel para que o navegador exiba o favicon personalizado automaticamente.
  - **Títulos de Abas Dinâmicos**:
    - Adicionado hook `useEffect` nativo no início do componente `App` em `src/App.tsx` para definir o título da aba do navegador utilizando `document.title = "NomeParceiro - Calculadora";` assim que a aplicação é montada.
    - O título é alterado dinamicamente para o parceiro correspondente ("D Cred - Calculadora", "CredPara - Calculadora", "Melhor Credi - Calculadora" e "Cred Certo - Calculadora").
  - **Sincronização e Replicação SaaS**:
    - Re-executado o script PowerShell de replicação para propagar as alterações no `index.html` e no core do simulador.
    - Customização de todas as variáveis de marca e re-build de produção em lote na raiz e em todas as pastas SaaS.
- **Status Final**: Versão 1.2.2 concluída com sucesso e distribuída em todas as instâncias SaaS.

---

## [2026-05-20] - Identidade Visual SaaS, Logotipos e Favicons Reais por IA e Automação de Replicação (v1.2.3)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.3`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Logotipos e Favicons Gerados com IA**:
    - Geração de 8 ativos de alta fidelidade visual (4 logos e 4 favicons) para as marcas **Cred Certo**, **D Cred**, **CredPara** e **Melhor Credi** utilizando a inteligência artificial de imagens, criando layouts premium e harmoniosos ("wow at first glance").
    - Criação do diretório centralizado `saas_assets/` com pastas exclusivas para os ativos de cada parceiro, e cópia das imagens correspondentes da Cred Certo base para o diretório `public/` da raiz do core.
  - **Exibição Dinâmica e Resiliente de Logo no React**:
    - Adicionado suporte reativo a carregamento de imagens em `src/App.tsx` usando estados de erro `logoErro` e `logoHeaderErro` com a tag `<img src="logo.png" />`.
    - Implementação de fallback inteligente: se a imagem de logotipo estiver ausente em qualquer pasta física (erro 404), o React exibe os componentes vetorizados originais do Lucide React de forma transparente (Lock na tela de login e Calculator no cabeçalho do simulador), blindando a aplicação contra quebras visuais.
  - **Automação Completa de Replicação com Script PowerShell**:
    - Criação de um script PowerShell avançado em `scripts/copy_to_partners.ps1` no repositório.
    - O script automatiza o processo de cópia recursiva do core base para todos os parceiros em lote, realizando automaticamente a injeção programática dos respectivos ativos visuais e a substituição dinâmica das variáveis de marca em `App.tsx` (aba de título, copyrights do rodapé e no título do PNG exportado).
  - **Compilação Estática e Distribuição**:
    - Executados builds de produção em lote na calculadora raiz e nas pastas de parceiros (`npm run build`), gerando bundles estáticos otimizados.
- **Status Final**: Versão 1.2.3 concluída com sucesso, com todos os ativos SaaS embutidos e testados em lote locais, pacotes ZIP atualizados na raiz do projeto e commitados com push para a branch `main` no GitHub.
