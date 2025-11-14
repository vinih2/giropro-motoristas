'use client';

import { useState } from 'react';
import { Plataforma } from '@/lib/types';
import { Lightbulb, Clock, MapPin, TrendingUp, Zap } from 'lucide-react';

export default function Insights() {
  const [cidade, setCidade] = useState('');
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [horario, setHorario] = useState('');
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  const handleGerar = async () => {
    // Validação de campos
    if (!cidade || !horario) {
      alert('⚠️ Por favor, preencha a cidade e o horário que costuma trabalhar!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cidade,
          plataforma,
          horario,
          prompt: `Você é um consultor especializado em motoristas de aplicativo no Brasil. Analise e forneça:

1. **3 HORÁRIOS RECOMENDADOS** (manhã, tarde, noite) com justificativa
2. **REGIÕES COM MAIOR FLUXO** na cidade de ${cidade} para ${plataforma}
3. **DICA PRÁTICA** para aumentar lucro em até 15%
4. **FRASE MOTIVADORA** final

Contexto:
- Cidade: ${cidade}
- Plataforma: ${plataforma}
- Horário atual: ${horario}

Use linguagem simples, clara e brasileira. Seja objetivo e prático.`
        }),
      });
      
      const data = await response.json();
      setInsights(data.insight);
    } catch (error) {
      setInsights(`📍 **Dicas para ${plataforma} em ${cidade}**

🕐 **Melhores Horários:**
- Manhã (6h-9h): Horário de pico para deslocamento ao trabalho
- Almoço (12h-14h): Alta demanda para entregas e deslocamentos
- Noite (17h-20h): Retorno do trabalho e jantar

💡 **Dica para aumentar lucro:**
Fique próximo a regiões comerciais e estações de transporte nos horários de pico. Evite deslocamentos vazios planejando suas rotas.

🚀 Continue focado e acompanhe seus resultados diariamente!`);
    } finally {
      setLoading(false);
    }
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botão */}
          <button
            onClick={handleGerar}
            disabled={!cidade || !horario || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 text-lg rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? 'Gerando Insights...' : 'Gerar Insights'}
          </button>
        </div>
      </div>

      {/* Insights */}
      {insights && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Seus Insights Personalizados
            </h3>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                <p className="text-gray-600">Analisando dados e gerando insights...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{insights}</p>
              </div>
            )}
          </div>

          {/* Card de Ação */}
          {!loading && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-xl mb-2">🚀 Próximo Passo</h3>
              <p className="leading-relaxed">
                Teste essas dicas nos próximos dias e acompanhe seus resultados no Dashboard. 
                Ajuste sua estratégia conforme necessário para maximizar seus ganhos!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
