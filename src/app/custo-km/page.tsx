'use client';

import { useState, useEffect } from 'react';
import { TipoVeiculo } from '@/lib/types';
import { calcularCustoPorKm, formatarMoeda } from '@/lib/calculations';
import { 
  Fuel, Zap, TrendingDown, Wrench, AlertTriangle, CheckCircle2, 
  Gauge, AlertCircle, Download, Droplets, Lightbulb, CalendarClock 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Configuração dos itens recorrentes
const RECURRENT_CHECKS = [
  { id: 'calibragem', label: 'Calibrar Pneus', days: 7, icon: Gauge },
  { id: 'agua', label: 'Água do Radiador', days: 7, icon: Droplets },
  { id: 'luzes', label: 'Luzes e Sinalização', days: 15, icon: Lightbulb },
  { id: 'limpador', label: 'Fluido do Limpador', days: 30, icon: Droplets },
];

export default function CustoKm() {
  // -- Estados Calculadora --
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>('Carro Flex');
  const [consumo, setConsumo] = useState('');
  const [preco, setPreco] = useState('');
  const [km, setKm] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loadingAPI, setLoadingAPI] = useState(false);

  // -- Estados Manutenção (Peças) --
  const [kmAtual, setKmAtual] = useState('');
  const [oleoUltima, setOleoUltima] = useState('');
  const [oleoIntervalo, setOleoIntervalo] = useState('10000');
  const [pneuUltima, setPneuUltima] = useState('');
  const [pneuIntervalo, setPneuIntervalo] = useState('50000');
  const [correiaUltima, setCorreiaUltima] = useState('');
  const [correiaIntervalo, setCorreiaIntervalo] = useState('60000');

  // -- Estados Manutenção (Verificações Rápidas) --
  const [lastChecks, setLastChecks] = useState<{[key: string]: string}>({});

  // Carregar do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Calculadora
        const savedCusto = localStorage.getItem('custoPorKm');
        // Manutenção Peças
        const savedKm = localStorage.getItem('manutencao_kmAtual');
        if (savedKm) setKmAtual(savedKm);
        if (localStorage.getItem('manutencao_oleoUltima')) setOleoUltima(localStorage.getItem('manutencao_oleoUltima')!);
        if (localStorage.getItem('manutencao_pneuUltima')) setPneuUltima(localStorage.getItem('manutencao_pneuUltima')!);
        if (localStorage.getItem('manutencao_correiaUltima')) setCorreiaUltima(localStorage.getItem('manutencao_correiaUltima')!);
        
        // Verificações Rápidas
        const savedChecks = localStorage.getItem('manutencao_lastChecks');
        if (savedChecks) setLastChecks(JSON.parse(savedChecks));
    }
  }, []);

  // Salvar manutenção ao editar
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (kmAtual) localStorage.setItem('manutencao_kmAtual', kmAtual);
        if (oleoUltima) localStorage.setItem('manutencao_oleoUltima', oleoUltima);
        if (pneuUltima) localStorage.setItem('manutencao_pneuUltima', pneuUltima);
        if (correiaUltima) localStorage.setItem('manutencao_correiaUltima', correiaUltima);
        localStorage.setItem('manutencao_lastChecks', JSON.stringify(lastChecks));
    }
  }, [kmAtual, oleoUltima, pneuUltima, correiaUltima, lastChecks]);

  // --- Lógica da Calculadora ---
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

  const buscarPrecosCombustivel = async () => {
    setLoadingAPI(true);
    setTimeout(() => {
        setPreco('5.89');
        setLoadingAPI(false);
        alert('Preço médio atualizado!');
    }, 1000);
  };

  // --- Lógica de Verificações Rápidas ---
  const handleCheckItem = (id: string) => {
    const now = new Date().toISOString();
    setLastChecks(prev => ({ ...prev, [id]: now }));
  };

  const getCheckStatus = (lastDateIso: string, intervalDays: number) => {
    if (!lastDateIso) return { status: 'pending', label: 'Nunca verificado', color: 'text-gray-500' };
    
    const last = new Date(lastDateIso);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= intervalDays) {
        return { status: 'ok', label: 'Verificado', color: 'text-green-600' };
    } else {
        return { status: 'due', label: `Atrasado (${diffDays - intervalDays} dias)`, color: 'text-orange-600 font-bold' };
    }
  };

  // --- Componente Visual de Item de Peça (KM) ---
  const MaintenanceItem = ({ title, ultimaTroca, intervalo, icon: Icon }: any) => {
    const atual = parseFloat(kmAtual) || 0;
    const ultima = parseFloat(ultimaTroca) || 0;
    const inter = parseFloat(intervalo) || 1;
    
    const kmRodadoPeca = atual - ultima;
    const kmRestante = inter - kmRodadoPeca;
    const percentualVida = Math.max(0, Math.min(100, (kmRestante / inter) * 100));
    
    const isVencido = kmRestante < 0;
    const isAlerta = kmRestante < (inter * 0.1); 
    
    let statusColor = "bg-green-500";
    let statusText = "OK";
    let badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    if (isVencido) {
        statusColor = "bg-red-600";
        statusText = "TROCAR";
        badgeColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse";
    } else if (isAlerta) {
        statusColor = "bg-yellow-500";
        statusText = "ATENÇÃO";
        badgeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }

    if (!ultimaTroca) return null;

    return (
      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isVencido ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                    <Icon className={`w-5 h-5 ${isVencido ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Intervalo: {intervalo}km</p>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${badgeColor}`}>
                {statusText}
            </span>
        </div>
        
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600 dark:text-gray-300">Rodou: {kmRodadoPeca} km</span>
                <span className={isVencido ? "text-red-500 font-bold" : "text-gray-600 dark:text-gray-300"}>
                    {isVencido ? `Passou ${Math.abs(kmRestante)} km` : `Restam ${kmRestante} km`}
                </span>
            </div>
            <Progress value={percentualVida} className={`h-2 ${isVencido ? "bg-red-200" : ""}`} indicatorColor={statusColor} />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
          <Fuel className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão do Veículo</h1>
        <p className="text-gray-600 dark:text-gray-300">Controle financeiro e saúde do seu carro</p>
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
                <Zap className="w-5 h-5 text-blue-600"/> Calculadora de Custo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Carro Flex', 'Moto', 'Elétrico', 'Diesel'].map(t => (
                    <button key={t} onClick={() => setTipoVeiculo(t as any)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${tipoVeiculo === t ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{t}</button>
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

        {/* ABA 2: MANUTENÇÃO OTIMIZADA */}
        <TabsContent value="manutencao">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-8">
            
            {/* Seção 1: Odômetro */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                <label className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 block">
                    Odômetro Atual (Painel)
                </label>
                <div className="relative max-w-xs mx-auto">
                    <Gauge className="absolute left-3 top-3.5 text-blue-500" size={20} />
                    <Input 
                        type="number" 
                        placeholder="000000" 
                        value={kmAtual} 
                        onChange={e => setKmAtual(e.target.value)} 
                        className="pl-10 text-2xl font-mono h-14 text-center border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:bg-gray-800"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">Atualize semanalmente para cálculos precisos.</p>
            </div>

            {/* Seção 2: Peças (Inputs de última troca) */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <Wrench className="w-5 h-5 text-orange-600" /> Peças Críticas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Última Troca de Óleo (KM)</label>
                        <Input type="number" placeholder="Ex: 50000" value={oleoUltima} onChange={e => setOleoUltima(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Última Troca de Pneus (KM)</label>
                        <Input type="number" placeholder="Ex: 40000" value={pneuUltima} onChange={e => setPneuUltima(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Última Correia Dentada (KM)</label>
                        <Input type="number" placeholder="Ex: 60000" value={correiaUltima} onChange={e => setCorreiaUltima(e.target.value)} />
                    </div>
                </div>

                {/* Cards de Status */}
                {kmAtual ? (
                    <div className="space-y-4">
                        <MaintenanceItem title="Óleo do Motor" icon={Fuel} ultimaTroca={oleoUltima} intervalo={oleoIntervalo} />
                        <MaintenanceItem title="Pneus (Rodízio/Troca)" icon={AlertCircle} ultimaTroca={pneuUltima} intervalo={pneuIntervalo} />
                        <MaintenanceItem title="Correia Dentada" icon={Wrench} ultimaTroca={correiaUltima} intervalo={correiaIntervalo} />
                        {(!oleoUltima && !pneuUltima && !correiaUltima) && (
                            <div className="text-center p-4 text-gray-500 text-sm italic">
                                Preencha os campos acima para ver o status das peças.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Informe o KM Atual do painel acima.</p>
                    </div>
                )}
            </div>

            {/* Seção 3: Verificações Rápidas (Checklist Inteligente) */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <CalendarClock className="w-5 h-5 text-purple-600" /> Verificações Recorrentes
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RECURRENT_CHECKS.map((check) => {
                        const { status, label, color } = getCheckStatus(lastChecks[check.id], check.days);
                        const Icon = check.icon;
                        
                        return (
                            <div key={check.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${status === 'ok' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{check.label}</p>
                                        <p className={`text-xs ${color}`}>{label}</p>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant={status === 'ok' ? "outline" : "default"}
                                    className={status === 'ok' ? "text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" : ""}
                                    onClick={() => handleCheckItem(check.id)}
                                >
                                    {status === 'ok' ? <CheckCircle2 size={16} /> : "Verificar"}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
