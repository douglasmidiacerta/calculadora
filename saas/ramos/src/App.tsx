/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  DollarSign, FileText, CreditCard, TrendingUp, TrendingDown, Info, 
  Calculator, Share2, LogIn, Lock, User, Eye, EyeOff, Settings, 
  RotateCcw, Save, X, Sliders, Check, SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

// --- DATA CONSTANTS (FACTORY DEFAULTS) ---

const DEFAULT_FATORES_BASE_PROMO: Record<number, number> = {
  1: 1.1208, 2: 1.1278, 3: 1.1356, 4: 1.1434, 5: 1.1510, 
  6: 1.1586, 7: 1.1622, 8: 1.1696, 9: 1.1770, 10: 1.1842, 
  11: 1.1914, 12: 1.1985, 13: 1.2055, 14: 1.2124, 15: 1.2193, 
  16: 1.2210, 17: 1.2328, 18: 1.2395, 19: 1.2416, 20: 1.2466, 21: 1.2516
};

const DEFAULT_ACRESCIMOS_PROMO: Record<string, number> = { "1": 0.00, "2": 0.02, "3": 0.03, "4": 0.04, "5": 0.05 };

const DEFAULT_FATORES_BASE_NORMAL: Record<number, number> = {
  1: 1.1580, 2: 1.1586, 3: 1.1660, 4: 1.1733, 5: 1.1806, 
  6: 1.1878, 7: 1.1899, 8: 1.1969, 9: 1.2038, 10: 1.2107, 
  11: 1.2176, 12: 1.2243, 13: 1.2564, 14: 1.2679, 15: 1.2744, 
  16: 1.2809, 17: 1.2874, 18: 1.2939, 19: 1.3204, 20: 1.3269, 21: 1.3334
};

const DEFAULT_ACRESCIMOS_NORMAL: Record<string, number> = { "1": 0.00, "2": 0.01, "3": 0.02, "4": 0.03, "5": 0.04 };

const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 5.50, 2: 6.00, 3: 6.60, 4: 7.40, 5: 8.00, 6: 8.70, 7: 9.50, 8: 10.00, 9: 9.80, 10: 11.50,
    11: 12.00, 12: 13.00, 13: 13.10, 14: 13.50, 15: 14.00, 16: 14.70, 17: 15.00, 18: 16.50,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 6.50, 2: 7.00, 3: 7.10, 4: 8.40, 5: 9.00, 6: 9.70, 7: 10.50, 8: 11.00, 9: 11.80, 10: 12.00,
    11: 13.00, 12: 13.60, 13: 14.10, 14: 14.50, 15: 15.00, 16: 15.70, 17: 16.00, 18: 17.50,
    19: 19.00, 20: 19.30, 21: 20.00
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

// Helper to compress and resize logo images to prevent storage quota issues and improve performance
const compressLogoImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
};

// Helper for local storage
const loadLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export default function App() {
  const [logoErro, setLogoErro] = useState(false);
  const [logoHeaderErro, setLogoHeaderErro] = useState(false);

  useEffect(() => {
    document.title = "Ramos - Calculadora";
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('auth_token'));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userRole, setUserRole] = useState<string>(() => 
    localStorage.getItem('user_role') || 'vendedor'
  );

  // --- DYNAMIC TAXES & CONTROLS STATES ---
  const [fatoresBaseNormalState, setFatoresBaseNormalState] = useState<Record<number, number>>(() => 
    loadLocalStorage('simulador_fatores_normal', DEFAULT_FATORES_BASE_NORMAL)
  );
  const [fatoresBasePromoState, setFatoresBasePromoState] = useState<Record<number, number>>(() => 
    loadLocalStorage('simulador_fatores_promo', DEFAULT_FATORES_BASE_PROMO)
  );
  const [acrescimosNormalState, setAcrescimosNormalState] = useState<Record<string, number>>(() => 
    loadLocalStorage('simulador_acrescimos_normal', DEFAULT_ACRESCIMOS_NORMAL)
  );
  const [acrescimosPromoState, setAcrescimosPromoState] = useState<Record<string, number>>(() => 
    loadLocalStorage('simulador_acrescimos_promo', DEFAULT_ACRESCIMOS_PROMO)
  );
  const [acrescimoGeralNormal, setAcrescimoGeralNormal] = useState<number>(() => 
    loadLocalStorage('simulador_acrescimo_geral_normal', 0.00)
  );
  const [acrescimoGeralPromo, setAcrescimoGeralPromo] = useState<number>(() => 
    loadLocalStorage('simulador_acrescimo_geral_promo', 0.00)
  );
  const [taxasCustoState, setTaxasCustoState] = useState<Record<string, Record<number, number>>>(() => 
    loadLocalStorage('simulador_taxas_custo', DEFAULT_TAXAS_CUSTO)
  );

  // --- VISUAL SETTINGS (CONTROLLED ONLY VIA ADMIN PANEL) ---
  const [showLucroVendedor, setShowLucroVendedor] = useState<boolean>(() => 
    loadLocalStorage('simulador_show_lucro_vendedor', true)
  );
  const [showLucroDono, setShowLucroDono] = useState<boolean>(() => 
    loadLocalStorage('simulador_show_lucro_dono', true)
  );
  const [tipoTaxaExibida, setTipoTaxaExibida] = useState<"cliente" | "custo">(() => 
    loadLocalStorage('simulador_tipo_taxa_exibida', 'cliente')
  );

  // --- ADMIN AUTH & POPUPS ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => 
    !!localStorage.getItem('admin_authenticated')
  );
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [adminTab, setAdminTab] = useState<'geral' | 'fatores' | 'custos'>('geral');

  // --- ADMIN EDIT FORM LOCAL STATES ---
  const [formFatoresBaseNormal, setFormFatoresBaseNormal] = useState<Record<number, number>>({});
  const [formFatoresBasePromo, setFormFatoresBasePromo] = useState<Record<number, number>>({});
  const [formAcrescimosNormal, setFormAcrescimosNormal] = useState<Record<string, number>>({});
  const [formAcrescimosPromo, setFormAcrescimosPromo] = useState<Record<string, number>>({});
  const [formAcrescimoGeralNormal, setFormAcrescimoGeralNormal] = useState<number>(0);
  const [formAcrescimoGeralPromo, setFormAcrescimoGeralPromo] = useState<number>(0);
  const [formTaxasCusto, setFormTaxasCusto] = useState<Record<string, Record<number, number>>>({ "Master/Visa": {}, "Elo": {} });
  const [formShowLucroVendedor, setFormShowLucroVendedor] = useState<boolean>(true);
  const [formShowLucroDono, setFormShowLucroDono] = useState<boolean>(true);
  const [formTipoTaxaExibida, setFormTipoTaxaExibida] = useState<"cliente" | "custo">("cliente");

  // --- IDENTITY & CUSTOMIZATION ---
  const [logoUrl, setLogoUrl] = useState<string>(() => loadLocalStorage('simulador_logo_url', ''));
  const [primaryColor, setPrimaryColor] = useState<string>(() => loadLocalStorage('simulador_primary_color', '#059669'));
  const [formLogoUrl, setFormLogoUrl] = useState<string>('');
  const [formPrimaryColor, setFormPrimaryColor] = useState<string>('#059669');

  // --- EXPORT SETTINGS ---
  const [exportShowTaxa, setExportShowTaxa] = useState<boolean>(true);

  // --- CALCULATOR STATES ---
  const [valorDesejado, setValorDesejado] = useState("1000.00");
  const [modoCalculo, setModoCalculo] = useState<"valor" | "limite">("valor");
  const [tipoTabela, setTipoTabela] = useState<"normal" | "promo">("normal");
  const [nivelTabela, setNivelTabela] = useState("5");
  const [bandeira, setBandeira] = useState("Master/Visa");
  const exportRef = useRef<HTMLDivElement>(null);

  // --- CARREGAR CONFIGURAÃ‡Ã•ES DO SERVIDOR ---
  useEffect(() => {
    if (isAuthenticated) {
      fetch('api/config/')
        .then(res => res.json())
        .then(data => {
          if (data && Object.keys(data).length > 0) {
            if (data.fatores_normal) {
              setFatoresBaseNormalState(data.fatores_normal);
              localStorage.setItem('simulador_fatores_normal', JSON.stringify(data.fatores_normal));
            }
            if (data.fatores_promo) {
              setFatoresBasePromoState(data.fatores_promo);
              localStorage.setItem('simulador_fatores_promo', JSON.stringify(data.fatores_promo));
            }
            if (data.acrescimos_normal) {
              setAcrescimosNormalState(data.acrescimos_normal);
              localStorage.setItem('simulador_acrescimos_normal', JSON.stringify(data.acrescimos_normal));
            }
            if (data.acrescimos_promo) {
              setAcrescimosPromoState(data.acrescimos_promo);
              localStorage.setItem('simulador_acrescimos_promo', JSON.stringify(data.acrescimos_promo));
            }
            if (data.acrescimo_geral_normal !== undefined) {
              setAcrescimoGeralNormal(data.acrescimo_geral_normal);
              localStorage.setItem('simulador_acrescimo_geral_normal', JSON.stringify(data.acrescimo_geral_normal));
            }
            if (data.acrescimo_geral_promo !== undefined) {
              setAcrescimoGeralPromo(data.acrescimo_geral_promo);
              localStorage.setItem('simulador_acrescimo_geral_promo', JSON.stringify(data.acrescimo_geral_promo));
            }
            if (data.taxas_custo) {
              setTaxasCustoState(data.taxas_custo);
              localStorage.setItem('simulador_taxas_custo', JSON.stringify(data.taxas_custo));
            }
            if (data.show_lucro_vendedor !== undefined) {
              setShowLucroVendedor(data.show_lucro_vendedor);
              localStorage.setItem('simulador_show_lucro_vendedor', JSON.stringify(data.show_lucro_vendedor));
            }
            if (data.show_lucro_dono !== undefined) {
              setShowLucroDono(data.show_lucro_dono);
              localStorage.setItem('simulador_show_lucro_dono', JSON.stringify(data.show_lucro_dono));
            }
            if (data.tipo_taxa_exibida !== undefined) {
              setTipoTaxaExibida(data.tipo_taxa_exibida);
              localStorage.setItem('simulador_tipo_taxa_exibida', JSON.stringify(data.tipo_taxa_exibida));
            }
            if (data.logo_url !== undefined) {
              setLogoUrl(data.logo_url);
              localStorage.setItem('simulador_logo_url', JSON.stringify(data.logo_url));
            }
            if (data.primary_color !== undefined) {
              setPrimaryColor(data.primary_color);
              localStorage.setItem('simulador_primary_color', JSON.stringify(data.primary_color));
            }
          }
        })
        .catch(err => console.error("Erro ao carregar configuraÃ§Ãµes do servidor:", err));
    }
  }, [isAuthenticated]);

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
        const role = data.role || 'vendedor';
        localStorage.setItem('user_role', role);
        setUserRole(role);
        setIsAuthenticated(true);

        // Se for dono ou admin, autentica automaticamente nas configuraÃ§Ãµes administrativas
        if (role === 'dono') {
          setIsAdminAuthenticated(true);
          localStorage.setItem('admin_authenticated', 'true');
        } else {
          setIsAdminAuthenticated(false);
          localStorage.removeItem('admin_authenticated');
        }
      } else {
        setLoginError(data.message || "Credenciais invÃ¡lidas");
      }
    } catch (err) {
      setLoginError("Erro ao conectar ao servidor");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
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

  const handleShareWhatsApp = async () => {
    if (exportRef.current === null) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        backgroundColor: '#dff0d8',
        pixelRatio: 2,
        style: { opacity: '1', visibility: 'visible' }
      });

      // Converte dataUrl para Blob/File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `simulacao-${valorDesejado.replace('.', ',')}.png`, { type: 'image/png' });

      // Extrai dinamicamente a marca parceira a partir do tÃ­tulo da aba
      const partnerName = document.title.split(' - ')[0] || "Empresta BH";

      // ConstrÃ³i a mensagem em texto formatada
      let messageText = `*SimulaÃ§Ã£o de CartÃ£o - ${partnerName}* ðŸš€\n`;
      messageText += `-------------------------------------------\n`;
      messageText += `ðŸ’³ *Bandeira:* ${bandeira}\n`;
      messageText += `ðŸ“Š *Tabela:* ${tipoTabela === 'normal' ? 'Normal' : 'Oferta (Promo)'} (Tabela ${nivelTabela})\n`;
      messageText += `ðŸ’µ *Modo:* ${modoCalculo === 'valor' ? 'Valor Solicitado' : 'Limite DisponÃ­vel'}\n`;
      messageText += `ðŸ’° *Valor de ReferÃªncia:* ${formatCurrency(parseFloat(modoCalculo === 'valor' ? valorDesejado : limiteCartao))}\n`;
      messageText += `-------------------------------------------\n\n`;
      messageText += `*OpÃ§Ãµes de Parcelamento:*\n`;

      simulacao.forEach(row => {
        const principalVal = row.valorParcela;
        const totalVal = modoCalculo === 'valor' ? row.totalAPassar : row.valorLiquido;
        const labelTotal = modoCalculo === 'valor' ? 'Total a Passar' : 'Total a Receber';
        messageText += `â€¢ *${row.parcelas}x* de *${formatCurrency(principalVal)}*\n`;
        messageText += `  â†³ _${labelTotal}: ${formatCurrency(totalVal)}_\n`;
      });

      messageText += `\n-------------------------------------------\n`;
      messageText += `ðŸ“… _SimulaÃ§Ã£o vÃ¡lida por 7 dias._`;

      const encodedMessage = encodeURIComponent(messageText);

      // Tenta usar Web Share API (funciona em celulares modernos)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `SimulaÃ§Ã£o - ${partnerName}`,
          text: messageText,
          files: [file],
        });
      } else {
        // Fallback: baixa a imagem
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
        
        // Abre o link do WhatsApp com a mensagem formatada prÃ©-preenchida
        setTimeout(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
          alert('Imagem da simulaÃ§Ã£o baixada! Agora cole-a ou anexe-a na conversa do WhatsApp.');
        }, 800);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        alert('Erro ao compartilhar. Tente baixar a imagem e enviar manualmente.');
      }
    }
  };

  // Mask and set currency value
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const numericValue = (parseFloat(value) / 100).toFixed(2);
    setValorDesejado(numericValue);
  };

  // --- ADMIN ACTIONS ---
  const handleOpenAdminPanel = () => {
    setFormFatoresBaseNormal({ ...fatoresBaseNormalState });
    setFormFatoresBasePromo({ ...fatoresBasePromoState });
    setFormAcrescimosNormal({ ...acrescimosNormalState });
    setFormAcrescimosPromo({ ...acrescimosPromoState });
    setFormAcrescimoGeralNormal(acrescimoGeralNormal);
    setFormAcrescimoGeralPromo(acrescimoGeralPromo);
    setFormTaxasCusto({
      "Master/Visa": { ...taxasCustoState["Master/Visa"] },
      "Elo": { ...taxasCustoState["Elo"] }
    });
    setFormShowLucroVendedor(showLucroVendedor);
    setFormShowLucroDono(showLucroDono);
    setFormTipoTaxaExibida(tipoTaxaExibida);
    setFormLogoUrl(logoUrl);
    setFormPrimaryColor(primaryColor);
    setAdminTab('geral');
    setShowAdminPanelModal(true);
  };

  const handleSaveAdminSettings = () => {
    const configPayload = {
      fatores_normal: formFatoresBaseNormal,
      fatores_promo: formFatoresBasePromo,
      acrescimos_normal: formAcrescimosNormal,
      acrescimos_promo: formAcrescimosPromo,
      acrescimo_geral_normal: formAcrescimoGeralNormal,
      acrescimo_geral_promo: formAcrescimoGeralPromo,
      taxas_custo: formTaxasCusto,
      show_lucro_vendedor: formShowLucroVendedor,
      show_lucro_dono: formShowLucroDono,
      tipo_taxa_exibida: formTipoTaxaExibida,
      logo_url: formLogoUrl,
      primary_color: formPrimaryColor
    };

    localStorage.setItem('simulador_fatores_normal', JSON.stringify(formFatoresBaseNormal));
    localStorage.setItem('simulador_fatores_promo', JSON.stringify(formFatoresBasePromo));
    localStorage.setItem('simulador_acrescimos_normal', JSON.stringify(formAcrescimosNormal));
    localStorage.setItem('simulador_acrescimos_promo', JSON.stringify(formAcrescimosPromo));
    localStorage.setItem('simulador_acrescimo_geral_normal', JSON.stringify(formAcrescimoGeralNormal));
    localStorage.setItem('simulador_acrescimo_geral_promo', JSON.stringify(formAcrescimoGeralPromo));
    localStorage.setItem('simulador_taxas_custo', JSON.stringify(formTaxasCusto));
    localStorage.setItem('simulador_show_lucro_vendedor', JSON.stringify(formShowLucroVendedor));
    localStorage.setItem('simulador_show_lucro_dono', JSON.stringify(formShowLucroDono));
    localStorage.setItem('simulador_tipo_taxa_exibida', JSON.stringify(formTipoTaxaExibida));
    localStorage.setItem('simulador_logo_url', JSON.stringify(formLogoUrl));
    localStorage.setItem('simulador_primary_color', JSON.stringify(formPrimaryColor));

    setFatoresBaseNormalState(formFatoresBaseNormal);
    setFatoresBasePromoState(formFatoresBasePromo);
    setAcrescimosNormalState(formAcrescimosNormal);
    setAcrescimosPromoState(formAcrescimosPromo);
    setAcrescimoGeralNormal(formAcrescimoGeralNormal);
    setAcrescimoGeralPromo(formAcrescimoGeralPromo);
    setTaxasCustoState(formTaxasCusto);
    setShowLucroVendedor(formShowLucroVendedor);
    setShowLucroDono(formShowLucroDono);
    setTipoTaxaExibida(formTipoTaxaExibida);
    setLogoUrl(formLogoUrl);
    setLogoErro(false);
    setLogoHeaderErro(false);
    setPrimaryColor(formPrimaryColor);

    // Envia ao servidor
    fetch('api/config/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configPayload)
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.warn("Aviso: ConfiguraÃ§Ãµes salvas localmente, mas falharam ao sincronizar com o servidor.");
      }
    })
    .catch(err => console.error("Erro de sincronizaÃ§Ã£o com o servidor:", err));

    setShowAdminPanelModal(false);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm("Deseja realmente restaurar as taxas e opÃ§Ãµes originais de fÃ¡brica? Todas as suas alteraÃ§Ãµes serÃ£o perdidas.")) {
      localStorage.removeItem('simulador_fatores_normal');
      localStorage.removeItem('simulador_fatores_promo');
      localStorage.removeItem('simulador_acrescimos_normal');
      localStorage.removeItem('simulador_acrescimos_promo');
      localStorage.removeItem('simulador_acrescimo_geral_normal');
      localStorage.removeItem('simulador_acrescimo_geral_promo');
      localStorage.removeItem('simulador_taxas_custo');
      localStorage.removeItem('simulador_show_lucro_vendedor');
      localStorage.removeItem('simulador_show_lucro_dono');
      localStorage.removeItem('simulador_tipo_taxa_exibida');
      localStorage.removeItem('simulador_logo_url');
      localStorage.removeItem('simulador_primary_color');

      setFatoresBaseNormalState(DEFAULT_FATORES_BASE_NORMAL);
      setFatoresBasePromoState(DEFAULT_FATORES_BASE_PROMO);
      setAcrescimosNormalState(DEFAULT_ACRESCIMOS_NORMAL);
      setAcrescimosPromoState(DEFAULT_ACRESCIMOS_PROMO);
      setAcrescimoGeralNormal(0.00);
      setAcrescimoGeralPromo(0.00);
      setTaxasCustoState(DEFAULT_TAXAS_CUSTO);
      setShowLucroVendedor(true);
      setShowLucroDono(true);
      setTipoTaxaExibida('cliente');
      setLogoUrl('');
      setLogoErro(false);
      setLogoHeaderErro(false);
      setPrimaryColor('#059669');

      // Restaura no servidor tambÃ©m
      const defaultsPayload = {
        fatores_normal: DEFAULT_FATORES_BASE_NORMAL,
        fatores_promo: DEFAULT_FATORES_BASE_PROMO,
        acrescimos_normal: DEFAULT_ACRESCIMOS_NORMAL,
        acrescimos_promo: DEFAULT_ACRESCIMOS_PROMO,
        acrescimo_geral_normal: 0.00,
        acrescimo_geral_promo: 0.00,
        taxas_custo: DEFAULT_TAXAS_CUSTO,
        show_lucro_vendedor: true,
        show_lucro_dono: true,
        tipo_taxa_exibida: 'cliente',
        logo_url: '',
        primary_color: '#059669'
      };

      fetch('api/config/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultsPayload)
      }).catch(err => console.error("Erro ao sincronizar restauraÃ§Ã£o de padrÃµes:", err));

      setShowAdminPanelModal(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminAuthenticated(false);
    setShowAdminPanelModal(false);
  };

  const simulacao = useMemo<SimulationRow[]>(() => {
    const valorNum = parseFloat(valorDesejado) || 0;
    const fatoresBase = tipoTabela === 'normal' ? fatoresBaseNormalState : fatoresBasePromoState;
    const acrescimo = tipoTabela === 'normal' ? acrescimosNormalState[nivelTabela] : acrescimosPromoState[nivelTabela];
    const acrescimoGeral = tipoTabela === 'normal' ? (acrescimoGeralNormal / 100) : (acrescimoGeralPromo / 100);
    
    if (valorNum <= 0) return [];

    return Array.from({ length: 21 }, (_, index) => {
      const i = index + 1;
      const fator = (fatoresBase[i] || 1) + (acrescimo || 0) + acrescimoGeral;

      const taxaCliente = (((fator - 1) * 100) / i).toFixed(2).replace('.', ',') + '%';
      const percentualTaxaMaquina = taxasCustoState[bandeira][i] || 0;
      const taxaCustoStr = percentualTaxaMaquina.toFixed(2).replace('.', ',') + '%';
      
      const taxaDinamica = tipoTaxaExibida === 'cliente' ? taxaCliente : taxaCustoStr;
      
      let totalAPassar, valorLiquido;
      
      if (modoCalculo === 'valor') {
        totalAPassar = valorNum * fator;
        valorLiquido = valorNum;
      } else {
        totalAPassar = valorNum;
        valorLiquido = valorNum / fator;
      }

      const valorParcela = totalAPassar / i;
      
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
  }, [
    valorDesejado, tipoTabela, nivelTabela, bandeira, modoCalculo, tipoTaxaExibida, 
    fatoresBaseNormalState, fatoresBasePromoState, acrescimosNormalState, acrescimosPromoState, 
    acrescimoGeralNormal, acrescimoGeralPromo, taxasCustoState
  ]);

  const showLucroEfetivo = useMemo(() => {
    if (userRole === 'dono' || userRole === 'admin') return showLucroDono;
    return showLucroVendedor;
  }, [userRole, showLucroDono, showLucroVendedor]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="bg-emerald-800 p-8 text-center text-white flex flex-col items-center justify-center">
            {!logoErro ? (
              <img 
                src={logoUrl || "logo.png"}
                onError={() => setLogoErro(true)} 
                className="h-14 w-auto object-contain mb-4 max-w-[240px]" 
                alt="Logo" 
              />
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 mb-4 shadow-inner">
                <Lock size={32} className="text-emerald-300" />
              </div>
            )}
            <h2 className="text-2xl font-bold">Acesso Restrito</h2>
            <p className="text-emerald-100/60 text-sm mt-1">Identifique-se para acessar o simulador</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">UsuÃ¡rio</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 rounded-xl border-2 border-slate-100 py-3.5 px-4 bg-slate-50 text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                  placeholder="Seu nome de usuÃ¡rio"
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
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
            <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter">Ramos Â© {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans text-slate-800">
      <header className="max-w-4xl w-full mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
            {!logoHeaderErro ? (
              <img 
                src={logoUrl || "logo.png"}
                onError={() => setLogoHeaderErro(true)} 
                className="h-10 w-auto object-contain max-w-[180px]" 
                alt="Logo" 
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calculator className="text-emerald-600" />
                <span className="font-bold text-emerald-950">Calculadora</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          
          <button 
            onClick={() => setExportShowTaxa(!exportShowTaxa)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold border transition-all active:scale-95 shadow-sm text-sm select-none ${
              exportShowTaxa 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700'
            }`}
            title="Exibir ou ocultar a coluna de porcentagem na imagem da simulaÃ§Ã£o"
          >
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black transition-all ${
              exportShowTaxa ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>%</span>
            <span>{exportShowTaxa ? 'Ocultar %' : 'Mostrar %'}</span>
          </button>

          <button 
            onClick={handleExport}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-2 px-5 py-2.5 hover:brightness-110 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 group text-sm"
          >
            <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
            Gerar Imagem
          </button>

          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 group text-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="group-hover:scale-110 transition-transform">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>

          {/* BotÃ£o de ConfiguraÃ§Ãµes Admin */}
          {(userRole === 'dono' || userRole === 'admin') && (
            <button 
              onClick={() => {
                if (isAdminAuthenticated) {
                  handleOpenAdminPanel();
                } else {
                  setAdminPasswordInput("");
                  setAdminPasswordError("");
                  setShowAdminPasswordModal(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold border transition-all active:scale-95 shadow-sm text-sm ${
                isAdminAuthenticated 
                  ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600' 
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Painel Administrativo de Taxas"
            >
              <Settings size={18} className={isAdminAuthenticated ? "animate-pulse" : ""} />
              <span>{isAdminAuthenticated ? "Painel Admin" : "Admin"}</span>
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl font-bold border border-slate-200 transition-all active:scale-95 shadow-sm text-sm"
            title="Sair do sistema"
          >
            <LogIn size={18} className="rotate-180" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Input Configuration Section */}
        <div className="p-6 md:p-8 text-white" style={{ backgroundColor: primaryColor }}>
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
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">Modo de SimulaÃ§Ã£o</label>
                  <select
                    value={modoCalculo}
                    onChange={(e) => setModoCalculo(e.target.value as "valor" | "limite")}
                    className="w-full rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                  >
                    <option value="valor">Valor a Receber</option>
                    <option value="limite">Limite do CartÃ£o</option>
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
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5 uppercase">NÃ­vel do AcrÃ©scimo</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" />
                    <select
                      value={nivelTabela}
                      onChange={(e) => setNivelTabela(e.target.value)}
                      className="w-full pl-10 rounded-xl border-0 py-2.5 px-4 bg-emerald-700/50 text-white font-semibold focus:ring-2 focus:ring-emerald-400 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat pr-10 hover:bg-emerald-600/50"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const lvl = String(i + 1);
                        const baseVal = tipoTabela === 'normal' 
                          ? acrescimosNormalState[lvl] 
                          : acrescimosPromoState[lvl];
                        const geralVal = tipoTabela === 'normal'
                          ? acrescimoGeralNormal
                          : acrescimoGeralPromo;
                        const totalVal = (baseVal * 100) + geralVal;

                        return (
                          <option key={lvl} value={lvl}>
                            Tabela {lvl} {i === 0 && totalVal === 0 ? '(Base)' : `(+${totalVal.toFixed(2).replace('.', ',').replace(',00', '')}%)`}
                          </option>
                        );
                      })}
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
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">
                  {tipoTaxaExibida === 'cliente' ? '% a.m.' : 'Taxa MÃ¡quina (Custo)'}
                </th>
                {showLucroEfetivo && <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right">Lucro LÃ­quido</th>}
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
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'} hover:bg-emerald-50/80 transition-colors group`}
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
                            <Info size={10} /> ContingÃªncia
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-semibold">{formatCurrency(modoCalculo === 'valor' ? row.totalAPassar : row.valorLiquido)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${tipoTaxaExibida === 'cliente' ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {row.taxaDinamica}
                      </span>
                    </td>
                    {showLucroEfetivo && (
                      <td className="py-4 px-6 text-right">
                        <div className={`flex flex-col items-end gap-1`}>
                          <div className={`inline-flex items-center gap-1.5 font-bold text-lg ${row.lucro >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {row.lucro >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            {formatCurrency(row.lucro)}
                          </div>
                          <span className="text-slate-400 text-[10px] font-medium">Margem LÃ­quida</span>
                        </div>
                      </td>
                    )}
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
                <span>PrejuÃ­zo</span>
              </div>
            </div>
            <p className="font-medium italic">SimulaÃ§Ã£o baseada nas taxas vigentes da adquirente.</p>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Esse orÃ§amento Ã© vÃ¡lido para 7 dias. Todos os direitos reservados.
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
            backgroundColor: '#f0f9f1', 
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
                SIMULAÃ‡ÃƒO: {bandeira.toUpperCase()}
              </div>
              <img 
                src={logoUrl || "logo.png"} 
                className="h-8 w-auto object-contain" 
                alt="Logo" 
                style={!logoUrl ? { filter: "brightness(0) invert(1)" } : undefined}
              />
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
                  {exportShowTaxa && <th style={{ padding: '4px 6px', textAlign: 'right', width: '23%' }}>% a.m.</th>}
                </tr>
              </thead>
              <tbody>
                {simulacao.map((row, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#eaf7ed';
                  return (
                    <tr key={row.parcelas}>
                      <td style={{ 
                        padding: '6px 8px', 
                        textAlign: 'left', 
                        backgroundColor: rowBgColor, 
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
                        backgroundColor: rowBgColor, 
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
                        backgroundColor: rowBgColor, 
                        color: '#1e293b', 
                        fontWeight: '600', 
                        fontSize: '11px',
                        borderTop: '1px solid #f1f5f9',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        {(modoCalculo === 'valor' ? row.totalAPassar : row.valorLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {exportShowTaxa && (
                        <td style={{ 
                          padding: '6px 8px', 
                          textAlign: 'right', 
                          backgroundColor: rowBgColor, 
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
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', textAlign: 'center', color: '#065f4688', fontSize: '11px', fontWeight: '600', borderTop: '2px solid #065f4611' }}>
            Gerado em {new Date().toLocaleDateString('pt-BR')} â€¢ Esse orÃ§amento Ã© vÃ¡lido para 7 dias
          </div>
        </div>
      </div>

      {/* --- MODAL DE SENHA ADMIN --- */}
      <AnimatePresence>
        {showAdminPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-amber-600 p-6 text-center text-white relative">
                <button 
                  onClick={() => setShowAdminPasswordModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-amber-200 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 mb-3 shadow-inner">
                  <Lock size={24} className="text-amber-200" />
                </div>
                <h3 className="text-xl font-bold">Acesso Administrativo</h3>
                <p className="text-amber-100/60 text-xs mt-1">Insira a chave de seguranÃ§a para configurar taxas</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (adminPasswordInput === "3x51ELCO") {
                  setIsAdminAuthenticated(true);
                  localStorage.setItem('admin_authenticated', 'true');
                  setShowAdminPasswordModal(false);
                  setAdminPasswordInput("");
                  setAdminPasswordError("");
                  setTimeout(() => {
                    handleOpenAdminPanel();
                  }, 100);
                } else {
                  setAdminPasswordError("Chave de seguranÃ§a incorreta");
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Chave de Acesso</label>
                  <input 
                    type="password" 
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-100 py-3 px-4 bg-slate-50 text-slate-800 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-semibold text-center tracking-widest text-lg"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    required
                    autoFocus
                  />
                </div>

                {adminPasswordError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    {adminPasswordError}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAdminPasswordModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-200 active:scale-95"
                  >
                    Acessar Painel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- POPUP / MODAL PAINEL ADMINISTRATIVO --- */}
      <AnimatePresence>
        {showAdminPanelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header do Painel */}
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                    <SlidersHorizontal size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      Painel Administrativo
                      <span className="text-[10px] bg-amber-500/20 text-amber-500 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">Modo Edit</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Configure acrÃ©scimos, tabelas de parcelamento e custos da mÃ¡quina</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-all"
                    title="Encerrar sessÃ£o de administrador"
                  >
                    <Lock size={12} />
                    Sair Admin
                  </button>
                  <button 
                    onClick={() => setShowAdminPanelModal(false)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Barra de Abas */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setAdminTab('geral')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'geral' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sliders size={14} />
                  OpÃ§Ãµes & AcrÃ©scimos
                </button>
                <button
                  onClick={() => setAdminTab('fatores')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'fatores' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calculator size={14} />
                  Fatores Base (Normal/Promo)
                </button>
                <button
                  onClick={() => setAdminTab('custos')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'custos' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard size={14} />
                  Custo de MÃ¡quina (Elo/Master/Visa)
                </button>
                <button
                  onClick={() => setAdminTab('identidade')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'identidade' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Eye size={14} />
                  Identidade Visual
                </button>
              </div>

              {/* ConteÃºdo das Abas (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                
                {/* ABA 1: GERAL & ACRESCIMOS */}
                {adminTab === 'geral' && (
                  <div className="space-y-6">
                    {/* SeÃ§Ã£o Visibilidade & Controles */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Eye size={16} className="text-amber-600" />
                        OpÃ§Ãµes de ExibiÃ§Ã£o do Simulador
                      </h4>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                        <div>
                          <h5 className="text-xs font-bold text-slate-700">Liberar Tabela de ComissÃ£o para os Vendedores</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Se ativado, os vendedores comuns terÃ£o acesso Ã  visualizaÃ§Ã£o do Lucro LÃ­quido (comissÃ£o) no simulador</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formShowLucroVendedor}
                            onChange={(e) => setFormShowLucroVendedor(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">{formShowLucroVendedor ? "Liberado" : "Bloqueado"}</span>
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 border-t border-slate-100 pt-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-700">Ativar Lucro LÃ­quido no simulador do Dono</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Se ativado, exibe a coluna de Lucro LÃ­quido (comissÃ£o) na tabela principal para o perfil Dono</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formShowLucroDono}
                            onChange={(e) => setFormShowLucroDono(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">{formShowLucroDono ? "Ativado" : "Desativado"}</span>
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 border-t border-slate-100 pt-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-700">Ver Taxa de Custo da MÃ¡quina</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Se ativado, exibe a taxa real cobrada pela operadora em vez da taxa final cobrada do cliente</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formTipoTaxaExibida === 'custo'}
                            onChange={(e) => setFormTipoTaxaExibida(e.target.checked ? 'custo' : 'cliente')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          <span className="ml-3 text-xs font-bold text-slate-700">{formTipoTaxaExibida === 'custo' ? "Taxa Custo" : "Taxa Cliente"}</span>
                        </label>
                      </div>
                    </div>

                    {/* SeÃ§Ã£o AcrÃ©scimos Gerais */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <SlidersHorizontal size={16} className="text-amber-600" />
                        AcrÃ©scimos Gerais (Aplica a todas as parcelas)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">AcrÃ©scimo Geral - Tabela Normal (%)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+</span>
                            <input 
                              type="number" 
                              step="0.01"
                              value={formAcrescimoGeralNormal}
                              onChange={(e) => setFormAcrescimoGeralNormal(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-7 pr-8 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">AcrÃ©scimo Geral - Tabela Promo (%)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+</span>
                            <input 
                              type="number" 
                              step="0.01"
                              value={formAcrescimoGeralPromo}
                              onChange={(e) => setFormAcrescimoGeralPromo(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-7 pr-8 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SeÃ§Ã£o AcrÃ©scimos por NÃ­vel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* AcrÃ©scimos Normal */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <Sliders size={16} className="text-indigo-600" />
                          AcrÃ©scimos por Tabela (Normal)
                        </h4>
                        <div className="space-y-3">
                          {Array.from({ length: 5 }, (_, i) => {
                            const lvl = String(i + 1);
                            const valPct = (formAcrescimosNormal[lvl] || 0) * 100;
                            return (
                              <div key={lvl} className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-600">Tabela {lvl}</span>
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={valPct}
                                    onChange={(e) => {
                                      const parsed = parseFloat(e.target.value) || 0;
                                      setFormAcrescimosNormal(prev => ({ ...prev, [lvl]: parsed / 100 }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-6 pr-8 text-xs font-bold text-slate-700 text-right outline-none focus:border-amber-500"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* AcrÃ©scimos Promo */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <Sliders size={16} className="text-emerald-600" />
                          AcrÃ©scimos por Tabela (Promo)
                        </h4>
                        <div className="space-y-3">
                          {Array.from({ length: 5 }, (_, i) => {
                            const lvl = String(i + 1);
                            const valPct = (formAcrescimosPromo[lvl] || 0) * 100;
                            return (
                              <div key={lvl} className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-600">Tabela {lvl}</span>
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={valPct}
                                    onChange={(e) => {
                                      const parsed = parseFloat(e.target.value) || 0;
                                      setFormAcrescimosPromo(prev => ({ ...prev, [lvl]: parsed / 100 }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-6 pr-8 text-xs font-bold text-slate-700 text-right outline-none focus:border-amber-500"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ABA 4: IDENTIDADE VISUAL */}
                {adminTab === 'identidade' && (
                  <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-800 text-xs font-medium flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>PersonalizaÃ§Ã£o de Marca:</strong> Defina o logo e a cor principal do simulador para a sua operaÃ§Ã£o. Caso deixe o logo em branco, o padrÃ£o serÃ¡ utilizado.
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Logomarca (Anexar Arquivo)</label>
                        <div className="flex flex-col gap-3">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressLogoImage(file);
                                  setFormLogoUrl(compressed);
                                } catch (err) {
                                  console.error("Erro ao comprimir imagem:", err);
                                  // Fallback em caso de erro na compressÃ£o
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setFormLogoUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer bg-white border border-slate-200 rounded-xl p-1 outline-none"
                          />
                          {formLogoUrl && (
                            <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                              <img 
                                src={formLogoUrl} 
                                alt="PrÃ©-visualizaÃ§Ã£o do logotipo" 
                                className="h-12 w-auto object-contain bg-slate-50 rounded p-1 border" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-500 truncate">Logotipo Selecionado</p>
                                <p className="text-[10px] text-slate-400">Salvo na memÃ³ria local/servidor</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setFormLogoUrl('')}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                title="Remover logotipo"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Cor Principal (HEX)</label>
                        <div className="flex gap-4">
                          <input 
                            type="color"
                            value={formPrimaryColor}
                            onChange={(e) => setFormPrimaryColor(e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 outline-none"
                          />
                          <input 
                            type="text"
                            value={formPrimaryColor}
                            onChange={(e) => setFormPrimaryColor(e.target.value)}
                            placeholder="#059669"
                            className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 2: FATORES BASE */}
                {adminTab === 'fatores' && userRole === 'admin' && (
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-xs font-medium flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Taxas Fixas de Fatores Base:</strong> Estes sÃ£o os fatores multiplicadores decimais fixados no sistema (ex: `1.1208` corresponde a 12.08% de custo). Eles sÃ£o exibidos apenas para referÃªncia e nÃ£o podem ser alterados pelo Dono.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Fatores Normal */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex justify-between">
                          <span>Tabela Normal (Fator Base)</span>
                          <span className="text-slate-500">1x a 21x</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <input 
                                  type="number"
                                  step="0.0001"
                                  value={formFatoresBaseNormal[p] || 1}
                                  disabled={true}
                                  className="w-20 bg-slate-100 border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-bold text-slate-400 text-right outline-none cursor-not-allowed"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fatores Promo */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex justify-between">
                          <span>Tabela Promo (Fator Base)</span>
                          <span className="text-slate-500">1x a 21x</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <input 
                                  type="number"
                                  step="0.0001"
                                  value={formFatoresBasePromo[p] || 1}
                                  disabled={true}
                                  className="w-20 bg-slate-100 border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-bold text-slate-400 text-right outline-none cursor-not-allowed"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === 'fatores' && userRole === 'dono' && (
                  <div className="p-10 text-center text-slate-500 font-bold">
                    <p>O gerenciamento de Fatores Base Ã© restrito ao Administrador Global da plataforma.</p>
                  </div>
                )}

                {/* ABA 3: CUSTOS DE MAQUINA */}
                {adminTab === 'custos' && userRole === 'admin' && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Taxas Fixas de Custo de MÃ¡quina:</strong> Representam a taxa real fixa cobrada pela operadora do cartÃ£o (adquirente) em cada parcela (%). Elas sÃ£o exibidas apenas para sua referÃªncia de custos e nÃ£o podem ser alteradas.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Custos Master/Visa */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex justify-between">
                          <span>Bandeira Master/Visa (Custo %)</span>
                          <span className="text-slate-500">1x a 21x</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            const taxaVal = formTaxasCusto["Master/Visa"] ? formTaxasCusto["Master/Visa"][p] : 0;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={taxaVal}
                                    disabled={true}
                                    className="w-16 bg-slate-100 border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-bold text-slate-400 text-right outline-none cursor-not-allowed pr-5"
                                  />
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custos Elo */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex justify-between">
                          <span>Bandeira Elo (Custo %)</span>
                          <span className="text-slate-500">1x a 21x</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            const taxaVal = formTaxasCusto["Elo"] ? formTaxasCusto["Elo"][p] : 0;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={taxaVal}
                                    disabled={true}
                                    className="w-16 bg-slate-100 border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-bold text-slate-400 text-right outline-none cursor-not-allowed pr-5"
                                  />
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === 'custos' && userRole === 'dono' && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Taxas Fixas de Custo de MÃ¡quina:</strong> Estas sÃ£o as taxas reais de custo atreladas a vocÃª. Apenas leitura.
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">Bandeira Master/Visa (Custo %)</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            const taxaVal = formTaxasCusto["Master/Visa"] ? formTaxasCusto["Master/Visa"][p] : 0;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <span className="text-xs font-bold text-slate-700">{taxaVal}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">Bandeira Elo (Custo %)</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from({ length: 21 }, (_, index) => {
                            const p = index + 1;
                            const taxaVal = formTaxasCusto["Elo"] ? formTaxasCusto["Elo"][p] : 0;
                            return (
                              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">{p}x</span>
                                <span className="text-xs font-bold text-slate-700">{taxaVal}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RodapÃ© de AÃ§Ãµes */}
              <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                <button
                  onClick={handleRestoreDefaults}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  <RotateCcw size={14} />
                  Restaurar PadrÃµes
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAdminPanelModal(false)}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAdminSettings}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-100 active:scale-95"
                  >
                    <Save size={14} />
                    Salvar AlteraÃ§Ãµes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
