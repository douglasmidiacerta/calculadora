# Especificação Completa — Calculadora de Simulação de Cartão de Crédito

Use este documento para recriar o projeto do zero em qualquer stack.

---

## 1. Visão Geral

Aplicativo web para **simulação de vendas parceladas no cartão de crédito** usado por operadores (vendedores) de crédito. O sistema calcula quanto o cliente paga por parcela, o total que passa na maquininha e o lucro líquido do operador em cada número de parcelas (1x a 21x).

### Stack atual
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend (dev):** Express + tsx (Node)
- **Backend (produção cPanel):** PHP (endpoints simples de leitura/escrita de JSON)
- **Animações:** motion/react (Framer Motion)
- **Export PNG:** html-to-image
- **Ícones:** lucide-react
- **Banco de dados:** MySQL (apenas para autenticação de usuários)

---

## 2. Tabelas de Taxas (Dados Padrão de Fábrica)

### 2.1 Fatores Base — Tabela NORMAL
São multiplicadores aplicados ao valor para calcular o total a passar.

| Parcelas | Fator Base Normal |
|----------|-------------------|
| 1x       | 1.1580            |
| 2x       | 1.1586            |
| 3x       | 1.1660            |
| 4x       | 1.1733            |
| 5x       | 1.1806            |
| 6x       | 1.1878            |
| 7x       | 1.1899            |
| 8x       | 1.1969            |
| 9x       | 1.2038            |
| 10x      | 1.2107            |
| 11x      | 1.2176            |
| 12x      | 1.2243            |
| 13x      | 1.2564            |
| 14x      | 1.2679            |
| 15x      | 1.2744            |
| 16x      | 1.2809            |
| 17x      | 1.2874            |
| 18x      | 1.2939            |
| 19x      | 1.3204            |
| 20x      | 1.3269            |
| 21x      | 1.3334            |

### 2.2 Fatores Base — Tabela PROMO (Oferta)

| Parcelas | Fator Base Promo |
|----------|------------------|
| 1x       | 1.1208           |
| 2x       | 1.1278           |
| 3x       | 1.1356           |
| 4x       | 1.1434           |
| 5x       | 1.1510           |
| 6x       | 1.1586           |
| 7x       | 1.1622           |
| 8x       | 1.1696           |
| 9x       | 1.1770           |
| 10x      | 1.1842           |
| 11x      | 1.1914           |
| 12x      | 1.1985           |
| 13x      | 1.2055           |
| 14x      | 1.2124           |
| 15x      | 1.2193           |
| 16x      | 1.2210           |
| 17x      | 1.2328           |
| 18x      | 1.2395           |
| 19x      | 1.2416           |
| 20x      | 1.2466           |
| 21x      | 1.2516           |

### 2.3 Acréscimos por Nível de Tabela

Há 5 níveis de acréscimo para cada tipo de tabela. Esses valores são somados ao fator base antes do cálculo.

**Tabela Normal — Acréscimos (em decimal):**
| Nível | Acréscimo |
|-------|-----------|
| 1     | 0.00      |
| 2     | 0.01      |
| 3     | 0.02      |
| 4     | 0.03      |
| 5     | 0.04      |

**Tabela Promo — Acréscimos (em decimal):**
| Nível | Acréscimo |
|-------|-----------|
| 1     | 0.00      |
| 2     | 0.02      |
| 3     | 0.03      |
| 4     | 0.04      |
| 5     | 0.05      |

Além dos acréscimos por nível, existe um **Acréscimo Geral** configurável pelo dono (em %) que é somado a todas as parcelas de uma tabela. Padrão: 0%.

### 2.4 Taxas de Custo da Máquina — Bandeira Master/Visa (em %)

São as taxas reais cobradas pela operadora (adquirente) ao operador.

| Parcelas | Taxa % |
|----------|--------|
| 1x       | 2.99   |
| 2x       | 3.83   |
| 3x       | 4.48   |
| 4x       | 5.12   |
| 5x       | 5.76   |
| 6x       | 6.39   |
| 7x       | 7.21   |
| 8x       | 7.83   |
| 9x       | 8.44   |
| 10x      | 9.05   |
| 11x      | 9.66   |
| 12x      | 10.25  |
| 13x      | 11.64  |
| 14x      | 12.23  |
| 15x      | 12.81  |
| 16x      | 13.39  |
| 17x      | 13.96  |
| 18x      | 14.53  |
| 19x      | 14.72  |
| 20x      | 15.35  |
| 21x      | 15.98  |

### 2.5 Taxas de Custo da Máquina — Bandeira Elo (em %)

| Parcelas | Taxa % |
|----------|--------|
| 1x       | 3.69   |
| 2x       | 4.87   |
| 3x       | 5.52   |
| 4x       | 6.16   |
| 5x       | 6.80   |
| 6x       | 7.43   |
| 7x       | 8.84   |
| 8x       | 9.46   |
| 9x       | 10.07  |
| 10x      | 10.68  |
| 11x      | 11.28  |
| 12x      | 11.88  |
| 13x      | 12.47  |
| 14x      | 13.06  |
| 15x      | 13.64  |
| 16x      | 14.22  |
| 17x      | 14.79  |
| 18x      | 15.36  |
| 19x      | 15.52  |
| 20x      | 16.15  |
| 21x      | 16.78  |

---

## 3. Motor de Cálculo (Engine)

A tabela de simulação possui **21 linhas** (1x a 21x). Para cada linha `i`:

### 3.1 Fórmula do Fator Composto
```
fator = fatoresBase[i] + acrescimoNivel + (acrescimoGeral / 100)
```
- `fatoresBase[i]` → tabela selecionada (Normal ou Promo), parcela i
- `acrescimoNivel` → acréscimo do nível selecionado (1 a 5), em decimal
- `acrescimoGeral` → acréscimo geral configurado pelo dono, em %

### 3.2 Modo "Valor a Receber" (padrão)
O operador informa quanto o cliente quer **receber**:
```
totalAPassar = valorDesejado × fator
valorLiquido = valorDesejado
```

### 3.3 Modo "Limite do Cartão"
O operador informa o **limite disponível** no cartão (o total que vai passar):
```
totalAPassar = valorDesejado
valorLiquido = valorDesejado / fator
```

### 3.4 Valor da Parcela
```
valorParcela = totalAPassar / i
```

### 3.5 Custo da Máquina
```
custoMaquina = totalAPassar × (taxaCustoMaquina[bandeira][i] / 100)
```

### 3.6 Lucro Líquido
```
lucroLiquido = totalAPassar - custoMaquina - valorLiquido
```

### 3.7 Taxa % Exibida ao Cliente
```
taxaCliente = ((fator - 1) × 100) / i   →  formatada como "X,XX%"
```

### 3.8 Parcelas de Contingência
Parcelas acima de 18x são marcadas com flag "Contingência" na UI.

---

## 4. Opções de Configuração do Simulador

Todos os parâmetros de entrada disponíveis ao usuário na tela principal:

| Parâmetro         | Tipo     | Opções / Valores                   | Padrão        |
|-------------------|----------|------------------------------------|---------------|
| Valor de Referência | número | qualquer valor positivo             | 1000.00       |
| Modo de Simulação | enum     | `"valor"` / `"limite"`             | `"valor"`     |
| Tipo de Tabela    | enum     | `"normal"` / `"promo"`             | `"normal"`    |
| Nível de Acréscimo| enum     | `"1"` / `"2"` / `"3"` / `"4"` / `"5"` | `"5"` |
| Bandeira          | enum     | `"Master/Visa"` / `"Elo"`          | `"Master/Visa"` |

---

## 5. Roles de Usuário e Autenticação

### 5.1 Roles
| Role       | Permissões |
|------------|------------|
| `vendedor` | Só visualiza o simulador. Não vê o botão Admin. A coluna de Lucro Líquido é controlada remotamente pelo dono. |
| `dono`     | Acesso total ao simulador + Painel Admin completo. Autenticado automaticamente no admin ao fazer login. |
| `admin`    | Mesmo que `dono` + acesso à aba "Fatores Base" e "Custo de Máquina" (read-only) no Painel Admin. |

### 5.2 Fluxo de Login
1. Tela de login com campos Usuário e Senha.
2. `POST /api/login/` com `{ username, password }`.
3. Resposta: `{ success: true, token: "mock-jwt-token", role: "dono"|"vendedor" }`.
4. Salva `auth_token` e `user_role` no localStorage.
5. Se role for `dono`, seta `admin_authenticated = true` automaticamente.

### 5.3 Credenciais de Fallback (dev/offline)
- `dono` / `123456` → role `dono`
- `vendedor` / `123456` → role `vendedor`
- `admin` / `123456` → role `dono` (com acesso às abas de leitura)

### 5.4 Segundo fator Admin (Painel)
Para roles `dono` que não foram autenticados automaticamente, existe uma senha de acesso extra ao Painel Admin:
- Senha: `3x51ELCO`
- Após digitar, `admin_authenticated` fica salvo no localStorage.

---

## 6. Sistema de Configuração (localStorage + Servidor)

### 6.1 Chaves do localStorage (prefixadas por `STORAGE_PREFIX`)
Todas as chaves são lidas/escritas com um prefixo de tenant, ex: `emprestabh_` + chave.

| Chave                             | Tipo          | Padrão                          |
|-----------------------------------|---------------|---------------------------------|
| `auth_token`                      | string        | (ausente = não autenticado)     |
| `user_role`                       | string        | `"vendedor"`                    |
| `admin_authenticated`             | string        | (ausente)                       |
| `simulador_fatores_normal`        | JSON          | DEFAULT_FATORES_BASE_NORMAL     |
| `simulador_fatores_promo`         | JSON          | DEFAULT_FATORES_BASE_PROMO      |
| `simulador_acrescimos_normal`     | JSON          | DEFAULT_ACRESCIMOS_NORMAL       |
| `simulador_acrescimos_promo`      | JSON          | DEFAULT_ACRESCIMOS_PROMO        |
| `simulador_acrescimo_geral_normal`| número        | 0                               |
| `simulador_acrescimo_geral_promo` | número        | 0                               |
| `simulador_taxas_custo`           | JSON          | DEFAULT_TAXAS_CUSTO             |
| `simulador_show_lucro_vendedor`   | boolean       | `false`                         |
| `simulador_show_lucro_dono`       | boolean       | `false`                         |
| `simulador_tipo_taxa_exibida`     | `"cliente"\|"custo"` | `"cliente"`            |
| `simulador_logo_url`              | string (base64) | `""`                          |
| `simulador_primary_color`         | string (hex)  | `"#059669"`                     |

### 6.2 Sincronização com Servidor
- **Ao fazer login:** `GET /api/config/` → resposta JSON com as configurações salvas → sobrescreve localStorage.
- **Ao salvar no Painel Admin:** `POST /api/config/` com payload JSON completo → servidor salva em `config.json`.
- O payload do POST tem as mesmas chaves: `fatores_normal`, `fatores_promo`, `acrescimos_normal`, `acrescimos_promo`, `acrescimo_geral_normal`, `acrescimo_geral_promo`, `taxas_custo`, `show_lucro_vendedor`, `show_lucro_dono`, `tipo_taxa_exibida`, `logo_url`, `primary_color`.

### 6.3 Proteção de Taxas Divergentes
Na sincronização do servidor, se `taxas_custo["Master/Visa"][1]` vier diferente do padrão de fábrica, as taxas são restauradas automaticamente para o padrão e sincronizadas de volta ao servidor em background.

---

## 7. Painel Administrativo

Acessível apenas para roles `dono` e `admin`. É um modal com 4 abas.

### Aba 1 — Opções & Acréscimos
**Toggles de visibilidade:**
- "Liberar Tabela de Comissão para Vendedores" → controla `show_lucro_vendedor`
- "Ativar Lucro Líquido no simulador do Dono" → controla `show_lucro_dono`
- "Ver Taxa de Custo da Máquina" → controla `tipo_taxa_exibida` (`"cliente"` ou `"custo"`)

**Acréscimos Gerais:**
- Campo numérico: "Acréscimo Geral — Tabela Normal (%)"
- Campo numérico: "Acréscimo Geral — Tabela Promo (%)"

**Acréscimos por Nível:**
- 5 campos para Tabela Normal (Tabela 1 a 5)
- 5 campos para Tabela Promo (Tabela 1 a 5)

### Aba 2 — Fatores Base (apenas role `admin`)
Exibição read-only dos 21 fatores base para Normal e Promo. O role `dono` vê mensagem de acesso restrito.

### Aba 3 — Custo de Máquina
- Role `admin`: tabela read-only com inputs de 21 linhas para Master/Visa e Elo.
- Role `dono`: tabela read-only em formato de spans (sem inputs).

### Aba 4 — Identidade Visual
- Upload de logo (arquivo de imagem) → comprimido para max 400×120px antes de salvar
- Seletor de cor primária (color picker + campo HEX)

### Rodapé do Painel
- Botão "Restaurar Padrões" → reseta tudo para valores de fábrica e sincroniza no servidor
- Botão "Cancelar"
- Botão "Salvar Alterações" → persiste no localStorage e sincroniza no servidor

---

## 8. Controle de Visibilidade da Coluna Lucro

| Condição                                            | Mostra coluna? |
|-----------------------------------------------------|----------------|
| Role `vendedor` + `show_lucro_vendedor = false`     | Não            |
| Role `vendedor` + `show_lucro_vendedor = true`      | Sim            |
| Role `dono` + `show_lucro_dono = false`             | Não            |
| Role `dono` + `show_lucro_dono = true`              | Sim            |
| Role `admin`                                        | Segue `show_lucro_dono` |

---

## 9. Tabela de Resultados

Colunas exibidas na tabela principal:

| Coluna      | Valor exibido                                             |
|-------------|-----------------------------------------------------------|
| Parcelas    | Badge circular: `Nx`                                      |
| Parcela     | `valorParcela` em BRL. Parcelas > 18x mostram flag "Cont." |
| Total       | `totalAPassar` (modo valor) ou `valorLiquido` (modo limite) |
| % a.m.      | `taxaCliente` ou `taxaCusto` dependendo de `tipo_taxa_exibida` |
| Lucro       | `lucroLiquido` em BRL com ícone TrendingUp/TrendingDown (condicional) |

Lucro positivo → cor primária. Lucro negativo → vermelho `#f43f5e`.

---

## 10. Sistema de Temas (Cor Dinâmica)

A cor primária (`primaryColor`, padrão `#059669`) é usada para gerar toda a paleta via uma função `mixColor(hex, mixHex, weight)` que interpola lineares entre duas cores.

**Variantes geradas:**
- `mixColor(primary, '#000000', 0.25)` → fundo escuro / texto escuro
- `mixColor(primary, '#000000', 0.12)` → fundo médio-escuro
- `primaryColor` → cor base
- `mixColor(primary, '#ffffff', 0.5)` → cor desabilitada
- `mixColor(primary, '#ffffff', 0.6)` → texto accent claro
- etc.

Implementado como um bloco `<style>` injetado dinamicamente no DOM com `useMemo` que reescreve todas as classes Tailwind emerald-* com as variantes computadas da cor primária.

---

## 11. Export para PNG

- Existe um `<div ref={exportRef}>` absolutamente posicionado, invisível (height: 0, overflow hidden, z-index -1), com largura fixa de **480px**.
- Quando o usuário clica "Gerar Imagem", usa `html-to-image`'s `toPng()` para renderizar esse div como PNG com `pixelRatio: 2`.
- Conteúdo do div de export:
  - Header com logo + bandeira + valor de referência
  - Tabela compacta: Parcelas / Parcela (R$) / Total / % a.m. (opcional)
  - Rodapé com data de geração
- O nome do arquivo gerado: `tabela-simulacao-{valor}.png`

---

## 12. Compartilhamento via WhatsApp

Fluxo do botão "WhatsApp":
1. Renderiza o `exportRef` como PNG via `toPng()`.
2. Converte PNG para `Blob` → `File`.
3. Extrai o nome da marca de `document.title.split(' - ')[0]`.
4. Monta mensagem de texto formatada com todos os dados da simulação.
5. Se `navigator.canShare({ files })` → usa Web Share API nativa (celular).
6. Fallback desktop: baixa a imagem + abre `https://api.whatsapp.com/send?text=...` em nova aba.

---

## 13. Máscara do Campo de Valor

O campo de valor usa `type="text"` com `inputMode="numeric"` e máscara manual:
```javascript
const handleValorChange = (e) => {
  let value = e.target.value.replace(/\D/g, "");
  const numericValue = (parseFloat(value) / 100).toFixed(2);
  setValorDesejado(numericValue);
};
```
Resultado: o usuário digita `100000` e vê `1000.00`.

---

## 14. Compressão de Logo

Antes de salvar no localStorage, a imagem de logo é redimensionada para no máximo **400×120px** via Canvas e convertida para PNG base64.

---

## 15. API do Backend

### POST /api/login/
**Request body:**
```json
{ "username": "dono", "password": "123456" }
```
**Response success:**
```json
{ "success": true, "token": "mock-jwt-token", "role": "dono" }
```
**Response fail:**
```json
{ "success": false, "message": "Usuário ou senha inválidos" }
```

### GET /api/config/
Retorna o JSON das configurações salvas no servidor (arquivo `config.json`). Retorna `{}` se não existir.

### POST /api/config/
**Request body:** objeto JSON com todas as configurações do simulador.
**Response:** `{ "success": true }` ou `{ "success": false, "message": "..." }`

---

## 16. Banco de Dados MySQL

Tabela `usuarios`:
```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'vendedor'
);
```
Usuários criados automaticamente na inicialização:
- `dono` / `123456` / role `dono`
- `vendedor` / `123456` / role `vendedor`
- `admin` / `123456` / role `dono`

---

## 17. Estrutura de Telas

### Tela de Login
- Header colorido (cor primária) com logo centralizado
- Formulário: campos Usuário + Senha + botão Entrar
- Mostra erro inline em caso de credenciais inválidas
- Rodapé com copyright da marca

### Tela Principal (após login)
1. **Header:** logo (esquerda) + botões de ação (direita)
   - Mobile: ícones dos botões primários + hambúrguer para ações secundárias
   - Desktop: todos os botões visíveis com texto

2. **Painel de Controles** (fundo cor primária):
   - Campo de valor grande (R$)
   - 4 selects: Modo, Tabela, Bandeira, Nível

3. **Tabela de Resultados** (21 linhas)

4. **Rodapé da tabela:** legenda de cores (Lucro Positivo / Prejuízo) + texto informativo

5. **Footer:** copyright + validade do orçamento (7 dias)

### Modais
- **Modal de senha Admin:** campo de senha simples (acesso extra ao painel)
- **Modal Painel Admin:** 4 abas, max-h-[90vh], scrollável internamente

---

## 18. Comportamentos Mobile

- `inputMode="numeric"` no campo de valor
- Header em linha única com hambúrguer
- Dropdown animado para ações secundárias (Mostrar %, Admin, Sair)
- Padding compacto na tabela (px-3 mobile vs px-6 desktop)
- Meta tags PWA: `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`

---

## 19. Variáveis de Ambiente

```
DB_HOST=localhost
DB_NAME=nome_do_banco
DB_USER=usuario_mysql
DB_PASSWORD=senha_mysql
PORT=3000
NODE_ENV=production
```

---

## 20. Notas de Implementação Importantes

1. **Sem testes automatizados** — validação é visual/manual.
2. **Token de auth é fake** (`"mock-jwt-token"`) — não há JWT real nem refresh.
3. **Senhas não são hasheadas** no banco — armazenamento em texto puro.
4. **O `config.json`** é um arquivo em disco — não usa banco para configurações.
5. **Acréscimos por nível** são armazenados em decimal (`0.01` = 1%), mas exibidos e editados em % na UI.
6. **Acréscimo Geral** é armazenado em % (`1.5` = 1.5%), dividido por 100 no cálculo.
7. **Formatação numérica** sempre em `pt-BR` (vírgula decimal, ponto milhar).
8. **Parcelas 19x-21x** consideradas "contingência" — não são suportadas por todas as operadoras.
9. A coluna "Total" na tabela muda de label dependendo do modo:
   - Modo valor → "Total a Passar" (quanto passa na máquina)
   - Modo limite → "Total a Receber" (quanto o cliente recebe líquido)
