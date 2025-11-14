import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Função auxiliar para buscar clima
async function getClima(cidade: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || !cidade) return null;

  try {
    // 1. Busca coordenadas da cidade (Geocoding)
    // Adicionamos ",BR" para garantir que busque cidades no Brasil
    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cidade},BR&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) return null;

    const { lat, lon } = geoData[0];

    // 2. Busca o clima atual
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    const clima = weatherData.weather[0];
    const temp = Math.round(weatherData.main.temp);
    
    // Identifica se é chuva para alerta de dinâmica
    const ehChuva = clima.main === 'Rain' || clima.main === 'Drizzle' || clima.main === 'Thunderstorm';

    return {
      resumo: `${clima.description}, ${temp}°C`,
      ehChuva,
      temp
    };
  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, dados, resultado, cidade, turno, plataforma } = body;

    // --- 1. Busca Contexto de Clima (Se tiver cidade) ---
    let contextoClima = "";
    // Se a cidade não vier no corpo, tentamos uma cidade padrão ou ignoramos
    // (No frontend, você precisará enviar a cidade escolhida ou detectada)
    const cidadeAlvo = cidade || "São Paulo"; 

    const dadosClima = await getClima(cidadeAlvo);

    if (dadosClima) {
      contextoClima = `
      CONTEXTO EM TEMPO REAL:
      - Cidade: ${cidadeAlvo}
      - Clima Agora: ${dadosClima.resumo}
      ${dadosClima.ehChuva ? "⚠️ ALERTA: Está chovendo! Avise que a demanda e a tarifa dinâmica devem subir. Recomende cautela no trânsito." : "Clima estável."}
      `;
    }

    // --- 2. Monta o Prompt Final ---
    const sistemaPrompt = `Você é um coach financeiro experiente para motoristas de aplicativo no Brasil (Uber/99).
    Seus conselhos devem ser curtos, diretos e motivadores.
    Use emojis.
    ${contextoClima}`;

    // --- 3. Chama a OpenAI (Se tiver chave) ---
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sistemaPrompt },
          { role: "user", content: prompt || "Analise meu dia e me dê uma dica." }
        ],
        max_tokens: 400,
      });

      return NextResponse.json({ insight: completion.choices[0].message.content });
    }

    // --- 4. MOCK (Fallback se não tiver OpenAI Key) ---
    // Simula uma resposta inteligente baseada no clima (se tiver pego)
    if (dadosClima && dadosClima.ehChuva) {
      return NextResponse.json({
        insight: `🌧️ Atenção Motorista!
        
Está chovendo agora em ${cidadeAlvo} (${dadosClima.resumo}). 
A tarifa dinâmica tende a disparar! É um ótimo momento para rodar, mas redobre a atenção no trânsito.

Dica: Fique próximo a shoppings e áreas empresariais.`
      });
    }

    // Fallback padrão
    return NextResponse.json({
      insight: "🚀 Mantenha a constância! Seus números estão bons, mas lembre-se de monitorar o consumo do carro para lucrar mais."
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { insight: 'Não foi possível gerar o insight agora. Tente novamente.' },
      { status: 500 }
    );
  }
}
