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
  - Correção na chamada de API no frontend em `src/App.tsx` para direcionar a requisição POST para `api/login/` (com barra final). Isso contorna a regra do Apache que redireciona diretórios físicos sem barra final emitindo um HTTP 301, o qual converte a requisição em GET no navegador e descarta os dados JSON.
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
- **Status Final**: Versão 1.0.7 concluída e compilada com sucesso, pronta para empacotamento e deploy.

