-- HCP: contribuições de qualidade das fontes de leads e verificação segura de e-mail.

create table if not exists public.lead_source_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  api_source text not null,
  source_list text not null,
  niche text not null,
  contact_phone text not null,
  user_count smallint not null,
  cnpj text,
  company_name text,
  usefulness_score smallint not null,
  notes text,
  tokens_awarded smallint not null default 25,
  created_at timestamptz not null default timezone('utc', now()),
  constraint lead_source_feedback_api_source_not_blank check (length(btrim(api_source)) between 2 and 80),
  constraint lead_source_feedback_source_list_not_blank check (length(btrim(source_list)) between 2 and 120),
  constraint lead_source_feedback_niche_not_blank check (length(btrim(niche)) between 2 and 120),
  constraint lead_source_feedback_phone_not_blank check (length(btrim(contact_phone)) between 8 and 24),
  constraint lead_source_feedback_user_count_valid check (user_count between 1 and 10000),
  constraint lead_source_feedback_cnpj_valid check (cnpj is null or cnpj ~ '^[0-9]{14}$'),
  constraint lead_source_feedback_usefulness_valid check (usefulness_score between 1 and 5),
  constraint lead_source_feedback_tokens_fixed check (tokens_awarded = 25)
);

comment on table public.lead_source_feedback is
  'Avaliações dos clientes sobre listas e APIs de leads; cada contribuição válida concede 25 tokens.';

alter table public.lead_source_feedback enable row level security;

revoke all on public.lead_source_feedback from anon;
grant select, insert on public.lead_source_feedback to authenticated;

drop policy if exists "Usuários visualizam as próprias contribuições" on public.lead_source_feedback;
create policy "Usuários visualizam as próprias contribuições"
  on public.lead_source_feedback
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Usuários criam as próprias contribuições" on public.lead_source_feedback;
create policy "Usuários criam as próprias contribuições"
  on public.lead_source_feedback
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and tokens_awarded = 25
  );

create index if not exists lead_source_feedback_user_created_idx
  on public.lead_source_feedback (user_id, created_at desc);

create index if not exists lead_source_feedback_source_quality_idx
  on public.lead_source_feedback (api_source, usefulness_score);

create or replace function public.hcp_email_exists(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as users
    where lower(users.email) = lower(btrim(candidate_email))
  );
$$;

comment on function public.hcp_email_exists(text) is
  'Consulta interna usada exclusivamente pela Edge Function de disponibilidade de e-mail.';

revoke all on function public.hcp_email_exists(text) from public, anon, authenticated;
grant execute on function public.hcp_email_exists(text) to service_role;

