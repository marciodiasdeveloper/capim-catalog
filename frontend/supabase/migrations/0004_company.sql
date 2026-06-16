-- Configurações da empresa (singleton) + bucket do logo.
-- Rode no SQL editor do Supabase ou via `supabase db push`.

create table if not exists public.company_settings (
  id             text primary key default 'default',
  name           text not null,
  tagline        text not null default '',
  whatsapp       text not null default '',
  atendente      text not null default '',
  pix_titular    text not null default '',
  pix_chave_tipo text not null default '',
  pix_chave      text not null default '',
  pix_banco      text not null default '',
  logo_url       text,
  updated_at     timestamptz not null default now(),
  constraint company_settings_singleton check (id = 'default')
);

-- updated_at automático (reusa a função criada em 0001_catalog.sql)
drop trigger if exists company_settings_set_updated_at on public.company_settings;
create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

-- Row Level Security: leitura pública (nome, logo, PIX e WhatsApp são exibidos
-- ao cliente no site). Sem policy de escrita — toda escrita acontece em Server
-- Action com a service_role key (que ignora RLS), após checagem de admin.
alter table public.company_settings enable row level security;

create policy "Public read company_settings"
  on public.company_settings for select using (true);

-- Bucket público do logo. Leitura pela URL pública (sem policy); o upload
-- acontece em Server Action com a service_role key (ignora RLS).
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;
