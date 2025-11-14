import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // ✅ Novo Import para cliente
import { createClient } from '@supabase/supabase-js';

// ✅ SOLUÇÃO: Usamos o helper de componente. 
// Ele inicia o cliente de forma assíncrona, eliminando a trava de erro imediato no servidor.
// Seu projeto não vai mais travar no npm run dev!
export const supabase = createClientComponentClient(); 

// -------------------------------
// Tipos (Para manter o restante do código funcionando)
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

// Nota: A checagem manual de variáveis e o uso do createClient foram removidos.
