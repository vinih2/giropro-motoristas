'use client';

import { useState, useEffect } from 'react';
import { formatarMoeda } from '@/lib/calculations';
import { Calendar, TrendingUp, Clock, Navigation, DollarSign, Lightbulb } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Registro {
  id: number;
  user_id: string;
  data: string;
  plataforma: string;
  horas: number;
  km: number;
  ganho_bruto: number;
  custo_km: number;
  lucro: number;
}

function HistoricoContent() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState('');
  const [loadingResumo, setLoadingResumo] = useState(false);

  useEffect(() => {
    if (user) {
      carregarRegistros();
    }
  }, [user]);

  const carregarRegistros = async () => {
    if (!user) return;

    try {
      // Tentar carregar do Supabase primeiro
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao carregar do Supabase:', error);
        // Fallback para localStorage
        carregarDoLocalStorage();
      } else if (data) {
        setRegistros(data);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      carregarDoLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const carregarDoLocalStorage = () => {
    try {
      const dados = localStorage.getItem('registros');
      if (dados) {
        const todosRegistros = JSON.parse(dados);
        // Filtrar apenas registros do usuário atual
        const registrosUsuario = todosRegistros.filter(
          (r: Registro) => r.user_id === user?.id || r.user_id === 'local'
        );
        setRegistros(registrosUsuario);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  };

  const gerarResumoSemanal = async () => {
    if (registros.length === 0) {
      alert('⚠️ Você ainda não tem registros suficientes para gerar um resumo.');
      return;
    }

    setLoadingResumo(true);

    // Calcular métricas
    const ultimosSete = registros.slice(0, 7);
    const totalLucro = ultimosSete.reduce((acc, r) => acc + r.lucro, 0);
    const totalHoras = ultimosSete.reduce((acc, r) => acc + r.horas, 0);
    const totalKm = ultimosSete.reduce((acc, r) => acc + r.km, 0);
    const mediaPorHora = totalHoras > 0 ? totalLucro / totalHoras : 0;
    const mediaPorKm = totalKm > 0 ? totalLucro / totalKm : 0;

    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analise os registros recentes do motorista e gere:

- média por hora: R$ ${mediaPorHora.toFixed(2)}
- média por km: R$ ${mediaPorKm.toFixed(2)}
- total de dias trabalhados: ${ultimosSete.length}
- lucro total da semana: R$ ${totalLucro.toFixed(2)}
- total de horas: ${totalHoras.toFixed(1)}h
- total de km: ${totalKm.toFixed(1)}km

Gere uma análise com:
1. Avaliação do desempenho semanal (excelente/bom/regular/precisa melhorar)
2. Padrão identificado nos últimos dias
3. Dica prática para aumentar o lucro esta semana
4. Frase motivadora

Tom direto e amigável. Máximo 5 linhas.`
        }),
      });

      const data = await response.json();
      setResumoSemanal(data.insight);
    } catch (error) {
      setResumoSemanal(`📊 Resumo da Semana\n\nVocê trabalhou ${ultimosSete.length} dias, totalizando ${totalHoras.toFixed(1)}h e ${totalKm.toFixed(0)}km rodados.\n\nMédia: ${formatarMoeda(mediaPorHora)}/hora e ${formatarMoeda(mediaPorKm)}/km.\n\n💡 Continue acompanhando seus resultados para identificar os melhores horários e maximizar seus ganhos!`);
    } finally {
      setLoadingResumo(false);
    }
  };

  const getBadge = (lucro: number, horas: number) => {
    const lucroPorHora = horas > 0 ? lucro / horas : 0;
    if (lucroPorHora < 12) return { label: 'Fraco', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' };
    if (lucroPorHora < 20) return { label: 'Médio', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' };
    return { label: 'Bom', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl mb-4 shadow-2xl">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          Histórico de Giros
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Acompanhe todos os seus registros</p>
      </div>

      {/* Botão Gerar Resumo */}
      {registros.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={gerarResumoSemanal}
            disabled={loadingResumo}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loadingResumo ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Gerando Resumo...
              </span>
            ) : (
              '📊 Gerar Resumo Semanal'
            )}
          </button>
        </div>
      )}

      {/* Resumo Semanal */}
      {resumoSemanal && (
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-2xl shadow-xl p-6 border-2 border-purple-300 dark:border-purple-700 animate-fade-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-xl">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            Resumo Semanal
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-line font-medium">{resumoSemanal}</p>
          </div>
        </div>
      )}

      {/* Lista de Registros */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Seus Registros
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum registro encontrado.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Comece a registrar seus giros no Dashboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registros.map((registro) => {
              const badge = getBadge(registro.lucro, registro.horas);
              const lucroPorHora = registro.horas > 0 ? registro.lucro / registro.horas : 0;

              return (
                <div
                  key={registro.id}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Data e Plataforma */}
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white rounded-xl p-3">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{registro.plataforma}</p>
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Horas</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">{registro.horas}h</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Navigation className="w-4 h-4" />
                          <span className="text-xs font-medium">KM</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">{registro.km}km</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">R$/Hora</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">{formatarMoeda(lucroPorHora)}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs font-medium">Lucro</span>
                        </div>
                        <p className="font-bold text-green-600 dark:text-green-400 text-lg">{formatarMoeda(registro.lucro)}</p>
                      </div>
                    </div>

                    {/* Badge */}
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Historico() {
  return (
    <ProtectedRoute>
      <HistoricoContent />
    </ProtectedRoute>
  );
}
