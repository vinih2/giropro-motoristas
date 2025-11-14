'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb, AlertTriangle, Calculator, Check, X, Plus, RotateCcw, Pencil, Save } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"; // Importando notificações

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast(); // Hook de notificação
  
  // --- Estados ---
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  
  // Acumuladores do dia
  const [ganhoBruto, setGanhoBruto] = useState(0);
  const [horas, setHoras] = useState(0);
  const [km, setKm] = useState(0);
  
  // Configurações e Resultados
  const [metaDiaria, setMetaDiaria] = useState('200');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Novo estado para salvamento
  const [custoPorKm, setCustoPorKm] = useState(0.50);
  const [alerta, setAlerta] = useState('');

  // Estados Temporários (Inputs)
  const [addValor, setAddValor] = useState('');
  const [addKm, setAddKm] = useState('');
  const [addHoras, setAddHoras] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Calculadora Rápida
  const [quickValor, setQuickValor] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickResultado, setQuickResultado] = useState<{ lucro: number; valeApena: boolean } | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Edição de Meta
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [tempMeta, setTempMeta] = useState('');

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  // 1. Carregar dados (Persistência)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCusto = localStorage.getItem('custoPorKm');
      if (savedCusto) setCustoPorKm(parseFloat(savedCusto));
      
      const savedMeta = localStorage.getItem('metaDiaria');
      if (savedMeta) setMetaDiaria(savedMeta);

      const savedDay = localStorage.getItem('giropro_current_day');
      if (savedDay) {
        const data = JSON.parse(savedDay);
        const hoje = new Date().toDateString();
        // Só restaura se for do mesmo dia (opcional: remova o if se quiser persistir entre dias)
        // if (data.date === hoje) { 
            setGanhoBruto(parseFloat(data.ganho || 0));
            setHoras(parseFloat(data.horas || 0));
            setKm(parseFloat(data.km || 0));
            if (data.plataforma) setPlataforma(data.plataforma);
        // }
      }
    }
  }, []);

  // 2. Salvar automático no localStorage (Backup local)
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const dataToSave = {
            date: new Date().toDateString(),
            ganho: ganhoBruto,
            horas: horas,
            km: km,
            plataforma: plataforma
        };
        localStorage.setItem('giropro_current_day', JSON.stringify(dataToSave));
        
        // Recalcula resultados em tempo real para exibir na tela
        if (ganhoBruto > 0 || km > 0) {
            const dados = {
                plataforma,
                ganhoBruto: ganhoBruto,
                horasTrabalhadas: horas || 1, 
                kmRodados: km || 1,
            };
            const calc = calcularGiroDia(dados, custoPorKm);
            setResultado(calc);
        } else {
            setResultado(null);
        }
    }
  }, [ganhoBruto, horas, km, custoPorKm, plataforma]);

  // --- AÇÕES ---

  const handleAdicionarCorrida = () => {
    const v = parseFloat(addValor) || 0;
    const k = parseFloat(addKm) || 0;
    const h = parseFloat(addHoras) || 0;

    setGanhoBruto(prev => prev + v);
    setKm(prev => prev + k);
    setHoras(prev => prev + h);

    setAddValor('');
    setAddKm('');
    setAddHoras('');
    setIsAddOpen(false);
    
    toast({
      title: "Corrida adicionada! 🚗",
      description: `+ ${formatarMoeda(v)} somados ao seu dia.`,
    });
  };

  const handleFinalizarDia = async () => {
    if (ganhoBruto === 0 && km === 0) {
        return toast({ variant: "destructive", title: "Dia vazio", description: "Adicione corridas antes de finalizar." });
    }

    if (!confirm("Deseja encerrar o expediente e salvar no histórico?")) return;

    setSaving(true);

    // Recalcula final
    const dadosFinais = {
        plataforma,
        ganhoBruto,
        horasTrabalhadas: horas || 0.1,
        kmRodados: km || 0.1,
    };
    const calcFinal = calcularGiroDia(dadosFinais, custoPorKm);

    // 1. Salvar no Supabase
    if (user) {
        const { error } = await supabase.from('registros').insert({
            user_id: user.id,
            data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            plataforma,
            horas: horas,
            km: km,
            ganho_bruto: ganhoBruto,
            custo_km: custoPorKm,
            lucro: calcFinal.lucroFinal,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro ao salvar", description: "Tente novamente." });
            setSaving(false);
            return;
        }
    }

    // 2. Backup no LocalStorage (Histórico Offline)
    const historicoLocal = JSON.parse(localStorage.getItem('registros') || '[]');
    historicoLocal.unshift({
        id: Date.now(),
        user_id: user?.id || 'local',
        data: new Date().toISOString().split('T')[0],
        plataforma,
        horas, km, ganho_bruto: ganhoBruto, custo_km: custoPorKm, lucro: calcFinal.lucroFinal
    });
    localStorage.setItem('registros', JSON.stringify(historicoLocal));

    // 3. Limpar dia atual
    setGanhoBruto(0);
    setHoras(0);
    setKm(0);
    setResultado(null);
    setInsight('');
    localStorage.removeItem('giropro_current_day');

    toast({
        title: "Dia Finalizado! 🎉",
        description: "Seus dados foram salvos no Histórico.",
        className: "bg-green-500 text-white border-none"
    });
    
    setSaving(false);
  };

  // --- Outras Funções ---
  
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
      toast({ title: "Adicionado! ✅", description: "Corrida somada ao total do dia." });
  };

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
            <span>Meta do Dia</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{progressoMeta.toFixed(0)}%</span>
          </div>
          <Progress value={progressoMeta} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400 mt-2 items-center">
            <span className="font-mono text-lg text-gray-800 dark:text-white font-bold">R$ {ganhoBruto.toFixed(2)}</span>
            
            <Dialog open={isMetaOpen} onOpenChange={setIsMetaOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-orange-500 transition" onClick={() => setTempMeta(metaDiaria)}>
                        <span>Alvo: R$ {metaDiaria}</span>
                        <Pencil size={12} />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Definir Meta Diária</DialogTitle></DialogHeader>
                    <Input type="number" value={tempMeta} onChange={e => setTempMeta(e.target.value)} placeholder="Ex: 300.00" />
                    <DialogFooter><Button onClick={handleSalvarMeta}>Salvar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" /> Resumo Dinâmico
            </h2>
            {/* Seletor de Plataforma Principal do Dia */}
            <select 
                value={plataforma} 
                onChange={(e) => setPlataforma(e.target.value as Plataforma)}
                className="text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-1 px-2"
            >
                {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ganhos</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatarMoeda(ganhoBruto)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Horas</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{horas}h</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">KM</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{km}km</p>
            </div>
        </div>

        {/* Botão Principal de Ação */}
        <div className="flex gap-3">
            <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DrawerTrigger asChild>
                    <Button className="flex-1 h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-200 dark:shadow-none animate-pulse-slow">
                        <Plus className="mr-2 h-6 w-6" /> Adicionar Corrida
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm p-4 pb-8">
                        <DrawerHeader>
                            <DrawerTitle>Adicionar Corrida</DrawerTitle>
                            <DrawerDescription>Valores serão somados ao total.</DrawerDescription>
                        </DrawerHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
                                    <Input type="number" value={addValor} onChange={e => setAddValor(e.target.value)} className="text-lg" placeholder="0.00" autoFocus />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">KM</label>
                                    <Input type="number" value={addKm} onChange={e => setAddKm(e.target.value)} className="text-lg" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Tempo (Horas - ex: 0.5)</label>
                                <Input type="number" value={addHoras} onChange={e => setAddHoras(e.target.value)} placeholder="0.0" />
                            </div>
                            <Button onClick={handleAdicionarCorrida} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white">Confirmar</Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
        
        {/* Botões Secundários */}
        <div className="grid grid-cols-2 gap-3 mt-4">
             <Button variant="outline" onClick={gerarAnaliseCoach} disabled={loading || !resultado} className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/20 h-12">
                {loading ? '...' : '🤖 Coach'}
            </Button>
            <Button variant="secondary" onClick={handleFinalizarDia} disabled={saving} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 h-12 border border-gray-200 dark:border-gray-700">
                <Save size={18} className="mr-2" /> {saving ? 'Salvando...' : 'Encerrar Dia'}
            </Button>
        </div>

        {/* Insight IA */}
        {insight && (
            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 animate-fade-in">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{insight}"</p>
            </div>
        )}
        
        {/* Resultados Calculados */}
        {resultado && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-xs text-gray-500 block">Lucro Líquido</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatarMoeda(resultado.lucroFinal)}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 block">Ganho/Hora</span>
                        <span className={`text-xl font-bold ${resultado.ganhoPorHora < 15 ? 'text-red-500' : 'text-green-600'}`}>
                            {formatarMoeda(resultado.ganhoPorHora)}
                        </span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* FAB - Calculadora Rápida (Drawer) */}
      <div className="fixed bottom-24 right-4 z-40 md:bottom-8">
        <Drawer open={isCalcOpen} onOpenChange={setIsCalcOpen}>
          <DrawerTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-900/20 transition-transform hover:scale-110">
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
