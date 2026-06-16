/**
 * Checagem de configuração do Supabase, segura para usar no cliente e no
 * servidor (lê apenas variáveis NEXT_PUBLIC, que são embutidas no bundle).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
