# CHANGELOG - Simulador de Vendas e Taxas (Calculadora)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

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
