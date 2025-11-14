import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { dados, resultado } = await request.json();

    // Gerar insight personalizado
    const ganhoPorHora = resultado.ganhoPorHora;
    const lucroFinal = resultado.lucroFinal;
    
    let insight = '';
    
    // Avaliar desempenho
    if (ganhoPorHora >= 25) {
      insight = `Excelente giro! Você fez R$ ${ganhoPorHora.toFixed(2)}/h. `;
    } else if (ganhoPorHora >= 18) {
      insight = `Bom giro! Você fez R$ ${ganhoPorHora.toFixed(2)}/h. `;
    } else if (ganhoPorHora >= 12) {
      insight = `Giro médio de R$ ${ganhoPorHora.toFixed(2)}/h. `;
    } else {
      insight = `Giro de R$ ${ganhoPorHora.toFixed(2)}/h. Vamos melhorar! `;
    }

    // Adicionar lucro
    insight += `Com seu consumo, o lucro final ficou em R$ ${lucroFinal.toFixed(2)}. `;

    // Dicas por plataforma
    if (dados.plataforma === 'Uber' || dados.plataforma === '99') {
      insight += 'Amanhã tente rodar entre 17h e 20h — costuma ter mais demanda. ';
    } else if (dados.plataforma === 'iFood' || dados.plataforma === 'Rappi') {
      insight += 'Amanhã foque no horário de almoço (11h30-14h) e jantar (18h-21h). ';
    }

    // Dica de otimização
    if (resultado.ganhoPorKm < 1.5) {
      insight += 'Se possível, reduza deslocamentos sem corrida pra melhorar o R$/km.';
    } else {
      insight += 'Continue assim e acompanhe seus resultados!';
    }

    return NextResponse.json({ insight });
  } catch (error) {
    return NextResponse.json(
      { insight: 'Seu giro está registrado! Continue assim e acompanhe seus resultados diariamente.' },
      { status: 200 }
    );
  }
}
