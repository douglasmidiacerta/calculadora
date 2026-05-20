### Sessão Atual - Concluída (v1.2.8)

- **Atualização de Taxas de Custo dos Parceiros SaaS**: Mapeamento completo e injeção automática de taxas padrão de fábrica (Master/Visa e Elo de 1x a 21x) para as calculadoras multi-tenant dos parceiros: Cred Fácil, CredPara, Cred Simples, D Cred, Melhor Crédito, Roma, Rose e Ramos.
- **Correção da Cred Simples**: Parcela 13 corrigida para `16.10%` no Master/Visa em conformidade com as regras de negócio enviadas.
- **Injeção de Código Automatizada**: Aprimorado o script `scripts/copy_to_partners.ps1` com expressão regular multilinha para substituir `DEFAULT_TAXAS_CUSTO` em tempo de replicação.
- **Build de Produção**: Projeto compilado localmente com 100% de sucesso.
- **Empacotamento (ZIP)**: Removido zip anterior e gerado `antigravity-v1.2.8.zip` (17.8MB) contendo o changelog e fontes.

### Próximos Passos

1. **Homologar no Servidor cPanel**: Acompanhar o deploy do GitHub Actions nas subpastas e testar se cada parceiro está iniciando com suas respectivas taxas padrão no Painel Administrativo ("Restaurar Padrões").
2. **Apoiar Novos Parceiros**: Dar suporte caso o cliente solicite a inclusão de novas tabelas personalizadas para outros tenants.
