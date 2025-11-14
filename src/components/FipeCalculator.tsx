'use client';

import { useState, useEffect } from 'react';
import { Car, TrendingDown, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarMoeda } from '@/lib/calculations';

// Palavras-chave para encontrar as marcas populares na lista da API
const MARCAS_ALVO = [
  'Chevrolet', 'Volkswagen', 'Fiat', 'Ford', 'Toyota', 'Honda', 'Hyundai', 
  'Renault', 'Jeep', 'Nissan', 'Citroën', 'Peugeot', 'Mitsubishi', 'BMW', 
  'Mercedes', 'Audi', 'Kia', 'Chery', 'JAC', 'Land Rover', 'Volvo', 'Suzuki', 'BYD'
];

export default function FipeCalculator() {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [anos, setAnos] = useState<any[]>([]);
  
  const [marcaSel, setMarcaSel] = useState<string>('');
  const [modeloSel, setModeloSel] = useState<string>('');
  const [anoSel, setAnoSel] = useState<string>('');
  
  const [valorFipe, setValorFipe] = useState<number | null>(null);
  const [depreciacaoKm, setDepreciacaoKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);

  // 1. Carregar e Filtrar Marcas (Executa apenas uma vez)
  useEffect(() => {
    fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        
        // Filtra apenas se o nome da marca conter uma das palavras-chave
        const marcasFiltradas = data
          .filter((m: any) => MARCAS_ALVO.some(alvo => m.nome.toLowerCase().includes(alvo.toLowerCase())))
          .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
        
        setMarcas(marcasFiltradas);
      })
      .catch(console.error);
  }, []);

  // 2. Carregar Modelos
  useEffect(() => {
    if (!marcaSel) return;
    setLoadingModelos(true);
    setModeloSel(''); setAnoSel(''); setValorFipe(null); // Reset
    
    fetch(`https://brasilapi.com.br/api/fipe/modelos/v1/${marcaSel}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.modelos || []);
        setLoadingModelos(false);
      })
      .catch(() => setLoadingModelos(false));
  }, [marcaSel]);

  // 3. Carregar Anos
  useEffect(() => {
    if (!marcaSel || !modeloSel) return;
    setAnoSel(''); setValorFipe(null); // Reset

    fetch(`https://brasilapi.com.br/api/fipe/anos/v1/${marcaSel}/${modeloSel}`)
      .then(res => res.json())
      .then(data => {
        setAnos(data || []);
      })
      .catch(console.error);
  }, [marcaSel, modeloSel]);

  // 4. Buscar Valor Final
  const buscarValor = async () => {
    if (!marcaSel || !modeloSel || !anoSel) return;
    setLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${marcaSel}/${modeloSel}/${anoSel}`);
      const data = await res.json();
      
      const valorNumerico = parseFloat(data.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
      setValorFipe(valorNumerico);

      // Cálculo: 15% de depreciação anual / 40.000 km rodados
      const depPorKm = (valorNumerico * 0.15) / 40000;
      setDepreciacaoKm(depPorKm);
      
      if(typeof window !== 'undefined') {
        localStorage.setItem('custoDepreciacao', depPorKm.toFixed(2));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mt-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Car className="text-blue-600" /> Depreciação Real (Tabela FIPE)
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* SELETOR DE MARCA */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Marca</label>
          <Select onValueChange={setMarcaSel} value={marcaSel}>
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Selecione a Marca" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto bg-white dark:bg-gray-900">
              {marcas.map((m) => (
                <SelectItem key={String(m.codigo)} value={String(m.codigo)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SELETOR DE MODELO */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Modelo</label>
          <Select onValueChange={setModeloSel} value={modeloSel} disabled={!marcaSel || loadingModelos}>
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder={loadingModelos ? "Carregando modelos..." : "Selecione o Modelo"} />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto bg-white dark:bg-gray-900">
              {modelos.map((m) => (
                <SelectItem key={String(m.codigo)} value={String(m.codigo)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SELETOR DE ANO */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ano</label>
          <Select onValueChange={setAnoSel} value={anoSel} disabled={!modeloSel}>
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Selecione o Ano" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto bg-white dark:bg-gray-900">
              {anos.map((a) => (
                <SelectItem key={String(a.codigo)} value={String(a.codigo)}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={buscarValor} 
        disabled={!anoSel || loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-md transition-all active:scale-95"
      >
        {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Calculando...</span> : 'Calcular Depreciação'}
      </Button>

      {valorFipe && depreciacaoKm && (
        <div className="mt-6 animate-fade-in">
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
                <AlertCircle size={12} /> Baseado em 40.000 km/ano.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Valor salvo! Seu custo total agora considera o desgaste do carro.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
