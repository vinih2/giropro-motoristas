import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Desestrutura todos os campos possíveis de todas as páginas
    const { prompt, dados, resultado, cidade, turno, plataforma } = body;

    // 1. SE TIVER CHAVE DA OPENAI -> USA INTELIGÊNCIA REAL
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // ou "gpt-3.5-turbo"
        messages: [
          { 
            role: "system", 
            content: "Você é um coach financeiro especialista para motoristas de aplicativo no Brasil (Uber/99/iFood). Responda de forma curta, motivadora e prática. Use emojis." 
          },
          { 
            role: "user", 
            content: prompt || "Gere uma dica rápida." 
          }
        ],
        max_tokens: 400,
      });

      return NextResponse.json({ 
        insight: completion.choices[0].message.content 
      });
    }

    // 2. SE NÃO TIVER CHAVE -> MODO SIMULAÇÃO (FALLBACK)
    
    // Cenário A: Página de Insights (O que estava quebrando antes)
    if (cidade) {
      return NextResponse.json({
        insight: `INSIGHT: O movimento em ${cidade} no turno da ${turno || 'tarde'} costuma ser alto. A demanda sobe com chuva.\n\nREC1: Fique próximo a shoppings e centros comerciais.\nREC2: Evite bairros estritamente residenciais fora do horário de pico.\nREC3: Em dias de chuva, a dinâmica dispara na região central.\n\nDICA: Use o app de passageiro para ver onde estão os outros carros.\nMOTIVACAO: Foco no lucro, motorista! Bora pra cima!`
      });
    }

    // Cenário B: Dashboard (Analise do dia)
    if (resultado) {
      const gh = resultado.ganhoPorHora || 0;
      let texto = '';
      
      if (gh >= 30) texto = "Giro sensacional! 🚀 Você está voando alto.";
      else if (gh >= 20) texto = "Bom giro! ✅ Consistência é a chave.";
      else texto = "Dia desafiador. ⚠️ Tente mudar de região amanhã.";

      return NextResponse.json({
        insight: `${texto}\n\nDica: Amanhã foque nos horários de pico (07h-09h e 17h-19h).`
      });
    }

    // Cenário C: Padrão
    return NextResponse.json({
      insight: "Continue registrando seus dados para receber dicas cada vez melhores! 🚀"
    });

  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { insight: `Erro técnico: ${error.message || 'Tente novamente.'}` },
      { status: 500 }
    );
  }
}
