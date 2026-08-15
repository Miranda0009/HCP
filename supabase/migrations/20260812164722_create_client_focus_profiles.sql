create table if not exists public.client_focus_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  target_niche text not null,
  company_size text not null,
  opportunity_signal text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint client_focus_profiles_target_niche_valid
    check (length(btrim(target_niche)) between 2 and 120),
  constraint client_focus_profiles_company_size_valid
    check (company_size in ('micro', 'small', 'medium', 'large', 'any')),
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
