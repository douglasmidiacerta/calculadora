# Aprendizado Contínuo - Arquitetura SaaS e Multi-Tenant em cPanel Compartilhado

Este documento serve como referência técnica e arquitetural para que futuras instâncias do assistente de IA compreendam o ecossistema SaaS implementado para este projeto de simulador de vendas.

---

## 1. Padrão de Diretórios Multi-Tenant Isolados
* **Problema**: O cliente precisava oferecer o simulador para múltiplos parceiros sob a mesma infraestrutura de servidor compartilhado, mantendo personalizações visuais, taxas isoladas e marcas de cabeçalho específicas, sem acoplar tudo no mesmo banco de dados complexo de gerenciar.
* **Solução**: Arquitetura multi-codebase em subpastas. O diretório base atua como o código-mestre ("molde"). Sob a pasta `saas/`, cada parceiro tem um subprojeto completo (`d_cred/`, `credpara/`, `melhor_credi/`).
* **Automação e Consistência**:
  - Para evitar o trabalho manual de replicar atualizações de lógica ou correções de bugs, foi desenvolvido um script PowerShell (`scratch/copy_to_partners.ps1`).
  - O script limpa os diretórios de destino e copia os arquivos-fonte da raiz individualmente, ignorando dados locais, dependências de desenvolvimento (`node_modules`), caches e bundles compilados (`dist`).
  - **Padrão a Seguir**: Sempre que fizer modificações de comportamento no simulador base (`src/App.tsx`, `server.ts` ou APIs), rode o script de cópia e então efetue os builds específicos.

---

## 2. Divisão de Acesso por Perfil de Usuário (Roles)
* **Estrutura**:
  - `dono`: Perfil empresarial com acesso irrestrito ao painel de configurações administrativas. Permite alterar taxas gerais, acréscimos por tabela, custos de adquirente e definir a visibilidade das tabelas de comissão para os vendedores comuns.
  - `vendedor`: Perfil simulador puro. Não exibe botão de engrenagem para acessar configurações. A visibilidade da coluna "Lucro Líquido" na tabela principal de resultados da simulação depende remotamente de uma chave definida no servidor.
* **Segurança baseada em Client-Side**: O client React consome a role enviada pela API de login e adapta a renderização de componentes de controle e colunas de dados confidenciais de forma dinâmica.

---

## 3. Sincronização de Taxas Remotas (config.json)
* **Desafio**: Originalmente, as taxas customizadas no painel administrativo eram salvas no `localStorage` do navegador de quem as editou. Isso isolava as taxas no aparelho de quem editou. Quando o dono configurava as taxas no seu celular, os vendedores no celular deles continuavam simulando com taxas originais de fábrica.
* **Solução**: Banco de dados dinâmico de configuração simples baseado em arquivo estático.
  - Criado o endpoint de API PHP `api/config/index.php` e espelhado no Express local `server.ts` sob `/api/config`.
  - Quando o perfil `dono` salva novas taxas no simulador, uma requisição POST transmite os novos multiplicadores e controles de comissão para o servidor.
  - O script PHP grava essa estrutura JSON diretamente no arquivo estático no servidor (`api/config/config.json`).
  - Ao carregar a aplicação (após login), o frontend faz um GET síncrono para o servidor remoto, sincronizando de forma transparente as taxas e a liberação de margens para todos os aparelhos de vendedores instantaneamente.
  - **Vantagem cPanel**: Altamente performático, não gera carga no servidor de banco de dados SQL e funciona em qualquer hospedagem compartilhada sem precisar de dependências robustas adicionais.

---

## 4. Personalização de Marca
* **Fórmula de Customização**: O copyright no rodapé da caixa de login e o nome da marca na parte superior da imagem de simulação exportada em PNG para compartilhamento em redes (como WhatsApp) são alterados no arquivo principal `App.tsx` de cada parceiro com o nome correspondente de sua respectiva marca.
* **Padrão**:
  - Copyright: `<p className="text-slate-400 text-xs font-medium uppercase tracking-tighter">NomeParceiro © {new Date().getFullYear()}</p>`
  - Cabeçalho do PNG: `<div style={{ fontSize: '24px', fontWeight: '800' }}>NomeParceiro</div>`
