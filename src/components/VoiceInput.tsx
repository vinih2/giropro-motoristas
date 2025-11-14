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
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Tipagem para suporte a navegadores
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.lang = 'pt-BR';
        recognitionInstance.interimResults = false;

        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onend = () => setIsListening(false);

        recognitionInstance.onerror = (event: any) => {
          console.error("Erro voz:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error("Permita o acesso ao microfone.");
          } else {
            toast.error("Não entendi. Tente novamente.");
          }
        };

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          processarAudio(transcript);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const processarAudio = (texto: string) => {
    // Remove palavras comuns para limpar o input
    let limpo = texto.toLowerCase()
      .replace('reais', '')
      .replace('real', '')
      .replace('km', '')
      .replace('quilômetros', '')
      .replace('horas', '')
      .trim();
    
    // Substitui vírgula por ponto para conversão
    limpo = limpo.replace(',', '.');

    // Extrai apenas números
    const numeros = limpo.replace(/[^0-9.]/g, '');
    
    if (numeros && !isNaN(parseFloat(numeros))) {
      onResult(numeros);
      toast.success(`Entendido: "${texto}"`);
    } else {
      toast.warning(`Ouvi "${texto}", mas não identifiquei um número.`);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      toast.info("Pode falar o valor...");
    }
  };

  if (!supported) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      onClick={toggleListening}
      className={`transition-all duration-300 ${
        isListening 
          ? 'bg-red-100 border-red-500 text-red-600 animate-pulse hover:bg-red-200' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title="Preencher por voz"
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
