import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🚨 Verificação obrigatória – impede o erro supabaseUrl is required
if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// 🔥 Criação correta do client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------------------
// Tipos
// -------------------------------
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

// -------------------------------
// Helpers
// -------------------------------
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
