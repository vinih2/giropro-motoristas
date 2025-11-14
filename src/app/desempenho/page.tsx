'use client';

import { useState, useEffect } from 'react';
import { formatarMoeda } from '@/lib/calculations';
import { BarChart3, TrendingUp, Clock, Navigation, DollarSign, Calendar, Target, Zap } from 'lucide-react';

interface Registro {
  id: number;
  data: string;
  plataforma: string;
  horas: number;
  km: number;
  ganho_bruto: number;
  custo_km: number;
  lucro: number;
}

export default function Desempenho() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [analiseIA, setAnaliseIA] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    try {
      const dados = localStorage.getItem('registros');
      if (dados) {
        setRegistros(JSON.parse(dados));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - 7);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const semanaAnterior = new Date(hoje);
  semanaAnterior.setDate(hoje.getDate() - 14);

  const registrosSemana = registros.filter(r => new Date(r.data) >= inicioSemana);
  const registrosMes = registros.filter(r => new Date(r.data) >= inicioMes);
  const registrosSemanaAnterior = registros.filter(
    r => new Date(r.data) >= semanaAnterior && new Date(r.data) < inicioSemana
  );

  const lucroSemanal = registrosSemana.reduce((acc, r) => acc + r.lucro, 0);
  const lucroMensal = registrosMes.reduce((acc, r) => acc + r.lucro, 0);
  const lucroSemanaAnterior = registrosSemanaAnterior.reduce((acc, r) => acc + r.lucro, 0);

  const totalHorasMes = registrosMes.reduce((acc, r) => acc + r.horas, 0);
  const totalKmMes = registrosMes.reduce((acc, r) => acc + r.km, 0);

  const mediaPorHora = totalHorasMes > 0 ? lucroMensal / totalHorasMes : 0;
  const mediaPorKm = totalKmMes > 0 ? lucroMensal / totalKmMes : 0;

  // Melhor dia
  const melhorDia = registros.length > 0
    ? registros.reduce((max, r) => (r.lucro > max.lucro ? r : max), registros[0])
    : null;

  // Comparativo semana x semana
  const comparativoSemanal = lucroSemanaAnterior > 0
    ? ((lucroSemanal - lucroSemanaAnterior) / lucroSemanaAnterior) * 100
    : 0;

  const gerarAnaliseIA = async () => {
    if (registros.length === 0) {
      alert('⚠️ Você ainda não tem registros suficientes para gerar uma análise.');
      return;
    }

    setLoadingIA(true);

    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Com base nas métricas abaixo, gere uma frase curta avaliando o desempenho geral e sugerindo uma melhoria:

Métricas:
- Lucro semanal: R$ ${lucroSemanal.toFixed(2)}
- Lucro mensal: R$ ${lucroMensal.toFixed(2)}
- Média R$/hora: R$ ${mediaPorHora.toFixed(2)}
- Média R$/km: R$ ${mediaPorKm.toFixed(2)}
- Total de horas no mês: ${totalHorasMes.toFixed(1)}h
- Total de km no mês: ${totalKmMes.toFixed(0)}km
- Comparativo semanal: ${comparativoSemanal > 0 ? '+' : ''}${comparativoSemanal.toFixed(1)}%

Seja direto, motivador e sugira UMA ação prática. Máximo 3 linhas.`
        }),
      });

      const data = await response.json();
      setAnaliseIA(data.insight);
    } catch (error) {
      setAnaliseIA('Continue acompanhando suas métricas e ajustando sua estratégia para maximizar seus ganhos!');
    } finally {
      setLoadingIA(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl mb-4 shadow-2xl">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Meu Desempenho
        </h1>
        <p className="text-gray-600 text-lg">Análise completa dos seus resultados</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        </div>
      ) : registros.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum registro encontrado.</p>
          <p className="text-gray-400 text-sm mt-2">Comece a registrar seus giros para ver suas métricas!</p>
        </div>
      ) : (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lucro Semanal */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Lucro Semanal</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(lucroSemanal)}</p>
              {comparativoSemanal !== 0 && (
                <p className={`text-xs mt-2 font-bold ${comparativoSemanal > 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {comparativoSemanal > 0 ? '↑' : '↓'} {Math.abs(comparativoSemanal).toFixed(1)}% vs semana anterior
                </p>
              )}
            </div>

            {/* Lucro Mensal */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Lucro Mensal</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(lucroMensal)}</p>
            </div>

            {/* Média R$/Hora */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Média R$/Hora</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(mediaPorHora)}</p>
            </div>

            {/* Média R$/KM */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-7 h-7 text-white" />
                <span className="text-sm text-white/90 font-medium">Média R$/KM</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(mediaPorKm)}</p>
            </div>
          </div>

          {/* Métricas Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KM Total */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">KM Total Rodado</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalKmMes.toFixed(0)} km</p>
            </div>

            {/* Horas Trabalhadas */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Horas no Mês</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalHorasMes.toFixed(1)}h</p>
            </div>

            {/* Melhor Dia */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Melhor Dia</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {melhorDia ? formatarMoeda(melhorDia.lucro) : 'N/A'}
              </p>
              {melhorDia && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(melhorDia.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Dias Trabalhados */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Dias Trabalhados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{registrosMes.length} dias</p>
            </div>
          </div>

          {/* Botão Análise IA */}
          <div className="flex justify-center">
            <button
              onClick={gerarAnaliseIA}
              disabled={loadingIA}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loadingIA ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Analisando...
                </span>
              ) : (
                '🤖 Gerar Análise com IA'
              )}
            </button>
          </div>

          {/* Análise IA */}
          {analiseIA && (
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl shadow-xl p-6 border-2 border-purple-300 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-3 text-xl">Análise do Seu Desempenho</h3>
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-gray-800 text-lg leading-relaxed font-medium">{analiseIA}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
