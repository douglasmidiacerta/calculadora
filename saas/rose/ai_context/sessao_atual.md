### Sessão Atual - Concluída (v1.2.6)

- Aprimorado o recurso de compartilhamento da imagem da simulação no WhatsApp.
- Criado gerador de mensagem estruturada e formatada em texto rico com resumo de opções de parcelamento de 1x a 21x, taxa dinâmica e valor de referência.
- Adicionado fallback inteligente para computadores desktop e celulares limitados, acionando o download do PNG e abrindo a API oficial do WhatsApp com a mensagem pré-preenchida de forma transparente.
- Marca parceira resolvida via `document.title` dinamicamente no React, garantindo resiliência multi-tenant sem requerer alterações no PowerShell.
- Alterações replicadas com sucesso para todas as instâncias SaaS dos parceiros via script de lote.

### Próximos Passos

1. Validar as modificações na esteira de homologação ou produção.
2. Monitorar o deploy via GitHub Actions.
