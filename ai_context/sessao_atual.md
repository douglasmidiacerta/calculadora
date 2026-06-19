### Sessão Atual - Concluída (v1.3.5)

- **Tema**: Controle da Tabela Oferta (Promo) por tenant.
- **Requisito do usuário**: Deixar a "Tabela Oferta (Promo)" ativada **somente** para Empresta BH (base) e Cash Certo.
- **Solução implementada**:
  1. Nova constante `MOSTRAR_TABELA_OFERTA` em `src/App.tsx` (logo após `STORAGE_PREFIX`), iniciando `true` na base.
  2. Seletor de Tabela envolvido em `{MOSTRAR_TABELA_OFERTA && (...)}` — quando `false`, o dropdown é ocultado e a simulação usa sempre a tabela Normal.
  3. `scripts/copy_to_partners.ps1` injeta `MOSTRAR_TABELA_OFERTA = false` para todos os parceiros do hash, exceto `cashcerto`.
  4. `saas/forcepay/src/App.tsx` (fora do script de replicação) teve o seletor removido manualmente.
- **Estado pós-replicação**:
  - **Com Tabela Oferta**: Empresta BH (base), Cash Certo.
  - **Sem Tabela Oferta**: d_cred, credpara, credsimples, melhorcredito, credfacil, roma, rose, ramos, rtgroup, forcepay.
- **Validação**: `npm run lint` OK (tsc --noEmit), `npm run build` OK (Vite + esbuild). Todos os 10 tenants do hash em `v1.3.5`.

### Próximos Passos

1. **Monitorar GitHub Actions**: Confirmar o deploy FTP de todas as instâncias no cPanel após o push.
2. **Validação visual**: Conferir em produção que o seletor de Tabela aparece apenas em Empresta BH e Cash Certo.
3. **ForcePay**: Avaliar se vale reincorporar o ForcePay ao hash de replicação (`scripts/copy_to_partners.ps1`) para parar de mantê-lo como cópia congelada divergente.
