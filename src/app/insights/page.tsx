'use client';

import { useState } from 'react';
import { Plataforma } from '@/lib/types';
import { Lightbulb, Clock, MapPin, TrendingUp, Zap } from 'lucide-react';

export default function Insights() {
  const [cidade, setCidade] = useState('');
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [horario, setHorario] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  const handleGerar = async () => {
    setLoading(true);
    
    // Simular geração de insights (em produção, usar API de IA)
    setTimeout(() => {
      const insightsGerados = gerarInsights(cidade, plataforma, horario);
      setInsights(insightsGerados);
      setLoading(false);
    }, 1500);
  };

  const gerarInsights = (cidade: string, plataforma: Plataforma, horario: string): string[] => {
    const insights: string[] = [];

    // Horários de pico por plataforma
    if (plataforma === 'Uber' || plataforma === '99') {
      insights.push('🕐 **Melhores Horários**: 6h-9h (manhã), 12h-14h (almoço), 17h-20h (volta do trabalho)');
      insights.push('💡 **Dica**: Fique próximo a estações de metrô e terminais de ônibus nos horários de pico');
      insights.push('⚠️ **Evite**: 10h-11h e 14h-16h costumam ser horários mortos');
    } else if (plataforma === 'iFood' || plataforma === 'Rappi') {
      insights.push('🕐 **Melhores Horários**: 11h30-14h (almoço), 18h-21h (jantar)');
      insights.push('💡 **Dica**: Fique próximo a restaurantes populares e áreas comerciais');
      insights.push('⚠️ **Evite**: 15h-17h geralmente tem menos pedidos');
    } else {
      insights.push('🕐 **Melhores Horários**: Varia por plataforma - teste diferentes períodos');
      insights.push('💡 **Dica**: Acompanhe os horários de maior demanda na sua região');
    }

    // Estratégias gerais
    insights.push('🎯 **Estratégia**: Reduza deslocamentos vazios - aceite corridas próximas quando possível');
    insights.push('⛽ **Economia**: Planeje rotas para evitar trânsito pesado e economizar combustível');
    
    // Análise por cidade
    if (cidade.toLowerCase().includes('são paulo') || cidade.toLowerCase().includes('sp')) {
      insights.push('📍 **Região**: Em SP, regiões como Pinheiros, Vila Madalena e Itaim têm alta demanda');
    } else if (cidade.toLowerCase().includes('rio')) {
      insights.push('📍 **Região**: No Rio, Zona Sul e Barra costumam ter boa demanda');
    }

    // Dica de combustível
    insights.push('⚡ **Combustível**: Abasteça em postos mais baratos - economize até R$ 20/dia');

    return insights;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dicas para Melhorar Seu Giro
        </h1>
        <p className="text-gray-600">Insights personalizados para você ganhar mais</p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="space-y-4">
          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Sua Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="São Paulo"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Plataforma que Usa Mais
            </label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value as Plataforma)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {plataformas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Horário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Horário que Costuma Trabalhar
            </label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ex: 7h às 15h"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botão */}
          <button
            onClick={handleGerar}
            disabled={!cidade || !horario || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? 'Gerando Insights...' : 'Gerar Insights'}
          </button>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Seus Insights Personalizados
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <p className="text-gray-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card de Ação */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-xl mb-2">🚀 Próximo Passo</h3>
            <p className="leading-relaxed">
              Teste essas dicas nos próximos dias e acompanhe seus resultados no Dashboard. 
              Ajuste sua estratégia conforme necessário para maximizar seus ganhos!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
