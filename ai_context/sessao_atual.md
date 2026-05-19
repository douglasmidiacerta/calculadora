# Sessão Atual - Checkpoint de Desenvolvimento

## Status da Sessão
- **ID da Conversa**: `adcb4157-b00b-4b25-b810-7b4ac171e7e5`
- **Versão Atual**: `v1.0.8`
- **Foco da Sessão**: Remoção definitiva dos botões visuais do cabeçalho principal ("Ocultar Lucro" e "Ver Taxa Custo") e consolidação dos controles na Aba 1 do Painel Administrativo.

---

## Atividades Realizadas
1. **Estrutura de Contexto**: Sincronização de `CHANGELOG.md`, `ai_context/historico_mestre.md` e `ai_context/sessao_atual.md` para a versão `v1.0.8`.
2. **Remoção de Elementos Visuais**:
   - Confirmada a remoção completa dos botões "Ver Taxa Custo/Cliente" e "Ocultar/Mostrar Lucro" no header principal em `src/App.tsx`.
   - A interface do vendedor comum tornou-se 100% limpa, segura e à prova de olhares de clientes.
3. **Centralização Administrativa**:
   - Os controles reativos continuam ativos no painel admin (Aba 1) através dos switches "Exibir Coluna de Lucro Líquido" e "Ver Taxa de Custo da Máquina".
   - Persistência e sincronia perfeitas com o `localStorage` mantidas.

---

## Próximos Passos (Pendentes)
1. **Deploy da v1.0.8 no cPanel**:
   - Recomendar ao usuário que remova os ZIPs da versão `1.0.7` e extraia o novo `simulador-dist-v1.0.8.zip` na subpasta do seu cPanel.
2. **Validação do Painel Admin**:
   - Verificar com o usuário se ao acessar o Painel Admin (clicando no ícone de engrenagem, digitando `3x51ELCO`), a alteração das opções de visibilidade na Aba 1 oculta/exibe a coluna de Lucro Líquido e altera a taxa adequadamente na tabela.
