import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, dados, resultado, cidade, turno, plataforma } = body;

    // 1. MODO REAL: Se tiver chave da OpenAI configurada
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um coach financeiro experiente para motoristas de aplicativo no Brasil. Responda de forma direta, motivadora e prática." },
          { role: "user", content: prompt || "Gere um insight financeiro." }
        ],
        max_tokens: 500,
      });

      return NextResponse.json({ insight: completion.choices[0].message.content });
    }

    // 2. MODO MOCK (FALLBACK): Respostas inteligentes sem gastar dinheiro
    
    // CASO A: Página de Insights (Requer formato específico para o Regex do frontend funcionar)
    if (cidade) {
      return NextResponse.json({
        insight: `INSIGHT: O movimento em ${cidade} no turno da ${turno || 'tarde'} costuma ser médio para ${plataforma || 'motoristas'}. A demanda sobe em dias de chuva.
        
REC1: Centro Expandido e arredores de shoppings.
REC2: Próximo a estações de metrô/trem nos horários de pico.
REC3: Bairros residenciais de alta densidade no início da manhã.

DICA: Mantenha o app de passageiro aberto para ver onde estão os outros carros e se posicione onde há menos concorrência.

MOTIVACAO: Cada corrida bem planejada é um passo a mais para sua liberdade financeira. Bora pra cima!`
      });
    }

    // CASO B: Dashboard (Análise do dia)
    if (resultado && resultado.ganhoPorHora) {
      const gh = resultado.ganhoPorHora;
      let texto = '';
      if (gh >= 30) texto = "Giro sensacional! 🚀 Você está voando alto.";
      else if (gh >= 20) texto = "Bom giro! ✅ Consistência é a chave.";
      else texto = "Dia desafiador. ⚠️ Tente mudar de região amanhã.";

      return NextResponse.json({
        insight: `${texto}\n\nDica: Amanhã foque nos horários de pico (07h-09h e 17h-19h). Mantenha o foco!`
      });
    }

    // CASO C: Histórico/Desempenho
    return NextResponse.json({
      insight: "📊 Análise Semanal: Seus números mostram consistência.\n\nVocê manteve uma boa média de horas, mas o custo por KM subiu levemente. Tente evitar corridas longas de retorno vazio.\n\n💡 Dica da semana: Verifique a calibragem dos pneus para economizar combustível."
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { insight: 'Erro ao gerar insight. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
