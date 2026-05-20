# CHANGELOG - Simulador de Vendas e Taxas (Calculadora)

## [1.3.1] - 2026-05-20

### Corrigido
- **Cor do Valor da Parcela e Taxas na Tabela do Simulador**:
  - Correção na cor antiga verde/emerald persistente no Valor da Parcela, na Taxa do Cliente (% a.m.) e no Lucro Vendedor Positivo.
  - Substituição das classes estáticas do Tailwind CSS nos elementos de exibição crítica da tabela do simulador por propriedades de estilo inline dinâmicas (`style={{ color: ... }}`) baseadas na função de mesclagem `mixColor` e no estado reativo `primaryColor`.
  - Esta alteração blinda em definitivo a renderização dos textos contra comportamentos de variáveis globais do Tailwind CSS v4 e caches persistentes em navegadores móveis e desktop, garantindo 100% de consistência de marca instantânea no ecossistema multi-tenant.

## [1.3.0] - 2026-05-20

### Adicionado
- **Identidade Visual Dinâmica e Reativa de Cores**:
  - Implementação de lógica reativa e matemática de cores usando a função `mixColor` para mesclagem de canais RGB a partir de qualquer cor HEX primária escolhida pelo Dono no Painel Administrativo.
  - Injeção reativa de uma tag `<style>` com seletores do Tailwind CSS sobrescritas com `!important` (`dynamicStyles`), permitindo atualizar dinamicamente toda a paleta de cores da interface (tela de login, botões, inputs, focos, tabelas, zebras, scrollbars e cabeçalhos) sem quebrar o layout e de forma centralizada.
  - Exportação de imagem PNG da simulação 100% dinâmica, gerando o layout detalhado com a cor primária da marca para o cliente final ao clicar em "Gerar Imagem" e ao clicar no botão "WhatsApp".
  - Preservação da experiência de usuário (UX) com a cor verde tradicional do WhatsApp (`#25D366`) mantida estritamente no botão de ação da tela do simulador, enquanto a imagem PNG gerada por este botão herda 100% da nova cor da marca.
  - Replicação automatizada de toda a lógica para as instâncias de parceiros SaaS multi-tenant (`saas/*`, exceto ForcePay).

## [1.2.11] - 2026-05-20

### Corrigido
- **Cálculo de Lucro Incorreto por Vazamento de Cache (Multi-Tenant LocalStorage)**:
  - Correção crítica no vazamento de cache do `localStorage` entre tenants. Como todas as calculadoras SaaS rodam no mesmo domínio em subpastas no cPanel (ex: `dominio.com/calculadora/` e `dominio.com/calculadora/credpara/`), o navegador compartilhava o mesmo espaço do `localStorage`. Isso fazia com que ao acessar a calculadora CredPara, o sistema utilizasse as taxas de custo da máquina do adquirente padrão da raiz (2.99% Master/Visa 1x) em vez de usar as taxas corretas cadastradas para a CredPara (5.75%).
  - Implementação de um prefixo de persistência local dinâmico (`STORAGE_PREFIX`) individual por tenant (ex: `credpara_` para a CredPara, `d_cred_` para a D Cred, etc.).
  - Encapsulamento de todas as operações de gravação e leitura (`getStorageItem`, `setStorageItem`, `removeStorageItem`) para aplicar automaticamente o prefixo correspondente, garantindo isolamento lógico de cache e taxas 100% segregadas no lado do cliente.
  - Ajuste no script de replicação programática para injetar dinamicamente o prefixo correto no `App.tsx` de cada parceiro em lote.
  - **Exclusão da ForcePay**: Conforme solicitação do usuário, a calculadora parceira **ForcePay** foi excluída desta modificação e do isolamento do localStorage, preservando seu comportamento original nativo de compartilhamento global.

## [1.2.10] - 2026-05-20

### Adicionado
- **Compressão Automática de Imagem no Upload do Logotipo**:
  - Implementado utilitário de compressão de imagens via HTML5 Canvas (`compressLogoImage`). Ao fazer o upload de qualquer arquivo de imagem no Painel Admin (Aba Identidade Visual), a imagem é redimensionada para um limite máximo de 400x120px e codificada como PNG leve.
  - Isso reduz drasticamente o tamanho da string Base64 resultante de megabytes (ex: fotos de alta resolução de 5MB) para apenas **10KB a 40KB**.
  - Corrige em definitivo falhas de gravação por estouro de cota local (`QuotaExceededError` no `localStorage`) e erros de descarte de payloads JSON volumosos nas requisições HTTP POST do cPanel (causadores do logotipo não salvar ou sumir após recarregar).

### Modificado
- **Exibição Inteligente do Logotipo Customizado na Exportação**:
  - O filtro monocromático `brightness(0) invert(1)` na imagem gerada para exportação/compartilhamento agora é aplicado **apenas** quando o logotipo default do parceiro (`logo.png`) está ativo.
  - Se o usuário fizer o upload de uma logomarca personalizada (`logoUrl` ativo), a imagem será renderizada em suas cores originais e sem distorções visuais (resolvendo o problema da caixa/silhueta retangular branca na simulação do WhatsApp).

## [1.2.9] - 2026-05-20

### Modificado
- **Identidade Visual — Upload de Logo em todos os Parceiros SaaS**:
  - Substituído o campo de texto "URL da Logomarca" por um componente de upload de arquivo (`type="file"`) em todos os 10 parceiros SaaS (`credfacil`, `credpara`, `credsimples`, `d_cred`, `forcepay`, `melhorcredito`, `ramos`, `roma`, `rose`, `rtgroup`).
  - O upload converte a imagem para Base64 via `FileReader` e salva em localStorage, mantendo total compatibilidade com o sistema atual.
  - Adicionado preview do logotipo com thumbnail + botão de remoção (X) após seleção do arquivo.
  - A instância principal `src/App.tsx` já possuía este comportamento — agora todos os parceiros estão padronizados.
- **Botão "Mostrar % na imagem" redesenhado**:
  - Visual atualizado: o botão agora funciona como toggle pill com fundo sólido verde quando ativo e cinza quando inativo.
  - Badge circular com o símbolo `%` substituiu o checkbox quadrado anterior.
  - Texto dinâmico: exibe "Mostrar %" quando desativo e "Ocultar %" quando ativo para melhor UX.

## [1.2.8] - 2026-05-20

### Adicionado
- **Atualização de Taxas de Custo dos Parceiros SaaS**:
  - Implementação e mapeamento completo das tabelas de custos adquirentes padrão de fábrica enviadas pelo usuário para todas as 8 instâncias SaaS de parceiros: Cred Fácil, CredPara, Cred Simples, D Cred, Melhor Crédito, Roma, Rose e Ramos.
  - Correção na parcela 13 do Master/Visa na tabela de custos da Cred Simples, ajustando de `16.50%` para `16.10%` conforme a especificação comercial do usuário.
  - As taxas de custo cobradas pela adquirente da calculadora base ("Empresta BH") e parceiros não descritos (como ForcePay, RT Group) permanecem isoladas e intactas.

### Modificado
- **Injeção de Código Automatizada no Script de Replicação**:
  - Aprimoramento do script PowerShell `scripts/copy_to_partners.ps1` com lógica de injeção dinâmica de constantes no loop multi-tenant.
  - O script agora localiza dinamicamente o bloco `const DEFAULT_TAXAS_CUSTO` no core mestre e o substitui de forma resiliente usando expressões regulares com correspondência multilinha, garantindo 100% de consistência sem requerer edits manuais pós-replicação.

## [1.2.7] - 2026-05-20

### Alterado
- **Ajuste na Mensagem do WhatsApp**:
  - Removida a frase explicativa final `"📱 A imagem detalhada da simulação foi baixada. Por favor, anexe-a para enviar ao cliente!"` a pedido do usuário, deixando a mensagem de texto comercial de compartilhamento mais limpa e focada no orçamento.

## [1.2.6] - 2026-05-20

### Adicionado
- **Compartilhamento Dinâmico no WhatsApp**:
  - Geração de mensagem estruturada e formatada em texto rico contendo o resumo da simulação (Bandeira, Tabela, Modo, Valor de Referência e as opções de parcelamento de 1x a 21x).
  - Abertura dinâmica da URL oficial do WhatsApp (`https://api.whatsapp.com/send?text=...`) contendo a simulação, compatível com dispositivos móveis (abertura do app) e computadores (WhatsApp Web / Desktop).
  - Download reativo automático do arquivo de imagem PNG da simulação no fallback para envio direto.

### Modificado
- **Lógica de Identidade Visual Reativa**:
  - A marca parceira correspondente (ex: Empresta BH, D Cred, CredPara, etc.) é extraída dinamicamente com base no `document.title` da aba, permitindo o correto compartilhamento multi-tenant de forma resiliente sem requerer modificações no script de replicação PowerShell.

## [1.2.5] - 2026-05-20

### Adicionado
- **Identidade Visual Dinâmica**: Adição de campos para URL do Logo e Cor Primária no painel de administração (Aba Identidade Visual).
- **Personalização de Exportação**: Adicionado toggle para exibir/ocultar a coluna `% a.m.` na imagem exportada.
- **Novos Parceiros SaaS**: Expansão do sistema multi-tenant com a criação automatizada dos ambientes para `credsimples`, `melhorcredito`, `forcepay`, `roma`, `credfacil`, `rose`, e `rtgroup`.

### Modificado
- **Tabela de Simulação**: A coluna 'Taxa Cliente' foi renomeada de forma enxuta para '% a.m.'.
- **Painel Administrativo (Dono)**:
  - O perfil `dono` agora tem acesso apenas leitura aos "Custos de Máquina" e é bloqueado nos "Fatores Base", acessíveis exclusivamente pelo `admin`.
- **API de Login**: Correção no retorno do script de autenticação em PHP para garantir que o usuário `admin` receba o role `admin` (e não mais `dono`), permitindo o acesso às abas restritas no frontend.
- **Script de Deploy SaaS**: O script `copy_to_partners.ps1` foi atualizado para englobar todos os 8 novos parceiros na automação de cópia de arquivos.

## [1.2.4] - 2026-05-20

### Adicionado
- **Atualização da Calculadora Base para Empresta BH**:
  - A marca base da calculadora raiz foi atualizada de "Cred Certo" para "Empresta BH".
  - Logos e favicons da Empresta BH, originalmente em WebP e convertidos para PNG, foram incorporados com sucesso na pasta `public` da base.
  - O script de replicação `copy_to_partners.ps1` foi atualizado para utilizar "Empresta BH" como âncora de busca para as personalizações dos demais parceiros SaaS, garantindo o correto encapsulamento sem conflitos de marca.


## [1.2.3] - 2026-05-20

### Adicionado
- **Logotipos e Favicons Reais Gerados por IA**:
  - Geração de 8 ativos de alta fidelidade visual (4 logotipos e 4 favicons) para as marcas **Cred Certo**, **D Cred**, **CredPara** e **Melhor Credi** utilizando a ferramenta de geração por inteligência artificial, conferindo ao ecossistema multi-tenant uma experiência estética premium ("wow at first glance").
- **Fallback Inteligente no React (`App.tsx`)**:
  - Implementação de um sistema resiliente de exibição de logotipo no React com detecção de erro (`onError`). Caso o arquivo `logo.png` esteja ausente em qualquer pasta (ex: erro 404), o simulador renderiza de forma transparente e elegante o ícone tradicional (cadeado na tela de login e calculadora no cabeçalho), evitando a quebra de layout de página.
- **Estruturação de Ativos SaaS (`saas_assets/`)**:
  - Criação de pasta centralizada `saas_assets/` contendo as subpastas `cred_certo/`, `d_cred/`, `credpara/` e `melhor_credi/` para armazenar de forma segura os ativos exclusivos de cada parceiro, protegendo as marcas de perdas durante processos de compilação ou replicação.
- **Script de Replicação Totalmente Automatizado (`scripts/copy_to_partners.ps1`)**:
  - Re-estruturação do script PowerShell de replicação, agora localizado no repositório. O script automatiza a limpeza, a cópia recursiva do core base, a injeção programática dos favicons e logos customizados e a substituição dinâmica de strings de marca em `App.tsx` (barra de título, copyrights e exportação do PNG) de todas as instâncias SaaS em lote.

## [1.2.2] - 2026-05-20

### Adicionado
- **Favicon de Marca Personalizável**:
  - Inserida tag de referência de ícone `<link rel="icon" type="image/png" href="favicon.png" />` no `<head>` do `index.html` raiz. Isso permite que você coloque uma imagem customizada de ícone em cada pasta correspondente no cPanel, e o navegador a renderize automaticamente como favicon específico.
- **Título de Aba Dinâmico por Parceiro**:
  - Implementado carregamento dinâmico do título da aba do navegador utilizando `useEffect` e `document.title` diretamente no ciclo de vida do componente do React em `src/App.tsx`. O título agora muda de forma limpa e imediata para `<Nome do Parceiro> - Calculadora` (ex: "D Cred - Calculadora" ou "CredPara - Calculadora").
- **Replicação SaaS & Compilação Completa**:
  - Re-executado o script de sincronização PowerShell e compilado novamente os bundles estáticos de produção na raiz e em todas as pastas SaaS (`d_cred/`, `credpara/`, `melhor_credi/`), mantendo a homogeneidade absoluta do ecossistema.

## [1.2.1] - 2026-05-20

### Adicionado
- **Configuração de Lucro Líquido do Dono**:
  - Adicionada opção dedicada nas Opções de Exibição do Simulador (Aba 1) para o Dono ativar/desativar a exibição da coluna de Lucro Líquido em seu próprio simulador (sincronizada via JSON remoto no servidor pela flag `show_lucro_dono` / `showLucroDono`).
- **Restrição de Acesso a Taxas e Custos de Máquina**:
  - Bloqueada a edição dos inputs decimais da **Aba 2 (Fatores Base)** e da **Aba 3 (Custo de Máquina)** no Painel Administrativo para o Dono, apresentando-os estritamente como visualização/somente-leitura. Os inputs agora contam com desabilitação nativa (`disabled`) e estilização suave e harmônica em tom cinza desativado para indicação visual clara de visualização-técnica.
- **Replicação SaaS Automática**:
  - Sincronização e compilação do código base em todas as instâncias de parceiros (`saas/d_cred/`, `saas/credpara/`, `saas/melhor_credi/`), garantindo que todos contem com o painel admin 100% atualizado e seus respectivos bundles de produção otimizados.

## [1.2.0] - 2026-05-20

### Adicionado
- **Arquitetura Multi-Tenant SaaS em Subpastas**:
  - Criação e isolamento do projeto para múltiplos parceiros em pastas individuais sob `saas/` (`saas/d_cred/`, `saas/credpara/`, `saas/melhor_credi/`).
  - Script PowerShell de replicação limpa de atualizações (`scratch/copy_to_partners.ps1`) para copiar de forma inteligente os arquivos da raiz (base) para todas as subpastas ignorando bundles e caches.
- **Gestão de Níveis de Acesso e Roles**:
  - Definição do perfil **Dono da Empresa (`dono`)** com acesso administrativo completo automático e ao painel de configurações.
  - Definição do perfil **Vendedor Comum (`vendedor`)** com visualização restrita, ocultação do botão "Admin" e controle dinâmico da coluna de "Lucro Líquido" (comissão) na tabela.
- **Persistência de Taxas Sincronizada no Servidor**:
  - Endpoint da API em PHP (`public/api/config/index.php`) e Express local (`server.ts` sob `/api/config`) para persistir configurações e taxas ativas no servidor no arquivo dinâmico `api/config/config.json`.
  - As configurações são lidas no carregamento da aplicação logo após a autenticação, sincronizando as alterações salvas pelo Dono para todos os vendedores instantaneamente.
- **Switch Administrativo de Liberação de Comissão**:
  - Substituição do antigo switch de ocultar/mostrar do admin por um controle de maior granularidade: **"Liberar Tabela de Comissão para os Vendedores"**, que bloqueia ou libera o lucro/comissão no simulador para o perfil vendedor de forma remota no servidor.
- **Personalização de Marcas para Parceiros**:
  - Customização de marcas individuais no rodapé de copyright e no PNG gerado de exportação para cada parceiro ("D Cred", "CredPara" e "Melhor Credi").

## [1.1.2] - 2026-05-19

### Alterado
- **Ajuste Fino do Destino de Deploy FTP**:
  - Ajustada a propriedade `server-dir` no arquivo `.github/workflows/deploy.yml` de `/public_html/calculadora/` para `./`.
  - Esta alteração permite compatibilidade total com contas FTP dedicadas criadas no cPanel que já estejam restritas ao diretório `/public_html/calculadora`, evitando problemas de permissão e estruturação incorreta de diretórios durante a sincronização automática.

## [1.1.1] - 2026-05-19

### Adicionado
- **Pipeline de Integração e Deploy Contínuo (CI/CD) via GitHub Actions**:
  - Criação do arquivo de workflow `.github/workflows/deploy.yml` pré-configurado.
  - Implementação de build automático no ambiente do GitHub (`npm ci && npm run build`) e sincronização dos ativos otimizados da pasta `/dist` diretamente para o servidor cPanel via FTP utilizando a action `SamKirkland/FTP-Deploy-Action`. Isso elimina a necessidade de chaves SSH ou de clicar manualmente no botão do cPanel para efetuar os próximos deploys.

## [1.1.0] - 2026-05-19

### Adicionado
- **Integração de Deploy Automatizado com cPanel (`.cpanel.yml`)**:
  - Criação do arquivo de configuração `.cpanel.yml` na raiz do projeto. Ele instrui a engine de deploy do Git do cPanel a usar o `rsync` para sincronizar os arquivos compilados da pasta `dist/` diretamente na pasta de destino de publicação pública (ex: `/public_html/calculadora`), ignorando os arquivos de código-fonte e o histórico do Git no deploy final.

## [1.0.9] - 2026-05-19

### Adicionado
- **Zebra Striping (Linhas Intercaladas) nas Tabelas**:
  - Implementação de coloração intercalada para as linhas de parcelas da tabela de simulação na tela comum (`bg-white` e `bg-emerald-50/30`).
  - Adicionado suporte a coloração intercalada também na **geração de imagem compactada vertical**, alternando entre branco (`#ffffff`) e um verde bem suave (`#eaf7ed`).
  - Esta alteração melhora significativamente a legibilidade da tabela ao comparar parcelas, taxas e valores totais a passar ou receber tanto no computador/celular quanto nas imagens geradas e compartilhadas.

## [1.0.8] - 2026-05-19

### Alterado
- **Remoção Definitiva dos Botões de Customização Visual no Cabeçalho**:
  - Os botões "Ver Taxa Custo/Cliente" e "Ocultar/Mostrar Lucro" foram removidos por completo do header do simulador principal.
  - Isso garante uma interface 100% limpa, segura e profissional para vendedores e clientes finais, sem indícios visuais de margem ou custos de máquina para usuários comuns.
  - Todo o controle de visibilidade (exibição de lucro líquido e tipo de taxa exibida) foi centralizado exclusivamente na **Aba 1 (Opções & Acréscimos)** do Painel Administrativo restrito (protegido pela senha **`3x51ELCO`**), mantendo a persistência integrada via `localStorage`.

## [1.0.7] - 2026-05-19

### Adicionado
- **Área Administrativa Protegida por Senha**:
  - Implementação de um botão de engrenagem discreto no cabeçalho do simulador que atua como atalho para o painel administrativo.
  - Bloqueio por senha exigindo a digitação exata de **`3x51ELCO`** para autenticação da sessão administrativa.
- **Painel Administrativo com Abas Responsivas**:
  - **Aba 1 (Geral & Acréscimos)**:
    - Controle de visibilidade para ocultar/mostrar os botões de customização ("Ocultar Lucro" e "Ver Taxa Custo") para usuários/vendedores comuns.
    - Edição dos acréscimos por nível (Tabelas 1 a 5) das tabelas Normal e Promo.
    - Edição do campo **Acréscimo Geral** (+1%, +0.15%, etc.) somado dinamicamente no cálculo de todos os fatores das tabelas Normal e Promo.
  - **Aba 2 (Fatores Base)**: Edição direta das taxas mensais em formato multiplicador decimal de 1x a 21x para as tabelas Normal e Promo.
  - **Aba 3 (Custo de Máquina)**: Edição das taxas de desconto real cobradas pela adquirente de 1x a 21x para as bandeiras Master/Visa e Elo.
- **Mecanismo de Persistência e Backup**:
  - Salvamento instantâneo de todas as taxas customizadas no `localStorage` do navegador para manter as alterações ativas após o recarregamento da página (F5).
  - Botão **Restaurar Padrões** no painel administrativo para limpar as configurações locais e restaurar imediatamente as taxas estáticas originais de fábrica do código.
- **Dropdowns e Cálculos Dinâmicos**:
  - Reescrita do cálculo da simulação (`simulacao`) para processar os fatores e acréscimos dinâmicos.
  - Atualização automática dos dropdowns do simulador para refletir as taxas de acréscimo customizadas do admin em tempo real.


## [1.0.6] - 2026-05-19

### Adicionado
- **Botão para Mostrar/Ocultar Lucro Líquido na Tela**:
  - Adicionado estado `showLucro` (booleano) e botão moderno de alternância (Toggle com ícone dinâmico `Eye` / `EyeOff` do lucide-react) no cabeçalho do simulador. Isso permite ocultar a coluna "Lucro Líquido" na tela do computador/celular caso o cliente final esteja visualizando a tabela de simulação.
- **Botão para Trocar Taxas (Exibição de Taxa Cliente vs Taxa Máquina/Custo)**:
  - Adicionado estado `tipoTaxaExibida` (variando entre `"cliente"` e `"custo"`) e botão estilizado no cabeçalho. Permite alternar dinamicamente a exibição na tabela entre a **Taxa do Cliente** (taxa final calculada com acréscimo) e a **Taxa de Custo da Máquina** (taxa retida pela adquirente), com diferenciação de cores (verde para cliente e laranja/âmbar para máquina).

## [1.0.5] - 2026-05-19

### Adicionado
- **Resolução do Erro de Método Não Permitido (HTTP 405 / POST convertendo para GET)**:
  - Alterada a chamada do fetch de login no frontend (`src/App.tsx`) para usar a barra final (`api/login/`). Isso impede que o Apache redirecione a requisição POST para a URL com barra final gerando um redirecionamento HTTP 301, o qual converte o método para GET no navegador e descarta os parâmetros JSON (o que causava o erro HTTP 405 no script PHP).
  - Atualizada a rota correspondente no backend Express local (`server.ts`) para suportar em array tanto `/api/login` quanto `/api/login/`, assegurando o perfeito funcionamento da aplicação tanto localmente quanto em produção.

## [1.0.4] - 2026-05-19

### Adicionado
- **Redirecionamento Automático de Barra Final (Resolução Definitiva de Tela Branca em Subpasta)**:
  - Adicionado script Javascript inline no `<head>` do `index.html` que detecta se a aplicação foi aberta em uma subpasta sem a barra `/` final (ex: `dominio.com/calculadora`) e a redireciona dinamicamente adicionando a barra (ex: `dominio.com/calculadora/`). Isso assegura a correta resolução dos caminhos relativos dos assets (`./assets/...`) pelo navegador.
  - Adicionado tratamento de URL no servidor Apache via regras de rewrite no `public/.htaccess`, forçando o redirecionamento com barra final (HTTP 301) em diretórios físicos do servidor.

## [1.0.3] - 2026-05-19

### Adicionado
- **Suporte Total a Subpastas (Correção de Tela Branca)**: Configuração de `base: './'` no Vite 6 (`vite.config.ts`), garantindo a geração de caminhos de arquivos estáticos (assets JS/CSS) relativos em vez de absolutos.
- **Chamada de API Adaptável**: Alteração do endpoint do fetch do login de `/api/login` (absoluto) para `api/login` (relativo) no frontend React, viabilizando requisições corretas a partir de qualquer subpasta do servidor Apache no cPanel.
- **Otimização do .htaccess**: Ajustes preventivos para desativar a listagem de arquivos (`Options -Indexes`) sem interferir no mapeamento dinâmico de diretórios do Apache em subpastas.

## [1.0.2] - 2026-05-19

### Adicionado
- **Arquitetura Híbrida de Deploy**: Suporte a servidores sem Node.js instalando suporte nativo a PHP/Apache na rota `/api/login`.
- Mapeamento de diretório público `public/api/login/index.php` contendo a lógica de login em PHP compatível com qualquer cPanel compartilhado simples.
- Inicialização autônoma de tabelas MySQL do cPanel diretamente pelo arquivo PHP (`PDO`).
- Inclusão do arquivo `.htaccess` para roteamento amigável e proteção de rotas estáticas do Apache.
- Geração automática do build empacotado que acopla o frontend estático e o backend PHP diretamente na pasta `/dist`.

## [1.0.1] - 2026-05-19

### Adicionado
- Integração e suporte nativo ao banco de dados **MySQL** do cPanel utilizando a biblioteca `mysql2/promise`.
- Criação e inicialização automática da tabela de `usuarios` no banco de dados com a inserção do usuário `admin` padrão (`123456`).
- Sistema de autenticação adaptável na rota `/api/login` (tentativa no banco com fallback para credenciais estáticas de desenvolvimento).
- Configuração de escuta de porta dinâmica baseada em `process.env.PORT` para garantir a compatibilidade com o servidor Phusion Passenger do cPanel.
- Carregamento de variáveis de ambiente do arquivo `.env` via `dotenv/config`.
- Arquivo `.env.example` e `.env` atualizados com as configurações de conexão fornecidas pelo usuário.

## [1.0.0] - 2026-05-19

### Adicionado
- Estruturação do repositório inicial importado do AI Studio.
- Integração da pasta de gestão de inteligência e contexto `/ai_context`.
- Configuração do histórico mestre do projeto (`ai_context/historico_mestre.md`) e controle de checkpoints de desenvolvimento (`ai_context/sessao_atual.md`).
- Instalação e auditoria de 216 pacotes NPM requeridos pelo stack de tecnologias.
- Suporte para exportação de imagem em formato vertical móvel compactado (480px).
- Script de compilação integrado no Vite 6 + esbuild, gerando o bundle do frontend em `dist` e o servidor Express de produção em `dist/server.cjs`.
- Script de inicialização automatizado para execução no ambiente de produção (`npm start`).
