# CHANGELOG - Simulador de Vendas e Taxas (Calculadora)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.7] - 2026-05-19

### Adicionado
- **Integração de Deploy Automatizado com cPanel (`.cpanel.yml`)**:
  - Criação do arquivo de configuração `.cpanel.yml` na raiz do projeto. Ele instrui a engine de deploy do Git do cPanel a usar o `rsync` para sincronizar os arquivos compilados da pasta `dist/` diretamente na pasta de destino de publicação pública (ex: `/public_html/calculadora`), ignorando os arquivos de código-fonte e o histórico do Git no deploy final.

## [1.0.6] - 2026-05-19

### Adicionado
- **Botão para Mostrar/Ocultar Lucro Líquido na Tela**:
  - Adicionado estado `showLucro` (booleano) e botão moderno de alternância (Toggle com ícone dinâmico `Eye` / `EyeOff` do lucide-react) no cabeçalho do simulador. Isso permite ocultar a coluna "Lucro Líquido" na tela do computador/celular caso o cliente final esteja visualizando a tabela de simulação.
- **Botão para Trocar Taxas (Exibição de Taxa Cliente vs Taxa Máquina/Custo)**:
  - Adicionado estado `tipoTaxaExibida` (variando entre `"cliente"` e `"custo"`) e botão estilizado no cabeçalho. Permite alternar dinamicamente a exibição na tabela entre a **Taxa do Cliente** (taxa final calculada com acréscimo) e a **Taxa de Custo da Máquina** (taxa retida pela adquirente), com diferenciação de cores (verde para cliente e laranja/âmbar para máquina).

## [1.0.5] - 2026-05-19

### Adicionado
- **Resolução do Erro de Método Não Permitido (HTTP 405 / POST convertendo para GET)**:
  - Alterada a chamada do fetch de login no frontend (`src/App.tsx`) para usar a barra final (`api/login/`). Isso impede que o Apache redirecione a requisição POST para a URL com barra final gerando um redirecionamento HTTP 301, o qual converte o método para GET no navegador e descarta os parâmetros JSON (o que causava o erro HTTP 405 no script PHP).
  - Atualizada a rota correspondente no backend Express local (`server.ts`) para suportar em array tanto `/api/login` quanto `/api/login/`, assegurando o perfeito funcionamento da aplicação tanto localmente quanto em produção.

## [1.0.4] - 2026-05-19

### Adicionado
- **Redirecionamento Automático de Barra Final (Resolução Definitiva de Tela Branca em Subpasta)**:
  - Adicionado script Javascript inline no `<head>` do `index.html` que detecta se a aplicação foi aberta em uma subpasta sem a barra `/` final (ex: `dominio.com/calculadora`) e a redireciona dinamicamente adicionando a barra (ex: `dominio.com/calculadora/`). Isso assegura a correta resolução dos caminhos relativos dos assets (`./assets/...`) pelo navegador.
  - Adicionado tratamento de URL no servidor Apache via regras de rewrite no `public/.htaccess`, forçando o redirecionamento com barra final (HTTP 301) em diretórios físicos do servidor.

## [1.0.3] - 2026-05-19

### Adicionado
- **Suporte Total a Subpastas (Correção de Tela Branca)**: Configuração de `base: './'` no Vite 6 (`vite.config.ts`), garantindo a geração de caminhos de arquivos estáticos (assets JS/CSS) relativos em vez de absolutos.
- **Chamada de API Adaptável**: Alteração do endpoint do fetch do login de `/api/login` (absoluto) para `api/login` (relativo) no frontend React, viabilizando requisições corretas a partir de qualquer subpasta do servidor Apache no cPanel.
- **Otimização do .htaccess**: Ajustes preventivos para desativar a listagem de arquivos (`Options -Indexes`) sem interferir no mapeamento dinâmico de diretórios do Apache em subpastas.

## [1.0.2] - 2026-05-19

### Adicionado
- **Arquitetura Híbrida de Deploy**: Suporte a servidores sem Node.js instalando suporte nativo a PHP/Apache na rota `/api/login`.
- Mapeamento de diretório público `public/api/login/index.php` contendo a lógica de login em PHP compatível com qualquer cPanel compartilhado simples.
- Inicialização autônoma de tabelas MySQL do cPanel diretamente pelo arquivo PHP (`PDO`).
- Inclusão do arquivo `.htaccess` para roteamento amigável e proteção de rotas estáticas do Apache.
- Geração automática do build empacotado que acopla o frontend estático e o backend PHP diretamente na pasta `/dist`.

## [1.0.1] - 2026-05-19

### Adicionado
- Integração e suporte nativo ao banco de dados **MySQL** do cPanel utilizando a biblioteca `mysql2/promise`.
- Criação e inicialização automática da tabela de `usuarios` no banco de dados com a inserção do usuário `admin` padrão (`123456`).
- Sistema de autenticação adaptável na rota `/api/login` (tentativa no banco com fallback para credenciais estáticas de desenvolvimento).
- Configuração de escuta de porta dinâmica baseada em `process.env.PORT` para garantir a compatibilidade com o servidor Phusion Passenger do cPanel.
- Carregamento de variáveis de ambiente do arquivo `.env` via `dotenv/config`.
- Arquivo `.env.example` e `.env` atualizados com as configurações de conexão fornecidas pelo usuário.

## [1.0.0] - 2026-05-19

### Adicionado
- Estruturação do repositório inicial importado do AI Studio.
- Integração da pasta de gestão de inteligência e contexto `/ai_context`.
- Configuração do histórico mestre do projeto (`ai_context/historico_mestre.md`) e controle de checkpoints de desenvolvimento (`ai_context/sessao_atual.md`).
- Instalação e auditoria de 216 pacotes NPM requeridos pelo stack de tecnologias.
- Suporte para exportação de imagem em formato vertical móvel compactado (480px).
- Script de compilação integrado no Vite 6 + esbuild, gerando o bundle do frontend em `dist` e o servidor Express de produção em `dist/server.cjs`.
- Script de inicialização automatizado para execução no ambiente de produção (`npm start`).
