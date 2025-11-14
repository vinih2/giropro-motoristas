'use client';

import { useState, useEffect } from 'react';
import { Search, Car, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarMoeda } from '@/lib/calculations';

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

  useEffect(() => {
    fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros')
      .then(res => res.json())
      .then(data => setMarcas(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!marcaSel) return;
    setLoading(true);
    fetch(`https://brasilapi.com.br/api/fipe/modelos/v1/${marcaSel}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.modelos);
        setLoading(false);
      });
  }, [marcaSel]);

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

  const buscarValor = async () => {
    if (!marcaSel || !modeloSel || !anoSel) return;
    setLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${marcaSel}/${modeloSel}/${anoSel}`);
      const data = await res.json();
      const valorNumerico = parseFloat(data.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
      
      setValorFipe(valorNumerico);

      // Cálculo: Depreciação Anual (15%) / 40.000 km/ano
      const depAnual = valorNumerico * 0.15;
      const depPorKm = depAnual / 40000;
      setDepreciacaoKm(depPorKm);
      
      if(typeof window !== 'undefined') localStorage.setItem('custoDepreciacao', depPorKm.toFixed(2));

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select onValueChange={setMarcaSel}>
          <SelectTrigger><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>{marcas.map(m => <SelectItem key={m.codigo} value={m.codigo}>{m.nome}</SelectItem>)}</SelectContent>
        </Select>

        <Select onValueChange={setModeloSel} disabled={!marcaSel}>
          <SelectTrigger><SelectValue placeholder="Modelo" /></SelectTrigger>
          <SelectContent>{modelos.map(m => <SelectItem key={m.codigo} value={m.codigo.toString()}>{m.nome}</SelectItem>)}</SelectContent>
        </Select>

        <Select onValueChange={setAnoSel} disabled={!modeloSel}>
          <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>{anos.map(a => <SelectItem key={a.codigo} value={a.codigo}>{a.nome}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Button onClick={buscarValor} disabled={!anoSel || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? 'Buscando...' : 'Calcular Depreciação'}
      </Button>

      {valorFipe && depreciacaoKm && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Valor FIPE</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{formatarMoeda(valorFipe)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <TrendingDown size={16} /> Custo de Depreciação/KM
            </span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatarMoeda(depreciacaoKm)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            *Adicione este valor ao seu custo por km de combustível para ter o custo real.
          </p>
        </div>
      )}
    </div>
  );
}
