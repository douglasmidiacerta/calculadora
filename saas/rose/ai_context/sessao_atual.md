### Sessão Atual - Concluída (v1.2.11)

- **Correção Crítica de Vazamento de Cache (Multi-Tenant LocalStorage)**:
  - Identificada falha de cálculo na CredPara (retornando lucro de R$ 162,18 em simulação de R$ 1.198,00 quando deveria retornar R$ 129,11).
  - A causa raiz foi o compartilhamento do `localStorage` entre subpastas do mesmo domínio de origem no cPanel (ex: `dominio.com/calculadora/` e `dominio.com/calculadora/credpara/`). O navegador lia a taxa padrão de 2.99% Master/Visa 1x do core base persistida no localStorage em vez dos 5.75% cadastrados na CredPara.
  - Implementada a constante `STORAGE_PREFIX` dinamicamente em cada tenant (ex: `credpara_` para a CredPara, `d_cred_` para a D Cred, etc.).
  - Encapsuladas todas as chamadas de armazenamento nas funções seguras `getStorageItem`, `setStorageItem` e `removeStorageItem` em `src/App.tsx`, isolando os caches por completo.
  - Ajustado o script `scripts/copy_to_partners.ps1` para injetar o prefixo do parceiro correspondente em lote.
- **Exclusão da ForcePay a Pedido do Usuário**:
  - Conforme solicitado, a calculadora **ForcePay** foi mantida fora dessa nova alteração de isolamento do LocalStorage.
  - O código de `saas/forcepay/src/App.tsx` foi revertido para o commit anterior ao isolamento, restaurando o uso nativo e compartilhado do `localStorage` sem prefixos.
  - A **ForcePay** foi removida da lista de parceiros do script de cópia `scripts/copy_to_partners.ps1`, garantindo que futuras replicações em lote não sobrescrevam as configurações dela.
- **Limpeza do Repositório e Otimização Massiva de Tamanho (ZIP)**:
  - Identificado que o diretório temporário `scratch/temp_install` (e sua pasta `node_modules` gerada anteriormente para conversão de imagens) estava sendo propagado recursivamente para cada um dos 10 parceiros do SaaS por não estar na lista de exclusão do script de replicação.
  - Removido o diretório `scratch/temp_install` da raiz do projeto.
  - Removidos de forma recursiva os diretórios `scratch/` de dentro de todos os subprojetos `saas/*`.
  - Adicionada a pasta `"scratch"` no `$excludeList` do script `scripts/copy_to_partners.ps1` para impedir cópias recursivas futuras.
  - Re-executado o script de replicação em lote de parceiros com sucesso.
  - Regenerado o pacote de distribuição local `antigravity-v1.2.11.zip` via script PowerShell `make_zip.ps1`.
  - **Resultado**: Redução de mais de **80%** no tamanho do ZIP final de backup do projeto (de **102.4MB** para apenas **19.3MB**), garantindo extrema agilidade na esteira e deploys no cPanel.
- **Build e Deploy Contínuo**:
  - `npm run build` executado na raiz com sucesso e arquivos de produção compilados na pasta `/dist`.
  - Git commit e git push enviados com sucesso para a branch `main`, ativando o pipeline do GitHub Actions para compilação em lote e deploy FTP isolado de todos os parceiros no servidor cPanel.

### Próximos Passos

1. **Confirmação do Usuário**: Solicitar ao usuário que faça o teste prático na calculadora CredPara (limpando o cache com Ctrl + F5 para apagar resíduos do localStorage compartilhado anteriormente) e verifique se o lucro agora está correto (R$ 129,11).
2. **Validação da ForcePay**: Verificar se a ForcePay continua acessando e compartilhando dados globais normalmente, sem interferência das outras marcas.
