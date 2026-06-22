-- Chaves de configuração (feature flags) da loja, guardadas no singleton
-- company_settings. Rode no SQL editor do Supabase ou via `supabase db push`.

-- Gamificação (ranking + pontos): ativa por padrão. Quando false, o storefront
-- esconde o banner da home, os links "Ranking" do header/rodapé e redireciona /ranking.
alter table public.company_settings
  add column if not exists gamification_enabled boolean not null default true;
