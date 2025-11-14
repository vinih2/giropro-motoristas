'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb, AlertTriangle, Calculator, Check, X, Plus, RotateCcw, Pencil } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function DashboardContent() {
  const { user } = useAuth();
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  
  // Estados principais acumulativos
  const [ganhoBruto, setGanhoBruto] = useState(0);
  const [horas, setHoras] = useState(0);
  const [km, setKm] = useState(0);
  
  const [metaDiaria, setMetaDiaria] = useState('200');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);
  const [alerta, setAlerta] = useState('');

  // Estados Temporários (Input de Adição)
  const [addValor, setAddValor] = useState('');
  const [addKm, setAddKm] = useState('');
  const [addHoras, setAddHoras] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Estados Calculadora Rápida
  const [quickValor, setQuickValor] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickResultado, setQuickResultado] = useState<{ lucro: number; valeApena: boolean } | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Estado Edição Meta
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [tempMeta, setTempMeta] = useState('');

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  // 1. Carregar dados salvos (Persistência)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCusto = localStorage.getItem('custoPorKm');
      if (savedCusto) setCustoPorKm(parseFloat(savedCusto));
      
      const savedMeta = localStorage.getItem('metaDiaria');
      if (savedMeta) setMetaDiaria(savedMeta);

      // Recuperar estado do dia
      const savedDay = localStorage.getItem('giropro_current_day');
      if (savedDay) {
        const data = JSON.parse(savedDay);
        // Verifica se é do mesmo dia (opcional, mas bom para UX)
        const hoje = new Date().toDateString();
        if (data.date === hoje) {
            setGanhoBruto(parseFloat(data.ganho || 0));
            setHoras(parseFloat(data.horas || 0));
            setKm(parseFloat(data.km || 0));
        }
      }
    }
  }, []);

  // 2. Salvar dados automaticamente sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const dataToSave = {
            date: new Date().toDateString(),
            ganho: ganhoBruto,
            horas: horas,
            km: km
        };
        localStorage.setItem('giropro_current_day', JSON.stringify(dataToSave));
        
        // Recalcula resultados em tempo real
        if (ganhoBruto > 0 || km > 0) {
            const dados = {
                plataforma,
                ganhoBruto: ganhoBruto,
                horasTrabalhadas: horas || 1, // Evita divisão por zero
                kmRodados: km || 1,
            };
            const calc = calcularGiroDia(dados, custoPorKm);
            setResultado(calc);
        }
    }
  }, [ganhoBruto, horas, km, custoPorKm, plataforma]);

  const handleAdicionarCorrida = () => {
    const v = parseFloat(addValor) || 0;
    const k = parseFloat(addKm) || 0;
    const h = parseFloat(addHoras) || 0;

    setGanhoBruto(prev => prev + v);
    setKm(prev => prev + k);
    setHoras(prev => prev + h);

    // Limpa inputs e fecha
    setAddValor('');
    setAddKm('');
    setAddHoras('');
    setIsAddOpen(false);
  };

  const handleNovoDia = () => {
    if (confirm("Tem certeza? Isso vai zerar os contadores de hoje.")) {
        setGanhoBruto(0);
        setHoras(0);
        setKm(0);
        setResultado(null);
        setInsight('');
        setAlerta('');
        localStorage.removeItem('giropro_current_day');
    }
  };

  const handleSalvarMeta = () => {
      setMetaDiaria(tempMeta);
      localStorage.setItem('metaDiaria', tempMeta);
      setIsMetaOpen(false);
  };

  const calcularRapido = () => {
    const valor = parseFloat(quickValor);
    const dist = parseFloat(quickKm);
    if (!valor || !dist) return;

    const custoEstimado = dist * custoPorKm;
    const lucro = valor - custoEstimado;
    const lucroPorKm = lucro / dist;
    
    setQuickResultado({ lucro, valeApena: lucroPorKm >= 1.0 });
  };

  const adicionarDaCalculadora = () => {
      const valor = parseFloat(quickValor);
      const dist = parseFloat(quickKm);
      
      setGanhoBruto(prev => prev + valor);
      setKm(prev => prev + dist);
      
      setQuickValor('');
      setQuickKm('');
      setQuickResultado(null);
      setIsCalcOpen(false);
  };

  // Gera Insight/Alerta apenas sob demanda ou quando finalizar dia
  const gerarAnaliseCoach = async () => {
    if (!resultado) return;
    setLoading(true);
    try {
        const response = await fetch('/api/generate-insight', {
            method: 'POST',
            body: JSON.stringify({ 
                dados: { plataforma, ganhoBruto, horasTrabalhadas: horas, kmRodados: km }, 
                resultado 
            })
        });
        const data = await response.json();
        setInsight(data.insight);
        
        // Salvar no banco ao gerar análise (checkpoint)
        if (user) {
            await supabase.from('registros').insert({
              user_id: user.id,
              data: new Date().toISOString().split('T')[0],
              plataforma,
              horas, km, ganho_bruto: ganhoBruto, custo_km: custoPorKm, lucro: resultado.lucroFinal,
            });
        }
    } catch (e) {
        setInsight('Erro ao conectar com o coach. Tente novamente.');
    } finally {
        setLoading(false);
    }
  };

  const progressoMeta = Math.min((ganhoBruto / parseFloat(metaDiaria || '1')) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative pb-24">
      
      {/* HEADER & META WIDGET */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent">
          GiroPro
        </h1>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md mx-auto relative">
          <div className="flex justify-between text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
            <span>Progresso da Meta</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{progressoMeta.toFixed(0)}%</span>
          </div>
          <Progress value={progressoMeta} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400 mt-2 items-center">
            <span className="font-mono text-lg text-gray-800 dark:text-white font-bold">R$ {ganhoBruto.toFixed(2)}</span>
            
            <Dialog open={isMetaOpen} onOpenChange={setIsMetaOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-orange-500 transition" onClick={() => setTempMeta(metaDiaria)}>
                        <span>Meta: R$ {metaDiaria}</span>
                        <Pencil size={12} />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Definir Meta Diária</DialogTitle>
                    </DialogHeader>
                    <Input type="number" value={tempMeta} onChange={e => setTempMeta(e.target.value)} placeholder="Ex: 300.00" />
                    <DialogFooter>
                        <Button onClick={handleSalvarMeta}>Salvar Meta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE DINÂMICO */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" /> Giro em Tempo Real
            </h2>
            <Button variant="ghost" size="sm" onClick={handleNovoDia} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <RotateCcw size={16} className="mr-1"/> Novo Dia
            </Button>
        </div>

        {/* Cards Resumo Rápido */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Ganhos</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatarMoeda(ganhoBruto)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Horas</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{horas}h</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">KM</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{km}km</p>
            </div>
        </div>

        {/* Botão de Ação Principal */}
        <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DrawerTrigger asChild>
                <Button className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-200 dark:shadow-none animate-pulse-slow">
                    <Plus className="mr-2 h-6 w-6" /> Adicionar Corrida
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm p-4 pb-8">
                    <DrawerHeader>
                        <DrawerTitle>Adicionar Corrida</DrawerTitle>
                        <DrawerDescription>Some os valores ao seu dia atual.</DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
                                <Input type="number" value={addValor} onChange={e => setAddValor(e.target.value)} className="text-lg" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">KM</label>
                                <Input type="number" value={addKm} onChange={e => setAddKm(e.target.value)} className="text-lg" placeholder="0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tempo (Horas - opcional)</label>
                            <Input type="number" value={addHoras} onChange={e => setAddHoras(e.target.value)} placeholder="0.5" />
                        </div>
                        <Button onClick={handleAdicionarCorrida} className="w-full h-12 text-lg">Confirmar</Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
        
        {/* Botão Analisar Dia (IA) */}
        {resultado && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <span className="text-xs text-gray-500">Lucro Líquido</span>
                        <p className="text-xl font-bold text-blue-600">{formatarMoeda(resultado.lucroFinal)}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-xs text-gray-500">Ganho Real/Hora</span>
                        <p className={`text-xl font-bold ${resultado.ganhoPorHora < 15 ? 'text-red-500' : 'text-green-600'}`}>
                            {formatarMoeda(resultado.ganhoPorHora)}
                        </p>
                    </div>
                </div>
                
                {!insight ? (
                    <Button variant="outline" onClick={gerarAnaliseCoach} disabled={loading} className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/20">
                        {loading ? 'Analisando...' : '🤖 Pedir Análise do Coach'}
                    </Button>
                ) : (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                        <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{insight}"</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* FAB - Calculadora Rápida */}
      <div className="fixed bottom-24 right-4 z-40 md:bottom-8">
        <Drawer open={isCalcOpen} onOpenChange={setIsCalcOpen}>
          <DrawerTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-900/20 transition-transform hover:scale-110">
              <Calculator className="h-6 w-6 text-white" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm p-4 pb-8">
              <DrawerHeader>
                <DrawerTitle>Calculadora Rápida</DrawerTitle>
                <DrawerDescription>Vale a pena aceitar?</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input type="number" className="text-lg" value={quickValor} onChange={(e) => setQuickValor(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">KM Total</label>
                    <Input type="number" className="text-lg" value={quickKm} onChange={(e) => setQuickKm(e.target.value)} />
                  </div>
                </div>
                
                <Button onClick={calcularRapido} className="w-full" size="lg">Verificar</Button>

                {quickResultado && (
                    <div className={`p-4 rounded-xl border-2 text-center animate-scale-in ${quickResultado.valeApena ? 'bg-green-50 border-green-500 dark:bg-green-900/30' : 'bg-red-50 border-red-500 dark:bg-red-900/30'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {quickResultado.valeApena ? <Check className="text-green-600 h-8 w-8" /> : <X className="text-red-600 h-8 w-8" />}
                            <span className={`text-2xl font-bold ${quickResultado.valeApena ? 'text-green-700' : 'text-red-700'}`}>
                                {quickResultado.valeApena ? 'ACEITA!' : 'RECUSA!'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Lucro Real: <strong>{formatarMoeda(quickResultado.lucro)}</strong>
                        </p>
                        
                        {/* Botão Mágico: Adicionar direto ao dia */}
                        <Button size="sm" variant="secondary" onClick={adicionarDaCalculadora} className="w-full">
                            Adicionar ao Giro do Dia
                        </Button>
                    </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
