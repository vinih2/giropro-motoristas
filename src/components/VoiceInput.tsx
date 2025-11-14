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
            toast.error("Permita o microfone no navegador.");
          }
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Texto ouvido:", transcript);
          
          // Lógica para extrair números (ex: "cento e vinte" -> 120)
          let limpo = transcript.toLowerCase()
            .replace('reais', '').replace('km', '').replace('vírgula', '.')
            .replace(',', '.').trim();
            
          const numeros = limpo.match(/[\d\.]+/g);
          
          if (numeros) {
            const valor = numeros.join('');
            onResult(valor);
            toast.success(`Entendido: ${valor}`);
          } else {
            toast.warning(`Não entendi o número em: "${transcript}"`);
          }
        };
        
        setRecognition(rec);
      }
    }
  }, [onResult]);

  const handleMicClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede submit do form
    if (!supported) return toast.error("Navegador sem suporte a voz.");
    
    if (isListening) recognition.stop();
    else recognition.start();
  };

  if (!supported) return null;

  return (
    <Button
      type="button" // Importante para não enviar formulário
      variant="outline"
      size="icon"
      onClick={handleMicClick}
      className={`transition-all ${
        isListening 
          ? 'bg-red-100 border-red-500 text-red-600 animate-pulse' 
          : 'bg-gray-100 dark:bg-gray-800'
      }`}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </Button>
  );
}
