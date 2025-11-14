'use client';

import { useState, useEffect } from 'react';
import { Plataforma } from '@/lib/types';
import { calcularGiroDia, formatarMoeda } from '@/lib/calculations';
import { TrendingUp, DollarSign, Navigation, Zap, AlertTriangle, Calculator, Check, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceInput from '@/components/VoiceInput';

function DashboardContent() {
  const { user } = useAuth();
  const [plataforma, setPlataforma] = useState<Plataforma>('Uber');
  const [ganhoBruto, setGanhoBruto] = useState('');
  const [horas, setHoras] = useState('');
  const [km, setKm] = useState('');
  const [metaDiaria, setMetaDiaria] = useState('200');
  const [resultado, setResultado] = useState<any>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [custoPorKm, setCustoPorKm] = useState(0.50);
  const [alerta, setAlerta] = useState('');

  // Calculadora Rápida
  const [quickValor, setQuickValor] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickResultado, setQuickResultado] = useState<{ lucro: number; valeApena: boolean } | null>(null);

  const plataformas: Plataforma[] = ['Uber', '99', 'iFood', 'Rappi', 'Shopee', 'Amazon', 'Loggi', 'Outro'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custo = localStorage.getItem('custoPorKm');
      if (custo) setCustoPorKm(parseFloat(custo));
      const meta = localStorage.getItem('metaDiaria');
      if (meta) setMetaDiaria(meta);
    }
  }, []);

  const calcularRapido = () => {
    const v = parseFloat(quickValor);
    const k = parseFloat(quickKm);
    if (!v || !k) return;
    const lucro = v - (k * custoPorKm);
    // Regra: Vale a pena se pagar mais que R$1.00 livre por KM
    setQuickResultado({ lucro, valeApena: (lucro / k) >= 1.0 });
  };

  const handleCalcular = async () => {
    if (!ganhoBruto || !horas || !km) return alert('Preencha os campos!');
    const dados = {
      plataforma,
      ganhoBruto: parseFloat(ganhoBruto),
      horasTrabalhadas: parseFloat(horas),
      kmRodados: parseFloat(km),
    };
    const calc = calcularGiroDia(dados, custoPorKm);
    setResultado(calc);
    
    // Salvar e Gerar Insight (Resumido)
    if (user) await supabase.from('registros').insert({ ...dados, user_id: user.id, data: new Date().toISOString(), lucro: calc.lucroFinal, custo_km: custoPorKm });
    setInsight("Giro registrado com sucesso! Continue assim.");
  };

  const progresso = resultado ? Math.min((resultado.lucroFinal / parseFloat(metaDiaria || '1')) * 100, 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-32">
      {/* --- META --- */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
          <span>Meta Diária</span>
          <span>{progresso.toFixed(0)}%</span>
        </div>
        <Progress value={progresso} className="h-3 bg-gray-100 dark:bg-gray-800" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>R$ 0</span>
          <span>{formatarMoeda(parseFloat(metaDiaria))}</span>
        </div>
      </div>

      {/* --- FORMULÁRIO --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="text-orange-500" /> Novo Registro
        </h2>

        <div className="grid grid-cols-4 gap-2">
          {plataformas.slice(0,4).map(p => (
            <button key={p} onClick={() => setPlataforma(p)} className={`p-2 rounded-lg text-xs font-bold ${plataforma === p ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{p}</button>
          ))}
        </div>

        {/* Inputs com Voz */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Ganho Total (R$)</label>
            <div className="flex gap-2 mt-1">
              <Input type="number" value={ganhoBruto} onChange={e => setGanhoBruto(e.target.value)} placeholder="0.00" className="text-lg" />
              <VoiceInput onResult={setGanhoBruto} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-gray-300">Horas</label>
              <div className="flex gap-2 mt-1">
                <Input type="number" value={horas} onChange={e => setHoras(e.target.value)} placeholder="0" />
                <VoiceInput onResult={setHoras} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium dark:text-gray-300">KM</label>
              <div className="flex gap-2 mt-1">
                <Input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="0" />
                <VoiceInput onResult={setKm} />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleCalcular} className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg">
          Calcular
        </Button>
      </div>

      {/* --- RESULTADOS --- */}
      {resultado && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <span className="text-sm text-green-700 dark:text-green-400">Lucro Líquido</span>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{formatarMoeda(resultado.lucroFinal)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <span className="text-sm text-blue-700 dark:text-blue-400">Ganho/Hora</span>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatarMoeda(resultado.ganhoPorHora)}</p>
          </div>
          <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic text-center">
            "{insight}"
          </div>
        </div>
      )}

      {/* --- FAB: CALCULADORA RÁPIDA --- */}
      {/* Z-INDEX 60 para ficar acima da Navbar (que é 50) */}
      <div className="fixed bottom-24 right-4 z-[60] md:bottom-8">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl flex flex-col items-center justify-center gap-1 border-4 border-white dark:border-gray-900">
              <Calculator className="h-6 w-6" />
              <span className="text-[10px]">Rápido</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="dark:bg-gray-900 dark:border-gray-800">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="dark:text-white">Calculadora Rápida</DrawerTitle>
                <DrawerDescription>Simule antes de aceitar a corrida.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm dark:text-gray-300">Valor (R$)</label>
                    <Input type="number" className="text-lg" value={quickValor} onChange={e => setQuickValor(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm dark:text-gray-300">KM Total</label>
                    <Input type="number" className="text-lg" value={quickKm} onChange={e => setQuickKm(e.target.value)} />
                  </div>
                </div>
                <Button onClick={calcularRapido} className="w-full h-12 text-lg">Verificar</Button>
                
                {quickResultado && (
                  <div className={`p-4 rounded-xl text-center border-2 animate-scale-in ${quickResultado.valeApena ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                    <div className="flex justify-center items-center gap-2">
                        {quickResultado.valeApena ? <Check size={32}/> : <X size={32}/>}
                        <span className="text-2xl font-bold">{quickResultado.valeApena ? 'ACEITA!' : 'RECUSA!'}</span>
                    </div>
                    <p className="mt-1 font-medium">Lucro: {formatarMoeda(quickResultado.lucro)}</p>
                  </div>
                )}
              </div>
              <DrawerFooter>
                <DrawerClose asChild><Button variant="outline">Fechar</Button></DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
