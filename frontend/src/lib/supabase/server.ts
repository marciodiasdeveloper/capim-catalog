import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "./config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export { isSupabaseConfigured };

/**
 * Cliente de leitura pública (chave anon, sem sessão), para dados do catálogo.
 * As políticas de RLS liberam apenas SELECT para o público.
 */
export function createReadClient() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
