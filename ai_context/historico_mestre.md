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
  - Remoção de `antigravity-v1.0.0.zip` e geração do novo pacote de deploy `antigravity-v1.0.1.zip`.
  - Commits e push das alterações da v1.0.1 no GitHub (`origin/main`).



