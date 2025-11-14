'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Centraliza o mapa na cidade escolhida
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

// Coordenadas das principais cidades
const COORDENADAS: Record<string, [number, number]> = {
  'São Paulo': [-23.5505, -46.6333],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Belo Horizonte': [-19.9167, -43.9345],
  'Brasília': [-15.7801, -47.9292],
  'Salvador': [-12.9777, -38.5016],
  'Fortaleza': [-3.7172, -38.5433],
  'Curitiba': [-25.4284, -49.2733],
  'Manaus': [-3.1190, -60.0217],
  'Recife': [-8.0543, -34.8813],
  'Porto Alegre': [-30.0346, -51.2177],
  'Goiânia': [-16.6869, -49.2648],
  'Belém': [-1.4558, -48.4902],
  'Guarulhos': [-23.4542, -46.5337],
  'Campinas': [-22.9099, -47.0626],
  'São Luís': [-2.5307, -44.3068],
  'São Gonçalo': [-22.8275, -43.0632],
  'Maceió': [-9.6662, -35.7351],
  'Duque de Caxias': [-22.7923, -43.3082],
  'Natal': [-5.7945, -35.2110],
  'Campo Grande': [-20.4697, -54.6201],
  'Teresina': [-5.0919, -42.8034],
  'João Pessoa': [-7.1195, -34.8450],
  'Florianópolis': [-27.5954, -48.5480],
  'Cuiabá': [-15.6014, -56.0979],
  'Aracaju': [-10.9472, -37.0731],
  'Vitória': [-20.3194, -40.3377],
};

interface MapWidgetProps {
  cidade: string;
}

export default function MapWidget({ cidade }: MapWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const center = COORDENADAS[cidade] || COORDENADAS['São Paulo'];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
        Carregando Mapa...
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 dark:border-gray-800 relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />

        {/* Simulação de Áreas de Demanda */}
        <Circle center={[center[0] + 0.01, center[1] - 0.01]} radius={1500} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.4 }} />
        <Circle center={[center[0] - 0.02, center[1] + 0.02]} radius={1000} pathOptions={{ color: 'transparent', fillColor: '#f97316', fillOpacity: 0.4 }} />
        <Circle center={[center[0] + 0.02, center[1] + 0.02]} radius={1200} pathOptions={{ color: 'transparent', fillColor: '#eab308', fillOpacity: 0.4 }} />
      </MapContainer>
      
      <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/80 px-3 py-1 rounded-lg text-xs font-bold shadow-md z-[400] text-gray-800 dark:text-white">
        🔥 Áreas de Demanda
      </div>
    </div>
  );
}
