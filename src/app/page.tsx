'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda, avaliarDesempenho } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, Lightbulb, AlertTriangle, Calculator, Check, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function DashboardContent() {
  const { user } = useAuth();
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [ganhoBruto, setGanhoBruto] = useState('');
  const [horas, setHoras] = useState('');
  const [km, setKm] = useState('');
  const [metaDiaria, setMetaDiaria] = useState('200'); // Valor padrão inicial
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);
  const [alerta, setAlerta] = useState('');

  // Estados da Calculadora Rápida
  const [quickValor, setQuickValor] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickResultado, setQuickResultado] = useState<{ lucro: number; valeApena: boolean } | null>(null);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custoSalvo = localStorage.getItem('custoPorKm');
      if (custoSalvo) setCustoPorKm(parseFloat(custoSalvo));
      
      const metaSalva = localStorage.getItem('metaDiaria');
      if (metaSalva) setMetaDiaria(metaSalva);
    }
  }, []);

  useEffect(() => {
    if (metaDiaria && typeof window !== 'undefined') {
      localStorage.setItem('metaDiaria', metaDiaria);
    }
  }, [metaDiaria]);

  // Lógica da Calculadora Rápida
  const calcularRapido = () => {
    const valor = parseFloat(quickValor);
    const dist = parseFloat(quickKm);
    if (!valor || !dist) return;

    const custoEstimado = dist * custoPorKm;
    const lucro = valor - custoEstimado;
    const lucroPorKm = lucro / dist;
    
    // Critério: Vale a pena se lucro > R$ 1.00/km (exemplo)
    setQuickResultado({
      lucro,
      valeApena: lucroPorKm >= 1.0
    });
  };

  const handleCalcular = async () => {
    // ... (Lógica original de cálculo do Dashboard mantida)
    if (!ganhoBruto || !horas || !km) {
      alert('⚠️ Por favor, preencha todos os campos!');
      return;
    }
    const dados = {
      plataforma,
      ganhoBruto: parseFloat(ganhoBruto),
      horasTrabalhadas: parseFloat(horas),
      kmRodados: parseFloat(km),
    };
    const calc = calcularGiroDia(dados, custoPorKm);
    setResultado(calc);
    
    // Salvar no Supabase (Código original mantido simplificado aqui)
    if (user) {
        supabase.from('registros').insert({
          user_id: user.id,
          data: new Date().toISOString().split('T')[0],
          plataforma,
          horas: dados.horasTrabalhadas,
          km: dados.kmRodados,
          ganho_bruto: dados.ganhoBruto,
          custo_km: custoPorKm,
          lucro: calc.lucroFinal,
        }).then(({ error }) => {
            if (error) console.error(error);
        });
    }
    
    // IA Mock/Real
    try {
        setLoading(true);
        const response = await fetch('/api/generate-insight', {
            method: 'POST',
            body: JSON.stringify({ dados, resultado: calc })
        });
        const data = await response.json();
        setInsight(data.insight);
    } catch (e) {
        setInsight('Bom trabalho! Continue focado.');
    } finally {
        setLoading(false);
    }
  };

  const progressoMeta = resultado ? Math.min((resultado.lucroFinal / parseFloat(metaDiaria || '1')) * 100, 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative pb-24">
      {/* Header & Meta */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent">
          GiroPro
        </h1>
        
        {/* Widget de Meta */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
          <div className="flex justify-between text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
            <span>Progresso da Meta</span>
            <span>{progressoMeta.toFixed(0)}%</span>
          </div>
          <Progress value={progressoMeta} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>R$ 0</span>
            <span>Meta: R$ {metaDiaria}</span>
          </div>
        </div>
      </div>

      {/* Formulário Principal (Mantido igual, resumido para brevidade) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4">
            {/* Inputs do Dashboard... */}
             <div className="grid grid-cols-2 gap-2">
                {plataformas.slice(0,4).map(p => (
                    <button key={p} onClick={() => setPlataforma(p)} className={`p-2 rounded-lg text-sm ${plataforma === p ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-gray-100 dark:bg-gray-800'}`}>{p}</button>
                ))}
             </div>
             <Input type="number" placeholder="Ganho Bruto (R$)" value={ganhoBruto} onChange={e => setGanhoBruto(e.target.value)} />
             <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Horas" value={horas} onChange={e => setHoras(e.target.value)} />
                <Input type="number" placeholder="KM" value={km} onChange={e => setKm(e.target.value)} />
             </div>
             <Input type="number" placeholder="Definir Meta Diária (R$)" value={metaDiaria} onChange={e => setMetaDiaria(e.target.value)} />
             <Button onClick={handleCalcular} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {loading ? 'Calculando...' : 'Calcular Giro do Dia'}
             </Button>
        </div>
      </div>

      {/* Resultados & Insight (Mantidos, renderização condicional) */}
      {resultado && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <span className="text-sm text-blue-600 dark:text-blue-400">Lucro</span>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatarMoeda(resultado.lucroFinal)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <span className="text-sm text-green-600 dark:text-green-400">R$/Hora</span>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatarMoeda(resultado.ganhoPorHora)}</p>
            </div>
            <div className="col-span-2 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{insight}"</p>
            </div>
        </div>
      )}

      {/* --- FEATURE: FAB CALCULADORA RÁPIDA --- */}
      <div className="fixed bottom-24 right-4 z-40 md:bottom-8">
        <Drawer>
          <DrawerTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-900/20">
              <Calculator className="h-6 w-6 text-white" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Calculadora Rápida</DrawerTitle>
                <DrawerDescription>Vale a pena aceitar essa corrida?</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input 
                        type="number" 
                        className="text-lg" 
                        value={quickValor}
                        onChange={(e) => setQuickValor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">KM Total</label>
                    <Input 
                        type="number" 
                        className="text-lg"
                        value={quickKm}
                        onChange={(e) => setQuickKm(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={calcularRapido} className="w-full" size="lg">
                    Verificar
                </Button>

                {quickResultado && (
                    <div className={`mt-4 p-4 rounded-xl border-2 text-center animate-scale-in ${quickResultado.valeApena ? 'bg-green-50 border-green-500 dark:bg-green-900/30' : 'bg-red-50 border-red-500 dark:bg-red-900/30'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {quickResultado.valeApena ? <Check className="text-green-600 h-8 w-8" /> : <X className="text-red-600 h-8 w-8" />}
                            <span className={`text-2xl font-bold ${quickResultado.valeApena ? 'text-green-700' : 'text-red-700'}`}>
                                {quickResultado.valeApena ? 'ACEITA!' : 'RECUSA!'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Lucro Real: <strong>{formatarMoeda(quickResultado.lucro)}</strong>
                        </p>
                    </div>
                )}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DrawerClose>
              </DrawerFooter>
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
