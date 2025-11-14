import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Registro {
  id?: number;
  data: string;
  plataforma: string;
  horas: number;
  km: number;
  ganho_bruto: number;
  custo_km: number;
  lucro: number;
  created_at?: string;
}

export interface Usuario {
  id?: number;
  tipo_veiculo: string;
  consumo: number;
  cidade: string;
  plataforma: string;
  turno: string;
  created_at?: string;
}
