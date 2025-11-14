'use client';

import { useState } from 'react';
import { Plataforma } from '@/lib/types';
import { Lightbulb, Clock, MapPin, TrendingUp, Zap, Target } from 'lucide-react';

const CIDADES_BRASIL = [
  // Sudeste
  'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Campinas - SP', 'Guarulhos - SP',
  'São Bernardo do Campo - SP', 'Santo André - SP', 'Osasco - SP', 'Ribeirão Preto - SP', 'Sorocaba - SP',
  'Uberlândia - MG', 'Contagem - MG', 'Juiz de Fora - MG', 'Niterói - RJ', 'Duque de Caxias - RJ',
  // Sul
  'Curitiba - PR', 'Porto Alegre - RS', 'Florianópolis - SC', 'Joinville - SC', 'Londrina - PR',
  'Caxias do Sul - RS', 'Maringá - PR', 'Ponta Grossa - PR', 'Blumenau - SC', 'Pelotas - RS',
  // Nordeste
  'Salvador - BA', 'Fortaleza - CE', 'Recife - PE', 'São Luís - MA', 'Maceió - AL',
  'Natal - RN', 'João Pessoa - PB', 'Teresina - PI', 'Aracaju - SE', 'Feira de Santana - BA',
  'Jaboatão dos Guararapes - PE', 'Olinda - PE', 'Caucaia - CE', 'Vitória da Conquista - BA',
  // Norte
  'Manaus - AM', 'Belém - PA', 'Porto Velho - RO', 'Macapá - AP', 'Boa Vista - RR',
  'Rio Branco - AC', 'Palmas - TO', 'Santarém - PA', 'Ananindeua - PA',
  // Centro-Oeste
  'Brasília - DF', 'Goiânia - GO', 'Campo Grande - MS', 'Cuiabá - MT', 'Aparecida de Goiânia - GO',
  'Anápolis - GO', 'Várzea Grande - MT', 'Dourados - MS',
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
    // Validação de campos
    if (!cidade) {
      alert('⚠️ Por favor, selecione sua cidade!');
      return;
    }

    if (turno === 'personalizado' && !horarioPersonalizado) {
      alert('⚠️ Por favor, informe o horário personalizado!');
      return;
    }

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
          prompt: `Cidade: ${cidade}
Plataforma: ${plataforma}
Turno: ${horarioFinal}

Gere:

1. Insight rápido dizendo se o giro tende a ser bom, médio ou fraco no turno selecionado.
2. Três recomendações práticas de onde e quando rodar na cidade escolhida.
3. Uma dica para aumentar o lucro em até 10–20%.
4. Uma frase final motivadora.

Tom informal, brasileiro, direto e simples.

Formato da resposta:
INSIGHT: [sua análise do giro]
REC1: [primeira recomendação]
REC2: [segunda recomendação]
REC3: [terceira recomendação]
DICA: [dica de lucro]
MOTIVACAO: [frase motivadora]`
        }),
      });
      
      const data = await response.json();
      const texto = data.insight;
      
      // Parse da resposta
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
        setInsightRapido(`${insightTexto}\n\n💡 ${dicaTexto}\n\n${motivacaoTexto}`);
      } else {
        setInsightRapido(texto);
      }
      
      const recs = [];
      if (rec1Match) recs.push(rec1Match[1].trim());
      if (rec2Match) recs.push(rec2Match[1].trim());
      if (rec3Match) recs.push(rec3Match[1].trim());
      
      setRecomendacoes(recs.length > 0 ? recs : [
        'Fique próximo a regiões comerciais e estações de transporte',
        'Trabalhe nos horários de pico (manhã e fim de tarde)',
        'Evite deslocamentos vazios planejando suas rotas'
      ]);
      
    } catch (error) {
      setInsightRapido(`📍 Análise para ${plataforma} em ${cidade}\n\nO turno selecionado (${horarioFinal}) tende a ter movimento moderado. Fique atento aos horários de pico para maximizar seus ganhos.\n\n💡 Dica: Posicione-se estrategicamente próximo a áreas com alta demanda.\n\n🚀 Continue focado e acompanhe seus resultados!`);
      setRecomendacoes([
        'Trabalhe próximo a regiões comerciais e estações de transporte',
        'Aproveite os horários de pico (6h-9h e 17h-20h)',
        'Planeje suas rotas para evitar deslocamentos vazios'
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl mb-4 shadow-2xl">
          <Lightbulb className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Dicas para Melhorar Seu Giro
        </h1>
        <p className="text-gray-600 text-lg">Insights personalizados para você ganhar mais</p>
      </div>

      {/* Seção: Entradas */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Suas Informações
        </h2>
        
        <div className="space-y-5">
          {/* Cidade - Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-1" />
              Sua Cidade
            </label>
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            >
              <option value="">Selecione sua cidade</option>
              {CIDADES_BRASIL.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Plataforma - Botões Segmentados */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Plataforma que Usa Mais
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {plataformas.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlataforma(p)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    plataforma === p
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Turno - Botões Segmentados */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Horário que Costuma Trabalhar
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TURNOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTurno(t.id)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    turno === t.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  <div className="text-lg mb-1">{t.icon}</div>
                  <div className="text-xs">{t.label}</div>
                  {t.horario && <div className="text-xs opacity-75">{t.horario}</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Horário Personalizado */}
          {turno === 'personalizado' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚙️ Informe seu horário
              </label>
              <input
                type="text"
                value={horarioPersonalizado}
                onChange={(e) => setHorarioPersonalizado(e.target.value)}
                placeholder="Ex: 7h às 15h"
                className="w-full px-5 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleGerar}
            disabled={!cidade || (turno === 'personalizado' && !horarioPersonalizado) || loading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-purple-500 text-white font-bold py-5 text-xl rounded-xl hover:from-purple-600 hover:via-pink-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Gerando Insights...
              </span>
            ) : (
              '✨ Gerar Insights Personalizados'
            )}
          </button>
        </div>
      </div>

      {/* Seção: Resultados */}
      {insightRapido && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Seus Insights
          </h2>
          
          {/* Insight Rápido */}
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl shadow-xl p-6 border-2 border-purple-300">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              Insight Rápido
            </h3>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-purple-600 border-t-transparent"></div>
                <p className="text-gray-700 font-medium">Analisando dados e gerando insights...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-medium">{insightRapido}</p>
              </div>
            )}
          </div>

          {/* Recomendações Práticas */}
          {recomendacoes.length > 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
                <Target className="w-6 h-6 text-green-600" />
                Recomendações Práticas
              </h3>
              <div className="space-y-3">
                {recomendacoes.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card de Ação */}
          {!loading && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold text-2xl mb-3">🚀 Próximo Passo</h3>
              <p className="text-lg leading-relaxed">
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
