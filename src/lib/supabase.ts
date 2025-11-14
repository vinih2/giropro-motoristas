import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Registro {
  id?: number;
  user_id: string;
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
  id: string;
  email: string;
  nome: string | null;
  foto: string | null;
  data_criacao: string;
}

// Helper para obter usuário atual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper para fazer logout
export async function signOut() {
  await supabase.auth.signOut();
}
