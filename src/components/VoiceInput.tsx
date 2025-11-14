'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
  onResult: (value: string) => void;
}

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'pt-BR';
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
          toast.info("Ouvindo... Fale o valor.");
        };
        
        rec.onend = () => setIsListening(false);

        rec.onerror = (event: any) => {
          console.error("Erro Voz:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error("Permita o acesso ao microfone.");
          }
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          
          // Limpeza e Extração de Números
          // Ex: "cento e vinte reais e cinquenta centavos" -> "120.50"
          let limpo = transcript.toLowerCase()
            .replace('reais', '')
            .replace('real', '')
            .replace('centavos', '')
            .replace('km', '')
            .replace('horas', '')
            .trim();
            
          // Tenta normalizar (vírgula para ponto)
          limpo = limpo.replace(',', '.');
          
          // Regex para pegar apenas números e ponto decimal
          const numeros = limpo.match(/[\d\.]+/g);
          
          if (numeros) {
            const valor = numeros.join('');
            onResult(valor);
            toast.success(`Entendido: "${transcript}"`);
          } else {
            toast.warning(`Ouvi "${transcript}", mas não entendi o número.`);
          }
        };
        
        setRecognition(rec);
      }
    }
  }, [onResult]);

  const handleMicClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita submit acidental de formulários
    if (!supported) return toast.error("Seu navegador não suporta comando de voz.");
    
    if (isListening) recognition.stop();
    else recognition.start();
  };

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleMicClick}
      className={`transition-all duration-300 ${
        isListening 
          ? 'bg-red-100 border-red-500 text-red-600 animate-pulse hover:bg-red-200 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title="Comando de Voz"
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
