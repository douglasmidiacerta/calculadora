# Arquitetura — Simulador de Vendas e Taxas (Calculadora)

## Visão Geral
SPA React (Vite) com servidor Node/Express. Calculadora de simulação de vendas no cartão de crédito com parcelamento de 1x a 21x, cálculo de taxas (cliente vs. custo da máquina) e lucro líquido. Autenticação contra MySQL (cPanel) com fallback estático local.

## Stack
- **Frontend**: React 19, Vite 6, TypeScript ~5.8, Tailwind CSS 4 (via `@tailwindcss/vite`), lucide-react, html-to-image, motion.
- **Backend**: Express 4 (`server.ts`, rodado via `tsx` em dev; bundle esbuild → `dist/server.cjs` em prod). Em produção cPanel sem Node, há fallback em PHP (`public/api/login/index.php` e `public/api/config/index.php`).
- **DB**: MySQL (`mysql2`) no cPanel.

## Scripts (package.json)
- `npm run dev` — Express + Vite middleware via tsx.
- `npm run lint` — `tsc --noEmit` (type-check, usado como verificação).
- `npm run build` — `vite build` + esbuild do `server.ts`.
- `npm run start` — `node dist/server.cjs`.
- Sem suíte de testes automatizada (verificação manual no browser).

## Padrão Multi-Tenant SaaS
- A raiz (`src/App.tsx`, `server.ts`) é o **template mestre** (marca: **Empresta BH**, `STORAGE_PREFIX = "emprestabh_"`).
- Cada parceiro tem cópia isolada em `saas/<chave>/`, **gerada** por `scripts/copy_to_partners.ps1` (não editar à mão).
- O script: apaga/recria cada `saas/<parceiro>`, copia o core, faz replaces de marca (título, `STORAGE_PREFIX`, copyright, header do PNG), injeta `DEFAULT_TAXAS_CUSTO` por parceiro e copia `logo.png`/`favicon.png` de `saas_assets/<parceiro>/`.
- **Regra**: toda mudança em `src/App.tsx`/`server.ts` exige rodar `copy_to_partners.ps1` e rebuildar os tenants antes do deploy.
- **ForcePay é exceção**: existe em `saas/forcepay/` e é deployado, mas **não** está no hash `$partners` do script — é uma cópia congelada (core mais antigo, sem `STORAGE_PREFIX`). Mudanças no core precisam ser aplicadas manualmente nele.

### Hash de parceiros (script)
`d_cred, credpara, melhorcredito, credsimples, roma, credfacil, rose, rtgroup, ramos, cashcerto` (10). Fora do hash: `forcepay`.

## Flags de Configuração por Tenant (constantes no topo de `src/App.tsx`)
- `STORAGE_PREFIX` — prefixo de localStorage para isolamento multi-tenant (injetado por parceiro).
- `MOSTRAR_TABELA_OFERTA` — controla a exibição do seletor "Tabela Oferta (Promo)". Base e `cashcerto` = `true`; demais = `false` (injetado pelo script). v1.3.5.

## Isolamento de LocalStorage
Todas as leituras/escritas passam por `getStorageItem`/`setStorageItem`/`removeStorageItem`, que prefixam `STORAGE_PREFIX`. Evita vazamento de taxas/logos entre tenants no mesmo domínio cPanel.

## Fluxo de Configuração de Taxas
- `localStorage` como cache rápido no mount.
- `api/config/` (PHP em prod, `fs` no `server.ts` local) lê/grava `config.json`. No login o frontend faz GET e sobrescreve o cache; o `dono` faz POST ao salvar no Admin.

## Roles
- `dono` — acesso total, painel Admin (engrenagem), edita taxas/visibilidade/logo/cor. Auto-autenticado no admin ao logar.
- `vendedor` — só simulação, sem engrenagem. Visibilidade da coluna "Lucro Líquido" controlada pelo `dono` via `show_lucro_vendedor`.
- Login: `POST /api/login/` valida no MySQL, com fallback `dono/123456` e `vendedor/123456`.

## Motor de Cálculo (`simulacao`, useMemo em App.tsx)
21 linhas de parcelas. Por linha `i`:
```
fator = fatoresBase[i] + acrescimoNivel + acrescimoGeral
totalAPassar = valorDesejado * fator            (modo "valor")
valorParcela = totalAPassar / i
lucro = totalAPassar - custoMaquina - valorLiquido
```
Tabelas "Normal" e "Promo" usam dicionários `fatoresBase`/`acrescimos` separados. `tipoTabela` (`"normal" | "promo"`) inicia em `"normal"` e não é persistido em localStorage.

## Deploy
GitHub Actions (`.github/workflows/deploy.yml`) em push para `main`: builda raiz + todos os tenants e faz deploy FTP para diretórios separados no mesmo cPanel (raiz → `./`, `saas/<x>/dist` → `./<x>/`). Segredos: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Empacotamento / Convenções
- ZIP de distribuição: `antigravity-v{version}.zip` (gerado com `tar`, excluindo `node_modules`/`.git`). `*.zip` está no `.gitignore`.
- Marca em exports dinâmicos: extrair de `document.title.split(' - ')[0]` (não hardcodar strings por tenant).
