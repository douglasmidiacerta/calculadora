# Erros Comuns e Diretrizes de Arquitetura - Calculadora de Vendas

Este documento reúne de forma genérica os principais desafios técnicos enfrentados no deploy híbrido da calculadora em servidores cPanel, suas causas e os padrões de solução implementados. Serve como base de conhecimento para que futuros assistentes e desenvolvedores deem manutenção no projeto sem repetir erros de infraestrutura.

---

## 1. Tela Branca e Caminhos de Assets em Subpastas
* **Erro**: Tela branca ao carregar o simulador em subpastas no servidor Apache (ex: `dominio.com/calculadora/`).
* **Causa**: Por padrão, o Vite compila os assets usando caminhos absolutos (ex: `/assets/index.js`). Quando o app roda dentro de uma subpasta, o navegador tenta buscar o arquivo a partir da raiz do domínio, resultando em erro 404.
* **Padrão de Solução**:
  - Definir `base: './'` no [vite.config.ts](file:///C:/Users/credc/.gemini/antigravity/worktrees/calculadora/git-cpanel-integration-setup/vite.config.ts) para forçar o Vite a gerar caminhos relativos.
  - Implementar um script inline no `<head>` do `index.html` que detecta acessos sem a barra final (ex: `/calculadora`) e redireciona adicionando a barra `/` final (ex: `/calculadora/`). Sem a barra final, o browser falha ao resolver caminhos relativos.

---

## 2. Redirecionamento 301 do Apache e Erro HTTP 405 (Método Não Permitido)
* **Erro**: Requisição POST para o endpoint de login (`api/login`) falha com erro 405.
* **Causa**: Regras de reescrita ou o comportamento nativo de pastas físicas no Apache fazem com que chamadas a diretórios sem barra final emitam um redirecionamento HTTP 301. O navegador, ao seguir o redirecionamento 301, converte o método POST em GET e descarta o payload JSON do body da requisição.
* **Padrão de Solução**:
  - Corrigir a chamada de fetch no frontend para usar a barra final obrigatoriamente (ex: `api/login/`).
  - No backend Express local (`server.ts`), suportar ambas as rotas `["/api/login", "/api/login/"]` para manter compatibilidade no desenvolvimento local.

---

## 3. Validação do `.cpanel.yml` Sensível a CRLF (Quebra de Linha Windows)
* **Erro**: O Git™ Version Control do cPanel acusa que o arquivo `.cpanel.yml` é inválido ou ignora as instruções de deploy.
* **Causa**: O validador do cPanel roda em ambiente Linux e falha silenciosamente se o arquivo `.cpanel.yml` contiver quebras de linha no padrão Windows (CRLF) ao invés do padrão Unix (LF).
* **Padrão de Solução**:
  - Criar um arquivo `.gitattributes` na raiz do projeto contendo a instrução `*.yml eol=lf` para forçar que o Git salve esses arquivos estritamente com quebra de linha LF (Unix), independentemente do sistema operacional do desenvolvedor.

---

## 4. Direcionamento e Permissão de Contas FTP Restritas no GitHub Actions
* **Erro**: Sincronização por FTP falha no GitHub Actions com erro de permissão ou grava os arquivos no caminho incorreto (ex: duplicando pastas ou criando fora do diretório público).
* **Causa**: Por recomendação de segurança, criam-se contas FTP dedicadas no cPanel restritas a uma pasta específica (ex: `public_html/calculadora`). Quando esta conta efetua o login no FTP, o cliente FTP já se encontra logado **dentro** da pasta destino. Se o script do GitHub Actions tentar navegar para `/public_html/calculadora/`, ele causará erro ou criará a subpasta `public_html/calculadora` dentro de si mesma.
* **Padrão de Solução**:
  - Configurar a propriedade `server-dir: ./` no arquivo `.github/workflows/deploy.yml` quando utilizar contas FTP dedicadas e restritas, instruindo a ferramenta a descarregar os arquivos diretamente no diretório raiz do login FTP.
