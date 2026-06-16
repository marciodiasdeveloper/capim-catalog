import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente com service_role (ignora RLS). Uso EXCLUSIVO no servidor, após
 * checagem de admin. Nunca importar em componentes cliente.
 */
export function createAdminClient() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin não configurado: defina SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
