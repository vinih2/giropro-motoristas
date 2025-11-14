'use client';

import { Crown, Zap, TrendingUp, BarChart3, MapPin, Fuel, Bell, Check, Clock } from 'lucide-react';

export default function GiroProPlus() {
  const recursos = [
    {
      icon: Clock,
      titulo: 'Horários Personalizados (IA)',
      descricao: 'Recomendações de horários baseadas no seu histórico e padrões de demanda da sua região'
    },
    {
      icon: BarChart3,
      titulo: 'Análise Avançada do Estilo de Trabalho',
      descricao: 'Entenda seu perfil de trabalho e receba insights personalizados para otimizar seus ganhos'
    },
    {
      icon: TrendingUp,
      titulo: 'Relatório Semanal Completo',
      descricao: 'Relatórios detalhados com gráficos, tendências e comparativos automáticos'
    },
    {
      icon: Zap,
      titulo: 'Comparação Automática Semana/Semana',
      descricao: 'Acompanhe sua evolução com comparativos automáticos e identifique oportunidades'
    },
    {
      icon: MapPin,
      titulo: 'Melhores Regiões do Dia',
      descricao: 'Descubra em tempo real as regiões com maior demanda e melhores ganhos'
    },
    {
      icon: Fuel,
      titulo: 'Sugestão Avançada Gasolina x Etanol',
      descricao: 'Análise inteligente considerando preços, consumo e rotas para máxima economia'
    },
    {
      icon: Bell,
      titulo: 'Alertas Inteligentes Personalizados',
      descricao: 'Notificações sobre horários de pico, mudanças de preço e oportunidades de ganho'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header Premium */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl mb-4 shadow-2xl animate-pulse">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-500 bg-clip-text text-transparent mb-3">
          GiroPro+
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-xl mb-2">Recursos Profissionais para Aumentar Sua Renda</p>
        <p className="text-gray-500 dark:text-gray-400">Desbloqueie todo o potencial do GiroPro</p>
      </div>

      {/* Banner Destaque */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl shadow-2xl p-8 text-white text-center">
        <Crown className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-3">Ganhe Até 30% Mais com Insights Profissionais</h2>
        <p className="text-lg text-white/90 mb-6">
          Motoristas GiroPro+ aumentam seus ganhos em média 25-30% nos primeiros 3 meses
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
            <p className="text-sm text-white/80">Mais de</p>
            <p className="text-3xl font-bold">5.000+</p>
            <p className="text-sm text-white/80">motoristas premium</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
            <p className="text-sm text-white/80">Avaliação</p>
            <p className="text-3xl font-bold">4.9⭐</p>
            <p className="text-sm text-white/80">de satisfação</p>
          </div>
        </div>
      </div>

      {/* Recursos Premium */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-yellow-200 dark:border-yellow-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-yellow-600" />
          Recursos Exclusivos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {recursos.map((recurso, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-gray-50 to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800/50 hover:border-yellow-400 transition-all hover:shadow-xl group"
            >
              {/* Badge "Premium" */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                PREMIUM
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                  <recurso.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{recurso.titulo}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{recurso.descricao}</p>
                </div>
              </div>

              {/* Overlay de bloqueio */}
              <div className="absolute inset-0 bg-gray-900/5 dark:bg-black/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-xl">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">🔒 Disponível no GiroPro+</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparação Gratuito vs Premium */}
        <div className="bg-gradient-to-r from-gray-100 to-yellow-100 dark:from-gray-800 dark:to-yellow-900/30 rounded-2xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Gratuito vs Premium</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gratuito */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-xl">Versão Gratuita</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Cálculo de giro básico</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Custo por KM</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Insights gerais</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Histórico simples</span>
                </li>
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border-2 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                RECOMENDADO
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-xl flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                GiroPro+
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Tudo da versão gratuita +</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Horários personalizados com IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Análise avançada de desempenho</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Relatórios semanais automáticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Melhores regiões em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Alertas inteligentes personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Suporte prioritário</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Mensal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-300 dark:border-gray-700 hover:border-yellow-400 transition-all hover:shadow-xl">
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Plano Mensal</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">R$ 9</span>
                <span className="text-2xl text-gray-600 dark:text-gray-400">,90</span>
                <span className="text-gray-500 dark:text-gray-500">/mês</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cancele quando quiser</p>
            </div>
            <button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white font-bold py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Assinar Mensal
            </button>
          </div>

          {/* Plano Anual */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-yellow-400 hover:border-yellow-500 transition-all hover:shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-1 rounded-full">
              ECONOMIZE 33%
            </div>
            <div className="text-center mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Plano Anual</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">R$ 79</span>
                <span className="text-2xl text-gray-600 dark:text-gray-400">,90</span>
                <span className="text-gray-500 dark:text-gray-500">/ano</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold mt-2">R$ 6,66/mês • Economize R$ 39/ano</p>
            </div>
            <button className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white font-bold py-4 rounded-xl hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              Assinar Anual (Melhor Oferta)
            </button>
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-full font-bold">
            <Check className="w-5 h-5" />
            Garantia de 7 dias - 100% do seu dinheiro de volta
          </div>
        </div>
      </div>

      {/* Depoimentos */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">O Que Dizem Nossos Usuários Premium</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"Aumentei meus ganhos em 28% no primeiro mês! Os insights de horários são incríveis."</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Carlos, Uber - São Paulo</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"Finalmente consigo planejar minha semana e sei exatamente onde e quando trabalhar."</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Ana, 99 - Rio de Janeiro</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"Melhor investimento que fiz! Paga sozinho em menos de uma semana de trabalho."</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">João, iFood - Belo Horizonte</p>
          </div>
        </div>
      </div>
    </div>
  );
}
