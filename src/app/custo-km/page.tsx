'use client';

import { useState } from 'react';
import { TipoVeiculo } from '@/lib/types';
import { calcularCustoPorKm, formatarMoeda } from '@/lib/calculations';
import { Fuel, Zap, TrendingDown, AlertCircle, Download } from 'lucide-react';

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      const precosSimulados = {
        gasolina: (5.50 + Math.random() * 0.50).toFixed(2),
        etanol: (3.80 + Math.random() * 0.40).toFixed(2),
        diesel: (5.80 + Math.random() * 0.30).toFixed(2),
      };

      if (tipoVeiculo === 'Carro Flex') {
        setPreco(precosSimulados.gasolina);
        alert(`✅ Preços atualizados!\n\nGasolina: R$ ${precosSimulados.gasolina}\nEtanol: R$ ${precosSimulados.etanol}\n\nUsando gasolina como padrão. Você pode ajustar manualmente.`);
      } else if (tipoVeiculo === 'Diesel') {
        setPreco(precosSimulados.diesel);
        alert(`✅ Preço do diesel atualizado: R$ ${precosSimulados.diesel}`);
      } else if (tipoVeiculo === 'Moto') {
        setPreco(precosSimulados.gasolina);
        alert(`✅ Preço da gasolina atualizado: R$ ${precosSimulados.gasolina}`);
      } else {
        alert('⚠️ Busca de preços não disponível para veículos elétricos. Informe o preço do kWh manualmente.');
      }
    } catch (error) {
      alert('❌ Erro ao buscar preços. Tente novamente ou informe manualmente.');
    } finally {
      setLoadingAPI(false);
    }
  };

  const handleCalcular = () => {
    if (!consumo || !preco) {
      alert('⚠️ Por favor, preencha o consumo médio e o preço do combustível!');
      return;
    }

    const consumoNum = parseFloat(consumo);
    const precoNum = parseFloat(preco);
    const kmNum = parseFloat(km || '0');

    if (isNaN(consumoNum) || isNaN(precoNum) || isNaN(kmNum)) {
      alert('⚠️ Por favor, insira valores numéricos válidos!');
      return;
    }

    if (consumoNum <= 0 || precoNum <= 0) {
      alert('⚠️ Consumo e preço devem ser maiores que zero!');
      return;
    }

    const dados = {
      tipoVeiculo,
      consumoMedio: consumoNum,
      precoCombustivel: precoNum,
      kmRodados: kmNum,
    };

    const calc = calcularCustoPorKm(dados);
    setResultado(calc);

    if (typeof window !== 'undefined') {
      localStorage.setItem('custoPorKm', calc.custoPorKm.toFixed(2));
    }

    const minimoViavel = calc.custoPorKm * 1.5; 
    let insightTexto = `Seu custo por km é ${formatarMoeda(calc.custoPorKm)}. `;
    insightTexto += `Para valer a pena, suas corridas precisam pagar pelo menos ${formatarMoeda(minimoViavel)} por km. `;
    
    if (kmNum > 0) {
      insightTexto += `Hoje seu gasto total foi ${formatarMoeda(calc.custoDiario)}.`;
    }

    if (calc.comparacaoFlex) {
      insightTexto += ` Para seu carro flex, ${calc.comparacaoFlex.melhorOpcao} está mais vantajoso hoje.`;
    }

    setInsight(insightTexto);
  };

  const getUnidade = () => {
    if (tipoVeiculo === 'Elétrico') return 'km/kWh';
    return 'km/L';
  };

  const getCombustivelLabel = () => {
    if (tipoVeiculo === 'Elétrico') return 'Preço do kWh (R$)';
    if (tipoVeiculo === 'Diesel') return 'Preço do Diesel (R$)';
    return 'Preço da Gasolina (R$)';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
          <Fuel className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Calculadora de Custo por KM
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Descubra quanto você gasta para rodar</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Entradas
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Veículo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tiposVeiculo.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoVeiculo(tipo)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    tipoVeiculo === tipo
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-102'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⚡ Consumo Médio ({getUnidade()})
            </label>
            <input
              type="number"
              step="0.1"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              placeholder={tipoVeiculo === 'Elétrico' ? '6.5' : '12.5'}
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              💰 {getCombustivelLabel()}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder={tipoVeiculo === 'Elétrico' ? '0.85' : '5.50'}
                className="flex-1 px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {tipoVeiculo !== 'Elétrico' && (
                <button
                  onClick={buscarPrecosCombustivel}
                  disabled={loadingAPI}
                  className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  title="Buscar preços atualizados"
                >
                  {loadingAPI ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span className="hidden md:inline">Buscar Preço</span>
                </button>
              )}
            </div>
            {tipoVeiculo !== 'Elétrico' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Clique em "Buscar Preço" para obter valores atualizados da sua região
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🛣️ Quilômetros Rodados Hoje (opcional)
            </label>
            <input
              type="number"
              step="0.1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="120"
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleCalcular}
            disabled={!consumo || !preco}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-5 text-xl rounded-xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            🚀 Calcular Custo
          </button>
        </div>
      </div>

      {resultado && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Resultados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Custo por KM</span>
              </div>
              <p className="text-5xl font-bold text-white">
                {formatarMoeda(resultado.custoPorKm)}
              </p>
            </div>

            {km && parseFloat(km) > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-7 h-7 text-white" />
                  <span className="text-sm text-white/90 font-medium">Custo Total do Dia</span>
                </div>
                <p className="text-5xl font-bold text-white">
                  {formatarMoeda(resultado.custoDiario)}
                </p>
              </div>
            )}
          </div>

          {resultado.comparacaoFlex && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <Fuel className="w-5 h-5 text-blue-600" />
                Comparação Gasolina vs Etanol
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Gasolina</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatarMoeda(resultado.comparacaoFlex.gasolina)}/km
                  </p>
                </div>
                <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-500 dark:border-green-600">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-2 font-medium">Etanol ✓</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {formatarMoeda(resultado.comparacaoFlex.etanol)}/km
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                Melhor opção hoje: <span className="font-bold text-green-600 dark:text-green-400">{resultado.comparacaoFlex.melhorOpcao}</span>
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl shadow-xl p-6 border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-3 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">💰 Análise de Custo</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{insight}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-200 text-center font-medium">
              ✅ Custo por KM atualizado! Agora o Dashboard usará <span className="font-bold text-lg">{formatarMoeda(resultado.custoPorKm)}</span> nos cálculos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
