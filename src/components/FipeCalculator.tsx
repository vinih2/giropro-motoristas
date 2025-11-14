'use client';

import { useState, useEffect } from 'react';
import { Car, TrendingDown, AlertCircle, Check, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/calculations';

// ✅ Mantendo o filtro da frota brasileira para não poluir a lista
const MARCAS_PRINCIPAIS = [
  'Chevrolet', 'Volkswagen', 'Fiat', 'Ford', 'Toyota', 'Honda', 'Hyundai', 
  'Renault', 'Jeep', 'Nissan', 'Citroën', 'Peugeot', 'Mitsubishi', 'BMW', 
  'Mercedes-Benz', 'Audi', 'Kia', 'Chery', 'JAC', 'Land Rover', 'Volvo', 'Suzuki', 'BYD'
];

export default function FipeCalculator() {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  
  const [marcaSel, setMarcaSel] = useState('');
  const [modeloSel, setModeloSel] = useState('');
  const [anoSel, setAnoSel] = useState('');
  
  const [valorFipe, setValorFipe] = useState<number | null>(null);
  const [depreciacaoKm, setDepreciacaoKm] = useState<number | null>(null);
  
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingValor, setLoadingValor] = useState(false);

  // 1. Carregar Marcas (Parallelum API)
  useEffect(() => {
    fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        
        // Filtra e ordena para mostrar primeiro as comuns no Brasil
        const sorted = data.sort((a: any, b: any) => {
            const aEhPrincipal = MARCAS_PRINCIPAIS.some(p => a.nome.includes(p));
            const bEhPrincipal = MARCAS_PRINCIPAIS.some(p => b.nome.includes(p));
            if (aEhPrincipal && !bEhPrincipal) return -1;
            if (!aEhPrincipal && bEhPrincipal) return 1;
            return a.nome.localeCompare(b.nome);
        });
        setMarcas(sorted);
      })
      .catch(console.error);
  }, []);

  // 2. Carregar Modelos (Ao escolher Marca)
  useEffect(() => {
    if (!marcaSel) return;
    setLoadingModelos(true);
    setModeloSel(''); setAnoSel(''); setValorFipe(null); setDepreciacaoKm(null);
    
    fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSel}/modelos`)
      .then(res => res.json())
      .then(data => {
        // A API retorna um objeto { modelos: [], anos: [] }
        setModelos(data.modelos || []);
        setLoadingModelos(false);
      })
      .catch(() => setLoadingModelos(false));
  }, [marcaSel]);

  // 3. Carregar Anos (Ao escolher Modelo)
  useEffect(() => {
    if (!marcaSel || !modeloSel) return;
    setLoadingAnos(true);
    setAnoSel(''); setValorFipe(null);

    fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSel}/modelos/${modeloSel}/anos`)
      .then(res => res.json())
      .then(data => {
        setAnos(data || []);
        setLoadingAnos(false);
      })
      .catch(() => setLoadingAnos(false));
  }, [marcaSel, modeloSel]);

  // 4. Buscar Valor Final (Ao escolher Ano)
  const buscarValor = async () => {
    if (!marcaSel || !modeloSel || !anoSel) return;
    setLoadingValor(true);
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSel}/modelos/${modeloSel}/anos/${anoSel}`);
      const data = await res.json();
      
      // Converte "R$ 50.000,00" para 50000.00
      const valorNumerico = parseFloat(data.Valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
      setValorFipe(valorNumerico);

      // Cálculo: 15% Depreciação Anual / 40.000 KM (Média App)
      const depPorKm = (valorNumerico * 0.15) / 40000;
      setDepreciacaoKm(depPorKm);
      
      if(typeof window !== 'undefined') {
        localStorage.setItem('custoDepreciacao', depPorKm.toFixed(2));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingValor(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mt-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Car className="text-blue-600" /> Depreciação Real (FIPE)
      </h3>

      <div className="space-y-4 mb-6">
        {/* MARCA (NATIVO) */}
        <div className="relative">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Marca</label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 pr-8 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={marcaSel}
                    onChange={(e) => setMarcaSel(e.target.value)}
                >
                    <option value="">Selecione a marca...</option>
                    {marcas.map((m) => (
                        <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* MODELO (NATIVO) */}
        <div className="relative">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Modelo</label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 pr-8 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    value={modeloSel}
                    onChange={(e) => setModeloSel(e.target.value)}
                    disabled={!marcaSel}
                >
                    <option value="">{loadingModelos ? "Carregando modelos..." : "Selecione o modelo..."}</option>
                    {modelos.map((m) => (
                        <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* ANO (NATIVO) */}
        <div className="relative">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Ano</label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 pr-8 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    value={anoSel}
                    onChange={(e) => setAnoSel(e.target.value)}
                    disabled={!modeloSel}
                >
                    <option value="">{loadingAnos ? "Carregando anos..." : "Selecione o ano..."}</option>
                    {anos.map((a) => (
                        <option key={a.codigo} value={a.codigo}>{a.nome}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
        </div>
      </div>

      <Button 
        onClick={buscarValor} 
        disabled={!anoSel || loadingValor} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-md active:scale-95 transition-all"
      >
        {loadingValor ? <span className="flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Calculando...</span> : 'Calcular Depreciação'}
      </Button>

      {valorFipe && depreciacaoKm && (
        <div className="mt-6 animate-scale-in">
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">Valor de Tabela</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">{formatarMoeda(valorFipe)}</span>
            </div>
            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="text-red-500 w-5 h-5" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Depreciação/KM</span>
                </div>
                <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                  {formatarMoeda(depreciacaoKm)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                <AlertCircle size={12} /> Estimativa para uso profissional (40k km/ano).
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              Sucesso! O custo de depreciação foi salvo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
