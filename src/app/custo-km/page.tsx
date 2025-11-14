'use client';

import { useState, useEffect } from 'react';
import { TipoVeiculo } from '@/lib/types';
import { calcularCustoPorKm, formatarMoeda } from '@/lib/calculations';
import { Fuel, Zap, TrendingDown, Wrench, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustoKm() {
  // -- Estados Calculadora --
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>('Carro Flex');
  const [consumo, setConsumo] = useState('');
  const [preco, setPreco] = useState('');
  const [km, setKm] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loadingAPI, setLoadingAPI] = useState(false);

  // -- Estados Manutenção --
  const [kmAtual, setKmAtual] = useState('');
  const [proxTrocaOleo, setProxTrocaOleo] = useState('');
  
  // Carregar do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedKm = localStorage.getItem('kmAtualVeiculo');
        if (savedKm) setKmAtual(savedKm);
        
        const savedTroca = localStorage.getItem('proxTrocaOleo');
        if (savedTroca) setProxTrocaOleo(savedTroca);
    }
  }, []);

  // Salvar manutenção ao editar
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (kmAtual) localStorage.setItem('kmAtualVeiculo', kmAtual);
        if (proxTrocaOleo) localStorage.setItem('proxTrocaOleo', proxTrocaOleo);
    }
  }, [kmAtual, proxTrocaOleo]);

  // --- Lógica da Calculadora ---
  const handleCalcular = () => {
    const c = parseFloat(consumo);
    const p = parseFloat(preco);
    const k = parseFloat(km || '0');
    
    if (!c || !p) return alert('Preencha consumo e preço!');
    if (isNaN(c) || isNaN(p)) return alert('Valores inválidos');

    const calc = calcularCustoPorKm({
        tipoVeiculo, consumoMedio: c, precoCombustivel: p, kmRodados: k
    });
    
    setResultado(calc);
    if (typeof window !== 'undefined') localStorage.setItem('custoPorKm', calc.custoPorKm.toFixed(2));
  };

  // --- Simulação de API de Preço ---
  const buscarPrecosCombustivel = async () => {
    setLoadingAPI(true);
    setTimeout(() => {
        setPreco('5.89'); // Valor simulado
        setLoadingAPI(false);
        alert('Preço médio atualizado!');
    }, 1000);
  };

  // --- Lógica de Manutenção Otimizada ---
  const kmA = parseFloat(kmAtual);
  const kmP = parseFloat(proxTrocaOleo);
  
  let statusOleo = "Aguardando dados...";
  let corStatus = "text-gray-500";
  let percentualVida = 100;
  let kmRestante = 0;
  let dadosValidos = false;

  if (!isNaN(kmA) && !isNaN(kmP) && kmA > 0 && kmP > 0) {
    dadosValidos = true;
    kmRestante = kmP - kmA;
    
    // Se o usuário colocar intervalo (ex: 10000) em vez de odômetro (ex: 150000), 
    // o kmRestante seria negativo grande (ex: -140000). 
    // Vamos assumir que se kmP < kmA, ele errou ou venceu.
    
    if (kmRestante < 0) {
       statusOleo = "VENCIDO! ⚠️";
       corStatus = "text-red-600 font-bold";
       percentualVida = 0;
    } else if (kmRestante < 1000) {
       statusOleo = `Atenção! Faltam ${kmRestante} km`;
       corStatus = "text-orange-500 font-bold";
       percentualVida = (kmRestante / 10000) * 100; // Visual relativo a 10k
    } else {
       statusOleo = `OK ✅ (Faltam ${kmRestante} km)`;
       corStatus = "text-green-600 font-bold";
       percentualVida = Math.min(100, (kmRestante / 10000) * 100);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
          <Fuel className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão do Veículo</h1>
        <p className="text-gray-600 dark:text-gray-300">Controle custos e manutenção em um só lugar</p>
      </div>

      <Tabs defaultValue="calculadora" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger value="calculadora" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">💰 Custo/KM</TabsTrigger>
          <TabsTrigger value="manutencao" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg">🔧 Manutenção</TabsTrigger>
        </TabsList>

        {/* ABA 1: CALCULADORA */}
        <TabsContent value="calculadora">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Zap className="w-5 h-5 text-blue-600"/> Entradas
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Carro Flex', 'Moto', 'Elétrico', 'Diesel'].map(t => (
                    <button 
                        key={t} 
                        onClick={() => setTipoVeiculo(t as any)} 
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            tipoVeiculo === t 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Consumo Médio (km/L)</label>
                    <Input type="number" placeholder="Ex: 10.5" value={consumo} onChange={e => setConsumo(e.target.value)} className="text-lg" />
                </div>
                
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Preço Combustível (R$)</label>
                    <div className="flex gap-2">
                        <Input type="number" placeholder="Ex: 5.49" value={preco} onChange={e => setPreco(e.target.value)} className="text-lg" />
                        <Button onClick={buscarPrecosCombustivel} disabled={loadingAPI} variant="outline" className="h-11">
                            {loadingAPI ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div> : <Download size={18} />}
                        </Button>
                    </div>
                </div>

                <Button onClick={handleCalcular} className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700 text-white">Calcular Custo</Button>
            </div>

            {resultado && (
                <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center animate-fade-in">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Seu Custo Real</p>
                    <p className="text-5xl font-bold text-blue-700 dark:text-blue-300 my-2">{formatarMoeda(resultado.custoPorKm)}<span className="text-lg text-blue-500">/km</span></p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">Atualizado e salvo para uso no Dashboard</p>
                </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 2: MANUTENÇÃO (CORRIGIDA) */}
        <TabsContent value="manutencao">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Wrench className="w-5 h-5 text-orange-600"/> Troca de Óleo
                </h2>
                {dadosValidos && kmRestante < 1000 && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Atenção</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        1. KM Atual do Painel
                    </label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            placeholder="Ex: 150000" 
                            value={kmAtual} 
                            onChange={e => setKmAtual(e.target.value)} 
                            className="pl-4 text-lg h-12 border-2 focus:border-orange-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Digite exatamente o que mostra no painel do carro.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        2. Odômetro da Próxima Troca
                    </label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            placeholder="Ex: 160000" 
                            value={proxTrocaOleo} 
                            onChange={e => setProxTrocaOleo(e.target.value)} 
                            className="pl-4 text-lg h-12 border-2 focus:border-orange-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Olhe na etiqueta do vidro: "Próxima troca com..."</p>
                </div>
            </div>

            {/* CARD DE STATUS */}
            <div className="mt-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status da Manutenção</span>
                    <span className={`text-lg ${corStatus}`}>{statusOleo}</span>
                </div>
                
                <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                            kmRestante < 0 ? 'bg-red-600 w-full' : // Vencido (Barra cheia vermelha)
                            kmRestante < 1000 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${dadosValidos ? percentualVida : 0}%` }}
                    />
                </div>
                
                {!dadosValidos && (
                    <p className="text-center text-sm text-gray-400 mt-3">Preencha os dois campos acima para ver o status.</p>
                )}
            </div>

            {/* Checklists Adicionais */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Outras Verificações</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                            <span>Calibragem dos Pneus</span>
                        </div>
                        <span className="text-xs text-gray-400">Semanal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="text-gray-300 dark:text-gray-600 w-5 h-5" />
                            <span>Filtro de Ar</span>
                        </div>
                        <span className="text-xs text-gray-400">A cada troca de óleo</span>
                    </div>
                </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
