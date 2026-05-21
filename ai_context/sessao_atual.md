### Sessão Atual - Concluída (v1.3.3)

- **Configuração de Opções Padrão Desativadas**:
  - **Requisito**: Deixar por padrão desativadas na inicialização (e na restauração de padrões de fábrica) as seguintes opções visuais:
    1. *Liberar Tabela de Comissão para os Vendedores* (desativado por padrão / bloqueado).
    2. *Ativar Lucro Líquido no simulador do Dono* (desativado por padrão).
    3. *Ver Taxa de Custo da Máquina* (desativado por padrão, exibindo a "Taxa do Cliente").
  - **Solução**: Ajustado o fallback do `loadLocalStorage` para retornar `false` nas chaves `simulador_show_lucro_vendedor` e `simulador_show_lucro_dono`, além de inicializar as variáveis locais do formulário com `false`. A flag `simulador_tipo_taxa_exibida` já inicializava como `'cliente'` por padrão (desativando a exibição da taxa de custo).
  - **Restauração de Padrões**: A função de restaurar padrões no Painel Admin foi atualizada para resetar e persistir essas flags visuais como `false` por padrão.
  - **Replicação SaaS Multi-Tenant**: Novo comportamento do core propagado em lote para todas as 10 instâncias SaaS (`saas/*`) usando o script PowerShell `scripts/copy_to_partners.ps1`.
  - **Build & Zip**: Compilação local concluída e fontes compactados em `antigravity-v1.3.3.zip`.

### Próximos Passos

1. **Validação das Flags de Exibição**: Solicitar ao usuário a validação das flags visuais vindo desativadas por padrão no simulador principal e inquilinos SaaS.
2. **Monitoramento do GitHub Actions**: Acompanhar se o pipeline de CI/CD do repositório remoto conclui o deploy para o cPanel.
