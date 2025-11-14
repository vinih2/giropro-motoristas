'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb, AlertTriangle, Target } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

function DashboardContent() {
  const { user } = useAuth();
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [ganhoBruto, setGanhoBruto] = useState('');
  const [horas, setHoras] = useState('');
  const [km, setKm] = useState('');
  const [metaDiaria, setMetaDiaria] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);
  const [alerta, setAlerta] = useState('');

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  // Carregar custo por km e meta do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custoSalvo = localStorage.getItem('custoPorKm');
      if (custoSalvo) {
        setCustoPorKm(parseFloat(custoSalvo));
      }
      const metaSalva = localStorage.getItem('metaDiaria');
      if (metaSalva) {
        setMetaDiaria(metaSalva);
      }
    }
  }, []);

  // Salvar meta quando alterada
  useEffect(() => {
    if (metaDiaria && typeof window !== 'undefined') {
      localStorage.setItem('metaDiaria', metaDiaria);
    }
  }, [metaDiaria]);

  // Gerar alerta inteligente
  useEffect(() => {
    if (resultado) {
      gerarAlerta();
    }
  }, [resultado]);

  const gerarAlerta = async () => {
    if (!resultado) return;

    const metaNum = parseFloat(metaDiaria) || 0;
    const distanciaMeta = metaNum > 0 ? ((resultado.lucroFinal / metaNum) * 100).toFixed(0) : 0;

    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Você é um assistente financeiro para motoristas de aplicativo. Gere um alerta curto e prático (máximo 2 linhas).

Dados atuais:
- Ganho por hora: R$ ${resultado.ganhoPorHora.toFixed(2)}
- Custo por km: R$ ${custoPorKm.toFixed(2)}
- Lucro atual: R$ ${resultado.lucroFinal.toFixed(2)}
${metaNum > 0 ? `- Meta do dia: R$ ${metaNum.toFixed(2)} (${distanciaMeta}% atingido)` : ''}

Analise e gere UM alerta sobre:
- Se o ganho/hora está abaixo de R$ 15 (alerta de baixo rendimento)
- Se o custo/km está alto (acima de R$ 0.60)
- Se está longe da meta (abaixo de 70%)
- Ou uma mensagem positiva se está indo bem

Seja direto, use emoji e sugira uma ação prática.`
        }),
      });
      
      const data = await response.json();
      setAlerta(data.insight);
    } catch (error) {
      // Alerta padrão se a IA falhar
      if (resultado.ganhoPorHora < 15) {
        setAlerta('⚠️ Seu ganho por hora está abaixo da média. Considere trabalhar em horários de pico.');
      } else if (metaNum > 0 && resultado.lucroFinal < metaNum * 0.7) {
        setAlerta('🎯 Você está a R$ ' + (metaNum - resultado.lucroFinal).toFixed(2) + ' da sua meta. Foco total!');
      } else {
        setAlerta('✅ Você está no caminho certo! Continue assim.');
      }
    }
  };

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

    // Salvar no Supabase com user_id
    if (user) {
      try {
        const { error } = await supabase.from('registros').insert({
          user_id: user.id,
          data: new Date().toISOString().split('T')[0],
          plataforma,
          horas: horasNum,
          km: kmNum,
          ganho_bruto: ganhoBrutoNum,
          custo_km: custoPorKm,
          lucro: calc.lucroFinal,
        });

        if (error) {
          console.error('Erro ao salvar no Supabase:', error);
          // Fallback para localStorage
          salvarNoLocalStorage(ganhoBrutoNum, horasNum, kmNum, calc);
        }
      } catch (error) {
        console.error('Erro ao salvar:', error);
        salvarNoLocalStorage(ganhoBrutoNum, horasNum, kmNum, calc);
      }
    } else {
      salvarNoLocalStorage(ganhoBrutoNum, horasNum, kmNum, calc);
    }

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

  const salvarNoLocalStorage = (ganhoBrutoNum: number, horasNum: number, kmNum: number, calc: any) => {
    try {
      const registrosAtuais = JSON.parse(localStorage.getItem('registros') || '[]');
      const novoRegistro = {
        id: Date.now(),
        user_id: user?.id || 'local',
        data: new Date().toISOString().split('T')[0],
        plataforma,
        horas: horasNum,
        km: kmNum,
        ganho_bruto: ganhoBrutoNum,
        custo_km: custoPorKm,
        lucro: calc.lucroFinal,
      };
      registrosAtuais.unshift(novoRegistro);
      localStorage.setItem('registros', JSON.stringify(registrosAtuais));
    } catch (error) {
      console.log('Erro ao salvar registro:', error);
    }
  };

  const desempenho = resultado ? avaliarDesempenho(resultado.ganhoPorHora) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent mb-2">
          GiroPro
        </h1>
        <p className="text-gray-600 text-lg">Seu Coach Financeiro Pessoal</p>
      </div>

      {/* Alerta Inteligente */}
      {alerta && (
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-4 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-900 font-medium leading-relaxed">{alerta}</p>
          </div>
        </div>
      )}

      {/* Seção 1: Dados do Dia */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Dados do Dia
        </h2>
        
        <div className="space-y-5">
          {/* Plataforma - Botões Segmentados */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Plataforma
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {plataformas.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlataforma(p)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    plataforma === p
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Ganho Bruto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💰 Ganho Bruto do Dia (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={ganhoBruto}
              onChange={(e) => setGanhoBruto(e.target.value)}
              placeholder="150.00"
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Horas e KM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⏱️ Horas Trabalhadas
              </label>
              <input
                type="number"
                step="0.5"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                placeholder="8"
                className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🛣️ Quilômetros Rodados
              </label>
              <input
                type="number"
                step="0.1"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="120"
                className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Meta Diária */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Meta de Lucro do Dia (R$) - Opcional
            </label>
            <input
              type="number"
              step="0.01"
              value={metaDiaria}
              onChange={(e) => setMetaDiaria(e.target.value)}
              placeholder="200.00"
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Info sobre custo por km */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 font-medium">
              💡 Custo por KM atual: <span className="font-bold text-lg">{formatarMoeda(custoPorKm)}</span>
              {custoPorKm === 0.50 && ' (padrão - calcule seu custo real na aba "Custo por KM")'}
            </p>
          </div>

          {/* Botão */}
          <button
            onClick={handleCalcular}
            disabled={!ganhoBruto || !horas || !km || loading}
            className="w-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-white font-bold py-5 text-xl rounded-xl hover:from-orange-600 hover:via-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Calculando...
              </span>
            ) : (
              '🚀 Calcular Meu Giro'
            )}
          </button>
        </div>
      </div>

      {/* Seção 2: Resultados */}
      {resultado && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Resultados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* R$/Hora */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">R$/Hora</span>
              </div>
              <p className="text-4xl font-bold text-white mb-2">
                {formatarMoeda(resultado.ganhoPorHora)}
              </p>
              {desempenho && (
                <p className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                  desempenho.nivel === 'Excelente' ? 'bg-green-400 text-green-900' :
                  desempenho.nivel === 'Bom' ? 'bg-blue-400 text-blue-900' :
                  desempenho.nivel === 'Médio' ? 'bg-yellow-400 text-yellow-900' :
                  'bg-red-400 text-red-900'
                }`}>
                  {desempenho.nivel}
                </p>
              )}
            </div>

            {/* R$/KM */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">R$/KM</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {formatarMoeda(resultado.ganhoPorKm)}
              </p>
            </div>

            {/* Custo do Dia */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Custo do Dia</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {formatarMoeda(resultado.custoDiario)}
              </p>
            </div>

            {/* Lucro Final */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Lucro Final</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {formatarMoeda(resultado.lucroFinal)}
              </p>
              {metaDiaria && parseFloat(metaDiaria) > 0 && (
                <p className="text-xs text-white/90 mt-2">
                  {((resultado.lucroFinal / parseFloat(metaDiaria)) * 100).toFixed(0)}% da meta
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seção 3: Insight do Coach */}
      {insight && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Insight do Coach
          </h2>
          
          <div className="bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 rounded-2xl shadow-xl p-6 border-2 border-orange-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-3 shadow-lg">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-orange-600 border-t-transparent"></div>
                    <p className="text-gray-700 font-medium">Analisando seu giro...</p>
                  </div>
                ) : (
                  <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-line">{insight}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
