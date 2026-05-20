### Sessão Atual - Concluída (v1.2.9)

- **Upload de Logo nos Parceiros SaaS**: Campo "URL da Logomarca" (input text) substituído por upload de arquivo (`type="file"` + `FileReader` → Base64) em todos os 10 parceiros SaaS: credfacil, credpara, credsimples, d_cred, forcepay, melhorcredito, ramos, roma, rose, rtgroup.
- **Preview do Logo**: Após selecionar o arquivo, o logo é exibido em thumbnail com botão (X) para remover.
- **Instância Principal (src/App.tsx)**: Já possuía o upload de arquivo — todos os parceiros agora estão padronizados.
- **Botão "Mostrar % na imagem" redesenhado**: Toggle pill verde sólido quando ativo / cinza quando inativo. Badge circular com símbolo `%`. Texto dinâmico "Mostrar %" / "Ocultar %".
- **Build e Deploy**: `npm run build` executado com sucesso. ZIP `antigravity-v1.2.9.zip` gerado. Commit e push para `main` realizados com sucesso.

### Próximos Passos

1. **Parceiros Replicados**: A próxima execução de `scripts/copy_to_partners.ps1` irá sobrescrever os parceiros com o código do core base — que JÁ contém o upload de arquivo. A alteração nos parceiros ficará persistente enquanto não houver nova replicação.
2. **Ajuste no Script de Replicação** (opcional): Para que a replicação futura sempre propague o upload de arquivo, o script `copy_to_partners.ps1` pode ser ajustado para não sobrescrever a seção de Identidade Visual dos parceiros individualmente.
