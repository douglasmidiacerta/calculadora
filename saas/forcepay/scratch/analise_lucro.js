const DEFAULT_FATORES_BASE_NORMAL = {
  1: 1.1580, 2: 1.1586, 3: 1.1660, 4: 1.1733, 5: 1.1806, 
  6: 1.1878, 7: 1.1899, 8: 1.1969, 9: 1.2038, 10: 1.2107, 
  11: 1.2176, 12: 1.2243, 13: 1.2564, 14: 1.2679, 15: 1.2744, 
  16: 1.2809, 17: 1.2874, 18: 1.2939, 19: 1.3204, 20: 1.3269, 21: 1.3334
};

const DEFAULT_FATORES_BASE_PROMO = {
  1: 1.1208, 2: 1.1278, 3: 1.1356, 4: 1.1434, 5: 1.1510, 
  6: 1.1586, 7: 1.1622, 8: 1.1696, 9: 1.1770, 10: 1.1842, 
  11: 1.1914, 12: 1.1985, 13: 1.2055, 14: 1.2124, 15: 1.2193, 
  16: 1.2210, 17: 1.2328, 18: 1.2395, 19: 1.2416, 20: 1.2466, 21: 1.2516
};

const DEFAULT_ACRESCIMOS_NORMAL = { "1": 0.00, "2": 0.01, "3": 0.02, "4": 0.03, "5": 0.04 };
const DEFAULT_ACRESCIMOS_PROMO = { "1": 0.00, "2": 0.02, "3": 0.03, "4": 0.04, "5": 0.05 };

const DEFAULT_TAXAS_CUSTO = {
  "Master/Visa": {
    1: 5.75, 2: 5.79, 3: 7.23, 4: 7.90, 5: 8.40, 6: 8.90, 7: 9.00, 8: 9.10, 9: 9.40, 10: 10.50,
    11: 10.70, 12: 11.00, 13: 12.00, 14: 13.00, 15: 14.00, 16: 14.50, 17: 15.50, 18: 16.00,
    19: 18.90, 20: 19.80, 21: 20.50
  },
  "Elo": {
    1: 6.75, 2: 6.79, 3: 8.23, 4: 8.90, 5: 9.40, 6: 9.90, 7: 10.00, 8: 10.10, 9: 10.40, 10: 11.50,
    11: 11.70, 12: 12.00, 13: 13.00, 14: 14.00, 15: 15.00, 16: 15.50, 17: 16.50, 18: 17.00,
    19: 19.90, 20: 20.80, 21: 21.50
  }
};

const valorNum = 1198.00;

console.log("=== ANÁLISE DE SIMULAÇÃO PARA R$ 1.198,00 ===");

const comb = [];

for (const modoCalculo of ['valor', 'limite']) {
  for (const tipoTabela of ['normal', 'promo']) {
    const fatoresBase = tipoTabela === 'normal' ? DEFAULT_FATORES_BASE_NORMAL : DEFAULT_FATORES_BASE_PROMO;
    const acrescimos = tipoTabela === 'normal' ? DEFAULT_ACRESCIMOS_NORMAL : DEFAULT_ACRESCIMOS_PROMO;
    
    for (const nivelTabela of ['1', '2', '3', '4', '5']) {
      const acrescimo = acrescimos[nivelTabela];
      
      for (const bandeira of ['Master/Visa', 'Elo']) {
        for (let i = 1; i <= 21; i++) {
          const fator = (fatoresBase[i] || 1) + (acrescimo || 0);
          
          let totalAPassar, valorLiquido;
          if (modoCalculo === 'valor') {
            totalAPassar = valorNum * fator;
            valorLiquido = valorNum;
          } else {
            totalAPassar = valorNum;
            valorLiquido = valorNum / fator;
          }
          
          const percentualTaxaMaquina = DEFAULT_TAXAS_CUSTO[bandeira][i] || 0;
          const custoMaquina = totalAPassar * (percentualTaxaMaquina / 100);
          const lucroLiquido = totalAPassar - custoMaquina - valorLiquido;
          
          comb.push({
            modoCalculo,
            tipoTabela,
            nivelTabela,
            bandeira,
            parcela: i,
            fator,
            totalAPassar,
            valorLiquido,
            custoMaquina,
            lucro: lucroLiquido
          });
        }
      }
    }
  }
}

// Procurar por lucro próximo de R$ 162,18 ou R$ 129,11
const matchLucroAtual = comb.filter(c => Math.abs(c.lucro - 162.18) < 1.0);
console.log("\nCombinações onde o lucro atual é próximo de R$ 162,18:");
matchLucroAtual.forEach(c => {
  console.log(`Modo: ${c.modoCalculo}, Tabela: ${c.tipoTabela}, Nível: ${c.nivelTabela}, Bandeira: ${c.bandeira}, ${c.parcela}x: Fator=${c.fator.toFixed(4)}, Total=${c.totalAPassar.toFixed(2)}, Liq=${c.valorLiquido.toFixed(2)}, CustoMaq=${c.custoMaquina.toFixed(2)}, Lucro=${c.lucro.toFixed(2)}`);
});

const matchLucroEsperado = comb.filter(c => Math.abs(c.lucro - 129.11) < 1.0);
console.log("\nCombinações onde o lucro esperado é próximo de R$ 129,11:");
matchLucroEsperado.forEach(c => {
  console.log(`Modo: ${c.modoCalculo}, Tabela: ${c.tipoTabela}, Nível: ${c.nivelTabela}, Bandeira: ${c.bandeira}, ${c.parcela}x: Fator=${c.fator.toFixed(4)}, Total=${c.totalAPassar.toFixed(2)}, Liq=${c.valorLiquido.toFixed(2)}, CustoMaq=${c.custoMaquina.toFixed(2)}, Lucro=${c.lucro.toFixed(2)}`);
});
