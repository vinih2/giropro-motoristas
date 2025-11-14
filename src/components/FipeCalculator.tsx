'use client';

import { useState, useEffect } from 'react';
import { Car, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarMoeda } from '@/lib/calculations';

// Lista filtrada das marcas mais comuns no Brasil para facilitar o uso
const MARCAS_POPULARES = [
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
  'Kia',
  'Caoa Chery',
  'JAC',
  'Land Rover',
  'Volvo',
  'Suzuki'
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

  // Carregar e FILTRAR Marcas
  useEffect(() => {
    fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros')
      .then(res => res.json())
      .then(data => {
        // Filtra apenas as marcas populares e ordena alfabeticamente
        const marcasFiltradas = data
          .filter((m: any) => MARCAS_POPULARES.includes(m.nome))
          .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
        
        setMarcas(marcasFiltradas);
      })
      .catch(err => console.error("Erro FIPE:", err));
  }, []);

  // Carregar Modelos
  useEffect(() => {
    if (!marcaSel) return;
    setLoading(true);
    // Limpa seleções anteriores ao trocar marca
    setModeloSel(''); 
    setAnoSel('');
    setValorFipe(null);
    
    fetch(`https://brasilapi.com.br/api/fipe/modelos/v1/${marcaSel}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.modelos);
        setLoading(false);
      });
  }, [marcaSel]);

  // Carregar Anos
  useEffect(() => {
    if (!marcaSel || !modeloSel) return;
    setLoading(true);
    fetch(`https://brasilapi.com.br/api/fipe/anos/v1/${marcaSel}/${modeloSel}`)
      .then(res => res.json())
      .then(data => {
        setAnos(data);
        setLoading(false);
      });
  }, [marcaSel, modeloSel]);

  // Buscar Valor
  const buscarValor = async () => {
    if (!marcaSel || !modeloSel || !anoSel) return;
    setLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${marcaSel}/${modeloSel}/${anoSel}`);
      const data = await res.json();
      
      const valorNumerico = parseFloat(data.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
      setValorFipe(valorNumerico);

      // Estimativa de Depreciação: 15% ao ano / 40.000 km rodados (uso app)
      const depAnual = valorNumerico * 0.15;
      const depPorKm = depAnual / 40000;
      
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
        <Car className="text-blue-600" /> Depreciação Real (FIPE)
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* Seleção de Marca */}
        <Select onValueChange={setMarcaSel} value={marcaSel}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder="Selecione a Marca" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-[300px]">
            {marcas.map(m => (
              <SelectItem key={m.codigo} value={m.codigo} className="dark:text-gray-200 focus:dark:bg-gray-700">
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Seleção de Modelo */}
        <Select onValueChange={setModeloSel} value={modeloSel} disabled={!marcaSel}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder={loading && !modelos.length ? "Carregando..." : "Selecione o Modelo"} />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-[300px]">
            {modelos.map(m => (
              <SelectItem key={m.codigo} value={m.codigo.toString()} className="dark:text-gray-200 focus:dark:bg-gray-700">
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Seleção de Ano */}
        <Select onValueChange={setAnoSel} value={anoSel} disabled={!modeloSel}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder="Selecione o Ano" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-[300px]">
            {anos.map(a => (
              <SelectItem key={a.codigo} value={a.codigo} className="dark:text-gray-200 focus:dark:bg-gray-700">
                {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={buscarValor} 
        disabled={!anoSel || loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold shadow-md transition-all active:scale-95"
      >
        {loading ? 'Calculando...' : 'Calcular Depreciação'}
      </Button>

      {valorFipe && depreciacaoKm && (
        <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Valor de Tabela</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{formatarMoeda(valorFipe)}</span>
          </div>
          
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-red-500 w-5 h-5" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Custo Depreciação/KM</span>
              </div>
              <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                {formatarMoeda(depreciacaoKm)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
              <AlertCircle size={12} /> Estimativa baseada em uso profissional (40k km/ano).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
