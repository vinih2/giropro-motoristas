'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb } from 'lucide-react';

export default function Dashboard() {
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [ganhoBruto, setGanhoBruto] = useState('');
  const [horas, setHoras] = useState('');
  const [km, setKm] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  // Carregar custo por km do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custoSalvo = localStorage.getItem('custoPorKm');
      if (custoSalvo) {
        setCustoPorKm(parseFloat(custoSalvo));
      }
    }
  }, []);

  const handleCalcular = async () => {
    // Validação de campos
    if (!ganhoBruto || !horas || !km) {
      alert('⚠️ Por favor, preencha todos os campos antes de calcular!');
      return;
    }

    const ganhoBrutoNum = parseFloat(ganhoBruto);
    const horasNum = parseFloat(horas);
    const kmNum = parseFloat(km);

    // Validação de valores
    if (isNaN(ganhoBrutoNum) || isNaN(horasNum) || isNaN(kmNum)) {
      alert('⚠️ Por favor, insira valores numéricos válidos!');
      return;
    }

    if (ganhoBrutoNum <= 0 || horasNum <= 0 || kmNum <= 0) {
      alert('⚠️ Os valores devem ser maiores que zero!');
      return;
    }

    const dados = {
      plataforma,
      ganhoBruto: ganhoBrutoNum,
      horasTrabalhadas: horasNum,
      kmRodados: kmNum,
    };

    const calc = calcularGiroDia(dados, custoPorKm);
    setResultado(calc);
    setLoading(true);

    // Gerar insight com IA
    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dados, 
          resultado: calc,
          prompt: `Você é um coach financeiro para motoristas de aplicativo no Brasil. Analise o giro do dia e forneça:

1. Avaliação do giro (Excelente/Bom/Médio/Fraco) baseado em R$ ${calc.ganhoPorHora.toFixed(2)}/hora
2. Uma dica prática e objetiva para melhorar o resultado amanhã
3. Sugestão de melhor horário para trabalhar
4. Uma frase motivacional curta e brasileira

Dados do dia:
- Plataforma: ${plataforma}
- Ganho por hora: R$ ${calc.ganhoPorHora.toFixed(2)}
- Ganho por km: R$ ${calc.ganhoPorKm.toFixed(2)}
- Lucro final: R$ ${calc.lucroFinal.toFixed(2)}
- Horas trabalhadas: ${horasNum}h
- KM rodados: ${kmNum}km

Seja direto, amigável e use linguagem brasileira. Máximo 4 linhas.`
        }),
      });
      
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      setInsight('Seu giro está registrado! Continue assim e acompanhe seus resultados diariamente.');
    } finally {
      setLoading(false);
    }
  };

  const desempenho = resultado ? avaliarDesempenho(resultado.ganhoPorHora) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
          GiroPro
        </h1>
        <p className="text-gray-600">Resumo do Dia – Seu Coach Financeiro</p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="space-y-4">
          {/* Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma
            </label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value as Plataforma)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              {plataformas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Ganho Bruto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ganho Bruto do Dia (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={ganhoBruto}
              onChange={(e) => setGanhoBruto(e.target.value)}
              placeholder="150.00"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Horas e KM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Trabalhadas
              </label>
              <input
                type="number"
                step="0.5"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                placeholder="8"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quilômetros Rodados
              </label>
              <input
                type="number"
                step="0.1"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="120"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Info sobre custo por km */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm text-blue-800">
              💡 Custo por KM atual: <span className="font-bold">{formatarMoeda(custoPorKm)}</span>
              {custoPorKm === 0.50 && ' (padrão - calcule seu custo real na aba "Custo por KM")'}
            </p>
          </div>

          {/* Botão */}
          <button
            onClick={handleCalcular}
            disabled={!ganhoBruto || !horas || !km || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-4 text-lg rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? 'Calculando...' : 'Calcular Meu Giro'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-gray-600">R$/Hora</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(resultado.ganhoPorHora)}
              </p>
              {desempenho && (
                <p className={`text-xs font-medium mt-1 ${desempenho.cor}`}>
                  {desempenho.nivel}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-gray-600">R$/KM</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(resultado.ganhoPorKm)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-red-600" />
                <span className="text-xs text-gray-600">Custo Dia</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatarMoeda(resultado.custoDiario)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white" />
                <span className="text-xs text-white">Lucro Final</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatarMoeda(resultado.lucroFinal)}
              </p>
            </div>
          </div>

          {/* Insight da IA */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-full p-2 mt-1">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">💡 Insight do Coach</h3>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                    <p className="text-gray-600">Analisando seu giro...</p>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{insight}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
