'use client';

import { useState } from 'react';
import { Plataforma } from '@/lib/types';
import { Lightbulb, Clock, MapPin, TrendingUp, Zap, Target, CloudRain, Sun } from 'lucide-react';

const CIDADES_BRASIL = [
  'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Campinas - SP', 'Guarulhos - SP',
  'Curitiba - PR', 'Porto Alegre - RS', 'Salvador - BA', 'Fortaleza - CE', 'Recife - PE', 
  'Brasília - DF', 'Goiânia - GO', 'Manaus - AM', 'Belém - PA'
];

const TURNOS = [
  { id: 'manha', label: 'Manhã', horario: '5h–11h', icon: '🌅' },
  { id: 'tarde', label: 'Tarde', horario: '11h–17h', icon: '☀️' },
  { id: 'noite', label: 'Noite', horario: '17h–23h', icon: '🌆' },
  { id: 'madrugada', label: 'Madrugada', horario: '23h–5h', icon: '🌙' },
  { id: 'personalizado', label: 'Personalizado', horario: '', icon: '⚙️' },
];

export default function Insights() {
  const [cidade, setCidade] = useState('');
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [turno, setTurno] = useState('manha');
  const [horarioPersonalizado, setHorarioPersonalizado] = useState('');
  const [insightRapido, setInsightRapido] = useState('');
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  const handleGerar = async () => {
    if (!cidade) return alert('⚠️ Selecione sua cidade!');
    if (turno === 'personalizado' && !horarioPersonalizado) return alert('⚠️ Informe o horário!');

    setLoading(true);
    
    const turnoSelecionado = TURNOS.find(t => t.id === turno);
    const horarioFinal = turno === 'personalizado' ? horarioPersonalizado : turnoSelecionado?.horario;
    
    try {
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cidade,
          plataforma,
          turno: horarioFinal,
          prompt: `Cidade: ${cidade}\nPlataforma: ${plataforma}\nTurno: ${horarioFinal}\n\nGere:\n1. Insight rápido sobre o giro.\n2. Três recomendações de locais.\n3. Uma dica de lucro.\n4. Frase motivadora.\n\nFormato:\nINSIGHT: ...\nREC1: ...\nREC2: ...\nREC3: ...\nDICA: ...\nMOTIVACAO: ...`
        }),
      });
      
      const data = await response.json();
      
      // Se der erro na API, data.insight conterá a mensagem de erro tratada
      const texto = data.insight || "";
      
      // Tenta fazer o parse da resposta da IA
      const insightMatch = texto.match(/INSIGHT:\s*(.+?)(?=REC1:|$)/s);
      const rec1Match = texto.match(/REC1:\s*(.+?)(?=REC2:|$)/s);
      const rec2Match = texto.match(/REC2:\s*(.+?)(?=REC3:|$)/s);
      const rec3Match = texto.match(/REC3:\s*(.+?)(?=DICA:|$)/s);
      const dicaMatch = texto.match(/DICA:\s*(.+?)(?=MOTIVACAO:|$)/s);
      const motivacaoMatch = texto.match(/MOTIVACAO:\s*(.+?)$/s);
      
      if (insightMatch) {
        const insightTexto = insightMatch[1].trim();
        const dicaTexto = dicaMatch ? dicaMatch[1].trim() : '';
        const motivacaoTexto = motivacaoMatch ? motivacaoMatch[1].trim() : '';
        setInsightRapido(`${insightTexto}\n\n💡 ${dicaTexto}\n\n🚀 ${motivacaoTexto}`);
        
        const recs = [];
        if (rec1Match) recs.push(rec1Match[1].trim());
        if (rec2Match) recs.push(rec2Match[1].trim());
        if (rec3Match) recs.push(rec3Match[1].trim());
        setRecomendacoes(recs);
      } else {
        // Fallback caso a IA não siga o formato ou seja o Mock simples
        setInsightRapido(texto);
        setRecomendacoes([]);
      }
      
    } catch (error) {
      console.error(error);
      setInsightRapido("Não foi possível gerar insights agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          Dicas para Melhorar Seu Giro
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Insights personalizados para você ganhar mais</p>
      </div>

      {/* --- WIDGET DE CLIMA (NOVO) --- */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-blue-100 text-sm font-medium mb-1 flex items-center gap-2">
                  <CloudRain size={16} /> Previsão para Motoristas
                </p>
                <h3 className="text-2xl font-bold">Alta probabilidade de chuva</h3>
                <p className="mt-1 text-blue-50 text-sm">A partir das 17h. Prepare-se para dinâmica alta!</p>
            </div>
            <div className="text-right hidden sm:block">
                <p className="text-4xl font-bold">24°C</p>
                <p className="text-sm opacity-80">São Paulo</p>
            </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12 pointer-events-none"></div>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Suas Informações
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <MapPin className="w-4 h-4 inline mr-1" /> Sua Cidade
            </label>
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione sua cidade</option>
              {CIDADES_BRASIL.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-1" /> Plataforma
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {plataformas.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlataforma(p)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    plataforma === p
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <Clock className="w-4 h-4 inline mr-1" /> Horário
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TURNOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTurno(t.id)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    turno === t.id
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-lg mb-1">{t.icon}</div>
                  <div className="text-xs">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGerar}
            disabled={!cidade || loading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-purple-500 text-white font-bold py-5 text-xl rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl transform active:scale-95"
          >
            {loading ? 'Gerando Insights...' : '✨ Gerar Insights Personalizados'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {insightRapido && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl p-6 border-2 border-purple-300 dark:border-purple-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-xl">
              <Lightbulb className="w-6 h-6 text-purple-600" /> Insight Rápido
            </h3>
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-line font-medium">
              {insightRapido}
            </p>
          </div>

          {recomendacoes.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-xl">
                <Target className="w-6 h-6 text-green-600" /> Recomendações
              </h3>
              <div className="space-y-3">
                {recomendacoes.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="bg-green-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
