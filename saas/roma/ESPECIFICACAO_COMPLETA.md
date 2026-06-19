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

| Parâmetro           | Tipo   | Opções / Valores                           | Padrão        |
|---------------------|--------|--------------------------------------------|---------------|
| Valor de Referência | número | qualquer valor positivo                    | 1000.00       |
| Modo de Simulação   | enum   | `"valor"` / `"limite"`                     | `"valor"`     |
| Tipo de Tabela      | enum   | `"normal"` / `"promo"`                     | `"normal"`    |
| Nível de Acréscimo  | enum   | `"1"` / `"2"` / `"3"` / `"4"` / `"5"`     | `"5"`         |
| Bandeira            | enum   | `"Master/Visa"` / `"Elo"`                  | `"Master/Visa"` |

---

## 5. Sistema de Configuração (localStorage)

### 5.1 Chaves do localStorage (prefixadas por `STORAGE_PREFIX`)
Todas as chaves são lidas/escritas com um prefixo de tenant, ex: `emprestabh_` + chave.

| Chave                             | Tipo                  | Padrão                          |
|-----------------------------------|-----------------------|---------------------------------|
| `auth_token`                      | string                | (ausente = não autenticado)     |
| `user_role`                       | string                | `"vendedor"`                    |
| `admin_authenticated`             | string                | (ausente)                       |
| `simulador_fatores_normal`        | JSON                  | DEFAULT_FATORES_BASE_NORMAL     |
| `simulador_fatores_promo`         | JSON                  | DEFAULT_FATORES_BASE_PROMO      |
| `simulador_acrescimos_normal`     | JSON                  | DEFAULT_ACRESCIMOS_NORMAL       |
| `simulador_acrescimos_promo`      | JSON                  | DEFAULT_ACRESCIMOS_PROMO        |
| `simulador_acrescimo_geral_normal`| número                | 0                               |
| `simulador_acrescimo_geral_promo` | número                | 0                               |
| `simulador_taxas_custo`           | JSON                  | DEFAULT_TAXAS_CUSTO             |
| `simulador_show_lucro_vendedor`   | boolean               | `false`                         |
| `simulador_show_lucro_dono`       | boolean               | `false`                         |
| `simulador_tipo_taxa_exibida`     | `"cliente"\|"custo"`  | `"cliente"`                     |
| `simulador_logo_url`              | string (base64)       | `""`                            |
| `simulador_primary_color`         | string (hex)          | `"#059669"`                     |

### 5.2 Proteção de Taxas Divergentes
Na sincronização do servidor, se `taxas_custo["Master/Visa"][1]` vier diferente do padrão de fábrica, as taxas são restauradas automaticamente para o padrão e sincronizadas de volta ao servidor em background.

---

## 6. Tabela de Resultados

Colunas exibidas na tabela principal:

| Coluna  | Valor exibido                                                                                |
|---------|----------------------------------------------------------------------------------------------|
| Parcelas| Badge circular: `Nx`                                                                         |
| Parcela | `valorParcela` em BRL. Parcelas > 18x mostram flag "Cont."                                   |
| Total   | `totalAPassar` (modo valor) ou `valorLiquido` (modo limite)                                  |
| % a.m.  | `taxaCliente` ou `taxaCusto` dependendo de `tipo_taxa_exibida`                               |
| Lucro   | `lucroLiquido` em BRL com ícone TrendingUp/TrendingDown. **Visibilidade controlada por role e configuração do parceiro** (ver abaixo) |

### 6.1 Visibilidade da Coluna Lucro

A coluna Lucro pode ser **ativada ou desativada** independentemente por role, via configuração do parceiro (dono da conta):

| Role do usuário logado | Chave que controla a visibilidade  | Padrão    |
|------------------------|------------------------------------|-----------|
| `vendedor`             | `simulador_show_lucro_vendedor`    | `false`   |
| `dono` / `admin`       | `simulador_show_lucro_dono`        | `false`   |

- Quando `false`: a coluna Lucro é ocultada completamente da tabela.
- Quando `true`: a coluna é exibida com valor em BRL e ícone colorido (positivo = cor primária, negativo = vermelho `#f43f5e`).
- O dono do parceiro define essas configurações pelo Painel Admin e elas são persistidas no servidor, sincronizando para todos os dispositivos que fizerem login naquele parceiro.

---

## 7. Sistema de Temas (Cor Dinâmica)

A cor primária (`primaryColor`, padrão `#059669`) é usada para gerar toda a paleta via uma função `mixColor(hex, mixHex, weight)` que interpola linearmente entre duas cores.

**Variantes geradas:**
- `mixColor(primary, '#000000', 0.25)` → fundo escuro / texto escuro
- `mixColor(primary, '#000000', 0.12)` → fundo médio-escuro
- `primaryColor` → cor base
- `mixColor(primary, '#ffffff', 0.5)` → cor desabilitada
- `mixColor(primary, '#ffffff', 0.6)` → texto accent claro

Implementado como um bloco `<style>` injetado dinamicamente no DOM com `useMemo` que reescreve todas as classes Tailwind emerald-* com as variantes computadas da cor primária.

---

## 8. Export para PNG

- Existe um `<div ref={exportRef}>` absolutamente posicionado, invisível (height: 0, overflow hidden, z-index -1), com largura fixa de **480px**.
- Quando o usuário clica "Gerar Imagem", usa `html-to-image`'s `toPng()` para renderizar esse div como PNG com `pixelRatio: 2`.
- Conteúdo do div de export:
  - Header com logo + bandeira + valor de referência
  - Tabela compacta: Parcelas / Parcela (R$) / Total / % a.m. (opcional)
  - Rodapé com data de geração
- O nome do arquivo gerado: `tabela-simulacao-{valor}.png`

---

## 9. Compartilhamento via WhatsApp

Fluxo do botão "WhatsApp":
1. Renderiza o `exportRef` como PNG via `toPng()`.
2. Converte PNG para `Blob` → `File`.
3. Extrai o nome da marca de `document.title.split(' - ')[0]`.
4. Monta mensagem de texto formatada com todos os dados da simulação.
5. Se `navigator.canShare({ files })` → usa Web Share API nativa (celular).
6. Fallback desktop: baixa a imagem + abre `https://api.whatsapp.com/send?text=...` em nova aba.

---

## 10. Máscara do Campo de Valor

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

## 11. Compressão de Logo

Antes de salvar no localStorage, a imagem de logo é redimensionada para no máximo **400×120px** via Canvas e convertida para PNG base64.

---

## 12. Comportamentos Mobile

- `inputMode="numeric"` no campo de valor
- Header em linha única com hambúrguer
- Dropdown animado para ações secundárias (Mostrar %, Admin, Sair)
- Padding compacto na tabela (px-3 mobile vs px-6 desktop)
- Meta tags PWA: `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`

---

## 13. Notas de Implementação Importantes

1. **Sem testes automatizados** — validação é visual/manual.
2. **Token de auth é fake** (`"mock-jwt-token"`) — não há JWT real nem refresh.
3. **O `config.json`** é um arquivo em disco — não usa banco para configurações.
4. **Acréscimos por nível** são armazenados em decimal (`0.01` = 1%), mas exibidos e editados em % na UI.
5. **Acréscimo Geral** é armazenado em % (`1.5` = 1.5%), dividido por 100 no cálculo.
6. **Formatação numérica** sempre em `pt-BR` (vírgula decimal, ponto milhar).
7. **Parcelas 19x-21x** consideradas "contingência" — não são suportadas por todas as operadoras.
8. A coluna "Total" na tabela muda de label dependendo do modo:
   - Modo valor → "Total a Passar" (quanto passa na máquina)
   - Modo limite → "Total a Receber" (quanto o cliente recebe líquido)
9. **Coluna Lucro desativada por padrão** — o dono deve habilitá-la explicitamente por role (vendedor e/ou dono) nas configurações do parceiro.
