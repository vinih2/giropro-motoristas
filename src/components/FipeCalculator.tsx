'use client';

import { useState, useEffect } from 'react';
import { Car, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarMoeda } from '@/lib/calculations';

// Constantes: Marcas mais comuns na frota brasileira (Nomes exatos da FIPE)
const MARCAS_BRASIL = [
  'GM - Chevrolet',
  'VW - VolksWagen',
  'Fiat',
  'Ford',
  'Toyota',
  'Honda',
  'Hyundai',
  'Renault',
  'Jeep',
  'Nissan',
  'Citroën',
  'Peugeot',
  'Mitsubishi',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Kia Motors',
  'Chery',
  'JAC',
  'Land Rover',
  'Volvo',
  'Suzuki',
  'Troller'
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
  const [loading, setLoading] = useState(false);

  // 1. Carregar Marcas
  useEffect(() => {
    fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        
        // Filtra apenas marcas relevantes para o Brasil e ordena
        const marcasFiltradas = data
          .filter((m: any) => MARCAS_BRASIL.includes(m.nome) || MARCAS_BRASIL.some(p => m.nome.includes(p)))
          .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
        
        setMarcas(marcasFiltradas);
      })
      .catch(err => console.error("Erro FIPE:", err));
  }, []);

  // 2. Carregar Modelos (ao selecionar marca)
  useEffect(() => {
    if (!marcaSel) return;
    setLoading(true);
    setModeloSel(''); setAnoSel(''); setValorFipe(null); // Reset
    
    fetch(`https://brasilapi.com.br/api/fipe/modelos/v1/${marcaSel}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.modelos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [marcaSel]);

  // 3. Carregar Anos (ao selecionar modelo)
  useEffect(() => {
    if (!marcaSel || !modeloSel) return;
    setLoading(true);
    setAnoSel(''); setValorFipe(null); // Reset

    fetch(`https://brasilapi.com.br/api/fipe/anos/v1/${marcaSel}/${modeloSel}`)
      .then(res => res.json())
      .then(data => {
        setAnos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [marcaSel, modeloSel]);

  // 4. Buscar Valor Final e Calcular
  const buscarValor = async () => {
    if (!marcaSel || !modeloSel || !anoSel) return;
    setLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${marcaSel}/${modeloSel}/${anoSel}`);
      const data = await res.json();
      
      // Limpa string "R$ 50.000,00" para number 50000.00
      const valorNumerico = parseFloat(data.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
      setValorFipe(valorNumerico);

      // CONSTANTE DE CÁLCULO:
      // Depreciação média anual de uso intenso (App): 15%
      // Quilometragem média anual de motorista app: 40.000 km
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

      <div className="space-y-4 mb-4">
        {/* Marca */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Marca</label>
          <Select onValueChange={setMarcaSel} value={marcaSel}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Selecione a Marca" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {marcas.map(m => (
                <SelectItem key={m.codigo} value={String(m.codigo)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Modelo</label>
          <Select onValueChange={setModeloSel} value={modeloSel} disabled={!marcaSel}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder={loading && !modelos.length && marcaSel ? "Carregando..." : "Selecione o Modelo"} />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {modelos.map(m => (
                <SelectItem key={m.codigo} value={String(m.codigo)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ano</label>
          <Select onValueChange={setAnoSel} value={anoSel} disabled={!modeloSel}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder={loading && !anos.length && modeloSel ? "Carregando..." : "Selecione o Ano"} />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {anos.map(a => (
                <SelectItem key={a.codigo} value={String(a.codigo)}>
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
        {loading ? 'Calculando...' : 'Calcular Depreciação'}
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
