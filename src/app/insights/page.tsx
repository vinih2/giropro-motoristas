'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { Lightbulb, MapPin, TrendingUp, Zap, Target, CloudRain, Sun, Cloud } from 'lucide-react';
import dynamic from 'next/dynamic';

// 👇 ESSA PARTE É CRUCIAL PARA O MAPA APARECER
const MapWidget = dynamic(() => import('@/components/MapWidget'), { 
  ssr: false,
  loading: () => <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
});

const CIDADES_BRASIL = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Fortaleza', 
  'Curitiba', 'Manaus', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos', 
  'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 
  'Campo Grande', 'Teresina', 'São Bernardo do Campo', 'João Pessoa', 'Osasco', 
  'Santo André', 'Uberlândia', 'Sorocaba', 'Ribeirão Preto', 'Florianópolis',
  'Cuiabá', 'Aracaju', 'Vitória'
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
  const [loading, setLoading] = useState(false);
  
  const [clima, setClima] = useState<any>(null);

  useEffect(() => {
    if (cidade) {
      fetch(`/api/weather?cidade=${cidade}`)
        .then(res => res.json())
        .then(data => { if (!data.error) setClima(data); })
        .catch(err => console.error("Erro clima:", err));
    }
  }, [cidade]);

  const handleGerar = async () => {
    if (!cidade) return alert('⚠️ Selecione sua cidade!');
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
          prompt: `Estou em ${cidade} (${clima ? clima.descricao : ''}), vou rodar na ${plataforma} no turno ${horarioFinal}. Me dê uma estratégia de ouro.`
        }),
      });
      
      const data = await response.json();
      setInsightRapido(data.insight);
    } catch (error) {
      setInsightRapido("Erro ao gerar insight. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getClimaStyle = () => {
    if (!clima) return { bg: 'from-gray-500 to-gray-700', icon: <Cloud />, texto: 'Aguardando cidade...' };
    const main = clima.principal;
    if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return { bg: 'from-blue-600 to-indigo-700', icon: <CloudRain />, texto: 'Chuva detectada! Dinâmica deve subir.' };
    if (main === 'Clear') return { bg: 'from-orange-400 to-amber-500', icon: <Sun />, texto: 'Céu limpo. Bom para rodar tranquilo.' };
    return { bg: 'from-gray-400 to-slate-500', icon: <Cloud />, texto: 'Nublado. Movimento constante.' };
  };

  const estiloClima = getClimaStyle();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Insights Inteligentes
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Estratégia baseada em dados reais</p>
      </div>

      {/* WIDGET CLIMA */}
      <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-500 bg-gradient-to-r ${estiloClima.bg}`}>
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wide">Previsão em Tempo Real</p>
                <h3 className="text-3xl font-bold flex items-center gap-3">
                    {estiloClima.icon}
                    {clima ? `${clima.temp}°C` : '--°C'}
                </h3>
                <p className="mt-2 text-white/90 font-medium text-sm md:text-base">
                    {clima ? `${clima.descricao} em ${cidade}` : 'Selecione uma cidade abaixo'}
                </p>
                {clima && <p className="mt-1 text-xs bg-black/20 inline-block px-2 py-1 rounded-lg">💡 {estiloClima.texto}</p>}
            </div>
            <div className="absolute -right-6 -bottom-10 opacity-20 transform scale-150">{estiloClima.icon}</div>
        </div>
      </div>

      {/* ✅ MAPA: SÓ APARECE SE TIVER CIDADE SELECIONADA */}
      {cidade && (
        <div className="animate-fade-in">
           <MapWidget cidade={cidade} />
        </div>
      )}

      {/* CONFIGURADOR */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" /> Configurar Rota
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <MapPin className="w-4 h-4 inline mr-1" /> Sua Cidade
            </label>
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-5 py-4 text-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
            >
              <option value="">Selecione...</option>
              {CIDADES_BRASIL.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-1" /> Plataforma
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Uber', '99', 'iFood', 'Rappi'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlataforma(p as any)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    plataforma === p
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGerar}
            disabled={!cidade || loading}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-purple-500 text-white font-bold py-5 text-xl rounded-xl hover:opacity-90 transition-all shadow-xl"
          >
            {loading ? 'Analisando Dados...' : '✨ Gerar Estratégia'}
          </button>
        </div>
      </div>

      {insightRapido && (
        <div className="animate-fade-in bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-2xl shadow-xl p-6 border-2 border-purple-300 dark:border-purple-700">
          <div className="flex items-start gap-4">
            <div className="bg-purple-600 rounded-2xl p-3 shadow-lg text-white">
              <Lightbulb className="w-7 h-7" />
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-line">{insightRapido}</p>
          </div>
        </div>
      )}
    </div>
  );
}
