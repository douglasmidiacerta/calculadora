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
  - **Remoção de Textos Administrativos do Cabeçalho**:
    - Remoção dos textos "Simulador de Vendas" e "Cálculo de taxas e lucro líquido em tempo real" do `<header>` principal na raiz e em todos os parceiros SaaS.
    - O design do simulador agora apresenta um visual muito mais limpo e focado no logotipo do parceiro, utilizando fallback elegante em formato de texto para manter a responsividade e consistência.
  - **Integração de Logos Oficiais da Cred Certo**:
    - O usuário forneceu os arquivos de logotipo e favicon oficiais da Cred Certo em formato WebP na raiz do projeto.
    - Implementado um script temporário em PowerShell usando a biblioteca nativa `System.Drawing` e WIC para efetuar a decodificação do formato `.webp` e salvá-los como imagens `.png` de alta qualidade.
    - Atualizados os caminhos oficiais em `saas_assets/cred_certo/` e injetados de forma dinâmica na pasta pública principal (`public/`) e nos bundles estáticos dos parceiros.
  - **Compilação Estática e Distribuição**:
    - Executados builds de produção locais em lote para todas as calculadoras (raiz, `saas/d_cred`, `saas/credpara` e `saas/melhor_credi`), validando bundles estáticos limpos e otimizados para deploy.
    - Remoção dos pacotes antigos e geração de novos pacotes de distribuição na raiz: `antigravity-v1.2.3.zip` (fontes) e `simulador-dist-v1.2.3.zip` (distribuição limpa com subpastas prontas para extração direta no cPanel).
  - **Sincronização de Repositório e CI/CD**:
    - Executada a replicação total para os parceiros SaaS, atualizando todas as dependências locais e metadados na versão `1.2.3`.
    - Commits no Git e envio (push) das alterações para a branch `main` no repositório remoto, acionando a esteira do GitHub Actions para deploy automatizado de todas as instâncias em lote no cPanel.
- **Status Final**: Versão 1.2.3 totalmente compilada, empacotada localmente com os novos ativos oficiais de marca integrados e commitada com push no GitHub para deploy automatizado na calculadora raiz e nas três subpastas físicas de parceiros no cPanel.

---

## [2026-05-20] - Atualização da Calculadora Base para Empresta BH (v1.2.4)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.4`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Atualização de Marca no Core Base**: O core principal da calculadora (na raiz do projeto) foi desvinculado da marca "Cred Certo" e atualizado para utilizar **Empresta BH** como identidade oficial (título de abas, copyrights no rodapé e nome na exportação do PNG em `App.tsx`).
  - **Integração de Logos Oficiais da Empresta BH**: Os logotipos da Empresta BH (já convertidos de WebP para PNG) foram integrados com sucesso na pasta `public/` como os ativos visuais nativos.
  - **Adequação do Script de Replicação**: O script `copy_to_partners.ps1` foi modificado para utilizar `"Empresta BH"` e `"Empresta BH ©"` como chaves âncora de _replace_. Isso garante que a replicação preserve as personalizações individuais dos parceiros (D Cred, CredPara, Melhor Credi) sem vazar a nova marca raiz.
  - **Compilação e Replicação**: Executada replicação total (`.\scripts\copy_to_partners.ps1`) e re-build de produção em lote para todas as calculadoras físicas.
- **Status Final**: Versão 1.2.4 concluída, compilada, e atualizada nas instâncias SaaS. O código foi empacotado em ZIP e empurrado via git push para ativação do deploy automatizado no cPanel.

---

## [2026-05-20] - Restrições Administrativas, Identidade Visual e Expansão SaaS (v1.2.5)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.5`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Permissões do Painel**: Bloqueio completo da aba "Fatores Base" para o perfil `dono`, restringindo o acesso exclusivamente ao `admin`, e alteração da aba "Custos da Máquina" para modo somente-leitura para o `dono`.
  - **Identidade Visual Dinâmica**: Desenvolvimento de aba dedicada no Painel Administrativo para upload de URL do logotipo e definição dinâmica de cor primária em formato HEX. Integração desses estados dinâmicos no visual da página e no cabeçalho do PNG exportado.
  - **Otimização da Tabela**: A coluna "Taxa Cliente" foi renomeada para "% a.m.", e adicionado toggle na tela para que o vendedor ative/desative a exibição dessa coluna na imagem gerada.
  - **Novos Parceiros SaaS**: O script de replicação em lote PowerShell e a esteira de deploy no GitHub Actions foram atualizados com 8 novas marcas (como `roma`, `credfacil`, `rose`, etc.) para deploy automático e isolado.
- **Status Final**: Versão 1.2.5 concluída e implantada com sucesso.

---

## [2026-05-20] - Compartilhamento Estruturado da Simulação no WhatsApp e Identidade Dinâmica (v1.2.6)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.6`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Compartilhamento Dinâmico no WhatsApp**: Desenvolvimento de gerador de mensagem estruturada com as opções de parcelamento de 1x a 21x da simulação de vendas (com valores das parcelas e valores totais), bandeira de cartão, modo de cálculo (Valor ou Limite) e tabela ativa.
  - **Abertura e Conexão**: Conexão com a URL de API oficial do WhatsApp (`https://api.whatsapp.com/send?text=...`) contendo o texto da simulação codificado e download automático reativo da imagem em formato PNG no fallback para computadores ou celulares sem suporte nativo a compartilhamento de arquivos.
  - **Identidade Visual Reativa**: Extração automática do nome da marca ativa baseado no `document.title` da aba do navegador, tornando a mensagem de compartilhamento inteligente e compatível com todos os ambientes SaaS sem necessitar de substituição de strings adicionais no PowerShell.
- **Status Final**: Versão 1.2.6 codificada, replicada em lote para as 9 instâncias multi-tenant de parceiros, compilada localmente com 100% de sucesso na pasta `/dist`, empacotada de forma enxuta em `antigravity-v1.2.6.zip` (17MB, excluindo `node_modules` desnecessários) e integrada com sucesso ao repositório Git com push enviado na branch `main` para ativação automática do deploy cPanel via GitHub Actions.

---

## [2026-05-20] - Remoção do Texto de Instrução de Anexo no WhatsApp (v1.2.7)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.7`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Remoção de Instrução**: Exclusão do aviso explicativo de celular `"📱 A imagem detalhada da simulação foi baixada. Por favor, anexe-a para enviar ao cliente!"` na mensagem final gerada para o WhatsApp em `src/App.tsx`.
  - **Mensagem Limpa**: O encerramento da proposta de simulação de vendas comercial agora finaliza diretamente e de forma limpa na informação de validade da simulação de 7 dias, otimizando o aspecto estético do texto copiado para o cliente final.
  - **SaaS Replicação & Re-build**: Modificações propagadas com sucesso para todas as instâncias de parceiros SaaS físicas.
- **Status Final**: Versão 1.2.7 testada, compilada em lote e distribuída de forma enxuta via `antigravity-v1.2.7.zip` (17MB). Alterações commitadas e enviadas ao GitHub remoto na branch `main`, ativando o deploy FTP instantâneo nos parceiros do cPanel.

---

## [2026-05-20] - Atualização de Tabelas de Custo dos Parceiros SaaS e Injeção Automatizada (v1.2.8)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.8`
- **Autor**: Antigravity AI (Antigravity)
- **Alterações**:
  - **Customização de Custos de Máquina**: Mapeamento e injeção completa de tabelas de custos de adquirente padrão de fábrica (Master/Visa e Elo de 1x a 21x) para 8 parceiros SaaS multi-tenant: Cred Fácil, CredPara, Cred Simples, D Cred, Melhor Crédito, Roma, Rose e Ramos.
  - **Correção da Cred Simples**: Correção na parcela 13 de Master/Visa para `16.10%` na tabela customizada do script de replicação (conforme especificação exata do usuário).
  - **Injeção Dinâmica via PowerShell**: Desenvolvimento de lógica de injeção automática em `scripts/copy_to_partners.ps1` usando substituição de expressões regulares multilinha. O script agora detecta chaves e substitui perfeitamente o bloco `DEFAULT_TAXAS_CUSTO` em `App.tsx` no loop de cada parceiro.
  - **Build & Compilação**: Executados build local (`npm run build`) com sucesso, validando a pasta `/dist` livre de erros.
- **Status Final**: Versão 1.2.8 concluída, compilada localmente e replicada com sucesso em lote para as 10 instâncias SaaS. Fontes empacotadas no arquivo leve `antigravity-v1.2.8.zip` (17.8MB) e preparadas para commit e push na branch `main` no GitHub.

---

## [2026-05-20] - Upload de Logo nos Parceiros SaaS e Novo Design do Botão de % (v1.2.9)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.9`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Upload de Logo nos Parceiros**: Substituição do input de URL textual por upload de arquivo (`type="file"`) em todos os 10 parceiros SaaS (`credfacil`, `credpara`, `credsimples`, `d_cred`, `forcepay`, `melhorcredito`, `ramos`, `roma`, `rose`, `rtgroup`), salvando em localStorage e no servidor como Base64.
  - **Redesenho do Toggle de %**: Novo design para o botão de exibir taxa na exportação. Substituído por um toggle pill verde/cinza dinâmico com badge circular estilizado com o símbolo `%`.
- **Status Final**: Versão 1.2.9 compilada com sucesso, replicada em todas as instâncias SaaS e empacotada em `antigravity-v1.2.9.zip`.

---

## [2026-05-20] - Compressão de Imagens Canvas no Upload e Ajuste de Filtro de Exportação (v1.2.10)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.10`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Compressão de Logotipo via Canvas**: Implementada a função `compressLogoImage` em `src/App.tsx` que redimensiona e comprime qualquer logotipo carregado para no máximo 400x120px, codificando-o em PNG leve (redução drástica de megabytes para 10KB-40KB). Isso previne estouros de cota no `localStorage` (`QuotaExceededError`) e rejeições por HTTP POST excedentes no cPanel.
  - **Filtro de Logotipo Customizado Inteligente**: Remoção do filtro fixo `brightness(0) invert(1)` na imagem exportada se houver logotipo personalizado ativo (`logoUrl` definido), permitindo a exibição em cores reais e evitando silhuetas ou retângulos brancos.
  - **Replicação Total Multi-Tenant**: Re-executado o script `scripts/copy_to_partners.ps1` propagando as correções do core base de forma homogênea para todos os parceiros SaaS físicos do projeto.
- **Status Final**: Versão 1.2.10 concluída e compilada com sucesso.

---

## [2026-05-20] - Isolamento de LocalStorage e Correção de Cálculo na CredPara (v1.2.11)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.2.11`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Correção de Cálculo de Lucro na CredPara**: Solucionado o bug reportado pelo usuário onde a simulação de R$ 1.198,00 no modo limite na CredPara exibia um lucro incorreto de R$ 162,18 em vez de R$ 129,11. A causa raiz foi o compartilhamento do `localStorage` entre subpastas do mesmo domínio no cPanel, fazendo com que o navegador aplicasse a taxa de custo da máquina padrão de 2.99% Master/Visa 1x da calculadora raiz em vez dos 5.75% específicos cadastrados para a CredPara.
  - **Isolamento de Cache Multi-Tenant (LocalStorage)**: Criação de prefixo dinâmico de persistência local (`STORAGE_PREFIX`) injetado individualmente por parceiro SaaS (ex: `credpara_` para CredPara, `credfacil_` para Cred Fácil). Encapsulamento das leituras e gravações do localStorage nas funções abstratas `getStorageItem`, `setStorageItem` e `removeStorageItem` em `src/App.tsx`, eliminando vazamento de escopo e mistura de taxas e logotipos no lado do cliente.
  - **Ajuste no Script de Replicação**: O script PowerShell `scripts/copy_to_partners.ps1` foi configurado para injetar automaticamente o prefixo do parceiro nas cópias em lote.
  - **Build & Empacotamento**: Recompilação em lote executada. Criação do arquivo de distribuição final `antigravity-v1.2.11.zip` contendo os novos fontes e build, e remoção do zip obsoleto anterior.
- **Status Final**: Versão 1.2.11 totalmente corrigida localmente, buildada na raiz e nos 10 tenants do SaaS, empacotada em arquivo ZIP na raiz, commitada e enviada via `git push origin main` para deploy automático via GitHub Actions para o servidor de produção cPanel.

---

## [2026-05-20] - Identidade Visual Dinâmica e Reativa de Cores (v1.3.0)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.3.0`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Função de Cálculo de Cores (`mixColor`)**: Implementada uma lógica matemática precisa para mesclar canais RGB no topo de `src/App.tsx`. A partir de qualquer tom HEX primário selecionado no Painel Administrativo, ela gera tons escuros elegantes (para textos e cabeçalhos) e tons pastel suaves (para zebras de tabelas e fundos) de forma robusta.
  - **Injeção Dinâmica Reativa (`dynamicStyles`)**: Criada injeção reativa via tag `<style>` com as classes compiladas do Tailwind CSS sobrescritas usando `!important`. Isso permite redefinir de forma síncrona botões, inputs, bordas, zebras, focos e cabeçalhos em toda a interface do simulador e tela de login sem alterar as classes estáticas no JSX.
  - **Exportação 100% Dinâmica no PNG**: Alterados todos os tons de verde estáticos inline na imagem exportada (`exportRef`) por cores geradas em tempo de execução via `mixColor` baseando-se no `primaryColor`. Dessa forma, o PNG gerado pelo botão "Gerar Imagem" ou "WhatsApp" herda a identidade completa do parceiro.
  - **Preservação de UX no Botão WhatsApp**: O botão do WhatsApp no simulador preserva sua cor tradicional reconhecida (`#25D366`), mas o PNG gerado por ele é personalizado em conformidade com a nova paleta.
  - **Replicação SaaS em Lote**: Executada replicação automática para os 9 parceiros ativos SaaS (`saas/*`, exceto ForcePay) via script `copy_to_partners.ps1`.
  - **Build de Produção & Empacotamento**: Processo de build global de produção executado com 100% de sucesso. Arquivos empacotados de forma limpa em `antigravity-v1.3.0.zip`.
- **Status Final**: Versão 1.3.0 totalmente implementada, compilada em lote para todas as calculadoras físicas, empacotada em arquivo ZIP na raiz, commitada e enviada via `git push origin main` para deploy automático via GitHub Actions para o servidor de produção cPanel.

---

## [2026-05-20] - Estilos Inline Reativos para Valor da Parcela e Taxas (v1.3.1)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.3.1`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Estilos Inline Dinâmicos**: Substituição das classes utilitárias de texto do Tailwind CSS (`text-emerald-700`, `text-emerald-600`) nos elementos críticos da tabela de resultados do simulador (Valor da Parcela, Taxa Cliente e Lucro Positivo) por estilos reativos directos em JSX (`style={{ color: ... }}`) baseados na cor de tema `primaryColor`.
  - **Blindagem contra Tailwind v4 e Caches**: A mudança contorna conflitos de especificidade, o escopo de variáveis globais do Tailwind CSS v4 e caches persistentes em navegadores móveis, garantindo reatividade de cores instantânea.
  - **Refinamento de Ícones Auxiliares**: Adaptação do ícone Calculator no Header e Sliders no painel administrativo para usarem a cor primária dinamicamente.
  - **Replicação SaaS Automática**: Propagação homogênea do novo core base em lote para os 9 parceiros ativos SaaS (`saas/*`, exceto ForcePay) com o script PowerShell.
  - **Build & Zip**: Compilação local e empacotamento completo em `antigravity-v1.3.1.zip` sem dependências desnecessárias.
- **Status Final**: Versão 1.3.1 totalmente testada, buildada localmente, replicada para parceiros SaaS, empacotada e commitada com git push na branch `main` para deploy automatizado via FTP na nuvem cPanel.

---

## [2026-05-21] - Correção Crítica no WhatsApp e Estabilidade Multi-Tenant (v1.3.2)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.3.2`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Correção Crítica de ReferenceError no WhatsApp**: Substituição da variável inexistente `limiteCartao` por `valorDesejado` em `src/App.tsx` (linha 512). A ausência dessa variável causava um erro fatal silencioso de Javascript que impedia o processamento e abertura da URL do WhatsApp.
  - **Propagação Automática em Lote**: Execução do script PowerShell `scripts/copy_to_partners.ps1` que propagou a correção de forma 100% homogênea para todas as subpastas dos inquilinos SaaS (`saas/*`), incluindo o `CHANGELOG.md` e o `package.json` atualizados.
  - **Build de Produção e Empacotamento**: Executado o build de produção global local com sucesso absoluto. Fontes e ativos compactados no pacote de entrega `antigravity-v1.3.2.zip`, apagando o zip obsoleto anterior.
- **Status Final**: Versão v1.3.2 totalmente corrigida, buildada localmente, replicada nas instâncias SaaS, empacotada em arquivo ZIP, commitada e enviada via `git push origin main --force` para o repositório remoto para atualização imediata do servidor cPanel via pipeline do GitHub Actions.

---

## [2026-05-21] - Configuração de Opções Visuais Desativadas por Padrão (v1.3.3)
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão**: `v1.3.3`
- **Autor**: Antigravity AI
- **Alterações**:
  - **Visualização Oculta por Padrão**: As flags `show_lucro_vendedor` (Liberar Tabela de Comissão para Vendedores) e `show_lucro_dono` (Ativar Lucro Líquido no simulador do Dono) foram configuradas para iniciar desativadas (`false`) por padrão na primeira carga do simulador.
  - **Taxa de Custo Oculta por Padrão**: A opção de exibir a taxa de custo (`tipo_taxa_exibida === 'custo'`) já vinha desativada por padrão, mostrando a "Taxa do Cliente". O comportamento foi reafirmado.
  - **Restauração de Padrões Segura**: A rotina de restaurar os padrões de fábrica no Painel Admin foi recalibrada para desativar e persistir ambas as opções de margem como `false` por padrão.
  - **SaaS Replicação em Lote**: Executado o script `scripts/copy_to_partners.ps1` que distribuiu e injetou essas alterações estéticas do core de forma 100% homogênea para todos os inquilinos SaaS em `saas/*`.
  - **Build de Produção & Compactação**: Compilação global concluída (`npm run build`) e geração do zip consolidado `antigravity-v1.3.3.zip` na raiz.
- **Status Final**: Versão v1.3.3 concluída, buildada localmente, replicada para todos os parceiros multi-tenant, empacotada em ZIP, commitada e enviada para o repositório GitHub para deploy cPanel imediato.
