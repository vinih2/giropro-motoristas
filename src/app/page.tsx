'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda } from '@/lib/calculations';
import { 
  Zap, Calculator, Plus, RotateCcw, Pencil, Save, 
  Wallet, Smartphone, Banknote, Check, X
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useToast } from "@/hooks/use-toast";

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // --- Estados Principais ---
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [ganhoBruto, setGanhoBruto] = useState(0);
  const [ganhoDinheiro, setGanhoDinheiro] = useState(0);
  const [horas, setHoras] = useState(0);
  const [km, setKm] = useState(0);
  
  const [metaDiaria, setMetaDiaria] = useState('200');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);

  // --- Estados de Ação ---
  const [addValor, setAddValor] = useState('');
  const [addKm, setAddKm] = useState('');
  const [addHoras, setAddHoras] = useState('');
  const [isDinheiro, setIsDinheiro] = useState(false);
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

  // 1. Carregar Dados (Blindado contra erros)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCusto = localStorage.getItem('custoPorKm');
        if (savedCusto) setCustoPorKm(parseFloat(savedCusto));
        
        const savedMeta = localStorage.getItem('metaDiaria');
        if (savedMeta) setMetaDiaria(savedMeta);

        const savedDay = localStorage.getItem('giropro_current_day');
        if (savedDay) {
          const data = JSON.parse(savedDay);
          // Validação simples para garantir que os dados existem
          if (data && typeof data === 'object') {
             setGanhoBruto(parseFloat(data.ganho || 0));
             setGanhoDinheiro(parseFloat(data.ganhoDinheiro || 0));
             setHoras(parseFloat(data.horas || 0));
             setKm(parseFloat(data.km || 0));
             if (data.plataforma) setPlataforma(data.plataforma);
          }
        }
      } catch (error) {
        console.error("Erro ao restaurar dados:", error);
        localStorage.removeItem('giropro_current_day'); // Limpa se estiver corrompido
      }
    }
  }, []);

  // 2. Salvar Automático
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const dataToSave = {
            date: new Date().toDateString(),
            ganho: ganhoBruto,
            ganhoDinheiro: ganhoDinheiro,
            horas: horas,
            km: km,
            plataforma: plataforma
        };
        localStorage.setItem('giropro_current_day', JSON.stringify(dataToSave));
        
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
  }, [ganhoBruto, ganhoDinheiro, horas, km, custoPorKm, plataforma]);

  // --- FUNÇÕES DE AÇÃO ---

  const handleAdicionarCorrida = () => {
    const v = parseFloat(addValor) || 0;
    const k = parseFloat(addKm) || 0;
    const h = parseFloat(addHoras) || 0;

    setGanhoBruto(prev => prev + v);
    if (isDinheiro) setGanhoDinheiro(prev => prev + v);
    setKm(prev => prev + k);
    setHoras(prev => prev + h);

    setAddValor('');
    setAddKm('');
    setAddHoras('');
    setIsDinheiro(false);
    setIsAddOpen(false);
    
    toast({
      title: "Corrida adicionada! 🚗",
      description: `+ ${formatarMoeda(v)} (${isDinheiro ? 'Dinheiro' : 'App'})`,
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleFinalizarDia = async () => {
    if (ganhoBruto === 0 && km === 0) {
        return toast({ variant: "destructive", title: "Dia vazio", description: "Adicione dados antes de salvar." });
    }

    if (!confirm("Deseja encerrar o expediente e salvar no histórico?")) return;

    setSaving(true);

    const dadosFinais = { plataforma, ganhoBruto, horasTrabalhadas: horas || 0.1, kmRodados: km || 0.1 };
    const calcFinal = calcularGiroDia(dadosFinais, custoPorKm);

    // Salvar Supabase
    if (user) {
        await supabase.from('registros').insert({
            user_id: user.id,
            data: new Date().toISOString().split('T')[0],
            plataforma, horas, km, ganho_bruto: ganhoBruto, custo_km: custoPorKm, lucro: calcFinal.lucroFinal,
            created_at: new Date().toISOString()
        });
    }

    // Salvar LocalStorage (Histórico Offline)
    const historicoLocal = JSON.parse(localStorage.getItem('registros') || '[]');
    historicoLocal.unshift({
        id: Date.now(),
        user_id: user?.id || 'local',
        data: new Date().toISOString().split('T')[0],
        plataforma, horas, km, ganho_bruto: ganhoBruto, custo_km: custoPorKm, lucro: calcFinal.lucroFinal
    });
    localStorage.setItem('registros', JSON.stringify(historicoLocal));

    // Reset
    setGanhoBruto(0);
    setGanhoDinheiro(0);
    setHoras(0);
    setKm(0);
    setResultado(null);
    setInsight('');
    localStorage.removeItem('giropro_current_day');

    toast({ title: "Dia Finalizado! 🎉", description: "Dados salvos com sucesso.", className: "bg-blue-600 text-white border-none" });
    setSaving(false);
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
      toast({ title: "Adicionado! ✅", description: "Corrida somada ao total." });
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
        setInsight('Erro ao conectar com o coach.');
    } finally {
        setLoading(false);
    }
  };

  const progressoMeta = Math.min((ganhoBruto / parseFloat(metaDiaria || '1')) * 100, 100);
  const ganhoApp = ganhoBruto - ganhoDinheiro;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative pb-24">
      
      {/* HEADER & META */}
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
            <span className="font-mono text-lg text-gray-800 dark:text-white font-bold">{formatarMoeda(ganhoBruto)}</span>
            
            <Dialog open={isMetaOpen} onOpenChange={setIsMetaOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-orange-500 transition" onClick={() => setTempMeta(metaDiaria)}>
                        <span>Alvo: {formatarMoeda(parseFloat(metaDiaria))}</span>
                        <Pencil size={12} />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Definir Meta Diária</DialogTitle></DialogHeader>
                    <CurrencyInput value={tempMeta} onChange={setTempMeta} placeholder="R$ 300,00" className="text-xl" />
                    <DialogFooter><Button onClick={handleSalvarMeta}>Salvar Meta</Button></DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" /> Giro em Tempo Real
            </h2>
            <select 
                value={plataforma} 
                onChange={(e) => setPlataforma(e.target.value as Plataforma)}
                className="text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-1 px-2"
            >
                {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>

        {/* Cards Resumo (Com Cash Control) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">
                    <Smartphone size={12} /> App (Receber)
                </span>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatarMoeda(ganhoApp)}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 uppercase font-bold">
                    <Wallet size={12} /> Em Mãos
                </span>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatarMoeda(ganhoDinheiro)}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Horas</p>
                <p className="text-base font-bold text-gray-800 dark:text-white">{horas}h</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase font-bold">KM</p>
                <p className="text-base font-bold text-gray-800 dark:text-white">{km}km</p>
            </div>
        </div>

        {/* Botão Adicionar Corrida */}
        <div className="flex gap-3">
            <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DrawerTrigger asChild>
                    <Button className="flex-1 h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg animate-pulse-slow">
                        <Plus className="mr-2 h-6 w-6" /> Adicionar Corrida
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm p-4 pb-8">
                        <DrawerHeader>
                            <DrawerTitle>Adicionar Corrida</DrawerTitle>
                            <DrawerDescription>Some os valores ao seu dia.</DrawerDescription>
                        </DrawerHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
                                    <CurrencyInput value={addValor} onChange={setAddValor} className="text-lg" placeholder="0,00" autoFocus />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">KM</label>
                                    <Input type="number" value={addKm} onChange={e => setAddKm(e.target.value)} className="text-lg" placeholder="0" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Banknote className={`w-5 h-5 ${isDinheiro ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">Pagamento em Dinheiro?</span>
                                </div>
                                <Button 
                                    variant={isDinheiro ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => setIsDinheiro(!isDinheiro)}
                                    className={isDinheiro ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {isDinheiro ? "SIM" : "NÃO"}
                                </Button>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Tempo (Horas - opcional)</label>
                                <Input type="number" value={addHoras} onChange={e => setAddHoras(e.target.value)} placeholder="0.0" />
                            </div>
                            <Button onClick={handleAdicionarCorrida} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white">
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
             <Button variant="outline" onClick={gerarAnaliseCoach} disabled={loading || !resultado} className="h-12 border-orange-200 text-orange-700 dark:border-orange-900 dark:text-orange-400">
                {loading ? '...' : '🤖 Coach'}
            </Button>
            <Button variant="secondary" onClick={handleFinalizarDia} disabled={saving} className="h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <Save size={18} className="mr-2" /> {saving ? '...' : 'Encerrar Dia'}
            </Button>
        </div>

        {insight && (
            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 animate-fade-in">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{insight}"</p>
            </div>
        )}
        
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

      {/* FAB - Calculadora Rápida */}
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
                    <CurrencyInput value={quickValor} onChange={setQuickValor} className="text-lg" placeholder="0,00" />
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
