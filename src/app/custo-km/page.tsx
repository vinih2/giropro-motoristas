'use client';

import { useState } from 'react';
import { TipoVeiculo } from '@/lib/types';
import { calcularCustoPorKm, formatarMoeda } from '@/lib/calculations';
import { Fuel, Zap, TrendingDown, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // -- Estados Manutenção --
  const [kmAtual, setKmAtual] = useState('');
  const [proxTrocaOleo, setProxTrocaOleo] = useState('');
  
  // Função Calculadora
  const handleCalcular = () => {
    const c = parseFloat(consumo);
    const p = parseFloat(preco);
    const k = parseFloat(km || '0');
    if (!c || !p) return alert('Preencha consumo e preço!');
    
    const calc = calcularCustoPorKm({
        tipoVeiculo, consumoMedio: c, precoCombustivel: p, kmRodados: k
    });
    setResultado(calc);
    if (typeof window !== 'undefined') localStorage.setItem('custoPorKm', calc.custoPorKm.toFixed(2));
  };

  // Função Manutenção (Simples)
  const kmRestanteOleo = (parseFloat(proxTrocaOleo) || 0) - (parseFloat(kmAtual) || 0);
  const percentualOleo = proxTrocaOleo ? Math.max(0, (kmRestanteOleo / 10000) * 100) : 100; // Assume ciclo de 10k

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão do Veículo</h1>
      </div>

      <Tabs defaultValue="calculadora" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calculadora">💰 Custo/KM</TabsTrigger>
          <TabsTrigger value="manutencao">🔧 Manutenção</TabsTrigger>
        </TabsList>

        {/* ABA 1: CALCULADORA (Código Original Resumido) */}
        <TabsContent value="calculadora">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Fuel className="w-5 h-5 text-blue-600"/> Calculadora</h2>
            
            <div className="grid grid-cols-2 gap-2">
                {['Carro Flex', 'Moto', 'Elétrico', 'Diesel'].map(t => (
                    <Button key={t} variant={tipoVeiculo === t ? 'default' : 'outline'} onClick={() => setTipoVeiculo(t as any)} className="w-full">{t}</Button>
                ))}
            </div>
            
            <div className="space-y-3">
                <Input type="number" placeholder="Consumo (km/L)" value={consumo} onChange={e => setConsumo(e.target.value)} />
                <Input type="number" placeholder="Preço Combustível (R$)" value={preco} onChange={e => setPreco(e.target.value)} />
                <Button onClick={handleCalcular} className="w-full text-lg h-12">Calcular</Button>
            </div>

            {resultado && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                    <p className="text-sm text-blue-600">Custo por KM</p>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{formatarMoeda(resultado.custoPorKm)}</p>
                </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 2: MANUTENÇÃO (Nova Feature) */}
        <TabsContent value="manutencao">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-orange-600"/> Controle Preventivo</h2>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">KM Atual do Veículo</label>
                    <Input type="number" placeholder="Ex: 150000" value={kmAtual} onChange={e => setKmAtual(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Próxima Troca de Óleo (KM)</label>
                    <Input type="number" placeholder="Ex: 155000" value={proxTrocaOleo} onChange={e => setProxTrocaOleo(e.target.value)} />
                </div>
            </div>

            {kmAtual && proxTrocaOleo && (
                <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="font-bold text-lg">Troca de Óleo</p>
                            <p className={`text-sm ${kmRestanteOleo < 1000 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                {kmRestanteOleo > 0 ? `Faltam ${kmRestanteOleo} km` : 'VENCIDO!'}
                            </p>
                        </div>
                        {kmRestanteOleo < 1000 && <AlertCircle className="text-red-500 animate-pulse" />}
                    </div>
                    <Progress value={(1 - (kmRestanteOleo / 5000)) * 100} className={`h-3 ${kmRestanteOleo < 1000 ? 'bg-red-100' : ''}`} />
                    
                    {/* Exemplo de Item Fixo */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                            <span>Pneus (Revisado há 2 meses)</span>
                        </div>
                    </div>
                </div>
            )}
            
            {!kmAtual && (
                <div className="text-center py-8 text-gray-400">
                    <p>Preencha a KM atual para ver os alertas.</p>
                </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
