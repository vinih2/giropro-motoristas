'use client';

import { useState } from 'react';
import { TipoVeiculo } from '@/lib/types';
import { calcularCustoPorKm, formatarMoeda } from '@/lib/calculations';
import { Fuel, Zap, TrendingDown, AlertCircle, Download } from 'lucide-react';
import FipeCalculator from '@/components/FipeCalculator';

export default function CustoKm() {
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>('Carro Flex');
  const [consumo, setConsumo] = useState('');
  const [preco, setPreco] = useState('');
  const [km, setKm] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loadingAPI, setLoadingAPI] = useState(false);

  const tiposVeiculo: TipoVeiculo[] = ['Carro Flex', 'Moto', 'Elétrico', 'Diesel'];

  const buscarPrecosCombustivel = async () => {
    setLoadingAPI(true);
    try {
      // Simulação de API (futura integração com ANP)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const precosSimulados = {
        gasolina: (5.50 + Math.random() * 0.50).toFixed(2),
        etanol: (3.80 + Math.random() * 0.40).toFixed(2),
        diesel: (5.80 + Math.random() * 0.30).toFixed(2),
      };

      if (tipoVeiculo === 'Carro Flex') {
        setPreco(precosSimulados.gasolina);
        alert(`✅ Preços atualizados!\n\nGasolina: R$ ${precosSimulados.gasolina}\nEtanol: R$ ${precosSimulados.etanol}`);
      } else if (tipoVeiculo === 'Diesel') {
        setPreco(precosSimulados.diesel);
        alert(`✅ Preço do diesel atualizado: R$ ${precosSimulados.diesel}`);
      } else if (tipoVeiculo === 'Moto') {
        setPreco(precosSimulados.gasolina);
        alert(`✅ Preço da gasolina atualizado: R$ ${precosSimulados.gasolina}`);
      } else {
        alert('⚠️ Busca de preços indisponível para veículos elétricos.');
      }
    } catch (error) {
      alert('❌ Erro ao buscar preços.');
    } finally {
      setLoadingAPI(false);
    }
  };

  const handleCalcular = () => {
    const c = parseFloat(consumo);
    const p = parseFloat(preco);
    const k = parseFloat(km || '0');

    if (!c || !p) return alert('⚠️ Preencha consumo e preço!');

    const calc = calcularCustoPorKm({
      tipoVeiculo,
      consumoMedio: c,
      precoCombustivel: p,
      kmRodados: k,
    });
    setResultado(calc);

    if (typeof window !== 'undefined') {
      localStorage.setItem('custoPorKm', calc.custoPorKm.toFixed(2));
    }

    let insightTexto = `Seu custo por km é ${formatarMoeda(calc.custoPorKm)}. `;
    if (k > 0) insightTexto += `Gasto total hoje: ${formatarMoeda(calc.custoDiario)}.`;
    if (calc.comparacaoFlex) insightTexto += ` Melhor opção: ${calc.comparacaoFlex.melhorOpcao}.`;

    setInsight(insightTexto);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
          <Fuel className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calculadora de Custo por KM</h1>
        <p className="text-gray-600 dark:text-gray-300">Combustível + Depreciação</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" /> Entradas</h2>
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tiposVeiculo.map((t) => (
              <button key={t} onClick={() => setTipoVeiculo(t)} className={`px-4 py-3 rounded-xl font-semibold transition-all ${tipoVeiculo === t ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t}</button>
            ))}
          </div>
          <input type="number" step="0.1" value={consumo} onChange={(e) => setConsumo(e.target.value)} placeholder="Consumo Médio (km/L)" className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl" />
          <div className="flex gap-2">
            <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Preço Combustível (R$)" className="flex-1 px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl" />
            <button onClick={buscarPrecosCombustivel} disabled={loadingAPI} className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"><Download className="w-5 h-5" /> <span className="hidden md:inline">Buscar</span></button>
          </div>
          <button onClick={handleCalcular} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-5 text-xl rounded-xl hover:from-blue-600 hover:to-cyan-700">🚀 Calcular Custo</button>
        </div>
      </div>

      {resultado && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-center">
            <p className="text-sm text-white/90 font-medium mb-1">Custo por KM (Combustível)</p>
            <p className="text-5xl font-bold text-white">{formatarMoeda(resultado.custoPorKm)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl shadow-xl p-6 border-2 border-blue-300 dark:border-blue-700 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{insight}</p>
          </div>
        </div>
      )}

      {/* Componente FIPE com todas as correções */}
      <FipeCalculator />
    </div>
  );
}
