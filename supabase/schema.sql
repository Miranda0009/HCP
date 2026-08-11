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
