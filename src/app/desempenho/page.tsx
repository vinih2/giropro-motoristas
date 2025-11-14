'use client';

import { useState, useEffect } from 'react';
import { formatarMoeda } from '@/lib/calculations';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Navigation,
  DollarSign,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

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

function DesempenhoContent() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [analiseIA, setAnaliseIA] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    if (user) carregarDados();
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: true });

      if (error) {
        console.error('Erro ao carregar do Supabase:', error);
      }

      if (data) setRegistros(data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Cálculos ---
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - 7);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const registrosSemana = registros.filter((r) => new Date(r.data) >= inicioSemana);
  const registrosMes = registros.filter((r) => new Date(r.data) >= inicioMes);

  const lucroSemanal = registrosSemana.reduce((acc, r) => acc + r.lucro, 0);
  const lucroMensal = registrosMes.reduce((acc, r) => acc + r.lucro, 0);

  const totalHorasMes = registrosMes.reduce((acc, r) => acc + r.horas, 0);
  const totalKmMes = registrosMes.reduce((acc, r) => acc + r.km, 0);

  const mediaPorHora = totalHorasMes > 0 ? lucroMensal / totalHorasMes : 0;
  const mediaPorKm = totalKmMes > 0 ? lucroMensal / totalKmMes : 0;

  const melhorDia =
    registros.length > 0
      ? registros.reduce((max, r) => (r.lucro > max.lucro ? r : max), registros[0])
      : null;

  // AGRUPAR dados por dia para gráficos
  const dadosDiarios = registrosMes.map((r) => ({
    data: new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short',
    }),
    lucro: r.lucro,
    horas: r.horas,
    km: r.km,
    plataforma: r.plataforma,
  }));

  // Agrupar plataforma
  const plataformasContagem: { [key: string]: number } = {};
  registrosMes.forEach((r) => {
    plataformasContagem[r.plataforma] = (plataformasContagem[r.plataforma] || 0) + 1;
  });

  const dadosPlataforma = Object.entries(plataformasContagem).map(([nome, valor]) => ({
    name: nome,
    value: valor,
  }));

  const cores = ['#ff7f50', '#33b5e5', '#aa66cc', '#99cc00', '#ffbb33', '#ff4444'];

  // ----- IA -----
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
          prompt: `Resuma o desempenho mensal abaixo em até 3 linhas:
Lucro Mensal: R$ ${lucroMensal.toFixed(2)}
Lucro Semanal: R$ ${lucroSemanal.toFixed(2)}
Média por hora: R$ ${mediaPorHora.toFixed(2)}
Média por km: R$ ${mediaPorKm.toFixed(2)}
Total horas: ${totalHorasMes.toFixed(1)}h
Total km: ${totalKmMes.toFixed(0)}km

Dê uma dica prática e motivacional.`,
        }),
      });

      const data = await response.json();
      setAnaliseIA(data.insight);
    } catch (error) {
      setAnaliseIA('Continue registrando seus giros para melhorar sua performance!');
    } finally {
      setLoadingIA(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">📈 Meu Desempenho</h1>
        <p className="text-gray-500 text-lg">Análise completa dos seus resultados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Lucro Semanal */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl">
          <p className="font-bold text-sm">Lucro semanal</p>
          <p className="text-4xl font-bold">{formatarMoeda(lucroSemanal)}</p>
        </div>

        {/* Lucro Mensal */}
        <div className="bg-green-500 text-white rounded-2xl p-6 shadow-xl">
          <p className="font-bold text-sm">Lucro mensal</p>
          <p className="text-4xl font-bold">{formatarMoeda(lucroMensal)}</p>
        </div>

        {/* Média por Hora */}
        <div className="bg-purple-600 text-white rounded-2xl p-6 shadow-xl">
          <p className="font-bold text-sm">Média R$/hora</p>
          <p className="text-4xl font-bold">{formatarMoeda(mediaPorHora)}</p>
        </div>

        {/* Média por km */}
        <div className="bg-orange-500 text-white rounded-2xl p-6 shadow-xl">
          <p className="font-bold text-sm">Média R$/km</p>
          <p className="text-4xl font-bold">{formatarMoeda(mediaPorKm)}</p>
        </div>
      </div>

      {/* GRÁFICO — LUCRO POR DIA */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Lucro por dia</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <LineChart data={dadosDiarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lucro" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO — HORAS POR DIA */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Horas por dia</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={dadosDiarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="horas" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO — Plataformas */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Plataformas mais usadas</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dadosPlataforma}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {dadosPlataforma.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* IA */}
      <div className="text-center">
        <button
          onClick={gerarAnaliseIA}
          disabled={loadingIA}
          className="bg-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-purple-700 transition"
        >
          {loadingIA ? 'Gerando análise...' : '🤖 Gerar análise com IA'}
        </button>
      </div>

      {analiseIA && (
        <div className="bg-purple-100 border border-purple-300 p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-2">Análise da semana</h3>
          <p>{analiseIA}</p>
        </div>
      )}
    </div>
  );
}

export default function Desempenho() {
  return (
    <ProtectedRoute>
      <DesempenhoContent />
    </ProtectedRoute>
  );
}
