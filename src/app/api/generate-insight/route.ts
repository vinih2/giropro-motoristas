import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. Função para buscar o Clima (OpenWeather)
async function getClima(cidade: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || !cidade) return null;

  try {
    // Busca latitude/longitude (Geocoding)
    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cidade},BR&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) return null;

    const { lat, lon } = geoData[0];

    // Busca clima atual
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    const clima = weatherData.weather[0];
    const temp = Math.round(weatherData.main.temp);
    
    // Detecta chuva para alertar sobre tarifa dinâmica
    const ehChuva = ['Rain', 'Drizzle', 'Thunderstorm'].includes(clima.main);

    return {
      resumo: `${clima.description}, ${temp}°C`,
      ehChuva,
      temp
    };
  } catch (error) {
    console.error("Erro clima:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, cidade } = body;

    // 2. Prepara o Contexto do Clima
    let contextoClima = "";
    const cidadeAlvo = cidade || "São Paulo"; // Padrão caso não venha do front

    const dadosClima = await getClima(cidadeAlvo);

    if (dadosClima) {
      contextoClima = `
      CONTEXTO TEMPO REAL (${cidadeAlvo}):
      - Clima: ${dadosClima.resumo}
      ${dadosClima.ehChuva ? "⚠️ ALERTA: Está chovendo! Avise que a demanda/dinâmica vai subir e peça cuidado." : "✅ Tempo firme."}
      `;
    }

    // 3. Define o Sistema da IA
    const sistemaPrompt = `Você é o "GiroPro Coach", um especialista financeiro para motoristas de aplicativo no Brasil.
    Seu tom é parceiro, motivador e direto (gírias leves permitidas).
    Use emojis.
    ${contextoClima}
    `;

    // 4. Conecta na GROQ (Substituindo OpenAI)
    if (process.env.GROQ_API_KEY) {
      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1", // Endpoint da Groq
      });

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Modelo rápido e inteligente da Meta
        messages: [
          { role: "system", content: sistemaPrompt },
          { role: "user", content: prompt || "Me dê uma dica rápida sobre meu desempenho hoje." }
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      return NextResponse.json({ insight: completion.choices[0].message.content });
    }

    // 5. Fallback (Se não tiver chave configurada)
    // Mostra dados de clima reais mesmo sem IA
    if (dadosClima && dadosClima.ehChuva) {
      return NextResponse.json({
        insight: `🌧️ Atenção em ${cidadeAlvo}!
        
Está chovendo agora (${dadosClima.resumo}). A tarifa dinâmica deve subir nas próximas horas. 
Se estiver seguro, vá para áreas de alta demanda (Shoppings/Escritórios).
        
(Configure sua chave Groq para ter insights completos)`
      });
    }

    return NextResponse.json({
      insight: "🚀 Giro registrado! Para análises personalizadas, configure a API da Groq no projeto."
    });

  } catch (error: any) {
    console.error("Erro API:", error);
    return NextResponse.json(
      { insight: "O sistema de insights está indisponível no momento. Tente mais tarde." },
      { status: 500 }
    );
  }
}
