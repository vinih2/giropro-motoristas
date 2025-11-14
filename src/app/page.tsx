'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import VoiceInput from '@/components/VoiceInput'; // ✅ Novo Import

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custoSalvo = localStorage.getItem('custoPorKm');
      if (custoSalvo) setCustoPorKm(parseFloat(custoSalvo));
      
      const metaSalva = localStorage.getItem('metaDiaria');
      if (metaSalva) setMetaDiaria(metaSalva);
    }
  }, []);

  useEffect(() => {
    if (metaDiaria && typeof window !== 'undefined') {
      localStorage.setItem('metaDiaria', metaDiaria);
    }
  }, [metaDiaria]);

  useEffect(() => {
    if (resultado) gerarAlerta();
  }, [resultado]);

  const gerarAlerta = async () => {
    if (!resultado) return;
    const metaNum = parseFloat(metaDiaria) || 0;
    
    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Analise para motorista app: Ganho/h: R$ ${resultado.ganhoPorHora.toFixed(2)}, Custo/km: R$ ${custoPorKm.toFixed(2)}. Meta: R$ ${metaNum}. Gere alerta curto (max 2 linhas) com emoji.`
        }),
      });
      const data = await response.json();
      setAlerta(data.insight);
    } catch (error) {
      setAlerta('✅ Giro registrado! Acompanhe seus resultados.');
    }
  };

  const handleCalcular = async () => {
    if (!ganhoBruto || !horas || !km) {
      alert('⚠️ Por favor, preencha todos os campos antes de calcular!');
      return;
    }

    const dados = {
      plataforma,
      ganhoBruto: parseFloat(ganhoBruto),
      horasTrabalhadas: parseFloat(horas),
      kmRodados: parseFloat(km),
    };

    const calc = calcularGiroDia(dados, custoPorKm);
    setResultado(calc);
    setLoading(true);

    if (user) {
      supabase.from('registros').insert({
        user_id: user.id,
        data: new Date().toISOString().split('T')[0],
        plataforma,
        horas: dados.horasTrabalhadas,
        km: dados.kmRodados,
        ganho_bruto: dados.ganhoBruto,
        custo_km: custoPorKm,
        lucro: calc.lucroFinal,
      }).then(({ error }) => {
        if (error) salvarNoLocalStorage(dados, calc);
      });
    } else {
      salvarNoLocalStorage(dados, calc);
    }

    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, resultado: calc, prompt: "Gere insight curto e motivador para este resultado." }),
      });
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      setInsight('Seu giro está registrado! Continue assim.');
    } finally {
      setLoading(false);
    }
  };

  const salvarNoLocalStorage = (dados: any, calc: any) => {
    try {
      const registros = JSON.parse(localStorage.getItem('registros') || '[]');
      registros.unshift({
        id: Date.now(),
        user_id: 'local',
        data: new Date().toISOString().split('T')[0],
        ...dados,
        custo_km: custoPorKm,
        lucro: calc.lucroFinal,
      });
      localStorage.setItem('registros', JSON.stringify(registros));
    } catch (e) { console.error(e) }
  };

  const desempenho = resultado ? avaliarDesempenho(resultado.ganhoPorHora) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent mb-2">GiroPro</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Seu Coach Financeiro Pessoal</p>
      </div>

      {alerta && (
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-900 dark:text-amber-100 font-medium leading-relaxed">{alerta}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Dados do Dia
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Plataforma</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {plataformas.map((p) => (
                <button key={p} onClick={() => setPlataforma(p)} className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${plataforma === p ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-102'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💰 Ganho Bruto (R$)</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={ganhoBruto} onChange={(e) => setGanhoBruto(e.target.value)} placeholder="150.00" className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all" />
              <div className="flex items-center"><VoiceInput onResult={setGanhoBruto} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⏱️ Horas</label>
              <div className="flex gap-2">
                <input type="number" step="0.5" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="8" className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all" />
                <div className="flex items-center"><VoiceInput onResult={setHoras} /></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🛣️ KM Rodados</label>
              <div className="flex gap-2">
                <input type="number" step="0.1" value={km} onChange={(e) => setKm(e.target.value)} placeholder="120" className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all" />
                <div className="flex items-center"><VoiceInput onResult={setKm} /></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🎯 Meta do Dia (R$) - Opcional</label>
            <input type="number" step="0.01" value={metaDiaria} onChange={(e) => setMetaDiaria(e.target.value)} placeholder="200.00" className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all" />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">💡 Custo por KM atual: <span className="font-bold text-lg">{formatarMoeda(custoPorKm)}</span></p>
          </div>

          <button onClick={handleCalcular} disabled={!ganhoBruto || !horas || !km || loading} className="w-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-white font-bold py-5 text-xl rounded-xl hover:from-orange-600 hover:via-yellow-600 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]">
            {loading ? 'Calculando...' : '🚀 Calcular Meu Giro'}
          </button>
        </div>
      </div>

      {resultado && (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-7 h-7 text-white" /><span className="text-sm text-white/90 font-medium">R$/Hora</span></div>
              <p className="text-4xl font-bold text-white mb-2">{formatarMoeda(resultado.ganhoPorHora)}</p>
              {desempenho && <p className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 inline-block text-white">{desempenho.nivel}</p>}
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-3"><Navigation className="w-7 h-7 text-white" /><span className="text-sm text-white/90 font-medium">R$/KM</span></div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(resultado.ganhoPorKm)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-3"><Zap className="w-7 h-7 text-white" /><span className="text-sm text-white/90 font-medium">Custo do Dia</span></div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(resultado.custoDiario)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-3"><DollarSign className="w-7 h-7 text-white" /><span className="text-sm text-white/90 font-medium">Lucro Final</span></div>
              <p className="text-4xl font-bold text-white">{formatarMoeda(resultado.lucroFinal)}</p>
            </div>
        </div>
      )}

      {insight && (
        <div className="animate-fade-in bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 dark:from-orange-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 rounded-2xl shadow-xl p-6 border-2 border-orange-300 dark:border-orange-700">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-3 shadow-lg"><Lightbulb className="w-7 h-7 text-white" /></div>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-line flex-1">{insight}</p>
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
