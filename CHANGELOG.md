# CHANGELOG - Simulador de Vendas e Taxas (Calculadora)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2026-05-19

### Adicionado
- Estruturação do repositório inicial importado do AI Studio.
- Integração da pasta de gestão de inteligência e contexto `/ai_context`.
- Configuração do histórico mestre do projeto (`ai_context/historico_mestre.md`) e controle de checkpoints de desenvolvimento (`ai_context/sessao_atual.md`).
- Instalação e auditoria de 216 pacotes NPM requeridos pelo stack de tecnologias.
- Suporte para exportação de imagem em formato vertical móvel compactado (480px).
- Script de compilação integrado no Vite 6 + esbuild, gerando o bundle do frontend em `dist` e o servidor Express de produção em `dist/server.cjs`.
- Script de inicialização automatizado para execução no ambiente de produção (`npm start`).
