/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DollarSign, FileText, CreditCard, TrendingUp, TrendingDown, Info, Calculator, Share2, LogIn, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

// --- DATA CONSTANTS ---
// ... (rest of the constants)

const fatoresBasePromo: Record<number, number> = {
  1: 1.1208, 2: 1.1278, 3: 1.1356, 4: 1.1434, 5: 1.1510, 
  6: 1.1586, 7: 1.1622, 8: 1.1696, 9: 1.1770, 10: 1.1842, 
  11: 1.1914, 12: 1.1985, 13: 1.2055, 14: 1.2124, 15: 1.2193, 
  16: 1.2210, 17: 1.2328, 18: 1.2395, 19: 1.2416, 20: 1.2466, 21: 1.2516
};

const acrescimosPromo: Record<string, number> = { "1": 0.00, "2": 0.02, "3": 0.03, "4": 0.04, "5": 0.05 };

const fatoresBaseNormal: Record<number, number> = {
  1: 1.1580, 2: 1.1586, 3: 1.1660, 4: 1.1733, 5: 1.1806, 
  6: 1.1878, 7: 1.1899, 8: 1.1969, 9: 1.2038, 10: 1.2107, 
  11: 1.2176, 12: 1.2243, 13: 1.2564, 14: 1.2679, 15: 1.2744, 
  16: 1.2809, 17: 1.2874, 18: 1.2939, 19: 1.3204, 20: 1.3269, 21: 1.3334
};

const acrescimosNormal: Record<string, number> = { "1": 0.00, "2": 0.01, "3": 0.02, "4": 0.03, "5": 0.04 };

const taxasCusto: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 2.99, 2: 3.83, 3: 4.48, 4: 5.12, 5: 5.76, 6: 6.39, 7: 7.21, 8: 7.83, 9: 8.44, 10: 9.05,
    11: 9.66, 12: 10.25, 13: 11.64, 14: 12.23, 15: 12.81, 16: 13.39, 17: 13.96, 18: 14.53,
    19: 14.72, 20: 15.35, 21: 15.98
  },
  "Elo": {
    1: 3.69, 2: 4.87, 3: 5.52, 4: 6.16, 5: 6.80, 6: 7.43, 7: 8.84, 8: 9.46, 9: 10.07, 10: 10.68,
    11: 11.28, 12: 11.88, 13: 12.47, 14: 13.06, 15: 13.64, 16: 14.22, 17: 14.79, 18: 15.36,
    19: 15.52, 20: 16.15, 21: 16.78
  }
};

type SimulationRow = {
  parcelas: number;
  valorParcela: number;
  totalAPassar: number;
  valorLiquido: number;
  lucro: number;
  custoMaquina: number;
  taxaDinamica: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('auth_token'));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [valorDesejado, setValorDesejado] = useState("1000.00");
  const [modoCalculo, setModoCalculo] = useState<"valor" | "limite">("valor");
  const [tipoTabela, setTipoTabela] = useState<"normal" | "promo">("normal");
  const [nivelTabela, setNivelTabela] = useState("5");
  const [bandeira, setBandeira] = useState("Master/Visa");
  const exportRef = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch('api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || "Credenciais inválidas");
      }
    } catch (err) {
      setLoginError("Erro ao conectar ao servidor");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleExport = async () => {
    if (exportRef.current === null) return;
    
    try {
      // Small delay to ensure any state changes are rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true,
        backgroundColor: '#dff0d8',
        pixelRatio: 2, // Higher quality
        style: {
          opacity: '1',
          visibility: 'visible',
        }
      });
      
      const link = document.createElement('a');
      link.download = `tabela-simulacao-${valorDesejado.replace('.', ',')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Falha ao exportar imagem:', err);
      alert('Erro ao gerar imagem. Tente novamente.');
    }
  };

  // Mask and set currency value
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const numericValue = (parseFloat(value) / 100).toFixed(2);
    setValorDesejado(numericValue);
  };

  const simulacao = useMemo<SimulationRow[]>(() => {
    const valorNum = parseFloat(valorDesejado) || 0;
    const fatoresBase = tipoTabela === 'normal' ? fatoresBaseNormal : fatoresBasePromo;
    const acrescimo = tipoTabela === 'normal' ? acrescimosNormal[nivelTabela] : acrescimosPromo[nivelTabela];
    
    if (valorNum <= 0) return [];

    return Array.from({ length: 21 }, (_, index) => {
      const i = index + 1;
      const fator = (fatoresBase[i] || 1) + (acrescimo || 0);

      const taxaDinamica = (((fator - 1) * 100) / i).toFixed(2).replace('.', ',') + '%';
      
      let totalAPassar, valorLiquido;
      
      if (modoCalculo === 'valor') {
        totalAPassar = valorNum * fator;
        valorLiquido = valorNum;
      } else {
        totalAPassar = valorNum;
        valorLiquido = valorNum / fator;
      }

      const valorParcela = totalAPassar / i;
      
      const percentualTaxaMaquina = taxasCusto[bandeira][i] || 0;
      const custoMaquina = totalAPassar * (percentualTaxaMaquina / 100);
      const lucroLiquido = totalAPassar - custoMaquina - valorLiquido;

      return {
        parcelas: i,
        valorParcela: valorParcela,
        totalAPassar: totalAPassar,
        valorLiquido: valorLiquido,
        lucro: lucroLiquido,
        custoMaquina: custoMaquina,
        taxaDinamica: taxaDinamica
      };
    });
  }, [valorDesejado, tipoTabela, nivelTabela, bandeira, modoCalculo]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="bg-emerald-800 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 mb-4 shadow-inner">
              <Lock size={32} className="text-emerald-300" />
            </div>
            <h2 className="text-2xl font-bold">Acesso Restrito</h2>
            <p className="text-emerald-100/60 text-sm mt-1">Identifique-se para acessar o simulador</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 rounded-xl border-2 border-slate-100 py-3.5 px-4 bg-slate-50 text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                  placeholder="Seu nome de usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 rounded-xl border-2 border-slate-100 py-3.5 px-4 bg-slate-50 text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                {loginError}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 group"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter">Cred Certo © {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans text-slate-800">
      <header className="max-w-4xl w-full mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 flex items-center gap-2">
            <Calculator className="text-emerald-600" />
            Simulador de Vendas
          </h1>
          <p className="text-slate-500 font-medium">Cálculo de taxas e lucro líquido em tempo real</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 group"
          >
            <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
            Gerar Imagem p/ Cliente
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl font-bold border border-slate-200 transition-all active:scale-95 shadow-sm"
            title="Sair do sistema"
          >
            <LogIn size={20} className="rotate-180" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Input Configuration Section */}
        <div className="bg-emerald-800 p-6 md:p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Value Column */}
            <div className="flex flex-col justify-center">
              <label htmlFor="valor-liberar" className="block text-sm font-semibold text-emerald-100/80 mb-2 uppercase tracking-wider">
                {modoCalculo === 'valor' ? 'VALOR A RECEBER PELO CLIENTE' : 'VALOR TOTAL A PASSAR'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign size={24} className="text-emerald-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  id="valor-liberar"
                  type="text"
                  value={valorDesejado}
                  onChange={handleValorChange}
                  className="w-full pl-12 rounded-2xl border-2 border-emerald-700/50 py-4 px-6 bg-emerald-900/40 text-white text-3xl font-bold placeholder-emerald-300 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all outline-none"
                />
              </div>
            </div>

            {/* Config Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">Modo de Simulação</label>
                  <select
                    value={modoCalculo}
                    onChange={(e) => setModoCalculo(e.target.value as "valor" | "limite")}
                    className="w-full rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                  >
                    <option value="valor">Valor a Receber</option>
                    <option value="limite">Limite do Cartão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">Tabela</label>
                  <select
                    value={tipoTabela}
                    onChange={(e) => setTipoTabela(e.target.value as "normal" | "promo")}
                    className="w-full rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                  >
                    <option value="normal">Tabela Normal</option>
                    <option value="promo">Tabela Oferta (Promo)</option>
                  </select>
                </div>
              </div>
                
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">Bandeira</label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" />
                    <select
                      value={bandeira}
                      onChange={(e) => setBandeira(e.target.value)}
                      className="w-full pl-10 rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                    >
                      <option value="Master/Visa">Master / Visa</option>
                      <option value="Elo">Elo (Taxa Maior)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">Nível do Acréscimo</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" />
                    <select
                      value={nivelTabela}
                      onChange={(e) => setNivelTabela(e.target.value)}
                      className="w-full pl-10 rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                    >
                      <option value="1">Tabela 1 (Base)</option>
                      <option value="2">Tabela 2 (+{tipoTabela === 'normal' ? '1%' : '2%'})</option>
                      <option value="3">Tabela 3 (+{tipoTabela === 'normal' ? '2%' : '3%'})</option>
                      <option value="4">Tabela 4 (+{tipoTabela === 'normal' ? '3%' : '4%'})</option>
                      <option value="5">Tabela 5 (+{tipoTabela === 'normal' ? '4%' : '5%'})</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table Section */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-600">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-center">Parcelas</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Valor da Parcela</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">{modoCalculo === 'valor' ? 'Total a Passar' : 'Total a Receber'}</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Taxa (% ao mês)</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right">Lucro Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence initial={false}>
                {simulacao.map((row, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    key={row.parcelas} 
                    className="hover:bg-emerald-50/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                        {row.parcelas}x
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-emerald-700 font-bold text-lg">{formatCurrency(row.valorParcela)}</span>
                        {row.parcelas > 18 && (
                          <span className="text-[10px] text-amber-600 font-semibold uppercase flex items-center gap-1">
                            <Info size={10} /> Contingência
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-semibold">{formatCurrency(modoCalculo === 'valor' ? row.totalAPassar : row.valorLiquido)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-emerald-700 font-bold">{row.taxaDinamica}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`flex flex-col items-end gap-1`}>
                        <div className={`inline-flex items-center gap-1.5 font-bold text-lg ${row.lucro >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {row.lucro >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          {formatCurrency(row.lucro)}
                        </div>
                        <span className="text-slate-400 text-[10px] font-medium">Margem Líquida</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Lucro Positivo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span>Prejuízo</span>
              </div>
            </div>
            <p className="font-medium italic">Simulação baseada nas taxas vigentes da adquirente.</p>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Esse orçamento é válido para 7 dias. Todos os direitos reservados.
      </footer>

      {/* --- EXPORTABLE AREA (MOBILE VERTICAL FORMAT - 480px) --- */}
      <div 
        style={{ 
          position: 'absolute',
          height: 0,
          overflow: 'hidden',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <div 
          ref={exportRef}
          style={{ 
            width: '480px', 
            height: 'max-content',
            backgroundColor: '#f0f9f1', // Verde muito claro
            padding: '24px 16px',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Summary */}
          <div style={{ 
            backgroundColor: '#065f46', 
            borderRadius: '14px',
            padding: '12px 20px',
            color: 'white',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.9, marginBottom: '2px' }}>
                SIMULAÇÃO: {bandeira.toUpperCase()}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>
                Cred Certo
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.9, marginBottom: '2px' }}>
                {modoCalculo === 'valor' ? 'VALOR A RECEBER' : 'VALOR TOTAL A PASSAR'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#6ee7b7' }}>
                {formatCurrency(parseFloat(valorDesejado))}
              </div>
            </div>
          </div>

          {/* Unified Single Table - Mobile Compact */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 3px', width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ color: '#065f46', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'left', width: '15%' }}>Parc.</th>
                  <th style={{ padding: '4px 2px', textAlign: 'center', width: '32%' }}>Parcela (R$)</th>
                  <th style={{ padding: '4px 2px', textAlign: 'right', width: '30%' }}>{modoCalculo === 'valor' ? 'Total a Passar' : 'Total a Receber'}</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', width: '23%' }}>Taxa (% ao mês)</th>
                </tr>
              </thead>
              <tbody>
                {simulacao.map((row) => (
                  <tr key={row.parcelas}>
                    <td style={{ 
                      padding: '6px 8px', 
                      textAlign: 'left', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px 0 0 8px',
                      color: '#065f46',
                      fontWeight: '800',
                      fontSize: '11px',
                      borderLeft: '1px solid #e2e8f0',
                      borderTop: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {row.parcelas}x
                    </td>
                    <td style={{ 
                      padding: '6px 4px', 
                      textAlign: 'center', 
                      backgroundColor: '#ffffff', 
                      color: '#065f46', 
                      fontWeight: '700', 
                      fontSize: '11px',
                      borderTop: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {row.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ 
                      padding: '6px 4px', 
                      textAlign: 'right', 
                      backgroundColor: '#ffffff', 
                      color: '#1e293b', 
                      fontWeight: '600', 
                      fontSize: '11px',
                      borderTop: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {(modoCalculo === 'valor' ? row.totalAPassar : row.valorLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ 
                      padding: '6px 8px', 
                      textAlign: 'right', 
                      backgroundColor: '#ffffff', 
                      color: '#047857', 
                      fontWeight: '800', 
                      fontSize: '10px', 
                      borderRadius: '0 8px 8px 0',
                      whiteSpace: 'nowrap',
                      borderRight: '1px solid #e2e8f0',
                      borderTop: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {row.taxaDinamica}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', textAlign: 'center', color: '#065f4688', fontSize: '11px', fontWeight: '600', borderTop: '2px solid #065f4611' }}>
            Gerado em {new Date().toLocaleDateString('pt-BR')} • Esse orçamento é válido para 7 dias
          </div>
        </div>
      </div>
    </div>
  );
}
