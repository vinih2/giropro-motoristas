import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cidade = searchParams.get('cidade');
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!cidade || !apiKey) {
    return NextResponse.json({ error: 'Configuração incompleta' }, { status: 400 });
  }

  try {
    // 1. Geocoding (Descobrir lat/lon da cidade)
    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cidade},BR&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      return NextResponse.json({ error: 'Cidade não encontrada' }, { status: 404 });
    }

    const { lat, lon } = geoData[0];

    // 2. Clima Atual
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      temp: Math.round(weatherData.main.temp),
      descricao: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      principal: weatherData.weather[0].main // Rain, Clear, Clouds...
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clima' }, { status: 500 });
  }
}
