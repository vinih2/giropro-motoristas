'use client';

import { useState } from 'react';
import { calcularSimuladorMensal, formatarMoeda } from '@/lib/calculations';
import { TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

export default function Simulador() {
  const [ganhoDiario, setGanhoDiario] = useState('');
  const [diasSemana, setDiasSemana] = useState('');
  const [custoDiario, setCustoDiario] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [meta, setMeta] = useState('');
  const [analise, setAnalise] = useState('');

  const handleSimular = () => {
    const dados = {
      ganhoDiarioMedio: parseFloat(ganhoDiario),
      diasPorSemana: parseFloat(diasSemana),
      custoDiarioMedio: parseFloat(custoDiario),
    };

    const calc = calcularSimuladorMensal(dados);
    setResultado(calc);

    // Gerar análise
    const lucroLiquido = parseFloat(ganhoDiario) - parseFloat(custoDiario);
    const horasNecessarias = meta ? (parseFloat(meta) / calc.lucroMensal) * (parseFloat(diasSemana) * 4.33) : 0;
    
    let analiseTexto = `Com esse ritmo, você terá um lucro líquido de ${formatarMoeda(calc.lucroMensal)} por mês. `;
    
    if (calc.lucroMensal >= 3000) {
      analiseTexto += 'Excelente! Você está no caminho certo. ';
    } else if (calc.lucroMensal >= 2000) {
      analiseTexto += 'Bom resultado! Considere aumentar os dias ou otimizar custos. ';
    } else {
      analiseTexto += 'Há espaço para melhorar. Tente aumentar dias trabalhados ou reduzir custos. ';
    }

    if (meta && parseFloat(meta) > calc.lucroMensal) {
      const diasExtras = Math.ceil((parseFloat(meta) - calc.lucroMensal) / (lucroLiquido * 4.33));
      analiseTexto += `Para atingir sua meta de ${formatarMoeda(parseFloat(meta))}, você precisaria trabalhar mais ${diasExtras} dia(s) por semana.`;
    } else if (meta) {
      analiseTexto += `Parabéns! Você já está superando sua meta de ${formatarMoeda(parseFloat(meta))}!`;
    }

    setAnalise(analiseTexto);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Simulador de Lucro Mensal
        </h1>
        <p className="text-gray-600">Planeje seus ganhos e defina suas metas</p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="space-y-4">
          {/* Ganho Diário Médio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Ganho Diário Médio (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={ganhoDiario}
              onChange={(e) => setGanhoDiario(e.target.value)}
              placeholder="150.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Dias por Semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Dias Trabalhados por Semana
            </label>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dia) => (
                <button
                  key={dia}
                  onClick={() => setDiasSemana(dia.toString())}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    diasSemana === dia.toString()
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* Custo Diário Médio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo Diário Médio (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={custoDiario}
              onChange={(e) => setCustoDiario(e.target.value)}
              placeholder="60.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Meta (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Meta Mensal (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder="3000.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botão */}
          <button
            onClick={handleSimular}
            disabled={!ganhoDiario || !diasSemana || !custoDiario}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Simular Lucro
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4">
          {/* Cards de Projeção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-6 h-6 text-white" />
                <span className="text-sm text-white/90">Lucro Semanal</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {formatarMoeda(resultado.lucroSemanal)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
                <span className="text-sm text-white/90">Lucro Mensal</span>
              </div>
              <p className="text-4xl font-bold text-white">
                {formatarMoeda(resultado.lucroMensal)}
              </p>
            </div>
          </div>

          {/* Análise */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 rounded-full p-2 mt-1">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">📊 Análise e Metas</h3>
                <p className="text-gray-700 leading-relaxed">{analise}</p>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">💡 Dicas para Atingir Suas Metas</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Trabalhe nos horários de pico para maximizar ganhos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Reduza custos otimizando rotas e combustível</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Use múltiplas plataformas para aumentar demanda</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Acompanhe seus resultados diariamente no Dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
