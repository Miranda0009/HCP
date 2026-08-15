-- HCP: estrutura inicial de usuários e perfis.
-- Projeto Supabase: euxpmahouesimyyffcio

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  company_name text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is 'Dados públicos internos do perfil de cada usuário HCP.';

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Usuários visualizam o próprio perfil" on public.profiles;
create policy "Usuários visualizam o próprio perfil"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Usuários criam o próprio perfil" on public.profiles;
create policy "Usuários criam o próprio perfil"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Usuários atualizam o próprio perfil" on public.profiles;
create policy "Usuários atualizam o próprio perfil"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function private.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function private.set_profile_updated_at() from public, anon, authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure private.set_profile_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

-- Garante perfil para usuários que possam ter sido criados antes desta estrutura.
insert into public.profiles (id, full_name)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name')
from auth.users as users
on conflict (id) do nothing;

-- Fotos de perfil públicas; escrita restrita à pasta do próprio usuário.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Usuários visualizam o próprio avatar" on storage.objects;
create policy "Usuários visualizam o próprio avatar"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Usuários enviam o próprio avatar" on storage.objects;
create policy "Usuários enviam o próprio avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Usuários substituem o próprio avatar" on storage.objects;
create policy "Usuários substituem o próprio avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Usuários removem o próprio avatar" on storage.objects;
create policy "Usuários removem o próprio avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- HCP: contribuições de qualidade das fontes de leads.

create table if not exists public.lead_source_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  api_source text not null,
  source_list text not null,
  niche text not null,
  contact_phone text not null,
  user_count smallint,
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

-- HCP: perfil de cliente foco usado para orientar futuras listas de leads.

create table if not exists public.client_focus_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  target_niche text not null,
  company_size text not null,
  opportunity_signal text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint client_focus_profiles_target_niche_valid check (length(btrim(target_niche)) between 2 and 120),
  constraint client_focus_profiles_company_size_valid check (company_size in ('micro', 'small', 'medium', 'large', 'any')),
  constraint client_focus_profiles_opportunity_signal_valid
    check (opportunity_signal in ('no_site', 'low_ratings', 'growth', 'recently_opened', 'commercial_structure', 'any'))
);

comment on table public.client_focus_profiles is
  'Preferências do cliente foco de cada usuário para orientar a criação de listas de leads.';

alter table public.client_focus_profiles enable row level security;

revoke all on public.client_focus_profiles from anon;
grant select, insert, update on public.client_focus_profiles to authenticated;

drop policy if exists "Usuários visualizam o próprio cliente foco" on public.client_focus_profiles;
create policy "Usuários visualizam o próprio cliente foco"
  on public.client_focus_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Usuários criam o próprio cliente foco" on public.client_focus_profiles;
create policy "Usuários criam o próprio cliente foco"
  on public.client_focus_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuários atualizam o próprio cliente foco" on public.client_focus_profiles;
create policy "Usuários atualizam o próprio cliente foco"
  on public.client_focus_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Estrutura aditiva de contas, limites mensais e razão de tokens.
-- A mesma definição é mantida na migration versionada correspondente.
-- HCP: contas empresariais, limite mensal de feedbacks e razão de tokens.
-- Migração aditiva: preserva profiles, feedbacks e tokens históricos.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null,
  phone text,
  company_niche text,
  expected_user_count smallint,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint accounts_company_name_valid check (length(btrim(company_name)) between 2 and 160),
  constraint accounts_phone_valid check (phone is null or length(btrim(phone)) between 8 and 24),
  constraint accounts_company_niche_valid check (company_niche is null or length(btrim(company_niche)) between 2 and 120),
  constraint accounts_expected_user_count_valid check (expected_user_count is null or expected_user_count between 1 and 10000)
);

comment on table public.accounts is
  'Conta empresarial do HCP. Os campos iniciais permanecem opcionais durante a transição do cadastro.';

create table if not exists public.account_memberships (
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (account_id, user_id),
  constraint account_memberships_role_valid check (role in ('owner', 'admin', 'member'))
);

comment on table public.account_memberships is
  'Vínculo entre usuários autenticados e contas empresariais do HCP.';

create index if not exists accounts_owner_user_idx
  on public.accounts (owner_user_id);

create index if not exists account_memberships_user_account_idx
  on public.account_memberships (user_id, account_id);

create or replace function private.set_account_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function private.set_account_updated_at() from public, anon, authenticated;

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
  before update on public.accounts
  for each row execute procedure private.set_account_updated_at();

-- Amplia o trigger existente sem usar metadados editáveis para autorização.
-- owner e membership sempre derivam de auth.users.id.
-- selected_plan e plan_builder_config permanecem em raw_user_meta_data nesta etapa;
-- nunca são usados como fonte de autorização ou de cobrança.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_full_name text;
  v_company_name text;
  v_phone text;
  v_company_niche text;
  v_expected_user_count smallint;
begin
  v_full_name := nullif(btrim(coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  v_company_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''),
    v_full_name,
    'Conta HCP'
  );
  v_phone := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');
  v_company_niche := nullif(btrim(new.raw_user_meta_data ->> 'company_niche'), '');

  if length(v_company_name) not between 2 and 160 then
    v_company_name := 'Conta HCP';
  end if;
  if v_phone is not null and length(v_phone) not between 8 and 24 then
    v_phone := null;
  end if;
  if v_company_niche is not null and length(v_company_niche) not between 2 and 120 then
    v_company_niche := null;
  end if;

  if coalesce(new.raw_user_meta_data ->> 'expected_user_count', '') ~ '^[0-9]{1,5}$'
    and (new.raw_user_meta_data ->> 'expected_user_count')::integer between 1 and 10000 then
    v_expected_user_count := (new.raw_user_meta_data ->> 'expected_user_count')::smallint;
  else
    v_expected_user_count := null;
  end if;

  insert into public.profiles (id, full_name, phone)
  values (new.id, v_full_name, v_phone)
  on conflict (id) do nothing;

  insert into public.accounts (
    id,
    owner_user_id,
    company_name,
    phone,
    company_niche,
    expected_user_count
  )
  values (
    new.id,
    new.id,
    v_company_name,
    v_phone,
    v_company_niche,
    v_expected_user_count
  )
  on conflict (id) do nothing;

  insert into public.account_memberships (account_id, user_id, role)
  values (new.id, new.id, 'owner')
  on conflict (account_id, user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Backfill determinístico: a primeira conta de cada usuário usa o UUID do Auth.
insert into public.accounts (
  id,
  owner_user_id,
  company_name,
  phone,
  company_niche,
  expected_user_count,
  created_at,
  updated_at
)
select
  users.id,
  users.id,
  case
    when length(candidates.company_name) between 2 and 160 then candidates.company_name
    else 'Conta HCP'
  end,
  case
    when length(candidates.phone) between 8 and 24 then candidates.phone
    else null
  end,
  case
    when length(candidates.company_niche) between 2 and 120 then candidates.company_niche
    else null
  end,
  case
    when coalesce(users.raw_user_meta_data ->> 'expected_user_count', '') ~ '^[0-9]{1,5}$'
      and (users.raw_user_meta_data ->> 'expected_user_count')::integer between 1 and 10000
      then (users.raw_user_meta_data ->> 'expected_user_count')::smallint
    else null
  end,
  coalesce(profiles.created_at, users.created_at, timezone('utc', now())),
  coalesce(profiles.updated_at, users.updated_at, users.created_at, timezone('utc', now()))
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
cross join lateral (
  select
    coalesce(
      nullif(btrim(profiles.company_name), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'company_name'), ''),
      nullif(btrim(profiles.full_name), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
      'Conta HCP'
    ) as company_name,
    coalesce(
      nullif(btrim(profiles.phone), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'phone'), '')
    ) as phone,
    nullif(btrim(users.raw_user_meta_data ->> 'company_niche'), '') as company_niche
) as candidates
on conflict (id) do nothing;

insert into public.account_memberships (account_id, user_id, role, created_at)
select
  users.id,
  users.id,
  'owner',
  coalesce(users.created_at, timezone('utc', now()))
from auth.users as users
join public.accounts as accounts on accounts.id = users.id
on conflict (account_id, user_id) do nothing;

create or replace function private.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_memberships as memberships
    where memberships.account_id = target_account_id
      and memberships.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_account_member(uuid) from public, anon, authenticated, service_role;
grant execute on function private.is_account_member(uuid) to authenticated;

alter table public.accounts enable row level security;
alter table public.account_memberships enable row level security;

revoke all on table public.accounts from public, anon, authenticated;
grant select on table public.accounts to authenticated;
grant update (company_name, phone, company_niche, expected_user_count, timezone)
  on table public.accounts to authenticated;

revoke all on table public.account_memberships from public, anon, authenticated;
grant select on table public.account_memberships to authenticated;

drop policy if exists "Membros visualizam a própria conta" on public.accounts;
create policy "Membros visualizam a própria conta"
  on public.accounts
  for select
  to authenticated
  using ((select private.is_account_member(id)));

drop policy if exists "Proprietários atualizam a própria conta" on public.accounts;
create policy "Proprietários atualizam a própria conta"
  on public.accounts
  for update
  to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Membros visualizam os vínculos da conta" on public.account_memberships;
create policy "Membros visualizam os vínculos da conta"
  on public.account_memberships
  for select
  to authenticated
  using ((select private.is_account_member(account_id)));

-- Acrescenta contexto empresarial e confirmação aos feedbacks existentes.
alter table if exists public.lead_source_feedback
  add column if not exists account_id uuid references public.accounts (id) on delete cascade,
  add column if not exists submitted_by uuid references auth.users (id) on delete cascade,
  add column if not exists exchange_date date,
  add column if not exists confirmed_at timestamptz;

update public.lead_source_feedback as feedback
set
  account_id = coalesce(feedback.account_id, feedback.user_id),
  submitted_by = coalesce(feedback.submitted_by, feedback.user_id),
  exchange_date = coalesce(
    feedback.exchange_date,
    (timezone('America/Sao_Paulo', feedback.created_at))::date
  ),
  confirmed_at = coalesce(feedback.confirmed_at, feedback.created_at);

alter table if exists public.lead_source_feedback
  alter column account_id set not null,
  alter column submitted_by set not null,
  alter column exchange_date set not null,
  alter column confirmed_at set not null;

create index if not exists lead_source_feedback_account_created_idx
  on public.lead_source_feedback (account_id, created_at desc);

create index if not exists lead_source_feedback_submitted_by_idx
  on public.lead_source_feedback (submitted_by);

create table if not exists public.monthly_exchange_usage (
  account_id uuid not null references public.accounts (id) on delete cascade,
  cycle_start date not null,
  used_count smallint not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (account_id, cycle_start),
  constraint monthly_exchange_usage_count_valid check (used_count between 0 and 3),
  constraint monthly_exchange_usage_cycle_valid check (cycle_start = date_trunc('month', cycle_start::timestamp)::date)
);

comment on table public.monthly_exchange_usage is
  'Contador transacional de até três trocas por conta e mês-calendário em America/Sao_Paulo.';

create table if not exists public.token_ledger (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount smallint not null,
  transaction_type text not null,
  source_feedback_id uuid references public.lead_source_feedback (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint token_ledger_amount_nonzero check (amount <> 0),
  constraint token_ledger_transaction_type_valid check (transaction_type in ('feedback_reward', 'lead_list_debit', 'manual_adjustment')),
  constraint token_ledger_feedback_reward_valid check (
    transaction_type <> 'feedback_reward'
    or (amount = 25 and source_feedback_id is not null)
  ),
  constraint token_ledger_feedback_source_unique unique (source_feedback_id)
);

comment on table public.token_ledger is
  'Razão imutável de créditos e débitos de tokens de cada conta HCP.';

create index if not exists token_ledger_account_created_idx
  on public.token_ledger (account_id, created_at desc);

create index if not exists token_ledger_user_idx
  on public.token_ledger (user_id);

-- Preserva os tokens e o uso mensal já registrados antes desta migração.
insert into public.monthly_exchange_usage (account_id, cycle_start, used_count, updated_at)
select
  feedback.account_id,
  date_trunc('month', feedback.exchange_date::timestamp)::date,
  least(count(*), 3)::smallint,
  max(feedback.created_at)
from public.lead_source_feedback as feedback
group by feedback.account_id, date_trunc('month', feedback.exchange_date::timestamp)::date
on conflict (account_id, cycle_start) do update
set
  used_count = greatest(public.monthly_exchange_usage.used_count, excluded.used_count),
  updated_at = greatest(public.monthly_exchange_usage.updated_at, excluded.updated_at);

insert into public.token_ledger (
  account_id,
  user_id,
  amount,
  transaction_type,
  source_feedback_id,
  created_at
)
select
  feedback.account_id,
  feedback.submitted_by,
  feedback.tokens_awarded,
  'feedback_reward',
  feedback.id,
  feedback.created_at
from public.lead_source_feedback as feedback
on conflict (source_feedback_id) do nothing;

alter table public.monthly_exchange_usage enable row level security;
alter table public.token_ledger enable row level security;

revoke all on table public.monthly_exchange_usage from public, anon, authenticated;
grant select on table public.monthly_exchange_usage to authenticated;

revoke all on table public.token_ledger from public, anon, authenticated;
grant select on table public.token_ledger to authenticated;

-- Leitura agregada do saldo evita somar um razão paginado no navegador.
create or replace function public.hcp_get_token_balance()
returns table (
  account_id uuid,
  token_balance bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  select memberships.account_id
    into v_account_id
  from public.account_memberships as memberships
  where memberships.user_id = v_user_id
  order by
    case memberships.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    memberships.created_at,
    memberships.account_id
  limit 1;

  if v_account_id is null then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  account_id := v_account_id;
  select coalesce(sum(ledger.amount), 0)::bigint
    into token_balance
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id;
  return next;
end;
$$;

comment on function public.hcp_get_token_balance() is
  'Retorna o saldo agregado da conta HCP prioritária do usuário autenticado sem paginação do razão.';

revoke all on function public.hcp_get_token_balance()
  from public, anon, authenticated, service_role;
grant execute on function public.hcp_get_token_balance()
  to authenticated;

drop policy if exists "Membros visualizam o uso mensal da conta" on public.monthly_exchange_usage;
create policy "Membros visualizam o uso mensal da conta"
  on public.monthly_exchange_usage
  for select
  to authenticated
  using ((select private.is_account_member(account_id)));

drop policy if exists "Membros visualizam os tokens da conta" on public.token_ledger;
create policy "Membros visualizam os tokens da conta"
  on public.token_ledger
  for select
  to authenticated
  using ((select private.is_account_member(account_id)));

-- Trigger obrigatório também protege versões antigas do site/APK que ainda usam INSERT.
create or replace function private.prepare_feedback_exchange()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
  v_cycle_start date;
  v_used_count smallint;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  if new.account_id is not null then
    select memberships.account_id
      into v_account_id
    from public.account_memberships as memberships
    where memberships.account_id = new.account_id
      and memberships.user_id = v_user_id
    limit 1;
  else
    select memberships.account_id
      into v_account_id
    from public.account_memberships as memberships
    where memberships.user_id = v_user_id
    order by
      case memberships.role when 'owner' then 0 when 'admin' then 1 else 2 end,
      memberships.created_at,
      memberships.account_id
    limit 1;
  end if;

  if v_account_id is null then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  new.account_id := v_account_id;
  new.user_id := v_user_id;
  new.submitted_by := v_user_id;
  new.tokens_awarded := 25;
  new.created_at := timezone('utc', now());
  new.exchange_date := (timezone('America/Sao_Paulo', now()))::date;
  -- O envio de um cliente legado equivale à confirmação da operação.
  new.confirmed_at := coalesce(new.confirmed_at, timezone('utc', now()));
  v_cycle_start := date_trunc('month', new.exchange_date::timestamp)::date;

  v_used_count := null;
  insert into public.monthly_exchange_usage (account_id, cycle_start, used_count, updated_at)
  values (v_account_id, v_cycle_start, 1, timezone('utc', now()))
  on conflict (account_id, cycle_start) do update
  set
    used_count = public.monthly_exchange_usage.used_count + 1,
    updated_at = timezone('utc', now())
  where public.monthly_exchange_usage.used_count < 3
  returning used_count into v_used_count;

  if v_used_count is null then
    raise exception using errcode = 'P0001', message = 'monthly_exchange_limit_reached';
  end if;

  return new;
end;
$$;

revoke all on function private.prepare_feedback_exchange() from public, anon, authenticated, service_role;

drop trigger if exists prepare_lead_feedback_exchange on public.lead_source_feedback;
create trigger prepare_lead_feedback_exchange
  before insert on public.lead_source_feedback
  for each row execute procedure private.prepare_feedback_exchange();

create or replace function private.award_feedback_tokens()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.token_ledger (
    account_id,
    user_id,
    amount,
    transaction_type,
    source_feedback_id,
    created_at
  )
  values (
    new.account_id,
    new.submitted_by,
    25,
    'feedback_reward',
    new.id,
    new.created_at
  )
  on conflict (source_feedback_id) do nothing;

  return new;
end;
$$;

revoke all on function private.award_feedback_tokens() from public, anon, authenticated, service_role;

drop trigger if exists award_lead_feedback_tokens on public.lead_source_feedback;
create trigger award_lead_feedback_tokens
  after insert on public.lead_source_feedback
  for each row execute procedure private.award_feedback_tokens();

-- As políticas continuam permitindo INSERT legado, agora obrigatoriamente protegido
-- pelo trigger transacional acima. O cliente novo usa exclusivamente a RPC.
revoke all on table public.lead_source_feedback from public, anon, authenticated;
grant select, insert on table public.lead_source_feedback to authenticated;

drop policy if exists "Usuários visualizam as próprias contribuições" on public.lead_source_feedback;
create policy "Usuários visualizam as próprias contribuições"
  on public.lead_source_feedback
  for select
  to authenticated
  using ((select private.is_account_member(account_id)));

drop policy if exists "Usuários criam as próprias contribuições" on public.lead_source_feedback;
create policy "Usuários criam as próprias contribuições"
  on public.lead_source_feedback
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select auth.uid()) = submitted_by
    and (select private.is_account_member(account_id))
    and tokens_awarded = 25
    and confirmed_at is not null
  );

create or replace function public.hcp_submit_lead_feedback(
  p_api_source text,
  p_source_list text,
  p_niche text,
  p_contact_phone text,
  p_cnpj text,
  p_company_name text,
  p_usefulness_score smallint,
  p_notes text,
  p_confirmed boolean
)
returns table (
  feedback_id uuid,
  tokens_awarded smallint,
  exchanges_used smallint,
  exchanges_remaining smallint,
  next_renewal date,
  token_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
  v_cycle_start date := date_trunc(
    'month',
    timezone('America/Sao_Paulo', now())
  )::date;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  if p_confirmed is distinct from true then
    raise exception using errcode = 'P0001', message = 'feedback_confirmation_required';
  end if;

  select memberships.account_id
    into v_account_id
  from public.account_memberships as memberships
  where memberships.user_id = v_user_id
  order by
    case memberships.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    memberships.created_at,
    memberships.account_id
  limit 1;

  if v_account_id is null then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  insert into public.lead_source_feedback as feedback (
    user_id,
    account_id,
    submitted_by,
    api_source,
    source_list,
    niche,
    contact_phone,
    cnpj,
    company_name,
    usefulness_score,
    notes,
    confirmed_at
  )
  values (
    v_user_id,
    v_account_id,
    v_user_id,
    p_api_source,
    p_source_list,
    p_niche,
    p_contact_phone,
    nullif(btrim(p_cnpj), ''),
    nullif(btrim(p_company_name), ''),
    p_usefulness_score,
    nullif(btrim(p_notes), ''),
    timezone('utc', now())
  )
  returning
    feedback.id,
    feedback.tokens_awarded
  into feedback_id, tokens_awarded;

  select usage.used_count
    into exchanges_used
  from public.monthly_exchange_usage as usage
  where usage.account_id = v_account_id
    and usage.cycle_start = v_cycle_start;

  exchanges_used := coalesce(exchanges_used, 0);
  exchanges_remaining := greatest(0, 3 - exchanges_used)::smallint;
  next_renewal := (v_cycle_start + interval '1 month')::date;

  select coalesce(sum(ledger.amount), 0)::bigint
    into token_balance
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id;

  return next;
end;
$$;

comment on function public.hcp_submit_lead_feedback(
  text, text, text, text, text, text, smallint, text, boolean
) is
  'Registra um feedback confirmado, aplica o limite mensal da conta e concede 25 tokens atomicamente.';

revoke all on function public.hcp_submit_lead_feedback(
  text, text, text, text, text, text, smallint, text, boolean
) from public, anon, authenticated;

grant execute on function public.hcp_submit_lead_feedback(
  text, text, text, text, text, text, smallint, text, boolean
) to authenticated;

-- HCP: saldo inicial idempotente e consumo transacional de créditos de leads.
-- Migração aditiva: preserva todo o histórico existente do token_ledger.

alter table public.token_ledger
  add column if not exists reference_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'token_ledger_reference_key_valid'
      and conrelid = 'public.token_ledger'::regclass
  ) then
    alter table public.token_ledger
      add constraint token_ledger_reference_key_valid
      check (
        reference_key is null
        or (
          reference_key = btrim(reference_key)
          and length(reference_key) between 3 and 120
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'token_ledger_account_reference_key_unique'
      and conrelid = 'public.token_ledger'::regclass
  ) then
    alter table public.token_ledger
      add constraint token_ledger_account_reference_key_unique
      unique (account_id, reference_key);
  end if;
end;
$$;

comment on column public.token_ledger.reference_key is
  'Chave idempotente única por conta para créditos e débitos originados por uma operação externa.';

create or replace function private.grant_initial_account_credits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.token_ledger (
    account_id,
    user_id,
    amount,
    transaction_type,
    reference_key,
    created_at
  )
  values (
    new.id,
    new.owner_user_id,
    1000,
    'manual_adjustment',
    'initial_balance_v1',
    timezone('utc', now())
  )
  on conflict on constraint token_ledger_account_reference_key_unique do nothing;

  return new;
end;
$$;

revoke all on function private.grant_initial_account_credits()
  from public, anon, authenticated, service_role;

drop trigger if exists grant_initial_account_credits on public.accounts;
create trigger grant_initial_account_credits
  after insert on public.accounts
  for each row execute procedure private.grant_initial_account_credits();

-- Contas já existentes recebem o mesmo lançamento, sem duplicar em reexecuções.
insert into public.token_ledger (
  account_id,
  user_id,
  amount,
  transaction_type,
  reference_key,
  created_at
)
select
  accounts.id,
  accounts.owner_user_id,
  1000,
  'manual_adjustment',
  'initial_balance_v1',
  timezone('utc', now())
from public.accounts as accounts
on conflict on constraint token_ledger_account_reference_key_unique do nothing;

create or replace function public.hcp_consume_lead_credits(
  p_request_id uuid,
  p_quantity smallint
)
returns table (
  debit_id bigint,
  credits_consumed smallint,
  token_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
  v_reference_key text;
  v_existing_id bigint;
  v_existing_amount smallint;
  v_existing_type text;
  v_balance bigint;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  if p_request_id is null then
    raise exception using errcode = 'P0001', message = 'lead_credit_request_required';
  end if;

  if p_quantity is null
    or p_quantity < 50
    or p_quantity > 300
    or mod(p_quantity, 50) <> 0 then
    raise exception using errcode = 'P0001', message = 'lead_credit_quantity_invalid';
  end if;

  select memberships.account_id
    into v_account_id
  from public.account_memberships as memberships
  where memberships.user_id = v_user_id
  order by
    case memberships.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    memberships.created_at,
    memberships.account_id
  limit 1;

  if v_account_id is null then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  -- Uma trava curta por conta serializa todos os débitos concorrentes.
  perform accounts.id
  from public.accounts as accounts
  where accounts.id = v_account_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  v_reference_key := 'lead_list_debit:' || p_request_id::text;

  select ledger.id, ledger.amount, ledger.transaction_type
    into v_existing_id, v_existing_amount, v_existing_type
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id
    and ledger.reference_key = v_reference_key;

  if found then
    if v_existing_type <> 'lead_list_debit'
      or v_existing_amount <> -p_quantity then
      raise exception using errcode = 'P0001', message = 'lead_credit_request_conflict';
    end if;

    select coalesce(sum(ledger.amount), 0)::bigint
      into v_balance
    from public.token_ledger as ledger
    where ledger.account_id = v_account_id;

    debit_id := v_existing_id;
    credits_consumed := p_quantity;
    token_balance := v_balance;
    return next;
    return;
  end if;

  select coalesce(sum(ledger.amount), 0)::bigint
    into v_balance
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id;

  if v_balance < p_quantity then
    raise exception using errcode = 'P0001', message = 'insufficient_lead_credits';
  end if;

  insert into public.token_ledger (
    account_id,
    user_id,
    amount,
    transaction_type,
    reference_key,
    created_at
  )
  values (
    v_account_id,
    v_user_id,
    -p_quantity,
    'lead_list_debit',
    v_reference_key,
    timezone('utc', now())
  )
  returning id into v_existing_id;

  debit_id := v_existing_id;
  credits_consumed := p_quantity;
  token_balance := v_balance - p_quantity;
  return next;
end;
$$;

comment on function public.hcp_consume_lead_credits(uuid, smallint) is
  'Consome de 50 a 300 créditos de uma conta autenticada, com serialização e idempotência por request_id.';

revoke all on function public.hcp_consume_lead_credits(uuid, smallint)
  from public, anon, authenticated, service_role;
grant execute on function public.hcp_consume_lead_credits(uuid, smallint)
  to authenticated;

-- O navegador consulta o razão, mas nunca grava créditos ou débitos diretamente.
alter table public.token_ledger enable row level security;
revoke all on table public.token_ledger from public, anon, authenticated;
grant select on table public.token_ledger to authenticated;
